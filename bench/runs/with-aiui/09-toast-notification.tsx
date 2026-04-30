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

const VARIANT_CLASSES: Record<ToastVariant, { wrap: string; icon: string; title: string }> = {
  success: {
    wrap: 'border-success bg-success-soft',
    icon: 'bg-success text-background',
    title: 'text-success',
  },
  info: {
    wrap: 'border-primary bg-primary-soft',
    icon: 'bg-primary text-background',
    title: 'text-primary',
  },
  warning: {
    wrap: 'border-warning bg-warning-soft',
    icon: 'bg-warning text-background',
    title: 'text-warning',
  },
  error: {
    wrap: 'border-destructive bg-destructive-soft',
    icon: 'bg-destructive text-background',
    title: 'text-destructive',
  },
};

const VARIANT_GLYPH: Record<ToastVariant, string> = {
  success: '✓',
  info: 'ℹ',
  warning: '!',
  error: '✕',
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
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 w-96 max-w-full"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const cls = VARIANT_CLASSES[toast.variant];
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
      className={`relative overflow-hidden rounded-md border-l-4 ${cls.wrap}`}
    >
      <div className="flex items-start gap-3 p-4 pr-3">
        <span
          aria-hidden
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${cls.icon}`}
        >
          {VARIANT_GLYPH[toast.variant]}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold mb-1 ${cls.title}`}>{toast.title}</p>
          {toast.body && <p className="text-xs leading-relaxed text-foreground">{toast.body}</p>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-sm text-muted-foreground hover:text-foreground w-6 h-6 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-foreground/20 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
