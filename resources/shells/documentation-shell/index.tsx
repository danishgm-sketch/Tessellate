import React from 'react';

export type DocumentationShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DocumentationShellProps {
  variant?: DocumentationShellVariant;
  children?: React.ReactNode;
}

export function DocumentationShell({
  variant = 'quiet',
  children = <div className="space-y-4"><h1 className="text-xl font-bold">Getting Started</h1><p className="text-neutral-600 leading-relaxed">Tessellate composes deterministic React interfaces from validated open resource manifests.</p></div>,
}: DocumentationShellProps) {
  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={`@container min-h-screen flex flex-col @lg:flex-row divide-y @lg:divide-y-0 @lg:divide-x text-xs ${theme}`}>
      <aside className="w-full @lg:w-56 p-4 @sm:p-6 space-y-4 shrink-0">
        <span className="font-bold text-sm block">Documentation</span>
        <div className="space-y-1 opacity-80">
          <p className="font-medium">Overview</p>
          <p>Architecture</p>
          <p>Design DNA</p>
          <p>CLI & MCP</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 max-w-3xl p-4 @sm:p-6 @lg:p-10">{children}</main>
      <aside className="hidden @lg:block w-48 p-6 opacity-60 text-[11px] shrink-0">
        <span className="font-semibold block mb-2">On This Page</span>
        <p>Installation</p>
        <p>First Resource</p>
      </aside>
    </div>
  );
}
