'use client';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import 'katex/dist/katex.min.css';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Block, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { getDefaultReactSlashMenuItems, SuggestionMenuController } from '@blocknote/react';
import { useEditorStore } from '@/store/useEditorStore';
import { useLemaStore } from '@/store/useLemaStore';
import { EditorErrorBoundary } from '@/components/ui/EditorErrorBoundary';
import type { DocumentSummary } from '@/lib/types/ast';
import {
  Sparkles,
  Cpu,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Undo2,
  Link as LinkIcon,
  Search,
  PenTool,
  FileText,
} from 'lucide-react';
import {
  schema,
  insertDefinition,
  insertTheorem,
  insertLemma,
  insertCorollary,
  insertCodeBlock,
  insertEquation,
  insertTikz,
  insertWikiLink,
} from './customBlocks';

interface BlockEditorProps {
  initialContent?: PartialBlock[];
  onChange?: (blocks: Block[]) => void;
  hasUnsavedChanges?: boolean;
  onReady?: (blocks: Block[]) => void;
  insertBlocksAction?: { blocks: PartialBlock[]; timestamp: number } | null;
  replaceBlocksAction?: { blocks: PartialBlock[]; timestamp: number } | null;
  onBeforeAiBatchInsert?: (label: string, currentBlocks: Block[]) => void;
}

const DEFAULT_DEMO_CONTENT: PartialBlock[] = [
  {
    type: 'heading',
    content: 'Espacio Métrico & Topología Básica',
  },
  {
    type: 'paragraph',
    content:
      'Documento estructurado por bloques interactivos. Usa el comando "/" para añadir elementos o presiona el botón de IA para editar de forma incremental.',
  },
  {
    type: 'math_box' as any,
    props: { type: 'definition', title: 'Definición: Métrica' } as any,
    content: 'Sea (X, d) un espacio métrico donde d: X × X → ℝ satisface la desigualdad triangular.',
  },
  {
    type: 'math_box' as any,
    props: { type: 'theorem', title: 'Teorema: Bola Abierta' } as any,
    content: 'Todo conjunto de la forma Br(x) es abierto en la topología inducida.',
  },
];

// ─── Unified AI Prompt Modal (Delta & Generate) ───────────────────────────────
function AiPromptModal({
  mode,
  isOpen,
  prompt,
  onPromptChange,
  tone,
  onToneChange,
  isProcessing,
  successMessage,
  errorMessage,
  targetBlock,
  onClose,
  onSubmit,
}: {
  mode: 'delta' | 'generate';
  isOpen: boolean;
  prompt: string;
  onPromptChange: (val: string) => void;
  tone: string;
  onToneChange: (val: string) => void;
  isProcessing: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  targetBlock: Block | null;
  onClose: () => void;
  onSubmit: (e?: React.FormEvent) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => textareaRef.current?.focus(), 40);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const isDelta = mode === 'delta';

  const renderTargetPreview = () => {
    if (!targetBlock) return null;
    const type = (targetBlock as any).type;
    const props = (targetBlock as any).props;
    const content = targetBlock.content;
    let contentText = '';
    if (Array.isArray(content)) {
      contentText = content.map((c: any) => c.text || '').join('');
    } else if (typeof content === 'string') {
      contentText = content;
    }

    return (
      <div className="mb-4 rounded-lg bg-canvas border border-border-subtle p-3 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-ink-muted">Tipo:</span>
          <span className="font-mono text-cyan-600 dark:text-cyan-400">{type}</span>
          {props?.title && (
            <>
              <span className="text-ink-muted">·</span>
              <span className="text-ink-primary font-medium">{props.title}</span>
            </>
          )}
        </div>
        {contentText ? (
          <div className="text-ink-secondary line-clamp-3 leading-relaxed">{contentText}</div>
        ) : (
          <div className="text-ink-muted italic">Sin contenido de texto</div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={isDelta ? 'Editar bloque con IA' : 'Generación libre con IA'}
        className="w-full max-w-lg rounded-2xl bg-surface border border-border-strong p-6 shadow-2xl relative animate-[fadeInScale_0.15s_ease-out]"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Cerrar modal de IA"
          className="absolute top-4 right-4 text-ink-muted hover:text-ink-primary transition-colors p-1 rounded cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-ink-primary flex items-center mb-4">
          <Sparkles
            className={`w-5 h-5 mr-2 ${isDelta ? 'text-cyan-500' : 'text-violet-500'}`}
          />
          {isDelta ? 'Editar Bloque con IA' : 'Generación Libre'}
        </h3>

        {isDelta && (
          <div>
            <p className="text-xs text-ink-muted mb-1 font-medium">Bloque objetivo:</p>
            {renderTargetPreview()}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor={`ai-tone-${mode}`} className="text-xs text-ink-secondary mb-1.5 block">
              Tono de generación:
            </label>
            <select
              id={`ai-tone-${mode}`}
              value={tone}
              onChange={(e) => onToneChange(e.target.value)}
              className="w-full bg-surface-subtle border border-border-subtle text-ink-primary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="normal">Normal / Estándar</option>
              <option value="academic">Académico Riguroso</option>
              <option value="intuitive">Explicación Intuitiva</option>
              <option value="summary">Resumido para Examen</option>
            </select>
          </div>

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                onSubmit();
              }
            }}
            className="w-full bg-surface-subtle border border-border-subtle p-3 rounded-lg text-sm text-ink-primary placeholder:text-ink-muted mb-3 focus:border-cyan-500 focus:outline-none resize-none transition-colors"
            placeholder={
              isDelta
                ? "Ej: 'Añade la demostración formal' o 'Explica esto más detalladamente'\n\nCtrl+Enter para enviar"
                : "Ej: 'Crea una guía de estudio sobre Álgebra Lineal con definiciones, teoremas y TikZ'\n\nCtrl+Enter para enviar"
            }
            rows={isDelta ? 3 : 4}
            disabled={isProcessing}
          />

          {successMessage && (
            <div className="mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/25">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/25">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-ink-muted">Ctrl+Enter para enviar</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing || !prompt.trim()}
                className={`disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  isDelta ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-violet-600 hover:bg-violet-500'
                }`}
              >
                {isProcessing && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {isProcessing ? 'Procesando...' : isDelta ? 'Aplicar Delta' : 'Generar Bloques'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── WikiLink Picker Modal ────────────────────────────────────────────────────
function WikiLinkPickerModal({
  isOpen,
  onClose,
  onSelectNote,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteTitle: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/documents?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) return;
        const data = (await res.json()) as DocumentSummary[];
        if (!cancelled && Array.isArray(data)) {
          setResults(data);
        }
      } catch {
        // Ignore network errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 140);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, query]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim();
  const hasExactMatch = results.some(
    (r) => r.title.trim().toLowerCase() === trimmedQuery.toLowerCase()
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Insertar enlace a nota"
        className="w-full max-w-md rounded-2xl bg-surface border border-border-strong shadow-2xl overflow-hidden animate-[fadeInScale_0.15s_ease-out]"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle">
          <Search className="w-4 h-4 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && trimmedQuery) {
                e.preventDefault();
                const target = results[0]?.title ?? trimmedQuery;
                onSelectNote(target);
              }
            }}
            placeholder="Buscar apunte o escribir nombre de enlace..."
            aria-label="Buscar apunte para enlazar"
            className="flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de enlaces"
            className="text-ink-muted hover:text-ink-primary p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="py-6 text-center text-xs text-ink-muted">Buscando notas...</div>
          ) : (
            <>
              {results.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => onSelectNote(doc.title)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  {doc.type === 'WHITEBOARD' ? (
                    <PenTool className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  )}
                  <span className="text-sm text-ink-primary truncate flex-1">{doc.title}</span>
                </button>
              ))}
              {trimmedQuery && !hasExactMatch && (
                <button
                  type="button"
                  onClick={() => onSelectNote(trimmedQuery)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-medium cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Enlazar a &ldquo;{trimmedQuery}&rdquo;</span>
                </button>
              )}
              {!trimmedQuery && results.length === 0 && (
                <div className="py-6 text-center text-xs text-ink-muted">
                  Escribe el nombre de la nota a enlazar.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main BlockEditor Component ───────────────────────────────────────────────
export default function BlockEditor({
  initialContent,
  onChange,
  hasUnsavedChanges,
  onReady,
  insertBlocksAction,
  replaceBlocksAction,
  onBeforeAiBatchInsert,
}: BlockEditorProps) {
  const showToast = useEditorStore((s) => s.showToast);
  const resolvedTheme = useLemaStore((s) => s.resolvedTheme);
  const [isMounted, setIsMounted] = useState(false);

  // AI States
  const [aiModalMode, setAiModalMode] = useState<'delta' | 'generate' | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratePrompt, setAiGeneratePrompt] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);
  const [targetBlock, setTargetBlock] = useState<Block | null>(null);
  const [aiTone, setAiTone] = useState<string>('normal');

  const [isWikiLinkModalOpen, setIsWikiLinkModalOpen] = useState(false);
  const [isUploadingOcr, setIsUploadingOcr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI Undo Stack
  const aiUndoStackRef = useRef<Block[]>([]);
  const [aiUndoCount, setAiUndoCount] = useState(0);

  useEffect(() => {
    return () => {
      if (aiCloseTimerRef.current) clearTimeout(aiCloseTimerRef.current);
    };
  }, []);

  const editor = useCreateBlockNote({
    schema,
    initialContent:
      initialContent === undefined
        ? DEFAULT_DEMO_CONTENT
        : initialContent.length > 0
        ? initialContent
        : ([{ type: 'paragraph', content: '' }] as PartialBlock[]),
  });

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const unsubscribe = editor.onChange(() => {
      onChangeRef.current?.(editor.document as Block[]);
    });
    return unsubscribe;
  }, [editor]);

  useEffect(() => {
    setIsMounted(true);
    if (onReady) {
      onReady(editor.document as Block[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle insert action (e.g. from Whiteboard OCR)
  useEffect(() => {
    if (insertBlocksAction && insertBlocksAction.blocks.length > 0) {
      let insertPos = editor.getTextCursorPosition()?.block;
      if (!insertPos) {
        insertPos = editor.document[editor.document.length - 1];
      }
      editor.insertBlocks(insertBlocksAction.blocks, insertPos, 'after');
    }
  }, [insertBlocksAction, editor]);

  // Handle full document replacement (e.g. restoring snapshot or local draft)
  useEffect(() => {
    if (replaceBlocksAction && replaceBlocksAction.blocks) {
      const nextBlocks =
        replaceBlocksAction.blocks.length > 0
          ? replaceBlocksAction.blocks
          : ([{ type: 'paragraph', content: '' }] as PartialBlock[]);
      editor.replaceBlocks(editor.document, nextBlocks);
    }
  }, [replaceBlocksAction, editor]);

  const handleOpenAiPrompt = () => {
    try {
      const pos = editor.getTextCursorPosition();
      if (!pos?.block) throw new Error('no block');
      setTargetBlock(pos.block as Block);
      setAiPrompt('');
      setAiSuccessMessage(null);
      setAiErrorMessage(null);
      setAiModalMode('delta');
    } catch {
      showToast('Por favor pon el cursor de texto dentro del bloque que deseas editar.', 'info');
    }
  };

  const handleAiDeltaSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiPrompt.trim() || !targetBlock) return;

    setIsProcessingAi(true);
    setAiSuccessMessage(null);
    setAiErrorMessage(null);

    try {
      const response = await fetch('/api/ai/delta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_block: targetBlock,
          user_instruction: aiPrompt,
          tone: aiTone,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const patch = await response.json();

      if (patch.action === 'UPDATE_BLOCK' && patch.patch) {
        aiUndoStackRef.current = [...aiUndoStackRef.current.slice(-19), { ...targetBlock }];
        setAiUndoCount(aiUndoStackRef.current.length);
        editor.updateBlock(targetBlock, patch.patch);
        setAiSuccessMessage('¡Bloque actualizado con éxito!');
        if (aiCloseTimerRef.current) clearTimeout(aiCloseTimerRef.current);
        aiCloseTimerRef.current = setTimeout(() => {
          setAiModalMode(null);
          setAiSuccessMessage(null);
          setAiPrompt('');
        }, 1200);
      } else {
        setAiErrorMessage('La IA no devolvió un parche válido.');
      }
    } catch (error: any) {
      setAiErrorMessage(error.message || 'Error desconocido');
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleAiUndo = () => {
    if (aiUndoStackRef.current.length === 0) return;
    const stack = [...aiUndoStackRef.current];
    const previousBlock = stack.pop()!;
    aiUndoStackRef.current = stack;
    setAiUndoCount(stack.length);
    try {
      editor.updateBlock(previousBlock.id, {
        type: previousBlock.type as any,
        props: (previousBlock as any).props,
        content: previousBlock.content as any,
      });
    } catch (e) {
      console.error('[AI Undo] Error al revertir el bloque:', e);
    }
  };

  const handleAiGenerateSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiGeneratePrompt.trim()) return;

    setIsProcessingAi(true);
    setAiSuccessMessage(null);
    setAiErrorMessage(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_instruction: aiGeneratePrompt,
          tone: aiTone,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.blocks && Array.isArray(data.blocks)) {
        onBeforeAiBatchInsert?.('Antes de Generación IA', editor.document as Block[]);
        let insertPos = editor.getTextCursorPosition()?.block;
        if (!insertPos) {
          insertPos = editor.document[editor.document.length - 1];
        }
        editor.insertBlocks(data.blocks, insertPos, 'after');

        setAiSuccessMessage('¡Bloques generados con éxito!');
        if (aiCloseTimerRef.current) clearTimeout(aiCloseTimerRef.current);
        aiCloseTimerRef.current = setTimeout(() => {
          setAiModalMode(null);
          setAiSuccessMessage(null);
          setAiGeneratePrompt('');
        }, 1200);
      } else {
        setAiErrorMessage('La IA no devolvió bloques válidos.');
      }
    } catch (error: any) {
      setAiErrorMessage(error.message || 'Error desconocido');
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingOcr(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = ((reader.result as string) || '').split(',')[1] || '';
          const response = await fetch('/api/ai/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Data, mimeType: file.type }),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const blocks = await response.json();
          if (blocks && blocks.length > 0) {
            onBeforeAiBatchInsert?.('Antes de OCR', editor.document as Block[]);
            const insertPos =
              editor.getTextCursorPosition()?.block ?? editor.document[editor.document.length - 1];
            editor.insertBlocks(blocks, insertPos, 'after');
          }
        } catch (err: any) {
          showToast(`Error procesando la imagen: ${err.message}`, 'error');
        } finally {
          setIsUploadingOcr(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        showToast('Error leyendo el archivo.', 'error');
        setIsUploadingOcr(false);
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('Error al leer el archivo de imagen.', 'error');
      setIsUploadingOcr(false);
    }
  };

  const handleInsertWikiLinkNote = useCallback(
    (noteTitle: string) => {
      setIsWikiLinkModalOpen(false);
      if (!noteTitle.trim()) return;
      try {
        editor.focus();
        editor.insertInlineContent([
          { type: 'wiki_link', props: { note: noteTitle.trim() } } as any,
          { type: 'text', text: ' ', styles: {} },
        ]);
      } catch {
        showToast('Coloca el cursor dentro de un bloque de texto para insertar el enlace.', 'info');
      }
    },
    [editor, showToast]
  );

  if (!isMounted) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-xl bg-surface border border-border-subtle">
        <div className="flex items-center space-x-3 text-cyan-600 dark:text-cyan-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-sm font-medium">Cargando Editor por Bloques...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl glass-panel glass-glow p-4 sm:p-6 transition-all duration-300">
      {/* AI Undo Floating Button */}
      {aiUndoCount > 0 && (
        <div className="absolute bottom-20 right-6 z-40 animate-[fadeInScale_0.2s_ease-out]">
          <button
            type="button"
            onClick={handleAiUndo}
            title={`Deshacer último cambio de IA (${aiUndoCount} en historial)`}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 shadow-lg transition-all cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Deshacer IA</span>
            <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/30 text-[10px] font-bold">
              {aiUndoCount}
            </span>
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400 border border-cyan-500/25">
            <Cpu className="mr-1.5 h-3.5 w-3.5" /> AST Engine
          </span>
          {hasUnsavedChanges && (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/25 animate-pulse">
              ● Sin guardar
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWikiLinkModalOpen(true)}
            title="Insertar enlace a otra nota ([[WikiLink]])"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink-secondary border border-border-subtle hover:text-ink-primary hover:border-border-strong transition-all cursor-pointer"
          >
            <LinkIcon className="h-3.5 w-3.5 text-indigo-500" />
            <span>Enlazar Nota</span>
          </button>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleOcrUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingOcr}
            title="Importar imagen con OCR a LaTeX"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-3 py-1.5 text-xs font-medium text-ink-secondary border border-border-subtle transition-all hover:text-ink-primary hover:border-border-strong disabled:opacity-50 cursor-pointer"
          >
            {isUploadingOcr ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            <span>{isUploadingOcr ? 'Procesando...' : 'OCR a LaTeX'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAiGeneratePrompt('');
              setAiSuccessMessage(null);
              setAiErrorMessage(null);
              setAiModalMode('generate');
            }}
            title="Generar bloques libremente con IA"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-all hover:brightness-110 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generación Libre</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAiPrompt}
            title="Editar el bloque actual con IA"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:brightness-110 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>IA Incremental</span>
          </button>
        </div>
      </div>

      {/* Main BlockNote Canvas */}
      <div className="min-h-[450px] text-ink-primary">
        <EditorErrorBoundary title="Error en el editor por bloques">
          <BlockNoteView editor={editor} theme={resolvedTheme} slashMenu={false}>
            <SuggestionMenuController
              triggerCharacter="/"
              getItems={async (query) =>
                [
                  ...getDefaultReactSlashMenuItems(editor),
                  insertDefinition(editor),
                  insertTheorem(editor),
                  insertLemma(editor),
                  insertCorollary(editor),
                  insertCodeBlock(editor),
                  insertEquation(editor),
                  insertTikz(editor),
                  insertWikiLink(editor, () => setIsWikiLinkModalOpen(true)),
                ].filter(
                  (item) =>
                    item.title.toLowerCase().includes(query.toLowerCase()) ||
                    (item.aliases &&
                      item.aliases.some((alias) => alias.toLowerCase().includes(query.toLowerCase())))
                )
              }
            />
          </BlockNoteView>
        </EditorErrorBoundary>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3 text-xs text-ink-muted">
        <span>
          <kbd className="rounded bg-surface-subtle border border-border-subtle px-1.5 py-0.5 text-ink-primary font-mono">
            /
          </kbd>{' '}
          para bloques ·{' '}
          <kbd className="rounded bg-surface-subtle border border-border-subtle px-1.5 py-0.5 text-ink-primary font-mono">
            $...$
          </kbd>{' '}
          inline math ·{' '}
          <kbd className="rounded bg-surface-subtle border border-border-subtle px-1.5 py-0.5 text-ink-primary font-mono">
            $$...$$
          </kbd>{' '}
          display math
        </span>
        <span>{editor.document.length} bloques</span>
      </div>

      {/* Unified AI Modal */}
      <AiPromptModal
        mode={aiModalMode ?? 'delta'}
        isOpen={aiModalMode !== null}
        prompt={aiModalMode === 'delta' ? aiPrompt : aiGeneratePrompt}
        onPromptChange={aiModalMode === 'delta' ? setAiPrompt : setAiGeneratePrompt}
        tone={aiTone}
        onToneChange={setAiTone}
        isProcessing={isProcessingAi}
        successMessage={aiSuccessMessage}
        errorMessage={aiErrorMessage}
        targetBlock={targetBlock}
        onClose={() => setAiModalMode(null)}
        onSubmit={aiModalMode === 'delta' ? handleAiDeltaSubmit : handleAiGenerateSubmit}
      />

      {/* Searchable WikiLink Picker */}
      <WikiLinkPickerModal
        isOpen={isWikiLinkModalOpen}
        onClose={() => setIsWikiLinkModalOpen(false)}
        onSelectNote={handleInsertWikiLinkNote}
      />
    </div>
  );
}
