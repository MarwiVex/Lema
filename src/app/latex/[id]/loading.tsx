export default function LatexProjectLoading() {
  return (
    <div className="flex h-screen w-full flex-col bg-canvas text-ink-primary overflow-hidden">
      <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border-subtle bg-surface/90 px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-6 w-28 rounded-lg bg-surface-subtle animate-pulse" />
          <div className="h-6 w-48 rounded-full bg-surface-subtle animate-pulse" />
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        <div className="hidden md:flex md:col-span-2 border-r border-border-subtle bg-surface/60 p-3 flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-surface-subtle animate-pulse" />
          ))}
        </div>
        <div className="md:col-span-4 border-r border-border-subtle bg-surface/30 p-4 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-surface-subtle animate-pulse"
              style={{ width: `${60 + ((i * 13) % 35)}%` }}
            />
          ))}
        </div>
        <div className="md:col-span-6 bg-surface/20 flex items-center justify-center p-8">
          <div className="h-full w-full max-w-lg rounded-xl bg-surface-subtle/60 border border-border-subtle animate-pulse" />
        </div>
      </main>
    </div>
  );
}
