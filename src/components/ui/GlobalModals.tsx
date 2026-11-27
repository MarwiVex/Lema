'use client';

import { useLemaStore } from '@/store/useLemaStore';
import { ConfirmModal } from './ConfirmModal';

export function GlobalModals() {
  const confirmAction = useLemaStore((s) => s.confirmAction);
  const setConfirmAction = useLemaStore((s) => s.setConfirmAction);

  if (!confirmAction) return null;

  return (
    <ConfirmModal
      action={confirmAction}
      onCancel={() => setConfirmAction(null)}
    />
  );
}
