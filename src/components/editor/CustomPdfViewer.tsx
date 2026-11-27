'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
type PDFDocumentProxy = Parameters<
  NonNullable<React.ComponentProps<typeof Document>['onLoadSuccess']>
>[0];
import {
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize,
  MoveHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { base64ToBlob } from '@/lib/base64';

// Worker local en /public para evitar dependencia externa y compatibilidad estricta con COEP
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface CustomPdfViewerProps {
  pdfBase64?: string | null;
  pdfBytes?: Uint8Array | null;
  pdfUrl?: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const VirtualizedPdfPage = React.memo(function VirtualizedPdfPage({
  pageNumber,
  scale,
  isVisible,
  registerPageEl,
  onFirstPageMeasured,
  searchQuery,
}: {
  pageNumber: number;
  scale: number;
  isVisible: boolean;
  registerPageEl: (pageNum: number, el: HTMLDivElement | null) => void;
  onFirstPageMeasured: (size: { width: number; height: number }) => void;
  searchQuery: string;
}) {
  const [baseSize, setBaseSize] = useState<{ width: number; height: number } | null>(null);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      registerPageEl(pageNumber, el);
    },
    [pageNumber, registerPageEl]
  );

  const placeholderWidth = Math.round((baseSize?.width ?? 600) * scale);
  const placeholderHeight = Math.round((baseSize?.height ?? 840) * scale);

  const customTextRenderer = useCallback(
    (textItem: { str: string }) => {
      const raw = textItem.str ?? '';
      if (!searchQuery.trim()) return escapeHtml(raw);
      const regex = new RegExp(`(${escapeRegExp(searchQuery.trim())})`, 'gi');
      const parts = raw.split(regex);
      return parts
        .map((part, idx) =>
          idx % 2 === 1
            ? `<mark class="bg-amber-300/80 text-slate-950 rounded-xs px-0.5">${escapeHtml(part)}</mark>`
            : escapeHtml(part)
        )
        .join('');
    },
    [searchQuery]
  );

  return (
    <div
      ref={setRef}
      data-page-number={pageNumber}
      className="shadow-xl shadow-black/25 dark:shadow-black/50 transition-transform origin-top"
      style={{
        borderRadius: '4px',
        overflow: 'hidden',
        minWidth: !isVisible ? `${placeholderWidth}px` : undefined,
        minHeight: !isVisible ? `${placeholderHeight}px` : undefined,
      }}
    >
      {isVisible ? (
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          customTextRenderer={searchQuery.trim() ? customTextRenderer : undefined}
          onRenderSuccess={(page) => {
            const unscaledW = (page as any).originalWidth ?? page.width / scale;
            const unscaledH = (page as any).originalHeight ?? page.height / scale;
            if (pageNumber === 1) {
              onFirstPageMeasured({ width: unscaledW, height: unscaledH });
            }
            setBaseSize((prev) =>
              prev &&
              Math.abs(prev.width - unscaledW) < 0.5 &&
              Math.abs(prev.height - unscaledH) < 0.5
                ? prev
                : { width: unscaledW, height: unscaledH }
            );
          }}
          loading={
            <div
              style={{ width: `${placeholderWidth}px`, height: `${placeholderHeight}px` }}
              className="bg-surface-subtle animate-pulse flex items-center justify-center text-ink-muted"
            >
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          }
        />
      ) : (
        <div
          style={{ width: `${placeholderWidth}px`, height: `${placeholderHeight}px` }}
          className="bg-surface/70 border border-border-subtle flex items-center justify-center text-ink-muted text-xs"
        >
          Página {pageNumber}
        </div>
      )}
    </div>
  );
});

const CustomPdfViewer = React.memo(function CustomPdfViewer({
  pdfBase64,
  pdfBytes,
  pdfUrl,
}: CustomPdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [scale, setScale] = useState<number>(1.0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const [firstPageBaseSize, setFirstPageBaseSize] = useState<{ width: number; height: number } | null>(null);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingPages, setMatchingPages] = useState<number[]>([]);
  const [matchCursor, setMatchCursor] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const pageElsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(() => new Set([1, 2]));
  const savedScrollTopRef = useRef<number>(0);
  const shouldRestoreScrollRef = useRef<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const registerPageEl = useCallback((pageNum: number, el: HTMLDivElement | null) => {
    const prevEl = pageElsRef.current.get(pageNum);
    if (prevEl && prevEl !== el) {
      observerRef.current?.unobserve(prevEl);
    }
    if (el) {
      pageElsRef.current.set(pageNum, el);
      observerRef.current?.observe(el);
    } else {
      pageElsRef.current.delete(pageNum);
    }
  }, []);

  // Single shared IntersectionObserver across all PDF pages
  useEffect(() => {
    if (!scrollRoot) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((prev) => {
          let changed = false;
          const next = new Set(prev);
          for (const entry of entries) {
            const pageNum = Number(entry.target.getAttribute('data-page-number'));
            if (!pageNum) continue;
            if (entry.isIntersecting) {
              if (!next.has(pageNum)) {
                next.add(pageNum);
                changed = true;
              }
            } else if (next.has(pageNum)) {
              next.delete(pageNum);
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { root: scrollRoot, rootMargin: '600px 0px' }
    );

    observerRef.current = observer;
    for (const el of pageElsRef.current.values()) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [scrollRoot]);

  useEffect(() => {
    // Capture scrollTop before switching fileUrl on recompile
    if (scrollRoot && fileUrl) {
      savedScrollTopRef.current = scrollRoot.scrollTop;
      shouldRestoreScrollRef.current = true;
    }

    if (pdfBytes && pdfBytes.length > 0) {
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      setFileUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (pdfUrl) {
      setFileUrl(pdfUrl);
      return;
    }

    if (pdfBase64) {
      const blob = base64ToBlob(pdfBase64, 'application/pdf');
      const objectUrl = URL.createObjectURL(blob);
      setFileUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setFileUrl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfBase64, pdfBytes, pdfUrl]);

  // Ctrl + Wheel zoom over scroll container
  useEffect(() => {
    if (!scrollRoot) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.12 : -0.12;
        setScale((prev) => Math.max(0.4, Math.min(3.0, Math.round((prev + delta) * 100) / 100)));
      }
    };
    scrollRoot.addEventListener('wheel', onWheel, { passive: false });
    return () => scrollRoot.removeEventListener('wheel', onWheel);
  }, [scrollRoot]);

  // Track currently visible page on scroll
  useEffect(() => {
    if (!scrollRoot || !numPages) return;
    let rafId: number | null = null;
    const updateCurrentPage = () => {
      const rootRect = scrollRoot.getBoundingClientRect();
      const centerY = rootRect.top + rootRect.height * 0.35;
      let bestPage = 1;
      let bestDist = Infinity;

      for (const [pageNum, el] of pageElsRef.current.entries()) {
        const rect = el.getBoundingClientRect();
        const mid = (rect.top + rect.bottom) / 2;
        const dist = Math.abs(mid - centerY);
        if (dist < bestDist) {
          bestDist = dist;
          bestPage = pageNum;
        }
      }
      setCurrentPage(bestPage);
      setPageInput(String(bestPage));
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateCurrentPage);
    };

    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      scrollRoot.removeEventListener('scroll', onScroll);
    };
  }, [scrollRoot, numPages]);

  const jumpToPage = useCallback(
    (targetPage: number) => {
      if (!numPages) return;
      const clamped = Math.max(1, Math.min(targetPage, numPages));
      setVisiblePages((prev) => {
        if (prev.has(clamped)) return prev;
        const next = new Set(prev);
        next.add(clamped);
        return next;
      });
      const el = pageElsRef.current.get(clamped);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setCurrentPage(clamped);
      setPageInput(String(clamped));
    },
    [numPages]
  );

  // Run text search across all PDF pages
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    const doc = pdfDocRef.current;
    if (!q || !doc) {
      setMatchingPages([]);
      setMatchCursor(0);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    (async () => {
      const hits: number[] = [];
      for (let p = 1; p <= doc.numPages; p++) {
        if (cancelled) return;
        try {
          const page = await doc.getPage(p);
          const textContent = await page.getTextContent();
          const fullText = textContent.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ')
            .toLowerCase();
          if (fullText.includes(q)) {
            hits.push(p);
          }
        } catch {
          // Ignore single-page text extraction errors
        }
      }
      if (!cancelled) {
        setMatchingPages(hits);
        setMatchCursor(0);
        setIsSearching(false);
        if (hits.length > 0) {
          jumpToPage(hits[0]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, jumpToPage]);

  const onDocumentLoadSuccess = useCallback(
    (pdf: PDFDocumentProxy) => {
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      if (shouldRestoreScrollRef.current && scrollRoot) {
        const targetTop = savedScrollTopRef.current;
        shouldRestoreScrollRef.current = false;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (scrollRoot) {
              scrollRoot.scrollTop = targetTop;
            }
          });
        });
      }
    },
    [scrollRoot]
  );

  const zoomIn = () => setScale((prev) => Math.min(Math.round((prev + 0.15) * 100) / 100, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(Math.round((prev - 0.15) * 100) / 100, 0.4));

  const fitWidth = () => {
    if (!scrollRoot) return;
    const baseW = firstPageBaseSize?.width ?? 600;
    const availW = Math.max(200, scrollRoot.clientWidth - 64);
    setScale(Math.max(0.4, Math.min(3.0, Math.round((availW / baseW) * 100) / 100)));
  };

  const fitPage = () => {
    if (!scrollRoot) return;
    const baseW = firstPageBaseSize?.width ?? 600;
    const baseH = firstPageBaseSize?.height ?? 840;
    const availW = Math.max(200, scrollRoot.clientWidth - 64);
    const availH = Math.max(200, scrollRoot.clientHeight - 64);
    const ratio = Math.min(availW / baseW, availH / baseH);
    setScale(Math.max(0.4, Math.min(3.0, Math.round(ratio * 100) / 100)));
  };

  const handleStepMatch = (dir: 1 | -1) => {
    if (matchingPages.length === 0) return;
    const nextIdx = (matchCursor + dir + matchingPages.length) % matchingPages.length;
    setMatchCursor(nextIdx);
    jumpToPage(matchingPages[nextIdx]);
  };

  if (!fileUrl) return null;

  return (
    <div className="flex flex-col w-full h-full bg-surface-subtle/40 dark:bg-[#161b26] overflow-hidden relative">
      {/* Toolbar superior */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-border-subtle bg-surface/90 backdrop-blur-md z-10 shrink-0">
        {/* Navegación de página */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => jumpToPage(currentPage - 1)}
            disabled={!numPages || currentPage <= 1}
            aria-label="Página anterior"
            title="Página anterior"
            className="p-1.5 text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle rounded-lg disabled:opacity-35 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const parsed = parseInt(pageInput, 10);
              if (!isNaN(parsed)) jumpToPage(parsed);
            }}
            className="flex items-center gap-1 text-xs text-ink-secondary"
          >
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => setPageInput(String(currentPage))}
              aria-label="Número de página actual"
              className="w-9 text-center bg-surface-subtle border border-border-subtle rounded px-1 py-0.5 text-xs text-ink-primary focus:outline-none focus:border-cyan-500"
            />
            <span className="text-ink-muted">/ {numPages ?? '–'}</span>
          </form>
          <button
            type="button"
            onClick={() => jumpToPage(currentPage + 1)}
            disabled={!numPages || currentPage >= numPages}
            aria-label="Página siguiente"
            title="Página siguiente"
            className="p-1.5 text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle rounded-lg disabled:opacity-35 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom y búsqueda */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            aria-label="Alejar PDF"
            title="Alejar (Ctrl + rueda)"
            className="p-1.5 text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-ink-primary text-xs font-medium w-11 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            aria-label="Acercar PDF"
            title="Acercar (Ctrl + rueda)"
            className="p-1.5 text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border-subtle mx-1" />

          <button
            type="button"
            onClick={fitWidth}
            aria-label="Ajustar al ancho"
            title="Ajustar al ancho"
            className="p-1.5 text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
          >
            <MoveHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={fitPage}
            aria-label="Ajustar página completa"
            title="Ajustar página completa"
            className="p-1.5 text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
          >
            <Maximize className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-border-subtle mx-1" />

          <button
            type="button"
            onClick={() => {
              setShowSearch((v) => {
                const next = !v;
                if (next) setTimeout(() => searchInputRef.current?.focus(), 30);
                else setSearchQuery('');
                return next;
              });
            }}
            aria-label="Buscar en PDF"
            aria-pressed={showSearch}
            title="Buscar texto en el PDF"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showSearch
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de búsqueda en PDF */}
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border-subtle bg-surface/95 z-10 shrink-0">
          <Search className="w-3.5 h-3.5 text-ink-muted shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleStepMatch(e.shiftKey ? -1 : 1);
              } else if (e.key === 'Escape') {
                setShowSearch(false);
                setSearchQuery('');
              }
            }}
            placeholder="Buscar texto en el PDF..."
            aria-label="Buscar texto en el PDF"
            className="flex-1 bg-transparent text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none"
          />
          {searchQuery && (
            <span className="text-[11px] text-ink-muted tabular-nums shrink-0">
              {isSearching
                ? 'Buscando...'
                : matchingPages.length > 0
                ? `${matchCursor + 1}/${matchingPages.length} pág.`
                : '0 resultados'}
            </span>
          )}
          <button
            type="button"
            disabled={matchingPages.length === 0}
            onClick={() => handleStepMatch(-1)}
            aria-label="Resultado anterior"
            className="p-1 rounded text-ink-secondary hover:text-ink-primary disabled:opacity-35 cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={matchingPages.length === 0}
            onClick={() => handleStepMatch(1)}
            aria-label="Siguiente resultado"
            className="p-1 rounded text-ink-secondary hover:text-ink-primary disabled:opacity-35 cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            aria-label="Cerrar búsqueda"
            className="p-1 rounded text-ink-muted hover:text-ink-primary cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contenedor con scroll para las páginas */}
      <div
        ref={setScrollRoot}
        className="flex-1 overflow-auto p-6 sm:p-8 text-center"
      >
        <div className="inline-block text-left min-h-full min-w-max">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center text-ink-secondary gap-3 mt-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-sm">Cargando documento...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center text-red-500 dark:text-red-400 mt-20 text-sm">
                <p>Error al cargar el PDF.</p>
              </div>
            }
            className="flex flex-col items-center gap-6"
          >
            {numPages &&
              Array.from({ length: numPages }, (_, index) => (
                <VirtualizedPdfPage
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  scale={scale}
                  isVisible={visiblePages.has(index + 1)}
                  registerPageEl={registerPageEl}
                  onFirstPageMeasured={setFirstPageBaseSize}
                  searchQuery={searchQuery}
                />
              ))}
          </Document>
        </div>
      </div>
    </div>
  );
});

export default CustomPdfViewer;
