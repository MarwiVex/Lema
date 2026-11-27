import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectHeuristicRelations } from '@/lib/graphRelations';
import { loadGraphNodeInputs, replaceStoredEdges } from '@/lib/graphData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [documents, latexProjects] = await Promise.all([
      prisma.document.findMany({
        select: {
          id: true,
          title: true,
          type: true,
          folder: {
            select: {
              name: true,
              id: true,
            },
          },
          links: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.latexProject.findMany({
        select: {
          id: true,
          title: true,
          folder: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      }),
    ]);

    const nodes = [];
    const nodeIdSet = new Set<string>();
    const edgeMap = new Map<
      string,
      { source: string; target: string; label: string; weight: number; kind: string }
    >();

    for (const doc of documents) {
      nodeIdSet.add(doc.id);
      nodes.push({
        id: doc.id,
        name: doc.title,
        group: doc.folder?.name || 'Sin Materia',
        type: doc.type,
      });

      for (const link of doc.links) {
        if (doc.id === link.id) continue;
        const [a, b] = doc.id < link.id ? [doc.id, link.id] : [link.id, doc.id];
        edgeMap.set(`${a}::${b}`, {
          source: doc.id,
          target: link.id,
          label: 'Enlace manual',
          weight: 1,
          kind: 'MANUAL',
        });
      }
    }

    for (const lp of latexProjects) {
      const id = `lp:${lp.id}`;
      nodeIdSet.add(id);
      nodes.push({
        id,
        name: lp.title,
        group: lp.folder?.name || 'Sin Materia',
        type: 'LATEX',
      });
    }

    // Load persisted auto/AI edges, or compute heuristic edges on first load
    let storedEdges: {
      sourceId: string;
      targetId: string;
      label: string | null;
      weight: number;
      kind: string;
    }[] = [];
    let tableAvailable = true;

    try {
      storedEdges = await prisma.graphEdge.findMany({
        select: {
          sourceId: true,
          targetId: true,
          label: true,
          weight: true,
          kind: true,
        },
      });
    } catch {
      tableAvailable = false;
    }

    if (storedEdges.length === 0 && nodes.length >= 2) {
      const inputs = await loadGraphNodeInputs();
      const detected = detectHeuristicRelations(inputs);
      if (tableAvailable && detected.length > 0) {
        await replaceStoredEdges(detected);
      }
      for (const e of detected) {
        const [a, b] = e.source < e.target ? [e.source, e.target] : [e.target, e.source];
        const key = `${a}::${b}`;
        if (!edgeMap.has(key)) {
          edgeMap.set(key, e);
        }
      }
    } else {
      for (const e of storedEdges) {
        if (!nodeIdSet.has(e.sourceId) || !nodeIdSet.has(e.targetId)) continue;
        const [a, b] =
          e.sourceId < e.targetId ? [e.sourceId, e.targetId] : [e.targetId, e.sourceId];
        const key = `${a}::${b}`;
        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            source: e.sourceId,
            target: e.targetId,
            label: e.label || 'Relacionado',
            weight: e.weight,
            kind: e.kind,
          });
        }
      }
    }

    return NextResponse.json({
      nodes,
      links: Array.from(edgeMap.values()),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching graph' }, { status: 500 });
  }
}
