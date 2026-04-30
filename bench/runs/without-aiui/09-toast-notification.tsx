import * as React from 'react';
import { useEffect, useState } from 'react';

type ToastVariant = 'success' | 'info' | 'warning' | 'error';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  body?: string;
}

const INITIAL: ToastItem[] = [
  {
    id: '1',
    variant: 'success',
    title: 'Token promoted',
    body: 'color.brand-warm is now in your design memory.',
  },
  { id: '2', variant: 'info', title: 'Sync ran', body: '.aiui/design-memory.md was regenerated.' },
  {
    id: '3',
    variant: 'warning',
    title: 'Drift detected',
    body: '12 hardcoded colors are not in your token set.',
  },
  {
    id: '4',
    variant: 'error',
    title: 'Adoption failed',
    body: 'API key is invalid. Update it in /api-keys.',
  },
];

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; bg: string; icon: string; iconColor: string }
> = {
  success: { border: '#16A34A', bg: '#F0FDF4', icon: '✓', iconColor: '#15803D' },
  info: { border: '#3B82F6', bg: '#EFF6FF', icon: 'ℹ', iconColor: '#1D4ED8' },
  warning: { border: '#F59E0B', bg: '#FFFBEB', icon: '!', iconColor: '#B45309' },
  error: { border: '#DC2626', bg: '#FEF2F2', icon: '✕', iconColor: '#B91C1C' },
};

const DURATION_MS = 5000;

export default function ToastContainer() {
  const [toasts, setToasts] = useState(INITIAL);

  function dismiss(id: string) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-[20px] right-[20px] z-50 flex flex-col gap-[10px] w-[360px] max-w-[calc(100vw-40px)]"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const styles = VARIANT_STYLES[toast.variant];
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(pct);
      if (pct === 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 60);
    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className="relative overflow-hidden rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.10)] border-l-[4px] animate-[slideUp_0.3s_ease-out]"
      style={{
        background: styles.bg,
        borderLeftColor: styles.border,
      }}
    >
      <div className="flex items-start gap-[12px] p-[14px] pr-[10px]">
        <span
          aria-hidden
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[12px] font-bold mt-[1px]"
          style={{ background: styles.border, color: '#FFFFFF' }}
        >
          {styles.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold mb-[2px]" style={{ color: styles.iconColor }}>
            {toast.title}
          </p>
          {toast.body && (
            <p className="text-[12.5px] leading-[1.4]" style={{ color: '#334155' }}>
              {toast.body}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-[14px] text-[#64748B] hover:text-[#0F172A] w-[22px] h-[22px] flex items-center justify-center"
        >
          ✕
        </button>
      </div>
      <div
        className="absolute bottom-0 left-0 h-[2px] transition-[width] duration-100"
        style={{ width: `${progress}%`, background: styles.border, opacity: 0.5 }}
      />
    </div>
  );
}
