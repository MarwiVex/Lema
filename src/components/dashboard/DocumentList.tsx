'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileArchive,
  FileText,
  PenTool,
  Pencil,
  Trash2,
  Calendar,
  ChevronRight,
  Search,
  FolderInput,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Sigma,
  Folder,
  FolderPlus,
  X,
} from 'lucide-react';
import { useLemaStore } from '@/store/useLemaStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useFolders } from '@/lib/useFolders';
import {
  buildFolderTree,
  flattenFolderTree,
  getFolderAncestors,
  getFolderPathLabel,
  type FlattenedFolderEntry,
  type FolderTreeNode,
} from '@/lib/folderTree';
import type { DocumentSummary, FolderSummary, LatexProjectSummary } from '@/lib/types/ast';

type FilterType = 'ALL' | 'TEXT' | 'WHITEBOARD' | 'LATEX';
type SortOrder = 'recent' | 'az' | 'za';

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'justo ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// ─── Template blocks for empty folder quick start ──────────────────────────────
const CLASS_NOTE_TEMPLATE = [
  { type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Apuntes de Clase', styles: {} }] },
  {
    type: 'math_box',
    props: { type: 'definition', title: 'Definición Principal' },
    content: [{ type: 'text', text: 'Escribe aquí la definición formal usando $LaTeX$.', styles: {} }],
  },
  { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: 'Ejemplos y Notas', styles: {} }] },
  { type: 'paragraph', content: [{ type: 'text', text: 'Desarrolla ejemplos o intuición aquí.', styles: {} }] },
];

const CHEATSHEET_TEMPLATE = [
  { type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Formulario Matemático', styles: {} }] },
  {
    type: 'math_box',
    props: { type: 'theorem', title: 'Teorema Fundamental' },
    content: [{ type: 'text', text: 'Enunciado principal y condiciones.', styles: {} }],
  },
  {
    type: 'math_box',
    props: { type: 'equation', title: 'Ecuación Clave' },
    content: [{ type: 'text', text: '$$\\int_a^b f(x)\\,dx = F(b) - F(a)$$', styles: {} }],
  },
];

// ─── Isolated Create Document Form ─────────────────────────────────────────────
const CreateDocumentForm = React.memo(function CreateDocumentForm({
  folderId,
  onDocumentCreated,
  onError,
}: {
  folderId: string;
  onDocumentCreated: (folderId: string, doc: DocumentSummary) => void;
  onError: (msg: string) => void;
}) {
  const [newDocTitle, setNewDocTitle] = useState('');
  const [docType, setDocType] = useState<'TEXT' | 'WHITEBOARD'>('TEXT');
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDocTitle.trim();
    if (!trimmed || !folderId || isCreatingDoc) return;
    setIsCreatingDoc(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          type: docType,
          content: JSON.stringify([]),
          folderId,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setNewDocTitle('');
        onDocumentCreated(folderId, created);
      } else {
        onError('Error al crear el apunte.');
      }
    } catch {
      onError('Error de red al crear el apunte.');
    } finally {
      setIsCreatingDoc(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-5 flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="Título del nuevo apunte..."
        aria-label="Título del nuevo apunte"
        value={newDocTitle}
        onChange={(e) => setNewDocTitle(e.target.value)}
        className="flex-1 bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm text-ink-primary focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-ink-muted"
      />
      <select
        value={docType}
        onChange={(e) => setDocType(e.target.value as 'TEXT' | 'WHITEBOARD')}
        aria-label="Tipo de apunte"
        className="bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-ink-primary"
      >
        <option value="TEXT">Nota de Texto</option>
        <option value="WHITEBOARD">Pizarrón</option>
      </select>
      <button
        type="submit"
        disabled={isCreatingDoc || !newDocTitle.trim()}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-indigo-600/15"
      >
        {isCreatingDoc ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Crear Apunte
      </button>
    </form>
  );
});

// ─── Move Folder Popover Menu ──────────────────────────────────────────────────
function MoveFolderButton({
  currentFolderId,
  folderEntries,
  onMove,
  label,
}: {
  currentFolderId: string;
  folderEntries: FlattenedFolderEntry[];
  onMove: (targetFolderId: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const otherFolders = folderEntries.filter((entry) => entry.folder.id !== currentFolderId);

  if (otherFolders.length === 0) return null;

  return (
    <div className="relative z-30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Mover ${label} a otra materia`}
        title="Mover a otra materia"
        className="text-ink-muted hover:text-cyan-600 dark:hover:text-cyan-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
      >
        <FolderInput className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-30 w-56 rounded-xl bg-surface border border-border-strong shadow-xl py-1 animate-[fadeInScale_0.12s_ease-out]">
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted border-b border-border-subtle">
              Mover a materia
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {otherFolders.map((entry) => (
                <button
                  key={entry.folder.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onMove(entry.folder.id);
                  }}
                  title={entry.pathLabel}
                  className="w-full text-left px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle truncate cursor-pointer"
                >
                  {entry.pathLabel}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Memoized Document Card ────────────────────────────────────────────────────
const DocumentCard = React.memo(function DocumentCard({
  doc,
  currentFolderId,
  folderEntries,
  onRename,
  onMove,
  onDelete,
}: {
  doc: DocumentSummary;
  currentFolderId: string;
  folderEntries: FlattenedFolderEntry[];
  onRename: (id: string, title: string) => Promise<void>;
  onMove: (id: string, targetFolderId: string) => Promise<void>;
  onDelete: (id: string, title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(doc.title);

  const href = doc.type === 'WHITEBOARD' ? `/whiteboard/${doc.id}` : `/doc/${doc.id}`;
  const isWb = doc.type === 'WHITEBOARD';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    setIsEditing(false);
    if (trimmed !== doc.title) {
      await onRename(doc.id, trimmed);
    }
  };

  return (
    <div className="group card-surface hover:border-cyan-500/45 p-5 rounded-2xl transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/10 relative flex flex-col justify-between min-h-[132px]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-2 rounded-lg transition-colors ${
              isWb
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20'
            }`}
          >
            {isWb ? <PenTool className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>

          <div className="flex items-center gap-0.5 relative z-20">
            <MoveFolderButton
              currentFolderId={currentFolderId}
              folderEntries={folderEntries}
              label={doc.title}
              onMove={(targetId) => void onMove(doc.id, targetId)}
            />
            <button
              type="button"
              onClick={() => {
                setDraftTitle(doc.title);
                setIsEditing(true);
              }}
              aria-label={`Renombrar ${doc.title}`}
              className="text-ink-muted hover:text-cyan-600 dark:hover:text-cyan-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
              title="Editar título"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(doc.id, doc.title)}
              aria-label={`Eliminar ${doc.title}`}
              className="text-ink-muted hover:text-red-500 dark:hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
              title="Eliminar apunte"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-2 relative z-20">
            <input
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              aria-label="Nuevo título del apunte"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsEditing(false);
                }
              }}
              className="bg-surface-subtle border border-cyan-500 text-ink-primary px-2.5 py-1.5 rounded-lg text-sm w-full outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-ink-muted hover:text-ink-primary px-2 py-1 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold px-2 py-1 cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <Link
            href={href}
            className="block font-bold text-base text-ink-primary group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors leading-snug after:absolute after:inset-0 after:z-0"
          >
            {doc.title}
          </Link>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between mt-4 pointer-events-none">
        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Calendar className="w-3 h-3" />
          <span suppressHydrationWarning>{formatRelativeDate(doc.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-muted group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
          <span>Abrir</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
});

// ─── Memoized LaTeX Project Card ───────────────────────────────────────────────
const LatexProjectCard = React.memo(function LatexProjectCard({
  proj,
  currentFolderId,
  folderEntries,
  onRename,
  onMove,
  onDelete,
}: {
  proj: LatexProjectSummary;
  currentFolderId: string;
  folderEntries: FlattenedFolderEntry[];
  onRename: (id: string, title: string, desc: string) => Promise<void>;
  onMove: (id: string, targetFolderId: string) => Promise<void>;
  onDelete: (id: string, title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(proj.title);
  const [draftDesc, setDraftDesc] = useState(proj.description || '');

  const href = `/latex/${proj.id}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) return;
    setIsEditing(false);
    await onRename(proj.id, trimmedTitle, draftDesc.trim());
  };

  return (
    <div className="group card-surface border-amber-500/25 hover:border-amber-500/50 p-5 rounded-2xl transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/10 relative flex flex-col justify-between min-h-[132px]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
            <FileArchive className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1 relative z-20">
            <span className="text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full mr-1">
              LaTeX
            </span>
            <MoveFolderButton
              currentFolderId={currentFolderId}
              folderEntries={folderEntries}
              label={proj.title}
              onMove={(targetId) => void onMove(proj.id, targetId)}
            />
            <button
              type="button"
              onClick={() => {
                setDraftTitle(proj.title);
                setDraftDesc(proj.description || '');
                setIsEditing(true);
              }}
              aria-label={`Editar proyecto ${proj.title}`}
              className="text-ink-muted hover:text-amber-600 dark:hover:text-amber-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
              title="Editar título y descripción"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(proj.id, proj.title)}
              aria-label={`Eliminar proyecto ${proj.title}`}
              className="text-ink-muted hover:text-red-500 dark:hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
              title="Eliminar proyecto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-2 relative z-20">
            <input
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              aria-label="Nuevo título del proyecto"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsEditing(false);
                }
              }}
              className="bg-surface-subtle border border-amber-500 text-ink-primary px-2.5 py-1.5 rounded-lg text-sm w-full outline-none"
              placeholder="Título"
            />
            <input
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              aria-label="Descripción del proyecto"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsEditing(false);
                }
              }}
              className="bg-surface-subtle border border-amber-500/50 text-ink-secondary px-2.5 py-1 rounded-lg text-xs w-full outline-none"
              placeholder="Descripción (opcional)"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-ink-muted hover:text-ink-primary px-2 py-1 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold px-2 py-1 cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <div>
            <Link
              href={href}
              className="block font-bold text-base text-ink-primary group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors leading-snug after:absolute after:inset-0 after:z-0"
            >
              {proj.title}
            </Link>
            {proj.description && (
              <p className="text-xs text-ink-secondary mt-1 line-clamp-2">{proj.description}</p>
            )}
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between mt-4 pointer-events-none">
        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Calendar className="w-3 h-3" />
          <span suppressHydrationWarning>{formatRelativeDate(proj.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-muted group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          <span>Abrir</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
});

// ─── Main DocumentList ─────────────────────────────────────────────────────────
export function DocumentList() {
  const router = useRouter();
  const { folders, isLoading, isError, mutate } = useFolders();
  const activeFolderId = useLemaStore((s) => s.activeFolderId);
  const setActiveFolderId = useLemaStore((s) => s.setActiveFolderId);
  const setShowLatexModal = useLemaStore((s) => s.setShowLatexModal);
  const setConfirmAction = useLemaStore((s) => s.setConfirmAction);
  const setMobileSidebarOpen = useLemaStore((s) => s.setMobileSidebarOpen);
  const showToast = useEditorStore((s) => s.showToast);

  const [docSearch, setDocSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const [isAddingSubfolder, setIsAddingSubfolder] = useState(false);
  const [newSubfolderName, setNewSubfolderName] = useState('');
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false);

  const foldersRef = useRef(folders);
  foldersRef.current = folders;

  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);
  const flattenedFolders = useMemo(() => flattenFolderTree(folderTree), [folderTree]);

  const effectiveFolderId = activeFolderId ?? folderTree[0]?.id ?? folders[0]?.id ?? null;

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === effectiveFolderId),
    [folders, effectiveFolderId]
  );

  const activeTreeEntry = useMemo(
    () => flattenedFolders.find((e) => e.folder.id === effectiveFolderId)?.folder ?? null,
    [flattenedFolders, effectiveFolderId]
  );

  const ancestors = useMemo(
    () => (activeFolder ? getFolderAncestors(activeFolder.id, folders) : []),
    [activeFolder, folders]
  );

  const subfolders: FolderTreeNode[] = useMemo(
    () => activeTreeEntry?.children ?? [],
    [activeTreeEntry]
  );

  const handleDocumentCreated = useCallback(
    async (folderId: string, createdDoc: DocumentSummary) => {
      await mutate(
        (curr) =>
          (curr ?? foldersRef.current).map((f) =>
            f.id === folderId ? { ...f, documents: [createdDoc, ...(f.documents || [])] } : f
          ),
        { revalidate: false }
      );
    },
    [mutate]
  );

  const handleErrorToast = useCallback(
    (msg: string) => {
      showToast(msg, 'error');
    },
    [showToast]
  );

  const handleDeleteDocument = useCallback(
    (id: string, title: string) => {
      setConfirmAction({
        title: 'Eliminar apunte',
        message: `¿Eliminar el apunte "${title}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        variant: 'danger',
        onConfirm: async () => {
          const prevFolders = foldersRef.current;
          await mutate(
            (curr) =>
              (curr ?? prevFolders).map((f) => ({
                ...f,
                documents: (f.documents || []).filter((d) => d.id !== id),
              })),
            { revalidate: false }
          );

          try {
            const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
              await mutate(prevFolders, { revalidate: false });
              showToast('Error al eliminar el apunte.', 'error');
            }
          } catch {
            await mutate(prevFolders, { revalidate: false });
            showToast('Error de red al eliminar el apunte.', 'error');
          }
        },
      });
    },
    [mutate, setConfirmAction, showToast]
  );

  const handleRenameDocument = useCallback(
    async (id: string, trimmed: string) => {
      const prevFolders = foldersRef.current;
      await mutate(
        (curr) =>
          (curr ?? prevFolders).map((f) => ({
            ...f,
            documents: (f.documents || []).map((d) => (d.id === id ? { ...d, title: trimmed } : d)),
          })),
        { revalidate: false }
      );

      try {
        const res = await fetch('/api/documents', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, title: trimmed }),
        });
        if (!res.ok) {
          await mutate(prevFolders, { revalidate: false });
          showToast('Error al renombrar el apunte.', 'error');
        }
      } catch {
        await mutate(prevFolders, { revalidate: false });
        showToast('Error de red al renombrar el apunte.', 'error');
      }
    },
    [mutate, showToast]
  );

  const handleMoveDocument = useCallback(
    async (id: string, targetFolderId: string) => {
      const prevFolders = foldersRef.current;
      let movedDoc: DocumentSummary | undefined;
      for (const f of prevFolders) {
        const found = f.documents?.find((d) => d.id === id);
        if (found) {
          movedDoc = { ...found, folderId: targetFolderId };
          break;
        }
      }
      if (!movedDoc) return;

      await mutate(
        (curr) =>
          (curr ?? prevFolders).map((f) => {
            const without = (f.documents || []).filter((d) => d.id !== id);
            return f.id === targetFolderId
              ? { ...f, documents: [movedDoc!, ...without] }
              : { ...f, documents: without };
          }),
        { revalidate: false }
      );

      try {
        const res = await fetch('/api/documents', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, folderId: targetFolderId }),
        });
        if (!res.ok) {
          await mutate(prevFolders, { revalidate: false });
          showToast('Error al mover el apunte.', 'error');
        } else {
          const targetName =
            getFolderPathLabel(targetFolderId, prevFolders) ||
            prevFolders.find((f) => f.id === targetFolderId)?.name ||
            'materia';
          showToast(`Movido a "${targetName}".`, 'success');
        }
      } catch {
        await mutate(prevFolders, { revalidate: false });
        showToast('Error de red al mover el apunte.', 'error');
      }
    },
    [mutate, showToast]
  );

  const handleDeleteLatexProject = useCallback(
    (id: string, title: string) => {
      setConfirmAction({
        title: 'Eliminar proyecto LaTeX',
        message: `¿Eliminar el proyecto LaTeX "${title}" y todos sus archivos? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        variant: 'danger',
        onConfirm: async () => {
          const prevFolders = foldersRef.current;
          await mutate(
            (curr) =>
              (curr ?? prevFolders).map((f) => ({
                ...f,
                latexProjects: (f.latexProjects || []).filter((p) => p.id !== id),
              })),
            { revalidate: false }
          );

          try {
            const res = await fetch(`/api/latex-projects?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
              await mutate(prevFolders, { revalidate: false });
              showToast('Error al eliminar el proyecto LaTeX.', 'error');
            }
          } catch {
            await mutate(prevFolders, { revalidate: false });
            showToast('Error de red al eliminar el proyecto LaTeX.', 'error');
          }
        },
      });
    },
    [mutate, setConfirmAction, showToast]
  );

  const handleRenameLatex = useCallback(
    async (id: string, trimmedTitle: string, trimmedDesc: string) => {
      const prevFolders = foldersRef.current;
      await mutate(
        (curr) =>
          (curr ?? prevFolders).map((f) => ({
            ...f,
            latexProjects: (f.latexProjects || []).map((p) =>
              p.id === id ? { ...p, title: trimmedTitle, description: trimmedDesc } : p
            ),
          })),
        { revalidate: false }
      );

      try {
        const res = await fetch('/api/latex-projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            action: 'update_title',
            title: trimmedTitle,
            description: trimmedDesc,
          }),
        });
        if (!res.ok) {
          await mutate(prevFolders, { revalidate: false });
          showToast('Error al actualizar el proyecto LaTeX.', 'error');
        }
      } catch {
        await mutate(prevFolders, { revalidate: false });
        showToast('Error de red al actualizar el proyecto LaTeX.', 'error');
      }
    },
    [mutate, showToast]
  );

  const handleMoveLatex = useCallback(
    async (id: string, targetFolderId: string) => {
      const prevFolders = foldersRef.current;
      let movedProj: LatexProjectSummary | undefined;
      for (const f of prevFolders) {
        const found = f.latexProjects?.find((p) => p.id === id);
        if (found) {
          movedProj = { ...found, folderId: targetFolderId };
          break;
        }
      }
      if (!movedProj) return;

      await mutate(
        (curr) =>
          (curr ?? prevFolders).map((f) => {
            const without = (f.latexProjects || []).filter((p) => p.id !== id);
            return f.id === targetFolderId
              ? { ...f, latexProjects: [movedProj!, ...without] }
              : { ...f, latexProjects: without };
          }),
        { revalidate: false }
      );

      try {
        const res = await fetch('/api/latex-projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'move_folder', folderId: targetFolderId }),
        });
        if (!res.ok) {
          await mutate(prevFolders, { revalidate: false });
          showToast('Error al mover el proyecto LaTeX.', 'error');
        } else {
          const targetName =
            getFolderPathLabel(targetFolderId, prevFolders) ||
            prevFolders.find((f) => f.id === targetFolderId)?.name ||
            'materia';
          showToast(`Proyecto movido a "${targetName}".`, 'success');
        }
      } catch {
        await mutate(prevFolders, { revalidate: false });
        showToast('Error de red al mover el proyecto LaTeX.', 'error');
      }
    },
    [mutate, showToast]
  );

  const handleCreateFromTemplate = async (
    templateId: 'class' | 'cheatsheet',
    title: string,
    blocks: unknown[]
  ) => {
    if (!activeFolder || creatingTemplate) return;
    setCreatingTemplate(templateId);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: 'TEXT',
          content: JSON.stringify(blocks),
          folderId: activeFolder.id,
        }),
      });
      if (!res.ok) throw new Error('Error');
      const created = await res.json();
      await handleDocumentCreated(activeFolder.id, created);
      router.push(`/doc/${created.id}`);
    } catch {
      showToast('Error al crear apunte desde plantilla.', 'error');
    } finally {
      setCreatingTemplate(null);
    }
  };

  // Filtered and sorted items inside activeFolder
  const { visibleDocs, visibleLatex } = useMemo(() => {
    if (!activeFolder) return { visibleDocs: [], visibleLatex: [] };
    const q = normalizeText(docSearch.trim());

    const sortFn = <T extends { title: string; updatedAt: string }>(arr: T[]) => {
      const copy = [...arr];
      if (sortOrder === 'az') {
        copy.sort((a, b) => a.title.localeCompare(b.title, 'es'));
      } else if (sortOrder === 'za') {
        copy.sort((a, b) => b.title.localeCompare(a.title, 'es'));
      } else {
        copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
      return copy;
    };

    const docs = (activeFolder.documents || []).filter((d) => {
      if (typeFilter === 'LATEX') return false;
      if (typeFilter === 'TEXT' && d.type !== 'TEXT') return false;
      if (typeFilter === 'WHITEBOARD' && d.type !== 'WHITEBOARD') return false;
      if (q && !normalizeText(d.title).includes(q)) return false;
      return true;
    });

    const latex = (activeFolder.latexProjects || []).filter((p) => {
      if (typeFilter === 'TEXT' || typeFilter === 'WHITEBOARD') return false;
      if (q && !normalizeText(`${p.title} ${p.description || ''}`).includes(q)) return false;
      return true;
    });

    return {
      visibleDocs: sortFn(docs),
      visibleLatex: sortFn(latex),
    };
  }, [activeFolder, docSearch, sortOrder, typeFilter]);

  if (isLoading && folders.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
          <div className="h-8 w-56 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-12 w-full rounded-xl bg-surface-subtle animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-surface border border-border-subtle animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl card-surface p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink-primary">No se pudieron cargar tus materias</h2>
            <p className="text-xs text-ink-secondary mt-1">Verifica tu conexión e intenta nuevamente.</p>
          </div>
          <button
            type="button"
            onClick={() => void mutate()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reintentar
          </button>
        </div>
      </main>
    );
  }

  if (!activeFolder) {
    return (
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl card-surface p-8 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <FolderPlus className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-primary">Empieza creando una materia</h2>
            <p className="text-sm text-ink-secondary mt-1">
              Organiza tus apuntes por bloques, pizarrones con OCR y proyectos LaTeX por asignatura.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(true);
              setTimeout(() => {
                document.getElementById('new-folder-input')?.focus();
              }, 100);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold cursor-pointer shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" /> Crear primera materia
          </button>
        </div>
      </main>
    );
  }

  const handleCreateSubfolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFolder || isCreatingSubfolder) return;
    const trimmed = newSubfolderName.trim();
    if (!trimmed) return;
    setIsCreatingSubfolder(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, parentId: activeFolder.id }),
      });
      if (!res.ok) {
        showToast('Error al crear la subcarpeta.', 'error');
        return;
      }
      const created = await res.json();
      const newFolder: FolderSummary = {
        ...created,
        parentId: created.parentId ?? activeFolder.id,
        documents: [],
        latexProjects: [],
      };
      setNewSubfolderName('');
      setIsAddingSubfolder(false);
      await mutate((curr) => [newFolder, ...(curr ?? foldersRef.current)], {
        revalidate: false,
      });
      showToast(`Subcarpeta "${created.name}" creada.`, 'success');
    } catch {
      showToast('Error de red al crear la subcarpeta.', 'error');
    } finally {
      setIsCreatingSubfolder(false);
    }
  };

  const docCount = (activeFolder.documents?.length || 0) + (activeFolder.latexProjects?.length || 0);
  const totalItemCount = activeTreeEntry?.totalItemCount ?? docCount;
  const filteredCount = visibleDocs.length + visibleLatex.length;

  const headerSubtitle = useMemo(() => {
    if (subfolders.length > 0 && docCount > 0) {
      return `${subfolders.length} subcarpeta${subfolders.length !== 1 ? 's' : ''} · ${docCount} elemento${docCount !== 1 ? 's' : ''} directos (${totalItemCount} en total)`;
    }
    if (subfolders.length > 0) {
      return `${subfolders.length} subcarpeta${subfolders.length !== 1 ? 's' : ''} · ${totalItemCount} elemento${totalItemCount !== 1 ? 's' : ''} en total`;
    }
    if (docCount > 0) {
      return `${docCount} elemento${docCount !== 1 ? 's' : ''} en esta materia`;
    }
    return 'Sin apuntes todavía. Crea el primero o inicia desde una plantilla.';
  }, [subfolders.length, docCount, totalItemCount]);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 pb-16">
        {/* Interactive Breadcrumbs + Header */}
        <div className="mb-7">
          <nav aria-label="Ruta de navegación" className="flex items-center flex-wrap gap-1.5 text-xs text-ink-muted mb-2">
            <button
              type="button"
              onClick={() => {
                setDocSearch('');
                setTypeFilter('ALL');
              }}
              className="hover:text-ink-primary transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <button
              type="button"
              onClick={() => {
                setDocSearch('');
                setTypeFilter('ALL');
                setMobileSidebarOpen(true);
              }}
              className="hover:text-ink-primary transition-colors cursor-pointer"
            >
              Materias
            </button>
            {ancestors.map((anc, idx) => {
              const isLast = idx === ancestors.length - 1;
              return (
                <React.Fragment key={anc.id}>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                  {isLast ? (
                    <span className="text-ink-primary font-medium truncate">{anc.name}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDocSearch('');
                        setTypeFilter('ALL');
                        setActiveFolderId(anc.id);
                      }}
                      className="hover:text-ink-primary transition-colors cursor-pointer truncate max-w-[180px]"
                    >
                      {anc.name}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink-primary mb-1 tracking-tight">{activeFolder.name}</h1>
              <p className="text-ink-secondary text-sm">{headerSubtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddingSubfolder((v) => !v)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                Nueva subcarpeta
              </button>

              <button
                type="button"
                onClick={() => setShowLatexModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/35 text-amber-700 dark:text-amber-300 hover:border-amber-400/60 hover:from-amber-500/25 hover:to-orange-500/25 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <FileArchive className="w-4 h-4" />
                Importar Proyecto LaTeX
              </button>
            </div>
          </div>
        </div>

        {isAddingSubfolder && (
          <form
            onSubmit={handleCreateSubfolder}
            className="mb-5 flex flex-col sm:flex-row gap-2 p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/25"
          >
            <input
              autoFocus
              type="text"
              value={newSubfolderName}
              onChange={(e) => setNewSubfolderName(e.target.value)}
              placeholder={`Nombre de la subcarpeta dentro de ${activeFolder.name}...`}
              aria-label="Nombre de la subcarpeta"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsAddingSubfolder(false);
                }
              }}
              className="flex-1 bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-sm text-ink-primary focus:outline-none focus:border-cyan-500 placeholder:text-ink-muted"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubfolder(false);
                  setNewSubfolderName('');
                }}
                className="px-3 py-2 text-xs text-ink-muted hover:text-ink-primary rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreatingSubfolder || !newSubfolderName.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Crear subcarpeta
              </button>
            </div>
          </form>
        )}

        {subfolders.length > 0 && (
          <section aria-label="Subcarpetas" className="mb-7">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3 flex items-center gap-2">
              <Folder className="w-3.5 h-3.5 text-cyan-500" />
              Subcarpetas ({subfolders.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subfolders.map((sub) => {
                const subCount = sub.children.length;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setDocSearch('');
                      setTypeFilter('ALL');
                      setActiveFolderId(sub.id);
                    }}
                    className="group card-surface hover:border-cyan-500/45 p-4 rounded-2xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-ink-primary group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate">
                          {sub.name}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          {sub.totalItemCount} elemento{sub.totalItemCount !== 1 ? 's' : ''}
                          {subCount > 0 ? ` · ${subCount} subcarpeta${subCount !== 1 ? 's' : ''}` : ''}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <CreateDocumentForm
          folderId={activeFolder.id}
          onDocumentCreated={handleDocumentCreated}
          onError={handleErrorToast}
        />

        {/* Local search, filter pills & sort bar */}
        {docCount > 0 && (
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-surface/70 border border-border-subtle">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Buscar en esta materia..."
                aria-label="Buscar apuntes en esta materia"
                className="w-full bg-surface-subtle/60 border border-border-subtle rounded-xl pl-9 pr-8 py-2 text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-indigo-500"
              />
              {docSearch && (
                <button
                  type="button"
                  onClick={() => setDocSearch('')}
                  aria-label="Limpiar filtro"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-surface-subtle/70 p-1 rounded-xl border border-border-subtle">
                {(
                  [
                    { id: 'ALL', label: 'Todos' },
                    { id: 'TEXT', label: 'Apuntes' },
                    { id: 'WHITEBOARD', label: 'Pizarras' },
                    { id: 'LATEX', label: 'LaTeX' },
                  ] as const
                ).map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setTypeFilter(pill.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      typeFilter === pill.id
                        ? 'bg-surface text-ink-primary shadow-sm border border-border-subtle'
                        : 'text-ink-muted hover:text-ink-primary border border-transparent'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                aria-label="Ordenar elementos"
                className="bg-surface-subtle/70 border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-indigo-500"
              >
                <option value="recent">Más recientes</option>
                <option value="az">Nombre (A-Z)</option>
                <option value="za">Nombre (Z-A)</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty folder onboarding / templates (only when folder has neither items nor subfolders) */}
        {docCount === 0 && subfolders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Inicio rápido en {activeFolder.name}
            </div>
            <h2 className="text-base font-semibold text-ink-primary mb-1">Tu materia está lista</h2>
            <p className="text-xs text-ink-secondary mb-6">
              Crea un apunte en blanco arriba o arranca al instante con una plantilla:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <button
                type="button"
                disabled={creatingTemplate !== null}
                onClick={() =>
                  void handleCreateFromTemplate(
                    'class',
                    `Apunte de clase — ${activeFolder.name}`,
                    CLASS_NOTE_TEMPLATE
                  )
                }
                className="p-4 rounded-xl card-surface hover:border-indigo-500/40 transition-all text-left group cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-2" />
                <div className="text-sm font-semibold text-ink-primary group-hover:text-indigo-500">
                  Apunte de clase
                </div>
                <div className="text-xs text-ink-muted mt-0.5">
                  Encabezado, caja de definición y sección de ejemplos.
                </div>
              </button>

              <button
                type="button"
                disabled={creatingTemplate !== null}
                onClick={() =>
                  void handleCreateFromTemplate(
                    'cheatsheet',
                    `Formulario — ${activeFolder.name}`,
                    CHEATSHEET_TEMPLATE
                  )
                }
                className="p-4 rounded-xl card-surface hover:border-cyan-500/40 transition-all text-left group cursor-pointer"
              >
                <Sigma className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-2" />
                <div className="text-sm font-semibold text-ink-primary group-hover:text-cyan-500">
                  Formulario matemático
                </div>
                <div className="text-xs text-ink-muted mt-0.5">
                  Teoremas y ecuaciones listas para compilar a PDF.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowLatexModal(true)}
                className="p-4 rounded-xl card-surface hover:border-amber-500/40 transition-all text-left group cursor-pointer"
              >
                <FileArchive className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
                <div className="text-sm font-semibold text-ink-primary group-hover:text-amber-500">
                  Proyecto LaTeX
                </div>
                <div className="text-xs text-ink-muted mt-0.5">
                  Importa un .tex o .zip para editar y compilar.
                </div>
              </button>
            </div>
          </div>
        ) : docCount === 0 ? null : filteredCount === 0 ? (
          <div className="rounded-2xl card-surface p-8 text-center text-sm text-ink-muted">
            No hay elementos que coincidan con el filtro actual.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                currentFolderId={activeFolder.id}
                folderEntries={flattenedFolders}
                onRename={handleRenameDocument}
                onMove={handleMoveDocument}
                onDelete={handleDeleteDocument}
              />
            ))}

            {visibleLatex.map((proj) => (
              <LatexProjectCard
                key={`lp-${proj.id}`}
                proj={proj}
                currentFolderId={activeFolder.id}
                folderEntries={flattenedFolders}
                onRename={handleRenameLatex}
                onMove={handleMoveLatex}
                onDelete={handleDeleteLatexProject}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
