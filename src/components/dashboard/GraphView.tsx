'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import {
  Share2,
  Sparkles,
  Loader2,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLemaStore } from '@/store/useLemaStore';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
    </div>
  ),
});

interface GraphNode {
  id: string;
  name: string;
  group: string;
  type: 'TEXT' | 'WHITEBOARD' | 'LATEX' | string;
  val: number;
  x?: number;
  y?: number;
  __baseTextWidth?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  weight?: number;
  kind?: 'MANUAL' | 'AUTO' | 'AI' | string;
}

interface RawGraphResponse {
  nodes: Omit<GraphNode, 'val'>[];
  links: { source: string; target: string; label?: string; weight?: number; kind?: string }[];
}

const graphFetcher = (url: string): Promise<RawGraphResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Error fetching graph');
    return res.json();
  });

const getNodeColor = (rawNode: any) => {
  const node = rawNode as GraphNode;
  return node.type === 'WHITEBOARD' ? '#10b981' : node.type === 'LATEX' ? '#f59e0b' : '#6366f1';
};

export default function GraphView() {
  const router = useRouter();
  const resolvedTheme = useLemaStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === 'dark';

  const {
    data: rawData,
    isLoading: loading,
    error,
    mutate,
  } = useSWR<RawGraphResponse>('/api/graph', graphFetcher, {
    revalidateOnFocus: false,
  });

  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasFittedRef = useRef(false);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [enabledTypes, setEnabledTypes] = useState<Record<'TEXT' | 'WHITEBOARD' | 'LATEX', boolean>>({
    TEXT: true,
    WHITEBOARD: true,
    LATEX: true,
  });
  const [showLegend, setShowLegend] = useState(true);

  const foldersList = useMemo(() => {
    if (!rawData?.nodes) return [];
    const set = new Set<string>();
    for (const n of rawData.nodes) {
      if (n.group) set.add(n.group);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [rawData]);

  const data = useMemo<{ nodes: GraphNode[]; links: GraphLink[]; neighborMap: Map<string, Set<string>> }>(() => {
    if (!rawData?.nodes || !rawData?.links) {
      return { nodes: [], links: [], neighborMap: new Map() };
    }

    const q = searchQuery.trim().toLowerCase();
    const visibleNodesRaw = rawData.nodes.filter((n) => {
      if (selectedFolder !== 'ALL' && n.group !== selectedFolder) return false;
      const typeKey = n.type === 'WHITEBOARD' || n.type === 'LATEX' ? n.type : 'TEXT';
      if (!enabledTypes[typeKey]) return false;
      if (q && !n.name.toLowerCase().includes(q) && !n.group.toLowerCase().includes(q)) return false;
      return true;
    });

    const visibleIds = new Set(visibleNodesRaw.map((n) => n.id));
    const degreeMap = new Map<string, number>();
    const neighborMap = new Map<string, Set<string>>();

    const links: GraphLink[] = [];
    for (const l of rawData.links) {
      const s = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      if (!visibleIds.has(s) || !visibleIds.has(t)) continue;
      degreeMap.set(s, (degreeMap.get(s) || 0) + 1);
      degreeMap.set(t, (degreeMap.get(t) || 0) + 1);
      if (!neighborMap.has(s)) neighborMap.set(s, new Set());
      if (!neighborMap.has(t)) neighborMap.set(t, new Set());
      neighborMap.get(s)!.add(t);
      neighborMap.get(t)!.add(s);
      links.push({
        source: s,
        target: t,
        label: l.label,
        weight: l.weight,
        kind: l.kind,
      });
    }

    const nodes: GraphNode[] = visibleNodesRaw.map((n) => ({
      ...n,
      val: 10 + (degreeMap.get(n.id) || 0) * 2,
    }));

    return { nodes, links, neighborMap };
  }, [rawData, searchQuery, selectedFolder, enabledTypes]);

  // Reset initial fit flag when visible dataset filter changes
  useEffect(() => {
    hasFittedRef.current = false;
  }, [selectedFolder, enabledTypes, rawData?.nodes?.length]);

  // Configure stronger charge repulsion and link distance to prevent central label overlap
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;
    fg.d3Force?.('charge')?.strength?.(-260);
    fg.d3Force?.('link')?.distance?.(85);
    fg.d3ReheatSimulation?.();
  }, [data.nodes.length, data.links.length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: rect.width, height: rect.height });
    }
    let rafId: number | null = null;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setDimensions((prev) =>
            Math.abs(prev.width - width) > 1 || Math.abs(prev.height - height) > 1
              ? { width, height }
              : prev
          );
        });
      }
    });
    observer.observe(containerRef.current);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const handleCenterGraph = useCallback(() => {
    graphRef.current?.zoomToFit(450, 50);
  }, []);

  const handleZoomIn = useCallback(() => {
    const current = graphRef.current?.zoom?.();
    if (typeof current === 'number') {
      graphRef.current.zoom(Math.min(current * 1.35, 8), 300);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const current = graphRef.current?.zoom?.();
    if (typeof current === 'number') {
      graphRef.current.zoom(Math.max(current / 1.35, 0.2), 300);
    }
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && data.nodes.length > 0) {
      const target = data.nodes[0];
      if (typeof target.x === 'number' && typeof target.y === 'number') {
        graphRef.current?.centerAt(target.x, target.y, 500);
        graphRef.current?.zoom(2.2, 500);
      }
    }
  };

  const handleAnalyzeRelations = useCallback(async () => {
    if (analyzing) return;
    setAnalyzing(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/graph/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ai' }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error al analizar relaciones');
      }
      await mutate();
      setStatusMsg(
        json.aiUsed
          ? `${json.count} conexiones detectadas con IA`
          : `${json.count} conexiones detectadas (análisis semántico)`
      );
    } catch (err: any) {
      setStatusMsg(err?.message || 'No se pudieron detectar relaciones');
    } finally {
      setAnalyzing(false);
    }
  }, [analyzing, mutate]);

  const handleNodeClick = useCallback(
    (rawNode: any) => {
      const node = rawNode as GraphNode;
      if (!node?.id) return;
      if (node.id.startsWith('lp:')) {
        router.push(`/latex/${node.id.slice(3)}`);
      } else {
        router.push(node.type === 'WHITEBOARD' ? `/whiteboard/${node.id}` : `/doc/${node.id}`);
      }
    },
    [router]
  );

  const getLinkColor = useCallback(
    (rawLink: any) => {
      const link = rawLink as GraphLink;
      const s = typeof link.source === 'object' ? link.source.id : link.source;
      const t = typeof link.target === 'object' ? link.target.id : link.target;
      const isHighlighted = hoverNodeId && (s === hoverNodeId || t === hoverNodeId);

      if (isHighlighted) {
        return link.kind === 'MANUAL' ? '#818cf8' : '#0ea5e9';
      }
      if (hoverNodeId) {
        return isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(148, 163, 184, 0.22)';
      }
      if (link.kind === 'MANUAL') return '#6366f1';
      if (link.kind === 'AI') return isDark ? 'rgba(56, 189, 248, 0.55)' : 'rgba(14, 165, 233, 0.6)';
      return isDark ? 'rgba(100, 116, 139, 0.5)' : 'rgba(100, 116, 139, 0.45)';
    },
    [hoverNodeId, isDark]
  );

  const getLinkWidth = useCallback(
    (rawLink: any) => {
      const link = rawLink as GraphLink;
      const s = typeof link.source === 'object' ? link.source.id : link.source;
      const t = typeof link.target === 'object' ? link.target.id : link.target;
      if (hoverNodeId && (s === hoverNodeId || t === hoverNodeId)) {
        return 2.5;
      }
      if (link.kind === 'MANUAL') return 2;
      return Math.max(1, (link.weight || 0.5) * 2);
    },
    [hoverNodeId]
  );

  const paintNode = useCallback(
    (rawNode: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = rawNode as GraphNode;
      if (typeof node.x !== 'number' || typeof node.y !== 'number') return;

      const label = node.name;
      const fontSize = 12 / globalScale;
      const fontSpec = `${fontSize}px Inter, system-ui, sans-serif`;
      ctx.font = fontSpec;

      if (node.__baseTextWidth === undefined) {
        ctx.save();
        ctx.font = '12px Inter, system-ui, sans-serif';
        node.__baseTextWidth = ctx.measureText(label).width;
        ctx.restore();
      }

      const isNeighbor =
        hoverNodeId === null ||
        node.id === hoverNodeId ||
        Boolean(data.neighborMap.get(hoverNodeId)?.has(node.id));
      const alpha = isNeighbor ? 1 : 0.25;
      const showLabel =
        globalScale >= 0.65 ||
        node.id === hoverNodeId ||
        (hoverNodeId !== null && isNeighbor);

      ctx.save();
      ctx.globalAlpha = alpha;

      if (showLabel) {
        const textWidth = node.__baseTextWidth / globalScale;
        const padX = fontSize * 0.45;
        const padY = fontSize * 0.25;
        const boxW = textWidth + padX * 2;
        const boxH = fontSize + padY * 2;

        ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)';
        ctx.beginPath();
        ctx.roundRect(node.x - boxW / 2, node.y - boxH / 2 - 10, boxW, boxH, 3);
        ctx.fill();

        if (!isDark) {
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
          ctx.lineWidth = 0.75 / globalScale;
          ctx.stroke();
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle =
          node.type === 'WHITEBOARD'
            ? isDark ? '#34d399' : '#059669'
            : node.type === 'LATEX'
            ? isDark ? '#fbbf24' : '#d97706'
            : isDark ? '#a5b4fc' : '#4f46e5';
        ctx.fillText(label, node.x, node.y - 10);
      }

      // Draw dot
      const radius = node.id === hoverNodeId ? 5.5 : 4;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = getNodeColor(node);
      ctx.fill();
      ctx.strokeStyle = isDark ? '#ffffff' : '#0f172a';
      ctx.lineWidth = (node.id === hoverNodeId ? 1.5 : 1) / globalScale;
      ctx.stroke();

      ctx.restore();
    },
    [data.neighborMap, hoverNodeId, isDark]
  );

  const paintNodePointerArea = useCallback(
    (rawNode: any, color: string, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const node = rawNode as GraphNode;
      if (typeof node.x !== 'number' || typeof node.y !== 'number') return;
      ctx.fillStyle = color;
      if (globalScale >= 0.65) {
        const fontSize = 12 / globalScale;
        const baseWidth = node.__baseTextWidth ?? (node.name?.length || 6) * 6.5;
        const textWidth = baseWidth / globalScale;
        const boxW = textWidth + fontSize * 0.9;
        const boxH = fontSize * 1.5;
        ctx.fillRect(node.x - boxW / 2, node.y - boxH / 2 - 10, boxW, boxH);
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, 7 / Math.sqrt(Math.max(globalScale, 0.5)), 0, 2 * Math.PI, false);
      ctx.fill();
    },
    []
  );

  return (
    <div className="flex h-full w-full flex-col bg-canvas relative overflow-hidden">
      {/* Top responsive control header */}
      <div className="z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle bg-surface/85 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 shrink-0">
              <Share2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink-primary tracking-tight">
                Grafo de Conocimiento
              </h2>
              <p className="text-xs text-ink-muted">
                {data.nodes.length} temas · {data.links.length} conexiones
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLegend((v) => !v)}
            aria-label={showLegend ? 'Ocultar leyenda' : 'Mostrar leyenda'}
            title={showLegend ? 'Ocultar leyenda' : 'Mostrar leyenda'}
            className="lg:hidden p-2 rounded-lg border border-border-subtle bg-surface-subtle text-ink-secondary cursor-pointer"
          >
            {showLegend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Filter, search, zoom & AI controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar nodo... (Enter)"
              aria-label="Buscar nodo en el grafo"
              className="w-full bg-surface-subtle/70 border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            aria-label="Filtrar grafo por materia"
            className="bg-surface-subtle/70 border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Todas las materias</option>
            {foldersList.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Type filter toggles */}
          <div className="flex items-center gap-1 bg-surface-subtle/70 p-0.5 rounded-lg border border-border-subtle">
            {(
              [
                { key: 'TEXT', label: 'Texto', dot: 'bg-indigo-500' },
                { key: 'WHITEBOARD', label: 'Pizarra', dot: 'bg-emerald-500' },
                { key: 'LATEX', label: 'LaTeX', dot: 'bg-amber-500' },
              ] as const
            ).map(({ key, label, dot }) => (
              <button
                key={key}
                type="button"
                onClick={() => setEnabledTypes((prev) => ({ ...prev, [key]: !prev[key] }))}
                aria-pressed={enabledTypes[key]}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  enabledTypes[key]
                    ? 'bg-surface text-ink-primary shadow-sm'
                    : 'text-ink-muted opacity-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-surface-subtle/70 p-0.5 rounded-lg border border-border-subtle">
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Alejar grafo"
              title="Alejar"
              className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Acercar grafo"
              title="Acercar"
              className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCenterGraph}
              aria-label="Centrar grafo"
              title="Centrar grafo"
              className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAnalyzeRelations}
            disabled={analyzing || loading || (rawData?.nodes?.length ?? 0) < 2}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-colors cursor-pointer"
          >
            {analyzing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{analyzing ? 'Analizando...' : 'Detectar Relaciones (IA)'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        className={`flex-1 w-full relative ${hoverNodeId ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
        ref={containerRef}
      >
        {statusMsg && (
          <div className="absolute top-4 left-4 z-10 rounded-xl bg-surface/95 border border-border-strong px-3 py-1.5 text-xs text-sky-600 dark:text-sky-300 shadow-lg">
            {statusMsg}
          </div>
        )}

        {showLegend && (
          <div className="absolute bottom-4 left-4 z-10 bg-surface/95 border border-border-strong p-3 rounded-xl flex flex-wrap sm:flex-col gap-2 text-xs shadow-lg">
            <div className="flex items-center gap-2 text-ink-secondary">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Apuntes de Texto
            </div>
            <div className="flex items-center gap-2 text-ink-secondary">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pizarrones
            </div>
            <div className="flex items-center gap-2 text-ink-secondary">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Proyectos LaTeX
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-ink-muted">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
            <span className="text-xs font-medium">Cargando grafo de conocimiento...</span>
          </div>
        ) : error ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="text-sm font-medium text-ink-primary">No se pudo cargar el grafo</p>
            <button
              type="button"
              onClick={() => void mutate()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reintentar
            </button>
          </div>
        ) : data.nodes.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center gap-2 text-ink-muted">
            <Share2 className="h-10 w-10 opacity-25" />
            <p className="text-sm font-medium text-ink-primary">No hay nodos visibles</p>
            <p className="text-xs max-w-sm">
              Crea apuntes o ajusta los filtros de materia y tipo para visualizar conexiones.
            </p>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            nodeLabel="name"
            linkLabel={(link: any) => link.label || 'Relacionado'}
            nodeColor={getNodeColor}
            linkColor={getLinkColor}
            linkWidth={getLinkWidth}
            linkDirectionalParticles={(link: any) => {
              const s = typeof link.source === 'object' ? link.source.id : link.source;
              const t = typeof link.target === 'object' ? link.target.id : link.target;
              return hoverNodeId && (s === hoverNodeId || t === hoverNodeId) ? 2 : 0;
            }}
            linkDirectionalParticleWidth={2}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={paintNodePointerArea}
            onNodeClick={handleNodeClick}
            onNodeHover={(node: any) => setHoverNodeId(node?.id ? String(node.id) : null)}
            backgroundColor={isDark ? '#0a0d14' : '#f8fafc'}
            cooldownTicks={100}
            onEngineStop={() => {
              if (!hasFittedRef.current) {
                hasFittedRef.current = true;
                graphRef.current?.zoomToFit(400, 50);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
