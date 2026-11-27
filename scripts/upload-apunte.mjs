#!/usr/bin/env node
/**
 * CLI para listar carpetas, compilar apuntes LaTeX con Tectonic y subirlos
 * directamente a la base de datos Turso (y dev.db local) de Lema.
 *
 * Ejemplos de uso:
 *   node scripts/upload-apunte.mjs --list-folders
 *   node scripts/upload-apunte.mjs --list-projects --folder-id <id>
 *   node scripts/upload-apunte.mjs --create-folder "Subcarpeta" --parent-id <id>
 *   node scripts/upload-apunte.mjs --tex .tmp-apunte.tex --title "5. Índices y Transacciones" --description "Árboles B+, ACID y Niveles de Aislamiento" --folder-id <id> --cleanup
 *   node scripts/upload-apunte.mjs --doc-json .tmp-doc.json --title "Nota BlockNote" --folder-id <id> --cleanup
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@libsql/client';

const execFileAsync = promisify(execFile);

try {
  process.loadEnvFile?.();
} catch {
  // .env optional if environment variables are already set
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url.startsWith('file:') && !authToken) {
    throw new Error('Falta TURSO_AUTH_TOKEN en .env para conectar a Turso.');
  }
  return createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });
}

function getLocalClientIfPresent() {
  const localPath = path.resolve(process.cwd(), 'dev.db');
  const primaryUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '';
  if (!fs.existsSync(localPath) || primaryUrl.startsWith('file:')) {
    return null;
  }
  return createClient({ url: 'file:./dev.db' });
}

async function compileTexWithTectonic(texSource) {
  const tmpDir = path.join(os.tmpdir(), `lema-apunte-${crypto.randomBytes(6).toString('hex')}`);
  await fs.promises.mkdir(tmpDir, { recursive: true });
  const mainTexPath = path.join(tmpDir, 'main.tex');
  const mainPdfPath = path.join(tmpDir, 'main.pdf');
  const mainLogPath = path.join(tmpDir, 'main.log');

  const cleanSource = texSource.replace(/^\uFEFF/, '');
  await fs.promises.writeFile(mainTexPath, cleanSource, 'utf8');

  const tectonicCacheDir = path.join(os.tmpdir(), 'tectonic_cache');
  await fs.promises.mkdir(tectonicCacheDir, { recursive: true });

  const localBinary =
    process.platform === 'win32'
      ? path.join(process.cwd(), 'bin', 'tectonic.exe')
      : path.join(process.cwd(), 'bin', 'tectonic');

  const binary = fs.existsSync(localBinary) ? localBinary : 'tectonic';

  try {
    await execFileAsync(binary, ['--keep-logs', mainTexPath], {
      cwd: tmpDir,
      timeout: 90_000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        TECTONIC_CACHE_DIR: tectonicCacheDir,
        HOME: tmpDir,
      },
    });

    if (!fs.existsSync(mainPdfPath)) {
      throw new Error('Tectonic finalizó pero no produjo main.pdf');
    }

    const pdfBuffer = await fs.promises.readFile(mainPdfPath);
    return {
      ok: true,
      pdfBase64: pdfBuffer.toString('base64'),
      pdfBytesLength: pdfBuffer.length,
    };
  } catch (err) {
    let logExcerpt = '';
    if (fs.existsSync(mainLogPath)) {
      const logText = await fs.promises.readFile(mainLogPath, 'utf8');
      const lines = logText.split('\n');
      const relevant = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('!') || /error/i.test(lines[i])) {
          relevant.push(...lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 6)));
          relevant.push('---');
        }
      }
      logExcerpt = relevant.slice(0, 45).join('\n');
    }
    const stderr = err?.stderr || err?.stdout || err?.message || String(err);
    return {
      ok: false,
      error: `${stderr}${logExcerpt ? `\n\n--- Extracto de main.log ---\n${logExcerpt}` : ''}`,
    };
  } finally {
    await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function listFolders(client) {
  const res = await client.execute(`
    SELECT
      f.id,
      f.name,
      f.parentId,
      (SELECT COUNT(*) FROM Document d WHERE d.folderId = f.id) AS docCount,
      (SELECT COUNT(*) FROM LatexProject lp WHERE lp.folderId = f.id) AS latexCount
    FROM Folder f
    ORDER BY f.name ASC
  `);

  const byParent = new Map();
  for (const row of res.rows) {
    const key = row.parentId || 'ROOT';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(row);
  }

  function printTree(parentId = 'ROOT', depth = 0) {
    const children = byParent.get(parentId) || [];
    for (const f of children) {
      const indent = '  '.repeat(depth) + (depth > 0 ? '└─ ' : '📁 ');
      console.log(
        `${indent}${f.name}  [id: ${f.id}]  (${f.latexCount} LaTeX, ${f.docCount} Docs)`
      );
      printTree(f.id, depth + 1);
    }
  }

  console.log('=== Árbol de Materias y Subcarpetas en Turso ===');
  printTree('ROOT', 0);
}

async function listProjects(client, folderId) {
  const res = folderId
    ? await client.execute({
        sql: `SELECT id, title, description, folderId, compiledAt, updatedAt FROM LatexProject WHERE folderId = ? ORDER BY title ASC`,
        args: [folderId],
      })
    : await client.execute(
        `SELECT id, title, description, folderId, compiledAt, updatedAt FROM LatexProject ORDER BY updatedAt DESC LIMIT 30`
      );

  console.log(`=== Proyectos LaTeX (${res.rows.length}) ===`);
  for (const r of res.rows) {
    console.log(`- [${r.id}] "${r.title}" (folderId: ${r.folderId})`);
    if (r.description) console.log(`    Descripción: ${r.description}`);
  }
}

async function createFolder(clients, name, parentId = null) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  for (const c of clients) {
    await c.execute({
      sql: `INSERT INTO Folder (id, name, parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      args: [id, name.trim(), parentId || null, now, now],
    });
  }
  console.log(`✅ Carpeta creada: "${name.trim()}" [id: ${id}] (parentId: ${parentId || 'null'})`);
  return id;
}

async function upsertLatexApunte(clients, { texPath, title, description, folderId, projectId }) {
  const absTexPath = path.resolve(process.cwd(), texPath);
  if (!fs.existsSync(absTexPath)) {
    throw new Error(`No existe el archivo .tex: ${absTexPath}`);
  }
  const texSource = (await fs.promises.readFile(absTexPath, 'utf8')).replace(/^\uFEFF/, '');

  console.log(`🔧 Compilando "${title}" con Tectonic...`);
  const compiled = await compileTexWithTectonic(texSource);
  if (!compiled.ok) {
    console.error('❌ Error de compilación LaTeX. Corrige el archivo .tex antes de subir a Turso:\n');
    console.error(compiled.error);
    process.exit(1);
  }
  console.log(`✅ PDF compilado correctamente (${(compiled.pdfBytesLength / 1024).toFixed(1)} KB).`);

  const primary = clients[0];
  const now = new Date().toISOString();

  let targetProjectId = projectId || null;
  if (!targetProjectId && folderId) {
    const existing = await primary.execute({
      sql: `SELECT id FROM LatexProject WHERE title = ? AND folderId = ? LIMIT 1`,
      args: [title.trim(), folderId],
    });
    if (existing.rows.length > 0) {
      targetProjectId = existing.rows[0].id;
    }
  }

  const isUpdate = Boolean(targetProjectId);
  const finalProjectId = targetProjectId || crypto.randomUUID();
  const fileId = crypto.randomUUID();

  for (const c of clients) {
    if (isUpdate) {
      await c.execute({
        sql: `UPDATE LatexProject SET title = ?, description = ?, pdfBase64 = ?, compiledAt = ?, folderId = ?, updatedAt = ? WHERE id = ?`,
        args: [
          title.trim(),
          description ? description.trim() : null,
          compiled.pdfBase64,
          now,
          folderId || null,
          now,
          finalProjectId,
        ],
      });

      const fileRes = await c.execute({
        sql: `SELECT id FROM LatexFile WHERE projectId = ? AND filename = 'main.tex' LIMIT 1`,
        args: [finalProjectId],
      });

      if (fileRes.rows.length > 0) {
        await c.execute({
          sql: `UPDATE LatexFile SET content = ?, isMain = 1, updatedAt = ? WHERE id = ?`,
          args: [texSource, now, fileRes.rows[0].id],
        });
      } else {
        await c.execute({
          sql: `INSERT INTO LatexFile (id, projectId, filename, content, isBinary, isMain, createdAt, updatedAt) VALUES (?, ?, 'main.tex', ?, 0, 1, ?, ?)`,
          args: [fileId, finalProjectId, texSource, now, now],
        });
      }
    } else {
      await c.execute({
        sql: `INSERT INTO LatexProject (id, title, description, pdfBase64, compiledAt, folderId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          finalProjectId,
          title.trim(),
          description ? description.trim() : null,
          compiled.pdfBase64,
          now,
          folderId || null,
          now,
          now,
        ],
      });

      await c.execute({
        sql: `INSERT INTO LatexFile (id, projectId, filename, content, isBinary, isMain, createdAt, updatedAt) VALUES (?, ?, 'main.tex', ?, 0, 1, ?, ?)`,
        args: [fileId, finalProjectId, texSource, now, now],
      });
    }
  }

  console.log(
    `🚀 Apunte LaTeX ${isUpdate ? 'actualizado' : 'subido'} en Turso: "${title.trim()}"\n   ID: ${finalProjectId}\n   Ruta en Lema: /latex/${finalProjectId}`
  );
  return finalProjectId;
}

async function upsertBlockNoteDoc(clients, { jsonPath, title, folderId, docId }) {
  const absJsonPath = path.resolve(process.cwd(), jsonPath);
  if (!fs.existsSync(absJsonPath)) {
    throw new Error(`No existe el archivo JSON: ${absJsonPath}`);
  }
  const raw = await fs.promises.readFile(absJsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('El contenido de BlockNote debe ser un array JSON de bloques.');
  }
  const contentStr = JSON.stringify(parsed);
  const normalizedTitle = title.trim().toLowerCase();
  const now = new Date().toISOString();
  const finalId = docId || crypto.randomUUID();

  for (const c of clients) {
    if (docId) {
      await c.execute({
        sql: `UPDATE Document SET title = ?, normalizedTitle = ?, content = ?, folderId = ?, updatedAt = ? WHERE id = ?`,
        args: [title.trim(), normalizedTitle, contentStr, folderId || null, now, finalId],
      });
    } else {
      await c.execute({
        sql: `INSERT INTO Document (id, title, normalizedTitle, type, content, folderId, createdAt, updatedAt) VALUES (?, ?, ?, 'TEXT', ?, ?, ?, ?)`,
        args: [finalId, title.trim(), normalizedTitle, contentStr, folderId || null, now, now],
      });
    }
  }

  console.log(
    `🚀 Documento BlockNote ${docId ? 'actualizado' : 'creado'} en Turso: "${title.trim()}"\n   ID: ${finalId}\n   Ruta en Lema: /doc/${finalId}`
  );
}

async function main() {
  const args = parseArgs(process.argv);
  const primaryClient = getTursoClient();
  const localClient = getLocalClientIfPresent();
  const clients = localClient ? [primaryClient, localClient] : [primaryClient];

  if (args['list-folders']) {
    await listFolders(primaryClient);
    return;
  }

  if (args['list-projects']) {
    await listProjects(primaryClient, args['folder-id']);
    return;
  }

  if (args['create-folder']) {
    await createFolder(clients, String(args['create-folder']), args['parent-id'] || null);
    return;
  }

  if (args.tex) {
    if (!args.title) {
      throw new Error('Falta --title "Título del Apunte"');
    }
    await upsertLatexApunte(clients, {
      texPath: String(args.tex),
      title: String(args.title),
      description: args.description ? String(args.description) : null,
      folderId: args['folder-id'] ? String(args['folder-id']) : null,
      projectId: args['project-id'] ? String(args['project-id']) : null,
    });
    if (args.cleanup) {
      await fs.promises.unlink(path.resolve(process.cwd(), String(args.tex))).catch(() => {});
    }
    return;
  }

  if (args['doc-json']) {
    if (!args.title) {
      throw new Error('Falta --title "Título del Documento"');
    }
    await upsertBlockNoteDoc(clients, {
      jsonPath: String(args['doc-json']),
      title: String(args.title),
      folderId: args['folder-id'] ? String(args['folder-id']) : null,
      docId: args['doc-id'] ? String(args['doc-id']) : null,
    });
    if (args.cleanup) {
      await fs.promises.unlink(path.resolve(process.cwd(), String(args['doc-json']))).catch(() => {});
    }
    return;
  }

  console.log(`Uso de scripts/upload-apunte.mjs:
  --list-folders                                  Lista el árbol de carpetas en Turso
  --list-projects [--folder-id <id>]              Lista los proyectos LaTeX existentes
  --create-folder "Nombre" [--parent-id <id>]     Crea una materia o subcarpeta en Turso
  --tex <archivo.tex> --title "Título" [--description "Subtítulo"] [--folder-id <id>] [--project-id <id>] [--cleanup]
                                                  Compila con Tectonic y sube/actualiza el apunte en Turso
  --doc-json <archivo.json> --title "Título" [--folder-id <id>] [--doc-id <id>] [--cleanup]
                                                  Sube/actualiza un apunte BlockNote en Turso`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message || err);
  process.exit(1);
});
