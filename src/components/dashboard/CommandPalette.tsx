'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  PenTool,
  FileArchive,
  Folder,
  Plus,
  Share2,
  Sun,
  Moon,
  Monitor,
  HardDriveDownload,
  LogOut,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { useLemaStore } from '@/store/useLemaStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useFolders } from '@/lib/useFolders';
import { getFolderAncestors, getFolderPathLabel } from '@/lib/folderTree';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  group: 'Documentos' | 'Proyectos LaTeX' | 'Materias' | 'Acciones';
  keywords: string;
  Icon: typeof FileText;
  iconClass: string;
  onSelect: () => void | Promise<void>;
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function CommandPalette() {
  const router = useRouter();
  const isOpen = useLemaStore((s) => s.isCommandPaletteOpen);
  const setIsOpen = useLemaStore((s) => s.setCommandPaletteOpen);
  const activeFolderId = useLemaStore((s) => s.activeFolderId);
  const setActiveFolderId = useLemaStore((s) => s.setActiveFolderId);
  const setActiveTab = useLemaStore((s) => s.setActiveTab);
  const setShowLatexModal = useLemaStore((s) => s.setShowLatexModal);
  const setTheme = useLemaStore((s) => s.setTheme);
  const setMobileSidebarOpen = useLemaStore((s) => s.setMobileSidebarOpen);
  const showToast = useEditorStore((s) => s.showToast);

  const { folders, mutate } = useFolders();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRunningAction, setIsRunningAction] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const targetFolderId = activeFolderId ?? folders[0]?.id ?? null;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const createQuickDocument = async (type: 'TEXT' | 'WHITEBOARD') => {
    if (!targetFolderId) {
      showToast('Crea o selecciona una materia primero.', 'info');
      return;
    }
    const defaultTitle =
      type === 'WHITEBOARD'
        ? `Pizarrón ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
        : `Apunte ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    setIsRunningAction(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: defaultTitle,
          type,
          content: JSON.stringify([]),
          folderId: targetFolderId,
        }),
      });
      if (!res.ok) throw new Error('Error al crear documento');
      const created = await res.json();
      await mutate();
      setIsOpen(false);
      router.push(type === 'WHITEBOARD' ? `/whiteboard/${created.id}` : `/doc/${created.id}`);
    } catch {
      showToast('No se pudo crear el documento.', 'error');
    } finally {
      setIsRunningAction(false);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/login');
    router.refresh();
  };

  const allItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [];

    // Acciones rápidas
    items.push(
      {
        id: 'action-new-doc',
        title: 'Nueva Nota de Texto',
        subtitle: targetFolderId ? 'Crear en la materia actual' : 'Requiere una materia',
        group: 'Acciones',
        keywords: 'crear nota apunte documento nuevo texto',
        Icon: Plus,
        iconClass: 'text-indigo-500 dark:text-indigo-400',
        onSelect: () => createQuickDocument('TEXT'),
      },
      {
        id: 'action-new-wb',
        title: 'Nuevo Pizarrón',
        subtitle: targetFolderId ? 'Crear pizarra en la materia actual' : 'Requiere una materia',
        group: 'Acciones',
        keywords: 'crear pizarron whiteboard dibujo nuevo',
        Icon: PenTool,
        iconClass: 'text-emerald-500 dark:text-emerald-400',
        onSelect: () => createQuickDocument('WHITEBOARD'),
      },
      {
        id: 'action-import-latex',
        title: 'Importar Proyecto LaTeX',
        subtitle: 'Subir .tex, .zip o archivos sueltos',
        group: 'Acciones',
        keywords: 'importar latex tex zip proyecto',
        Icon: FileArchive,
        iconClass: 'text-amber-500 dark:text-amber-400',
        onSelect: () => {
          setIsOpen(false);
          setShowLatexModal(true);
        },
      },
      {
        id: 'action-graph',
        title: 'Ir al Grafo de Conocimiento',
        subtitle: 'Visualizar conexiones entre apuntes',
        group: 'Acciones',
        keywords: 'grafo conocimiento relaciones mapa',
        Icon: Share2,
        iconClass: 'text-violet-500 dark:text-violet-400',
        onSelect: () => {
          setActiveTab('graph');
          setMobileSidebarOpen(false);
          setIsOpen(false);
        },
      },
      {
        id: 'action-theme-light',
        title: 'Tema Claro',
        subtitle: 'Cambiar apariencia a modo claro',
        group: 'Acciones',
        keywords: 'tema claro light apariencia color',
        Icon: Sun,
        iconClass: 'text-amber-500',
        onSelect: () => {
          setTheme('light');
          setIsOpen(false);
        },
      },
      {
        id: 'action-theme-dark',
        title: 'Tema Oscuro',
        subtitle: 'Cambiar apariencia a modo oscuro',
        group: 'Acciones',
        keywords: 'tema oscuro dark noche apariencia color',
        Icon: Moon,
        iconClass: 'text-indigo-400',
        onSelect: () => {
          setTheme('dark');
          setIsOpen(false);
        },
      },
      {
        id: 'action-theme-system',
        title: 'Tema del Sistema',
        subtitle: 'Seguir preferencia del sistema operativo',
        group: 'Acciones',
        keywords: 'tema sistema auto apariencia',
        Icon: Monitor,
        iconClass: 'text-cyan-500',
        onSelect: () => {
          setTheme('system');
          setIsOpen(false);
        },
      },
      {
        id: 'action-backup',
        title: 'Descargar Backup ZIP',
        subtitle: 'Exportar todos los apuntes y proyectos',
        group: 'Acciones',
        keywords: 'backup zip exportar descargar respaldo',
        Icon: HardDriveDownload,
        iconClass: 'text-cyan-500',
        onSelect: () => {
          setIsOpen(false);
          window.location.href = '/api/export';
        },
      },
      {
        id: 'action-logout',
        title: 'Cerrar Sesión',
        subtitle: 'Salir y volver a la pantalla de acceso',
        group: 'Acciones',
        keywords: 'cerrar sesion logout salir',
        Icon: LogOut,
        iconClass: 'text-red-500 dark:text-red-400',
        onSelect: handleLogout,
      }
    );

    for (const folder of folders) {
      const ancestors = getFolderAncestors(folder.id, folders);
      const ancestorNames = ancestors.slice(0, -1).map((a) => a.name);
      const pathLabel = getFolderPathLabel(folder.id, folders) || folder.name;
      const parentPath = ancestorNames.join(' / ');
      const itemCount = (folder.documents?.length || 0) + (folder.latexProjects?.length || 0);

      items.push({
        id: `folder-${folder.id}`,
        title: folder.name,
        subtitle: parentPath
          ? `${parentPath} · ${itemCount} elementos`
          : `${itemCount} elementos`,
        group: 'Materias',
        keywords: `materia carpeta ${pathLabel}`,
        Icon: Folder,
        iconClass: 'text-cyan-500 dark:text-cyan-400',
        onSelect: () => {
          setActiveFolderId(folder.id);
          setActiveTab('folders');
          setMobileSidebarOpen(false);
          setIsOpen(false);
        },
      });

      for (const doc of folder.documents || []) {
        const isWb = doc.type === 'WHITEBOARD';
        items.push({
          id: `doc-${doc.id}`,
          title: doc.title,
          subtitle: `${pathLabel} · ${isWb ? 'Pizarrón' : 'Apunte'}`,
          group: 'Documentos',
          keywords: `${doc.title} ${pathLabel} ${isWb ? 'pizarron whiteboard' : 'apunte nota'}`,
          Icon: isWb ? PenTool : FileText,
          iconClass: isWb
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-indigo-500 dark:text-indigo-400',
          onSelect: () => {
            setIsOpen(false);
            router.push(isWb ? `/whiteboard/${doc.id}` : `/doc/${doc.id}`);
          },
        });
      }

      for (const proj of folder.latexProjects || []) {
        items.push({
          id: `latex-${proj.id}`,
          title: proj.title,
          subtitle: `${pathLabel} · Proyecto LaTeX`,
          group: 'Proyectos LaTeX',
          keywords: `${proj.title} ${proj.description || ''} ${pathLabel} latex tex`,
          Icon: FileArchive,
          iconClass: 'text-amber-500 dark:text-amber-400',
          onSelect: () => {
            setIsOpen(false);
            router.push(`/latex/${proj.id}`);
          },
        });
      }
    }

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders, targetFolderId]);

  const filteredItems = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) {
      // Show quick actions first, then recent documents/projects/folders
      return allItems.slice(0, 25);
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    return allItems.filter((item) => {
      const haystack = normalizeSearch(`${item.title} ${item.subtitle} ${item.keywords}`);
      return tokens.every((t) => haystack.includes(t));
    });
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const activeEl = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`) as HTMLElement | null;
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length
        );
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        void filteredItems[selectedIndex].onSelect();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filteredItems, isOpen, selectedIndex, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[210] flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="w-full max-w-xl bg-surface border border-border-strong rounded-2xl shadow-2xl overflow-hidden animate-[fadeInScale_0.15s_ease-out]"
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle">
          <Search className="w-4 h-4 text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isRunningAction}
            placeholder="Buscar apuntes, pizarrones, proyectos, materias o acciones..."
            aria-label="Buscar en Lema"
            className="flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
              className="p-1 text-ink-muted hover:text-ink-primary rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-ink-muted bg-surface-subtle border border-border-subtle rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-muted">
              No se encontraron resultados para &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.Icon;
              const isSelected = idx === selectedIndex;
              const prevGroup = idx > 0 ? filteredItems[idx - 1].group : null;
              const showGroupHeader = item.group !== prevGroup;

              return (
                <div key={item.id}>
                  {showGroupHeader && (
                    <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                      {item.group}
                    </div>
                  )}
                  <button
                    type="button"
                    data-idx={idx}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => void item.onSelect()}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/12 text-ink-primary border border-indigo-500/30'
                        : 'text-ink-secondary hover:bg-surface-subtle/70 border border-transparent'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-surface-subtle border border-border-subtle shrink-0">
                      <Icon className={`w-4 h-4 ${item.iconClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-primary truncate">{item.title}</div>
                      <div className="text-xs text-ink-muted truncate">{item.subtitle}</div>
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border-subtle bg-surface-subtle/40 text-[11px] text-ink-muted">
          <span>↑↓ navegar · Enter abrir</span>
          <span>Ctrl+K para alternar</span>
        </div>
      </div>
    </div>
  );
}
