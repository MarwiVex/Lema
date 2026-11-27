'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight, KeyRound, Coffee } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Contraseña de acceso incorrecta');
      }
    } catch {
      setError('Error al intentar conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle compact />
      </div>

      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 mb-4 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-primary mb-2">
              Lema{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs ml-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 align-middle">
                Privado
              </span>
            </h1>
            <p className="text-sm text-ink-secondary">
              Acceso exclusivo. Ingresa la contraseña de seguridad de tu espacio de trabajo.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2"
              >
                Contraseña o PIN Maestro
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-surface-subtle/70 border border-border-subtle rounded-xl text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                  autoFocus
                  required
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-shake"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar a Lema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-border-subtle text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Espacio de trabajo seguro de almacenamiento local/cloud</span>
            </div>
            <div>
              <a
                href="/java"
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-surface-subtle"
                title="Acceso directo a Java Classroom"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-500" />
                <span>Acceso directo: Java Interactive Classroom</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
