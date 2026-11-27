'use client';

import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';

export default function ToastContainer() {
  const toasts = useEditorStore((s) => s.toasts);
  const dismissToast = useEditorStore((s) => s.dismissToast);
  const pauseToast = useEditorStore((s) => s.pauseToast);
  const resumeToast = useEditorStore((s) => s.resumeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[220] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            onMouseEnter={() => pauseToast(toast.id)}
            onMouseLeave={() => resumeToast(toast.id)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl border pointer-events-auto transition-all duration-200 max-w-xs backdrop-blur-md animate-[slideInUp_0.2s_ease-out] ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : isError
                ? 'bg-red-50/95 dark:bg-red-950/90 border-red-500/40 text-red-900 dark:text-red-200'
                : 'bg-surface/95 border-border-strong text-ink-primary'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            {isError && (
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            {toast.type === 'info' && (
              <Info className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
            )}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Cerrar notificación"
              className="opacity-65 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
