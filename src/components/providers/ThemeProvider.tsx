'use client';

import { useEffect } from 'react';
import { useLemaStore, type ThemeMode } from '@/store/useLemaStore';

const STORAGE_KEY = 'lema-theme';

function applyDomTheme(mode: ThemeMode): 'light' | 'dark' {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved: 'light' | 'dark' =
    mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.style.colorScheme = resolved;
  }
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useLemaStore((s) => s.theme);
  const setTheme = useLemaStore((s) => s.setTheme);
  const setResolvedTheme = useLemaStore((s) => s.setResolvedTheme);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setTheme(saved);
        setResolvedTheme(applyDomTheme(saved));
      } else {
        setResolvedTheme(applyDomTheme('dark'));
      }
    } catch {
      setResolvedTheme(applyDomTheme('dark'));
    }
  }, [setResolvedTheme, setTheme]);

  useEffect(() => {
    const resolved = applyDomTheme(theme);
    setResolvedTheme(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors in private browsing
    }

    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      setResolvedTheme(applyDomTheme('system'));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme, setResolvedTheme]);

  return <>{children}</>;
}
