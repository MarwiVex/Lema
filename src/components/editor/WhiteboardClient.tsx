'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Block, PartialBlock } from '@blocknote/core';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
  usePanelRef,
} from 'react-resizable-panels';
import { exportToLatex, LatexOptions } from '@/lib/exportToLatex';
import { useEditorStore } from '@/store/useEditorStore';
import { useLemaStore } from '@/store/useLemaStore';
import {
  BookOpen,
  FileCode,
  Eye,
  PenTool,
  ChevronLeft,
  X,
  Save,
  Copy,
  PanelRightClose,
  PanelRightOpen,
  FileText,
  AlertTriangle,
  Download,
  Pencil,
  Check,
  History,
  RotateCcw,
  Terminal,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useLatexWasm } from './useLatexWasm';
import { PdfErrorBoundary } from './PdfErrorBoundary';
import { EditorErrorBoundary } from '@/components/ui/EditorErrorBoundary';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { parseLatexLog } from '@/lib/latexLogParser';
import { base64ToBlob, triggerBlobDownload } from '@/lib/base64';
import {
  saveLocalDraft,
  getLocalDraft,
  clearLocalDraft,
  saveVersionSnapshot,
  listVersionSnapshots,
  type VersionSnapshotRecord,
} from '@/lib/localDrafts';

const CustomPdfViewer = dynamic(() => import('@/components/editor/CustomPdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-ink-muted text-xs">
      Cargando visor PDF...
    </div>
  ),
});

const WhiteboardEditor = dynamic(() => import('@/components/editor/WhiteboardEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-canvas">
      <div className="flex items-center space-x-3 text-cyan-600 dark:text-cyan-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <span className="text-sm font-medium">Inicializando Pizarrón...</span>
      </div>
    </div>
  ),
});

const BlockEditor = dynamic(() => import('@/components/editor/BlockEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-xl bg-surface border border-border-subtle">
      <div className="flex items-center space-x-3 text-cyan-600 dark:text-cyan-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <span className="text-sm font-medium">Inicializando Editor...</span>
      </div>
    </div>
  ),
});

interface WhiteboardClientProps {
  documentId: string;
  title: string;
  initialWhiteboardData: string | null;
  initialContent: PartialBlock[] | undefined;
}

interface WhiteboardLocalDraft {
  whiteboardData?: string | null;
  blocks?: PartialBlock[];
}

type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error';

function formatSavedAgo(savedAt: number | null, nowTick: number): string {
  if (!savedAt) return '';
  const secs = Math.max(0, Math.floor((nowTick - savedAt) / 1000));
  if (secs < 5) return 'Guardado justo ahora';
  if (secs < 60) return `Guardado hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  return `Guardado hace ${mins} min`;
}

export default function WhiteboardClient({
  documentId,
  title: initialTitle,
  initialWhiteboardData,
  initialContent: initialPropContent,
}: WhiteboardClientProps) {
  const router = useRouter();
  const showToast = useEditorStore((s) => s.showToast);
  const setConfirmAction = useLemaStore((s) => s.setConfirmAction);
  const { compile: compileWasm, status: wasmStatus } = useLatexWasm();

  // Editable title
  const [docTitle, setDocTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(initialTitle);

  // Content & Whiteboard state
  const [wbInitialDataState, setWbInitialDataState] = useState<string | null>(initialWhiteboardData);
  const [wbResetKey, setWbResetKey] = useState(0);
  const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined>(
    initialPropContent
  );
  const [hasBlocks, setHasBlocks] = useState((initialPropContent?.length ?? 0) > 0);
  const [latexCode, setLatexCode] = useState('');

  // Layout & panel state
  const [isMobile, setIsMobile] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [hasMountedNotesPanel, setHasMountedNotesPanel] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'latex' | 'preview'>('editor');
  const [insertBlocksAction, setInsertBlocksAction] = useState<{
    blocks: PartialBlock[];
    timestamp: number;
  } | null>(null);
  const [replaceBlocksAction, setReplaceBlocksAction] = useState<{
    blocks: PartialBlock[];
    timestamp: number;
  } | null>(null);

  // Save, local draft recovery & snapshots
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const [recoverableDraft, setRecoverableDraft] = useState<{
    payload: WhiteboardLocalDraft;
    updatedAt: number;
  } | null>(null);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshots, setSnapshots] = useState<VersionSnapshotRecord<PartialBlock[]>[]>([]);

  // PDF compilation state
  const [latexOptions] = useState<LatexOptions>({ columns: 1 });
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [compilationLog, setCompilationLog] = useState('');
  const [showLogPanel, setShowLogPanel] = useState(false);

  const isWasmBusy = wasmStatus === 'initializing' || wasmStatus === 'compiling';
  const isAnyCompilingPdf = isCompilingPdf || isWasmBusy;
  const diagnostics = useMemo(() => parseLatexLog(compilationLog), [compilationLog]);

  const draftKey = `wb:${documentId}`;
  const snapshotDocKey = `wb:${documentId}`;

  // Refs to prevent re-renders on every stroke/keystroke
  const whiteboardDataRef = useRef<string | null>(initialWhiteboardData);
  const blocksRef = useRef<Block[]>((initialPropContent as unknown as Block[]) ?? []);
  const wbDirtyVersionRef = useRef(0);
  const wbSavedVersionRef = useRef(0);
  const blocksDirtyVersionRef = useRef(0);
  const blocksSavedVersionRef = useRef(0);

  const isSavingRef = useRef(false);
  const inFlightPromiseRef = useRef<Promise<boolean> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushSnapshotRef = useRef<(() => string | null) | null>(null);
  const abortControllersRef = useRef<Set<AbortController>>(new Set());
  const showNotesPanelRef = useRef(showNotesPanel);
  const notesPanelRef = usePanelRef();

  useEffect(() => {
    showNotesPanelRef.current = showNotesPanel;
  }, [showNotesPanel]);

  const hasUnsavedChanges =
    saveStatus === 'dirty' || saveStatus === 'saving' || saveStatus === 'error';

  const hasAnyPendingChanges = () =>
    wbDirtyVersionRef.current > wbSavedVersionRef.current ||
    blocksDirtyVersionRef.current > blocksSavedVersionRef.current;

  // Responsive viewport detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Keep desktop resizable notes panel in sync with showNotesPanel
  useEffect(() => {
    if (isMobile) return;
    const panel = notesPanelRef.current;
    if (!panel) return;
    if (showNotesPanel) {
      if (panel.isCollapsed()) {
        panel.expand();
      }
      if (panel.getSize().asPercentage < 20) {
        panel.resize('45%');
      }
    } else if (!panel.isCollapsed()) {
      panel.collapse();
    }
  }, [showNotesPanel, isMobile, notesPanelRef]);

  // Relative save time ticker
  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  // Check IndexedDB for unsynced local draft on mount
  useEffect(() => {
    let mounted = true;
    void getLocalDraft<WhiteboardLocalDraft>(draftKey).then((draft) => {
      if (!mounted || !draft?.payload) return;
      const wbChanged =
        draft.payload.whiteboardData !== undefined &&
        draft.payload.whiteboardData !== initialWhiteboardData;
      const blocksChanged =
        draft.payload.blocks !== undefined &&
        JSON.stringify(draft.payload.blocks) !== JSON.stringify(initialPropContent ?? []);
      if (wbChanged || blocksChanged) {
        setRecoverableDraft({ payload: draft.payload, updatedAt: draft.updatedAt });
      }
    });
    return () => {
      mounted = false;
    };
  }, [draftKey, initialWhiteboardData, initialPropContent]);

  // Compute LaTeX when the LaTeX tab inside the notes panel is visible
  useEffect(() => {
    if (!showNotesPanel || activeTab !== 'latex' || blocksRef.current.length === 0) return;
    setLatexCode(exportToLatex(blocksRef.current, { ...latexOptions, title: docTitle }));
  }, [showNotesPanel, activeTab, latexOptions, docTitle]);

  useEffect(() => {
    if (showNotesPanel) setHasMountedNotesPanel(true);
  }, [showNotesPanel]);

  // Abort pending timers and AI requests on unmount
  useEffect(() => {
    const controllers = abortControllersRef.current;
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      controllers.forEach((ctrl) => ctrl.abort());
      controllers.clear();
    };
  }, []);

  const syncFlushSnapshotBeforeSave = useCallback(() => {
    const latestSnapshot = flushSnapshotRef.current?.();
    if (
      latestSnapshot !== null &&
      latestSnapshot !== undefined &&
      latestSnapshot !== whiteboardDataRef.current
    ) {
      whiteboardDataRef.current = latestSnapshot;
      wbDirtyVersionRef.current += 1;
    }
  }, []);

  const performSave = useCallback(
    async ({ isAutoSave = false, keepalive = false } = {}): Promise<boolean> => {
      if (!hasAnyPendingChanges()) return true;
      if (isSavingRef.current && inFlightPromiseRef.current) {
        return inFlightPromiseRef.current;
      }

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      const targetWbVersion = wbDirtyVersionRef.current;
      const targetBlocksVersion = blocksDirtyVersionRef.current;

      const payload: Record<string, any> = { id: documentId };
      if (targetWbVersion > wbSavedVersionRef.current) {
        payload.whiteboardData = whiteboardDataRef.current;
      }
      if (targetBlocksVersion > blocksSavedVersionRef.current) {
        payload.content = JSON.stringify(blocksRef.current);
      }

      if (payload.whiteboardData === undefined && payload.content === undefined) {
        return true;
      }

      const bodyStr = JSON.stringify(payload);
      const canKeepAlive = bodyStr.length < 60_000;
      const pendingBackupKey = `lema_wb_pending_${documentId}`;

      if (keepalive && !canKeepAlive) {
        void saveLocalDraft(draftKey, {
          whiteboardData: whiteboardDataRef.current,
          blocks: blocksRef.current as unknown as PartialBlock[],
        });
      }

      const run = (async () => {
        isSavingRef.current = true;
        setSaveStatus('saving');
        let shouldRetryFollowUp = false;

        try {
          const res = await fetch('/api/documents', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
            keepalive: keepalive && canKeepAlive,
          });

          if (res.status === 401) {
            setSaveStatus('error');
            await saveLocalDraft(draftKey, {
              whiteboardData: whiteboardDataRef.current,
              blocks: blocksRef.current as unknown as PartialBlock[],
            });
            showToast(
              'Sesión expirada. Cambios respaldados localmente en IndexedDB.',
              'error',
              6000
            );
            return false;
          }

          if (!res.ok) {
            setSaveStatus('error');
            await saveLocalDraft(draftKey, {
              whiteboardData: whiteboardDataRef.current,
              blocks: blocksRef.current as unknown as PartialBlock[],
            });
            showToast('Error al guardar la pizarra (respaldo local creado).', 'error');
            return false;
          }

          wbSavedVersionRef.current = Math.max(wbSavedVersionRef.current, targetWbVersion);
          blocksSavedVersionRef.current = Math.max(
            blocksSavedVersionRef.current,
            targetBlocksVersion
          );

          try {
            sessionStorage.removeItem(pendingBackupKey);
          } catch {}

          if (hasAnyPendingChanges()) {
            shouldRetryFollowUp = true;
            setSaveStatus('dirty');
            return false;
          }

          void clearLocalDraft(draftKey);
          setSaveStatus('saved');
          setLastSavedAt(Date.now());
          if (!isAutoSave) {
            showToast('Pizarra guardada correctamente.', 'success');
          }
          return true;
        } catch {
          setSaveStatus('error');
          await saveLocalDraft(draftKey, {
            whiteboardData: whiteboardDataRef.current,
            blocks: blocksRef.current as unknown as PartialBlock[],
          });
          showToast('Error de red al guardar (respaldo local creado).', 'error');
          return false;
        } finally {
          isSavingRef.current = false;
          inFlightPromiseRef.current = null;
          if (shouldRetryFollowUp) {
            void performSaveRef.current({ isAutoSave: true });
          }
        }
      })();

      inFlightPromiseRef.current = run;
      return run;
    },
    [documentId, draftKey, showToast]
  );

  const performSaveRef = useRef(performSave);
  useEffect(() => {
    performSaveRef.current = performSave;
  }, [performSave]);

  const flushSave = useCallback(async (): Promise<boolean> => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    while (hasAnyPendingChanges()) {
      const ok = await performSaveRef.current({ isAutoSave: true });
      if (!ok && hasAnyPendingChanges()) {
        if (!isSavingRef.current) return false;
      }
    }
    return true;
  }, []);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      void performSaveRef.current({ isAutoSave: true });
    }, 2000);
  }, []);

  const handleManualSave = useCallback(() => {
    syncFlushSnapshotBeforeSave();
    void performSaveRef.current({ isAutoSave: false });
  }, [syncFlushSnapshotBeforeSave]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleManualSave]);

  // Protect against losing unsaved changes on tab close / hide
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      syncFlushSnapshotBeforeSave();
      if (hasAnyPendingChanges() || isSavingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncFlushSnapshotBeforeSave();
        if (hasAnyPendingChanges()) {
          void performSaveRef.current({ isAutoSave: true, keepalive: true });
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncFlushSnapshotBeforeSave]);

  // Inline title rename
  const handleCommitTitle = async () => {
    const trimmed = draftTitle.trim();
    setIsEditingTitle(false);
    if (!trimmed || trimmed === docTitle) {
      setDraftTitle(docTitle);
      return;
    }

    const previousTitle = docTitle;
    setDocTitle(trimmed);
    try {
      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: documentId, title: trimmed }),
      });
      if (!res.ok) throw new Error('Error al renombrar');
      showToast('Título actualizado.', 'success', 2000);
    } catch {
      setDocTitle(previousTitle);
      setDraftTitle(previousTitle);
      showToast('No se pudo actualizar el título.', 'error');
    }
  };

  // PDF compilation (WASM + server fallback via /api/compile)
  const compileViaServer = async (freshLatex: string) => {
    setIsCompilingPdf(true);
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latexCode: freshLatex }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.details || err.error || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('El PDF generado está vacío.');

      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setPdfBytes(null);
      setPdfBase64(base64data);
      showToast('PDF compilado con éxito.', 'success');
    } catch (error: any) {
      setCompileError(error.message || 'Error al compilar');
    } finally {
      setIsCompilingPdf(false);
    }
  };

  const handleCompilePdf = async () => {
    if (isAnyCompilingPdf || blocksRef.current.length === 0) return;

    const freshLatex = exportToLatex(blocksRef.current, { ...latexOptions, title: docTitle });
    setLatexCode(freshLatex);
    setCompileError(null);
    setCompilationLog('');

    const wasmResult = await compileWasm([
      {
        id: 'main',
        filename: 'document.tex',
        content: freshLatex,
        isBinary: false,
        isMain: true,
      },
    ]);

    setCompilationLog(wasmResult.log);

    if (wasmResult.pdfBase64) {
      setPdfBytes(wasmResult.pdfBytes);
      setPdfBase64(wasmResult.pdfBase64);
      showToast('PDF compilado localmente (WASM).', 'success');
      return;
    }

    const isEnvFailure =
      !wasmResult.log ||
      /worker|wasm|sharedarraybuffer|fetch|network|initialize/i.test(wasmResult.error || '');

    if (isEnvFailure) {
      await compileViaServer(freshLatex);
      return;
    }

    setCompileError(wasmResult.error || 'Error de compilación LaTeX');
  };

  const handleDownloadPdf = () => {
    let blob: Blob | null = null;
    if (pdfBytes && pdfBytes.length > 0) {
      blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    } else if (pdfBase64) {
      blob = base64ToBlob(pdfBase64, 'application/pdf');
    }
    if (!blob) return;
    const safeTitle =
      (docTitle || 'pizarra').replace(/[^a-z0-9_\-áéíóúñ ]/gi, '_').trim() || 'pizarra';
    triggerBlobDownload(blob, `${safeTitle}.pdf`);
  };

  const handleDownloadTex = () => {
    const code =
      latexCode ||
      (blocksRef.current.length > 0
        ? exportToLatex(blocksRef.current, { ...latexOptions, title: docTitle })
        : '');
    if (!code) return;
    const safeTitle =
      (docTitle || 'pizarra').replace(/[^a-z0-9_\-áéíóúñ ]/gi, '_').trim() || 'pizarra';
    triggerBlobDownload(new Blob([code], { type: 'text/plain;charset=utf-8' }), `${safeTitle}.tex`);
  };

  // Safe exit: flush tldraw snapshot -> flush server save -> confirm if failed
  const handleBackToDashboard = async () => {
    syncFlushSnapshotBeforeSave();
    let ok = true;
    if (hasAnyPendingChanges() || isSavingRef.current) {
      ok = await flushSave();
    }
    if (ok && !hasAnyPendingChanges()) {
      router.push('/');
      return;
    }
    setConfirmAction({
      title: 'Cambios sin guardar',
      message:
        'No se pudieron guardar los últimos cambios en el servidor (hay respaldo local en IndexedDB). ¿Salir de todos modos?',
      confirmText: 'Salir sin guardar',
      variant: 'danger',
      onConfirm: () => {
        router.push('/');
      },
    });
  };

  // Unified AI Scan helper with tracked AbortController & pre-insert snapshot
  const runAiScan = useCallback(
    (mode: 'ocr' | 'tikz', imageBlob: Blob) => {
      setIsScanning(true);
      showToast(
        mode === 'ocr'
          ? 'Analizando trazos con IA en segundo plano...'
          : 'Generando TikZ con IA en segundo plano...',
        'info',
        5000
      );

      void (async () => {
        const controller = new AbortController();
        abortControllersRef.current.add(controller);
        const timeoutId = setTimeout(() => controller.abort(), 60_000);

        try {
          const imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
          });

          const endpoint = mode === 'ocr' ? '/api/ai/ocr' : '/api/ai/tikz';
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64, mimeType: imageBlob.type || 'image/png' }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(mode === 'ocr' ? 'Error en el OCR' : 'Error al generar TikZ');
          }

          const result = await response.json();
          if (result && Array.isArray(result)) {
            if (blocksRef.current.length > 0) {
              await saveVersionSnapshot(
                snapshotDocKey,
                mode === 'ocr' ? 'Antes de escaneo LaTeX' : 'Antes de escaneo TikZ',
                blocksRef.current
              );
            }

            if (initialContent === undefined) {
              setInitialContent(result);
              blocksRef.current = result as Block[];
              setHasBlocks(result.length > 0);
              blocksDirtyVersionRef.current += 1;
              setSaveStatus('dirty');
              scheduleAutoSave();
            } else {
              setInsertBlocksAction({ blocks: result, timestamp: Date.now() });
              setHasBlocks(true);
            }
            setShowNotesPanel(true);
            setActiveTab('editor');
            showToast(
              mode === 'ocr' ? 'Escaneo completado e insertado.' : 'TikZ generado e insertado.',
              'success',
              4000
            );
          } else {
            showToast('La IA no retornó un formato válido.', 'error');
          }
        } catch (e: any) {
          if (e?.name === 'AbortError') {
            showToast('La operación con IA fue cancelada o expiró (timeout).', 'error', 5000);
          } else {
            showToast(
              mode === 'ocr' ? 'Error al analizar la imagen.' : 'Error al analizar el dibujo.',
              'error'
            );
          }
        } finally {
          clearTimeout(timeoutId);
          abortControllersRef.current.delete(controller);
          setIsScanning(false);
        }
      })();
    },
    [initialContent, scheduleAutoSave, showToast, snapshotDocKey]
  );

  const handleScanToLatex = useCallback(
    (imageBlob: Blob) => runAiScan('ocr', imageBlob),
    [runAiScan]
  );

  const handleScanToTikz = useCallback(
    (imageBlob: Blob) => runAiScan('tikz', imageBlob),
    [runAiScan]
  );

  const handleWhiteboardChange = useCallback(
    (data: string) => {
      whiteboardDataRef.current = data;
      wbDirtyVersionRef.current += 1;
      setSaveStatus('dirty');
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const handleBlocksChange = useCallback(
    (blocks: Block[]) => {
      blocksRef.current = blocks;
      setHasBlocks(blocks.length > 0);
      blocksDirtyVersionRef.current += 1;
      setSaveStatus('dirty');
      scheduleAutoSave();
      if (showNotesPanel && activeTab === 'latex') {
        setLatexCode(exportToLatex(blocks, { ...latexOptions, title: docTitle }));
      }
    },
    [activeTab, docTitle, latexOptions, scheduleAutoSave, showNotesPanel]
  );

  const handleEditorReady = useCallback((blocks: Block[]) => {
    blocksRef.current = blocks;
    setHasBlocks(blocks.length > 0);
  }, []);

  const handleBeforeAiBatchInsert = useCallback(
    (label: string, currentBlocks: Block[]) => {
      void saveVersionSnapshot(snapshotDocKey, label, currentBlocks);
    },
    [snapshotDocKey]
  );

  const handleOpenSnapshots = async () => {
    const list = await listVersionSnapshots<PartialBlock[]>(snapshotDocKey);
    setSnapshots(list);
    setShowSnapshots(true);
  };

  const handleCreateManualSnapshot = async () => {
    if (blocksRef.current.length === 0) {
      showToast('Aún no hay apuntes para guardar en un punto de control.', 'info');
      return;
    }
    await saveVersionSnapshot(snapshotDocKey, 'Punto de control manual', blocksRef.current);
    const list = await listVersionSnapshots<PartialBlock[]>(snapshotDocKey);
    setSnapshots(list);
    showToast('Punto de control guardado localmente.', 'success', 2000);
  };

  const handleRestoreDraft = () => {
    if (!recoverableDraft) return;
    const { whiteboardData, blocks } = recoverableDraft.payload;

    if (whiteboardData !== undefined) {
      whiteboardDataRef.current = whiteboardData;
      setWbInitialDataState(whiteboardData);
      setWbResetKey((k) => k + 1);
      wbDirtyVersionRef.current += 1;
    }

    if (blocks !== undefined) {
      if (initialContent === undefined) {
        setInitialContent(blocks);
      } else {
        setReplaceBlocksAction({ blocks, timestamp: Date.now() });
      }
      blocksRef.current = blocks as unknown as Block[];
      setHasBlocks(blocks.length > 0);
      blocksDirtyVersionRef.current += 1;
    }

    setSaveStatus('dirty');
    setRecoverableDraft(null);
    scheduleAutoSave();
    showToast('Respaldo local restaurado.', 'success');
  };

  const handleRestoreSnapshot = (snap: VersionSnapshotRecord<PartialBlock[]>) => {
    if (initialContent === undefined) {
      setInitialContent(snap.payload);
    } else {
      setReplaceBlocksAction({ blocks: snap.payload, timestamp: Date.now() });
    }
    blocksRef.current = snap.payload as unknown as Block[];
    setHasBlocks(snap.payload.length > 0);
    blocksDirtyVersionRef.current += 1;
    setSaveStatus('dirty');
    setShowNotesPanel(true);
    setActiveTab('editor');
    setShowSnapshots(false);
    scheduleAutoSave();
    showToast('Versión restaurada.', 'success');
  };

  const registerFlushSnapshot = useCallback((fn: (() => string | null) | null) => {
    flushSnapshotRef.current = fn;
  }, []);

  const whiteboardCanvasNode = (
    <EditorErrorBoundary title="Error en la Pizarra">
      <WhiteboardEditor
        key={wbResetKey}
        initialData={wbInitialDataState}
        onChange={handleWhiteboardChange}
        onScanToLatex={handleScanToLatex}
        onScanToTikz={handleScanToTikz}
        isScanning={isScanning}
        registerFlushSnapshot={registerFlushSnapshot}
      />
    </EditorErrorBoundary>
  );

  const notesPanelInner = (showNotesPanel || hasMountedNotesPanel) && (
    <div className="flex flex-col h-full w-full bg-surface text-ink-primary overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-elevated shrink-0">
        <div className="flex rounded-lg bg-surface-subtle/80 p-1 border border-border-subtle">
          {(
            [
              { id: 'editor', label: 'Editor', Icon: FileText },
              { id: 'latex', label: 'LaTeX', Icon: FileCode },
              { id: 'preview', label: 'Vista PDF', Icon: Eye },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === id
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowNotesPanel(false)}
          aria-label="Cerrar panel de notas"
          title="Cerrar panel de notas"
          className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden p-3 sm:p-4 relative bg-canvas/40">
        {/* Tab 1: Block Editor */}
        <div className={`h-full overflow-y-auto ${activeTab === 'editor' ? 'block' : 'hidden'}`}>
          {initialContent !== undefined ? (
            <BlockEditor
              initialContent={initialContent}
              onChange={handleBlocksChange}
              onReady={handleEditorReady}
              hasUnsavedChanges={hasUnsavedChanges}
              insertBlocksAction={insertBlocksAction}
              replaceBlocksAction={replaceBlocksAction}
              onBeforeAiBatchInsert={handleBeforeAiBatchInsert}
            />
          ) : (
            <div className="flex flex-col h-64 w-full items-center justify-center gap-3 rounded-xl bg-surface border border-border-subtle text-ink-muted px-6 text-center">
              <FileText className="w-8 h-8 opacity-40" />
              <p className="text-xs max-w-xs">
                Escanea trazos desde el pizarrón para transcribirlos a LaTeX o empieza a escribir
                tus apuntes directamente.
              </p>
              <button
                type="button"
                onClick={() => {
                  const emptyDoc: PartialBlock[] = [{ type: 'paragraph', content: '' }];
                  setInitialContent(emptyDoc);
                  blocksRef.current = emptyDoc as unknown as Block[];
                  setHasBlocks(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-ink-primary transition-colors cursor-pointer"
              >
                Empezar a escribir apuntes
              </button>
            </div>
          )}
        </div>

        {/* Tab 2: Generated LaTeX */}
        <div
          className={`h-full rounded-2xl bg-surface border border-border-subtle p-4 space-y-3 overflow-hidden flex-col ${
            activeTab === 'latex' ? 'flex' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0 gap-2">
            <span className="text-sm font-semibold text-ink-primary">Código LaTeX</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTex}
                disabled={!hasBlocks}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-border-subtle bg-surface-subtle hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>.tex</span>
              </button>
              <button
                type="button"
                disabled={!hasBlocks}
                onClick={() => {
                  const code =
                    latexCode ||
                    exportToLatex(blocksRef.current, { ...latexOptions, title: docTitle });
                  if (!code) return;
                  void navigator.clipboard.writeText(code);
                  showToast('Código LaTeX copiado.', 'success', 2000);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-border-subtle bg-surface-subtle hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar</span>
              </button>
            </div>
          </div>
          {latexCode ? (
            <pre className="flex-1 font-mono text-xs text-cyan-700 dark:text-cyan-300/90 bg-canvas p-4 rounded-xl border border-border-subtle overflow-auto whitespace-pre-wrap">
              {latexCode}
            </pre>
          ) : (
            <div className="flex-1 flex items-center justify-center text-ink-muted text-xs text-center">
              Escanea un dibujo o redacta apuntes para generar código LaTeX.
            </div>
          )}
        </div>

        {/* Tab 3: Live PDF Preview */}
        <div
          className={`h-full rounded-2xl bg-surface border border-border-subtle p-3 sm:p-4 flex-col overflow-hidden ${
            activeTab === 'preview' ? 'flex' : 'hidden'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between border-b border-border-subtle pb-3 mb-3 shrink-0 gap-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-ink-primary">Vista PDF</span>
              {diagnostics.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {diagnostics.length} aviso{diagnostics.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {compilationLog && (
                <button
                  type="button"
                  onClick={() => setShowLogPanel((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary border border-border-subtle transition-colors cursor-pointer"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Log</span>
                  {showLogPanel ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleDownloadTex}
                disabled={!hasBlocks}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary border border-border-subtle disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>.tex</span>
              </button>
              {(pdfBytes || pdfBase64) && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-ink-primary border border-border-subtle hover:bg-surface-elevated transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleCompilePdf()}
                disabled={isAnyCompilingPdf || !hasBlocks}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-45 transition-colors cursor-pointer"
              >
                {isAnyCompilingPdf ? 'Compilando...' : 'Compilar PDF'}
              </button>
            </div>
          </div>

          {/* Collapsible Diagnostics / Compilation Log */}
          {showLogPanel && compilationLog && (
            <div className="mb-3 rounded-xl border border-border-subtle bg-canvas p-3 max-h-40 overflow-y-auto shrink-0 space-y-2">
              {diagnostics.length > 0 && (
                <div className="space-y-1">
                  {diagnostics.map((d) => (
                    <div
                      key={d.id}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-start gap-2 ${
                        d.severity === 'error'
                          ? 'bg-red-500/10 border-red-500/25 text-red-600 dark:text-red-400'
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-semibold shrink-0 uppercase">
                        {d.line ? `L${d.line}` : d.severity}
                      </span>
                      <span className="break-words">{d.message}</span>
                    </div>
                  ))}
                </div>
              )}
              <pre className="font-mono text-[11px] text-ink-muted whitespace-pre-wrap break-words">
                {compilationLog.slice(-3000)}
              </pre>
            </div>
          )}

          <div className="flex-1 w-full bg-canvas rounded-xl overflow-hidden flex items-center justify-center border border-border-subtle relative">
            {isAnyCompilingPdf && (
              <div className="absolute inset-0 bg-surface/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mb-3" />
                <span className="font-semibold text-xs">
                  {wasmStatus === 'initializing'
                    ? 'Iniciando motor LaTeX (WASM)...'
                    : 'Compilando PDF...'}
                </span>
              </div>
            )}

            {compileError && !isAnyCompilingPdf && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-canvas/95 overflow-y-auto">
                <h3 className="text-red-500 dark:text-red-400 font-semibold mb-2 text-sm">
                  Error de Compilación
                </h3>
                {diagnostics.filter((d) => d.severity === 'error').length > 0 && (
                  <div className="w-full max-w-md space-y-1.5 mb-3 text-left">
                    {diagnostics
                      .filter((d) => d.severity === 'error')
                      .slice(0, 5)
                      .map((d) => (
                        <div
                          key={d.id}
                          className="text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400"
                        >
                          {d.line ? (
                            <span className="font-mono font-bold mr-1.5">L{d.line}:</span>
                          ) : null}
                          {d.message}
                        </div>
                      ))}
                  </div>
                )}
                <div className="text-ink-secondary text-xs w-full max-w-md bg-surface rounded-lg p-3 border border-red-500/20 text-left font-mono overflow-auto max-h-40 mb-3 whitespace-pre-wrap">
                  {compileError}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void compileViaServer(
                      exportToLatex(blocksRef.current, { ...latexOptions, title: docTitle })
                    )
                  }
                  className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Reintentar en servidor
                </button>
              </div>
            )}

            {pdfBase64 || pdfBytes ? (
              <PdfErrorBoundary pdfBase64={pdfBase64} pdfBytes={pdfBytes} title={docTitle}>
                <CustomPdfViewer pdfBase64={pdfBase64} pdfBytes={pdfBytes} />
              </PdfErrorBoundary>
            ) : (
              !compileError &&
              !isAnyCompilingPdf && (
                <div className="text-ink-muted text-xs flex flex-col items-center gap-3 text-center px-6">
                  <FileCode className="h-10 w-10 opacity-40" />
                  <p className="max-w-xs">
                    {hasBlocks
                      ? 'Compila tus apuntes de esta pizarra a PDF en un clic.'
                      : 'Escanea trazos o escribe apuntes en el editor para compilar tu PDF.'}
                  </p>
                  {hasBlocks && (
                    <button
                      type="button"
                      onClick={() => void handleCompilePdf()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Compilar apuntes a PDF
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full flex-col bg-canvas text-ink-primary font-sans overflow-hidden">
      {/* Top Header */}
      <header className="flex h-14 sm:h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-surface/90 px-3 sm:px-5 backdrop-blur-md z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => void handleBackToDashboard()}
            className="p-2 bg-surface-subtle rounded-lg border border-border-subtle hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer shrink-0"
            title="Volver al dashboard"
            aria-label="Volver al dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">Lema</span>
          </div>

          <span className="hidden sm:inline-block h-4 w-px bg-border-subtle shrink-0" />

          {/* Inline Editable Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1 min-w-0">
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleCommitTitle();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setDraftTitle(docTitle);
                    setIsEditingTitle(false);
                  }
                }}
                onBlur={() => void handleCommitTitle()}
                autoFocus
                aria-label="Editar título de la pizarra"
                className="w-36 sm:w-52 px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-subtle border border-cyan-500 text-ink-primary focus:outline-none"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void handleCommitTitle()}
                aria-label="Guardar título"
                className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftTitle(docTitle);
                setIsEditingTitle(true);
              }}
              title="Clic para renombrar pizarra"
              className="group flex items-center gap-2 rounded-full bg-surface-subtle/80 hover:bg-surface-subtle px-3 py-1 text-xs border border-border-subtle text-ink-secondary hover:text-ink-primary transition-colors min-w-0 cursor-pointer"
            >
              <PenTool className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="max-w-[120px] sm:max-w-[200px] truncate font-medium">
                {docTitle}
              </span>
              <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity shrink-0" />
            </button>
          )}

          {/* Save Status Indicator */}
          {saveStatus === 'error' ? (
            <button
              type="button"
              onClick={handleManualSave}
              className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full transition-colors cursor-pointer shrink-0"
              title="Haz clic para reintentar guardar"
            >
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden md:inline">Error al guardar · Reintentar</span>
            </button>
          ) : saveStatus === 'dirty' || saveStatus === 'saving' ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              <span className="hidden md:inline">
                {saveStatus === 'saving' ? 'Guardando...' : 'Sin guardar'}
              </span>
            </span>
          ) : lastSavedAt ? (
            <span className="hidden lg:inline-flex items-center gap-1 text-xs text-ink-muted shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{formatSavedAgo(lastSavedAt, nowTick)}</span>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void handleOpenSnapshots()}
            title="Historial de snapshots locales"
            aria-label="Historial de snapshots locales"
            className="p-2 rounded-lg border border-border-subtle bg-surface-subtle/60 hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>

          <ThemeToggle compact />

          <button
            type="button"
            onClick={() => setShowNotesPanel((prev) => !prev)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
              showNotesPanel
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                : 'bg-surface-subtle/80 border-border-subtle text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle'
            }`}
          >
            {showNotesPanel ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {showNotesPanel ? 'Cerrar Notas' : 'Ver Notas'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleManualSave}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            title="Guardar (Ctrl+S)"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
              saveStatus === 'error'
                ? 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-300 hover:bg-red-500/25 cursor-pointer'
                : hasUnsavedChanges
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 cursor-pointer'
                : 'bg-surface-subtle border-border-subtle text-ink-muted cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving' ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Guardar</span>
          </button>
        </div>
      </header>

      {/* IndexedDB Local Draft Recovery Banner */}
      {recoverableDraft && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 shrink-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              Se encontró un respaldo local del{' '}
              {new Date(recoverableDraft.updatedAt).toLocaleString('es-MX', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              sin sincronizar con el servidor.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-semibold hover:bg-amber-500 transition-colors cursor-pointer"
            >
              Restaurar
            </button>
            <button
              type="button"
              onClick={() => {
                setRecoverableDraft(null);
                void clearLocalDraft(draftKey);
              }}
              className="px-2 py-1 text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Main Split-Pane Workspace */}
      <main className="flex-1 bg-canvas flex overflow-hidden relative">
        {!isMobile ? (
          <PanelGroup orientation="horizontal" className="h-full w-full">
            <Panel
              id="wb-canvas"
              defaultSize="100%"
              minSize="30%"
              className="relative h-full overflow-hidden"
            >
              {whiteboardCanvasNode}
            </Panel>

            <PanelResizeHandle
              className={
                showNotesPanel
                  ? 'w-2 relative group cursor-col-resize z-10 flex justify-center items-center bg-canvas'
                  : 'hidden'
              }
            >
              <div className="w-0.5 h-full bg-border-subtle group-hover:bg-cyan-500 group-active:bg-cyan-500 transition-colors" />
            </PanelResizeHandle>

            <Panel
              id="wb-notes"
              panelRef={notesPanelRef}
              collapsible
              collapsedSize="0%"
              defaultSize="0%"
              minSize="25%"
              onResize={(size, _id, prevSize) => {
                if (
                  prevSize !== undefined &&
                  prevSize.asPercentage > 0 &&
                  size.asPercentage < 1 &&
                  showNotesPanelRef.current
                ) {
                  setShowNotesPanel(false);
                }
              }}
              className="flex flex-col bg-surface overflow-hidden"
            >
              {notesPanelInner}
            </Panel>
          </PanelGroup>
        ) : (
          <>
            <div className="flex-1 w-full h-full relative overflow-hidden">
              {whiteboardCanvasNode}
            </div>
            {showNotesPanel && (
              <div className="fixed inset-x-0 top-14 sm:top-16 bottom-0 z-30 bg-surface flex flex-col border-t border-border-subtle shadow-2xl">
                {notesPanelInner}
              </div>
            )}
          </>
        )}
      </main>

      {/* Local Snapshots History Modal */}
      {showSnapshots && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSnapshots(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Historial de versiones locales"
            className="w-full max-w-md rounded-2xl bg-surface border border-border-strong p-5 shadow-2xl space-y-4 animate-[fadeInScale_0.15s_ease-out]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-sm text-ink-primary">Historial local</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleCreateManualSnapshot()}
                  className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer"
                >
                  Guardar punto
                </button>
                <button
                  type="button"
                  onClick={() => setShowSnapshots(false)}
                  aria-label="Cerrar historial"
                  className="text-ink-muted hover:text-ink-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {snapshots.length === 0 ? (
                <p className="text-xs text-ink-muted text-center py-6">
                  Aún no hay snapshots guardados para las notas de esta pizarra.
                </p>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-subtle/60 border border-border-subtle"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-ink-primary truncate">
                        {snap.label}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {new Date(snap.createdAt).toLocaleString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {snap.payload.length} bloques
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="px-2.5 py-1 rounded-lg bg-surface border border-border-subtle hover:border-indigo-500 text-xs font-medium text-ink-primary shrink-0 cursor-pointer"
                    >
                      Restaurar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
