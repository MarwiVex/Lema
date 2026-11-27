import { NextResponse } from 'next/server';
import {
  DetectedEdge,
  detectAIRelations,
  detectHeuristicRelations,
} from '@/lib/graphRelations';
import { loadGraphNodeInputs, replaceStoredEdges } from '@/lib/graphData';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const useAi = body?.mode !== 'fast';

    const inputs = await loadGraphNodeInputs();
    if (inputs.length < 2) {
      return NextResponse.json({ ok: true, count: 0, aiUsed: false });
    }

    const heuristicEdges = detectHeuristicRelations(inputs);
    const merged = new Map<string, DetectedEdge>();

    for (const e of heuristicEdges) {
      const [a, b] = e.source < e.target ? [e.source, e.target] : [e.target, e.source];
      merged.set(`${a}::${b}`, e);
    }

    let aiUsed = false;
    let aiWarning: string | undefined;

    if (useAi) {
      try {
        const aiEdges = await detectAIRelations(inputs);
        aiUsed = true;
        // AI edges override heuristic labels/weights for the same pair
        for (const e of aiEdges) {
          const [a, b] = e.source < e.target ? [e.source, e.target] : [e.target, e.source];
          merged.set(`${a}::${b}`, e);
        }
      } catch (err: any) {
        aiWarning = err?.message || 'IA no disponible; se usó análisis semántico local.';
        console.warn('AI graph analysis fallback to heuristic:', aiWarning);
      }
    }

    const finalEdges = Array.from(merged.values());
    await replaceStoredEdges(finalEdges);

    return NextResponse.json({
      ok: true,
      count: finalEdges.length,
      aiUsed,
      warning: aiWarning,
    });
  } catch (error: any) {
    console.error('Error analyzing graph relations:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al analizar relaciones del grafo' },
      { status: 500 }
    );
  }
}
