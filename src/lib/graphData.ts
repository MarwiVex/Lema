import { prisma } from '@/lib/prisma';
import {
  DetectedEdge,
  GraphNodeInput,
  extractTextFromBlockNote,
  extractTextFromLatexFiles,
  extractTextFromWhiteboard,
} from '@/lib/graphRelations';

export async function loadGraphNodeInputs(): Promise<GraphNodeInput[]> {
  const [documents, latexProjects] = await Promise.all([
    prisma.document.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        content: true,
        whiteboardData: true,
        folder: { select: { name: true } },
      },
    }),
    prisma.latexProject.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        folder: { select: { name: true } },
        files: {
          where: { isBinary: false },
          select: { filename: true, content: true, isBinary: true },
        },
      },
    }),
  ]);

  const inputs: GraphNodeInput[] = [];

  for (const doc of documents) {
    const textContent =
      doc.type === 'WHITEBOARD'
        ? `${extractTextFromWhiteboard(doc.whiteboardData)} ${extractTextFromBlockNote(doc.content)}`.trim()
        : extractTextFromBlockNote(doc.content);

    inputs.push({
      id: doc.id,
      title: doc.title,
      group: doc.folder?.name || 'Sin Materia',
      type: doc.type,
      textContent,
    });
  }

  for (const lp of latexProjects) {
    const texText = extractTextFromLatexFiles(lp.files);
    const desc = lp.description ? `${lp.description} ` : '';
    inputs.push({
      id: `lp:${lp.id}`,
      title: lp.title,
      group: lp.folder?.name || 'Sin Materia',
      type: 'LATEX',
      textContent: `${desc}${texText}`.trim(),
    });
  }

  return inputs;
}

export async function replaceStoredEdges(edges: DetectedEdge[]): Promise<void> {
  try {
    await prisma.graphEdge.deleteMany({});
    if (edges.length === 0) return;

    await prisma.graphEdge.createMany({
      data: edges.map((e) => ({
        sourceId: e.source,
        targetId: e.target,
        label: e.label,
        weight: e.weight,
        kind: e.kind,
      })),
    });
  } catch (err) {
    // Graceful no-op if GraphEdge table is not yet pushed in a remote DB
    console.warn('Could not persist GraphEdge rows:', err);
  }
}
