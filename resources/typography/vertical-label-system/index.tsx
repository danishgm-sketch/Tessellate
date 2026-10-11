import React from 'react';

export type VerticalLabelSystemVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VerticalLabelSystemProps {
  railLabel?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  variant?: VerticalLabelSystemVariant;
  children?: React.ReactNode;
}

export function VerticalLabelSystem({
  railLabel = 'SEC.08 — SPECIFICATION LAYER',
  sectionTitle = 'Systematic Design Grammar',
  sectionDescription = 'Tessellate does not sell a pile of components. It composes a coherent interface system from an open resource vocabulary.',
  variant = 'quiet',
  children,
}: VerticalLabelSystemProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const railColor =
    variant === 'nocturne'
      ? 'text-cyan-400 border-[#2E3440]'
      : variant === 'expressive'
      ? 'text-indigo-600 border-[#D9D6CF]'
      : 'text-neutral-400 border-neutral-200';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto flex gap-8 items-start transition-colors ${containerBg}`}>
      {/* 90-degree vertical rail label */}
      <div
        className={`hidden sm:block shrink-0 pr-4 border-r font-mono text-[11px] font-bold uppercase tracking-widest ${railColor}`}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {railLabel}
      </div>

      <div className="space-y-3">
        <span className="sm:hidden text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
          {railLabel}
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {sectionTitle}
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
          {sectionDescription}
        </p>
        {children}
      </div>
    </div>
  );
}
