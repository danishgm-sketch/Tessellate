import React, { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import type { SearchFilters } from '@tessellate/search';

export interface ExploreRailProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onReset: () => void;
  availableOptions?: Partial<Record<Exclude<keyof SearchFilters, 'minQuality'>, string[]>>;
  className?: string;
  showHeading?: boolean;
}

interface FilterSectionConfig {
  id: Exclude<keyof SearchFilters, 'minQuality'>;
  title: string;
  options: string[];
}

const FILTER_SECTIONS: FilterSectionConfig[] = [
  {
    id: 'resourceTypes',
    title: 'Resource',
    options: [
      'primitive',
      'component',
      'section',
      'block',
      'page',
      'flow',
      'effect',
      'background',
      'typography',
      'motion',
      'data-visualization',
      'ai-pattern',
      'state',
    ],
  },
  {
    id: 'purposes',
    title: 'Purpose',
    options: [
      'Marketing',
      'Application',
      'Commerce',
      'Analytics',
      'Authentication',
      'Search',
      'Navigation',
      'Data entry',
      'Messaging',
      'Collaboration',
      'AI',
      'Reporting',
    ],
  },
  {
    id: 'feel',
    title: 'Feel',
    options: [
      'Professional',
      'Playful',
      'Premium',
      'Technical',
      'Editorial',
      'Cinematic',
      'Minimal',
      'Warm',
      'Futuristic',
      'Institutional',
      'Experimental',
      'Luxury',
    ],
  },
  {
    id: 'intensity',
    title: 'Intensity',
    options: ['Quiet', 'Balanced', 'Expressive', 'Dramatic'],
  },
  {
    id: 'motion',
    title: 'Motion',
    options: ['None', 'Light', 'Moderate', 'Heavy'],
  },
  {
    id: 'density',
    title: 'Density',
    options: ['Sparse', 'Balanced', 'Dense'],
  },
  {
    id: 'performance',
    title: 'Performance',
    options: ['Lightweight', 'Moderate', 'Heavy'],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    options: ['AA target or higher', 'AAA target', 'Keyboard verified', 'Reduced-motion verified'],
  },
  {
    id: 'dependencies',
    title: 'Dependencies',
    options: ['Zero extra dependency', 'Motion', 'Radix', 'Three.js', 'D3'],
  },
];

export function ExploreRail({
  filters,
  onFilterChange,
  onReset,
  availableOptions,
  className = '',
  showHeading = true,
}: ExploreRailProps) {
  // Collapsed state for sections (first 3 expanded by default)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    resourceTypes: true,
    purposes: true,
    feel: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleOption = (sectionKey: keyof SearchFilters, option: string) => {
    const currentValues = (filters[sectionKey] as string[] | undefined) ?? [];
    const exists = currentValues.includes(option);
    const updated = exists
      ? currentValues.filter((v) => v !== option)
      : [...currentValues, option];

    onFilterChange({
      ...filters,
      [sectionKey]: updated.length > 0 ? updated : undefined,
    });
  };

  // Count active filter tags
  const activeCount = Object.values(filters).reduce((acc, val) => {
    if (Array.isArray(val)) return acc + val.length;
    if (typeof val === 'number') return acc + 1;
    return acc;
  }, 0);

  return (
    <aside className={`w-[248px] shrink-0 flex flex-col gap-4 text-xs select-none ${className}`}>
      {/* Rail Header with Reset */}
      {(showHeading || activeCount > 0) && (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--tess-hairline,#D9D6CF)]">
          {showHeading ? (
            <div className="flex items-center gap-1.5 font-semibold text-[var(--tess-ink,#111217)] text-sm">
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="h-5 px-1.5 rounded-full bg-[var(--tess-cobalt,#2547E8)] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                  {activeCount}
                </span>
              )}
            </div>
          ) : <span className="sr-only">Active filters</span>}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-[11px] text-[var(--tess-ink-secondary,#62666F)] hover:text-[var(--tess-cobalt,#2547E8)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      {/* Filter Groups */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {FILTER_SECTIONS.map((section) => {
          const isExpanded = !!expandedSections[section.id];
          const activeValues = (filters[section.id] as string[] | undefined) ?? [];
          const sectionActiveCount = activeValues.length;
          const available = availableOptions?.[section.id];
          const options = availableOptions
            ? [
              ...section.options.filter((option) => available?.some((value) => value.toLocaleLowerCase() === option.toLocaleLowerCase())
                || activeValues.some((value) => value.toLocaleLowerCase() === option.toLocaleLowerCase())),
              ...activeValues.filter((value) => !section.options.some((option) => option.toLocaleLowerCase() === value.toLocaleLowerCase())),
            ]
            : section.options;

          if (options.length === 0 && sectionActiveCount === 0) return null;

          return (
            <div
              key={section.id}
              className="border-b border-[var(--tess-hairline,#D9D6CF)]/60 pb-3"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between py-1 text-xs font-semibold text-[var(--tess-ink,#111217)] hover:text-[var(--tess-cobalt,#2547E8)] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-1.5">
                  <span>{section.title}</span>
                  {sectionActiveCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 rounded bg-[var(--tess-canvas-strong,#ECE9E2)] text-[var(--tess-ink-secondary,#62666F)] font-bold">
                      {sectionActiveCount}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--tess-ink-muted,#62666F)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--tess-ink-muted,#62666F)]" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-2 flex flex-col gap-1.5 pl-0.5">
                  {options.map((option) => {
                    const isChecked = activeValues.includes(option);

                    return (
                      <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer text-[var(--tess-ink-secondary,#62666F)] hover:text-[var(--tess-ink,#111217)] text-[12px] py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleOption(section.id, option)}
                          className="h-3.5 w-3.5 rounded border-[var(--tess-hairline-strong,#C7C3BA)] text-[var(--tess-cobalt,#2547E8)] focus:ring-[var(--tess-cobalt,#2547E8)] focus:ring-1 cursor-pointer accent-[var(--tess-cobalt,#2547E8)]"
                        />
                        <span className="capitalize">{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
