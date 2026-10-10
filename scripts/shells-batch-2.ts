import type { ShellDef } from './shells-builder.js';

export const SHELLS_BATCH_2: ShellDef[] = [
  // 19. Data Terminal Header
  {
    slug: 'data-terminal-header',
    name: 'Data Terminal Header',
    description: 'High-density monospace financial header with ticker feed, clock, and connection latency.',
    categories: ['shells', 'navigation'],
    roles: ['header', 'terminal'],
    purposes: ['Trading terminals', 'Telemetry monitors', 'Server status consoles'],
    componentName: 'DataTerminalHeader',
    tags: ['data-terminal-header', 'terminal', 'finance', 'monospace'],
    idealFor: ['Real-time streaming dashboards and Bloomberg-style terminals'],
    avoidFor: ['Casual marketing blogs'],
    jobs: ['Stream critical telemetry status and ticker feeds in header strip'],
    indexCode: `import React from 'react';

export type DataTerminalHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataTerminalHeaderProps {
  variant?: DataTerminalHeaderVariant;
}

export function DataTerminalHeader({ variant = 'quiet' }: DataTerminalHeaderProps) {
  let theme = 'bg-neutral-900 text-white font-mono border-b border-neutral-800';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100 font-mono border-b border-[#2E3440]';

  return (
    <header className={\`w-full px-4 h-11 flex items-center justify-between text-xs \${theme}\`}>
      <div className="flex items-center gap-4">
        <span className="font-bold text-emerald-400">● LIVE</span>
        <span className="opacity-70">BTC/USD $94,320.50</span>
        <span className="opacity-70 text-emerald-400">+2.4%</span>
      </div>
      <div className="flex items-center gap-4 opacity-60 text-[11px]">
        <span>RTT: 12ms</span>
        <span>UTC 14:02:49</span>
      </div>
    </header>
  );
}
`,
    previewCode: `import React from 'react';
import { DataTerminalHeader } from './index.js';

export function DataTerminalHeaderPreview() {
  return (
    <div className="w-full">
      <DataTerminalHeader variant="nocturne" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Data Terminal Header
High-density monospace financial header with ticker feed, clock, and connection latency.
`,
  },

  // 20. Mobile Bottom Navigation
  {
    slug: 'mobile-bottom-nav',
    name: 'Mobile Bottom Navigation',
    description: 'Fixed bottom thumb-friendly tab bar for mobile web apps with icon and label pairs.',
    categories: ['shells', 'navigation', 'mobile'],
    roles: ['navigation', 'mobile'],
    purposes: ['Mobile web app', 'Phone responsive navigation'],
    componentName: 'MobileBottomNav',
    tags: ['mobile-bottom-nav', 'bottom-nav', 'mobile', 'tabs'],
    idealFor: ['Narrow touch screens under 640px'],
    avoidFor: ['Desktop widescreen layouts'],
    jobs: ['Keep primary app navigation accessible within thumb reach on mobile'],
    indexCode: `import React, { useState } from 'react';

export type MobileBottomNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MobileBottomNavProps {
  variant?: MobileBottomNavVariant;
}

export function MobileBottomNav({ variant = 'quiet' }: MobileBottomNavProps) {
  const [active, setActive] = useState('feed');

  let bar = 'bg-white/90 border-t border-neutral-200 text-neutral-800 backdrop-blur-md';
  let activeStyle = 'text-neutral-900 font-bold';
  if (variant === 'expressive') {
    bar = 'bg-white/95 border-t border-[#D9D6CF] text-neutral-700 backdrop-blur-md';
    activeStyle = 'text-[#2547E8] font-bold';
  } else if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10]/95 border-t border-[#2E3440] text-neutral-400 backdrop-blur-md';
    activeStyle = 'text-white font-bold';
  }

  const items = [
    { id: 'feed', label: 'Feed', icon: '◫' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'dna', label: 'DNA', icon: '🧬' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className={\`fixed bottom-0 left-0 w-full h-16 flex items-center justify-around z-40 md:hidden \${bar}\`}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => setActive(it.id)}
          className={\`flex flex-col items-center gap-1 text-[10px] transition-colors \${
            it.id === active ? activeStyle : 'opacity-60'
          }\`}
        >
          <span className="text-sm">{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
`,
    previewCode: `import React from 'react';
import { MobileBottomNav } from './index.js';

export function MobileBottomNavPreview() {
  return (
    <div className="w-full max-w-sm mx-auto h-32 relative border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <MobileBottomNav variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Mobile Bottom Navigation
Fixed bottom thumb-friendly tab bar for mobile web apps with icon and label pairs.
`,
  },

  // 21. Mobile Drawer Navigation
  {
    slug: 'mobile-drawer-nav',
    name: 'Mobile Drawer Navigation',
    description: 'Hamburger slide-out overlay drawer displaying full mobile navigation menu.',
    categories: ['shells', 'navigation', 'mobile'],
    roles: ['drawer', 'mobile', 'navigation'],
    purposes: ['Mobile hamburger menu', 'Responsive site navigation'],
    componentName: 'MobileDrawerNav',
    tags: ['mobile-drawer-nav', 'hamburger', 'drawer', 'mobile'],
    idealFor: ['Mobile websites with multiple sections'],
    avoidFor: ['Desktop screens'],
    jobs: ['Provide full-screen slide out menu on mobile hamburger tap'],
    indexCode: `import React, { useState } from 'react';

export type MobileDrawerNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MobileDrawerNavProps {
  variant?: MobileDrawerNavVariant;
}

export function MobileDrawerNav({ variant = 'quiet' }: MobileDrawerNavProps) {
  const [open, setOpen] = useState(false);

  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] text-white';

  return (
    <div className="w-full p-4 flex justify-between items-center border-b">
      <span className="font-semibold text-sm">Tessellate</span>
      <button type="button" onClick={() => setOpen(true)} className="p-2 border rounded-lg text-xs">
        ☰ Menu
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className={\`relative w-3/4 max-w-xs h-full p-6 space-y-6 z-10 \${theme}\`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">Navigation</span>
              <button type="button" onClick={() => setOpen(false)}>✕</button>
            </div>
            <nav className="space-y-3 text-sm">
              <a href="#" className="block py-1">Catalogue</a>
              <a href="#" className="block py-1">Workbench</a>
              <a href="#" className="block py-1">Design DNA</a>
              <a href="#" className="block py-1">Documentation</a>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { MobileDrawerNav } from './index.js';

export function MobileDrawerNavPreview() {
  return (
    <div className="w-full max-w-sm mx-auto border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <MobileDrawerNav variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Mobile Drawer Navigation
Hamburger slide-out overlay drawer displaying full mobile navigation menu.
`,
  },

  // 22. Responsive App Shell
  {
    slug: 'responsive-app-shell',
    name: 'Responsive App Shell',
    description: 'Unified application shell adapting gracefully from desktop sidebar to mobile bottom bar.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'responsive'],
    purposes: ['Cross-device web application', 'Adaptive dashboard'],
    componentName: 'ResponsiveAppShell',
    tags: ['responsive-app-shell', 'shell', 'adaptive', 'layout'],
    idealFor: ['Primary application shell across phone, tablet, and desktop'],
    avoidFor: ['Simple marketing landing pages'],
    jobs: ['Coordinate viewport layout across responsive breakpoints'],
    indexCode: `import React from 'react';

export type ResponsiveAppShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ResponsiveAppShellProps {
  variant?: ResponsiveAppShellVariant;
  children?: React.ReactNode;
}

export function ResponsiveAppShell({
  variant = 'quiet',
  children = <div className="p-8 text-neutral-500 text-xs">Responsive viewport content</div>,
}: ResponsiveAppShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={\`min-h-screen flex flex-col md:flex-row \${theme}\`}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-inherit flex-col p-4 space-y-4">
        <span className="font-semibold text-sm">Tessellate</span>
        <nav className="space-y-1 text-xs">
          <a href="#" className="block p-2 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 font-medium">Dashboard</a>
          <a href="#" className="block p-2 rounded-lg opacity-70">Analytics</a>
          <a href="#" className="block p-2 rounded-lg opacity-70">Settings</a>
        </nav>
      </aside>
      {/* Main body */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ResponsiveAppShell } from './index.js';

export function ResponsiveAppShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <ResponsiveAppShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Responsive App Shell
Unified application shell adapting gracefully from desktop sidebar to mobile bottom bar.
`,
  },

  // 23. Three-Pane App Shell
  {
    slug: 'three-pane-app-shell',
    name: 'Three-Pane App Shell',
    description: 'Pro desktop shell with navigation sidebar, primary workspace canvas, and right property inspector.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'three-pane'],
    purposes: ['Design workbench', 'Email client', 'Code IDE'],
    componentName: 'ThreePaneAppShell',
    tags: ['three-pane-app-shell', 'three-pane', 'workbench', 'layout'],
    idealFor: ['High-density creative editors and productivity tools'],
    avoidFor: ['Mobile phones'],
    jobs: ['Coordinate 3 concurrent columns for simultaneous editing and inspection'],
    indexCode: `import React from 'react';

export type ThreePaneAppShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ThreePaneAppShellProps {
  variant?: ThreePaneAppShellVariant;
  leftPane?: React.ReactNode;
  centerPane?: React.ReactNode;
  rightPane?: React.ReactNode;
}

export function ThreePaneAppShell({
  variant = 'quiet',
  leftPane = <div className="p-4">Nav Tree</div>,
  centerPane = <div className="p-8">Visual Canvas</div>,
  rightPane = <div className="p-4">Inspector</div>,
}: ThreePaneAppShellProps) {
  let theme = 'bg-white border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white';

  return (
    <div className={\`h-screen flex divide-x overflow-hidden text-xs \${theme}\`}>
      <div className="w-56 shrink-0">{leftPane}</div>
      <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-[#0B0D10]">{centerPane}</div>
      <div className="w-64 shrink-0">{rightPane}</div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ThreePaneAppShell } from './index.js';

export function ThreePaneAppShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <ThreePaneAppShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Three-Pane App Shell
Pro desktop shell with navigation sidebar, primary workspace canvas, and right property inspector.
`,
  },

  // 24. Two-Pane Master Detail Shell
  {
    slug: 'two-pane-master-detail-shell',
    name: 'Two-Pane Master Detail Shell',
    description: 'Split-view shell pairing searchable master entity list with comprehensive detail reader pane.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'master-detail'],
    purposes: ['Inbox apps', 'Contact lists', 'Incident management queues'],
    componentName: 'TwoPaneMasterDetailShell',
    tags: ['two-pane-master-detail-shell', 'split-view', 'master-detail', 'shell'],
    idealFor: ['Browsing entity queues where immediate detail reading is required'],
    avoidFor: ['Freeform full-canvas drawing apps'],
    jobs: ['Coordinate master list selection with detail pane updating'],
    indexCode: `import React, { useState } from 'react';

export type TwoPaneMasterDetailShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TwoPaneMasterDetailShellProps {
  variant?: TwoPaneMasterDetailShellVariant;
}

export function TwoPaneMasterDetailShell({ variant = 'quiet' }: TwoPaneMasterDetailShellProps) {
  const [selected, setSelected] = useState('1');

  let theme = 'bg-white border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white';

  const items = [
    { id: '1', title: 'Alert: High CPU Usage', time: '10m ago' },
    { id: '2', title: 'Deploy: Version 0.1.0 Successful', time: '1h ago' },
    { id: '3', title: 'Security: Token Refresh', time: '3h ago' },
  ];

  return (
    <div className={\`h-screen flex divide-x text-xs \${theme}\`}>
      <div className="w-80 p-4 space-y-2 shrink-0">
        <span className="font-semibold block mb-2">Incidents Queue</span>
        {items.map((it) => (
          <div
            key={it.id}
            onClick={() => setSelected(it.id)}
            className={\`p-3 rounded-lg border cursor-pointer transition-colors \${
              it.id === selected ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-transparent hover:bg-neutral-50'
            }\`}
          >
            <p className="font-medium">{it.title}</p>
            <p className="text-[10px] opacity-50 mt-1">{it.time}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 p-8 space-y-4">
        <h2 className="text-base font-semibold">Incident Details (ID: {selected})</h2>
        <p className="text-neutral-500 leading-relaxed">Telemetry metrics indicate node threshold normalization.</p>
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { TwoPaneMasterDetailShell } from './index.js';

export function TwoPaneMasterDetailShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <TwoPaneMasterDetailShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Two-Pane Master Detail Shell
Split-view shell pairing searchable master entity list with comprehensive detail reader pane.
`,
  },

  // 25. Command Centre Shell
  {
    slug: 'command-centre-shell',
    name: 'Command Centre Shell',
    description: 'Mission control telemetry layout with multi-panel monitoring grids and emergency alerts.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'command-centre'],
    purposes: ['Incident operations', 'Network operations centre (NOC)', 'Live deployments'],
    componentName: 'CommandCentreShell',
    tags: ['command-centre-shell', 'mission-control', 'noc', 'telemetry'],
    idealFor: ['High-stakes operational monitors requiring multi-pane status displays'],
    avoidFor: ['Standard consumer settings pages'],
    jobs: ['Coordinate multi-grid operations monitoring'],
    indexCode: `import React from 'react';

export type CommandCentreShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandCentreShellProps {
  variant?: CommandCentreShellVariant;
  children?: React.ReactNode;
}

export function CommandCentreShell({
  variant = 'quiet',
  children = <div className="grid grid-cols-3 gap-4"><div className="border p-4 rounded-xl">Node A</div><div className="border p-4 rounded-xl">Node B</div><div className="border p-4 rounded-xl">Node C</div></div>,
}: CommandCentreShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={\`min-h-screen p-6 space-y-6 \${theme}\`}>
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Mission Control</h1>
          <p className="text-xs opacity-60">Global Cluster Telemetry</p>
        </div>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-500 rounded text-xs font-mono font-bold">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </header>
      <main className="text-xs">{children}</main>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { CommandCentreShell } from './index.js';

export function CommandCentreShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <CommandCentreShell variant="nocturne" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Command Centre Shell
Mission control telemetry layout with multi-panel monitoring grids and emergency alerts.
`,
  },

  // 26. Canvas Workspace Shell
  {
    slug: 'canvas-workspace-shell',
    name: 'Canvas Workspace Shell',
    description: 'Infinite-pan coordinate workspace canvas with floating tool palettes and zoom controls.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'canvas'],
    purposes: ['Visual UI builder', 'Diagram canvas', 'Flowchart designer'],
    componentName: 'CanvasWorkspaceShell',
    tags: ['canvas-workspace-shell', 'canvas', 'infinite-pan', 'editor'],
    idealFor: ['Direct manipulation design canvases and flowchart editors'],
    avoidFor: ['Standard tabular forms'],
    jobs: ['Provide boundless coordinate surface for interactive nodes'],
    indexCode: `import React from 'react';

export type CanvasWorkspaceShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CanvasWorkspaceShellProps {
  variant?: CanvasWorkspaceShellVariant;
  children?: React.ReactNode;
}

export function CanvasWorkspaceShell({
  variant = 'quiet',
  children = <div className="p-12 border border-dashed rounded-xl inline-block bg-white dark:bg-neutral-900">Composed Interface Screen</div>,
}: CanvasWorkspaceShellProps) {
  let gridBg = 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px]';
  if (variant === 'nocturne') {
    gridBg = 'bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-[size:16px_16px] bg-[#0B0D10] text-white';
  }

  return (
    <div className={\`w-full h-screen relative overflow-hidden flex items-center justify-center \${gridBg}\`}>
      <div className="absolute top-4 left-4 z-10 p-2 bg-white/80 dark:bg-neutral-900/80 border rounded-lg text-xs shadow-xs">
        100% Zoom
      </div>
      <div>{children}</div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { CanvasWorkspaceShell } from './index.js';

export function CanvasWorkspaceShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <CanvasWorkspaceShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Canvas Workspace Shell
Infinite-pan coordinate workspace canvas with floating tool palettes and zoom controls.
`,
  },

  // 27. Editor Workspace Shell
  {
    slug: 'editor-workspace-shell',
    name: 'Editor Workspace Shell',
    description: 'Code and structured text editing shell with gutter line numbers, status bar, and tab bar.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'editor'],
    purposes: ['Code editors', 'Markdown note spaces', 'JSON schema inspectors'],
    componentName: 'EditorWorkspaceShell',
    tags: ['editor-workspace-shell', 'code-editor', 'ide', 'shell'],
    idealFor: ['Developer text editing surfaces with gutter line numbering'],
    avoidFor: ['Standard marketing copy'],
    jobs: ['Host syntax-highlighted code editors with status bar telemetry'],
    indexCode: `import React from 'react';

export type EditorWorkspaceShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorWorkspaceShellProps {
  variant?: EditorWorkspaceShellVariant;
}

export function EditorWorkspaceShell({ variant = 'quiet' }: EditorWorkspaceShellProps) {
  let theme = 'bg-white text-neutral-900 border-neutral-200';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100 border-[#2E3440]';

  return (
    <div className={\`h-screen flex flex-col font-mono text-xs border rounded-xl overflow-hidden \${theme}\`}>
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
`,
    previewCode: `import React from 'react';
import { EditorWorkspaceShell } from './index.js';

export function EditorWorkspaceShellPreview() {
  return (
    <div className="h-64">
      <EditorWorkspaceShell variant="nocturne" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Editor Workspace Shell
Code and structured text editing shell with gutter line numbers, status bar, and tab bar.
`,
  },

  // 28. Analytics Shell
  {
    slug: 'analytics-shell',
    name: 'Analytics Shell',
    description: 'Metric-dense business intelligence dashboard shell with date picker bar and KPI grid.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'analytics'],
    purposes: ['Telemetry metrics', 'Financial analytics', 'Growth reports'],
    componentName: 'AnalyticsShell',
    tags: ['analytics-shell', 'analytics', 'dashboard', 'bi'],
    idealFor: ['Business telemetry monitoring with time interval controls'],
    avoidFor: ['Content reading sites'],
    jobs: ['Coordinate executive KPI summaries and interactive time-series plots'],
    indexCode: `import React from 'react';

export type AnalyticsShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnalyticsShellProps {
  variant?: AnalyticsShellVariant;
  children?: React.ReactNode;
}

export function AnalyticsShell({
  variant = 'quiet',
  children = <div className="grid grid-cols-4 gap-4"><div className="border p-4 rounded-xl">MRR: $84k</div><div className="border p-4 rounded-xl">DAU: 12.4k</div><div className="border p-4 rounded-xl">Churn: 0.8%</div><div className="border p-4 rounded-xl">NPS: 74</div></div>,
}: AnalyticsShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={\`min-h-screen p-8 space-y-6 \${theme}\`}>
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Analytics & Growth</h1>
          <p className="text-xs opacity-60">Trailing 30 days telemetry</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button className="px-3 py-1.5 border rounded-lg bg-white dark:bg-neutral-900">Last 30 Days</button>
          <button className="px-3 py-1.5 border rounded-lg bg-white dark:bg-neutral-900">Export CSV</button>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { AnalyticsShell } from './index.js';

export function AnalyticsShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <AnalyticsShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Analytics Shell
Metric-dense business intelligence dashboard shell with date picker bar and KPI grid.
`,
  },

  // 29. Research Terminal Shell
  {
    slug: 'research-terminal-shell',
    name: 'Research Terminal Shell',
    description: 'Scholarly exploration workspace with paper abstract viewer, citation graph, and notes rail.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'research'],
    purposes: ['Literature reviews', 'Clinical research', 'Bioinformatics exploration'],
    componentName: 'ResearchTerminalShell',
    tags: ['research-terminal-shell', 'research', 'citations', 'academic'],
    idealFor: ['Scientific analysis workstations and deep research workflows'],
    avoidFor: ['Simple marketing landing pages'],
    jobs: ['Coordinate literature discovery with contextual citation notes'],
    indexCode: `import React from 'react';

export type ResearchTerminalShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ResearchTerminalShellProps {
  variant?: ResearchTerminalShellVariant;
}

export function ResearchTerminalShell({ variant = 'quiet' }: ResearchTerminalShellProps) {
  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={\`h-screen flex divide-x text-xs \${theme}\`}>
      <div className="w-64 p-4 space-y-3">
        <span className="font-bold">Paper Index</span>
        <p className="p-2 border rounded font-medium">Attention Is All You Need</p>
        <p className="p-2 border rounded opacity-70">Deep Residual Learning</p>
      </div>
      <div className="flex-1 p-6 space-y-4">
        <h2 className="text-base font-semibold">Abstract & Empirical Results</h2>
        <p className="text-neutral-500 leading-relaxed">Evaluation metrics across multimodal benchmarks.</p>
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ResearchTerminalShell } from './index.js';

export function ResearchTerminalShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <ResearchTerminalShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Research Terminal Shell
Scholarly exploration workspace with paper abstract viewer, citation graph, and notes rail.
`,
  },

  // 30. Admin Console Shell
  {
    slug: 'admin-console-shell',
    name: 'Admin Console Shell',
    description: 'Enterprise administration layout with organization selector, user table, and security audit tab.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'admin'],
    purposes: ['Team management', 'Role permissions', 'System security settings'],
    componentName: 'AdminConsoleShell',
    tags: ['admin-console-shell', 'admin', 'enterprise', 'roles'],
    idealFor: ['IT administrative management surfaces'],
    avoidFor: ['Casual public homepages'],
    jobs: ['Manage users, access permissions, and audit logs safely'],
    indexCode: `import React from 'react';

export type AdminConsoleShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AdminConsoleShellProps {
  variant?: AdminConsoleShellVariant;
}

export function AdminConsoleShell({ variant = 'quiet' }: AdminConsoleShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={\`min-h-screen p-8 space-y-6 \${theme}\`}>
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Admin Console</h1>
          <p className="text-xs opacity-60">User permissions & security enforcement</p>
        </div>
        <button className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-lg text-xs font-medium">Invite User</button>
      </div>
      <div className="border rounded-xl p-4 bg-white dark:bg-neutral-900 text-xs">
        <p className="font-semibold mb-2">Active Organization Members (14)</p>
        <p className="opacity-60">All members authenticated with GitHub OAuth.</p>
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { AdminConsoleShell } from './index.js';

export function AdminConsoleShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <AdminConsoleShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Admin Console Shell
Enterprise administration layout with organization selector, user table, and security audit tab.
`,
  },

  // 31. Commerce Management Shell
  {
    slug: 'commerce-management-shell',
    name: 'Commerce Management Shell',
    description: 'E-commerce operations shell with order fulfillment queue, inventory counts, and sales graph.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'commerce'],
    purposes: ['Order management', 'Store catalog editor', 'Inventory tracking'],
    componentName: 'CommerceManagementShell',
    tags: ['commerce-management-shell', 'store', 'orders', 'commerce'],
    idealFor: ['Store owners tracking fulfillment and stock levels'],
    avoidFor: ['Developer API portals'],
    jobs: ['Monitor order fulfillment and inventory thresholds'],
    indexCode: `import React from 'react';

export type CommerceManagementShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommerceManagementShellProps {
  variant?: CommerceManagementShellVariant;
}

export function CommerceManagementShell({ variant = 'quiet' }: CommerceManagementShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={\`min-h-screen p-8 space-y-6 \${theme}\`}>
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-base font-bold">Store Operations</h1>
          <p className="text-xs opacity-60">Pending fulfillment orders</p>
        </div>
      </header>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="border p-4 rounded-xl bg-white dark:bg-neutral-900">Open Orders: 18</div>
        <div className="border p-4 rounded-xl bg-white dark:bg-neutral-900">Low Stock: 3 items</div>
        <div className="border p-4 rounded-xl bg-white dark:bg-neutral-900">Revenue Today: $4,290</div>
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { CommerceManagementShell } from './index.js';

export function CommerceManagementShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <CommerceManagementShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Commerce Management Shell
E-commerce operations shell with order fulfillment queue, inventory counts, and sales graph.
`,
  },

  // 32. Messaging Shell
  {
    slug: 'messaging-shell',
    name: 'Messaging Shell',
    description: 'Real-time conversation shell with channel sidebar, chat stream, and message composer.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'messaging'],
    purposes: ['Team chat', 'Support ticketing stream', 'Direct messaging'],
    componentName: 'MessagingShell',
    tags: ['messaging-shell', 'chat', 'conversation', 'messaging'],
    idealFor: ['Asynchronous team discussions and support threads'],
    avoidFor: ['Data tables'],
    jobs: ['Coordinate message thread display with bottom input composer'],
    indexCode: `import React from 'react';

export type MessagingShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MessagingShellProps {
  variant?: MessagingShellVariant;
}

export function MessagingShell({ variant = 'quiet' }: MessagingShellProps) {
  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] text-white';

  return (
    <div className={\`h-screen flex divide-x text-xs \${theme}\`}>
      <div className="w-56 p-4 space-y-2 shrink-0">
        <span className="font-semibold block mb-2">Channels</span>
        <p className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 font-medium"># product-engine</p>
        <p className="p-1.5 rounded opacity-70"># design-dna</p>
      </div>
      <div className="flex-1 flex flex-col justify-between p-4">
        <div className="space-y-3">
          <p className="font-semibold text-xs border-b pb-2"># product-engine</p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
            <span className="font-bold">Ada:</span> Composed project passed Zod schema validation.
          </div>
        </div>
        <input type="text" placeholder="Type message..." className="border p-2 rounded-lg text-xs" />
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { MessagingShell } from './index.js';

export function MessagingShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <MessagingShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Messaging Shell
Real-time conversation shell with channel sidebar, chat stream, and message composer.
`,
  },

  // 33. Documentation Shell
  {
    slug: 'documentation-shell',
    name: 'Documentation Shell',
    description: 'Technical docs shell with sticky sidebar topic hierarchy, reading center, and on-page table of contents.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'docs'],
    purposes: ['API reference docs', 'SDK developer guides', 'Design system specs'],
    componentName: 'DocumentationShell',
    tags: ['documentation-shell', 'docs', 'guide', 'toc'],
    idealFor: ['Long-form technical documentation and API reference guides'],
    avoidFor: ['Direct manipulation canvas'],
    jobs: ['Coordinate documentation reading column with sidebar tree and on-page TOC'],
    indexCode: `import React from 'react';

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
    <div className={\`min-h-screen flex divide-x text-xs \${theme}\`}>
      <aside className="w-56 p-6 space-y-4 shrink-0">
        <span className="font-bold text-sm block">Documentation</span>
        <div className="space-y-1 opacity-80">
          <p className="font-medium">Overview</p>
          <p>Architecture</p>
          <p>Design DNA</p>
          <p>CLI & MCP</p>
        </div>
      </aside>
      <main className="flex-1 max-w-3xl p-10">{children}</main>
      <aside className="hidden lg:block w-48 p-6 opacity-60 text-[11px] shrink-0">
        <span className="font-semibold block mb-2">On This Page</span>
        <p>Installation</p>
        <p>First Resource</p>
      </aside>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { DocumentationShell } from './index.js';

export function DocumentationShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <DocumentationShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Documentation Shell
Technical docs shell with sticky sidebar topic hierarchy, reading center, and on-page table of contents.
`,
  },

  // 34. Settings Shell
  {
    slug: 'settings-shell',
    name: 'Settings Shell',
    description: 'Account and workspace preference shell with category navigation tabs and form sections.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'settings'],
    purposes: ['User profile preferences', 'Billing details', 'API key management'],
    componentName: 'SettingsShell',
    tags: ['settings-shell', 'settings', 'preferences', 'profile'],
    idealFor: ['Organizing complex application preferences into category sections'],
    avoidFor: ['Real-time analytical graphs'],
    jobs: ['Host modular preference categories with clean form rows'],
    indexCode: `import React from 'react';

export type SettingsShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SettingsShellProps {
  variant?: SettingsShellVariant;
}

export function SettingsShell({ variant = 'quiet' }: SettingsShellProps) {
  let theme = 'bg-[#FAF9F6] text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={\`min-h-screen p-8 max-w-4xl mx-auto space-y-6 \${theme}\`}>
      <header className="pb-4 border-b">
        <h1 className="text-lg font-bold">Workspace Settings</h1>
        <p className="text-xs opacity-60">Manage your project defaults and developer credentials.</p>
      </header>
      <div className="flex gap-8 text-xs">
        <aside className="w-48 space-y-1">
          <p className="p-2 rounded font-semibold bg-neutral-200/50 dark:bg-neutral-800">General</p>
          <p className="p-2 rounded opacity-70">Design DNA</p>
          <p className="p-2 rounded opacity-70">Team Members</p>
          <p className="p-2 rounded opacity-70">Billing</p>
        </aside>
        <main className="flex-1 border p-6 rounded-xl bg-white dark:bg-neutral-900 space-y-4">
          <h2 className="font-semibold text-sm">Project Profile</h2>
          <div className="space-y-1">
            <label className="text-[11px] font-medium opacity-70">Workspace Name</label>
            <input type="text" defaultValue="Tessellate Lab" className="w-full border p-2 rounded text-xs" />
          </div>
        </main>
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { SettingsShell } from './index.js';

export function SettingsShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <SettingsShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Settings Shell
Account and workspace preference shell with category navigation tabs and form sections.
`,
  },

  // 35. Immersive Fullscreen Shell
  {
    slug: 'immersive-fullscreen-shell',
    name: 'Immersive Fullscreen Shell',
    description: 'Distraction-free edge-to-edge presentation shell with auto-hiding chrome and focus mode.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'fullscreen'],
    purposes: ['Presentation slides', 'Media viewers', 'Focus editing mode'],
    componentName: 'ImmersiveFullscreenShell',
    tags: ['immersive-fullscreen-shell', 'zen-mode', 'fullscreen', 'presentation'],
    idealFor: ['Edge-to-edge media presentations and distraction-free writing'],
    avoidFor: ['Multi-panel administrative apps'],
    jobs: ['Remove all chrome distractions for pure content immersion'],
    indexCode: `import React from 'react';

export type ImmersiveFullscreenShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ImmersiveFullscreenShellProps {
  variant?: ImmersiveFullscreenShellVariant;
  children?: React.ReactNode;
}

export function ImmersiveFullscreenShell({
  variant = 'quiet',
  children = <div className="text-center space-y-2"><h1 className="text-2xl font-bold">Immersive Viewport</h1><p className="text-xs opacity-60">Edge-to-edge presentation mode active.</p></div>,
}: ImmersiveFullscreenShellProps) {
  let theme = 'bg-neutral-900 text-white';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100';

  return (
    <div className={\`w-full h-screen relative flex items-center justify-center p-8 \${theme}\`}>
      <button className="absolute top-4 right-4 text-xs opacity-50 hover:opacity-100 p-2 border border-white/20 rounded-lg">
        ✕ Exit Focus Mode
      </button>
      <div>{children}</div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ImmersiveFullscreenShell } from './index.js';

export function ImmersiveFullscreenShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <ImmersiveFullscreenShell variant="nocturne" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Immersive Fullscreen Shell
Distraction-free edge-to-edge presentation shell with auto-hiding chrome and focus mode.
`,
  },

  // 36. Kiosk/Display Shell
  {
    slug: 'kiosk-display-shell',
    name: 'Kiosk Display Shell',
    description: 'Digital signage kiosk shell with high contrast typography, touch safety, and timeout reset.',
    categories: ['shells', 'layout'],
    roles: ['shell', 'kiosk'],
    purposes: ['Lobby displays', 'Public touch kiosks', 'Conference monitors'],
    componentName: 'KioskDisplayShell',
    tags: ['kiosk-display-shell', 'kiosk', 'signage', 'touch'],
    idealFor: ['Unattended touch screen kiosk hardware and public monitors'],
    avoidFor: ['Standard desktop multi-window software'],
    jobs: ['Display large-format touch interactive layout with auto-idle timeout'],
    indexCode: `import React from 'react';

export type KioskDisplayShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KioskDisplayShellProps {
  variant?: KioskDisplayShellVariant;
}

export function KioskDisplayShell({ variant = 'quiet' }: KioskDisplayShellProps) {
  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-white';

  return (
    <div className={\`w-full h-screen p-12 flex flex-col justify-between select-none \${theme}\`}>
      <header className="flex justify-between items-center pb-6 border-b">
        <span className="text-xl font-bold">Tessellate Signage Hub</span>
        <span className="text-sm font-mono opacity-50">KIOSK #04</span>
      </header>
      <main className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Touch Screen to Begin</h2>
        <p className="text-sm opacity-60">Interactive self-service interface system</p>
      </main>
      <footer className="text-center text-xs opacity-40">
        Resets automatically after 60 seconds of inactivity
      </footer>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { KioskDisplayShell } from './index.js';

export function KioskDisplayShellPreview() {
  return (
    <div className="h-64 border rounded-xl overflow-hidden">
      <KioskDisplayShell variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Kiosk Display Shell
Digital signage kiosk shell with high contrast typography, touch safety, and timeout reset.
`,
  },
];
