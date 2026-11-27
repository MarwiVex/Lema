'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  EditorState,
  Compartment,
  StateEffect,
  StateField,
  RangeSetBuilder,
  type Extension,
} from '@codemirror/state';
import {
  EditorView,
  Decoration,
  type DecorationSet,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  StreamLanguage,
  foldGutter,
  foldKeymap,
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language';
import { stex } from '@codemirror/legacy-modes/mode/stex';
import {
  searchKeymap,
  highlightSelectionMatches,
} from '@codemirror/search';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  type Completion,
  type CompletionContext,
} from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';
import { useLemaStore } from '@/store/useLemaStore';
import type { LatexDiagnostic } from '@/lib/latexLogParser';

export interface CodeMirrorLatexEditorHandle {
  jumpToLine: (line: number) => void;
  focus: () => void;
}

interface CodeMirrorLatexEditorProps {
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
  diagnostics?: LatexDiagnostic[];
  onSave?: () => void;
  className?: string;
}

// ─── Diagnostic line highlight effect/field ────────────────────────────────────
const setDiagnosticsEffect = StateEffect.define<LatexDiagnostic[]>();

const errorLineDecoration = Decoration.line({ class: 'cm-lema-error-line' });
const warningLineDecoration = Decoration.line({ class: 'cm-lema-warning-line' });

const diagnosticField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setDiagnosticsEffect)) {
        const builder = new RangeSetBuilder<Decoration>();
        const lineSeverity = new Map<number, 'error' | 'warning'>();
        for (const d of effect.value) {
          if (!d.line || d.line < 1 || d.line > tr.state.doc.lines) continue;
          const prev = lineSeverity.get(d.line);
          if (prev !== 'error') {
            lineSeverity.set(d.line, d.severity);
          }
        }
        const sortedLines = Array.from(lineSeverity.entries()).sort((a, b) => a[0] - b[0]);
        for (const [lineNum, sev] of sortedLines) {
          const line = tr.state.doc.line(lineNum);
          builder.add(
            line.from,
            line.from,
            sev === 'error' ? errorLineDecoration : warningLineDecoration
          );
        }
        return builder.finish();
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});

// ─── LaTeX Autocomplete ────────────────────────────────────────────────────────
const LATEX_ENVS = [
  'equation',
  'equation*',
  'align',
  'align*',
  'gather',
  'itemize',
  'enumerate',
  'definition',
  'theorem',
  'lemma',
  'corollary',
  'proof',
  'tikzpicture',
  'tabular',
  'tabularx',
  'figure',
  'center',
  'verbatim',
  'bmatrix',
  'pmatrix',
];

const LATEX_COMMANDS: Completion[] = [
  { label: '\\section{}', apply: (v, _c, from, to) => insertBraced(v, '\\section{', '}', from, to), type: 'keyword', detail: 'Sección' },
  { label: '\\subsection{}', apply: (v, _c, from, to) => insertBraced(v, '\\subsection{', '}', from, to), type: 'keyword', detail: 'Subsección' },
  { label: '\\subsubsection{}', apply: (v, _c, from, to) => insertBraced(v, '\\subsubsection{', '}', from, to), type: 'keyword', detail: 'Subsubsección' },
  { label: '\\textbf{}', apply: (v, _c, from, to) => insertBraced(v, '\\textbf{', '}', from, to), type: 'function', detail: 'Negrita' },
  { label: '\\textit{}', apply: (v, _c, from, to) => insertBraced(v, '\\textit{', '}', from, to), type: 'function', detail: 'Cursiva' },
  { label: '\\emph{}', apply: (v, _c, from, to) => insertBraced(v, '\\emph{', '}', from, to), type: 'function', detail: 'Énfasis' },
  { label: '\\usepackage{}', apply: (v, _c, from, to) => insertBraced(v, '\\usepackage{', '}', from, to), type: 'keyword', detail: 'Paquete' },
  { label: '\\frac{}{}', apply: (v, _c, from, to) => insertBraced(v, '\\frac{', '}{}', from, to), type: 'function', detail: 'Fracción' },
  { label: '\\sqrt{}', apply: (v, _c, from, to) => insertBraced(v, '\\sqrt{', '}', from, to), type: 'function', detail: 'Raíz' },
  { label: '\\sum_{}^{}', apply: (v, _c, from, to) => insertBraced(v, '\\sum_{', '}^{}', from, to), type: 'function', detail: 'Sumatoria' },
  { label: '\\int_{}^{}', apply: (v, _c, from, to) => insertBraced(v, '\\int_{', '}^{}', from, to), type: 'function', detail: 'Integral' },
  { label: '\\lim_{}', apply: (v, _c, from, to) => insertBraced(v, '\\lim_{', '}', from, to), type: 'function', detail: 'Límite' },
  { label: '\\mathbb{}', apply: (v, _c, from, to) => insertBraced(v, '\\mathbb{', '}', from, to), type: 'type', detail: 'Blackboard bold' },
  { label: '\\mathcal{}', apply: (v, _c, from, to) => insertBraced(v, '\\mathcal{', '}', from, to), type: 'type', detail: 'Caligráfica' },
  { label: '\\text{}', apply: (v, _c, from, to) => insertBraced(v, '\\text{', '}', from, to), type: 'function', detail: 'Texto en math' },
  { label: '\\label{}', apply: (v, _c, from, to) => insertBraced(v, '\\label{', '}', from, to), type: 'keyword', detail: 'Etiqueta' },
  { label: '\\ref{}', apply: (v, _c, from, to) => insertBraced(v, '\\ref{', '}', from, to), type: 'keyword', detail: 'Referencia' },
  { label: '\\cite{}', apply: (v, _c, from, to) => insertBraced(v, '\\cite{', '}', from, to), type: 'keyword', detail: 'Cita' },
  { label: '\\alpha', type: 'constant' },
  { label: '\\beta', type: 'constant' },
  { label: '\\gamma', type: 'constant' },
  { label: '\\delta', type: 'constant' },
  { label: '\\epsilon', type: 'constant' },
  { label: '\\varepsilon', type: 'constant' },
  { label: '\\theta', type: 'constant' },
  { label: '\\lambda', type: 'constant' },
  { label: '\\mu', type: 'constant' },
  { label: '\\pi', type: 'constant' },
  { label: '\\sigma', type: 'constant' },
  { label: '\\phi', type: 'constant' },
  { label: '\\omega', type: 'constant' },
  { label: '\\infty', type: 'constant' },
  { label: '\\forall', type: 'constant' },
  { label: '\\exists', type: 'constant' },
  { label: '\\in', type: 'constant' },
  { label: '\\subseteq', type: 'constant' },
  { label: '\\implies', type: 'constant' },
  { label: '\\iff', type: 'constant' },
  { label: '\\partial', type: 'constant' },
  { label: '\\nabla', type: 'constant' },
  { label: '\\cdot', type: 'constant' },
  { label: '\\times', type: 'constant' },
  { label: '\\leq', type: 'constant' },
  { label: '\\geq', type: 'constant' },
  { label: '\\neq', type: 'constant' },
  { label: '\\approx', type: 'constant' },
  ...LATEX_ENVS.map((env): Completion => ({
    label: `\\begin{${env}}`,
    detail: `Entorno ${env}`,
    type: 'class',
    apply: (view, _completion, from, to) => {
      const prefix = `\\begin{${env}}\n  `;
      const suffix = `\n\\end{${env}}`;
      const insert = prefix + suffix;
      view.dispatch({
        changes: { from, to, insert },
        selection: { anchor: from + prefix.length },
      });
    },
  })),
];

function insertBraced(
  view: EditorView,
  before: string,
  after: string,
  from: number,
  to: number
) {
  view.dispatch({
    changes: { from, to, insert: `${before}${after}` },
    selection: { anchor: from + before.length },
  });
}

function latexCompletionSource(context: CompletionContext) {
  const word = context.matchBefore(/\\[a-zA-Z*{*]*/);
  if (!word) return null;
  if (word.from === word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: LATEX_COMMANDS,
    validFor: /^\\[a-zA-Z*{*]*$/,
  };
}

// ─── Themes & Syntax Highlighting ──────────────────────────────────────────────
const darkHighlight = HighlightStyle.define([
  { tag: tags.comment, color: '#64748b', fontStyle: 'italic' },
  { tag: tags.keyword, color: '#38bdf8', fontWeight: '600' },
  { tag: tags.tagName, color: '#38bdf8' },
  { tag: tags.atom, color: '#a78bfa' },
  { tag: tags.number, color: '#fbbf24' },
  { tag: tags.string, color: '#34d399' },
  { tag: tags.bracket, color: '#f472b6' },
  { tag: tags.operator, color: '#f472b6' },
  { tag: tags.variableName, color: '#e2e8f0' },
]);

const lightHighlight = HighlightStyle.define([
  { tag: tags.comment, color: '#64748b', fontStyle: 'italic' },
  { tag: tags.keyword, color: '#0369a1', fontWeight: '600' },
  { tag: tags.tagName, color: '#0369a1' },
  { tag: tags.atom, color: '#6d28d9' },
  { tag: tags.number, color: '#b45309' },
  { tag: tags.string, color: '#047857' },
  { tag: tags.bracket, color: '#be185d' },
  { tag: tags.operator, color: '#be185d' },
  { tag: tags.variableName, color: '#0f172a' },
]);

function buildThemeExtension(isDark: boolean): Extension {
  return [
    EditorView.theme(
      {
        '&': {
          height: '100%',
          fontSize: '13px',
          backgroundColor: isDark ? '#080b12' : '#ffffff',
          color: isDark ? '#e2e8f0' : '#0f172a',
        },
        '.cm-scroller': {
          fontFamily: 'var(--font-mono), "JetBrains Mono", ui-monospace, monospace',
          lineHeight: '1.65',
          overflow: 'auto',
        },
        '.cm-content': {
          padding: '12px 0',
          caretColor: isDark ? '#22d3ee' : '#0284c7',
        },
        '.cm-gutters': {
          backgroundColor: isDark ? '#0b101b' : '#f8fafc',
          color: isDark ? '#475569' : '#94a3b8',
          borderRight: `1px solid ${isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)'}`,
          minWidth: '40px',
        },
        '.cm-activeLineGutter': {
          backgroundColor: isDark ? 'rgba(30,41,59,0.55)' : 'rgba(226,232,240,0.65)',
          color: isDark ? '#cbd5e1' : '#0f172a',
        },
        '.cm-activeLine': {
          backgroundColor: isDark ? 'rgba(30,41,59,0.32)' : 'rgba(241,245,249,0.75)',
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor: isDark ? 'rgba(6,182,212,0.25) !important' : 'rgba(14,165,233,0.22) !important',
        },
        '.cm-cursor': {
          borderLeftColor: isDark ? '#22d3ee' : '#0284c7',
        },
        '.cm-lema-error-line': {
          backgroundColor: isDark ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.12)',
          boxShadow: 'inset 3px 0 0 #ef4444',
        },
        '.cm-lema-warning-line': {
          backgroundColor: isDark ? 'rgba(245,158,11,0.14)' : 'rgba(245,158,11,0.12)',
          boxShadow: 'inset 3px 0 0 #f59e0b',
        },
        '.cm-tooltip.cm-tooltip-autocomplete': {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        },
        '.cm-tooltip-autocomplete ul li[aria-selected]': {
          backgroundColor: isDark ? '#1e293b' : '#e0f2fe',
          color: isDark ? '#f8fafc' : '#0f172a',
        },
        '.cm-panels': {
          backgroundColor: isDark ? '#0f1523' : '#f1f5f9',
          color: isDark ? '#e2e8f0' : '#0f172a',
          borderTop: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`,
        },
        '.cm-searchMatch': {
          backgroundColor: 'rgba(250, 204, 21, 0.28)',
          outline: '1px solid rgba(250, 204, 21, 0.6)',
        },
      },
      { dark: isDark }
    ),
    syntaxHighlighting(isDark ? darkHighlight : lightHighlight),
  ];
}

export const CodeMirrorLatexEditor = forwardRef<
  CodeMirrorLatexEditorHandle,
  CodeMirrorLatexEditorProps
>(function CodeMirrorLatexEditor(
  { value, onChange, readOnly = false, diagnostics = [], onSave, className = '' },
  ref
) {
  const resolvedTheme = useLemaStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const isApplyingExternalRef = useRef(false);

  onChangeRef.current = onChange;
  onSaveRef.current = onSave;

  useImperativeHandle(ref, () => ({
    jumpToLine(lineNum: number) {
      const view = viewRef.current;
      if (!view) return;
      const safeLine = Math.max(1, Math.min(lineNum, view.state.doc.lines));
      const line = view.state.doc.line(safeLine);
      view.dispatch({
        selection: { anchor: line.from },
        effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      });
      view.focus();
    },
    focus() {
      viewRef.current?.focus();
    },
  }));

  // Mount EditorView once
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        foldGutter(),
        bracketMatching(),
        closeBrackets(),
        highlightSelectionMatches(),
        StreamLanguage.define(stex),
        autocompletion({
          override: [latexCompletionSource],
        }),
        diagnosticField,
        keymap.of([
          {
            key: 'Mod-s',
            run: () => {
              onSaveRef.current?.();
              return true;
            },
          },
          indentWithTab,
          ...closeBracketsKeymap,
          ...completionKeymap,
          ...searchKeymap,
          ...foldKeymap,
          ...historyKeymap,
          ...defaultKeymap,
        ]),
        themeCompartment.current.of(buildThemeExtension(isDark)),
        readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isApplyingExternalRef.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g., switching files or resetting from blocks)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (value !== current) {
      isApplyingExternalRef.current = true;
      try {
        view.dispatch({
          changes: { from: 0, to: current.length, insert: value },
        });
      } finally {
        isApplyingExternalRef.current = false;
      }
    }
  }, [value]);

  // Sync theme
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.current.reconfigure(buildThemeExtension(isDark)),
    });
  }, [isDark]);

  // Sync readOnly
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // Sync diagnostics line highlights
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: setDiagnosticsEffect.of(diagnostics),
    });
  }, [diagnostics]);

  return <div ref={containerRef} className={`w-full h-full overflow-hidden ${className}`} />;
});

export default CodeMirrorLatexEditor;
