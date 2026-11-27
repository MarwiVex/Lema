'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Folder,
  Plus,
  FolderOpen,
  FolderPlus,
  FolderInput,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  Check,
  Coffee,
  Share2,
  Gamepad2,
  LogOut,
  Search,
} from 'lucide-react';
import { useLemaStore } from '@/store/useLemaStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useFolders } from '@/lib/useFolders';
import {
  buildFolderTree,
  filterFolderTree,
  flattenFolderTree,
  getDescendantFolderIds,
  getFolderAncestors,
  type FlattenedFolderEntry,
  type FolderTreeNode,
} from '@/lib/folderTree';
import type { FolderSummary } from '@/lib/types/ast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface FolderTreeRowProps {
  node: FolderTreeNode;
  effectiveFolderId: string | null;
  expandedIds: Set<string>;
  editingFolderId: string | null;
  editFolderName: string;
  addingSubfolderParentId: string | null;
  subfolderName: string;
  isCreatingSubfolder: boolean;
  movingFolderId: string | null;
  allFolders: FolderSummary[];
  flattenedFolders: FlattenedFolderEntry[];
  onToggleExpand: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onStartEdit: (folder: FolderTreeNode) => void;
  onChangeEditName: (val: string) => void;
  onCancelEdit: () => void;
  onSubmitRename: (id: string, e: React.FormEvent) => void;
  onDelete: (folder: FolderTreeNode) => void;
  onStartAddSubfolder: (parentId: string) => void;
  onCancelAddSubfolder: () => void;
  onChangeSubfolderName: (val: string) => void;
  onSubmitSubfolder: (parentId: string, e: React.FormEvent) => void;
  onToggleMovePopover: (id: string | null) => void;
  onMoveFolder: (folderId: string, targetParentId: string | null) => void;
}

function FolderTreeRow({
  node,
  effectiveFolderId,
  expandedIds,
  editingFolderId,
  editFolderName,
  addingSubfolderParentId,
  subfolderName,
  isCreatingSubfolder,
  movingFolderId,
  allFolders,
  flattenedFolders,
  onToggleExpand,
  onSelectFolder,
  onStartEdit,
  onChangeEditName,
  onCancelEdit,
  onSubmitRename,
  onDelete,
  onStartAddSubfolder,
  onCancelAddSubfolder,
  onChangeSubfolderName,
  onSubmitSubfolder,
  onToggleMovePopover,
  onMoveFolder,
}: FolderTreeRowProps) {
  const isActive = effectiveFolderId === node.id;
  const isEditing = editingFolderId === node.id;
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isAddingSub = addingSubfolderParentId === node.id;
  const isMoving = movingFolderId === node.id;

  const invalidTargets = useMemo(
    () => (isMoving ? getDescendantFolderIds(node.id, allFolders) : new Set<string>()),
    [isMoving, node.id, allFolders]
  );

  const validMoveEntries = useMemo(() => {
    if (!isMoving) return [];
    return flattenedFolders.filter(
      (entry) => !invalidTargets.has(entry.folder.id) && entry.folder.id !== (node.parentId ?? null)
    );
  }, [isMoving, flattenedFolders, invalidTargets, node.parentId]);

  const countTooltip =
    hasChildren && node.directItemCount !== node.totalItemCount
      ? `${node.directItemCount} directos · ${node.totalItemCount} en total (con subcarpetas)`
      : `${node.totalItemCount} elemento${node.totalItemCount !== 1 ? 's' : ''}`;

  return (
    <div>
      <div
        style={{ paddingLeft: `${8 + node.depth * 14}px` }}
        className={`relative w-full flex items-center justify-between pr-2 py-1.5 rounded-xl transition-colors duration-150 group ${
          isActive
            ? 'bg-cyan-500/12 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
            : 'text-ink-secondary hover:bg-surface-subtle/70 hover:text-ink-primary border border-transparent'
        }`}
      >
        {isEditing ? (
          <form
            onSubmit={(e) => onSubmitRename(node.id, e)}
            className="flex items-center gap-1.5 flex-1 min-w-0"
          >
            <input
              autoFocus
              value={editFolderName}
              onChange={(e) => onChangeEditName(e.target.value)}
              aria-label={`Nuevo nombre para ${node.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  onCancelEdit();
                }
              }}
              className="flex-1 min-w-0 bg-surface border border-cyan-500 text-ink-primary px-2 py-1 rounded-md text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Guardar nombre"
              title="Guardar"
              className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              aria-label="Cancelar edición"
              title="Cancelar"
              className="p-1 text-ink-muted hover:text-ink-primary rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => onToggleExpand(node.id)}
                  aria-label={isExpanded ? `Contraer ${node.name}` : `Expandir ${node.name}`}
                  className="p-0.5 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-subtle shrink-0 cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <span className="w-4 shrink-0" aria-hidden="true" />
              )}

              <button
                type="button"
                onClick={() => onSelectFolder(node.id)}
                title={node.name}
                aria-current={isActive ? 'page' : undefined}
                className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer py-0.5"
              >
                {isActive ? (
                  <FolderOpen className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-ink-secondary" />
                )}
                <span className="font-medium text-sm truncate">{node.name}</span>
              </button>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              <span
                title={countTooltip}
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                    : 'bg-surface-subtle text-ink-muted'
                }`}
              >
                {node.totalItemCount}
              </span>
              <button
                type="button"
                onClick={() => onStartAddSubfolder(node.id)}
                aria-label={`Nueva subcarpeta en ${node.name}`}
                className="text-ink-muted hover:text-cyan-600 dark:hover:text-cyan-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
                title="Nueva subcarpeta"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleMovePopover(isMoving ? null : node.id)}
                aria-label={`Mover carpeta ${node.name}`}
                className="text-ink-muted hover:text-cyan-600 dark:hover:text-cyan-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
                title="Mover a otra carpeta"
              >
                <FolderInput className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onStartEdit(node)}
                aria-label={`Renombrar materia ${node.name}`}
                className="text-ink-muted hover:text-cyan-600 dark:hover:text-cyan-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
                title="Renombrar materia"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(node)}
                aria-label={`Eliminar materia ${node.name}`}
                className="text-ink-muted hover:text-red-500 dark:hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity p-1 rounded cursor-pointer"
                title="Eliminar materia"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {isMoving && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => onToggleMovePopover(null)} />
            <div className="absolute right-2 top-full mt-1 z-40 w-56 rounded-xl bg-surface border border-border-strong shadow-xl py-1 animate-[fadeInScale_0.12s_ease-out]">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted border-b border-border-subtle">
                Mover &ldquo;{node.name}&rdquo; a
              </div>
              <div className="max-h-52 overflow-y-auto py-1">
                {node.parentId !== null && node.parentId !== undefined && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMovePopover(null);
                      onMoveFolder(node.id, null);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:bg-surface-subtle truncate cursor-pointer"
                  >
                    Nivel raíz (sin carpeta padre)
                  </button>
                )}
                {validMoveEntries.length === 0 && !node.parentId ? (
                  <div className="px-3 py-2 text-xs text-ink-muted">No hay carpetas destino disponibles</div>
                ) : (
                  validMoveEntries.map((entry) => (
                    <button
                      key={entry.folder.id}
                      type="button"
                      onClick={() => {
                        onToggleMovePopover(null);
                        onMoveFolder(node.id, entry.folder.id);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle truncate cursor-pointer"
                      title={entry.pathLabel}
                    >
                      {entry.pathLabel}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isAddingSub && (
        <form
          onSubmit={(e) => onSubmitSubfolder(node.id, e)}
          style={{ paddingLeft: `${24 + node.depth * 14}px` }}
          className="pr-2 py-1.5 flex items-center gap-1.5"
        >
          <input
            autoFocus
            type="text"
            value={subfolderName}
            onChange={(e) => onChangeSubfolderName(e.target.value)}
            placeholder={`Subcarpeta en ${node.name}...`}
            aria-label={`Nombre de subcarpeta en ${node.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                onCancelAddSubfolder();
              }
            }}
            className="flex-1 min-w-0 bg-surface border border-cyan-500 text-ink-primary px-2.5 py-1 rounded-lg text-xs outline-none placeholder:text-ink-muted"
          />
          <button
            type="submit"
            disabled={isCreatingSubfolder || !subfolderName.trim()}
            aria-label="Crear subcarpeta"
            title="Crear subcarpeta"
            className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40 rounded cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onCancelAddSubfolder}
            aria-label="Cancelar"
            title="Cancelar"
            className="p-1 text-ink-muted hover:text-ink-primary rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {hasChildren && isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {node.children.map((child) => (
            <FolderTreeRow
              key={child.id}
              node={child}
              effectiveFolderId={effectiveFolderId}
              expandedIds={expandedIds}
              editingFolderId={editingFolderId}
              editFolderName={editFolderName}
              addingSubfolderParentId={addingSubfolderParentId}
              subfolderName={subfolderName}
              isCreatingSubfolder={isCreatingSubfolder}
              movingFolderId={movingFolderId}
              allFolders={allFolders}
              flattenedFolders={flattenedFolders}
              onToggleExpand={onToggleExpand}
              onSelectFolder={onSelectFolder}
              onStartEdit={onStartEdit}
              onChangeEditName={onChangeEditName}
              onCancelEdit={onCancelEdit}
              onSubmitRename={onSubmitRename}
              onDelete={onDelete}
              onStartAddSubfolder={onStartAddSubfolder}
              onCancelAddSubfolder={onCancelAddSubfolder}
              onChangeSubfolderName={onChangeSubfolderName}
              onSubmitSubfolder={onSubmitSubfolder}
              onToggleMovePopover={onToggleMovePopover}
              onMoveFolder={onMoveFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 520;
const SIDEBAR_DEFAULT_WIDTH = 288;
const SIDEBAR_STORAGE_KEY = 'lema_sidebar_width';

export function Sidebar() {
  const router = useRouter();
  const { folders, isLoading, mutate } = useFolders();
  const activeFolderId = useLemaStore((s) => s.activeFolderId);
  const setActiveFolderId = useLemaStore((s) => s.setActiveFolderId);
  const activeTab = useLemaStore((s) => s.activeTab);
  const setActiveTab = useLemaStore((s) => s.setActiveTab);
  const folderSearch = useLemaStore((s) => s.folderSearch);
  const setFolderSearch = useLemaStore((s) => s.setFolderSearch);
  const setConfirmAction = useLemaStore((s) => s.setConfirmAction);
  const isMobileSidebarOpen = useLemaStore((s) => s.isMobileSidebarOpen);
  const setMobileSidebarOpen = useLemaStore((s) => s.setMobileSidebarOpen);
  const showToast = useEditorStore((s) => s.showToast);

  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [addingSubfolderParentId, setAddingSubfolderParentId] = useState<string | null>(null);
  const [subfolderName, setSubfolderName] = useState('');
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false);
  const [movingFolderId, setMovingFolderId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarWidthRef = useRef(SIDEBAR_DEFAULT_WIDTH);

  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);
  const flattenedFolders = useMemo(() => flattenFolderTree(folderTree), [folderTree]);

  const effectiveFolderId = activeFolderId ?? folderTree[0]?.id ?? folders[0]?.id ?? null;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved) {
        const parsed = Number.parseInt(saved, 10);
        if (!Number.isNaN(parsed)) {
          const clamped = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, parsed));
          setSidebarWidth(clamped);
          sidebarWidthRef.current = clamped;
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidthRef.current;
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, startWidth + delta)
      );
      sidebarWidthRef.current = nextWidth;
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidthRef.current));
      } catch {
        // ignore localStorage errors
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleResizeReset = useCallback(() => {
    sidebarWidthRef.current = SIDEBAR_DEFAULT_WIDTH;
    setSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(SIDEBAR_DEFAULT_WIDTH));
    } catch {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    if (activeFolderId && folders.length > 0 && !folders.some((f) => f.id === activeFolderId)) {
      setActiveFolderId(folderTree[0]?.id ?? folders[0].id);
    }
  }, [folders, folderTree, activeFolderId, setActiveFolderId]);

  // Expand parent folders on initial load and whenever activeFolderId changes
  useEffect(() => {
    if (folders.length === 0) return;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      let changed = false;

      if (!hasInitializedExpansion) {
        const parentIdsWithChildren = new Set(
          folders.map((f) => f.parentId).filter((id): id is string => Boolean(id))
        );
        for (const pid of parentIdsWithChildren) {
          if (!next.has(pid)) {
            next.add(pid);
            changed = true;
          }
        }
        setHasInitializedExpansion(true);
      }

      if (effectiveFolderId) {
        const ancestors = getFolderAncestors(effectiveFolderId, folders);
        for (let i = 0; i < ancestors.length - 1; i++) {
          if (!next.has(ancestors[i].id)) {
            next.add(ancestors[i].id);
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [effectiveFolderId, folders, hasInitializedExpansion]);

  const { nodes: visibleTree, autoExpandIds } = useMemo(
    () => filterFolderTree(folderTree, folderSearch),
    [folderTree, folderSearch]
  );

  const effectiveExpandedIds = useMemo(() => {
    if (autoExpandIds.size === 0) return expandedIds;
    const merged = new Set(expandedIds);
    for (const id of autoExpandIds) merged.add(id);
    return merged;
  }, [expandedIds, autoExpandIds]);

  const isHiddenOnMobile = isMobileViewport && !isMobileSidebarOpen;

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    setMobileSidebarOpen(false);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed || isCreatingFolder) return;
    setIsCreatingFolder(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, parentId: null }),
      });
      if (res.ok) {
        const created = await res.json();
        const newFolder: FolderSummary = {
          ...created,
          parentId: created.parentId ?? null,
          documents: [],
          latexProjects: [],
        };
        setNewFolderName('');
        await mutate((curr) => [newFolder, ...(curr ?? folders)], {
          revalidate: false,
        });
        setActiveFolderId(created.id);
        setMobileSidebarOpen(false);
      } else {
        showToast('Error al crear la materia.', 'error');
      }
    } catch {
      showToast('Error de red al crear la materia.', 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleCreateSubfolder = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = subfolderName.trim();
    if (!trimmed || isCreatingSubfolder) return;
    setIsCreatingSubfolder(true);
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, parentId }),
      });
      if (res.ok) {
        const created = await res.json();
        const newFolder: FolderSummary = {
          ...created,
          parentId: created.parentId ?? parentId,
          documents: [],
          latexProjects: [],
        };
        setSubfolderName('');
        setAddingSubfolderParentId(null);
        setExpandedIds((prev) => new Set(prev).add(parentId));
        await mutate((curr) => [newFolder, ...(curr ?? folders)], {
          revalidate: false,
        });
        setActiveFolderId(created.id);
        setMobileSidebarOpen(false);
      } else {
        showToast('Error al crear la subcarpeta.', 'error');
      }
    } catch {
      showToast('Error de red al crear la subcarpeta.', 'error');
    } finally {
      setIsCreatingSubfolder(false);
    }
  };

  const handleMoveFolder = async (folderId: string, targetParentId: string | null) => {
    const prevFolders = folders;
    await mutate(
      (curr) =>
        (curr ?? prevFolders).map((f) =>
          f.id === folderId ? { ...f, parentId: targetParentId } : f
        ),
      { revalidate: false }
    );
    if (targetParentId) {
      setExpandedIds((prev) => new Set(prev).add(targetParentId));
    }

    try {
      const res = await fetch('/api/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: folderId, parentId: targetParentId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        await mutate(prevFolders, { revalidate: false });
        showToast(err.error || 'Error al mover la carpeta.', 'error');
      } else {
        const targetName = targetParentId
          ? prevFolders.find((f) => f.id === targetParentId)?.name ?? 'carpeta'
          : 'nivel raíz';
        showToast(`Carpeta movida a "${targetName}".`, 'success');
      }
    } catch {
      await mutate(prevFolders, { revalidate: false });
      showToast('Error de red al mover la carpeta.', 'error');
    }
  };

  const handleDeleteFolder = (folder: FolderTreeNode) => {
    const count = (folder.documents?.length || 0) + (folder.latexProjects?.length || 0);
    const subCount = folder.children?.length || 0;
    const parts: string[] = [];
    if (count > 0) parts.push(`Sus ${count} apunte(s)/proyecto(s) se conservarán sin carpeta.`);
    if (subCount > 0) parts.push(`Sus ${subCount} subcarpeta(s) subirán al nivel superior.`);
    const detail = parts.length > 0 ? ' ' + parts.join(' ') : '';

    setConfirmAction({
      title: 'Eliminar materia',
      message: `¿Eliminar la materia "${folder.name}"?${detail}`,
      confirmText: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        const prevFolders = folders;
        const prevActive = activeFolderId;
        const nextFolders = prevFolders
          .filter((f) => f.id !== folder.id)
          .map((f) =>
            f.parentId === folder.id ? { ...f, parentId: folder.parentId ?? null } : f
          );

        await mutate(nextFolders, { revalidate: false });
        if (effectiveFolderId === folder.id) {
          setActiveFolderId(folder.parentId ?? nextFolders[0]?.id ?? null);
        }

        try {
          const res = await fetch(`/api/folders?id=${folder.id}`, { method: 'DELETE' });
          if (!res.ok) {
            await mutate(prevFolders, { revalidate: false });
            setActiveFolderId(prevActive);
            showToast('Error al eliminar la materia.', 'error');
          }
        } catch {
          await mutate(prevFolders, { revalidate: false });
          setActiveFolderId(prevActive);
          showToast('Error de red al eliminar la materia.', 'error');
        }
      },
    });
  };

  const handleRenameFolder = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editFolderName.trim();
    if (!trimmed) {
      showToast('El nombre de la materia no puede estar vacío.', 'info');
      return;
    }

    const prevFolders = folders;
    setEditingFolderId(null);

    await mutate(
      (curr) => (curr ?? prevFolders).map((f) => (f.id === id ? { ...f, name: trimmed } : f)),
      { revalidate: false }
    );

    try {
      const res = await fetch('/api/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: trimmed }),
      });
      if (!res.ok) {
        await mutate(prevFolders, { revalidate: false });
        showToast('Error al renombrar la materia.', 'error');
      }
    } catch {
      await mutate(prevFolders, { revalidate: false });
      showToast('Error de red al renombrar la materia.', 'error');
    }
  };

  const handleLogout = async () => {
    setMobileSidebarOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navegación de materias"
        aria-hidden={isHiddenOnMobile || undefined}
        inert={isHiddenOnMobile || undefined}
        style={!isMobileViewport ? { width: `${sidebarWidth}px` } : undefined}
        className={`
          fixed inset-y-0 z-50 transform ${isResizing ? '' : 'transition-all duration-300 ease-in-out'}
          ${
            isMobileSidebarOpen
              ? 'left-0 translate-x-0'
              : '-left-80 -translate-x-full max-md:pointer-events-none max-md:invisible'
          }
          md:relative md:left-0 md:translate-x-0 md:pointer-events-auto md:visible
          w-72 shrink-0 border-r border-border-subtle bg-surface md:bg-surface/60 flex flex-col overflow-hidden
        `}
      >
        {/* Desktop resize handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Cambiar ancho de barra lateral"
          title="Arrastra para cambiar el ancho (doble clic para restablecer)"
          onMouseDown={handleResizeStart}
          onDoubleClick={handleResizeReset}
          className={`hidden md:block absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize z-30 transition-colors ${
            isResizing ? 'bg-cyan-500/60' : 'hover:bg-cyan-500/40'
          }`}
        />
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-widest flex items-center gap-2">
            <Folder className="h-3.5 w-3.5" /> Materias
          </h2>
          <button
            type="button"
            className="md:hidden text-ink-secondary hover:text-ink-primary p-1 rounded-lg cursor-pointer"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Cerrar menú lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile view switcher */}
        <div className="px-5 pt-3 flex md:hidden gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('folders');
              setMobileSidebarOpen(false);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === 'folders'
                ? 'bg-surface-subtle border-border-strong text-ink-primary'
                : 'border-border-subtle text-ink-secondary'
            }`}
          >
            <Folder className="w-3.5 h-3.5" /> Materias
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('graph');
              setMobileSidebarOpen(false);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-surface-subtle border-border-strong text-ink-primary'
                : 'border-border-subtle text-ink-secondary'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Grafo
          </button>
        </div>

        <div className="p-4 pt-3 border-b border-border-subtle">
          <form onSubmit={handleCreateFolder} className="flex gap-2">
            <input
              id="new-folder-input"
              type="text"
              placeholder="Nueva materia o rama..."
              aria-label="Nombre de nueva materia"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 min-w-0 bg-surface-subtle/70 border border-border-subtle rounded-lg px-3 py-2 text-sm text-ink-primary focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-ink-muted"
            />
            <button
              type="submit"
              disabled={isCreatingFolder || !newFolderName.trim()}
              title="Crear materia en raíz"
              aria-label="Crear materia"
              className="flex-shrink-0 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white p-2 rounded-lg transition-colors cursor-pointer"
            >
              {isCreatingFolder ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

        <div className="px-3 pb-2 pt-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar materias..."
              aria-label="Filtrar materias"
              value={folderSearch}
              onChange={(e) => setFolderSearch(e.target.value)}
              className="w-full bg-surface-subtle/70 border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-ink-muted text-ink-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {isLoading ? (
            <div className="space-y-2 py-2" aria-label="Cargando materias">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-surface-subtle/70 border border-border-subtle animate-pulse"
                />
              ))}
            </div>
          ) : visibleTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-ink-muted text-sm text-center gap-2">
              <Folder className="h-8 w-8 opacity-30" />
              <p>{folders.length === 0 ? 'Crea tu primera materia' : 'Sin resultados'}</p>
            </div>
          ) : (
            visibleTree.map((node) => (
              <FolderTreeRow
                key={node.id}
                node={node}
                effectiveFolderId={effectiveFolderId}
                expandedIds={effectiveExpandedIds}
                editingFolderId={editingFolderId}
                editFolderName={editFolderName}
                addingSubfolderParentId={addingSubfolderParentId}
                subfolderName={subfolderName}
                isCreatingSubfolder={isCreatingSubfolder}
                movingFolderId={movingFolderId}
                allFolders={folders}
                flattenedFolders={flattenedFolders}
                onToggleExpand={handleToggleExpand}
                onSelectFolder={handleSelectFolder}
                onStartEdit={(folder) => {
                  setEditingFolderId(folder.id);
                  setEditFolderName(folder.name);
                  setMovingFolderId(null);
                  setAddingSubfolderParentId(null);
                }}
                onChangeEditName={setEditFolderName}
                onCancelEdit={() => setEditingFolderId(null)}
                onSubmitRename={handleRenameFolder}
                onDelete={handleDeleteFolder}
                onStartAddSubfolder={(parentId) => {
                  setAddingSubfolderParentId(parentId);
                  setSubfolderName('');
                  setEditingFolderId(null);
                  setMovingFolderId(null);
                  setExpandedIds((prev) => new Set(prev).add(parentId));
                }}
                onCancelAddSubfolder={() => {
                  setAddingSubfolderParentId(null);
                  setSubfolderName('');
                }}
                onChangeSubfolderName={setSubfolderName}
                onSubmitSubfolder={handleCreateSubfolder}
                onToggleMovePopover={setMovingFolderId}
                onMoveFolder={(folderId, targetParentId) => void handleMoveFolder(folderId, targetParentId)}
              />
            ))
          )}
        </div>

        {/* Mobile-only quick tools & theme/logout */}
        <div className="p-3 border-t border-border-subtle space-y-2 md:hidden bg-surface-subtle/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-ink-muted">Apariencia</span>
            <ThemeToggle />
          </div>
          <div className="flex gap-2">
            <a
              href="/minijuegos/lectura-musical.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border border-border-subtle bg-surface text-ink-secondary text-xs font-medium"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Minijuego</span>
            </a>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Sección especial: Java Classroom */}
        <div className="p-3 border-t border-border-subtle bg-surface-subtle/40 shrink-0">
          <a
            href="/java"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-all group"
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Java Classroom</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono">
              Interactivo
            </span>
          </a>
        </div>
      </aside>
    </>
  );
}
