import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface TimerMeta {
  timer: ReturnType<typeof setTimeout> | null;
  remainingMs: number;
  startedAt: number;
}

interface EditorStore {
  toasts: Toast[];
  toastCounter: number;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: number) => void;
  pauseToast: (id: number) => void;
  resumeToast: (id: number) => void;
}

const toastTimers = new Map<number, TimerMeta>();

function clearToastTimer(id: number) {
  const meta = toastTimers.get(id);
  if (meta?.timer) {
    clearTimeout(meta.timer);
  }
  toastTimers.delete(id);
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  toasts: [],
  toastCounter: 0,
  showToast: (message, type = 'info', duration = 3500) => {
    const id = get().toastCounter + 1;
    set((state) => {
      const kept = state.toasts.slice(-4);
      const keptIds = new Set(kept.map((t) => t.id));
      for (const old of state.toasts) {
        if (!keptIds.has(old.id)) {
          clearToastTimer(old.id);
        }
      }
      return {
        toasts: [...kept, { id, message, type }],
        toastCounter: id,
      };
    });

    const timer = setTimeout(() => {
      clearToastTimer(id);
      get().dismissToast(id);
    }, duration);

    toastTimers.set(id, {
      timer,
      remainingMs: duration,
      startedAt: Date.now(),
    });
  },
  dismissToast: (id) => {
    clearToastTimer(id);
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  pauseToast: (id) => {
    const meta = toastTimers.get(id);
    if (!meta || !meta.timer) return;
    clearTimeout(meta.timer);
    const elapsed = Date.now() - meta.startedAt;
    meta.timer = null;
    meta.remainingMs = Math.max(400, meta.remainingMs - elapsed);
  },
  resumeToast: (id) => {
    const meta = toastTimers.get(id);
    if (!meta || meta.timer) return;
    meta.startedAt = Date.now();
    meta.timer = setTimeout(() => {
      clearToastTimer(id);
      get().dismissToast(id);
    }, meta.remainingMs);
  },
}));
