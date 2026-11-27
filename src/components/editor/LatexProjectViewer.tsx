'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  FileCode,
  FileImage,
  Folder,
  Download,
  Play,
  Loader2,
  Plus,
  Trash2,
  Star,
  Copy,
  CheckCircle2,
  AlertTriangle,
  File,
  RefreshCw,
  Cpu,
  ChevronDown,
  ChevronUp,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
  useDefaultLayout,
  usePanelRef,
} from 'react-resizable-panels';
import { useLatexWasm, type WasmCompileStatus } from './useLatexWasm';
import { useEditorStore } from '@/store/useEditorStore';
import { useLemaStore } from '@/store/useLemaStore';
import { PdfErrorBoundary } from './PdfErrorBoundary';
import {
  CodeMirrorLatexEditor,
  type CodeMirrorLatexEditorHandle,
} from './CodeMirrorLatexEditor';
import { parseLatexLog, type LatexDiagnostic } from '@/lib/latexLogParser';
import { base64ToBlob, triggerBlobDownload } from '@/lib/base64';
import { saveLocalDraft, getLocalDraft, clearLocalDraft } from '@/lib/localDrafts';

const CustomPdfViewer = dynamic(() => import('./CustomPdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-ink-muted text-xs">
      Cargando visor PDF...
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LatexFileData {
  id: string;
  filename: string;
  content: string;
  isBinary: boolean;
  isMain: boolean;
}

export interface LatexProjectData {
  id: string;
  title: string;
  description?: string | null;
  pdfBase64?: string | null;
  hasPdf?: boolean;
  compiledAt?: string | null;
  files: LatexFileData[];
}

interface LatexProjectViewerProps {
  project: LatexProjectData;
  onProjectUpdate: React.Dispatch<React.SetStateAction<LatexProjectData>>;
  registerFlushSave?: (fn: (() => Promise<boolean>) | null) => void;
}

// ─── File tree & preview helpers ──────────────────────────────────────────────
function getFileIcon(filename: string, isMain: boolean) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (isMain) return <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'eps', 'pdf'].includes(ext ?? ''))
    return <FileImage className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
  return <FileCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
}

function getImageMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'svg':
      return 'image/svg+xml';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/png';
  }
}

function formatBytes(base64: string): string {
  const bytes = (base64.length * 3) / 4;
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSavedAgo(savedAt: number | null, nowTick: number): string {
  if (!savedAt) return '';
  const secs = Math.max(0, Math.floor((nowTick - savedAt) / 1000));
  if (secs < 5) return 'Guardado justo ahora';
  if (secs < 60) return `Guardado hace ${secs}s`;
  const mins = Math.floor(secs / 60);
  return `Guardado hace ${mins} min`;
}

// ─── Isolated Memoized Code Editor ─────────────────────────────────────────────
const LatexCodeEditor = React.memo(function LatexCodeEditor({
  selectedFile,
  value,
  isDirty,
  isCopied,
  isSaving,
  diagnostics,
  editorRef,
  isSidebarCollapsed,
  onToggleSidebar,
  onChangeValue,
  onCopy,
  onSave,
}: {
  selectedFile: LatexFileData | undefined;
  value: string;
  isDirty: boolean;
  isCopied: boolean;
  isSaving: boolean;
  diagnostics: LatexDiagnostic[];
  editorRef: React.RefObject<CodeMirrorLatexEditorHandle | null>;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onChangeValue: (fileId: string, newValue: string) => void;
  onCopy: (fileId: string, content: string) => void;
  onSave: () => void;
}) {
  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-muted flex-col gap-3">
        <File className="w-10 h-10 opacity-20" />
        <p className="text-sm">Selecciona un archivo del panel izquierdo</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-surface/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={isSidebarCollapsed ? 'Mostrar archivos' : 'Ocultar archivos'}
              title={isSidebarCollapsed ? 'Mostrar archivos' : 'Ocultar archivos'}
              className="hidden md:inline-flex p-1 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
          {getFileIcon(selectedFile.filename, selectedFile.isMain)}
          <span className="font-mono text-xs sm:text-sm text-ink-primary truncate">
            {selectedFile.filename}
          </span>
          {selectedFile.isMain && (
            <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
              main
            </span>
          )}
          {isDirty && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
              ● sin guardar
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!selectedFile.isBinary && (
            <button
              type="button"
              onClick={() => onCopy(selectedFile.id, value)}
              className="flex items-center gap-1 text-xs text-ink-secondary hover:text-ink-primary transition-colors px-2 py-1 rounded hover:bg-surface-subtle cursor-pointer"
            >
              {isCopied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Copiar</span>
            </button>
          )}
          {!selectedFile.isBinary && isDirty && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline transition-colors cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Guardar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedFile.isBinary ? (
          <div className="flex h-full items-center justify-center flex-col gap-3 text-ink-secondary p-4">
            <FileImage className="w-12 h-12 opacity-20" />
            <p className="text-sm">Archivo binario — {formatBytes(selectedFile.content)}</p>
            <p className="text-xs opacity-70 font-mono">{selectedFile.filename}</p>
            {/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(selectedFile.filename) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:${getImageMimeType(selectedFile.filename)};base64,${selectedFile.content}`}
                alt={selectedFile.filename}
                className="max-h-64 max-w-full rounded-lg border border-border-subtle object-contain mt-2"
              />
            )}
          </div>
        ) : (
          <CodeMirrorLatexEditor
            ref={editorRef}
            value={value}
            onChange={(nextVal) => onChangeValue(selectedFile.id, nextVal)}
            diagnostics={diagnostics}
            onSave={onSave}
          />
        )}
      </div>
    </>
  );
});

// ─── Isolated Memoized PDF Preview Panel ───────────────────────────────────────
const PdfPreviewPanel = React.memo(function PdfPreviewPanel({
  projectTitle,
  pdfBase64,
  pdfBytes,
  pdfUrl,
  isCompiling,
  isWasmBusy,
  wasmStatus,
  compileError,
  compilationLog,
  diagnostics,
  onSelectDiagnostic,
  onCompileWasm,
  onCompileServer,
  onDownloadPdf,
}: {
  projectTitle: string;
  pdfBase64?: string | null;
  pdfBytes?: Uint8Array | null;
  pdfUrl?: string | null;
  isCompiling: boolean;
  isWasmBusy: boolean;
  wasmStatus: WasmCompileStatus;
  compileError: string | null;
  compilationLog: string;
  diagnostics: LatexDiagnostic[];
  onSelectDiagnostic: (diag: LatexDiagnostic) => void;
  onCompileWasm: () => void;
  onCompileServer: () => void;
  onDownloadPdf: () => void;
}) {
  const [showLog, setShowLog] = useState(false);
  const hasPdfContent = Boolean(pdfBytes || pdfBase64 || pdfUrl);
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle shrink-0 z-20 bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            Vista PDF
          </span>
          {diagnostics.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLog((v) => !v)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer ${
                errorCount > 0
                  ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              {errorCount > 0 ? `${errorCount} error(es)` : `${warningCount} aviso(s)`}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(compilationLog || diagnostics.length > 0) && (
            <button
              type="button"
              onClick={() => setShowLog((v) => !v)}
              className="flex items-center gap-1 text-xs text-ink-secondary hover:text-ink-primary transition-colors px-2 py-1 rounded hover:bg-surface-subtle cursor-pointer"
              title="Ver diagnósticos y log de compilación"
            >
              <Terminal className="w-3.5 h-3.5" />
              Log
              {showLog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          {hasPdfContent && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary transition-colors px-2 py-1 rounded hover:bg-surface-subtle cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </button>
          )}
        </div>
      </div>

      {showLog && (compilationLog || diagnostics.length > 0) && (
        <div className="border-b border-border-subtle bg-canvas overflow-auto max-h-56 shrink-0 z-20 p-2 space-y-2">
          {diagnostics.length > 0 && (
            <div className="space-y-1">
              {diagnostics.map((diag) => (
                <button
                  key={diag.id}
                  type="button"
                  onClick={() => onSelectDiagnostic(diag)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-start gap-2 border transition-colors cursor-pointer ${
                    diag.severity === 'error'
                      ? 'bg-red-500/8 border-red-500/25 text-red-700 dark:text-red-300 hover:bg-red-500/15'
                      : 'bg-amber-500/8 border-amber-500/25 text-amber-800 dark:text-amber-300 hover:bg-amber-500/15'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] opacity-80">
                      {diag.file || 'archivo principal'}
                      {diag.line ? `:${diag.line}` : ''}
                    </div>
                    <div className="truncate">{diag.message}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {compilationLog && (
            <pre className="text-[10px] text-ink-muted font-mono p-2 leading-relaxed whitespace-pre-wrap bg-surface/60 rounded-lg border border-border-subtle">
              {compilationLog}
            </pre>
          )}
        </div>
      )}

      <div className="flex-1 relative overflow-hidden bg-canvas">
        {compileError && !isCompiling && !isWasmBusy && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-canvas/95 backdrop-blur-sm">
            <div className="p-3 bg-red-500/10 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-red-600 dark:text-red-400 font-semibold text-sm mb-3">
              Error de Compilación
            </h3>
            {diagnostics.filter((d) => d.severity === 'error').length > 0 && (
              <div className="w-full max-w-md space-y-1.5 mb-3 max-h-36 overflow-y-auto text-left">
                {diagnostics
                  .filter((d) => d.severity === 'error')
                  .slice(0, 6)
                  .map((diag) => (
                    <button
                      key={diag.id}
                      type="button"
                      onClick={() => onSelectDiagnostic(diag)}
                      className="w-full text-left px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-700 dark:text-red-300 hover:bg-red-500/20 cursor-pointer"
                    >
                      <span className="font-mono font-semibold mr-2">
                        {diag.file ? `${diag.file}` : 'Línea'}
                        {diag.line ? `:${diag.line}` : ''}
                      </span>
                      <span>{diag.message}</span>
                    </button>
                  ))}
              </div>
            )}
            <pre className="text-xs text-ink-secondary bg-surface rounded-xl p-4 border border-red-500/20 overflow-auto max-h-36 text-left font-mono w-full max-w-md whitespace-pre-wrap">
              {compileError}
            </pre>
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={onCompileWasm}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" /> Reintentar (WASM)
              </button>
              <button
                type="button"
                onClick={onCompileServer}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Reintentar (Servidor)
              </button>
            </div>
          </div>
        )}

        {isWasmBusy && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-canvas/85 backdrop-blur-sm">
            <div className="relative mb-6">
              <Cpu className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin absolute -top-1 -right-1" />
            </div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
              {wasmStatus === 'initializing'
                ? 'Iniciando motor TeX Live 2026…'
                : 'Compilando LaTeX en el navegador…'}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              {wasmStatus === 'initializing'
                ? 'Cargando WASM (solo la primera vez tarda ~5s)'
                : 'Procesando tu código LaTeX localmente'}
            </p>
          </div>
        )}

        {isCompiling && !isWasmBusy && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-canvas/85 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              Compilando con Tectonic…
            </p>
            <p className="text-xs text-ink-muted mt-1">Puede tomar unos segundos</p>
          </div>
        )}

        {hasPdfContent ? (
          <PdfErrorBoundary
            pdfBase64={pdfBase64}
            pdfBytes={pdfBytes}
            pdfUrl={pdfUrl}
            title={projectTitle}
          >
            <CustomPdfViewer pdfBase64={pdfBase64} pdfBytes={pdfBytes} pdfUrl={pdfUrl} />
          </PdfErrorBoundary>
        ) : (
          !isCompiling &&
          !isWasmBusy &&
          !compileError && (
            <div className="flex flex-col items-center justify-center h-full text-ink-muted gap-4 p-6">
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15">
                <Cpu className="w-10 h-10 text-indigo-500/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-ink-secondary">Sin PDF compilado</p>
                <p className="text-xs opacity-75 mt-1">
                  Presiona &quot;Compilar PDF (WASM)&quot; para generar la vista
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LatexProjectViewer({
  project,
  onProjectUpdate,
  registerFlushSave,
}: LatexProjectViewerProps) {
  const showToast = useEditorStore((s) => s.showToast);
  const setConfirmAction = useLemaStore((s) => s.setConfirmAction);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    project.files.find((f) => f.isMain)?.id ?? project.files[0]?.id ?? null
  );
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});
  const [wasmPdfBytes, setWasmPdfBytes] = useState<Uint8Array | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const [recoverableDraft, setRecoverableDraft] = useState<Record<string, string> | null>(null);

  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [compilationLog, setCompilationLog] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const codeEditorRef = useRef<CodeMirrorLatexEditorHandle | null>(null);
  const sidebarPanelRef = usePanelRef();
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const dirtyVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const inFlightPromiseRef = useRef<Promise<boolean> | null>(null);

  const [mobileTab, setMobileTab] = useState<'files' | 'editor' | 'pdf'>('editor');
  const [isMobile, setIsMobile] = useState(false);

  const projectRef = useRef(project);
  projectRef.current = project;
  const editedContentsRef = useRef(editedContents);
  editedContentsRef.current = editedContents;
  const wasmPdfBytesRef = useRef(wasmPdfBytes);
  wasmPdfBytesRef.current = wasmPdfBytes;

  const draftKey = `latex-project:${project.id}`;

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'lema-latex-viewer',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  // Check IndexedDB for unsaved local recovery draft
  useEffect(() => {
    let mounted = true;
    void getLocalDraft<Record<string, string>>(draftKey).then((draft) => {
      if (!mounted || !draft?.payload) return;
      const entries = Object.entries(draft.payload).filter(([fid, val]) => {
        const orig = projectRef.current.files.find((f) => f.id === fid);
        return orig !== undefined && orig.content !== val;
      });
      if (entries.length > 0) {
        setRecoverableDraft(Object.fromEntries(entries));
      }
    });
    return () => {
      mounted = false;
    };
  }, [draftKey]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // ─── Drag and Drop ────────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fakeEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleAddFilesFromDisk(fakeEvent);
    }
  };

  // ── WASM compilation hook ──────────────────────────────────────────────────
  const { compile: compileWasm, status: wasmStatus } = useLatexWasm();

  const selectedFile = useMemo(
    () => project.files.find((f) => f.id === selectedFileId),
    [project.files, selectedFileId]
  );

  const diagnostics = useMemo(() => parseLatexLog(compilationLog), [compilationLog]);

  const activeFileDiagnostics = useMemo(() => {
    if (!selectedFile) return [];
    return diagnostics.filter((d) => {
      if (!d.file) return selectedFile.isMain;
      return (
        d.file === selectedFile.filename ||
        selectedFile.filename.endsWith(`/${d.file}`) ||
        d.file.endsWith(`/${selectedFile.filename}`)
      );
    });
  }, [diagnostics, selectedFile]);

  const handleSelectDiagnostic = useCallback(
    (diag: LatexDiagnostic) => {
      let targetFile = projectRef.current.files.find((f) => f.isMain);
      if (diag.file) {
        const match = projectRef.current.files.find(
          (f) =>
            f.filename === diag.file ||
            f.filename.endsWith(`/${diag.file}`) ||
            diag.file?.endsWith(`/${f.filename}`)
        );
        if (match) targetFile = match;
      }
      if (targetFile) {
        setSelectedFileId(targetFile.id);
      }
      if (isMobile) {
        setMobileTab('editor');
      }
      if (diag.line) {
        setTimeout(() => {
          codeEditorRef.current?.jumpToLine(diag.line!);
        }, 50);
      }
    },
    [isMobile]
  );

  const hasUnsavedChanges = useMemo(
    () =>
      Object.keys(editedContents).some(
        (fid) => editedContents[fid] !== project.files.find((f) => f.id === fid)?.content
      ),
    [editedContents, project.files]
  );

  const hasUnsavedRef = useRef(hasUnsavedChanges);
  hasUnsavedRef.current = hasUnsavedChanges;

  const getFilesWithEdits = useCallback((): LatexFileData[] => {
    const currentProj = projectRef.current;
    const currentEdits = editedContentsRef.current;
    return currentProj.files.map((f) => ({
      ...f,
      content: currentEdits[f.id] !== undefined ? currentEdits[f.id] : f.content,
    }));
  }, []);

  // ─── Save pending files in batch ────────────────────────────────────────────
  const savePendingFiles = useCallback(
    async ({ isAutoSave = false, keepalive = false }: { isAutoSave?: boolean; keepalive?: boolean } = {}): Promise<boolean> => {
      if (isSavingRef.current && inFlightPromiseRef.current) {
        return inFlightPromiseRef.current;
      }

      const targetVersion = dirtyVersionRef.current;
      const currentProj = projectRef.current;
      const currentEdits = editedContentsRef.current;

      const dirtyEntries = Object.entries(currentEdits).filter(([fileId, content]) => {
        const original = currentProj.files.find((f) => f.id === fileId);
        return original !== undefined && content !== original.content;
      });

      if (dirtyEntries.length === 0) {
        savedVersionRef.current = Math.max(savedVersionRef.current, targetVersion);
        setSaveError(false);
        return true;
      }

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      const savedMap = new Map(dirtyEntries);
      const bodyStr = JSON.stringify({
        id: currentProj.id,
        action: 'update_files',
        files: dirtyEntries.map(([fileId, content]) => ({ fileId, content })),
      });

      const run = (async () => {
        isSavingRef.current = true;
        setIsSavingFile(true);
        let shouldRetryFollowUp = false;

        try {
          const res = await fetch('/api/latex-projects', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
            keepalive: keepalive && bodyStr.length < 60_000,
          });

          if (res.status === 401) {
            setSaveError(true);
            await saveLocalDraft(draftKey, editedContentsRef.current);
            showToast('Sesión expirada. Guardado localmente en IndexedDB.', 'error', 6000);
            return false;
          }

          if (!res.ok) {
            setSaveError(true);
            await saveLocalDraft(draftKey, editedContentsRef.current);
            showToast('Error al guardar en servidor (respaldado localmente).', 'error');
            return false;
          }

          projectRef.current = {
            ...projectRef.current,
            files: projectRef.current.files.map((f) =>
              savedMap.has(f.id) ? { ...f, content: savedMap.get(f.id)! } : f
            ),
          };

          onProjectUpdate((prev) => ({
            ...prev,
            files: prev.files.map((f) => (savedMap.has(f.id) ? { ...f, content: savedMap.get(f.id)! } : f)),
          }));

          setEditedContents((prev) => {
            const next = { ...prev };
            for (const [fileId, savedContent] of savedMap.entries()) {
              if (next[fileId] === savedContent) {
                delete next[fileId];
              }
            }
            editedContentsRef.current = next;
            return next;
          });

          savedVersionRef.current = Math.max(savedVersionRef.current, targetVersion);
          setSaveError(false);
          setLastSavedAt(Date.now());
          setNowTick(Date.now());

          if (dirtyVersionRef.current > savedVersionRef.current) {
            shouldRetryFollowUp = true;
            return false;
          }

          await clearLocalDraft(draftKey);
          if (!isAutoSave) {
            showToast('Cambios guardados.', 'success');
          }
          return true;
        } catch {
          setSaveError(true);
          await saveLocalDraft(draftKey, editedContentsRef.current);
          showToast('Error de red al guardar (respaldado localmente).', 'error');
          return false;
        } finally {
          isSavingRef.current = false;
          inFlightPromiseRef.current = null;
          setIsSavingFile(false);
          if (shouldRetryFollowUp) {
            void savePendingFilesRef.current({ isAutoSave: true });
          }
        }
      })();

      inFlightPromiseRef.current = run;
      return run;
    },
    [draftKey, onProjectUpdate, showToast]
  );

  const savePendingFilesRef = useRef(savePendingFiles);
  useEffect(() => {
    savePendingFilesRef.current = savePendingFiles;
  }, [savePendingFiles]);

  const flushSave = useCallback(async (): Promise<boolean> => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    while (dirtyVersionRef.current > savedVersionRef.current || isSavingRef.current) {
      const ok = await savePendingFilesRef.current({ isAutoSave: true });
      if (!ok && (dirtyVersionRef.current > savedVersionRef.current || isSavingRef.current)) {
        if (!isSavingRef.current) return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    if (!registerFlushSave) return;
    registerFlushSave(flushSave);
    return () => registerFlushSave(null);
  }, [registerFlushSave, flushSave]);

  // Debounced autosave (1.8s) + local draft backup
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    void saveLocalDraft(draftKey, editedContents);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      void savePendingFilesRef.current({ isAutoSave: true });
    }, 1800);
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [draftKey, editedContents, hasUnsavedChanges]);

  // Ctrl+S / Cmd+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void savePendingFilesRef.current({ isAutoSave: false });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Protect against closing tab or hiding page with unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current || dirtyVersionRef.current > savedVersionRef.current || isSavingRef.current) {
        void saveLocalDraft(draftKey, editedContentsRef.current);
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'hidden' &&
        (hasUnsavedRef.current || dirtyVersionRef.current > savedVersionRef.current)
      ) {
        void saveLocalDraft(draftKey, editedContentsRef.current);
        void savePendingFilesRef.current({ isAutoSave: true, keepalive: true });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [draftKey]);

  // ─── Compile via WASM (browser) ─────────────────────────────────────────────
  const handleCompileWasm = useCallback(async () => {
    if (wasmStatus === 'initializing' || wasmStatus === 'compiling') return;
    setCompileError(null);
    setCompilationLog('');

    await flushSave();
    const filesWithEdits = getFilesWithEdits();

    const result = await compileWasm(filesWithEdits);
    setCompilationLog(result.log);

    if (result.error || !result.pdfBase64) {
      setCompileError(result.error ?? 'Compilación fallida.');
      return;
    }

    setWasmPdfBytes(result.pdfBytes);
    onProjectUpdate((prev) => ({
      ...prev,
      pdfBase64: null,
      hasPdf: true,
      compiledAt: new Date().toISOString(),
    }));

    try {
      const res = await fetch('/api/latex-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectRef.current.id, action: 'set_pdf', pdfBase64: result.pdfBase64 }),
      });
      if (!res.ok) {
        showToast('PDF compilado localmente, pero no se pudo guardar en el servidor.', 'info');
      }
    } catch {
      showToast('PDF compilado localmente (sin respaldo en servidor).', 'info');
    }
  }, [compileWasm, flushSave, getFilesWithEdits, onProjectUpdate, showToast, wasmStatus]);

  // ─── Compile via server (fallback) ──────────────────────────────────────────
  const handleCompileServer = useCallback(async () => {
    setIsCompiling(true);
    setCompileError(null);
    setCompilationLog('');

    try {
      const saved = await flushSave();
      if (!saved && (hasUnsavedRef.current || dirtyVersionRef.current > savedVersionRef.current)) {
        throw new Error('No se pudieron guardar los cambios en el servidor antes de compilar.');
      }

      const res = await fetch('/api/latex-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectRef.current.id, action: 'compile' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || `HTTP ${res.status}`);
      }

      const updated: { id: string; compiledAt?: string | null; hasPdf?: boolean } = await res.json();
      setWasmPdfBytes(null);
      onProjectUpdate((prev) => ({
        ...prev,
        pdfBase64: null,
        hasPdf: updated.hasPdf ?? true,
        compiledAt: updated.compiledAt ?? new Date().toISOString(),
      }));
    } catch (e: any) {
      setCompileError(e.message || 'Error desconocido al compilar');
    } finally {
      setIsCompiling(false);
    }
  }, [flushSave, onProjectUpdate]);

  // ─── Add file from disk ──────────────────────────────────────────────────────
  const handleAddFilesFromDisk = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const addedFiles: LatexFileData[] = [];

    try {
      for (const file of files) {
        const isBinary = /\.(png|jpg|jpeg|gif|svg|webp|eps|pdf|bmp|tiff)$/i.test(file.name);
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          if (isBinary) {
            reader.onloadend = () => resolve(((reader.result as string) || '').split(',')[1] || '');
            reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
            reader.readAsDataURL(file);
          } else {
            reader.onloadend = () => resolve((reader.result as string) || '');
            reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
            reader.readAsText(file);
          }
        });

        const res = await fetch('/api/latex-projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: projectRef.current.id,
            action: 'add_file',
            filename: file.name,
            content,
            isBinary,
            isMain: false,
          }),
        });

        if (res.ok) {
          const newFile: LatexFileData = await res.json();
          addedFiles.push(newFile);
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.error || `No se pudo subir ${file.name}.`, 'error');
        }
      }

      if (addedFiles.length > 0) {
        onProjectUpdate((prev) => ({ ...prev, files: [...prev.files, ...addedFiles] }));
        setSelectedFileId(addedFiles[addedFiles.length - 1].id);
      }
    } catch (err: any) {
      showToast(err?.message || 'Error al subir archivo(s).', 'error');
    } finally {
      if (addFileInputRef.current) addFileInputRef.current.value = '';
    }
  };

  // ─── Add blank new file ───────────────────────────────────────────────────────
  const handleAddBlankFile = async () => {
    if (!newFilename.trim()) return;
    try {
      const res = await fetch('/api/latex-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectRef.current.id,
          action: 'add_file',
          filename: newFilename.trim(),
          content: '',
          isBinary: false,
          isMain: false,
        }),
      });
      if (res.ok) {
        const newFile: LatexFileData = await res.json();
        onProjectUpdate((prev) => ({ ...prev, files: [...prev.files, newFile] }));
        setSelectedFileId(newFile.id);
        setNewFilename('');
        setShowAddFile(false);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Error al crear el archivo.', 'error');
      }
    } catch {
      showToast('Error de red al crear el archivo.', 'error');
    }
  };

  // ─── Delete file (via ConfirmModal) ───────────────────────────────────────────
  const handleDeleteFile = (fileId: string, filename: string) => {
    if (projectRef.current.files.length <= 1) {
      showToast('Debe existir al menos un archivo en el proyecto.', 'info');
      return;
    }

    setConfirmAction({
      title: 'Eliminar archivo',
      message: `¿Eliminar "${filename}" de este proyecto LaTeX?`,
      confirmText: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/latex-projects', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: projectRef.current.id, action: 'delete_file', fileId }),
          });
          if (!res.ok) {
            showToast('Error al eliminar el archivo.', 'error');
            return;
          }
          onProjectUpdate((prev) => {
            const remaining = prev.files.filter((f) => f.id !== fileId);
            if (selectedFileId === fileId) {
              setSelectedFileId(remaining[0]?.id ?? null);
            }
            return { ...prev, files: remaining };
          });
          setEditedContents((prev) => {
            if (!(fileId in prev)) return prev;
            const next = { ...prev };
            delete next[fileId];
            editedContentsRef.current = next;
            return next;
          });
        } catch {
          showToast('Error de red al eliminar el archivo.', 'error');
        }
      },
    });
  };

  // ─── Set as main file ─────────────────────────────────────────────────────────
  const handleSetMain = async (fileId: string) => {
    try {
      const res = await fetch('/api/latex-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectRef.current.id,
          action: 'set_main',
          fileId,
        }),
      });
      if (res.ok) {
        onProjectUpdate((prev) => ({
          ...prev,
          files: prev.files.map((f) => ({ ...f, isMain: f.id === fileId })),
        }));
      } else {
        showToast('No se pudo cambiar el archivo principal.', 'error');
      }
    } catch {
      showToast('Error de red al cambiar el archivo principal.', 'error');
    }
  };

  // ─── Copy file content ────────────────────────────────────────────────────────
  const handleCopy = useCallback(
    async (fileId: string, content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedFile(fileId);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopiedFile(null), 2000);
      } catch {
        showToast('No se pudo copiar al portapapeles.', 'error');
      }
    },
    [showToast]
  );

  // ─── Download PDF ─────────────────────────────────────────────────────────────
  const handleDownloadPdf = useCallback(() => {
    const safeName =
      (projectRef.current.title || 'documento').replace(/[^a-z0-9_\-áéíóúñ ]/gi, '_').trim() ||
      'documento';

    if (wasmPdfBytesRef.current && wasmPdfBytesRef.current.length > 0) {
      triggerBlobDownload(
        new Blob([new Uint8Array(wasmPdfBytesRef.current)], { type: 'application/pdf' }),
        `${safeName}.pdf`
      );
      return;
    }

    const b64 = projectRef.current.pdfBase64;
    if (b64) {
      triggerBlobDownload(base64ToBlob(b64, 'application/pdf'), `${safeName}.pdf`);
      return;
    }

    if (projectRef.current.hasPdf || projectRef.current.compiledAt) {
      const version = projectRef.current.compiledAt
        ? encodeURIComponent(projectRef.current.compiledAt)
        : '1';
      const a = document.createElement('a');
      a.href = `/api/latex-projects/${projectRef.current.id}/pdf?v=${version}&download=1`;
      a.download = `${safeName}.pdf`;
      a.click();
    }
  }, []);

  const serverPdfUrl = useMemo(() => {
    if (wasmPdfBytes || project.pdfBase64) return null;
    if (project.hasPdf || project.compiledAt) {
      const version = project.compiledAt ? encodeURIComponent(project.compiledAt) : '1';
      return `/api/latex-projects/${project.id}/pdf?v=${version}`;
    }
    return null;
  }, [wasmPdfBytes, project.pdfBase64, project.hasPdf, project.compiledAt, project.id]);

  const handleChangeEditorValue = useCallback((fileId: string, newValue: string) => {
    editedContentsRef.current = { ...editedContentsRef.current, [fileId]: newValue };
    dirtyVersionRef.current += 1;
    setEditedContents((prev) => ({ ...prev, [fileId]: newValue }));
  }, []);

  const handleSaveTrigger = useCallback(() => {
    void savePendingFilesRef.current({ isAutoSave: false });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    const panel = sidebarPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
      setIsSidebarCollapsed(false);
    } else {
      panel.collapse();
      setIsSidebarCollapsed(true);
    }
  }, [sidebarPanelRef]);

  const isWasmBusy = wasmStatus === 'initializing' || wasmStatus === 'compiling';

  const currentEditorValue = selectedFile
    ? editedContents[selectedFile.id] !== undefined
      ? editedContents[selectedFile.id]
      : selectedFile.content
    : '';
  const isSelectedDirty = Boolean(
    selectedFile &&
      editedContents[selectedFile.id] !== undefined &&
      editedContents[selectedFile.id] !== selectedFile.content
  );

  // ─── Render Sidebar ───────────────────────────────────────────────────────────
  const renderSidebar = () => (
    <div
      className="h-full flex flex-col overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="px-3 py-2.5 border-b border-border-subtle flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Archivos</span>
        <div className="flex gap-1">
          <input
            ref={addFileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={handleAddFilesFromDisk}
          />
          <button
            type="button"
            onClick={() => addFileInputRef.current?.click()}
            title="Subir archivo(s) desde disco"
            aria-label="Subir archivos desde disco"
            className="p-1 rounded hover:bg-surface-subtle text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setShowAddFile((v) => !v)}
            title="Crear archivo nuevo"
            aria-label="Crear archivo nuevo"
            className="p-1 rounded hover:bg-surface-subtle text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showAddFile && (
        <div className="px-3 py-2 border-b border-border-subtle flex gap-2">
          <input
            type="text"
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void handleAddBlankFile()}
            placeholder="nombre.tex"
            aria-label="Nombre del nuevo archivo"
            autoFocus
            className="flex-1 bg-surface-subtle border border-border-subtle rounded px-2 py-1 text-xs text-ink-primary focus:outline-none focus:border-cyan-500 min-w-0"
          />
          <button
            type="button"
            onClick={() => void handleAddBlankFile()}
            className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold shrink-0 cursor-pointer"
          >
            OK
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {project.files.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-8">Sin archivos</p>
        ) : (
          project.files.map((file) => {
            const isSelected = file.id === selectedFileId;
            const isDirty =
              editedContents[file.id] !== undefined && editedContents[file.id] !== file.content;
            return (
              <div
                key={file.id}
                className={`group flex items-center gap-1.5 px-3 py-2 transition-colors text-xs ${
                  isSelected
                    ? 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-r-2 border-cyan-500'
                    : 'text-ink-secondary hover:bg-surface-subtle/60 hover:text-ink-primary'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedFileId(file.id)}
                  className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                >
                  {getFileIcon(file.filename, file.isMain)}
                  <span className="flex-1 truncate font-mono">{file.filename}</span>
                </button>
                {isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Cambios sin guardar" />
                )}
                <div className="flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity shrink-0">
                  {!file.isMain && !file.isBinary && (
                    <button
                      type="button"
                      onClick={() => void handleSetMain(file.id)}
                      title="Establecer como archivo principal"
                      aria-label={`Marcar ${file.filename} como principal`}
                      className="p-0.5 hover:text-amber-500 text-ink-muted transition-colors cursor-pointer"
                    >
                      <Star className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file.id, file.filename)}
                    title="Eliminar archivo"
                    aria-label={`Eliminar ${file.filename}`}
                    className="p-0.5 hover:text-red-500 text-ink-muted transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-border-subtle space-y-2">
        {saveError ? (
          <button
            type="button"
            onClick={() => void savePendingFilesRef.current({ isAutoSave: false })}
            className="text-[11px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3" /> Error · Reintentar
          </button>
        ) : hasUnsavedChanges ? (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
            {isSavingFile ? 'Guardando...' : 'Cambios pendientes'}
          </p>
        ) : lastSavedAt ? (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {formatSavedAgo(lastSavedAt, nowTick)}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleCompileWasm}
          disabled={isCompiling || isWasmBusy}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          {isCompiling || isWasmBusy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Compilar PDF (WASM)
        </button>

        {project.compiledAt && (
          <p className="text-[10px] text-ink-muted text-center">
            Último:{' '}
            {new Date(project.compiledAt).toLocaleString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );

  const recoveryBanner = recoverableDraft && (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-500/12 border-b border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 shrink-0">
      <div className="flex items-center gap-2">
        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
        <span>Se encontró un borrador local más reciente sin sincronizar.</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            editedContentsRef.current = { ...editedContentsRef.current, ...recoverableDraft };
            dirtyVersionRef.current += 1;
            setEditedContents((prev) => ({ ...prev, ...recoverableDraft }));
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
  );

  const editorNode = (
    <LatexCodeEditor
      selectedFile={selectedFile}
      value={currentEditorValue}
      isDirty={isSelectedDirty}
      isCopied={copiedFile === selectedFile?.id}
      isSaving={isSavingFile}
      diagnostics={activeFileDiagnostics}
      editorRef={codeEditorRef}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={!isMobile ? handleToggleSidebar : undefined}
      onChangeValue={handleChangeEditorValue}
      onCopy={handleCopy}
      onSave={handleSaveTrigger}
    />
  );

  const pdfNode = (
    <PdfPreviewPanel
      projectTitle={project.title}
      pdfBase64={project.pdfBase64}
      pdfBytes={wasmPdfBytes}
      pdfUrl={serverPdfUrl}
      isCompiling={isCompiling}
      isWasmBusy={isWasmBusy}
      wasmStatus={wasmStatus}
      compileError={compileError}
      compilationLog={compilationLog}
      diagnostics={diagnostics}
      onSelectDiagnostic={handleSelectDiagnostic}
      onCompileWasm={handleCompileWasm}
      onCompileServer={handleCompileServer}
      onDownloadPdf={handleDownloadPdf}
    />
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full bg-canvas">
        {recoveryBanner}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className={`flex-1 flex-col overflow-hidden bg-surface/60 ${mobileTab === 'files' ? 'flex' : 'hidden'}`}>
            {renderSidebar()}
          </div>
          <div className={`flex-1 flex-col overflow-hidden bg-canvas ${mobileTab === 'editor' ? 'flex' : 'hidden'}`}>
            {editorNode}
          </div>
          <div className={`flex-1 flex-col min-w-0 bg-surface/40 relative overflow-hidden ${mobileTab === 'pdf' ? 'flex' : 'hidden'}`}>
            {pdfNode}
          </div>
        </div>

        <div className="flex h-14 bg-surface border-t border-border-subtle shrink-0 z-50">
          <button
            type="button"
            onClick={() => setMobileTab('files')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer ${
              mobileTab === 'files' ? 'text-cyan-600 dark:text-cyan-400' : 'text-ink-muted'
            }`}
          >
            <Folder className="w-5 h-5" />
            <span className="text-[10px]">Archivos</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer ${
              mobileTab === 'editor' ? 'text-cyan-600 dark:text-cyan-400' : 'text-ink-muted'
            }`}
          >
            <FileCode className="w-5 h-5" />
            <span className="text-[10px]">Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('pdf')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer ${
              mobileTab === 'pdf' ? 'text-cyan-600 dark:text-cyan-400' : 'text-ink-muted'
            }`}
          >
            <FileImage className="w-5 h-5" />
            <span className="text-[10px]">Ver PDF</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-canvas">
      {recoveryBanner}
      <PanelGroup
        id="lema-latex-viewer"
        orientation="horizontal"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        className="flex-1 flex w-full overflow-hidden"
      >
        <Panel
          id="latex-files"
          panelRef={sidebarPanelRef}
          defaultSize="16%"
          minSize="12%"
          maxSize="32%"
          collapsible
          collapsedSize="0%"
          onResize={(size) => {
            setIsSidebarCollapsed(size.asPercentage <= 1);
          }}
          className={`flex flex-col min-w-0 bg-surface/60 overflow-hidden transition-colors ${
            isDragging ? 'ring-2 ring-cyan-500 bg-cyan-500/10' : ''
          }`}
        >
          {renderSidebar()}
        </Panel>

        <PanelResizeHandle className="w-2 relative group cursor-col-resize z-10 flex justify-center items-center">
          <div className="w-0.5 h-full bg-border-subtle group-hover:bg-cyan-500 group-active:bg-cyan-500 transition-colors" />
        </PanelResizeHandle>

        <Panel
          id="latex-editor"
          defaultSize="42%"
          minSize="22%"
          className="flex flex-col overflow-hidden min-w-0 bg-canvas"
        >
          {editorNode}
        </Panel>

        <PanelResizeHandle className="w-2 relative group cursor-col-resize z-10 flex justify-center items-center">
          <div className="w-0.5 h-full bg-border-subtle group-hover:bg-cyan-500 group-active:bg-cyan-500 transition-colors" />
        </PanelResizeHandle>

        <Panel
          id="latex-pdf"
          defaultSize="42%"
          minSize="22%"
          className="flex flex-col min-w-0 bg-surface/40 overflow-hidden relative"
        >
          {pdfNode}
        </Panel>
      </PanelGroup>
    </div>
  );
}
