'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Tldraw,
  useEditor,
  getSnapshot,
  loadSnapshot,
  useValue,
  AssetRecordType,
  type Editor,
} from 'tldraw';
import { getAssetUrls } from '@tldraw/assets/selfHosted';
import 'tldraw/tldraw.css';
import {
  Bot,
  Loader2,
  Grid3X3,
  Moon,
  Sun,
  Eraser,
  PenTool,
  FileUp,
  GripHorizontal,
  Trash2,
  ImageDown,
  FileCode2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/useEditorStore';
import { useLemaStore } from '@/store/useLemaStore';
import { triggerBlobDownload } from '@/lib/base64';
import PdfPagePickerModal from './PdfPagePickerModal';

const TLDRAW_ASSET_URLS = getAssetUrls({ baseUrl: '/tldraw-assets' });

interface WhiteboardEditorProps {
  initialData: string | null;
  onChange: (data: string) => void;
  onScanToLatex: (imageBlob: Blob) => void;
  onScanToTikz?: (imageBlob: Blob) => void;
  isScanning: boolean;
  registerFlushSnapshot?: (fn: (() => string | null) | null) => void;
}

function ScanOverlay({ bounds }: { bounds: { x: number; y: number; w: number; h: number } }) {
  const editor = useEditor();
  const camera = useValue('camera', () => editor.getCamera(), [editor]);

  return (
    <div
      className="absolute z-40 pointer-events-none border-2 border-indigo-500 bg-indigo-500/10 rounded-lg flex items-center justify-center backdrop-blur-[1px] transition-all"
      style={{
        left: bounds.x * camera.z + camera.x,
        top: bounds.y * camera.z + camera.y,
        width: bounds.w * camera.z,
        height: bounds.h * camera.z,
      }}
    >
      <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        IA Procesando Área...
      </div>
    </div>
  );
}

function CustomUI({
  onScanToLatex,
  onScanToTikz,
  isScanning,
}: {
  onScanToLatex: (blob: Blob) => void;
  onScanToTikz?: (blob: Blob) => void;
  isScanning: boolean;
}) {
  const editor = useEditor();
  const showToast = useEditorStore((s) => s.showToast);
  const [scanFeedback, setScanFeedback] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [importingStatus, setImportingStatus] = useState<string | null>(null);
  const [pendingPdf, setPendingPdf] = useState<{ pdf: any; fileName: string } | null>(null);
  const pendingPdfRef = useRef<{ pdf: any; fileName: string } | null>(null);

  useEffect(() => {
    pendingPdfRef.current = pendingPdf;
  }, [pendingPdf]);

  useEffect(() => {
    return () => {
      if (pendingPdfRef.current?.pdf) {
        void pendingPdfRef.current.pdf.destroy().catch(() => {});
      }
    };
  }, []);

  const handleScan = async () => {
    if (isScanning) return;

    let shapeIds = Array.from(editor.getSelectedShapeIds());
    const isSelection = shapeIds.length > 0;

    if (!isSelection) {
      shapeIds = Array.from(editor.getCurrentPageShapeIds());
    }

    if (shapeIds.length === 0) {
      showToast('No hay nada dibujado para escanear.', 'info');
      return;
    }

    try {
      let feedbackBounds: { x: number; y: number; w: number; h: number } | null = null;
      if (isSelection) {
        const b = editor.getSelectionPageBounds();
        if (b) {
          feedbackBounds = { x: b.minX, y: b.minY, w: b.w, h: b.h };
        }
      } else {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const id of shapeIds) {
          const b = editor.getShapePageBounds(id);
          if (!b) continue;
          if (b.minX < minX) minX = b.minX;
          if (b.minY < minY) minY = b.minY;
          if (b.maxX > maxX) maxX = b.maxX;
          if (b.maxY > maxY) maxY = b.maxY;
        }
        if (
          Number.isFinite(minX) &&
          Number.isFinite(minY) &&
          Number.isFinite(maxX) &&
          Number.isFinite(maxY)
        ) {
          feedbackBounds = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
        } else {
          const vp = editor.getViewportPageBounds();
          feedbackBounds = { x: vp.minX, y: vp.minY, w: vp.w, h: vp.h };
        }
      }

      if (feedbackBounds) {
        setScanFeedback(feedbackBounds);
      }
    } catch {
      console.warn('Could not calculate bounds for feedback');
    }

    try {
      const { blob } = await editor.toImage(shapeIds, {
        format: 'png',
        background: true,
        padding: 32,
      });

      await onScanToLatex(blob);
    } catch (e) {
      console.error('Error al exportar:', e);
      showToast('Error al capturar el pizarrón.', 'error');
    } finally {
      setScanFeedback(null);
    }
  };

  const handleScanTikz = async () => {
    if (isScanning) return;

    const shapeIds = Array.from(editor.getSelectedShapeIds());
    if (shapeIds.length === 0) {
      showToast('Selecciona primero el dibujo o diagrama que deseas convertir a TikZ.', 'info');
      return;
    }

    try {
      const b = editor.getSelectionPageBounds();
      if (b) {
        setScanFeedback({ x: b.minX, y: b.minY, w: b.w, h: b.h });
      }
    } catch {}

    try {
      const { blob } = await editor.toImage(shapeIds, {
        format: 'png',
        background: true,
        padding: 32,
      });

      if (onScanToTikz) {
        await onScanToTikz(blob);
      }
    } catch (e) {
      console.error('Error al exportar a TikZ:', e);
      showToast('Error al capturar el dibujo para TikZ.', 'error');
    } finally {
      setScanFeedback(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (!dataUrl) return;

          const img = new Image();
          img.onload = () => {
            const assetId = AssetRecordType.createId();
            editor.createAssets([
              {
                id: assetId,
                type: 'image',
                typeName: 'asset',
                props: {
                  name: file.name,
                  src: dataUrl,
                  w: img.width,
                  h: img.height,
                  mimeType: file.type,
                  isAnimated: false,
                },
                meta: {},
              },
            ]);

            const initialX = editor.getViewportPageBounds().center.x;
            const initialY = editor.getViewportPageBounds().center.y;

            editor.createShape({
              type: 'image',
              x: initialX - img.width / 2,
              y: initialY - img.height / 2,
              isLocked: false,
              props: {
                assetId,
                w: img.width,
                h: img.height,
              },
            });
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('Error cargando imagen:', err);
        showToast('Error al procesar la imagen.', 'error');
      } finally {
        e.target.value = '';
      }
    } else if (file.type === 'application/pdf') {
      let openedPdf: any = null;
      try {
        setImportingStatus('Abriendo PDF...');
        const { pdfjs } = await import('react-pdf');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const arrayBuffer = await file.arrayBuffer();
        openedPdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        setPendingPdf({ pdf: openedPdf, fileName: file.name });
        openedPdf = null;
      } catch (err) {
        console.error('Error abriendo PDF:', err);
        showToast('Error al abrir el PDF.', 'error');
        if (openedPdf) {
          await openedPdf.destroy().catch(() => {});
        }
      } finally {
        setImportingStatus(null);
        e.target.value = '';
      }
    } else {
      e.target.value = '';
    }
  };

  const handleCancelPdf = useCallback(async () => {
    const current = pendingPdf;
    setPendingPdf(null);
    if (current?.pdf) {
      await current.pdf.destroy().catch(() => {});
    }
  }, [pendingPdf]);

  const handleConfirmPdf = useCallback(
    async (pages: number[], scale: number) => {
      const current = pendingPdf;
      if (!current?.pdf || pages.length === 0) return;
      setPendingPdf(null);

      try {
        let currentY = 0;
        const viewportBounds = editor.getViewportPageBounds();
        const initialX = viewportBounds.center.x;
        const initialY = viewportBounds.center.y;

        for (let idx = 0; idx < pages.length; idx++) {
          const pageNum = pages[idx];
          setImportingStatus(`Importando ${idx + 1}/${pages.length}...`);
          let page: any = null;
          let canvas: HTMLCanvasElement | null = null;
          try {
            page = await current.pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = Math.max(1, Math.floor(viewport.height));
            canvas.width = Math.max(1, Math.floor(viewport.width));

            await page.render({ canvasContext: context, viewport, canvas }).promise;

            let mimeType = 'image/webp';
            let dataUrl = canvas.toDataURL('image/webp', 0.82);
            if (!dataUrl.startsWith('data:image/webp')) {
              mimeType = 'image/png';
              dataUrl = canvas.toDataURL('image/png');
            }

            const cw = canvas.width;
            const ch = canvas.height;
            canvas.width = 0;
            canvas.height = 0;

            const assetId = AssetRecordType.createId();
            editor.createAssets([
              {
                id: assetId,
                type: 'image',
                typeName: 'asset',
                props: {
                  name: `${current.fileName} - Pág ${pageNum}`,
                  src: dataUrl,
                  w: cw,
                  h: ch,
                  mimeType,
                  isAnimated: false,
                },
                meta: {},
              },
            ]);

            const w = cw / scale;
            const h = ch / scale;
            if (idx === 0) {
              currentY = initialY - h / 2;
            }

            editor.createShape({
              type: 'image',
              x: initialX - w / 2,
              y: currentY,
              isLocked: true,
              props: {
                assetId,
                w,
                h,
              },
            });

            currentY += h + 20;
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

        showToast(
          `${pages.length} página${pages.length === 1 ? '' : 's'} importada${pages.length === 1 ? '' : 's'} al pizarrón.`,
          'success',
          2500
        );
      } catch (err) {
        console.error('Error importando páginas del PDF:', err);
        showToast('Error al procesar las páginas del PDF.', 'error');
      } finally {
        await current.pdf.destroy().catch(() => {});
        setImportingStatus(null);
      }
    },
    [editor, pendingPdf, showToast]
  );

  // Track reactive tldraw UI state
  const isDarkMode = useValue('isDarkMode', () => editor.user.getIsDarkMode(), [editor]);
  const isGridMode = useValue('isGridMode', () => editor.getInstanceState().isGridMode, [editor]);
  const currentTool = useValue('currentTool', () => editor.getCurrentToolId(), [editor]);
  const selectedCount = useValue('selectedCount', () => editor.getSelectedShapeIds().length, [editor]);

  const toggleDarkMode = () => {
    editor.user.updateUserPreferences({ colorScheme: isDarkMode ? 'light' : 'dark' });
  };

  const toggleGridMode = () => {
    editor.updateInstanceState({ isGridMode: !isGridMode });
  };

  const setEraser = () => {
    editor.setCurrentTool('eraser');
  };

  const setPen = () => {
    editor.setCurrentTool('draw');
  };

  const handleDeleteSelection = () => {
    const ids = editor.getSelectedShapeIds();
    if (ids.length === 0) return;
    editor.deleteShapes(ids);
  };

  const handleExportImage = async (format: 'png' | 'svg') => {
    let shapeIds = Array.from(editor.getSelectedShapeIds());
    if (shapeIds.length === 0) {
      shapeIds = Array.from(editor.getCurrentPageShapeIds());
    }
    if (shapeIds.length === 0) {
      showToast('No hay trazos ni figuras para exportar.', 'info');
      return;
    }

    try {
      const { blob } = await editor.toImage(shapeIds, {
        format,
        background: true,
        padding: 32,
      });
      triggerBlobDownload(blob, `pizarra.${format}`);
      showToast(`Pizarra exportada como ${format.toUpperCase()}.`, 'success', 2000);
    } catch (err) {
      console.error(`Error al exportar ${format}:`, err);
      showToast(`No se pudo exportar como ${format.toUpperCase()}.`, 'error');
    }
  };

  return (
    <>
      {isScanning && scanFeedback && <ScanOverlay bounds={scanFeedback} />}

      {/* Top Center Toolbar Group - Draggable */}
      <motion.div
        drag
        dragMomentum={false}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex flex-wrap justify-center gap-2 pointer-events-auto items-center max-w-[95vw]"
      >
        <div
          title="Arrastrar barra de herramientas"
          aria-label="Arrastrar barra de herramientas"
          className="bg-surface/95 backdrop-blur-md p-2 rounded-xl border border-border-subtle shadow-lg flex items-center text-ink-muted hover:text-ink-primary transition-colors cursor-move touch-none"
        >
          <GripHorizontal className="w-4 h-4" />
        </div>

        {/* Main AI Button (Full Page or Selection) */}
        <button
          type="button"
          onClick={handleScan}
          disabled={isScanning}
          aria-label="Escanear trazos a bloques LaTeX"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg font-medium text-xs sm:text-sm transition-all shadow-indigo-500/20 disabled:opacity-50 border border-indigo-400/30 whitespace-nowrap cursor-pointer"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          <span>{isScanning ? 'Enviando...' : 'Escanear OCR'}</span>
        </button>

        {/* TikZ Scan Button */}
        <button
          type="button"
          onClick={handleScanTikz}
          disabled={isScanning}
          aria-label="Convertir selección a TikZ"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white rounded-xl shadow-lg font-medium text-xs sm:text-sm transition-all shadow-emerald-500/20 disabled:opacity-50 border border-emerald-400/30 whitespace-nowrap cursor-pointer"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          <span>{isScanning ? 'Enviando...' : 'Selección a TikZ'}</span>
        </button>

        {/* PDF / Image Import Button */}
        <label
          className={`flex items-center justify-center px-3 py-2 bg-surface/95 hover:bg-surface-subtle text-ink-primary rounded-xl shadow-lg font-medium text-xs sm:text-sm transition-all border border-border-subtle cursor-pointer whitespace-nowrap shrink-0 backdrop-blur-md ${
            importingStatus ? 'opacity-70 pointer-events-none' : ''
          }`}
        >
          {importingStatus ? (
            <Loader2 className="w-4 h-4 mr-1.5 text-emerald-500 animate-spin" />
          ) : (
            <FileUp className="w-4 h-4 mr-1.5 text-emerald-500" />
          )}
          <span>{importingStatus || 'Cargar PDF / Img'}</span>
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={Boolean(importingStatus)}
          />
        </label>

        {/* Utilities Toolbar */}
        <div className="flex gap-1 bg-surface/95 backdrop-blur-md p-1 rounded-xl border border-border-subtle shadow-lg relative items-center">
          <button
            type="button"
            onClick={setPen}
            title="Lápiz de dibujo"
            aria-label="Lápiz de dibujo"
            aria-pressed={currentTool === 'draw'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              currentTool === 'draw'
                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                : 'hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={setEraser}
            title="Borrador"
            aria-label="Borrador"
            aria-pressed={currentTool === 'eraser'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              currentTool === 'eraser'
                ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                : 'hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Eraser className="w-4 h-4" />
          </button>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelection}
              title={`Borrar selección (${selectedCount})`}
              aria-label={`Borrar selección (${selectedCount})`}
              className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-5 bg-border-subtle my-auto mx-0.5" />

          <button
            type="button"
            onClick={toggleGridMode}
            title="Cuadrícula"
            aria-label="Alternar cuadrícula"
            aria-pressed={isGridMode}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isGridMode
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                : 'hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Lienzo en modo claro' : 'Lienzo en modo oscuro'}
            aria-label={isDarkMode ? 'Cambiar lienzo a modo claro' : 'Cambiar lienzo a modo oscuro'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-surface-subtle text-amber-400 hover:text-amber-300'
                : 'hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="w-px h-5 bg-border-subtle my-auto mx-0.5" />

          <button
            type="button"
            onClick={() => void handleExportImage('png')}
            title="Exportar pizarrón como PNG"
            aria-label="Exportar como PNG"
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
          >
            <ImageDown className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>

          <button
            type="button"
            onClick={() => void handleExportImage('svg')}
            title="Exportar pizarrón como SVG"
            aria-label="Exportar como SVG"
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>SVG</span>
          </button>
        </div>
      </motion.div>

      {pendingPdf && (
        <PdfPagePickerModal
          pdf={pendingPdf.pdf}
          fileName={pendingPdf.fileName}
          onConfirm={(pages, scale) => void handleConfirmPdf(pages, scale)}
          onCancel={() => void handleCancelPdf()}
        />
      )}
    </>
  );
}

export default function WhiteboardEditor({
  initialData,
  onChange,
  onScanToLatex,
  onScanToTikz,
  isScanning,
  registerFlushSnapshot,
}: WhiteboardEditorProps) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const resolvedTheme = useLemaStore((s) => s.resolvedTheme);

  const editorRef = useRef<Editor | null>(null);
  const hasPendingChangeRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleCallbackRef = useRef<number | null>(null);
  const cleanupListenerRef = useRef<(() => void) | null>(null);

  const flushSnapshot = useCallback((): string | null => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (idleCallbackRef.current !== null && typeof cancelIdleCallback !== 'undefined') {
      cancelIdleCallback(idleCallbackRef.current);
      idleCallbackRef.current = null;
    }

    const editor = editorRef.current;
    if (!editor) return null;

    try {
      const snapshot = getSnapshot(editor.store);
      const serialized = JSON.stringify(snapshot);
      hasPendingChangeRef.current = false;
      onChangeRef.current(serialized);
      return serialized;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    registerFlushSnapshot?.(flushSnapshot);
    return () => {
      registerFlushSnapshot?.(null);
    };
  }, [registerFlushSnapshot, flushSnapshot]);

  // Keep tldraw canvas theme aligned when user switches global app theme
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      editor.user.updateUserPreferences({ colorScheme: resolvedTheme });
    } catch {}
  }, [resolvedTheme]);

  // Flush any pending stroke synchronously before detaching listeners on unmount
  useEffect(() => {
    return () => {
      if (
        hasPendingChangeRef.current ||
        debounceTimerRef.current !== null ||
        idleCallbackRef.current !== null
      ) {
        flushSnapshot();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (idleCallbackRef.current !== null && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleCallbackRef.current);
        idleCallbackRef.current = null;
      }
      if (cleanupListenerRef.current) {
        cleanupListenerRef.current();
        cleanupListenerRef.current = null;
      }
      editorRef.current = null;
    };
  }, [flushSnapshot]);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      if (initialData) {
        try {
          const parsed = JSON.parse(initialData);
          loadSnapshot(editor.store, parsed);
        } catch (e) {
          console.error('Failed to parse initial whiteboard data', e);
        }
      }

      try {
        editor.user.updateUserPreferences({
          colorScheme: useLemaStore.getState().resolvedTheme,
        });
      } catch {}

      if (cleanupListenerRef.current) {
        cleanupListenerRef.current();
      }

      const unlisten = editor.store.listen(
        () => {
          hasPendingChangeRef.current = true;
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          if (idleCallbackRef.current !== null && typeof cancelIdleCallback !== 'undefined') {
            cancelIdleCallback(idleCallbackRef.current);
            idleCallbackRef.current = null;
          }
          debounceTimerRef.current = setTimeout(() => {
            debounceTimerRef.current = null;
            if (typeof requestIdleCallback !== 'undefined') {
              idleCallbackRef.current = requestIdleCallback(
                () => {
                  idleCallbackRef.current = null;
                  flushSnapshot();
                },
                { timeout: 1000 }
              );
            } else {
              flushSnapshot();
            }
          }, 800);
        },
        { source: 'user', scope: 'document' }
      );

      cleanupListenerRef.current = unlisten;
    },
    [initialData, flushSnapshot]
  );

  return (
    <div className="w-full h-full relative bg-canvas">
      <Tldraw
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
        assetUrls={TLDRAW_ASSET_URLS}
        onMount={handleMount}
      >
        <CustomUI
          onScanToLatex={onScanToLatex}
          onScanToTikz={onScanToTikz}
          isScanning={isScanning}
        />
      </Tldraw>
    </div>
  );
}
