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

interface ToolItem {
  id: string;
  num: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const TOOLS_LIST: ToolItem[] = [
  {
    id: 'dna',
    num: '01',
    name: 'Design DNA Lab',
    category: 'System Intelligence',
    description: 'Interactively manipulate canonical 10-dimensional DNA vectors, feel mixing, and component inheritance.',
    icon: Sliders,
    href: '/tools/dna',
  },
  {
    id: 'backgrounds',
    num: '02',
    name: 'Background Studio',
    category: 'Surface Fields',
    description: 'Generate mathematical gradients, luminous meshes, Cartesian coordinate grids, noise, and CSS visual fields.',
    icon: Sparkles,
    href: '/tools/backgrounds',
  },
  {
    id: 'motion',
    num: '03',
    name: 'Motion Studio',
    category: 'Kinetic Physics',
    description: 'Edit cubic-bezier easing curves, spring dynamics (stiffness, damping, mass), stagger pacing, and WCAG reduced motion.',
    icon: Zap,
    href: '/tools/motion',
  },
  {
    id: 'palette',
    num: '04',
    name: 'Palette Studio',
    category: 'Chroma Architecture',
    description: 'Synthesize semantic, accessible palette tokens with real-time WCAG 2.2 AA and AAA contrast floor calculations.',
    icon: Palette,
    href: '/tools/palette',
  },
  {
    id: 'typography',
    num: '05',
    name: 'Typography Lab',
    category: 'Hierarchical Scale',
    description: 'Explore harmonic musical type scales, typeface pairing archetypes, tabular figures, and dense telemetry typesetting.',
    icon: Type,
    href: '/tools/typography',
  },
  {
    id: 'layout',
    num: '06',
    name: 'Layout Composer',
    category: 'Structural Grammars',
    description: 'Compose and stress-test responsive wireframe architectures across mobile, tablet, and wide desktop ports.',
    icon: Layout,
    href: '/tools/layout',
  },
  {
    id: 'section-planner',
    num: '07',
    name: 'Section Planner',
    category: 'Narrative Orchestration',
    description: 'Generate ordered, balanced section grammars tailored for B2B conversion, developer platforms, or editorial storytelling.',
    icon: ListOrdered,
    href: '/tools/section-planner',
  },
  {
    id: 'dataviz',
    num: '08',
    name: 'Data Visualisation Styler',
    category: 'Information Graphics',
    description: 'Imbue continuous splines, area volume streams, bar ledgers, and donut charts with project Design DNA.',
    icon: BarChart3,
    href: '/tools/dataviz',
  },
  {
    id: 'accessibility',
    num: '09',
    name: 'Accessibility Lab',
    category: 'Inclusive Compliance',
    description: 'Audit APCA contrast ratios, focus indicator visibility, minimum touch target sizes, and keyboard heuristics.',
    icon: ShieldCheck,
    href: '/tools/accessibility',
  },
  {
    id: 'icons',
    num: '10',
    name: 'SVG / Icon Lab',
    category: 'Permissive Vocabulary',
    description: 'Search, tune optical stroke geometry, recolour, and export permissively licensed icons under the ISC license.',
    icon: Shapes,
    href: '/tools/icons',
  },
];

export function ToolsHub() {
  return (
    <div className="space-y-12 select-none">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
            Tessellate Interface Suite
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#E7EBFF] text-[#2547E8]">
            10 Standalone Client Tools · Zero Login Required
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111217]">
          Ten Interface Tools.
        </h1>
        <p className="text-lg text-[#62666F] leading-relaxed">
          Autonomous, deterministic design instruments that run completely in browser memory. Every tool produces immediate, exportable code and requires no subscription or sign-in.
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
                  <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                    {tool.num}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                    {tool.category}
                  </span>
                  <h3 className="text-lg font-semibold text-[#111217] group-hover:text-[#2547E8] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-[#62666F] leading-relaxed">
                    {tool.description}
                  </p>
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
