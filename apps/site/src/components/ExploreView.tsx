import React, { useState, useEffect, useRef } from 'react';
import {ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';
import {
  createResourceSearchDb,
  indexResources,
  executeSearch,
  type ResourceOramaDb,
  type SearchFilters,
} from '@tessellate/search';
import { ExploreRail } from './ExploreRail';
import { ResourceCard } from './ResourceCard';
import { CommandPalette } from './CommandPalette';
import { Search, SlidersHorizontal, Clock, X, Sparkles } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'professional but playful login',
  'Bloomberg-style analytics',
  'cinematic product hero',
  'subtle background for fintech',
  'luxury checkout',
  'AI research sidebar',
  'mobile onboarding no illustrations',
];

function rankedResources(resources:ResourceManifest[],hits:Array<{id:string}>):ResourceManifest[]{
 const byId=new Map(resources.map(resource=>[resource.id,resource]));
 return hits.flatMap(hit=>{const resource=byId.get(hit.id);return resource?[resource]:[];});
}

const LOCAL_STORAGE_RECENT_KEY = 'tessellate_recent_searches_v1';

export function ExploreView({catalogCategory}: {catalogCategory?:string} = {}) {
  const [loadAttempt,setLoadAttempt]=useState(0);
  const [catalogError,setCatalogError]=useState('');
  const queryRef=useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [manifests, setManifests] = useState<ResourceManifest[]>([]);
  const [searchResults, setSearchResults] = useState<ResourceManifest[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const oramaDbRef = useRef<ResourceOramaDb | null>(null);

  // 1. Load catalog & initialize Orama search DB
  useEffect(() => {
    async function initCatalog() {
      setIsLoading(true);setCatalogError('');
      try {
        const res = await fetch('/data/catalog.json');
        if (!res.ok) throw new Error(`Catalogue HTTP ${res.status}`);
        if (res.ok) {
          const data = await res.json();
          const items=ResourceManifestSchema.array().parse(data.resources).filter(resource=>!catalogCategory || (catalogCategory==='effects' ? resource.categories.some(category=>['backgrounds','motion','typography'].includes(category)) : resource.categories.includes(catalogCategory)));
          setManifests(items);

          // Initialize client-side Orama index
          const db = await createResourceSearchDb();
          await indexResources(db, items);
          oramaDbRef.current = db;

          // Check initial URL parameters
          const params = new URLSearchParams(window.location.search);
          const q = params.get('q') ?? '';
          setQuery(q);
          const urlFilters:SearchFilters={};
          if(params.get('type'))urlFilters.resourceTypes=params.get('type')!.split(',');
          if(params.get('purpose'))urlFilters.purposes=params.get('purpose')!.split(',');
          if(params.get('feel'))urlFilters.feel=params.get('feel')!.split(',');
          setFilters(urlFilters);
          if(params.get('focus')==='search')queryRef.current?.focus();

          // Initial search execution
          const searchRes = await executeSearch(db, q, urlFilters);
          const matched = rankedResources(items,searchRes.items);
          setSearchResults(matched);
        }
      } catch (err) {
        setCatalogError(`Could not load the catalogue: ${String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }

    // Load recent searches from localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignored
    }

    initCatalog();
  }, [catalogCategory,loadAttempt]);

  // 2. Perform search whenever query or filters change
  useEffect(() => {
    async function runQuery() {
      if (!oramaDbRef.current || manifests.length === 0) return;

      const searchRes = await executeSearch(oramaDbRef.current, query, filters);
      const matched = rankedResources(manifests,searchRes.items);
      setSearchResults(matched);

      // Synchronize URL query params
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (filters.resourceTypes?.length) params.set('type', filters.resourceTypes.join(','));
      if (filters.purposes?.length) params.set('purpose', filters.purposes.join(','));
      if (filters.feel?.length) params.set('feel', filters.feel.join(','));

      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);
    }

    runQuery();
  }, [query, filters, manifests]);

  // Handle submitting query
  const handleSearchSubmit = (text: string) => {
    setQuery(text);
    setIsInputFocused(false);
    if (!text.trim()) return;

    // Save to recents
    const updated = [text, ...recentSearches.filter((s) => s !== text)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_RECENT_KEY);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {catalogError && <div role="alert" className="border border-[#C83D48] p-4"><p>{catalogError}</p><button className="underline p-2" onClick={()=>setLoadAttempt(attempt=>attempt+1)}>Retry catalogue</button></div>}
      {/* 56px Top Search & Filter Bar */}
      <div className="relative z-20 flex items-center gap-3 h-14 px-4 rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)] shadow-xs">
        <Search className="w-4 h-4 text-[var(--tess-ink-muted,#62666F)] shrink-0" />

        <input
          ref={queryRef} aria-label="Search catalogue" type="text"
          value={query}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit(query);
            }
          }}
          placeholder="Search by component, outcome, style or vibe…"
          className="flex-1 min-w-0 bg-transparent text-sm text-[var(--tess-ink,#111217)] placeholder-[var(--tess-ink-muted,#62666F)] focus:outline-none"
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search" onClick={handleClearQuery}
            className="p-1 rounded text-[var(--tess-ink-muted,#62666F)] hover:text-[var(--tess-ink,#111217)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setMobileRailOpen(!mobileRailOpen)}
          className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white text-xs font-medium text-[var(--tess-ink,#111217)] shadow-2xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        {/* Global Cmd+K Palette Hint */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[var(--tess-canvas,#F4F2ED)] border border-[var(--tess-hairline,#D9D6CF)] text-[11px] font-mono text-[var(--tess-ink-secondary,#62666F)] hover:bg-white transition-colors"
        >
          <span>⌘K</span>
        </button>

        {/* Recent Searches Dropdown */}
        {isInputFocused && recentSearches.length > 0 && !query && (
          <div className="absolute top-16 left-0 right-0 rounded-xl border border-[var(--tess-hairline-strong,#C7C3BA)] bg-white p-3 shadow-lg flex flex-col gap-1 z-30">
            <div className="flex items-center justify-between pb-1 text-[11px] font-semibold text-[var(--tess-ink-muted,#62666F)]">
              <span>Recent Searches</span>
              <button
                type="button"
                onClick={handleClearRecent}
                className="hover:text-[var(--tess-ink,#111217)]"
              >
                Clear all
              </button>
            </div>
            {recentSearches.map((term, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={() => handleSearchSubmit(term)}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--tess-canvas,#F4F2ED)] text-left text-xs text-[var(--tess-ink,#111217)]"
              >
                <Clock className="w-3.5 h-3.5 text-[var(--tess-ink-muted,#62666F)]" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Natural Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--tess-ink-muted,#62666F)] shrink-0">
          <Sparkles className="w-3 h-3 text-[var(--tess-cobalt,#2547E8)]" />
          <span>Try:</span>
        </span>
        {SUGGESTED_QUERIES.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSearchSubmit(suggestion)}
            className="shrink-0 px-2.5 py-1 rounded-full border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)] text-[var(--tess-ink-secondary,#62666F)] hover:bg-white hover:text-[var(--tess-ink,#111217)] hover:border-[var(--tess-hairline-strong,#C7C3BA)] transition-colors text-[11px]"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Main Layout: 248px Left Rail + Responsive Grid */}
      <div className="flex items-start gap-8">
        {/* Desktop 248px Filter Rail */}
        <div className="hidden lg:block">
          <ExploreRail
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({})}
          />
        </div>

        {/* Central Card Grid Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Results Summary Header */}
          <div className="flex items-center justify-between text-xs text-[var(--tess-ink-secondary,#62666F)] pb-2 border-b border-[var(--tess-hairline,#D9D6CF)]/60">
            <span>
              {isLoading
                ? 'Loading catalogue...'
                : `Showing ${searchResults.length} resource${searchResults.length === 1 ? '' : 's'}${
                    query ? ` for "${query}"` : ''
                  }`}
            </span>

            {Object.keys(filters).length > 0 && (
              <button
                type="button"
                onClick={() => setFilters({})}
                className="text-[var(--tess-cobalt,#2547E8)] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {searchResults.length === 0 && !isLoading ? (
            <div className="py-16 text-center rounded-xl border border-dashed border-[var(--tess-hairline,#D9D6CF)] bg-white p-8 space-y-3">
              <h3 className="text-base font-semibold text-[var(--tess-ink,#111217)]">
                No matching resources found
              </h3>
              <p className="text-xs text-[var(--tess-ink-muted,#62666F)] max-w-sm mx-auto">
                Try loosening your filters or searching for broader terms like &quot;button&quot;, &quot;input&quot;, or &quot;action&quot;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFilters({});
                }}
                className="mt-2 h-8 px-3 rounded-lg bg-[var(--tess-cobalt,#2547E8)] text-white text-xs font-medium shadow-xs"
              >
                Reset search & filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map((manifest) => (
                <ResourceCard key={manifest.id} manifest={manifest} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Rail */}
      {mobileRailOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setMobileRailOpen(false)}
          />
          <div className="relative ml-auto w-80 max-w-full bg-[var(--tess-surface,#FAF9F6)] p-6 shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--tess-hairline,#D9D6CF)] mb-4">
              <span className="font-semibold text-sm">Filters</span>
              <button
                type="button"
                aria-label="Close filters" onClick={() => setMobileRailOpen(false)}
                className="p-1 rounded text-[var(--tess-ink-muted,#62666F)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ExploreRail
              filters={filters}
              onFilterChange={setFilters}
              onReset={() => setFilters({})}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
