'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Folder,
  FileText,
  Share2,
  Loader2,
  CheckCircle2,
  HardDriveDownload,
  Menu,
  Gamepad2,
  Coffee,
  Search,
  LogOut,
} from 'lucide-react';
import { useLemaStore } from '@/store/useLemaStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useFolders } from '@/lib/useFolders';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function TopNavbar() {
  const router = useRouter();
  const { folders } = useFolders();
  const activeTab = useLemaStore((s) => s.activeTab);
  const setActiveTab = useLemaStore((s) => s.setActiveTab);
  const setMobileSidebarOpen = useLemaStore((s) => s.setMobileSidebarOpen);
  const setCommandPaletteOpen = useLemaStore((s) => s.setCommandPaletteOpen);
  const showToast = useEditorStore((s) => s.showToast);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const exportSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revokeUrlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exportSuccessTimerRef.current) clearTimeout(exportSuccessTimerRef.current);
      if (revokeUrlTimerRef.current) clearTimeout(revokeUrlTimerRef.current);
    };
  }, []);

  const { totalNotes, totalLatex, totalItems } = useMemo(() => {
    let notes = 0;
    let latex = 0;
    for (const f of folders) {
      notes += f.documents?.length || 0;
      latex += f.latexProjects?.length || 0;
    }
    return { totalNotes: notes, totalLatex: latex, totalItems: notes + latex };
  }, [folders]);

  const handleExportZip = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast('Error al exportar: ' + (err.error || res.status), 'error');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Lema-Backup-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();

      if (revokeUrlTimerRef.current) clearTimeout(revokeUrlTimerRef.current);
      revokeUrlTimerRef.current = setTimeout(() => URL.revokeObjectURL(url), 1000);

      setExportSuccess(true);
      if (exportSuccessTimerRef.current) clearTimeout(exportSuccessTimerRef.current);
      exportSuccessTimerRef.current = setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      showToast('Error de red al exportar: ' + (err?.message || 'desconocido'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      showToast('Error al cerrar sesión.', 'error');
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border-subtle bg-surface/90 px-4 md:px-6 backdrop-blur-md z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
          title="Abrir menú"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight gradient-text">Lema</span>
          <span className="ml-2 text-xs text-ink-muted hidden lg:inline">Segundo Cerebro</span>
        </div>
      </div>

      {/* Acceso móvil rápido */}
      <div className="flex md:hidden items-center gap-1.5">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          title="Buscar (Ctrl+K)"
          aria-label="Abrir buscador global"
          className="p-2 rounded-lg border border-border-subtle bg-surface-subtle/70 text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'graph' ? 'folders' : 'graph')}
          title={activeTab === 'graph' ? 'Ver Materias' : 'Ver Grafo'}
          aria-label={activeTab === 'graph' ? 'Cambiar a Materias' : 'Cambiar a Grafo'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'graph'
              ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
              : 'border-border-subtle bg-surface-subtle/70 text-ink-secondary'
          }`}
        >
          {activeTab === 'graph' ? <Folder className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{activeTab === 'graph' ? 'Materias' : 'Grafo'}</span>
        </button>
        <button
          type="button"
          onClick={handleExportZip}
          disabled={isExporting}
          title="Descargar Backup ZIP"
          aria-label="Descargar Backup ZIP"
          className="p-2 rounded-lg border border-border-subtle bg-surface-subtle/70 text-ink-secondary disabled:opacity-50 cursor-pointer"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDriveDownload className="w-4 h-4" />}
        </button>
      </div>

      {/* Desktop controls */}
      <div className="hidden md:flex items-center gap-2.5 text-xs text-ink-secondary">
        <div className="flex bg-surface-subtle/70 rounded-lg p-1 border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab('folders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'folders'
                ? 'bg-surface text-ink-primary shadow-sm font-medium'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Folder className="w-3.5 h-3.5" /> Materias
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-surface text-ink-primary shadow-sm font-medium'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Grafo
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Abrir paleta de comandos (Ctrl+K)"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-subtle/60 hover:bg-surface-subtle text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Buscar...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-ink-muted">
            ⌘K
          </kbd>
        </button>

        <div
          className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-subtle/40 border border-border-subtle text-ink-muted"
          title={`${totalNotes} apuntes/pizarrones · ${totalLatex} proyectos LaTeX`}
        >
          <span className="flex items-center gap-1">
            <Folder className="h-3.5 w-3.5 text-cyan-500" />
            {folders.length}
          </span>
          <span className="h-3 w-px bg-border-subtle" />
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            {totalItems}
          </span>
        </div>

        <a
          href="/minijuegos/lectura-musical.html"
          target="_blank"
          rel="noopener noreferrer"
          title="Minijuego: Lectura a Primera Vista"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-subtle bg-surface-subtle/60 hover:bg-surface-subtle hover:text-ink-primary transition-all"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Minijuego</span>
        </a>

        <a
          href="/java"
          target="_blank"
          rel="noopener noreferrer"
          title="Java Interactive Classroom: De C a Java"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-all"
        >
          <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden lg:inline">Java Classroom</span>
          <span className="lg:hidden">Java</span>
        </a>

        <button
          type="button"
          onClick={handleExportZip}
          disabled={isExporting}
          title="Descargar toda la base de datos como ZIP"
          aria-label="Descargar Backup ZIP"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
            exportSuccess
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-border-subtle bg-surface-subtle/60 hover:bg-surface-subtle hover:text-ink-primary'
          } disabled:opacity-50`}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : exportSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <HardDriveDownload className="w-3.5 h-3.5" />
          )}
          <span className="hidden lg:inline">
            {exportSuccess ? '¡Descargado!' : isExporting ? 'Exportando...' : 'Backup'}
          </span>
        </button>

        <ThemeToggle />

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="p-2 rounded-lg border border-border-subtle bg-surface-subtle/60 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 dark:hover:text-red-400 text-ink-secondary transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}
