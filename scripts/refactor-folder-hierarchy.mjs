import crypto from 'node:crypto';
import { createClient } from '@libsql/client';

try {
  process.loadEnvFile?.();
} catch {
  // .env optional if vars are already in environment
}

const useLocal = process.argv.includes('--local');
const url = useLocal
  ? process.env.DATABASE_URL || 'file:./dev.db'
  : process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = useLocal ? undefined : process.env.TURSO_AUTH_TOKEN;

if (!url.startsWith('file:') && !authToken) {
  console.error('Error: TURSO_AUTH_TOKEN es requerido cuando se usa una URL remota de Turso.');
  process.exit(1);
}

const client = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

const KNOWLEDGE_BRANCHES = [
  {
    parentName: 'Cálculo y Análisis',
    children: [
      'Cálculo Vectorial',
      'Cálculo: Series y Sucesiones',
      'Análisis Real',
      'Ecuaciones Diferenciales',
    ],
  },
  {
    parentName: 'Geometría y Trigonometría',
    children: ['Geometría Analítica', 'Trigonometría'],
  },
  {
    parentName: 'Ciencias de la Computación',
    children: ['Bases de Datos', 'Curso de Java Interactive'],
  },
];

async function printTree() {
  const res = await client.execute(`
    SELECT f.id, f.name, f.parentId,
      (SELECT COUNT(*) FROM Document d WHERE d.folderId = f.id) as docCount,
      (SELECT COUNT(*) FROM LatexProject l WHERE l.folderId = f.id) as latexCount
    FROM Folder f
    ORDER BY f.name ASC
  `);

  const byParent = new Map();
  const ids = new Set(res.rows.map((r) => r.id));
  for (const row of res.rows) {
    const pid = row.parentId && ids.has(row.parentId) ? row.parentId : null;
    const list = byParent.get(pid) ?? [];
    list.push(row);
    byParent.set(pid, list);
  }

  const walk = (pid, indent = '') => {
    const rows = byParent.get(pid) ?? [];
    for (const r of rows) {
      console.log(`${indent}- ${r.name} (docs: ${r.docCount}, latex: ${r.latexCount})`);
      walk(r.id, indent + '  ');
    }
  };

  console.log('\nÁrbol de carpetas resultante:');
  walk(null);
}

async function main() {
  const safeTarget = url.startsWith('file:') ? url : url.replace(/\/\/([^@]+@)?/, '//');
  console.log(`Refactorizando jerarquía de carpetas en ${safeTarget}...`);

  const beforeDocs = await client.execute('SELECT COUNT(*) as cnt FROM Document');
  const beforeLatex = await client.execute('SELECT COUNT(*) as cnt FROM LatexProject');

  const foldersRes = await client.execute('SELECT id, name, parentId FROM Folder');
  const byName = new Map(foldersRes.rows.map((r) => [r.name, r]));

  for (const branch of KNOWLEDGE_BRANCHES) {
    const matchingChildren = branch.children.filter((name) => byName.has(name));
    if (matchingChildren.length < 2) {
      console.log(`Omitiendo "${branch.parentName}" (solo ${matchingChildren.length} coincidencia(s)).`);
      continue;
    }

    let parentRow = byName.get(branch.parentName);
    if (!parentRow) {
      const parentId = crypto.randomUUID();
      const nowIso = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO "Folder" ("id", "name", "parentId", "createdAt", "updatedAt") VALUES (?, ?, NULL, ?, ?)`,
        args: [parentId, branch.parentName, nowIso, nowIso],
      });
      parentRow = { id: parentId, name: branch.parentName, parentId: null };
      byName.set(branch.parentName, parentRow);
      console.log(`+ Creada carpeta rama "${branch.parentName}" [${parentId}]`);
    } else {
      console.log(`= Carpeta rama "${branch.parentName}" ya existe [${parentRow.id}]`);
    }

    for (const childName of matchingChildren) {
      const childRow = byName.get(childName);
      if (childRow.parentId === null || childRow.parentId === undefined) {
        await client.execute({
          sql: `UPDATE "Folder" SET "parentId" = ?, "updatedAt" = ? WHERE "id" = ? AND "parentId" IS NULL`,
          args: [parentRow.id, new Date().toISOString(), childRow.id],
        });
        childRow.parentId = parentRow.id;
        console.log(`  ↳ "${childName}" movida dentro de "${branch.parentName}"`);
      } else {
        console.log(`  · "${childName}" ya tiene parentId=${childRow.parentId}, sin cambios.`);
      }
    }
  }

  const afterDocs = await client.execute('SELECT COUNT(*) as cnt FROM Document');
  const afterLatex = await client.execute('SELECT COUNT(*) as cnt FROM LatexProject');
  console.log(
    `\nIntegridad: Documentos ${beforeDocs.rows[0].cnt} -> ${afterDocs.rows[0].cnt}, Proyectos LaTeX ${beforeLatex.rows[0].cnt} -> ${afterLatex.rows[0].cnt}`
  );

  await printTree();
}

main().catch((err) => {
  console.error('Error en refactorización de carpetas:', err);
  process.exit(1);
});
