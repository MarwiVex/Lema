'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, Check, FileText, Loader2, Sparkles } from 'lucide-react';

export interface PdfPagePickerModalProps {
  pdf: any; // pdfjs PDFDocumentProxy
  fileName: string;
  onConfirm: (pages: number[], scale: number) => void;
  onCancel: () => void;
}

const AUTO_PREVIEW_CAP = 40;

export function parsePageRange(input: string, numPages: number): number[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const result = new Set<number>();
  const parts = trimmed.split(',');
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const a = Math.max(1, Math.min(numPages, parseInt(rangeMatch[1], 10)));
      const b = Math.max(1, Math.min(numPages, parseInt(rangeMatch[2], 10)));
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      for (let p = start; p <= end; p++) result.add(p);
    } else if (/^\d+$/.test(part)) {
      const p = parseInt(part, 10);
      if (p >= 1 && p <= numPages) result.add(p);
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

export default function PdfPagePickerModal({
  pdf,
  fileName,
  onConfirm,
  onCancel,
}: PdfPagePickerModalProps) {
  const numPages: number = pdf?.numPages ?? 0;

  const [selectedPages, setSelectedPages] = useState<Set<number>>(() => {
    const initialCount = Math.min(numPages, 5);
    const set = new Set<number>();
    for (let i = 1; i <= initialCount; i++) set.add(i);
    return set;
  });

  const [scale, setScale] = useState<number>(1.5);
  const [rangeInput, setRangeInput] = useState<string>(() =>
    numPages > 0 ? (numPages <= 5 ? `1-${numPages}` : '1-5') : ''
  );
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [previewLimit, setPreviewLimit] = useState<number>(() =>
    Math.min(numPages, AUTO_PREVIEW_CAP)
  );
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const thumbnailsRef = useRef<Record<number, string>>({});
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    thumbnailsRef.current = thumbnails;
  }, [thumbnails]);

  // Lock background body scroll and focus modal control on mount
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  // Sequential lazy thumbnail rendering up to previewLimit
  useEffect(() => {
    if (!pdf || numPages <= 0) return;
    let cancelled = false;
    const limit = Math.min(numPages, previewLimit);

    (async () => {
      for (let p = 1; p <= limit; p++) {
        if (cancelled) break;
        if (thumbnailsRef.current[p]) continue;

        let page: any = null;
        let canvas: HTMLCanvasElement | null = null;
        try {
          page = await pdf.getPage(p);
          if (cancelled) break;
          const viewport = page.getViewport({ scale: 0.32 });
          canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;
            if (!cancelled) {
              let dataUrl = canvas.toDataURL('image/webp', 0.7);
              if (!dataUrl.startsWith('data:image/webp')) {
                dataUrl = canvas.toDataURL('image/png');
              }
              setThumbnails((prev) => (prev[p] ? prev : { ...prev, [p]: dataUrl }));
            }
          }
        } catch {
          // Ignore thumbnail errors for individual pages
        } finally {
          try {
            page?.cleanup?.();
          } catch {}
          if (canvas) {
            canvas.width = 0;
            canvas.height = 0;
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdf, numPages, previewLimit]);

  const togglePage = useCallback((pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const all = new Set<number>();
    for (let i = 1; i <= numPages; i++) all.add(i);
    setSelectedPages(all);
    setRangeError(null);
  }, [numPages]);

  const selectNone = useCallback(() => {
    setSelectedPages(new Set());
    setRangeError(null);
  }, []);

  const applyRange = useCallback(() => {
    const parsed = parsePageRange(rangeInput, numPages);
    if (parsed.length === 0) {
      setRangeError(`Rango inválido. Usa números entre 1 y ${numPages} (ej. 1-5, 8).`);
      return;
    }
    setRangeError(null);
    setSelectedPages(new Set(parsed));
  }, [rangeInput, numPages]);

  const sortedSelected = useMemo(
    () => Array.from(selectedPages).sort((a, b) => a - b),
    [selectedPages]
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: numPages }, (_, idx) => idx + 1),
    [numPages]
  );

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-picker-title"
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-surface border border-border-subtle shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle bg-surface-elevated">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="pdf-picker-title"
                className="text-sm font-semibold text-ink-primary truncate"
              >
                Importar páginas de PDF
              </h2>
              <p className="text-xs text-ink-muted truncate">
                {fileName} · {numPages} página{numPages === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            aria-label="Cerrar selector de páginas"
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => {
                  setRangeInput(e.target.value);
                  if (rangeError) setRangeError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyRange();
                  }
                }}
                placeholder="ej. 1-5, 8, 10-12"
                aria-label="Rango rápido de páginas"
                className="w-36 sm:w-44 px-2.5 py-1.5 text-xs rounded-lg bg-surface border border-border-subtle text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={applyRange}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border-subtle hover:bg-surface-subtle text-ink-primary transition-colors cursor-pointer"
              >
                Aplicar rango
              </button>
            </div>

            <div className="h-4 w-px bg-border-subtle hidden sm:block" />

            <button
              type="button"
              onClick={selectAll}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border-subtle hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              Todas
            </button>
            <button
              type="button"
              onClick={selectNone}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border-subtle hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              Ninguna
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="pdf-scale-select" className="text-xs text-ink-secondary">
              Calidad:
            </label>
            <select
              id="pdf-scale-select"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-surface border border-border-subtle text-ink-primary focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value={1.5}>Estándar — Ligero (1.5x)</option>
              <option value={2.0}>Alta — Detalle (2.0x)</option>
            </select>
          </div>
        </div>

        {rangeError && (
          <div className="px-5 py-2 bg-red-500/10 border-b border-red-500/20 text-xs text-red-600 dark:text-red-400">
            {rangeError}
          </div>
        )}

        {/* Grid of pages */}
        <div className="p-5 overflow-y-auto max-h-[52vh] bg-canvas/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pageNumbers.map((pageNum) => {
              const isSelected = selectedPages.has(pageNum);
              const thumb = thumbnails[pageNum];
              const isBeyondCap = pageNum > previewLimit;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => togglePage(pageNum)}
                  aria-pressed={isSelected}
                  aria-label={`Página ${pageNum}${isSelected ? ' seleccionada' : ''}`}
                  className={`group relative flex flex-col rounded-xl border p-2 text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-sm ring-1 ring-cyan-500/40'
                      : 'border-border-subtle bg-surface hover:border-border-strong hover:bg-surface-subtle/50'
                  }`}
                >
                  <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-subtle border border-border-subtle/70 flex items-center justify-center">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={`Miniatura página ${pageNum}`}
                        className="w-full h-full object-contain bg-white"
                        loading="lazy"
                      />
                    ) : isBeyondCap ? (
                      <div className="flex flex-col items-center justify-center gap-1 text-ink-muted px-2 text-center">
                        <FileText className="w-5 h-5 opacity-60" />
                        <span className="text-[11px] font-medium">Pág. {pageNum}</span>
                      </div>
                    ) : (
                      <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
                    )}

                    {/* Checkbox badge */}
                    <span
                      className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-500 text-white'
                          : 'bg-surface/90 border-border-strong text-transparent group-hover:border-cyan-500/60'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between px-0.5">
                    <span
                      className={`text-xs font-medium ${
                        isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-ink-secondary'
                      }`}
                    >
                      Página {pageNum}
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      {isSelected ? 'Incluida' : 'Omitir'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {numPages > previewLimit && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setPreviewLimit((prev) => Math.min(numPages, prev + AUTO_PREVIEW_CAP))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-subtle bg-surface hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                Cargar miniaturas ({previewLimit + 1}–{Math.min(numPages, previewLimit + AUTO_PREVIEW_CAP)} de {numPages})
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border-subtle bg-surface-elevated flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-ink-secondary">
            <strong className="text-ink-primary font-semibold">{sortedSelected.length}</strong> de{' '}
            {numPages} páginas seleccionadas
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border border-border-subtle bg-surface hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={sortedSelected.length === 0}
              onClick={() => onConfirm(sortedSelected, scale)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
            >
              Importar {sortedSelected.length} página{sortedSelected.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
