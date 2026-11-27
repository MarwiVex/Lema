'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { defaultBlockSpecs, defaultInlineContentSpecs, BlockNoteSchema } from '@blocknote/core';
import { createReactBlockSpec, createReactInlineContentSpec } from '@blocknote/react';
import katex from 'katex';
import { Eye, EyeOff, Link as LinkIcon } from 'lucide-react';

// ─── Type labels ──────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  definition: 'Definición',
  theorem: 'Teorema',
  lemma: 'Lema',
  corollary: 'Corolario',
  equation: 'Ecuación',
};

// ─── Theme map (Light + Dark) ─────────────────────────────────────────────────
const THEME: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  definition: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/8 dark:bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/40',
  },
  theorem: {
    border: 'border-indigo-500',
    bg: 'bg-indigo-500/8 dark:bg-indigo-500/10',
    text: 'text-indigo-700 dark:text-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/40',
  },
  lemma: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/8 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
  },
  corollary: {
    border: 'border-violet-500',
    bg: 'bg-violet-500/8 dark:bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-400',
    badge: 'bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-500/40',
  },
  equation: {
    border: 'border-pink-500',
    bg: 'bg-pink-500/8 dark:bg-pink-500/10',
    text: 'text-pink-700 dark:text-pink-400',
    badge: 'bg-pink-500/15 text-pink-800 dark:text-pink-300 border-pink-500/40',
  },
};

// ─── Render KaTeX from plain text ─────────────────────────────────────────────
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapePlainWithBreaks(s: string): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br />');
}

function renderLatexText(text: string): string {
  if (!text.trim()) return '';

  const parts: string[] = [];
  const mathPattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapePlainWithBreaks(text.slice(lastIndex, match.index)));
    }
    const token = match[0];
    if (token.startsWith('$$')) {
      const math = token.slice(2, -2);
      try {
        parts.push(
          `<div class="katex-display-wrap">${katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
          })}</div>`
        );
      } catch {
        parts.push(
          `<div class="text-red-500 dark:text-red-400 text-xs font-mono bg-red-500/10 px-2 py-1 rounded">Error: ${escapeHtml(math)}</div>`
        );
      }
    } else {
      const math = token.slice(1, -1);
      try {
        parts.push(katex.renderToString(math.trim(), { displayMode: false, throwOnError: false }));
      } catch {
        parts.push(`<span class="text-red-500 dark:text-red-400 text-xs font-mono">$${escapeHtml(math)}$</span>`);
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(escapePlainWithBreaks(text.slice(lastIndex)));
  }

  return parts.join('');
}

// ─── MathBox Inner Component ──────────────────────────────────────────────────
function MathBoxInner(props: {
  block: any;
  editor: any;
  contentRef: React.Ref<any>;
}) {
  const { block, editor, contentRef } = props;
  const blockType: string = block.props.type || 'definition';
  const theme = THEME[blockType] || THEME.definition;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState<string>(block.props.title || '');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    if (!isEditingTitle) {
      setLocalTitle(block.props.title || '');
    }
  }, [block.props.title, isEditingTitle]);

  const ownDomRef = useRef<HTMLElement | null>(null);
  const mergedContentRef = useCallback(
    (el: HTMLElement | null) => {
      ownDomRef.current = el;
      if (typeof contentRef === 'function') {
        (contentRef as (el: HTMLElement | null) => void)(el);
      } else if (contentRef && typeof contentRef === 'object') {
        (contentRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }
    },
    [contentRef]
  );

  const getBlockText = (): string => {
    const el = ownDomRef.current;
    if (el) {
      const domText = (el.innerText ?? el.textContent ?? '').trim();
      if (domText) return domText;
    }
    if (Array.isArray(block.content)) {
      return block.content.map((c: any) => c.text || '').join('');
    }
    return '';
  };

  const activatePreview = () => {
    const text = getBlockText();
    setPreviewHtml(renderLatexText(text));
    setIsPreviewMode(true);
  };

  const activateEdit = () => setIsPreviewMode(false);

  const commitTitle = () => {
    setIsEditingTitle(false);
    const trimmed = localTitle.trim();
    if (trimmed !== block.props.title) {
      editor.updateBlock(block, {
        props: { ...block.props, title: trimmed || TYPE_LABELS[blockType] },
      });
    }
    if (!trimmed) setLocalTitle(block.props.title || TYPE_LABELS[blockType]);
  };

  const handleTypeChange = (newType: string) => {
    const oldDefault = TYPE_LABELS[blockType] || 'Caja';
    const newDefault = TYPE_LABELS[newType] || 'Caja';
    const current = block.props.title || localTitle;
    const newTitle = current === oldDefault ? newDefault : current;
    editor.updateBlock(block, { props: { type: newType, title: newTitle } });
    setLocalTitle(newTitle);
  };

  return (
    <div
      className={`math-box-block my-3 w-full rounded-lg border-l-4 shadow-sm transition-colors duration-200 ${theme.border} ${theme.bg}`}
    >
      {/* Header */}
      <div className="math-box-header flex items-center gap-2 px-4 pt-3 pb-1.5" contentEditable={false}>
        <select
          value={blockType}
          onChange={(e) => handleTypeChange(e.target.value)}
          aria-label="Tipo de caja matemática"
          className={`math-box-type-select rounded border px-2 py-0.5 text-xs font-bold cursor-pointer bg-transparent focus:outline-none transition-colors ${theme.badge}`}
          title="Cambiar tipo de bloque"
        >
          {Object.entries(TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val} className="bg-surface text-ink-primary font-normal">
              {label}
            </option>
          ))}
        </select>

        {isEditingTitle ? (
          <input
            autoFocus
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitTitle();
              }
              if (e.key === 'Escape') {
                setLocalTitle(block.props.title || '');
                setIsEditingTitle(false);
              }
            }}
            className={`flex-1 min-w-0 bg-transparent border-b border-dashed font-semibold text-sm focus:outline-none placeholder:opacity-40 ${theme.text}`}
            placeholder="Título del bloque..."
          />
        ) : (
          <span
            className={`flex-1 font-semibold text-sm cursor-text select-none hover:opacity-80 transition-opacity ${theme.text}`}
            onClick={() => {
              setLocalTitle(block.props.title || '');
              setIsEditingTitle(true);
            }}
            title="Clic para editar el título"
          >
            {block.props.title || (
              <span className="opacity-40 italic font-normal">Sin título — clic para editar</span>
            )}
          </span>
        )}

        <button
          type="button"
          onClick={() => (isPreviewMode ? activateEdit() : activatePreview())}
          className={`ml-auto flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            isPreviewMode
              ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/35'
              : 'bg-transparent text-ink-muted border-border-subtle hover:bg-surface-subtle hover:text-ink-primary'
          }`}
          title={isPreviewMode ? 'Clic para editar' : 'Vista previa con KaTeX'}
        >
          {isPreviewMode ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Editar</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Vista previa</span>
            </>
          )}
        </button>
      </div>

      <div
        className={`math-box-content px-4 pb-3 pt-1 text-ink-primary ${isPreviewMode ? 'hidden' : 'block'}`}
        ref={mergedContentRef}
      />

      {isPreviewMode && (
        <div
          className="math-box-preview px-4 pb-4 pt-1 text-ink-primary min-h-[2rem] leading-relaxed cursor-pointer"
          onClick={activateEdit}
          title="Clic para editar"
        >
          {previewHtml ? (
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="math-preview-content" />
          ) : (
            <span className="opacity-45 italic text-sm">Vacío — clic para editar y añadir contenido...</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TikZ Graph Inner Component (with inline editable caption) ────────────────
function TikzGraphInner(props: {
  block: any;
  editor: any;
  contentRef: React.Ref<any>;
}) {
  const { block, editor, contentRef } = props;
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState<string>(block.props.caption || 'Diagrama TikZ');

  useEffect(() => {
    if (!isEditingCaption) {
      setCaptionDraft(block.props.caption || 'Diagrama TikZ');
    }
  }, [block.props.caption, isEditingCaption]);

  const commitCaption = () => {
    setIsEditingCaption(false);
    const trimmed = captionDraft.trim() || 'Diagrama TikZ';
    if (trimmed !== block.props.caption) {
      editor.updateBlock(block, { props: { ...block.props, caption: trimmed } });
    }
  };

  return (
    <div className="tikz-graph-block my-3 rounded-lg border border-border-subtle bg-surface/80 overflow-hidden">
      <div
        className="bg-surface-subtle/80 px-4 py-2 border-b border-border-subtle flex justify-between items-center gap-2"
        contentEditable={false}
      >
        <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
          TikZ
        </span>
        {isEditingCaption ? (
          <input
            autoFocus
            value={captionDraft}
            onChange={(e) => setCaptionDraft(e.target.value)}
            onBlur={commitCaption}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitCaption();
              } else if (e.key === 'Escape') {
                setCaptionDraft(block.props.caption || 'Diagrama TikZ');
                setIsEditingCaption(false);
              }
            }}
            aria-label="Pie de figura TikZ"
            className="flex-1 bg-transparent border-b border-dashed border-emerald-500 text-xs text-ink-primary focus:outline-none"
          />
        ) : (
          <span
            onClick={() => setIsEditingCaption(true)}
            title="Clic para editar descripción del diagrama"
            className="flex-1 text-xs text-ink-secondary hover:text-ink-primary cursor-text truncate"
          >
            {block.props.caption || 'Diagrama TikZ'}
          </span>
        )}
      </div>
      <div
        className="p-4 font-mono text-sm text-ink-primary whitespace-pre-wrap"
        ref={contentRef as any}
      />
    </div>
  );
}

// ─── Block specs ──────────────────────────────────────────────────────────────
export const MathBoxBlock = createReactBlockSpec(
  {
    type: 'math_box',
    propSchema: {
      type: {
        default: 'definition',
        values: ['definition', 'theorem', 'lemma', 'corollary', 'equation'],
      },
      title: { default: 'Definición' },
    },
    content: 'inline',
  },
  {
    render: (props) => (
      <MathBoxInner block={props.block} editor={props.editor} contentRef={props.contentRef} />
    ),
  }
);

export const TikzGraphBlock = createReactBlockSpec(
  {
    type: 'tikz_graph',
    propSchema: {
      caption: { default: 'Diagrama TikZ' },
    },
    content: 'inline',
  },
  {
    render: (props) => (
      <TikzGraphInner block={props.block} editor={props.editor} contentRef={props.contentRef} />
    ),
  }
);

// ─── Wiki Link Inline Content ─────────────────────────────────────────────────
function WikiLinkChip({ note }: { note: string }) {
  const router = useRouter();

  const handleNavigate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note?.trim()) return;
    try {
      const res = await fetch(`/api/documents?title=${encodeURIComponent(note.trim())}`);
      if (!res.ok) return;
      const target = await res.json();
      if (target?.id) {
        router.push(target.type === 'WHITEBOARD' ? `/whiteboard/${target.id}` : `/doc/${target.id}`);
      }
    } catch {
      // Ignore navigation errors
    }
  };

  return (
    <span
      onClick={handleNavigate}
      title={`Ir a la nota: ${note}`}
      className="bg-indigo-500/15 border border-indigo-500/35 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md mx-1 font-medium text-xs cursor-pointer hover:bg-indigo-500/25 transition-colors inline-flex items-center gap-1 align-middle shadow-xs"
    >
      <LinkIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
      {note}
    </span>
  );
}

export const WikiLinkInlineContent = createReactInlineContentSpec(
  {
    type: 'wiki_link',
    propSchema: {
      note: { default: 'Nota' },
    },
    content: 'none',
  },
  {
    render: (props) => <WikiLinkChip note={props.inlineContent.props.note} />,
  }
);

// ─── Schema ───────────────────────────────────────────────────────────────────
export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    math_box: MathBoxBlock,
    tikz_graph: TikzGraphBlock,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    wiki_link: WikiLinkInlineContent,
  },
});

// ─── Slash menu items ─────────────────────────────────────────────────────────
export const insertDefinition = (editor: any) => ({
  title: 'Definición',
  onItemClick: () => {
    editor.updateBlock(editor.getTextCursorPosition().block, {
      type: 'math_box',
      props: { type: 'definition', title: 'Definición' },
    });
  },
  aliases: ['def', 'definicion', 'definition'],
  group: 'Matemáticas',
  hint: 'Caja de definición formal',
});

export const insertTheorem = (editor: any) => ({
  title: 'Teorema',
  onItemClick: () => {
    editor.updateBlock(editor.getTextCursorPosition().block, {
      type: 'math_box',
      props: { type: 'theorem', title: 'Teorema' },
    });
  },
  aliases: ['theo', 'teorema', 'theorem'],
  group: 'Matemáticas',
  hint: 'Enunciado que requiere demostración',
});

export const insertLemma = (editor: any) => ({
  title: 'Lema',
  onItemClick: () => {
    editor.updateBlock(editor.getTextCursorPosition().block, {
      type: 'math_box',
      props: { type: 'lemma', title: 'Lema' },
    });
  },
  aliases: ['lemma', 'lema'],
  group: 'Matemáticas',
  hint: 'Resultado auxiliar',
});

export const insertCodeBlock = (editor: any) => ({
  title: 'Bloque de Código',
  onItemClick: () => {
    editor.updateBlock(editor.getTextCursorPosition().block, {
      type: 'codeBlock',
      content: '',
    });
  },
  aliases: ['codigo', 'code', 'script'],
  group: 'Formato',
  hint: 'Insertar un bloque de código con sintaxis resaltada',
});

export const insertCorollary = (editor: any) => ({
  title: 'Corolario',
  onItemClick: () => {
    editor.updateBlock(editor.getTextCursorPosition().block, {
      type: 'math_box',
      props: { type: 'corollary', title: 'Corolario' },
    });
  },
  aliases: ['cor', 'corolario', 'corollary'],
  group: 'Matemáticas',
  hint: 'Consecuencia directa de un teorema',
});

export const insertEquation = (editor: any) => ({
  title: 'Ecuación (LaTeX)',
  onItemClick: () => {
    editor.updateBlock(editor.getTextCursorPosition().block, {
      type: 'math_box',
      props: { type: 'equation', title: 'Ecuación' },
    });
  },
  aliases: ['eq', 'ecuacion', 'equation', 'math', 'latex'],
  group: 'Matemáticas',
  hint: 'Bloque para expresiones matemáticas o ecuaciones LaTeX',
});

export const insertTikz = (editor: any) => ({
  title: 'Diagrama TikZ',
  onItemClick: () => {
    editor.updateBlock(editor.getTextCursorPosition().block, {
      type: 'tikz_graph',
      content: '\\begin{tikzpicture}\n\n\\end{tikzpicture}',
    });
  },
  aliases: ['tikz', 'graph', 'diagram', 'diagrama'],
  group: 'Formato',
  hint: 'Bloque para código de diagramas TikZ',
});

export const insertWikiLink = (editor: any, onOpenWikiLinkPicker?: () => void) => ({
  title: 'Enlace a Nota',
  onItemClick: () => {
    if (onOpenWikiLinkPicker) {
      onOpenWikiLinkPicker();
      return;
    }
    editor.insertInlineContent([
      { type: 'wiki_link', props: { note: 'Nueva Nota' } },
      { type: 'text', text: ' ', styles: {} },
    ]);
  },
  aliases: ['link', 'enlace', 'wiki', 'nota'],
  group: 'Matemáticas',
  icon: <LinkIcon size={18} />,
});
