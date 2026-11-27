export default function DocLoading() {
  return (
    <div className="flex h-screen w-full flex-col bg-canvas text-ink-primary overflow-hidden">
      <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border-subtle bg-surface/90 px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-6 w-28 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-6 w-44 rounded-full bg-surface-subtle animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-surface-subtle animate-pulse" />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="h-8 w-64 rounded-xl bg-surface-subtle animate-pulse" />
          <div className="h-4 w-80 rounded bg-surface-subtle/70 animate-pulse" />
          <div className="h-[60vh] w-full rounded-2xl bg-surface border border-border-subtle p-6 space-y-4">
            <div className="h-5 w-3/4 rounded bg-surface-subtle animate-pulse" />
            <div className="h-5 w-1/2 rounded bg-surface-subtle animate-pulse" />
            <div className="h-28 w-full rounded-xl bg-surface-subtle/70 animate-pulse" />
            <div className="h-5 w-2/3 rounded bg-surface-subtle animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
