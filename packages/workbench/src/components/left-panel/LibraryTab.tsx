import React, { useState } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { Search, RefreshCw } from 'lucide-react';

interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  version: string;
  defaultProps: Record<string, unknown>;
}

const CATALOG_COMPONENTS: CatalogItem[] = [
  {
    id: 'res-button-01',
    slug: 'button',
    name: 'Action Button',
    category: 'primitives',
    description: 'Accessible interactive action button with primary, secondary, and outline variants.',
    version: '1.0.0',
    defaultProps: { label: 'Click Action', variant: 'primary' },
  },
  {
    id: 'res-metric-card-01',
    slug: 'metric-card',
    name: 'KPI Metric Card',
    category: 'analytics',
    description: 'High-density metric summary card with trending change indicators and formatting.',
    version: '1.0.0',
    defaultProps: {
      title: 'Active Metric',
      value: '1,420 Units',
      change: '+8.4%',
      isPositive: true,
    },
  },
  {
    id: 'res-app-header-01',
    slug: 'app-header',
    name: 'Application Header',
    category: 'navigation',
    description: 'Global top navigation bar with project title, nav items, and action cluster.',
    version: '1.0.0',
    defaultProps: {
      title: 'App Console',
      navItems: [
        { label: 'Overview', href: '#' },
        { label: 'Reports', href: '#' },
      ],
    },
  },
  {
    id: 'res-hero-banner-01',
    slug: 'hero-banner',
    name: 'Editorial Hero Banner',
    category: 'marketing',
    description: 'Expressive marketing header with high-impact title, subtitle, and primary call-to-action.',
    version: '1.0.0',
    defaultProps: {
      title: 'Compose Extraordinary Interfaces',
      subtitle: 'Deterministic composition engine driven by Design DNA and validated manifests.',
      ctaText: 'Get Started',
    },
  },
];

export function LibraryTab() {
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const updateNodeProps = useWorkbenchStore((state) => state.updateNodeProps);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = CATALOG_COMPONENTS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApplyComponent = (item: CatalogItem) => {
    if (!selectedNodeId) return;

    // Apply the resource to the selected node
    updateNodeProps(selectedNodeId, item.defaultProps);
  };

  return (
    <div data-testid="library-tab" className="p-4 space-y-4 text-xs">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8B8F97]" />
        <input
          type="text"
          placeholder="Search components & patterns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] pl-8 pr-3 py-2 text-xs placeholder:text-[#8B8F97] focus:outline-none focus:ring-1 focus:ring-[#2547E8]"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {['all', 'primitives', 'analytics', 'navigation', 'marketing'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-[#2547E8] text-white'
                : 'bg-[#FAF9F6] dark:bg-[#171B21] text-[#62666F] dark:text-[#A8AFBA] hover:bg-[#EAE8E3]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Component Cards */}
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-3 space-y-2 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#111217] dark:text-[#F5F7FA]">
                    {item.name}
                  </span>
                  <span className="rounded bg-[#FAF9F6] dark:bg-[#0B0D10] px-1.5 py-0.5 text-[9px] font-mono text-[#8B8F97] capitalize">
                    {item.category}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#8B8F97] mt-0.5">
                  {item.slug} • v{item.version}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#62666F] dark:text-[#A8AFBA] leading-normal">
              {item.description}
            </p>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-[#8B8F97]">Compatible with React + Tailwind 4</span>
              {selectedNodeId ? (
                <button
                  onClick={() => handleApplyComponent(item)}
                  className="flex items-center gap-1 rounded bg-[#2547E8] dark:bg-[#6782FF] px-2 py-1 text-[10px] font-semibold text-white dark:text-[#0B0D10] hover:opacity-90"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>Apply to Node</span>
                </button>
              ) : (
                <span className="text-[10px] italic text-[#8B8F97]">Select node to apply</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
