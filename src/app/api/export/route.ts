import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';

export const dynamic = 'force-dynamic';

// ─── BlockNote AST → Markdown Converter ───────────────────────────────────────
function inlineContentToMd(content: any[]): string {
  if (!Array.isArray(content)) return '';
  return content
    .map((item: any) => {
      if (!item || typeof item !== 'object') return '';
      if (item.type === 'text') {
        let text = item.text ?? '';
        if (item.styles?.bold) text = `**${text}**`;
        if (item.styles?.italic) text = `*${text}*`;
        if (item.styles?.code) text = `\`${text}\``;
        if (item.styles?.strike) text = `~~${text}~~`;
        return text;
      }
      if (item.type === 'wiki_link') {
        return `[[${item.props?.note ?? ''}]]`;
      }
      if (item.type === 'link') {
        const label = Array.isArray(item.content) ? inlineContentToMd(item.content) : item.href || '';
        return item.href ? `[${label}](${item.href})` : label;
      }
      return '';
    })
    .join('');
}

function blockToMd(block: any, depth = 0): string {
  const indent = '  '.repeat(depth);
  const content = inlineContentToMd(block.content ?? []);

  let selfMd = '';
  switch (block.type) {
    case 'heading':
      selfMd = `${indent}${'#'.repeat(block.props?.level ?? 1)} ${content}`;
      break;
    case 'paragraph':
      selfMd = content ? `${indent}${content}` : '';
      break;
    case 'bulletListItem':
      selfMd = `${indent}- ${content}`;
      break;
    case 'numberedListItem':
      selfMd = `${indent}1. ${content}`;
      break;
    case 'math_box': {
      const t = block.props?.type ?? 'definition';
      const title = block.props?.title ?? '';
      selfMd = `${indent}> **[${t.toUpperCase()}]** ${title}\n${indent}>\n${indent}> ${content}`;
      break;
    }
    case 'code':
    case 'codeBlock': {
      const lang = block.props?.language ?? '';
      const raw = Array.isArray(block.content)
        ? block.content.map((c: any) => c.text ?? '').join('')
        : content;
      selfMd = `\`\`\`${lang}\n${raw}\n\`\`\``;
      break;
    }
    case 'tikz_graph': {
      const raw = Array.isArray(block.content)
        ? block.content.map((c: any) => c.text ?? '').join('')
        : content;
      selfMd = `\`\`\`latex\n${raw}\n\`\`\``;
      break;
    }
    default:
      selfMd = content ? `${indent}${content}` : '';
      break;
  }

  const childrenMd = Array.isArray(block.children) && block.children.length > 0
    ? block.children.map((child: any) => blockToMd(child, depth + 1)).filter(Boolean)
    : [];

  if (childrenMd.length === 0) return selfMd;
  if (!selfMd) return childrenMd.join('\n');

  const isList = block.type === 'bulletListItem' || block.type === 'numberedListItem';
  return `${selfMd}${isList ? '\n' : '\n\n'}${childrenMd.join('\n')}`;
}

function blocksToMarkdown(title: string, blocksJson: string): string {
  let blocks: any[] = [];
  try {
    blocks = JSON.parse(blocksJson);
  } catch {
    return `# ${title}\n\n(No hay contenido)`;
  }
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return `# ${title}\n\n(Apunte vacío)`;
  }
  const lines = blocks.map((b) => blockToMd(b, 0)).filter(Boolean);
  return `# ${title}\n\n${lines.join('\n\n')}`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').trim() || 'sin_titulo';
}

function uniqueName(used: Set<string>, base: string, ext = ''): string {
  let candidate = `${base}${ext}`;
  let idx = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base} (${idx})${ext}`;
    idx++;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

function hasNonEmptyBlocks(blocksJson: string | null | undefined): boolean {
  if (!blocksJson) return false;
  try {
    const parsed = JSON.parse(blocksJson);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function exportDocumentToDir(
  dir: JSZip,
  usedNames: Set<string>,
  doc: { title: string; type: string; content: string; whiteboardData: string | null }
) {
  const safeTitle = sanitizeFilename(doc.title);

  if (doc.type === 'WHITEBOARD') {
    if (doc.whiteboardData) {
      const wbFile = uniqueName(usedNames, safeTitle, '.tldraw.json');
      dir.file(wbFile, doc.whiteboardData);
    }
    if (hasNonEmptyBlocks(doc.content)) {
      const mdFile = uniqueName(usedNames, safeTitle, '.md');
      dir.file(mdFile, blocksToMarkdown(doc.title, doc.content));
    } else if (!doc.whiteboardData) {
      const mdFile = uniqueName(usedNames, safeTitle, '.md');
      dir.file(
        mdFile,
        `# ${doc.title}\n\n> _Pizarrón vacío sin trazos ni notas._\n`
      );
    }
    return;
  }

  const mdFile = uniqueName(usedNames, safeTitle, '.md');
  dir.file(mdFile, blocksToMarkdown(doc.title, doc.content || '[]'));
}

function sanitizeZipEntryPath(name: string): string {
  const parts = name
    .replace(/\\/g, '/')
    .split('/')
    .map((p) => p.trim())
    .filter((p) => p && p !== '.' && p !== '..')
    .map((p) => p.replace(/[<>:"|?*]/g, '_'));
  return parts.join('/') || 'archivo';
}

function exportLatexProjectsToDir(parentDir: JSZip, projects: any[]) {
  if (!projects || projects.length === 0) return;
  const latexFolder = parentDir.folder('proyectos-latex')!;
  const usedProjNames = new Set<string>();

  for (const proj of projects) {
    const projBase = uniqueName(usedProjNames, sanitizeFilename(proj.title));
    const projDir = latexFolder.folder(projBase)!;

    for (const file of proj.files || []) {
      const safePath = sanitizeZipEntryPath(file.filename || 'archivo.tex');
      if (file.isBinary) {
        projDir.file(safePath, Buffer.from(file.content, 'base64'), { binary: true });
      } else {
        projDir.file(safePath, file.content);
      }
    }

    if (proj.pdfBase64) {
      projDir.file(`${projBase}.pdf`, Buffer.from(proj.pdfBase64, 'base64'), { binary: true });
    }
  }
}

// ─── GET /api/export ───────────────────────────────────────────────────────────
export async function GET() {
  try {
    const [folders, orphanDocs, orphanLatexProjects] = await Promise.all([
      prisma.folder.findMany({
        include: {
          documents: {
            select: {
              id: true,
              title: true,
              content: true,
              whiteboardData: true,
              type: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
          },
          latexProjects: {
            include: { files: true },
            orderBy: { updatedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.document.findMany({
        where: { folderId: null },
        select: {
          id: true,
          title: true,
          content: true,
          whiteboardData: true,
          type: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.latexProject.findMany({
        where: { folderId: null },
        include: { files: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const zip = new JSZip();
    const root = zip.folder('Lema-Export')!;

    // ── README ──────────────────────────────────────────────────────────────
    const exportDate = new Date().toLocaleString('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
    root.file(
      'README.md',
      `# Exportación de Lema\n\nFecha: ${exportDate}\n\n## Contenido\n\n- \`documentos/\` — Apuntes de texto (\`.md\`), pizarrones (\`.tldraw.json\` + notas) y proyectos LaTeX por materia\n- \`documentos/_sin_carpeta/\` — Documentos y proyectos LaTeX sin materia asignada\n\n---\n_Generado por Lema — Segundo Cerebro Matemático_\n`
    );

    // ── Documentos y proyectos por carpeta (respetando jerarquía) ───────────
    const docsFolder = root.folder('documentos')!;
    const folderIds = new Set(folders.map((f) => f.id));
    const childrenByParent = new Map<string | null, typeof folders>();

    for (const folder of folders) {
      const effectiveParentId =
        folder.parentId && folder.parentId !== folder.id && folderIds.has(folder.parentId)
          ? folder.parentId
          : null;
      const list = childrenByParent.get(effectiveParentId) ?? [];
      list.push(folder);
      childrenByParent.set(effectiveParentId, list);
    }

    const exportFolderRecursive = (
      parentZipDir: JSZip,
      parentId: string | null,
      reservedNames: string[] = []
    ) => {
      const siblings = childrenByParent.get(parentId) ?? [];
      const usedSiblingNames = new Set<string>(reservedNames);

      for (const folder of siblings) {
        const folderName = uniqueName(usedSiblingNames, sanitizeFilename(folder.name));
        const folderDir = parentZipDir.folder(folderName)!;
        const usedDocNames = new Set<string>(['proyectos-latex']);

        for (const doc of folder.documents) {
          exportDocumentToDir(folderDir, usedDocNames, doc);
        }

        exportLatexProjectsToDir(folderDir, folder.latexProjects);
        exportFolderRecursive(folderDir, folder.id, Array.from(usedDocNames));
      }
    };

    exportFolderRecursive(docsFolder, null, ['_sin_carpeta']);

    // ── Huérfanos sin carpeta ───────────────────────────────────────────────
    if (orphanDocs.length > 0 || orphanLatexProjects.length > 0) {
      const orphanDir = docsFolder.folder('_sin_carpeta')!;
      const usedOrphanDocNames = new Set<string>();

      for (const doc of orphanDocs) {
        exportDocumentToDir(orphanDir, usedOrphanDocNames, doc);
      }

      exportLatexProjectsToDir(orphanDir, orphanLatexProjects);
    }

    // ── Stream ZIP directly without buffering entire archive in RAM ─────────
    const nodeStream = zip.generateNodeStream({
      type: 'nodebuffer',
      streamFiles: true,
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    const webStream = Readable.toWeb(nodeStream as unknown as Readable) as ReadableStream;

    const filename = `Lema-Export-${new Date().toISOString().split('T')[0]}.zip`;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('[/api/export] Error:', error);
    return NextResponse.json({ error: error.message || 'Error al generar el ZIP' }, { status: 500 });
  }
}
