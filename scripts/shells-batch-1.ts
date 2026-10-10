import type { ShellDef } from './shells-builder.js';

export const SHELLS_BATCH_1: ShellDef[] = [
  // 1. Minimal Top Navigation
  {
    slug: 'minimal-top-nav',
    name: 'Minimal Top Navigation',
    description: 'Restrained horizontal header with brand mark, essential route links, and profile badge.',
    categories: ['shells', 'navigation'],
    roles: ['header', 'navigation'],
    purposes: ['Marketing header', 'Simple SaaS bar', 'Docs topbar'],
    componentName: 'MinimalTopNav',
    tags: ['minimal-top-nav', 'header', 'top-nav', 'navigation'],
    idealFor: ['Developer portals and focused content sites'],
    avoidFor: ['Complex multi-tenant workspace hubs'],
    jobs: ['Provide top-level site identity and navigation links'],
    indexCode: `import React from 'react';

export type MinimalTopNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MinimalTopNavProps {
  variant?: MinimalTopNavVariant;
  brand?: React.ReactNode;
  links?: Array<{ label: string; href: string }>;
  actions?: React.ReactNode;
}

export function MinimalTopNav({
  variant = 'quiet',
  brand = 'Tessellate',
  links = [
    { label: 'Catalogue', href: '#' },
    { label: 'DNA Lab', href: '#' },
    { label: 'Docs', href: '#' },
  ],
  actions,
}: MinimalTopNavProps) {
  let header = 'bg-white/80 border-b border-neutral-200 text-neutral-900';
  let linkStyle = 'text-neutral-600 hover:text-neutral-900';
  if (variant === 'expressive') {
    header = 'bg-white/90 border-b border-[#D9D6CF] text-neutral-900 shadow-2xs';
    linkStyle = 'text-neutral-700 hover:text-[#2547E8] font-medium';
  } else if (variant === 'nocturne') {
    header = 'bg-[#0B0D10]/90 border-b border-[#2E3440] text-white';
    linkStyle = 'text-neutral-400 hover:text-white';
  }

  return (
    <header className={\`w-full backdrop-blur-md sticky top-0 z-40 transition-colors \${header}\`}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="font-semibold tracking-tight text-sm flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-current" />
            <span>{brand}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs">
            {links.map((l) => (
              <a key={l.label} href={l.href} className={\`transition-colors \${linkStyle}\`}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
`,
    previewCode: `import React from 'react';
import { MinimalTopNav } from './index.js';

export function MinimalTopNavPreview() {
  return (
    <div className="w-full space-y-4">
      <MinimalTopNav variant="expressive" actions={<button className="px-3 py-1.5 text-xs bg-[#2547E8] text-white rounded-lg">Sign In</button>} />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Minimal Top Navigation
Restrained horizontal header with brand mark, essential route links, and profile badge.
`,
  },

  // 2. Centered Top Navigation
  {
    slug: 'centered-top-nav',
    name: 'Centered Top Navigation',
    description: 'Symmetrical marketing header with brand logo on left, centered links, and right-aligned CTA.',
    categories: ['shells', 'navigation'],
    roles: ['header', 'navigation'],
    purposes: ['Product homepage', 'Company landing page'],
    componentName: 'CenteredTopNav',
    tags: ['centered-top-nav', 'header', 'symmetrical', 'nav'],
    idealFor: ['Editorial marketing homepages'],
    avoidFor: ['Dense multi-tool admin consoles'],
    jobs: ['Present balanced marketing navigation links centered on screen'],
    indexCode: `import React from 'react';

export type CenteredTopNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CenteredTopNavProps {
  variant?: CenteredTopNavVariant;
  brand?: React.ReactNode;
  links?: Array<{ label: string; href: string }>;
  cta?: React.ReactNode;
}

export function CenteredTopNav({
  variant = 'quiet',
  brand = 'Tessellate',
  links = [
    { label: 'Features', href: '#' },
    { label: 'Showcase', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  cta = <button className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded-lg">Get Started</button>,
}: CenteredTopNavProps) {
  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  if (variant === 'expressive') bar = 'bg-white border-b border-[#D9D6CF] text-neutral-900';
  if (variant === 'nocturne') bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';

  return (
    <nav className={\`w-full px-6 h-16 flex items-center justify-between \${bar}\`}>
      <div className="font-semibold text-sm">{brand}</div>
      <div className="hidden md:flex items-center gap-6 text-xs">
        {links.map((l) => (
          <a key={l.label} href={l.href} className="opacity-70 hover:opacity-100 transition-opacity">
            {l.label}
          </a>
        ))}
      </div>
      <div>{cta}</div>
    </nav>
  );
}
`,
    previewCode: `import React from 'react';
import { CenteredTopNav } from './index.js';

export function CenteredTopNavPreview() {
  return (
    <div className="w-full">
      <CenteredTopNav variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Centered Top Navigation
Symmetrical marketing header with brand logo on left, centered links, and right-aligned CTA.
`,
  },

  // 3. Mega Navigation
  {
    slug: 'mega-nav',
    name: 'Mega Navigation',
    description: 'Comprehensive multi-column dropdown header exposing broad product suite categories.',
    categories: ['shells', 'navigation'],
    roles: ['meganav', 'header'],
    purposes: ['Enterprise suites', 'Multi-product ecosystems'],
    componentName: 'MegaNav',
    tags: ['mega-nav', 'dropdown', 'enterprise', 'header'],
    idealFor: ['Large product suites with 20+ feature sections'],
    avoidFor: ['Single utility micro-apps'],
    jobs: ['Organize dense product ecosystems into category columns'],
    indexCode: `import React, { useState } from 'react';

export type MegaNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MegaNavProps {
  variant?: MegaNavVariant;
}

export function MegaNav({ variant = 'quiet' }: MegaNavProps) {
  const [open, setOpen] = useState(false);

  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  let menu = 'bg-white border-[#D9D6CF] shadow-2xl';
  if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    menu = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';
  }

  return (
    <div className={\`w-full relative \${bar}\`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-semibold text-sm">Tessellate Suite</span>
        <div className="flex items-center gap-6 text-xs">
          <button type="button" onClick={() => setOpen(!open)} className="font-medium flex items-center gap-1">
            Products ▾
          </button>
          <a href="#" className="opacity-70 hover:opacity-100">Enterprise</a>
          <a href="#" className="opacity-70 hover:opacity-100">Docs</a>
        </div>
        <button className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded-lg">Launch</button>
      </div>
      {open && (
        <div className={\`absolute top-full left-0 w-full border-b p-8 z-40 \${menu}\`}>
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8 text-xs">
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Composition Engine</p>
              <p className="text-neutral-500">Deterministic Zod layout mutation pipeline.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Design DNA</p>
              <p className="text-neutral-500">10-dimensional mathematical aesthetic control.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Workbench</p>
              <p className="text-neutral-500">Dual-layer visual and structural editor.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { MegaNav } from './index.js';

export function MegaNavPreview() {
  return (
    <div className="w-full">
      <MegaNav variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Mega Navigation
Comprehensive multi-column dropdown header exposing broad product suite categories.
`,
  },

  // 4. Marketing Navigation with CTA
  {
    slug: 'marketing-nav-cta',
    name: 'Marketing Navigation with CTA',
    description: 'High-conversion header with promotional badge, navigation links, and primary CTA trigger.',
    categories: ['shells', 'navigation'],
    roles: ['header', 'marketing'],
    purposes: ['Lead capture pages', 'Product launches', 'SaaS homepages'],
    componentName: 'MarketingNavCta',
    tags: ['marketing-nav-cta', 'header', 'cta', 'conversion'],
    idealFor: ['Public marketing landing pages targeting user signups'],
    avoidFor: ['Authenticated dashboard interiors'],
    jobs: ['Drive traffic toward primary CTA button'],
    indexCode: `import React from 'react';

export type MarketingNavCtaVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MarketingNavCtaProps {
  variant?: MarketingNavCtaVariant;
}

export function MarketingNavCta({ variant = 'quiet' }: MarketingNavCtaProps) {
  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  let cta = 'bg-neutral-900 text-white';
  if (variant === 'expressive') {
    bar = 'bg-white border-b border-[#D9D6CF] text-neutral-900';
    cta = 'bg-[#2547E8] text-white shadow-xs';
  } else if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    cta = 'bg-white text-neutral-950 font-semibold';
  }

  return (
    <header className={\`w-full px-6 h-16 flex items-center justify-between \${bar}\`}>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm">Tessellate</span>
        <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded px-1.5 py-0.5 font-mono">
          BETA
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <a href="#" className="opacity-70 hover:opacity-100">Features</a>
        <a href="#" className="opacity-70 hover:opacity-100">Pricing</a>
        <button className={\`px-4 py-1.5 rounded-lg text-xs font-medium transition-all \${cta}\`}>
          Start Free
        </button>
      </div>
    </header>
  );
}
`,
    previewCode: `import React from 'react';
import { MarketingNavCta } from './index.js';

export function MarketingNavCtaPreview() {
  return (
    <div className="w-full">
      <MarketingNavCta variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Marketing Navigation with CTA
High-conversion header with promotional badge, navigation links, and primary CTA trigger.
`,
  },

  // 5. Floating Navigation
  {
    slug: 'floating-nav',
    name: 'Floating Navigation',
    description: 'Island-style floating navigation pill pinned to top viewport with rounded corners and glass blur.',
    categories: ['shells', 'navigation'],
    roles: ['floating-nav', 'header'],
    purposes: ['Modern SaaS hero', 'Mobile viewport header', 'Creative portfolios'],
    componentName: 'FloatingNav',
    tags: ['floating-nav', 'island', 'glass', 'header'],
    idealFor: ['Visually expressive modern landing pages'],
    avoidFor: ['Full-width data-heavy admin shells'],
    jobs: ['Float clean compact navigation pill over canvas'],
    indexCode: `import React from 'react';

export type FloatingNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FloatingNavProps {
  variant?: FloatingNavVariant;
}

export function FloatingNav({ variant = 'quiet' }: FloatingNavProps) {
  let pill = 'bg-white/80 border-neutral-200 text-neutral-900 shadow-lg';
  if (variant === 'expressive') pill = 'bg-white/90 border-[#D9D6CF] text-neutral-900 shadow-xl';
  if (variant === 'nocturne') pill = 'bg-[#11141B]/90 border-[#2E3440] text-white shadow-xl';

  return (
    <div className="w-full pt-4 flex justify-center px-4">
      <div className={\`inline-flex items-center gap-6 rounded-full border px-6 py-2.5 backdrop-blur-md text-xs \${pill}\`}>
        <span className="font-semibold">Tessellate</span>
        <div className="flex items-center gap-4">
          <a href="#" className="opacity-70 hover:opacity-100">Overview</a>
          <a href="#" className="opacity-70 hover:opacity-100">Specs</a>
          <a href="#" className="opacity-70 hover:opacity-100">Changelog</a>
        </div>
        <button className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-full font-medium">
          Open
        </button>
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { FloatingNav } from './index.js';

export function FloatingNavPreview() {
  return (
    <div className="w-full bg-[#FAF9F6] p-8">
      <FloatingNav variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Floating Navigation
Island-style floating navigation pill pinned to top viewport with rounded corners and glass blur.
`,
  },

  // 6. Transparent-to-Solid Navigation
  {
    slug: 'transparent-solid-nav',
    name: 'Transparent-to-Solid Navigation',
    description: 'Dynamic header starting transparent over media heroes and transitioning solid on scroll.',
    categories: ['shells', 'navigation'],
    roles: ['header', 'scroll'],
    purposes: ['Media-rich landing pages', 'Cinematic video headers'],
    componentName: 'TransparentSolidNav',
    tags: ['transparent-solid-nav', 'dynamic-header', 'scroll', 'nav'],
    idealFor: ['Cinematic hero sections with dark photography backgrounds'],
    avoidFor: ['Fixed application tables'],
    jobs: ['Preserve hero imagery transparency while ensuring readable navigation on scroll'],
    indexCode: `import React, { useState, useEffect } from 'react';

export type TransparentSolidNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TransparentSolidNavProps {
  variant?: TransparentSolidNavVariant;
}

export function TransparentSolidNav({ variant = 'quiet' }: TransparentSolidNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solidClass = scrolled
    ? (variant === 'nocturne' ? 'bg-[#0B0D10] border-b border-[#2E3440] shadow-md' : 'bg-white border-b border-neutral-200 shadow-xs')
    : 'bg-transparent border-transparent';

  return (
    <header className={\`w-full fixed top-0 left-0 z-40 transition-all duration-200 px-6 h-16 flex items-center justify-between \${solidClass}\`}>
      <span className="font-semibold text-sm">Tessellate</span>
      <div className="flex items-center gap-6 text-xs">
        <a href="#" className="opacity-80 hover:opacity-100">Engine</a>
        <a href="#" className="opacity-80 hover:opacity-100">Gallery</a>
        <button className="px-3 py-1.5 border rounded-lg">Docs</button>
      </div>
    </header>
  );
}
`,
    previewCode: `import React from 'react';
import { TransparentSolidNav } from './index.js';

export function TransparentSolidNavPreview() {
  return (
    <div className="w-full h-32 relative bg-neutral-900 text-white">
      <TransparentSolidNav variant="nocturne" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Transparent-to-Solid Navigation
Dynamic header starting transparent over media heroes and transitioning solid on scroll.
`,
  },

  // 7. App Sidebar Compact
  {
    slug: 'app-sidebar-compact',
    name: 'App Sidebar Compact',
    description: 'High-density narrow application sidebar displaying icon triggers and tooltip labels.',
    categories: ['shells', 'navigation'],
    roles: ['sidebar', 'navigation'],
    purposes: ['IDE workbench', 'Analytics console', 'Productivity tool'],
    componentName: 'AppSidebarCompact',
    tags: ['app-sidebar-compact', 'sidebar', 'rail', 'compact'],
    idealFor: ['Maximizing canvas workspace area for data visualization or code'],
    avoidFor: ['Consumer marketing sites'],
    jobs: ['Provide icon-level navigation links in minimal 48px width'],
    indexCode: `import React from 'react';

export type AppSidebarCompactVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AppSidebarCompactProps {
  variant?: AppSidebarCompactVariant;
  activeId?: string;
}

export function AppSidebarCompact({ variant = 'quiet', activeId = 'home' }: AppSidebarCompactProps) {
  let theme = 'bg-white border-r border-neutral-200 text-neutral-800';
  let active = 'bg-neutral-100 text-neutral-900';
  if (variant === 'expressive') {
    theme = 'bg-white border-r border-[#D9D6CF] text-neutral-800';
    active = 'bg-[#E7EBFF] text-[#2547E8] font-bold';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#11141B] border-r border-[#2E3440] text-neutral-300';
    active = 'bg-[#1E232E] text-white';
  }

  const items = [
    { id: 'home', icon: '⌘' },
    { id: 'layers', icon: '◫' },
    { id: 'dna', icon: '🧬' },
    { id: 'export', icon: '⇪' },
  ];

  return (
    <aside className={\`w-14 h-screen flex flex-col items-center py-4 gap-4 \${theme}\`}>
      <div className="h-8 w-8 rounded-lg bg-current opacity-20 flex items-center justify-center font-bold text-xs" />
      <div className="flex-1 flex flex-col gap-2 w-full px-2">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={\`h-10 w-full rounded-lg flex items-center justify-center text-sm transition-colors \${
              it.id === activeId ? active : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }\`}
          >
            {it.icon}
          </button>
        ))}
      </div>
    </aside>
  );
}
`,
    previewCode: `import React from 'react';
import { AppSidebarCompact } from './index.js';

export function AppSidebarCompactPreview() {
  return (
    <div className="h-64 flex border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <AppSidebarCompact variant="expressive" />
      <div className="flex-1 p-6 text-xs text-neutral-500">Workspace stage</div>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# App Sidebar Compact
High-density narrow application sidebar displaying icon triggers and tooltip labels.
`,
  },

  // 8. App Sidebar Expanded
  {
    slug: 'app-sidebar-expanded',
    name: 'App Sidebar Expanded',
    description: 'Full-width application sidebar with hierarchical category headers, counts, and search.',
    categories: ['shells', 'navigation'],
    roles: ['sidebar', 'navigation'],
    purposes: ['Admin console', 'Project file tree', 'Documentation index'],
    componentName: 'AppSidebarExpanded',
    tags: ['app-sidebar-expanded', 'sidebar', 'navigation', 'tree'],
    idealFor: ['Deep administrative interfaces with named menu categories'],
    avoidFor: ['Small screen tablet/mobile displays'],
    jobs: ['Display full list of application modules and sub-pages'],
    indexCode: `import React from 'react';

export type AppSidebarExpandedVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AppSidebarExpandedProps {
  variant?: AppSidebarExpandedVariant;
}

export function AppSidebarExpanded({ variant = 'quiet' }: AppSidebarExpandedProps) {
  let theme = 'bg-white border-r border-neutral-200 text-neutral-900';
  let active = 'bg-neutral-100 font-semibold';
  if (variant === 'expressive') {
    theme = 'bg-white border-r border-[#D9D6CF] text-neutral-900';
    active = 'bg-[#E7EBFF] text-[#2547E8] font-semibold';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#11141B] border-r border-[#2E3440] text-white';
    active = 'bg-[#1E232E] text-white font-semibold';
  }

  return (
    <aside className={\`w-60 h-screen flex flex-col p-4 gap-6 text-xs \${theme}\`}>
      <div className="font-semibold text-sm px-2">Tessellate Console</div>
      <div className="space-y-4 flex-1">
        <div className="space-y-1">
          <p className="px-2 text-[10px] uppercase font-bold text-neutral-400">Workspace</p>
          <a href="#" className={\`block px-2.5 py-1.5 rounded-lg \${active}\`}>Dashboard</a>
          <a href="#" className="block px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100">Telemetry</a>
          <a href="#" className="block px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100">Composition Engine</a>
        </div>
        <div className="space-y-1">
          <p className="px-2 text-[10px] uppercase font-bold text-neutral-400">Settings</p>
          <a href="#" className="block px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100">Design DNA</a>
          <a href="#" className="block px-2.5 py-1.5 rounded-lg opacity-70 hover:opacity-100">API Tokens</a>
        </div>
      </div>
    </aside>
  );
}
`,
    previewCode: `import React from 'react';
import { AppSidebarExpanded } from './index.js';

export function AppSidebarExpandedPreview() {
  return (
    <div className="h-80 flex border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <AppSidebarExpanded variant="expressive" />
      <div className="flex-1 p-6 text-xs text-neutral-500">Main viewport</div>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# App Sidebar Expanded
Full-width application sidebar with hierarchical category headers, counts, and search.
`,
  },

  // 9. Collapsible Sidebar
  {
    slug: 'collapsible-sidebar',
    name: 'Collapsible Sidebar',
    description: 'Flexible sidebar toggling between icon rail (48px) and expanded labels (240px) on user trigger.',
    categories: ['shells', 'navigation'],
    roles: ['sidebar', 'collapsible'],
    purposes: ['Responsive app shells', 'Workbench layouts'],
    componentName: 'CollapsibleSidebar',
    tags: ['collapsible-sidebar', 'sidebar', 'toggle', 'responsive'],
    idealFor: ['Power users balancing label scanning with canvas area'],
    avoidFor: ['Minimal single-page flows'],
    jobs: ['Collapse and expand sidebar without page reload'],
    indexCode: `import React, { useState } from 'react';

export type CollapsibleSidebarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CollapsibleSidebarProps {
  variant?: CollapsibleSidebarVariant;
}

export function CollapsibleSidebar({ variant = 'quiet' }: CollapsibleSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  let theme = 'bg-white border-r border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-r border-[#2E3440] text-white';

  return (
    <aside className={\`h-screen transition-all duration-200 p-3 flex flex-col justify-between \${collapsed ? 'w-16' : 'w-56'} \${theme}\`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          {!collapsed && <span className="font-semibold text-xs">Workbench</span>}
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="text-xs p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="space-y-1 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <span>◫</span>
            {!collapsed && <span>Canvas</span>}
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
            <span>⚙</span>
            {!collapsed && <span>Settings</span>}
          </div>
        </nav>
      </div>
    </aside>
  );
}
`,
    previewCode: `import React from 'react';
import { CollapsibleSidebar } from './index.js';

export function CollapsibleSidebarPreview() {
  return (
    <div className="h-64 flex border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <CollapsibleSidebar variant="expressive" />
      <div className="flex-1 p-6 text-xs text-neutral-500">Interactive canvas</div>
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Collapsible Sidebar
Flexible sidebar toggling between icon rail (48px) and expanded labels (240px) on user trigger.
`,
  },

  // 10. Icon Rail
  {
    slug: 'icon-rail',
    name: 'Icon Rail',
    description: 'Ultra-thin vertical action rail for high-frequency tool selection in design editors.',
    categories: ['shells', 'navigation'],
    roles: ['rail', 'toolbar'],
    purposes: ['Figma-style tools', 'Drawing tools rail', 'Workspace switcher'],
    componentName: 'IconRail',
    tags: ['icon-rail', 'rail', 'tools', 'toolbar'],
    idealFor: ['Creative canvas tool selection'],
    avoidFor: ['Standard hierarchical page navigation'],
    jobs: ['Switch active creative tool in single keystroke or click'],
    indexCode: `import React, { useState } from 'react';

export type IconRailVariant = 'quiet' | 'expressive' | 'nocturne';

export interface IconRailProps {
  variant?: IconRailVariant;
}

export function IconRail({ variant = 'quiet' }: IconRailProps) {
  const [active, setActive] = useState('select');

  let theme = 'bg-white border-r border-neutral-200 text-neutral-800';
  let activeStyle = 'bg-neutral-900 text-white';
  if (variant === 'expressive') {
    theme = 'bg-white border-r border-[#D9D6CF] text-neutral-800';
    activeStyle = 'bg-[#2547E8] text-white shadow-xs';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#11141B] border-r border-[#2E3440] text-neutral-300';
    activeStyle = 'bg-white text-neutral-950 font-bold';
  }

  const tools = [
    { id: 'select', label: 'V' },
    { id: 'frame', label: 'F' },
    { id: 'text', label: 'T' },
    { id: 'dna', label: 'D' },
  ];

  return (
    <div className={\`w-12 h-screen flex flex-col items-center py-4 gap-2 \${theme}\`}>
      {tools.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setActive(t.id)}
          className={\`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-mono transition-colors \${
            t.id === active ? activeStyle : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }\`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { IconRail } from './index.js';

export function IconRailPreview() {
  return (
    <div className="h-64 flex border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <IconRail variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Icon Rail
Ultra-thin vertical action rail for high-frequency tool selection in design editors.
`,
  },

  // 11. Dual-Rail Navigation
  {
    slug: 'dual-rail-nav',
    name: 'Dual-Rail Navigation',
    description: 'Two-tier navigation shell with primary app rail (48px) and contextual sub-navigation list (200px).',
    categories: ['shells', 'navigation'],
    roles: ['rail', 'dual-rail', 'navigation'],
    purposes: ['Slack/Discord style multi-team chats', 'Large cloud portals'],
    componentName: 'DualRailNav',
    tags: ['dual-rail-nav', 'rail', 'teams', 'channels'],
    idealFor: ['Multi-tenant workspaces with secondary channel lists'],
    avoidFor: ['Single-project micro sites'],
    jobs: ['Partition organization switcher from contextual sub-routes'],
    indexCode: `import React from 'react';

export type DualRailNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DualRailNavProps {
  variant?: DualRailNavVariant;
}

export function DualRailNav({ variant = 'quiet' }: DualRailNavProps) {
  let rail1 = 'bg-neutral-100 border-r border-neutral-200';
  let rail2 = 'bg-white border-r border-neutral-200';
  if (variant === 'nocturne') {
    rail1 = 'bg-[#0B0D10] border-r border-[#2E3440]';
    rail2 = 'bg-[#11141B] border-r border-[#2E3440] text-white';
  }

  return (
    <div className="flex h-screen text-xs">
      {/* Tier 1: Organization/App Icons */}
      <div className={\`w-14 flex flex-col items-center py-4 gap-3 \${rail1}\`}>
        <div className="h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">T</div>
        <div className="h-8 w-8 rounded-full bg-neutral-300 dark:bg-neutral-800 flex items-center justify-center text-xs">D</div>
      </div>
      {/* Tier 2: Channels/Context Views */}
      <div className={\`w-48 p-4 space-y-3 \${rail2}\`}>
        <span className="font-semibold text-xs block">Engineering</span>
        <div className="space-y-1 opacity-80">
          <p className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer font-medium"># general</p>
          <p className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"># telemetry</p>
          <p className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"># releases</p>
        </div>
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { DualRailNav } from './index.js';

export function DualRailNavPreview() {
  return (
    <div className="h-64 flex border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <DualRailNav variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Dual-Rail Navigation
Two-tier navigation shell with primary app rail (48px) and contextual sub-navigation list (200px).
`,
  },

  // 12. Context Rail
  {
    slug: 'context-rail',
    name: 'Context Rail',
    description: 'Secondary right-hand vertical rail displaying active object inspector or contextual metadata.',
    categories: ['shells', 'layout'],
    roles: ['rail', 'inspector'],
    purposes: ['Property inspectors', 'Audit log stream', 'AI chat drawer anchor'],
    componentName: 'ContextRail',
    tags: ['context-rail', 'inspector', 'metadata', 'rail'],
    idealFor: ['Right-side property panels and live metrics'],
    avoidFor: ['Left-side primary navigation'],
    jobs: ['Host contextual properties for selected canvas element'],
    indexCode: `import React from 'react';

export type ContextRailVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ContextRailProps {
  variant?: ContextRailVariant;
  title?: string;
  children?: React.ReactNode;
}

export function ContextRail({
  variant = 'quiet',
  title = 'Inspector',
  children = <p className="opacity-60 text-xs">Select node to inspect properties.</p>,
}: ContextRailProps) {
  let theme = 'bg-white border-l border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-l border-[#2E3440] text-white';

  return (
    <aside className={\`w-64 h-screen p-4 flex flex-col gap-4 text-xs \${theme}\`}>
      <div className="flex items-center justify-between pb-2 border-b border-inherit">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400">{title}</span>
      </div>
      <div className="flex-1">{children}</div>
    </aside>
  );
}
`,
    previewCode: `import React from 'react';
import { ContextRail } from './index.js';

export function ContextRailPreview() {
  return (
    <div className="h-64 flex justify-end border rounded-xl overflow-hidden bg-[#FAF9F6]">
      <ContextRail variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Context Rail
Secondary right-hand vertical rail displaying active object inspector or contextual metadata.
`,
  },

  // 13. Workspace Switcher
  {
    slug: 'workspace-switcher',
    name: 'Workspace Switcher',
    description: 'Dropdown trigger displaying current tenant organization with plan badge and fast team switching.',
    categories: ['shells', 'navigation'],
    roles: ['switcher', 'tenant'],
    purposes: ['Multi-org switching', 'Plan status indicator'],
    componentName: 'WorkspaceSwitcher',
    tags: ['workspace-switcher', 'tenant', 'org', 'switcher'],
    idealFor: ['Multi-tenant SaaS header or sidebar top'],
    avoidFor: ['Consumer single-user accounts'],
    jobs: ['Switch active organization context'],
    indexCode: `import React, { useState } from 'react';

export type WorkspaceSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WorkspaceSwitcherProps {
  variant?: WorkspaceSwitcherVariant;
}

export function WorkspaceSwitcher({ variant = 'quiet' }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);

  let theme = 'bg-white border border-neutral-200 text-neutral-900';
  if (variant === 'expressive') theme = 'bg-white border border-[#D9D6CF] text-neutral-900 shadow-2xs';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border border-[#2E3440] text-white';

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={\`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium \${theme}\`}
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-[#2547E8] text-white flex items-center justify-center font-bold text-[10px]">T</div>
          <span>Tessellate HQ</span>
        </div>
        <span className="text-neutral-400">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-lg border border-neutral-200 bg-white dark:bg-[#11141B] dark:border-neutral-800 p-1 shadow-lg z-20 text-xs">
          <button className="w-full text-left p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium">Tessellate HQ</button>
          <button className="w-full text-left p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">Acme Labs</button>
        </div>
      )}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { WorkspaceSwitcher } from './index.js';

export function WorkspaceSwitcherPreview() {
  return (
    <div className="p-8 max-w-xs mx-auto bg-[#FAF9F6]">
      <WorkspaceSwitcher variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Workspace Switcher
Dropdown trigger displaying current tenant organization with plan badge and fast team switching.
`,
  },

  // 14. Project Switcher
  {
    slug: 'project-switcher',
    name: 'Project Switcher',
    description: 'Header breadcrumb trigger for toggling between project repositories or composed interfaces.',
    categories: ['shells', 'navigation'],
    roles: ['switcher', 'project'],
    purposes: ['Project list menu', 'Recent projects fast-switch'],
    componentName: 'ProjectSwitcher',
    tags: ['project-switcher', 'projects', 'menu', 'switcher'],
    idealFor: ['Switching between active interface systems within a tenant'],
    avoidFor: ['Global navigation menus'],
    jobs: ['Choose active interface project file'],
    indexCode: `import React from 'react';

export type ProjectSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProjectSwitcherProps {
  variant?: ProjectSwitcherVariant;
  currentProject?: string;
}

export function ProjectSwitcher({
  variant = 'quiet',
  currentProject = 'Telemetry Hub',
}: ProjectSwitcherProps) {
  let theme = 'hover:bg-neutral-100 text-neutral-800';
  if (variant === 'expressive') theme = 'hover:bg-[#E7EBFF] text-[#2547E8] font-semibold';
  if (variant === 'nocturne') theme = 'hover:bg-neutral-800 text-white';

  return (
    <div className="inline-flex items-center gap-1.5 text-xs">
      <span className="opacity-50">project /</span>
      <button type="button" className={\`px-2 py-1 rounded-md transition-colors flex items-center gap-1 \${theme}\`}>
        <span>{currentProject}</span>
        <span className="opacity-40 text-[10px]">▾</span>
      </button>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { ProjectSwitcher } from './index.js';

export function ProjectSwitcherPreview() {
  return (
    <div className="p-8 flex justify-center bg-[#FAF9F6]">
      <ProjectSwitcher variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Project Switcher
Header breadcrumb trigger for toggling between project repositories or composed interfaces.
`,
  },

  // 15. Command-First Navigation
  {
    slug: 'command-first-nav',
    name: 'Command-First Navigation',
    description: 'Spotlight-oriented application header centered on a prominent interactive search input.',
    categories: ['shells', 'navigation'],
    roles: ['header', 'command'],
    purposes: ['Developer consoles', 'Financial terminals', 'Search-first apps'],
    componentName: 'CommandFirstNav',
    tags: ['command-first-nav', 'cmdk', 'search', 'header'],
    idealFor: ['Keyboard-driven power applications'],
    avoidFor: ['Passive brochure sites'],
    jobs: ['Center application header on fast command input field'],
    indexCode: `import React from 'react';

export type CommandFirstNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandFirstNavProps {
  variant?: CommandFirstNavVariant;
}

export function CommandFirstNav({ variant = 'quiet' }: CommandFirstNavProps) {
  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  let inputTheme = 'bg-neutral-100 border-neutral-200';
  if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    inputTheme = 'bg-[#11141B] border-[#2E3440] text-white';
  }

  return (
    <header className={\`w-full px-6 h-14 flex items-center justify-between gap-4 \${bar}\`}>
      <span className="font-semibold text-xs shrink-0">Terminal</span>
      <div className={\`flex-1 max-w-lg flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs \${inputTheme}\`}>
        <span className="opacity-50">Search actions, resources, commands...</span>
        <kbd className="text-[10px] opacity-40 font-mono border rounded px-1">⌘K</kbd>
      </div>
      <div className="flex items-center gap-3 text-xs shrink-0">
        <span className="opacity-60">Status: OK</span>
      </div>
    </header>
  );
}
`,
    previewCode: `import React from 'react';
import { CommandFirstNav } from './index.js';

export function CommandFirstNavPreview() {
  return (
    <div className="w-full">
      <CommandFirstNav variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Command-First Navigation
Spotlight-oriented application header centered on a prominent interactive search input.
`,
  },

  // 16. Tab Workspace Navigation
  {
    slug: 'tab-workspace-nav',
    name: 'Tab Workspace Navigation',
    description: 'Browser-style multi-tab document bar with close buttons and split view triggers.',
    categories: ['shells', 'navigation'],
    roles: ['tabs', 'header'],
    purposes: ['Multi-file code editors', 'Spreadsheet sheet tabs', 'Design canvas tabs'],
    componentName: 'TabWorkspaceNav',
    tags: ['tab-workspace-nav', 'tabs', 'editor', 'workspace'],
    idealFor: ['Applications with concurrent open document tabs'],
    avoidFor: ['Standard single-page websites'],
    jobs: ['Display active open workspace tabs with instant switching'],
    indexCode: `import React from 'react';

export type TabWorkspaceNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TabWorkspaceNavProps {
  variant?: TabWorkspaceNavVariant;
  activeId?: string;
}

export function TabWorkspaceNav({ variant = 'quiet', activeId = '1' }: TabWorkspaceNavProps) {
  let bar = 'bg-neutral-100 border-b border-neutral-200';
  let activeTab = 'bg-white text-neutral-900 border-r border-l border-neutral-200';
  if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    activeTab = 'bg-[#11141B] text-white border-r border-l border-[#2E3440]';
  }

  const tabs = [
    { id: '1', name: 'Dashboard.tsx' },
    { id: '2', name: 'tokens.css' },
    { id: '3', name: 'schema.json' },
  ];

  return (
    <div className={\`w-full flex items-center h-10 px-2 overflow-x-auto text-xs \${bar}\`}>
      {tabs.map((t) => (
        <div
          key={t.id}
          className={\`h-full flex items-center gap-2 px-3 cursor-pointer \${
            t.id === activeId ? activeTab : 'opacity-60 hover:opacity-100'
          }\`}
        >
          <span>{t.name}</span>
          <button type="button" className="opacity-40 hover:opacity-100 text-[10px]">✕</button>
        </div>
      ))}
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { TabWorkspaceNav } from './index.js';

export function TabWorkspaceNavPreview() {
  return (
    <div className="w-full">
      <TabWorkspaceNav variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Tab Workspace Navigation
Browser-style multi-tab document bar with close buttons and split view triggers.
`,
  },

  // 17. Breadcrumb Header
  {
    slug: 'breadcrumb-header',
    name: 'Breadcrumb Header',
    description: 'Header shell combining deep hierarchical breadcrumb trail with right-aligned action buttons.',
    categories: ['shells', 'navigation'],
    roles: ['header', 'breadcrumb'],
    purposes: ['Document details view', 'Settings subpages', 'Catalog item header'],
    componentName: 'BreadcrumbHeader',
    tags: ['breadcrumb-header', 'header', 'trail', 'actions'],
    idealFor: ['Context-rich entity screens requiring upward navigation'],
    avoidFor: ['Root homepages'],
    jobs: ['Anchor page identity within overall folder or project hierarchy'],
    indexCode: `import React from 'react';

export type BreadcrumbHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BreadcrumbHeaderProps {
  variant?: BreadcrumbHeaderVariant;
}

export function BreadcrumbHeader({ variant = 'quiet' }: BreadcrumbHeaderProps) {
  let header = 'bg-white border-b border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') header = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';

  return (
    <div className={\`w-full px-6 h-14 flex items-center justify-between text-xs \${header}\`}>
      <div className="flex items-center gap-2">
        <a href="#" className="opacity-50 hover:opacity-100">Projects</a>
        <span className="opacity-30">/</span>
        <a href="#" className="opacity-50 hover:opacity-100">Telemetry</a>
        <span className="opacity-30">/</span>
        <span className="font-semibold">Analytics Node</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 border rounded-lg">Export</button>
        <button className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium rounded-lg">Save</button>
      </div>
    </div>
  );
}
`,
    previewCode: `import React from 'react';
import { BreadcrumbHeader } from './index.js';

export function BreadcrumbHeaderPreview() {
  return (
    <div className="w-full">
      <BreadcrumbHeader variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Breadcrumb Header
Header shell combining deep hierarchical breadcrumb trail with right-aligned action buttons.
`,
  },

  // 18. Search-First Header
  {
    slug: 'search-first-header',
    name: 'Search-First Header',
    description: 'Global top navigation centered around expansive query input, filters, and notification bell.',
    categories: ['shells', 'navigation'],
    roles: ['header', 'search'],
    purposes: ['E-commerce store', 'Documentation hub', 'Issue tracking portal'],
    componentName: 'SearchFirstHeader',
    tags: ['search-first-header', 'search', 'query', 'header'],
    idealFor: ['Large catalog portals where search is primary user intent'],
    avoidFor: ['Minimal single-action utilities'],
    jobs: ['Enable instantaneous full-text querying across site corpus'],
    indexCode: `import React from 'react';

export type SearchFirstHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SearchFirstHeaderProps {
  variant?: SearchFirstHeaderVariant;
}

export function SearchFirstHeader({ variant = 'quiet' }: SearchFirstHeaderProps) {
  let header = 'bg-white border-b border-neutral-200 text-neutral-900';
  let input = 'bg-neutral-50 border-neutral-300';
  if (variant === 'nocturne') {
    header = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    input = 'bg-[#11141B] border-[#2E3440] text-white';
  }

  return (
    <header className={\`w-full px-6 h-16 flex items-center justify-between gap-6 \${header}\`}>
      <span className="font-semibold text-sm">Catalog</span>
      <div className="flex-1 max-w-xl">
        <input
          type="search"
          placeholder="Search 324 canonical resources..."
          className={\`w-full rounded-lg border px-3 py-2 text-xs outline-none \${input}\`}
        />
      </div>
      <div className="flex items-center gap-3 text-xs">
        <button className="h-8 w-8 rounded-full border flex items-center justify-center">🔔</button>
        <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold">U</div>
      </div>
    </header>
  );
}
`,
    previewCode: `import React from 'react';
import { SearchFirstHeader } from './index.js';

export function SearchFirstHeaderPreview() {
  return (
    <div className="w-full">
      <SearchFirstHeader variant="expressive" />
    </div>
  );
}
`,
    fixturesCode: `export const quietFixture = { variant: 'quiet' };
export const expressiveFixture = { variant: 'expressive' };
export const nocturneFixture = { variant: 'nocturne' };
`,
    readmeCode: `# Search-First Header
Global top navigation centered around expansive query input, filters, and notification bell.
`,
  },
];
