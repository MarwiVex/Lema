export default function WhiteboardLoading() {
  return (
    <div className="flex h-screen w-full flex-col bg-canvas text-ink-primary overflow-hidden">
      <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border-subtle bg-surface/90 px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-6 w-28 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-6 w-40 rounded-full bg-surface-subtle animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-surface-subtle animate-pulse" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-canvas p-6">
        <div className="flex items-center gap-3 text-ink-secondary">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-sm font-medium">Cargando pizarrón...</span>
        </div>
      </main>
    </div>
  );
}
