'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLemaStore } from '@/store/useLemaStore';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { DocumentList } from './DocumentList';
import { CommandPalette } from './CommandPalette';

const ImportLatexModal = dynamic(
  () => import('./ImportLatexModal').then((m) => m.ImportLatexModal),
  { ssr: false }
);

const GraphView = dynamic(() => import('./GraphView'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 flex-col items-center justify-center bg-canvas p-8 gap-4">
      <div className="w-full max-w-2xl h-72 rounded-2xl bg-surface border border-border-subtle animate-pulse" />
      <div className="h-4 w-48 rounded bg-surface-subtle animate-pulse" />
    </div>
  ),
});

function DashboardOverlays() {
  const showLatexModal = useLemaStore((s) => s.showLatexModal);

  // Global keyboard shortcuts: Ctrl/Cmd+K for CommandPalette, Escape for mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useLemaStore.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        state.setCommandPaletteOpen(!state.isCommandPaletteOpen);
        return;
      }
      if (
        e.key === 'Escape' &&
        state.isMobileSidebarOpen &&
        !state.isCommandPaletteOpen &&
        !state.showLatexModal
      ) {
        e.preventDefault();
        state.setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <CommandPalette />
      {showLatexModal && <ImportLatexModal />}
    </>
  );
}

export default function Dashboard() {
  const activeTab = useLemaStore((s) => s.activeTab);
  const [hasVisitedGraph, setHasVisitedGraph] = useState(false);

  useEffect(() => {
    if (activeTab === 'graph') {
      setHasVisitedGraph(true);
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen w-full flex-col bg-canvas text-ink-primary font-sans overflow-hidden">
      {/* Global Command Palette (Ctrl+K / Cmd+K) & LaTeX Import Modal */}
      <DashboardOverlays />

      {/* Top Header */}
      <TopNavbar />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {(activeTab === 'graph' || hasVisitedGraph) && (
          <div className={activeTab === 'graph' ? 'flex flex-1 overflow-hidden' : 'hidden'}>
            <GraphView />
          </div>
        )}

        <div className={activeTab === 'folders' ? 'flex flex-1 overflow-hidden' : 'hidden'}>
          <Sidebar />
          <DocumentList />
        </div>
      </div>
    </div>
  );
}
