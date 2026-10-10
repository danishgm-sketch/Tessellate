import React from 'react';

export type ToastVariant = 'quiet' | 'expressive' | 'nocturne';
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  variant?: ToastVariant;
  type?: ToastType;
  title: string;
  description?: string;
  onDismiss?: () => void;
}

export function Toast({
  variant = 'quiet',
  type = 'info',
  title,
  description,
  onDismiss,
}: ToastProps) {
  let card = 'bg-white border-neutral-200 text-neutral-900 shadow-xl';
  let dot = 'bg-neutral-900';
  if (type === 'success') dot = 'bg-emerald-500';
  if (type === 'error') dot = 'bg-rose-500';
  if (type === 'warning') dot = 'bg-amber-500';

  if (variant === 'expressive') {
    card = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
    if (type === 'info') dot = 'bg-[#2547E8]';
  } else if (variant === 'nocturne') {
    card = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 max-w-sm ${card}`}>
      <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${dot}`} />
      <div className="flex-1 space-y-0.5 text-xs">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-neutral-500 leading-relaxed">{description}</p>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-xs opacity-50 hover:opacity-100">✕</button>
      )}
    </div>
  );
}
