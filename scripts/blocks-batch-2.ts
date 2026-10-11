import type { BlockDef } from './blocks-builder.js';

export const BLOCKS_BATCH_2: BlockDef[] = [
  // 22. Global Search Results
  {
    slug: 'global-search-results',
    name: 'Global Search Results',
    description: 'Search results panel with category groupings, score highlights, and keyboard shortcuts.',
    categories: ['blocks', 'search', 'results'],
    roles: ['search', 'results'],
    purposes: ['Global search matching', 'Omnibox results'],
    componentName: 'GlobalSearchResults',
    tags: ['global-search-results', 'search', 'results', 'omnibox'],
    idealFor: ['Global modal search results with diverse entity categories'],
    avoidFor: ['Basic text inputs without results panel'],
    jobs: ['Display matching items categorized by resource type'],
    indexCode: `import React from 'react';

export type GlobalSearchResultsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GlobalSearchResultsProps {
  variant?: GlobalSearchResultsVariant;
}

export function GlobalSearchResults({ variant = 'quiet' }: GlobalSearchResultsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const results = [
    { title: 'Button Primitive', cat: 'Primitives', path: 'resources/primitives/button' },
    { title: 'Editorial Hero', cat: 'Sections', path: 'resources/sections/editorial-hero' },
    { title: 'Analytics Shell', cat: 'Shells', path: 'resources/shells/analytics-shell' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Search Results (3 matches)</h3>
      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.title} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
            <div>
              <div className="font-semibold">{r.title}</div>
              <span className="text-[10px] font-mono opacity-50">{r.path}</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
              {r.cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { GlobalSearchResults, GlobalSearchResultsVariant } from './index.js';

export function GlobalSearchResultsPreview() {
  const [variant, setVariant] = useState<GlobalSearchResultsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Global Search Results Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as GlobalSearchResultsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <GlobalSearchResults variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const globalSearchResultsFixtures = {};`,
    readmeCode: `# Global Search Results

Categorized search results panel with item paths and category pills.`,
  },

  // 23. Faceted Search Results
  {
    slug: 'faceted-search-results',
    name: 'Faceted Search Results',
    description: 'Search results accompanied by facet checkboxes (type, status, tags, author).',
    categories: ['blocks', 'search', 'facets'],
    roles: ['search', 'facets'],
    purposes: ['Filterable search', 'Catalogue browsing'],
    componentName: 'FacetedSearchResults',
    tags: ['faceted-search-results', 'facets', 'filters', 'search'],
    idealFor: ['Browsing extensive component registries with multiple facet dimensions'],
    avoidFor: ['Simple single-field inputs'],
    jobs: ['Pair filter checkboxes with dynamically updating search results'],
    indexCode: `import React from 'react';

export type FacetedSearchResultsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FacetedSearchResultsProps {
  variant?: FacetedSearchResultsVariant;
}

export function FacetedSearchResults({ variant = 'quiet' }: FacetedSearchResultsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const facets = ['All (324)', 'Primitives (44)', 'Shells (36)', 'Sections (72)', 'Blocks (56)'];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 border-r border-neutral-200 dark:border-neutral-800 pr-4">
          <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">Filter Facets</span>
          <div className="space-y-2 text-xs">
            {facets.map((f, i) => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={i === 0} />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <span className="text-xs font-semibold mb-3 block">Matching Items</span>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex justify-between">
              <span className="font-semibold">editorial-hero</span>
              <span className="font-mono text-emerald-600">verified</span>
            </div>
            <div className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex justify-between">
              <span className="font-semibold">button</span>
              <span className="font-mono text-emerald-600">verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FacetedSearchResults, FacetedSearchResultsVariant } from './index.js';

export function FacetedSearchResultsPreview() {
  const [variant, setVariant] = useState<FacetedSearchResultsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Faceted Search Results Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FacetedSearchResultsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <FacetedSearchResults variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const facetedSearchResultsFixtures = {};`,
    readmeCode: `# Faceted Search Results

Search results panel with faceted category filter checkboxes.`,
  },

  // 24. Entity Search
  {
    slug: 'entity-search',
    name: 'Entity Search',
    description: 'Specific entity-lookup block with debounce input, recent searches, and inline preview.',
    categories: ['blocks', 'search', 'entity'],
    roles: ['search', 'lookup'],
    purposes: ['Specific record lookup', 'Entity auto-complete'],
    componentName: 'EntitySearch',
    tags: ['entity-search', 'lookup', 'autocomplete', 'search'],
    idealFor: ['Targeted entity lookups in CRM or resource management'],
    avoidFor: ['Broad web-wide search portals'],
    jobs: ['Offer fast search input with immediate matching entity preview'],
    indexCode: `import React, { useState } from 'react';

export type EntitySearchVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntitySearchProps {
  variant?: EntitySearchVariant;
}

export function EntitySearch({ variant = 'quiet' }: EntitySearchProps) {
  const [query, setQuery] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let inputBorder = 'border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    inputBorder = 'border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    inputBorder = 'border-[#2E3440] bg-[#151921]';
  }

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-3">Entity Lookup</h3>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type entity name or ID..."
        className={\`w-full p-2.5 rounded-lg border text-xs mb-4 outline-none \${inputBorder}\`}
      />
      <div className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs flex justify-between items-center">
        <span>Entity: <strong>Project Alpha</strong></span>
        <span className="font-mono text-[10px] opacity-60">ID: prj_9824f</span>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EntitySearch, EntitySearchVariant } from './index.js';

export function EntitySearchPreview() {
  const [variant, setVariant] = useState<EntitySearchVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Entity Search Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as EntitySearchVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <EntitySearch variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const entitySearchFixtures = {};`,
    readmeCode: `# Entity Search

Targeted lookup card with text input and matching entity card preview.`,
  },

  // 25. Command Results
  {
    slug: 'command-results',
    name: 'Command Results',
    description: 'Action-oriented palette result list with shortcut pills and description metadata.',
    categories: ['blocks', 'search', 'command'],
    roles: ['command', 'results'],
    purposes: ['Command palette actions', 'Quick execution'],
    componentName: 'CommandResults',
    tags: ['command-results', 'command', 'palette', 'actions'],
    idealFor: ['Command palette search overlays'],
    avoidFor: ['Standard blog articles'],
    jobs: ['List executable commands with keyboard shortcut pills'],
    indexCode: `import React from 'react';

export type CommandResultsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CommandResultsProps {
  variant?: CommandResultsVariant;
}

export function CommandResults({ variant = 'quiet' }: CommandResultsProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const commands = [
    { name: 'Export Code as TSX', shortcut: '⌘E' },
    { name: 'Mutate Design DNA Tokens', shortcut: '⌘D' },
    { name: 'Toggle Nocturne Theme', shortcut: '⌘T' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Command Actions</h3>
      <div className="space-y-2">
        {commands.map((c) => (
          <div key={c.name} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
            <span className="font-medium">{c.name}</span>
            <kbd className="px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 font-mono text-[10px]">
              {c.shortcut}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CommandResults, CommandResultsVariant } from './index.js';

export function CommandResultsPreview() {
  const [variant, setVariant] = useState<CommandResultsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Command Results Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as CommandResultsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <CommandResults variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const commandResultsFixtures = {};`,
    readmeCode: `# Command Results

Action list block with keyboard shortcut pill badges for command palettes.`,
  },

  // 26. Filter Builder
  {
    slug: 'filter-builder',
    name: 'Filter Builder',
    description: 'Interactive compound filter constructor with field, operator, and value rows.',
    categories: ['blocks', 'search', 'filters'],
    roles: ['filter', 'builder'],
    purposes: ['Advanced query filtering', 'Complex data filtering'],
    componentName: 'FilterBuilder',
    tags: ['filter-builder', 'filter', 'query', 'rules'],
    idealFor: ['Constructing multi-condition search queries'],
    avoidFor: ['Single keyword search boxes'],
    jobs: ['Allow user to add and delete compound filter condition rows'],
    indexCode: `import React, { useState } from 'react';

export type FilterBuilderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FilterBuilderProps {
  variant?: FilterBuilderVariant;
}

export function FilterBuilder({ variant = 'quiet' }: FilterBuilderProps) {
  const [rules, setRules] = useState([
    { id: 1, field: 'Quality', op: 'greater than', val: '80' },
    { id: 2, field: 'Status', op: 'equals', val: 'verified' },
  ]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const addRule = () => {
    setRules([...rules, { id: Date.now(), field: 'Category', op: 'equals', val: 'primitives' }]);
  };

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold">Filter Rules</h3>
        <button type="button" onClick={addRule} className="text-xs px-2.5 py-1 rounded border">
          + Add Condition
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {rules.map((r) => (
          <div key={r.id} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
            <span className="font-bold">{r.field}</span>
            <span className="opacity-60">{r.op}</span>
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FilterBuilder, FilterBuilderVariant } from './index.js';

export function FilterBuilderPreview() {
  const [variant, setVariant] = useState<FilterBuilderVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Filter Builder Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FilterBuilderVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <FilterBuilder variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const filterBuilderFixtures = {};`,
    readmeCode: `# Filter Builder

Interactive filter builder supporting dynamic addition of logical criteria rules.`,
  },

  // 27. Saved Views
  {
    slug: 'saved-views',
    name: 'Saved Views',
    description: 'Saved query and filter preset tabs for quick switching between operational viewpoints.',
    categories: ['blocks', 'search', 'views'],
    roles: ['views', 'presets'],
    purposes: ['Saved perspective switching', 'Quick filter presets'],
    componentName: 'SavedViews',
    tags: ['saved-views', 'views', 'presets', 'filters'],
    idealFor: ['Table dashboards where users regularly reuse specific filter states'],
    avoidFor: ['One-off read-only landing sections'],
    jobs: ['Enable fast tabbed switching between saved table views'],
    indexCode: `import React, { useState } from 'react';

export type SavedViewsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SavedViewsProps {
  variant?: SavedViewsVariant;
}

export function SavedViews({ variant = 'quiet' }: SavedViewsProps) {
  const [active, setActive] = useState('All Resources');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let tabActive = 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    tabActive = 'bg-[#2547E8] text-white shadow-2xs font-semibold';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tabActive = 'bg-cyan-500 text-black font-semibold';
  }

  const views = ['All Resources', 'Verified Only', 'High Quality (≥90)', 'Recently Created'];

  return (
    <div className={\`w-full p-4 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {views.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setActive(v)}
            className={\`px-3 py-1.5 rounded-lg border transition-all \${
              active === v ? tabActive : 'border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { SavedViews, SavedViewsVariant } from './index.js';

export function SavedViewsPreview() {
  const [variant, setVariant] = useState<SavedViewsVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Saved Views Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as SavedViewsVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <SavedViews variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const savedViewsFixtures = {};`,
    readmeCode: `# Saved Views

Horizontal preset tabs allowing rapid toggling between saved filter queries.`,
  },

  // 28. Query Builder
  {
    slug: 'query-builder',
    name: 'Query Builder',
    description: 'Visual query constructor combining Boolean conditions (AND/OR) with nested groups.',
    categories: ['blocks', 'search', 'query'],
    roles: ['query', 'builder'],
    purposes: ['Complex SQL / JSON queries', 'Boolean filter construction'],
    componentName: 'QueryBuilder',
    tags: ['query-builder', 'query', 'sql', 'boolean'],
    idealFor: ['Advanced analytics consoles requiring deep query construction'],
    avoidFor: ['Basic search boxes'],
    jobs: ['Construct nested boolean logic trees with visual group blocks'],
    indexCode: `import React from 'react';

export type QueryBuilderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface QueryBuilderProps {
  variant?: QueryBuilderVariant;
}

export function QueryBuilder({ variant = 'quiet' }: QueryBuilderProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Visual Query Builder</h3>
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-[10px]">WHERE</span>
          <span>category == 'sections'</span>
        </div>
        <div className="flex items-center gap-2 pl-6">
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold text-[10px]">AND</span>
          <span>quality &gt;= 90</span>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { QueryBuilder, QueryBuilderVariant } from './index.js';

export function QueryBuilderPreview() {
  const [variant, setVariant] = useState<QueryBuilderVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Query Builder Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as QueryBuilderVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <QueryBuilder variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const queryBuilderFixtures = {};`,
    readmeCode: `# Query Builder

Visual Boolean condition tree constructor for complex data extraction.`,
  },

  // 29. Entity Profile Header
  {
    slug: 'entity-profile-header',
    name: 'Entity Profile Header',
    description: 'Hero card for entity details with avatar, title, status badge, action bar, and key stats.',
    categories: ['blocks', 'entities', 'header'],
    roles: ['entity', 'header'],
    purposes: ['User profile header', 'Project overview banner'],
    componentName: 'EntityProfileHeader',
    tags: ['entity-profile-header', 'profile', 'entity', 'header'],
    idealFor: ['Master detail entity pages and user profile dashboards'],
    avoidFor: ['Small sidebar widgets'],
    jobs: ['Anchor detail screens with avatar, name, and primary actions'],
    indexCode: `import React from 'react';

export type EntityProfileHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityProfileHeaderProps {
  variant?: EntityProfileHeaderVariant;
}

export function EntityProfileHeader({ variant = 'quiet' }: EntityProfileHeaderProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-neutral-200 dark:bg-neutral-800 font-bold text-xl flex items-center justify-center">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Tessellate Core</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                VERIFIED CREATOR
              </span>
            </div>
            <p className="text-xs opacity-60 font-mono">@tessellate • Open Core System</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className="px-4 py-2 rounded-lg border text-xs font-semibold">Share</button>
          <button type="button" className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EntityProfileHeader, EntityProfileHeaderVariant } from './index.js';

export function EntityProfileHeaderPreview() {
  const [variant, setVariant] = useState<EntityProfileHeaderVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Entity Profile Header Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as EntityProfileHeaderVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <EntityProfileHeader variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const entityProfileHeaderFixtures = {};`,
    readmeCode: `# Entity Profile Header

Profile banner presenting identity details, badges, and action buttons.`,
  },

  // 30. Entity Overview
  {
    slug: 'entity-overview',
    name: 'Entity Overview',
    description: 'Summary card with high-level description, primary KPIs, and operational tags.',
    categories: ['blocks', 'entities', 'overview'],
    roles: ['entity', 'overview'],
    purposes: ['Entity context card', 'Resource overview'],
    componentName: 'EntityOverview',
    tags: ['entity-overview', 'entity', 'overview', 'details'],
    idealFor: ['Detailed entity inspector panes and summary sidebars'],
    avoidFor: ['Small avatars without context'],
    jobs: ['Provide thorough descriptive summary and attributes of selected entity'],
    indexCode: `import React from 'react';

export type EntityOverviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityOverviewProps {
  variant?: EntityOverviewVariant;
}

export function EntityOverview({ variant = 'quiet' }: EntityOverviewProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-2">Resource Overview</h3>
      <p className="text-xs opacity-75 leading-relaxed mb-4">
        A canonical component validated against Zod schema version 1.0.0. Features complete accessibility verification and zero external CSS imports.
      </p>
      <div className="flex flex-wrap gap-2 text-[11px] font-mono">
        <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Framework: React 19</span>
        <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Styling: Tailwind 4</span>
        <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">Quality: 98/100</span>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EntityOverview, EntityOverviewVariant } from './index.js';

export function EntityOverviewPreview() {
  const [variant, setVariant] = useState<EntityOverviewVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Entity Overview Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as EntityOverviewVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <EntityOverview variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const entityOverviewFixtures = {};`,
    readmeCode: `# Entity Overview

Summary card detailing core attributes, framework specs, and quality score.`,
  },

  // 31. Metadata Panel
  {
    slug: 'metadata-panel',
    name: 'Metadata Panel',
    description: 'Structured key-value property inspector with copy triggers and type badges.',
    categories: ['blocks', 'entities', 'metadata'],
    roles: ['inspector', 'metadata'],
    purposes: ['Property inspection', 'Technical metadata display'],
    componentName: 'MetadataPanel',
    tags: ['metadata-panel', 'inspector', 'metadata', 'properties'],
    idealFor: ['Right-hand inspector sidebar in workbench tools'],
    avoidFor: ['Broad consumer landing pages'],
    jobs: ['Render high-density key-value pairs with copy-to-clipboard functionality'],
    indexCode: `import React from 'react';

export type MetadataPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MetadataPanelProps {
  variant?: MetadataPanelVariant;
}

export function MetadataPanel({ variant = 'quiet' }: MetadataPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const props = [
    { k: 'Schema Version', v: '1.0.0' },
    { k: 'Resource ID', v: 'res_blk_metadata_panel' },
    { k: 'License SPDX', v: 'MIT' },
    { k: 'Dependencies', v: '0 external' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border font-mono text-xs transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4 font-sans">Technical Metadata</h3>
      <div className="space-y-3">
        {props.map((p) => (
          <div key={p.k} className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
            <span className="opacity-60">{p.k}</span>
            <span className="font-semibold">{p.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { MetadataPanel, MetadataPanelVariant } from './index.js';

export function MetadataPanelPreview() {
  const [variant, setVariant] = useState<MetadataPanelVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Metadata Panel Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as MetadataPanelVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <MetadataPanel variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const metadataPanelFixtures = {};`,
    readmeCode: `# Metadata Panel

Key-value property inspector presenting technical manifest attributes.`,
  },

  // 32. Relationship Panel
  {
    slug: 'relationship-panel',
    name: 'Relationship Panel',
    description: 'Graph-like panel listing incoming and outgoing component dependencies and links.',
    categories: ['blocks', 'entities', 'graph'],
    roles: ['inspector', 'relationships'],
    purposes: ['Dependency tree inspection', 'Component linking'],
    componentName: 'RelationshipPanel',
    tags: ['relationship-panel', 'dependencies', 'graph', 'inspector'],
    idealFor: ['Visualizing parent-child connections and dependency trees'],
    avoidFor: ['Standalone components without dependencies'],
    jobs: ['Map inbound requirements and outbound dependencies of an entity'],
    indexCode: `import React from 'react';

export type RelationshipPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RelationshipPanelProps {
  variant?: RelationshipPanelVariant;
}

export function RelationshipPanel({ variant = 'quiet' }: RelationshipPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Entity Relationships</h3>
      <div className="space-y-4 text-xs font-mono">
        <div>
          <span className="text-[10px] font-bold opacity-50 uppercase block mb-1">Parent Container</span>
          <div className="p-2 rounded border border-neutral-200 dark:border-neutral-800">
            resources/shells/analytics-shell
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold opacity-50 uppercase block mb-1">Child Dependencies (0)</span>
          <div className="p-2 rounded border border-neutral-200 dark:border-neutral-800 opacity-60">
            None (Pure Self-Contained Leaf)
          </div>
        </div>
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { RelationshipPanel, RelationshipPanelVariant } from './index.js';

export function RelationshipPanelPreview() {
  const [variant, setVariant] = useState<RelationshipPanelVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Relationship Panel Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as RelationshipPanelVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <RelationshipPanel variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const relationshipPanelFixtures = {};`,
    readmeCode: `# Relationship Panel

Graph relation inspector outlining parent containers and nested dependency links.`,
  },

  // 33. Document Detail
  {
    slug: 'document-detail',
    name: 'Document Detail',
    description: 'Rich structured view of a selected document, complete with formatted text and download CTA.',
    categories: ['blocks', 'entities', 'document'],
    roles: ['document', 'detail'],
    purposes: ['Document reading', 'Specification viewing'],
    componentName: 'DocumentDetail',
    tags: ['document-detail', 'document', 'detail', 'reader'],
    idealFor: ['Viewing markdown documentation and project specs'],
    avoidFor: ['Real-time streaming feeds'],
    jobs: ['Present clean document title, author, and formatted body'],
    indexCode: `import React from 'react';

export type DocumentDetailVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DocumentDetailProps {
  variant?: DocumentDetailVariant;
}

export function DocumentDetail({ variant = 'quiet' }: DocumentDetailProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 sm:p-8 rounded-xl border transition-colors \${bg}\`}>
      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase mb-2 block">Architecture Spec</span>
      <h2 className="text-xl font-bold mb-4">Deterministic Composition Invariants</h2>
      <div className="space-y-3 text-xs sm:text-sm opacity-80 leading-relaxed mb-6">
        <p>
          All Tessellate interfaces compose through validated manifests rather than arbitrary runtime code mutations. This guarantees full exportability to any modern React environment.
        </p>
      </div>
      <button type="button" className="px-4 py-2 rounded-lg border text-xs font-semibold">
        Export Spec (PDF / Markdown)
      </button>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DocumentDetail, DocumentDetailVariant } from './index.js';

export function DocumentDetailPreview() {
  const [variant, setVariant] = useState<DocumentDetailVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Document Detail Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as DocumentDetailVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <DocumentDetail variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const documentDetailFixtures = {};`,
    readmeCode: `# Document Detail

Structured reader block displaying document title, formatted narrative, and export button.`,
  },

  // 34. File Browser
  {
    slug: 'file-browser',
    name: 'File Browser',
    description: 'Tree view file explorer with folder toggles, file extension icons, and selection states.',
    categories: ['blocks', 'entities', 'files'],
    roles: ['files', 'explorer'],
    purposes: ['Monorepo file exploration', 'Directory tree navigation'],
    componentName: 'FileBrowser',
    tags: ['file-browser', 'tree', 'files', 'explorer'],
    idealFor: ['Code repositories and directory navigation sidebars'],
    avoidFor: ['Flat non-hierarchical lists'],
    jobs: ['Render expandable folder directory trees with file rows'],
    indexCode: `import React, { useState } from 'react';

export type FileBrowserVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FileBrowserProps {
  variant?: FileBrowserVariant;
}

export function FileBrowser({ variant = 'quiet' }: FileBrowserProps) {
  const [open, setOpen] = useState(true);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={\`w-full p-6 rounded-xl border font-mono text-xs transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4 font-sans">Repository Files</h3>
      <div className="space-y-1">
        <div onClick={() => setOpen(!open)} className="cursor-pointer font-bold flex items-center gap-1.5 py-1">
          <span>{open ? '▾' : '▸'}</span>
          <span>resources/</span>
        </div>
        {open && (
          <div className="pl-4 space-y-1 opacity-80 border-l border-neutral-200 dark:border-neutral-800 ml-2">
            <div className="py-0.5 hover:underline cursor-pointer">primitives/ (44)</div>
            <div className="py-0.5 hover:underline cursor-pointer">shells/ (36)</div>
            <div className="py-0.5 hover:underline cursor-pointer">sections/ (72)</div>
            <div className="py-0.5 hover:underline cursor-pointer">blocks/ (56)</div>
          </div>
        )}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { FileBrowser, FileBrowserVariant } from './index.js';

export function FileBrowserPreview() {
  const [variant, setVariant] = useState<FileBrowserVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">File Browser Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as FileBrowserVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <FileBrowser variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const fileBrowserFixtures = {};`,
    readmeCode: `# File Browser

Folder tree navigator with expandable directory paths and file rows.`,
  },

  // 35. Audit Log
  {
    slug: 'audit-log',
    name: 'Audit Log',
    description: 'Security and governance audit log table recording user actions, IP addresses, and hashes.',
    categories: ['blocks', 'entities', 'audit'],
    roles: ['audit', 'security'],
    purposes: ['Compliance audits', 'Security change tracking'],
    componentName: 'AuditLog',
    tags: ['audit-log', 'audit', 'security', 'compliance'],
    idealFor: ['Security settings panels and enterprise administrative audit tracks'],
    avoidFor: ['Casual public feeds'],
    jobs: ['Record immutable audit trail of system modifications and logins'],
    indexCode: `import React from 'react';

export type AuditLogVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AuditLogProps {
  variant?: AuditLogVariant;
}

export function AuditLog({ variant = 'quiet' }: AuditLogProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const logs = [
    { action: 'API_KEY_ROTATED', actor: 'usr_admin99', ip: '192.0.2.1', time: '10m ago' },
    { action: 'PROJECT_CHECKPOINT_SAVED', actor: 'usr_sarah', ip: '198.51.100.4', time: '1h ago' },
    { action: 'DNA_TOKENS_MUTATED', actor: 'agent_cursor', ip: 'local', time: '3h ago' },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border font-mono text-xs transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4 font-sans">Security Audit Trail</h3>
      <div className="space-y-3">
        {logs.map((l) => (
          <div key={l.action + l.time} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{l.action}</span>
              <div className="text-[10px] opacity-60">Actor: {l.actor} • IP: {l.ip}</div>
            </div>
            <span className="opacity-50 text-[11px]">{l.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { AuditLog, AuditLogVariant } from './index.js';

export function AuditLogPreview() {
  const [variant, setVariant] = useState<AuditLogVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Audit Log Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as AuditLogVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <AuditLog variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const auditLogFixtures = {};`,
    readmeCode: `# Audit Log

Security and compliance audit trail tracking user IDs, actions, and timestamps.`,
  },

  // 36. Version History
  {
    slug: 'version-history',
    name: 'Version History',
    description: 'Changelog of document revisions with restore buttons, diff flags, and author details.',
    categories: ['blocks', 'entities', 'history'],
    roles: ['history', 'versions'],
    purposes: ['Document checkpoint rollback', 'Revision comparison'],
    componentName: 'VersionHistory',
    tags: ['version-history', 'history', 'revisions', 'checkpoints'],
    idealFor: ['Rollback panels and cloud project revision histories'],
    avoidFor: ['Ephemeral unversioned scratchpads'],
    jobs: ['List historical revisions with restore triggers'],
    indexCode: `import React from 'react';

export type VersionHistoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VersionHistoryProps {
  variant?: VersionHistoryVariant;
}

export function VersionHistory({ variant = 'quiet' }: VersionHistoryProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const revisions = [
    { rev: 'v1.0.4', msg: 'Added 72 verified marketing sections', time: '12m ago', active: true },
    { rev: 'v1.0.3', msg: 'Stabilized 36 navigation shells', time: '4h ago', active: false },
    { rev: 'v1.0.2', msg: 'Initialized 44 primitives', time: '1d ago', active: false },
  ];

  return (
    <div className={\`w-full p-6 rounded-xl border transition-colors \${bg}\`}>
      <h3 className="text-sm font-semibold mb-4">Revision History</h3>
      <div className="space-y-3 font-mono text-xs">
        {revisions.map((r) => (
          <div key={r.rev} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{r.rev}</span>
                {r.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">CURRENT</span>}
              </div>
              <span className="text-[11px] opacity-75 font-sans">{r.msg}</span>
            </div>
            {!r.active && (
              <button type="button" className="px-2.5 py-1 rounded border text-[10px]">
                Restore
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { VersionHistory, VersionHistoryVariant } from './index.js';

export function VersionHistoryPreview() {
  const [variant, setVariant] = useState<VersionHistoryVariant>('quiet');

  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-600">Version History Preview</span>
        <div className="flex items-center gap-1.5">
          {(['quiet', 'expressive', 'nocturne'] as VersionHistoryVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={\`px-2.5 py-1 rounded capitalize font-medium transition-colors \${
                variant === v ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-200'
              }\`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <VersionHistory variant={variant} />
      </div>
    </div>
  );
}`,
    fixturesCode: `export const versionHistoryFixtures = {};`,
    readmeCode: `# Version History

Revision list showcasing past project checkpoints with restore triggers.`,
  },
];
