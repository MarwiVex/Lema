'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen, FileArchive, Pencil, Check, X } from 'lucide-react';
import { type LatexProjectData } from '@/components/editor/LatexProjectViewer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EditorErrorBoundary } from '@/components/ui/EditorErrorBoundary';
import { useLemaStore } from '@/store/useLemaStore';
import { useEditorStore } from '@/store/useEditorStore';

const LatexProjectViewer = dynamic(() => import('@/components/editor/LatexProjectViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-canvas">
      <div className="flex items-center space-x-3 text-amber-500 dark:text-amber-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <span className="text-sm font-medium">Cargando visor LaTeX...</span>
      </div>
    </div>
  ),
});

interface LatexProjectClientProps {
  initialProject: LatexProjectData;
}

export default function LatexProjectClient({ initialProject }: LatexProjectClientProps) {
  const router = useRouter();
  const setConfirmAction = useLemaStore((s) => s.setConfirmAction);
  const showToast = useEditorStore((s) => s.showToast);

  const [project, setProject] = useState<LatexProjectData>(initialProject);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(initialProject.title);
  const flushSaveRef = useRef<(() => Promise<boolean>) | null>(null);

  const registerFlushSave = useCallback((fn: (() => Promise<boolean>) | null) => {
    flushSaveRef.current = fn;
  }, []);

  const handleBack = async () => {
    if (flushSaveRef.current) {
      const ok = await flushSaveRef.current();
      if (!ok) {
        setConfirmAction({
          title: 'Cambios sin sincronizar',
          message:
            'No se pudieron guardar los cambios en el servidor (están respaldados localmente). ¿Salir de todos modos?',
          confirmText: 'Salir sin sincronizar',
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
    if (trimmed === project.title) return;

    const prevTitle = project.title;
    setProject((p) => ({ ...p, title: trimmed }));
    try {
      const res = await fetch('/api/latex-projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          action: 'update_title',
          title: trimmed,
          description: project.description,
        }),
      });
      if (!res.ok) throw new Error('Error');
      showToast('Título actualizado.', 'success');
    } catch {
      setProject((p) => ({ ...p, title: prevTitle }));
      showToast('No se pudo renombrar el proyecto.', 'error');
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-canvas text-ink-primary font-sans overflow-hidden">
      <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border-subtle bg-surface/90 px-4 md:px-6 backdrop-blur-md z-20 gap-3">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => void handleBack()}
            className="p-2 bg-surface-subtle/70 rounded-lg border border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
            title="Volver al dashboard"
            aria-label="Volver al dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">Lema</span>
          </div>

          <span className="hidden sm:inline h-4 w-px bg-border-subtle shrink-0" />

          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex items-center gap-1.5 min-w-0">
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setDraftTitle(project.title);
                    setIsEditingTitle(false);
                  }
                }}
                aria-label="Nuevo título del proyecto"
                className="bg-surface-subtle border border-amber-500 rounded-lg px-2.5 py-1 text-xs text-ink-primary outline-none w-44 sm:w-64"
              />
              <button
                type="submit"
                aria-label="Guardar título"
                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftTitle(project.title);
                  setIsEditingTitle(false);
                }}
                aria-label="Cancelar edición"
                className="p-1 text-ink-muted hover:text-ink-primary rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftTitle(project.title);
                setIsEditingTitle(true);
              }}
              title="Clic para renombrar el proyecto"
              className="flex items-center gap-2 rounded-full bg-surface-subtle/70 px-3 py-1 text-xs border border-border-subtle text-ink-secondary hover:text-ink-primary hover:border-border-strong transition-colors min-w-0 cursor-pointer group"
            >
              <FileArchive className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="max-w-[160px] sm:max-w-[260px] truncate font-medium">{project.title}</span>
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity shrink-0" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle compact />
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <EditorErrorBoundary title="Error en el visor de proyecto LaTeX">
          <LatexProjectViewer
            project={project}
            onProjectUpdate={setProject}
            registerFlushSave={registerFlushSave}
          />
        </EditorErrorBoundary>
      </main>
    </div>
  );
}
