import React from 'react';
import {
  Sliders,
  Sparkles,
  Zap,
  Palette,
  Type,
  Layout,
  ListOrdered,
  BarChart3,
  ShieldCheck,
  Shapes,
  ArrowRight,
} from 'lucide-react';
import { CapabilityBadge, type CapabilityTier } from '@tessellate/ui';

interface ToolItem {
  id: string;
  num: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  tier: CapabilityTier;
}

const TOOLS_LIST: ToolItem[] = [
  {
    id: 'dna',
    num: '01',
    name: 'Design DNA Lab',
    category: 'System Intelligence',
    description:
      'Explore presets, adjust Design DNA dimensions, compare samples, and inspect inheritance examples.',
    icon: Sliders,
    href: '/tools/dna',
    tier: 'Beta',
  },
  {
    id: 'backgrounds',
    num: '02',
    name: 'Background Studio',
    category: 'Surface Fields',
    description:
      'Adjust background patterns and copy the CSS or Tailwind examples for use in a project.',
    icon: Sparkles,
    href: '/tools/backgrounds',
    tier: 'Beta',
  },
  {
    id: 'motion',
    num: '03',
    name: 'Motion Studio',
    category: 'Kinetic Physics',
    description:
      'Adjust easing, spring, and stagger settings, then preview and copy example motion values.',
    icon: Zap,
    href: '/tools/motion',
    tier: 'Beta',
  },
  {
    id: 'palette',
    num: '04',
    name: 'Palette Studio',
    category: 'Chroma Architecture',
    description:
      'Edit semantic colour tokens and inspect calculated contrast for selected colour pairs.',
    icon: Palette,
    href: '/tools/palette',
    tier: 'Beta',
  },
  {
    id: 'typography',
    num: '05',
    name: 'Typography Lab',
    category: 'Hierarchical Scale',
    description:
      'Explore type scales, font-pairing previews, numeric samples, and OpenType feature settings.',
    icon: Type,
    href: '/tools/typography',
    tier: 'Beta',
  },
  {
    id: 'layout',
    num: '06',
    name: 'Layout Composer',
    category: 'Structural Grammars',
    description:
      'Adjust a responsive wireframe preview and copy its CSS or Tailwind layout snippet.',
    icon: Layout,
    href: '/tools/layout',
    tier: 'Beta',
  },
  {
    id: 'section-planner',
    num: '07',
    name: 'Section Planner',
    category: 'Page Structure',
    description: 'Plan and reorder example sections, then copy a JSON outline for review.',
    icon: ListOrdered,
    href: '/tools/section-planner',
    tier: 'Beta',
  },
  {
    id: 'dataviz',
    num: '08',
    name: 'Data Visualisation Styler',
    category: 'Information Graphics',
    description: 'Adjust sample chart recipes and copy the rendered SVG for review or adaptation.',
    icon: BarChart3,
    href: '/tools/dataviz',
    tier: 'Beta',
  },
  {
    id: 'accessibility',
    num: '09',
    name: 'Accessibility Lab',
    category: 'Inclusive Compliance',
    description:
      'Check selected colour contrast, focus-ring dimensions, and minimum touch-target size.',
    icon: ShieldCheck,
    href: '/tools/accessibility',
    tier: 'Beta',
  },
  {
    id: 'icons',
    num: '10',
    name: 'SVG / Icon Lab',
    category: 'Permissive Vocabulary',
    description:
      'Search and adjust ISC-licensed Lucide icons, then copy React JSX or SVG for project review.',
    icon: Shapes,
    href: '/tools/icons',
    tier: 'Beta',
  },
];

export function ToolsHub() {
  return (
    <div className="space-y-12">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
            Tessellate Interface Suite
          </span>
          <CapabilityBadge tier="Beta" />
          <span className="text-[10px] font-mono text-[#62666F]">
            10 client-side tools · no login required
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111217]">
          Ten Interface Tools.
        </h1>
        <p className="text-lg text-[#62666F] leading-relaxed">
          These browser-based tools are useful for exploration, but their interactions and outputs
          are still being validated. They do not certify or change a saved Workbench project.
        </p>
      </div>

      {/* Grid of 10 Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS_LIST.map((tool) => {
          const Icon = tool.icon;
          return (
            <a
              key={tool.id}
              href={tool.href}
              className="group flex flex-col justify-between rounded-2xl border border-[#D9D6CF] bg-white p-6 shadow-sm hover:border-[#111217] hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] group-hover:bg-[#111217] group-hover:text-white transition-colors text-[#2547E8]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CapabilityBadge tier={tool.tier} />
                    <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                      {tool.num}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                    {tool.category}
                  </span>
                  <h3 className="text-lg font-semibold text-[#111217] group-hover:text-[#2547E8] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-[#62666F] leading-relaxed">{tool.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-6 border-t border-[#D9D6CF] text-xs font-semibold text-[#111217] group-hover:text-[#2547E8] transition-colors">
                <span>Launch Studio</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
