'use client';

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
}

const variantStyles: Record<
  ToastVariant,
  { bg: string; icon: typeof CheckCircle; iconColor: string }
> = {
  success: {
    bg: 'border-indigo-500/30 bg-zinc-900',
    icon: CheckCircle,
    iconColor: 'text-indigo-400',
  },
  error: { bg: 'border-red-500/30 bg-zinc-900', icon: AlertCircle, iconColor: 'text-red-400' },
  warning: {
    bg: 'border-amber-500/30 bg-zinc-900',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
  },
  info: { bg: 'border-violet-500/30 bg-zinc-900', icon: Info, iconColor: 'text-violet-400' },
};

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const style = variantStyles[toast.variant];
  const Icon = style.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border ${style.bg} px-4 py-3 shadow-lg animate-in slide-in-from-right`}
      role="alert"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconColor}`} />
      <p className="flex-1 text-sm text-zinc-200">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
