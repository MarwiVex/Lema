'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useLemaStore, type ThemeMode } from '@/store/useLemaStore';

const MODES: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Oscuro', Icon: Moon },
  { value: 'system', label: 'Sistema', Icon: Monitor },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useLemaStore((s) => s.theme);
  const setTheme = useLemaStore((s) => s.setTheme);

  if (compact) {
    const nextMap: Record<ThemeMode, ThemeMode> = {
      dark: 'light',
      light: 'system',
      system: 'dark',
    };
    const current = MODES.find((m) => m.value === theme) ?? MODES[1];
    const CurrentIcon = current.Icon;
    return (
      <button
        type="button"
        onClick={() => setTheme(nextMap[theme])}
        title={`Tema: ${current.label} (clic para cambiar)`}
        aria-label={`Tema actual: ${current.label}. Cambiar tema`}
        className="p-2 rounded-lg border border-border-subtle bg-surface-subtle/60 hover:bg-surface-subtle text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
      >
        <CurrentIcon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Selector de tema"
      className="inline-flex items-center rounded-lg border border-border-subtle bg-surface-subtle/70 p-0.5"
    >
      {MODES.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-label={`Tema ${label}`}
            aria-pressed={active}
            title={`Tema ${label}`}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              active
                ? 'bg-surface text-ink-primary shadow-sm border border-border-subtle'
                : 'text-ink-muted hover:text-ink-primary border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
