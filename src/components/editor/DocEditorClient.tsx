'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { exportToLatex, LatexOptions } from '@/lib/exportToLatex';
import type { Block, PartialBlock } from '@blocknote/core';
import {
  BookOpen,
  FileCode,
  Download,
  Eye,
  ShieldCheck,
  ChevronLeft,
  Columns,
  Save,
  Copy,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Pencil,
  Check,
  X,
  History,
  RotateCcw,
  RefreshCw,
  FolderPlus,
  Terminal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
  useDefaultLayout,
} from 'react-resizable-panels';
import { useEditorStore } from '@/store/useEditorStore';
import { useLemaStore } from '@/store/useLemaStore';
import { useLatexWasm } from './useLatexWasm';
import { PdfErrorBoundary } from './PdfErrorBoundary';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  CodeMirrorLatexEditor,
  type CodeMirrorLatexEditorHandle,
} from './CodeMirrorLatexEditor';
import { parseLatexLog, type LatexDiagnostic } from '@/lib/latexLogParser';
import { base64ToBlob, triggerBlobDownload } from '@/lib/base64';
import {
  saveLocalDraft,
  getLocalDraft,
  clearLocalDraft,
  saveVersionSnapshot,
  listVersionSnapshots,
  type VersionSnapshotRecord,
} from '@/lib/localDrafts';

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

const CustomPdfViewer = dynamic(() => import('@/components/editor/CustomPdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-ink-muted text-xs">
      Cargando visor PDF...
    </div>
  ),
});

interface DocEditorClientProps {
  documentId: string;
  title: string;
  folderId?: string | null;
  initialContent: PartialBlock[];
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

export default function DocEditorClient({
  documentId,
  title: initialTitle,
  folderId,
  initialContent,
}: DocEditorClientProps) {
  const router = useRouter();
  const showToast = useEditorStore((s) => s.showToast);
  const setConfirmAction = useLemaStore((s) => s.setConfirmAction);
  const { compile: compileWasm, status: wasmStatus } = useLatexWasm();

  const [docTitle, setDocTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(initialTitle);

  const [latexCode, setLatexCode] = useState('');
  const [customLatexOverride, setCustomLatexOverride] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [compilationLog, setCompilationLog] = useState('');
  const [showLogPanel, setShowLogPanel] = useState(false);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const [recoverableDraft, setRecoverableDraft] = useState<PartialBlock[] | null>(null);

  // Version snapshots modal
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshots, setSnapshots] = useState<VersionSnapshotRecord<PartialBlock[]>[]>([]);
  const [replaceBlocksAction, setReplaceBlocksAction] = useState<{
    blocks: PartialBlock[];
    timestamp: number;
  } | null>(null);

  const [hasBlocks, setHasBlocks] = useState(initialContent.length > 0);
  const [latexOptions, setLatexOptions] = useState<LatexOptions>({ columns: 2 });
  const [isCreatingLatexProject, setIsCreatingLatexProject] = useState(false);

  const [splitScreen, setSplitScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'latex' | 'preview'>('editor');
  const [splitSideTab, setSplitSideTab] = useState<'preview' | 'latex'>('preview');
  const [latexCopied, setLatexCopied] = useState(false);

  const blocksRef = useRef<Block[]>(initialContent as unknown as Block[]);
  const dirtyVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const isSavingRef = useRef(false);
  const inFlightPromiseRef = useRef<Promise<boolean> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latexEditorRef = useRef<CodeMirrorLatexEditorHandle | null>(null);

  const draftKey = `doc:${documentId}`;
  const snapshotDocKey = `doc:${documentId}`;

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'lema-doc-split',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  });

  const isWasmBusy = wasmStatus === 'initializing' || wasmStatus === 'compiling';
  const hasUnsavedChanges =
    saveStatus === 'dirty' || saveStatus === 'saving' || saveStatus === 'error';

  const diagnostics = useMemo(() => parseLatexLog(compilationLog), [compilationLog]);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  // Check IndexedDB for unsynced local draft on mount
  useEffect(() => {
    let mounted = true;
    void getLocalDraft<PartialBlock[]>(draftKey).then((draft) => {
      if (!mounted || !draft?.payload) return;
      const serializedInit = JSON.stringify(initialContent);
      const serializedDraft = JSON.stringify(draft.payload);
      if (serializedDraft !== serializedInit) {
        setRecoverableDraft(draft.payload);
      }
    });
    return () => {
      mounted = false;
    };
  }, [draftKey, initialContent]);

  // Compute LaTeX when LaTeX panel/tab is visible (and no manual override)
  useEffect(() => {
    const isLatexVisible = splitScreen ? splitSideTab === 'latex' : activeTab === 'latex';
    if (!isLatexVisible || blocksRef.current.length === 0) return;
    if (customLatexOverride === null) {
      setLatexCode(exportToLatex(blocksRef.current, { ...latexOptions, title: docTitle }));
    }
  }, [activeTab, customLatexOverride, docTitle, latexOptions, splitScreen, splitSideTab]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const performSave = useCallback(
    async ({ isAutoSave = false, keepalive = false } = {}): Promise<boolean> => {
      if (dirtyVersionRef.current <= savedVersionRef.current) return true;
      if (isSavingRef.current && inFlightPromiseRef.current) {
        return inFlightPromiseRef.current;
      }

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      const targetVersion = dirtyVersionRef.current;
      const bodyStr = JSON.stringify({
        id: documentId,
        content: JSON.stringify(blocksRef.current),
      });

      const run = (async () => {
        isSavingRef.current = true;
        setSaveStatus('saving');
        let shouldRetryFollowUp = false;

        try {
          const res = await fetch('/api/documents', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
            keepalive: keepalive && bodyStr.length < 60_000,
          });

          if (res.status === 401) {
            setSaveStatus('error');
            await saveLocalDraft(draftKey, blocksRef.current);
            showToast('Sesión expirada. Guardado localmente en IndexedDB.', 'error', 6000);
            return false;
          }

          if (!res.ok) {
            setSaveStatus('error');
            await saveLocalDraft(draftKey, blocksRef.current);
            showToast('Error al guardar (respaldado localmente).', 'error');
            return false;
          }

          savedVersionRef.current = Math.max(savedVersionRef.current, targetVersion);
          if (dirtyVersionRef.current > savedVersionRef.current) {
            shouldRetryFollowUp = true;
            setSaveStatus('dirty');
            return false;
          }

          setSaveStatus('saved');
          setLastSavedAt(Date.now());
          setNowTick(Date.now());
          await clearLocalDraft(draftKey);
          if (!isAutoSave) {
            showToast('Documento guardado correctamente.', 'success');
          }
          return true;
        } catch {
          setSaveStatus('error');
          await saveLocalDraft(draftKey, blocksRef.current);
          showToast('Error de red al guardar (respaldado localmente).', 'error');
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
    while (dirtyVersionRef.current > savedVersionRef.current) {
      const ok = await performSaveRef.current({ isAutoSave: true });
      if (!ok && dirtyVersionRef.current > savedVersionRef.current) {
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void performSaveRef.current({ isAutoSave: false });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyVersionRef.current > savedVersionRef.current) {
        void saveLocalDraft(draftKey, blocksRef.current);
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && dirtyVersionRef.current > savedVersionRef.current) {
        void saveLocalDraft(draftKey, blocksRef.current);
        void performSaveRef.current({ isAutoSave: true, keepalive: true });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [draftKey]);

  const handleBackToDashboard = async () => {
    if (dirtyVersionRef.current > savedVersionRef.current || isSavingRef.current) {
      const ok = await flushSave();
      if (!ok) {
        setConfirmAction({
          title: 'Cambios sin sincronizar',
          message:
            'No se pudieron guardar los cambios en el servidor (están respaldados localmente). ¿Salir de todos modos?',
          confirmText: 'Salir',
          variant: 'warning',
          onConfirm: () => {
            router.push('/');
          },
        });
        return;
      }
    }
    router.push('/');
  };

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    setIsEditingTitle(false);
    if (trimmed === docTitle) return;

    const prev = docTitle;
    setDocTitle(trimmed);
    try {
      const res = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: documentId, title: trimmed }),
      });
      if (!res.ok) throw new Error('Error');
      showToast('Título actualizado.', 'success');
    } catch {
      setDocTitle(prev);
      showToast('No se pudo renombrar el apunte.', 'error');
    }
  };

  const getEffectiveLatex = useCallback(() => {
    if (customLatexOverride !== null) return customLatexOverride;
    return exportToLatex(blocksRef.current, { ...latexOptions, title: docTitle });
  }, [customLatexOverride, docTitle, latexOptions]);

  const compileViaServer = async (freshLatex: string) => {
    setIsCompiling(true);
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
        reader.onloadend = () => resolve(((reader.result as string) || '').split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setPdfBytes(null);
      setPdfBase64(base64data);
      if (splitScreen) setSplitSideTab('preview');
      else setActiveTab('preview');
      showToast('PDF compilado con éxito.', 'success');
    } catch (error: any) {
      setCompileError(error.message);
      if (splitScreen) setSplitSideTab('preview');
      else setActiveTab('preview');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCompile = async () => {
    if (isCompiling || isWasmBusy || blocksRef.current.length === 0) return;

    const effectiveLatex = getEffectiveLatex();
    setLatexCode(effectiveLatex);
    setCompileError(null);
    setCompilationLog('');
    if (splitScreen) setSplitSideTab('preview');
    else setActiveTab('preview');

    const wasmResult = await compileWasm([
      {
        id: 'main',
        filename: 'document.tex',
        content: effectiveLatex,
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
      await compileViaServer(effectiveLatex);
      return;
    }

    setCompileError(wasmResult.error || 'Error de compilación LaTeX');
  };

  const handleCopyLatex = async () => {
    const code = getEffectiveLatex();
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setLatexCopied(true);
      showToast('Código LaTeX copiado al portapapeles.', 'success', 2000);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setLatexCopied(false), 2000);
    } catch {
      showToast('No se pudo copiar al portapapeles.', 'error');
    }
  };

  const handleDownloadTex = () => {
    const code = getEffectiveLatex();
    if (!code) return;
    const safeName = docTitle.replace(/[^a-z0-9_\-áéíóúñ ]/gi, '_').trim() || 'apunte';
    triggerBlobDownload(new Blob([code], { type: 'text/plain;charset=utf-8' }), `${safeName}.tex`);
  };

  const handleOpenAsLatexProject = async () => {
    if (isCreatingLatexProject) return;
    const code = getEffectiveLatex();
    if (!code.trim()) return;
    setIsCreatingLatexProject(true);
    try {
      const res = await fetch('/api/latex-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${docTitle} (LaTeX)`,
          folderId: folderId ?? null,
          description: `Exportado desde el apunte "${docTitle}"`,
          files: [
            {
              filename: 'main.tex',
              content: code,
              isBinary: false,
              isMain: true,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error('Error');
      const created = await res.json();
      showToast('Proyecto LaTeX creado.', 'success');
      router.push(`/latex/${created.id}`);
    } catch {
      showToast('No se pudo crear el proyecto LaTeX.', 'error');
    } finally {
      setIsCreatingLatexProject(false);
    }
  };

  const handleDownloadPdf = () => {
    const safeName = docTitle.replace(/[^a-z0-9_\-áéíóúñ ]/gi, '_').trim() || 'documento';
    if (pdfBytes && pdfBytes.length > 0) {
      triggerBlobDownload(
        new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
        `${safeName}.pdf`
      );
      return;
    }
    if (!pdfBase64) return;
    triggerBlobDownload(base64ToBlob(pdfBase64, 'application/pdf'), `${safeName}.pdf`);
  };

  const handleBlocksChange = useCallback(
    (blocks: Block[]) => {
      blocksRef.current = blocks;
      setHasBlocks(blocks.length > 0);
      dirtyVersionRef.current += 1;
      setSaveStatus('dirty');
      void saveLocalDraft(draftKey, blocks);
      scheduleAutoSave();
      if (customLatexOverride === null) {
        const isLatexVisible = splitScreen ? splitSideTab === 'latex' : activeTab === 'latex';
        if (isLatexVisible) {
          setLatexCode(exportToLatex(blocks, { ...latexOptions, title: docTitle }));
        }
      }
    },
    [activeTab, customLatexOverride, docTitle, draftKey, latexOptions, scheduleAutoSave, splitScreen, splitSideTab]
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

  const openSnapshotsModal = async () => {
    const list = await listVersionSnapshots<PartialBlock[]>(snapshotDocKey);
    setSnapshots(list);
    setShowSnapshots(true);
  };

  const handleCreateManualSnapshot = async () => {
    await saveVersionSnapshot(snapshotDocKey, 'Snapshot manual', blocksRef.current);
    const list = await listVersionSnapshots<PartialBlock[]>(snapshotDocKey);
    setSnapshots(list);
    showToast('Snapshot guardado en historial local.', 'success');
  };

  const handleJumpToDiagnostic = (diag: LatexDiagnostic) => {
    if (splitScreen) {
      setSplitSideTab('latex');
    } else {
      setActiveTab('latex');
    }
    if (diag.line) {
      setTimeout(() => {
        latexEditorRef.current?.jumpToLine(diag.line!);
      }, 60);
    }
  };

  const isAnyCompiling = isCompiling || isWasmBusy;

  const latexPanelNode = (
    <div className="flex-1 h-full rounded-2xl glass-panel p-4 flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-sm font-semibold text-ink-primary">Código LaTeX</span>
          {customLatexOverride !== null && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium">
              Editado manualmente
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {customLatexOverride !== null && (
            <button
              type="button"
              onClick={() => {
                setCustomLatexOverride(null);
                setLatexCode(exportToLatex(blocksRef.current, { ...latexOptions, title: docTitle }));
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-medium text-ink-secondary border border-border-subtle hover:text-ink-primary cursor-pointer"
              title="Descartar cambios manuales y regenerar desde los bloques"
            >
              <RefreshCw className="h-3 w-3" /> Sincronizar
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyLatex}
            disabled={!hasBlocks}
            className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-medium text-ink-secondary border border-border-subtle hover:text-ink-primary disabled:opacity-40 cursor-pointer"
          >
            {latexCopied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownloadTex}
            disabled={!hasBlocks}
            className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-medium text-ink-secondary border border-border-subtle hover:text-ink-primary disabled:opacity-40 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>.tex</span>
          </button>
          <button
            type="button"
            onClick={() => void handleOpenAsLatexProject()}
            disabled={!hasBlocks || isCreatingLatexProject}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 disabled:opacity-40 cursor-pointer"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span>Abrir como Proyecto LaTeX</span>
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-border-subtle">
        <CodeMirrorLatexEditor
          ref={latexEditorRef}
          value={customLatexOverride ?? latexCode}
          onChange={(val) => {
            setCustomLatexOverride(val);
            setLatexCode(val);
          }}
          diagnostics={diagnostics}
          onSave={() => void handleCompile()}
        />
      </div>
    </div>
  );

  const previewPanelNode = (
    <div className="flex-1 h-full rounded-2xl glass-panel p-4 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold text-ink-primary">Vista PDF</span>
          {diagnostics.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLogPanel((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/12 border border-amber-500/30 text-amber-700 dark:text-amber-300 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              {diagnostics.length}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {compilationLog && (
            <button
              type="button"
              onClick={() => setShowLogPanel((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-ink-secondary hover:text-ink-primary px-2 py-1 rounded hover:bg-surface-subtle cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              Log
              {showLogPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          {pdfBase64 && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-3 py-1 text-xs font-medium text-ink-secondary border border-border-subtle hover:text-ink-primary cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </button>
          )}
        </div>
      </div>

      {showLogPanel && (compilationLog || diagnostics.length > 0) && (
        <div className="mb-3 border border-border-subtle rounded-xl bg-canvas p-2 max-h-44 overflow-auto space-y-1.5 shrink-0">
          {diagnostics.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleJumpToDiagnostic(d)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs bg-surface hover:bg-surface-subtle border border-border-subtle flex items-center gap-2 cursor-pointer"
            >
              <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 shrink-0">
                {d.line ? `Línea ${d.line}` : 'Log'}
              </span>
              <span className="truncate text-ink-secondary">{d.message}</span>
            </button>
          ))}
          {compilationLog && (
            <pre className="text-[10px] font-mono text-ink-muted p-2 whitespace-pre-wrap">{compilationLog}</pre>
          )}
        </div>
      )}

      <div className="flex-1 w-full bg-canvas rounded-xl overflow-hidden flex items-center justify-center border border-border-subtle relative">
        {isAnyCompiling && (
          <div className="absolute inset-0 bg-canvas/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mb-4" />
            <span className="font-bold text-sm">
              {wasmStatus === 'initializing' ? 'Iniciando motor LaTeX (WASM)...' : 'Compilando PDF...'}
            </span>
          </div>
        )}

        {compileError && !isAnyCompiling && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-canvas/95 backdrop-blur-sm">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-full mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-red-600 dark:text-red-400 font-bold mb-2 text-sm">
              Error de Compilación
            </h3>
            {diagnostics.filter((d) => d.severity === 'error').length > 0 && (
              <div className="w-full max-w-md space-y-1 mb-3 max-h-28 overflow-y-auto text-left">
                {diagnostics
                  .filter((d) => d.severity === 'error')
                  .slice(0, 4)
                  .map((diag) => (
                    <button
                      key={diag.id}
                      type="button"
                      onClick={() => handleJumpToDiagnostic(diag)}
                      className="w-full text-left px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-700 dark:text-red-300 hover:bg-red-500/20 cursor-pointer"
                    >
                      {diag.line ? `Línea ${diag.line}: ` : ''}
                      {diag.message}
                    </button>
                  ))}
              </div>
            )}
            <div className="text-ink-secondary text-xs max-w-md bg-surface rounded-lg p-3 border border-red-500/20 text-left font-mono overflow-auto max-h-36 mb-4">
              {compileError}
            </div>
            <button
              type="button"
              onClick={() => void compileViaServer(getEffectiveLatex())}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              Reintentar en servidor
            </button>
          </div>
        )}

        {pdfBase64 ? (
          <PdfErrorBoundary pdfBase64={pdfBase64} pdfBytes={pdfBytes} title={docTitle}>
            <CustomPdfViewer pdfBase64={pdfBase64} pdfBytes={pdfBytes} />
          </PdfErrorBoundary>
        ) : (
          !compileError &&
          !isAnyCompiling && (
            <div className="text-ink-muted text-sm flex flex-col items-center gap-3">
              <FileCode className="h-12 w-12 opacity-30" />
              <span>Presiona &quot;PDF&quot; para generar la vista.</span>
            </div>
          )
        )}
      </div>
    </div>
  );

  const editorColumnNode = (
    <div className="h-full overflow-y-auto space-y-5 pr-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-primary">{docTitle}</h1>
        <p className="text-xs text-ink-muted mt-1">
          Nota por bloques con conversión automática a LaTeX.
        </p>
      </div>
      <BlockEditor
        initialContent={initialContent}
        onChange={handleBlocksChange}
        onReady={handleEditorReady}
        hasUnsavedChanges={hasUnsavedChanges}
        replaceBlocksAction={replaceBlocksAction}
        onBeforeAiBatchInsert={handleBeforeAiBatchInsert}
      />
    </div>
  );

  return (
    <div className="flex h-screen w-full flex-col bg-canvas text-ink-primary font-sans overflow-hidden">
      <header className="flex h-auto min-h-16 w-full shrink-0 flex-wrap items-center justify-between border-b border-border-subtle bg-surface/90 px-4 md:px-6 py-2.5 md:py-0 backdrop-blur-md z-20 gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => void handleBackToDashboard()}
            className="p-2 bg-surface-subtle/70 rounded-lg border border-border-subtle hover:bg-surface-subtle transition-colors shrink-0 cursor-pointer"
            title="Volver al dashboard"
            aria-label="Volver al dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text hidden sm:inline">Lema</span>
          </div>

          <span className="h-4 w-px bg-border-subtle shrink-0" />

          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex items-center gap-1 shrink-0">
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setDraftTitle(docTitle);
                    setIsEditingTitle(false);
                  }
                }}
                aria-label="Nuevo título del apunte"
                className="bg-surface-subtle border border-cyan-500 rounded-lg px-2.5 py-1 text-xs text-ink-primary outline-none w-40 sm:w-56"
              />
              <button type="submit" aria-label="Guardar título" className="p-1 text-emerald-500 cursor-pointer">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftTitle(docTitle);
                  setIsEditingTitle(false);
                }}
                aria-label="Cancelar"
                className="p-1 text-ink-muted cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftTitle(docTitle);
                setIsEditingTitle(true);
              }}
              title="Clic para renombrar el apunte"
              className="flex items-center gap-2 rounded-full bg-surface-subtle/70 px-3 py-1.5 text-xs border border-border-subtle text-ink-secondary hover:text-ink-primary shrink-0 cursor-pointer group"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="max-w-[120px] md:max-w-[200px] truncate font-medium">{docTitle}</span>
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
            </button>
          )}

          {saveStatus === 'error' ? (
            <button
              type="button"
              onClick={() => void performSave({ isAutoSave: false })}
              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full shrink-0 cursor-pointer"
              title="Haz clic para reintentar guardar"
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Error · Reintentar</span>
            </button>
          ) : saveStatus === 'dirty' || saveStatus === 'saving' ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              {saveStatus === 'saving' ? 'Guardando...' : 'Sin guardar'}
            </span>
          ) : lastSavedAt ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 hidden lg:inline-flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              {formatSavedAgo(lastSavedAt, nowTick)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar justify-start md:justify-end">
          <select
            value={latexOptions.columns}
            onChange={(e) => setLatexOptions({ columns: Number(e.target.value) as 1 | 2 | 3 })}
            className="bg-surface-subtle border border-border-subtle text-ink-primary text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 shrink-0"
            aria-label="Columnas en el PDF"
          >
            <option value={1}>1 Col</option>
            <option value={2}>2 Col</option>
            <option value={3}>3 Col</option>
          </select>

          <button
            type="button"
            onClick={() => void openSnapshotsModal()}
            title="Historial de versiones locales"
            aria-label="Historial de versiones"
            className="p-2 rounded-lg border border-border-subtle bg-surface-subtle/70 text-ink-secondary hover:text-ink-primary transition-colors shrink-0 cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSplitScreen(!splitScreen)}
            className={`hidden md:inline-flex p-2 rounded-lg border transition-all shrink-0 cursor-pointer ${
              splitScreen
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                : 'bg-surface-subtle/70 border-border-subtle text-ink-secondary hover:text-ink-primary'
            }`}
            title="Vista dividida redimensionable"
            aria-label="Alternar vista dividida"
          >
            <Columns className="w-4 h-4" />
          </button>

          {splitScreen ? (
            <div className="hidden md:flex rounded-lg bg-surface-subtle p-1 border border-border-subtle shrink-0">
              <button
                type="button"
                onClick={() => setSplitSideTab('preview')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                  splitSideTab === 'preview'
                    ? 'bg-surface text-ink-primary shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                PDF
              </button>
              <button
                type="button"
                onClick={() => setSplitSideTab('latex')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                  splitSideTab === 'latex'
                    ? 'bg-surface text-ink-primary shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                LaTeX
              </button>
            </div>
          ) : null}

          <div
            className={`flex rounded-lg bg-surface-subtle p-1 border border-border-subtle shrink-0 ${
              splitScreen ? 'md:hidden' : ''
            }`}
          >
            {(
              [
                { id: 'editor', label: 'Editor', Icon: FileText },
                { id: 'latex', label: 'LaTeX', Icon: FileCode },
                { id: 'preview', label: 'PDF', Icon: Eye },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 rounded-md px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-medium transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
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
            onClick={() => void performSave({ isAutoSave: false })}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            title="Guardar (Ctrl+S)"
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              saveStatus === 'error'
                ? 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-300'
                : hasUnsavedChanges
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
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

          <button
            type="button"
            onClick={handleCompile}
            disabled={isAnyCompiling || !hasBlocks}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isAnyCompiling ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>PDF</span>
          </button>

          <ThemeToggle compact />
        </div>
      </header>

      {/* Local Draft Recovery Banner */}
      {recoverableDraft && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-500/12 border-b border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Hay un borrador local más reciente sin guardar en el servidor.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setReplaceBlocksAction({ blocks: recoverableDraft, timestamp: Date.now() });
                blocksRef.current = recoverableDraft as unknown as Block[];
                dirtyVersionRef.current += 1;
                setSaveStatus('dirty');
                setRecoverableDraft(null);
                showToast('Borrador local restaurado.', 'success');
              }}
              className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-semibold hover:bg-amber-500 cursor-pointer"
            >
              Restaurar
            </button>
            <button
              type="button"
              onClick={() => {
                setRecoverableDraft(null);
                void clearLocalDraft(draftKey);
              }}
              className="px-2 py-1 text-ink-secondary hover:text-ink-primary cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-5 bg-canvas flex overflow-hidden">
        {splitScreen ? (
          <div className="hidden md:flex flex-1 overflow-hidden">
            <PanelGroup
              id="lema-doc-split"
              orientation="horizontal"
              defaultLayout={defaultLayout}
              onLayoutChanged={onLayoutChanged}
              className="flex-1 flex overflow-hidden"
            >
              <Panel id="doc-editor" defaultSize="52%" minSize="30%" className="flex flex-col overflow-hidden pr-2">
                {editorColumnNode}
              </Panel>
              <PanelResizeHandle className="w-2 relative group cursor-col-resize z-10 flex justify-center items-center">
                <div className="w-0.5 h-full bg-border-subtle group-hover:bg-cyan-500 group-active:bg-cyan-500 transition-colors" />
              </PanelResizeHandle>
              <Panel id="doc-side" defaultSize="48%" minSize="28%" className="flex flex-col overflow-hidden pl-2">
                {splitSideTab === 'latex' ? latexPanelNode : previewPanelNode}
              </Panel>
            </PanelGroup>
          </div>
        ) : null}

        {/* Single-pane (or mobile fallback even when splitScreen is toggled) */}
        <div className={`flex-1 overflow-hidden ${splitScreen ? 'flex md:hidden' : 'flex'}`}>
          <div
            className={`flex-1 h-full overflow-y-auto max-w-5xl mx-auto ${
              activeTab === 'editor' ? 'block' : 'hidden'
            }`}
          >
            {editorColumnNode}
          </div>
          <div
            className={`flex-1 h-full max-w-5xl mx-auto ${
              activeTab === 'latex' ? 'flex' : 'hidden'
            }`}
          >
            {latexPanelNode}
          </div>
          <div
            className={`flex-1 h-full max-w-5xl mx-auto ${
              activeTab === 'preview' ? 'flex' : 'hidden'
            }`}
          >
            {previewPanelNode}
          </div>
        </div>
      </main>

      {/* Local Snapshots Modal */}
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
                  Aún no hay snapshots guardados para este apunte.
                </p>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-subtle/60 border border-border-subtle"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-ink-primary truncate">{snap.label}</div>
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
                      onClick={() => {
                        setReplaceBlocksAction({ blocks: snap.payload, timestamp: Date.now() });
                        blocksRef.current = snap.payload as unknown as Block[];
                        dirtyVersionRef.current += 1;
                        setSaveStatus('dirty');
                        setShowSnapshots(false);
                        showToast('Versión restaurada.', 'success');
                      }}
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
