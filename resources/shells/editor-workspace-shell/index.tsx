import React from 'react';

export type EditorWorkspaceShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorWorkspaceShellProps {
  variant?: EditorWorkspaceShellVariant;
}

export function EditorWorkspaceShell({ variant = 'quiet' }: EditorWorkspaceShellProps) {
  let theme = 'bg-white text-neutral-900 border-neutral-200';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100 border-[#2E3440]';

  return (
    <div className={`h-screen flex flex-col font-mono text-xs border rounded-xl overflow-hidden ${theme}`}>
      <div className="h-9 px-4 border-b flex items-center justify-between opacity-70">
        <span>src/index.tsx</span>
        <span>TypeScript Strict</span>
      </div>
      <div className="flex-1 p-4 flex gap-4 overflow-auto">
        <div className="opacity-30 select-none text-right">
          <p>1</p><p>2</p><p>3</p>
        </div>
        <div className="flex-1">
          <p className="text-blue-500">export function App() &#123;</p>
          <p className="pl-4">return &lt;Tessellate /&gt;;</p>
          <p className="text-blue-500">&#125;</p>
        </div>
      </div>
      <div className="h-6 px-4 bg-neutral-100 dark:bg-neutral-900 border-t flex items-center justify-between text-[10px] opacity-60">
        <span>Ln 3, Col 2</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
