'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle, Loader2, ShieldAlert } from 'lucide-react';
import { ConfirmAction } from '@/store/useLemaStore';

interface ConfirmModalProps {
  action: ConfirmAction;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    iconBg: 'bg-red-500/12 text-red-500 dark:text-red-400',
    button: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20',
    Icon: AlertTriangle,
    defaultTitle: 'Confirmar eliminación',
    defaultConfirm: 'Eliminar',
  },
  warning: {
    iconBg: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    button: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20',
    Icon: ShieldAlert,
    defaultTitle: 'Confirmar acción',
    defaultConfirm: 'Continuar',
  },
  primary: {
    iconBg: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20',
    Icon: HelpCircle,
    defaultTitle: 'Confirmar',
    defaultConfirm: 'Aceptar',
  },
} as const;

export function ConfirmModal({ action, onCancel }: ConfirmModalProps) {
  const [isPending, setIsPending] = useState(false);
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const variant = action.variant ?? 'danger';
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.Icon;

  const handleConfirm = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await action.onConfirm();
      onCancel();
    } catch {
      setIsPending(false);
    }
  };

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    // Focus cancel for destructive actions so accidental Enter doesn't destroy data without thought,
    // or confirm button for primary actions
    const focusTarget = variant === 'danger' ? cancelBtnRef.current : confirmBtnRef.current;
    focusTarget?.focus();

    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, [variant]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPending, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="bg-surface border border-border-strong rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-[fadeInScale_0.15s_ease-out]"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${styles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 id={titleId} className="font-semibold text-ink-primary">
            {action.title || styles.defaultTitle}
          </h3>
        </div>
        <p id={descId} className="text-ink-secondary text-sm mb-6 leading-relaxed">
          {action.message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelBtnRef}
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {action.cancelText || 'Cancelar'}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={isPending}
            onClick={() => void handleConfirm()}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-lg flex items-center gap-2 disabled:opacity-60 cursor-pointer ${styles.button}`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {action.confirmText || styles.defaultConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
