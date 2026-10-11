import type { StateDef } from './states-builder';

export const STATES_BATCH_1: StateDef[] = [
  // 1. Page Skeleton
  {
    slug: 'page-skeleton',
    name: 'Page Skeleton',
    description: 'Full-page progressive layout shimmer placeholder with responsive header, hero deck, and content column blocks.',
    categories: ['states', 'loading', 'skeleton'],
    roles: ['state', 'page-skeleton'],
    purposes: ['page-loading', 'perceived-performance', 'layout-stability'],
    componentName: 'PageSkeleton',
    tags: ['skeleton', 'loading', 'placeholder', 'shimmer', 'layout'],
    idealFor: ['Initial route transitions', 'SSR page hydration', 'Heavy data fetching page loads'],
    avoidFor: ['Micro inline actions', 'Completed interactive views'],
    jobs: ['Prevent Cumulative Layout Shift (CLS) and maintain visual layout rhythm while remote page data loads'],
    indexCode: `import React from 'react';

export type PageSkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
  children?: React.ReactNode;
}

export function PageSkeleton({ variant = 'quiet', children }: PageSkeletonProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const blockBg =
    variant === 'nocturne'
      ? 'bg-neutral-800/60'
      : variant === 'expressive'
      ? 'bg-indigo-100/60'
      : 'bg-neutral-200/80';

  return (
    <div
      role="status"
      aria-label="Loading page content"
      className={\`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto space-y-6 animate-pulse transition-colors \${containerBg}\`}
    >
      {/* Header bar shimmer */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200/20">
        <div className={\`h-6 w-36 rounded \${blockBg}\`} />
        <div className="flex gap-2">
          <div className={\`h-8 w-20 rounded \${blockBg}\`} />
          <div className={\`h-8 w-24 rounded \${blockBg}\`} />
        </div>
      </div>

      {/* Hero deck shimmer */}
      <div className="space-y-3 max-w-xl">
        <div className={\`h-4 w-28 rounded \${blockBg}\`} />
        <div className={\`h-8 w-full rounded \${blockBg}\`} />
        <div className={\`h-4 w-4/5 rounded \${blockBg}\`} />
      </div>

      {/* Grid content columns shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className={\`h-40 rounded-lg \${blockBg}\`} />
        <div className={\`h-40 rounded-lg \${blockBg}\`} />
        <div className={\`h-40 rounded-lg \${blockBg}\`} />
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { PageSkeleton, PageSkeletonVariant } from './index';

export function PageSkeletonPreview() {
  const [variant, setVariant] = useState<PageSkeletonVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <PageSkeleton variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const pageSkeletonFixtures = {};`,
    readmeCode: `# Page Skeleton

Full-page progressive layout shimmer placeholder preserving layout stability.`,
  },

  // 2. Dashboard Skeleton
  {
    slug: 'dashboard-skeleton',
    name: 'Dashboard Skeleton',
    description: 'Multi-metric analytics workspace skeleton placeholder with metric card shingles, chart viewport placeholder, and data table rows.',
    categories: ['states', 'loading', 'skeleton'],
    roles: ['state', 'dashboard-skeleton'],
    purposes: ['analytics-loading', 'perceived-performance', 'dashboard-placeholder'],
    componentName: 'DashboardSkeleton',
    tags: ['skeleton', 'dashboard', 'analytics', 'metrics', 'charts'],
    idealFor: ['Business intelligence dashboards', 'Cloud telemetry overviews', 'Trading portal loaders'],
    avoidFor: ['Text article views', 'Compact modal dialogs'],
    jobs: ['Retain dashboard metric card rhythm and chart geometry while telemetry streams connect'],
    indexCode: `import React from 'react';

export type DashboardSkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DashboardSkeletonProps {
  variant?: DashboardSkeletonVariant;
  children?: React.ReactNode;
}

export function DashboardSkeleton({ variant = 'quiet', children }: DashboardSkeletonProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const blockBg =
    variant === 'nocturne'
      ? 'bg-neutral-800/60'
      : variant === 'expressive'
      ? 'bg-indigo-100/60'
      : 'bg-neutral-200/80';

  return (
    <div
      role="status"
      aria-label="Loading dashboard metrics"
      className={\`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto space-y-6 animate-pulse transition-colors \${containerBg}\`}
    >
      {/* 4 Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-neutral-200/20 space-y-2">
            <div className={\`h-3 w-16 rounded \${blockBg}\`} />
            <div className={\`h-7 w-24 rounded \${blockBg}\`} />
            <div className={\`h-3 w-12 rounded \${blockBg}\`} />
          </div>
        ))}
      </div>

      {/* Main chart placeholder */}
      <div className="p-6 rounded-lg border border-neutral-200/20 space-y-4">
        <div className="flex justify-between items-center">
          <div className={\`h-5 w-40 rounded \${blockBg}\`} />
          <div className={\`h-6 w-28 rounded \${blockBg}\`} />
        </div>
        <div className={\`h-48 w-full rounded \${blockBg}\`} />
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { DashboardSkeleton, DashboardSkeletonVariant } from './index';

export function DashboardSkeletonPreview() {
  const [variant, setVariant] = useState<DashboardSkeletonVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <DashboardSkeleton variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const dashboardSkeletonFixtures = {};`,
    readmeCode: `# Dashboard Skeleton

Multi-metric analytics workspace skeleton with metric cards and chart frame.`,
  },

  // 3. Table Skeleton
  {
    slug: 'table-skeleton',
    name: 'Table Skeleton',
    description: 'Data grid shimmer placeholder with columnar headers, alternating rows, and pagination bar placeholders.',
    categories: ['states', 'loading', 'skeleton'],
    roles: ['state', 'table-skeleton'],
    purposes: ['table-loading', 'tabular-placeholder', 'perceived-performance'],
    componentName: 'TableSkeleton',
    tags: ['skeleton', 'table', 'grid', 'rows', 'tabular'],
    idealFor: ['Paginated database browsers', 'User management lists', 'Audit logs'],
    avoidFor: ['Minimalist mobile cards', 'Hero landing sections'],
    jobs: ['Maintain strict tabular alignment and column boundaries while row data queries execute'],
    indexCode: `import React from 'react';

export type TableSkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TableSkeletonProps {
  rows?: number;
  variant?: TableSkeletonVariant;
  children?: React.ReactNode;
}

export function TableSkeleton({ rows = 5, variant = 'quiet', children }: TableSkeletonProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const blockBg =
    variant === 'nocturne'
      ? 'bg-neutral-800/60'
      : variant === 'expressive'
      ? 'bg-indigo-100/60'
      : 'bg-neutral-200/80';

  return (
    <div
      role="status"
      aria-label="Loading table rows"
      className={\`p-6 rounded-xl border max-w-4xl mx-auto space-y-4 animate-pulse transition-colors \${containerBg}\`}
    >
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 pb-3 border-b border-neutral-200/20">
        <div className={\`h-4 w-24 rounded \${blockBg}\`} />
        <div className={\`h-4 w-20 rounded \${blockBg}\`} />
        <div className={\`h-4 w-16 rounded \${blockBg}\`} />
        <div className={\`h-4 w-12 rounded justify-self-end \${blockBg}\`} />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-4 py-2 border-b border-neutral-200/10 items-center">
          <div className="flex items-center gap-2">
            <div className={\`h-6 w-6 rounded-full \${blockBg}\`} />
            <div className={\`h-4 w-28 rounded \${blockBg}\`} />
          </div>
          <div className={\`h-4 w-20 rounded \${blockBg}\`} />
          <div className={\`h-4 w-16 rounded \${blockBg}\`} />
          <div className={\`h-6 w-14 rounded justify-self-end \${blockBg}\`} />
        </div>
      ))}

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { TableSkeleton, TableSkeletonVariant } from './index';

export function TableSkeletonPreview() {
  const [variant, setVariant] = useState<TableSkeletonVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <TableSkeleton variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const tableSkeletonFixtures = {};`,
    readmeCode: `# Table Skeleton

Data grid shimmer placeholder preserving tabular alignments.`,
  },

  // 4. Card Grid Skeleton
  {
    slug: 'card-grid-skeleton',
    name: 'Card Grid Skeleton',
    description: 'Multi-column responsive card grid loading placeholder with image aspect boxes, text lines, and action button shingles.',
    categories: ['states', 'loading', 'skeleton'],
    roles: ['state', 'card-grid-skeleton'],
    purposes: ['card-loading', 'catalog-placeholder', 'perceived-performance'],
    componentName: 'CardGridSkeleton',
    tags: ['skeleton', 'cards', 'grid', 'catalog', 'placeholder'],
    idealFor: ['Resource marketplace directories', 'E-commerce product grids', 'Blog article feeds'],
    avoidFor: ['Monolithic single-item views', 'Command palettes'],
    jobs: ['Stabilize responsive card grid layouts while catalog items or thumbnails load'],
    indexCode: `import React from 'react';

export type CardGridSkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CardGridSkeletonProps {
  count?: number;
  variant?: CardGridSkeletonVariant;
  children?: React.ReactNode;
}

export function CardGridSkeleton({ count = 3, variant = 'quiet', children }: CardGridSkeletonProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const blockBg =
    variant === 'nocturne'
      ? 'bg-neutral-800/60'
      : variant === 'expressive'
      ? 'bg-indigo-100/60'
      : 'bg-neutral-200/80';

  return (
    <div
      role="status"
      aria-label="Loading card grid"
      className={\`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto space-y-4 animate-pulse transition-colors \${containerBg}\`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-neutral-200/20 space-y-3">
            <div className={\`h-32 w-full rounded-lg \${blockBg}\`} />
            <div className={\`h-4 w-3/4 rounded \${blockBg}\`} />
            <div className={\`h-3 w-full rounded \${blockBg}\`} />
            <div className={\`h-3 w-2/3 rounded \${blockBg}\`} />
            <div className="pt-2 flex justify-between items-center">
              <div className={\`h-3 w-16 rounded \${blockBg}\`} />
              <div className={\`h-6 w-14 rounded-md \${blockBg}\`} />
            </div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { CardGridSkeleton, CardGridSkeletonVariant } from './index';

export function CardGridSkeletonPreview() {
  const [variant, setVariant] = useState<CardGridSkeletonVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <CardGridSkeleton variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const cardGridSkeletonFixtures = {};`,
    readmeCode: `# Card Grid Skeleton

Responsive card grid shimmer placeholder with aspect frames and button shingles.`,
  },

  // 5. Inline Spinner
  {
    slug: 'inline-spinner',
    name: 'Inline Spinner',
    description: 'Accessible micro-spinner with SVG harmonic arc rotation, configurable size, and screen-reader announcements.',
    categories: ['states', 'loading', 'spinner'],
    roles: ['state', 'spinner'],
    purposes: ['micro-loading', 'button-progress', 'inline-status'],
    componentName: 'InlineSpinner',
    tags: ['spinner', 'loading', 'micro', 'inline', 'svg'],
    idealFor: ['Button loading state', 'Form submission feedback', 'Inline search debounce indicators'],
    avoidFor: ['Entire screen blocking overlays', 'Completed success toasts'],
    jobs: ['Provide immediate kinetic assurance that an asynchronous operation is in flight'],
    indexCode: `import React from 'react';

export type InlineSpinnerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InlineSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: InlineSpinnerVariant;
  children?: React.ReactNode;
}

export function InlineSpinner({
  label = 'Processing request...',
  size = 'md',
  variant = 'quiet',
  children,
}: InlineSpinnerProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const spinnerColor =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-800 dark:text-neutral-200';

  const sizeClasses =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';

  return (
    <div className={\`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto flex items-center gap-3 transition-colors \${containerBg}\`}>
      <svg
        className={\`animate-spin shrink-0 \${sizeClasses} \${spinnerColor}\`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label={label}
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </span>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { InlineSpinner, InlineSpinnerVariant } from './index';

export function InlineSpinnerPreview() {
  const [variant, setVariant] = useState<InlineSpinnerVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <InlineSpinner variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const inlineSpinnerFixtures = {};`,
    readmeCode: `# Inline Spinner

Harmonic arc rotation spinner for micro action loading states.`,
  },

  // 6. Progressive Loader
  {
    slug: 'progressive-loader',
    name: 'Progressive Loader',
    description: 'Multi-stage task progression bar with labeled phase checkpoints, percentage telemetry, and estimated time remaining.',
    categories: ['states', 'loading', 'progress'],
    roles: ['state', 'progressive-loader'],
    purposes: ['multi-stage-task', 'export-progress', 'upload-progress'],
    componentName: 'ProgressiveLoader',
    tags: ['progress', 'loader', 'stages', 'percentage', 'telemetry'],
    idealFor: ['Code export generation', 'System compilation pipelines', 'Large asset imports'],
    avoidFor: ['Instant local toggles', 'Static help documentation'],
    jobs: ['Reassure users during prolonged multi-step jobs with clear milestones and deterministic progress'],
    indexCode: `import React from 'react';

export type ProgressiveLoaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProgressiveLoaderProps {
  progress?: number;
  currentStep?: string;
  totalSteps?: number;
  stepNumber?: number;
  variant?: ProgressiveLoaderVariant;
  children?: React.ReactNode;
}

export function ProgressiveLoader({
  progress = 68,
  currentStep = 'Synthesizing React component tree and semantic tokens...',
  totalSteps = 4,
  stepNumber = 3,
  variant = 'quiet',
  children,
}: ProgressiveLoaderProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const barColor =
    variant === 'nocturne'
      ? 'bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
      : 'bg-neutral-900 dark:bg-white';

  return (
    <div className={\`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors \${containerBg}\`}>
      <div className="flex justify-between items-center text-xs">
        <span className="font-mono text-neutral-400 uppercase tracking-wider">
          Stage {stepNumber} of {totalSteps}
        </span>
        <span className="font-mono font-bold text-neutral-700 dark:text-neutral-200">
          {progress}%
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
        <div
          className={\`h-full transition-all duration-300 rounded-full \${barColor}\`}
          style={{ width: \`\${progress}%\` }}
        />
      </div>

      <p className="text-xs text-neutral-500 font-mono flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {currentStep}
      </p>
      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { ProgressiveLoader, ProgressiveLoaderVariant } from './index';

export function ProgressiveLoaderPreview() {
  const [variant, setVariant] = useState<ProgressiveLoaderVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <ProgressiveLoader variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const progressiveLoaderFixtures = {};`,
    readmeCode: `# Progressive Loader

Multi-stage progress tracker with phase milestones and percentage telemetry.`,
  },

  // 7. Empty Search State
  {
    slug: 'empty-search-state',
    name: 'Empty Search State',
    description: 'Zero query results feedback panel with search phrase echo, corrective filter suggestions, and clear action button.',
    categories: ['states', 'empty', 'search'],
    roles: ['state', 'empty-search'],
    purposes: ['search-feedback', 'query-fallback', 'empty-results'],
    componentName: 'EmptySearchState',
    tags: ['empty', 'search', 'results', 'filters', 'feedback'],
    idealFor: ['Catalog resource searches', 'Documentation search modals', 'Command palette lookups'],
    avoidFor: ['Network connection dropouts', 'Initial unqueried views'],
    jobs: ['Help users recover gracefully when exact search terms yield no immediate matches'],
    indexCode: `import React from 'react';

export type EmptySearchStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EmptySearchStateProps {
  query?: string;
  onClear?: () => void;
  variant?: EmptySearchStateVariant;
  children?: React.ReactNode;
}

export function EmptySearchState({
  query = 'hyper-kinetic-3d-portal',
  onClear,
  variant = 'quiet',
  children,
}: EmptySearchStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const iconColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-500 bg-neutral-100 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors \${containerBg}\`}>
      <div className={\`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl \${iconColor}\`}>
        🔍
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight">
          No matches found for &ldquo;{query}&rdquo;
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Check for typographical errors, broaden your keywords, or clear active category filters.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onClear}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          Clear Search Query
        </button>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EmptySearchState, EmptySearchStateVariant } from './index';

export function EmptySearchStatePreview() {
  const [variant, setVariant] = useState<EmptySearchStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <EmptySearchState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const emptySearchStateFixtures = {};`,
    readmeCode: `# Empty Search State

Graceful search query fallback with query echo and corrective actions.`,
  },

  // 8. Empty Dashboard State
  {
    slug: 'empty-dashboard-state',
    name: 'Empty Dashboard State',
    description: 'First-time dashboard panel placeholder encouraging initial telemetry integration with quick-start steps.',
    categories: ['states', 'empty', 'dashboard'],
    roles: ['state', 'empty-dashboard'],
    purposes: ['onboarding-welcome', 'empty-workspace', 'initial-setup'],
    componentName: 'EmptyDashboardState',
    tags: ['empty', 'dashboard', 'onboarding', 'workspace', 'setup'],
    idealFor: ['Fresh project workspaces', 'New organization accounts', 'Unconnected telemetry screens'],
    avoidFor: ['Network outages', 'Active high-density analytics'],
    jobs: ['Guide first-time users towards their primary high-value configuration action without feeling barren'],
    indexCode: `import React from 'react';

export type EmptyDashboardStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EmptyDashboardStateProps {
  onConnect?: () => void;
  variant?: EmptyDashboardStateVariant;
  children?: React.ReactNode;
}

export function EmptyDashboardState({ onConnect, variant = 'quiet', children }: EmptyDashboardStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const accentColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={\`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors \${containerBg}\`}>
      <div className={\`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl \${accentColor}\`}>
        📊
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight">
          No telemetry events recorded yet
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          Connect your application telemetry stream or run \`tess compose\` to populate live metrics and component audits.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={onConnect}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          Connect Telemetry Source
        </button>
      </div>

      {children}
    </div>
  );
}`,
    previewCode: `import React, { useState } from 'react';
import { EmptyDashboardState, EmptyDashboardStateVariant } from './index';

export function EmptyDashboardStatePreview() {
  const [variant, setVariant] = useState<EmptyDashboardStateVariant>('quiet');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {(['quiet', 'expressive', 'nocturne'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            className={\`px-3 py-1.5 text-xs font-medium rounded-md capitalize \${
              variant === v ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100'
            }\`}
          >
            {v}
          </button>
        ))}
      </div>
      <EmptyDashboardState variant={variant} />
    </div>
  );
}`,
    fixturesCode: `export const emptyDashboardStateFixtures = {};`,
    readmeCode: `# Empty Dashboard State

First-run telemetry and dashboard placeholder with onboarding quick-action.`,
  },
];
