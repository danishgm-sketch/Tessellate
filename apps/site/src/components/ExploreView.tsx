import React, { useState, useEffect, useRef, useMemo } from 'react';
import {ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';
import {
  createResourceSearchDb,
  indexResources,
  executeSearch,
  manifestToSearchDocument,
  type ResourceOramaDb,
  type SearchFilters,
  type SearchDocument,
} from '@tessellate/search';
import { ExploreRail, type ExploreRailProps } from './ExploreRail';
import { ResourceCard } from './ResourceCard';
import { CommandPalette } from './CommandPalette';
import { Search, SlidersHorizontal, Clock, X, Sparkles } from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Bloomberg-style analytics',
  'cinematic product hero',
  'AI research sidebar',
  'mobile navigation',
  'onboarding',
  'billing overview',
  'data table',
  'empty state',
];

const PAGE_SIZE = 50;
function ResourceCardSkeleton({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-xl border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)]"
      data-testid="resource-card-skeleton"
      data-skeleton-index={index}
    >
      <div className="aspect-[16/10] w-full border-b border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-canvas,#F4F2ED)] p-6">
        <div className="h-full w-full border border-[var(--tess-hairline,#D9D6CF)] bg-[var(--tess-surface,#FAF9F6)]" />
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <div className="flex h-5 items-center justify-between gap-3">
          <span className="h-3 w-2/5 rounded-sm bg-[var(--tess-canvas-strong,#ECE9E2)]" />
          <span className="h-4 w-14 rounded-sm bg-[var(--tess-canvas-strong,#ECE9E2)]" />
        </div>
        <div className="flex h-4 items-center justify-between gap-3">
          <span className="h-2.5 w-1/4 rounded-sm bg-[var(--tess-canvas-strong,#ECE9E2)]" />
          <span className="h-2.5 w-10 rounded-sm bg-[var(--tess-canvas-strong,#ECE9E2)]" />
        </div>
        <span className="h-[17.5px] w-3/4 rounded-sm bg-[var(--tess-canvas-strong,#ECE9E2)]" />
      </div>
    </div>
  );
}
const FILTER_PARAMS = [
  ['resourceTypes', 'type'],
  ['purposes', 'purpose'],
  ['feel', 'feel'],
  ['intensity', 'intensity'],
  ['motion', 'motion'],
  ['density', 'density'],
  ['performance', 'performance'],
  ['accessibility', 'accessibility'],
  ['dependencies', 'dependencies'],
  ['license', 'license'],
] as const;
type SearchFacetKey = Exclude<keyof SearchFilters, 'minQuality'>;
type SearchFacetOptions = NonNullable<ExploreRailProps['availableOptions']>;

const FACET_VALUE_READERS: Record<SearchFacetKey, (document: SearchDocument) => string[]> = {
  resourceTypes: (document) => [document.resourceType],
  purposes: (document) => document.purposes,
  feel: (document) => document.feel,
  intensity: (document) => document.intensity,
  motion: (document) => document.motion,
  density: (document) => document.density,
  performance: (document) => document.performance,
  accessibility: (document) => document.accessibility,
  dependencies: (document) => document.dependencies,
  license: (document) => [document.license],
};

function readFilters(params: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {};
  for (const [key, parameter] of FILTER_PARAMS) {
    const values = params.get(parameter)?.split(',').filter(Boolean);
    if (values?.length) filters[key] = values;
  }
  const minQuality = Number(params.get('minQuality'));
  if (params.has('minQuality') && Number.isFinite(minQuality)) filters.minQuality = minQuality;
  return filters;
}

function searchSignature(query: string, filters: SearchFilters): string {
  const orderedFilters = Object.fromEntries(
    Object.entries(filters).sort(([left], [right]) => left.localeCompare(right)),
  );
  return JSON.stringify({ query: query.trim(), filters: orderedFilters });
}

function writeSearchUrl(query: string, filters: SearchFilters): void {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  for (const [key, parameter] of FILTER_PARAMS) {
    const values = filters[key];
    if (Array.isArray(values) && values.length) params.set(parameter, values.join(','));
  }
  if (typeof filters.minQuality === 'number') params.set('minQuality', String(filters.minQuality));
  const search = params.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', url);
}

function rankedResources(resources:ResourceManifest[],hits:Array<{id:string}>):ResourceManifest[]{
 const byId=new Map(resources.map(resource=>[resource.id,resource]));
 return hits.flatMap(hit=>{const resource=byId.get(hit.id);return resource?[resource]:[];});
}

const LOCAL_STORAGE_RECENT_KEY = 'tessellate_recent_searches_v1';

export function ExploreView({catalogCategory}: {catalogCategory?:string} = {}) {
  const [loadAttempt,setLoadAttempt]=useState(0);
  const [catalogError,setCatalogError]=useState('');
  const [searchError,setSearchError]=useState('');
  const queryRef=useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [manifests, setManifests] = useState<ResourceManifest[]>([]);
  const [searchResults, setSearchResults] = useState<ResourceManifest[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSearchKey, setCompletedSearchKey] = useState<string | null>(null);
  const [urlReady, setUrlReady] = useState(false);
  const mobileRailDialogRef = useRef<HTMLDivElement>(null);
  const mobileRailToggleRef = useRef<HTMLButtonElement>(null);
  const mobileRailCloseRef = useRef<HTMLButtonElement>(null);

  const oramaDbRef = useRef<ResourceOramaDb | null>(null);
  const searchRequestRef = useRef(0);
  const hasCompletedSearch = completedSearchKey !== null;
  const isQueryDebouncing = query !== committedQuery;
  const isSearchPending = isLoading || isSearching || completedSearchKey !== searchSignature(committedQuery, filters);
  const availableFacetOptions = useMemo(() => {
    const values: Record<SearchFacetKey, Set<string>> = {
      resourceTypes: new Set(),
      purposes: new Set(),
      feel: new Set(),
      intensity: new Set(),
      motion: new Set(),
      density: new Set(),
      performance: new Set(),
      accessibility: new Set(),
      dependencies: new Set(),
      license: new Set(),
    };
    for (const manifest of manifests) {
      const document = manifestToSearchDocument(manifest);
      for (const key of Object.keys(FACET_VALUE_READERS) as SearchFacetKey[]) {
        for (const value of FACET_VALUE_READERS[key](document)) values[key].add(value);
      }
    }
    return Object.fromEntries(Object.entries(values).map(([key, options]) => [key, [...options]])) as SearchFacetOptions;
  }, [manifests]);

  // Read URL state before any asynchronous catalogue work and keep browser
  // back/forward navigation in sync with the controls.
  useEffect(() => {
    const applyUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('q') ?? '';
      setQuery(initialQuery);
      setCommittedQuery(initialQuery);
      setFilters(readFilters(params));
      if (params.get('focus') === 'search') queryRef.current?.focus();
    };
    applyUrlState();
    setUrlReady(true);
    window.addEventListener('popstate', applyUrlState);
    return () => window.removeEventListener('popstate', applyUrlState);
  }, []);

  // Keep the input responsive while preventing a catalogue rerender for each
  // keystroke (which repeatedly tears down in-flight resource previews).
  useEffect(() => {
    if (!urlReady || query === committedQuery) return;
    const timer = window.setTimeout(() => setCommittedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query, committedQuery, urlReady]);

  useEffect(() => {
    if (!mobileRailOpen) return;
    const dialog = mobileRailDialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobileRailCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileRailOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => mobileRailToggleRef.current?.focus());
    };
  }, [mobileRailOpen]);

  useEffect(() => {
    if (urlReady) writeSearchUrl(committedQuery, filters);
  }, [committedQuery, filters, urlReady]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) setRecentSearches(parsed);
      }
    } catch {
      // Recent searches are optional and must not block catalogue use.
    }
  }, []);

  // 1. Load catalog & initialize Orama search DB
  useEffect(() => {
    async function initCatalog() {
      setIsLoading(true);setCatalogError('');
      setSearchError('');
      setCompletedSearchKey(null);
      oramaDbRef.current = null;
      setSearchResults([]);
      setTotalHits(0);
      try {
        const res = await fetch('/data/catalog.json');
        if (!res.ok) throw new Error(`Catalogue HTTP ${res.status}`);
        const data = await res.json();
        const items=ResourceManifestSchema.array().parse(data.resources).filter(resource=>!catalogCategory || (catalogCategory==='effects' ? resource.categories.some(category=>['backgrounds','motion','typography'].includes(category)) : resource.categories.includes(catalogCategory)));
        const db = await createResourceSearchDb();
        await indexResources(db, items);
        oramaDbRef.current = db;
        setManifests(items);
      } catch (err) {
        setCatalogError(`Could not load the catalogue: ${String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
    initCatalog();
  }, [catalogCategory,loadAttempt]);

  // Search the full index whenever committed query or filters change.
  useEffect(() => {
    const db = oramaDbRef.current;
    if (!urlReady || !db || isLoading || catalogError) return;
    const requestId = ++searchRequestRef.current;
    let cancelled = false;
    setSearchError('');
    setIsSearching(true);
    setIsLoadingMore(false);
    executeSearch(db, committedQuery, filters, PAGE_SIZE, 0)
      .then((result) => {
        if (cancelled || requestId !== searchRequestRef.current) return;
        setSearchResults(rankedResources(manifests,result.items));
        setTotalHits(result.totalHits);
        setIsSearching(false);
        setCompletedSearchKey(searchSignature(committedQuery, filters));
      })
      .catch((error: unknown) => {
        if (cancelled || requestId !== searchRequestRef.current) return;
        setSearchError(`Search failed: ${String(error)}`);
        setIsSearching(false);
      });
    return () => { cancelled = true; };
  }, [committedQuery, filters, manifests, isLoading, catalogError, urlReady]);

  const handleLoadMore = async () => {
    const db = oramaDbRef.current;
    if (!db || isLoadingMore || searchResults.length >= totalHits) return;
    const requestId = ++searchRequestRef.current;
    setIsLoadingMore(true);
    setSearchError('');
    try {
      const result = await executeSearch(db, committedQuery, filters, PAGE_SIZE, searchResults.length);
      if (requestId !== searchRequestRef.current) return;
      setSearchResults((current) => [...current, ...rankedResources(manifests,result.items)]);
      setTotalHits(result.totalHits);
    } catch (error) {
      if (requestId === searchRequestRef.current) setSearchError(`Could not load more resources: ${String(error)}`);
    } finally {
      if (requestId === searchRequestRef.current) setIsLoadingMore(false);
    }
  };

  // Handle submitting query
  const handleSearchSubmit = (text: string) => {
    setQuery(text);
    setCommittedQuery(text);
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
    setCommittedQuery('');
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
          ref={queryRef} id="catalogue-search" name="q" aria-label="Search catalogue" type="text"
          disabled={!urlReady}
          aria-describedby={!urlReady ? 'explore-search-hydration-status' : undefined}
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

        {!urlReady && (
          <span
            id="explore-search-hydration-status"
            role="status"
            data-testid="explore-search-hydration-status"
            className="shrink-0 text-[10px] text-[var(--tess-ink-muted,#62666F)] sm:text-xs"
          >
            Preparing search…
          </span>
        )}

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
          ref={mobileRailToggleRef}
          aria-haspopup="dialog"
          aria-expanded={mobileRailOpen}
          aria-controls="explore-mobile-filter-dialog"
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
            availableOptions={availableFacetOptions}
          />
        </div>

        {/* Central Card Grid Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Results Summary Header */}
          <div className="flex items-center justify-between text-xs text-[var(--tess-ink-secondary,#62666F)] pb-2 border-b border-[var(--tess-hairline,#D9D6CF)]/60">
            <span aria-live="polite" aria-atomic="true">
              {isLoading
                ? 'Loading catalogue...'
                : catalogError
                  ? 'Catalogue unavailable'
                  : searchError
                    ? 'Search unavailable'
                    : isSearchPending || (searchResults.length === 0 && isQueryDebouncing)
                      ? 'Searching catalogue...'
                      : `Showing ${searchResults.length} of ${totalHits} resource${totalHits === 1 ? '' : 's'}`}
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

          {searchError && <p role="alert" className="border border-[#C83D48] bg-white p-3 text-xs text-[#8F2530]">{searchError}</p>}

          <h2 className="sr-only">Catalogue results</h2>

          {/* Cards Grid */}
          {searchResults.length === 0 && !catalogError && !searchError && !hasCompletedSearch ? (
            <div
              aria-busy="true"
              aria-label="Loading catalogue resources"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
              data-testid="resource-card-skeleton-grid"
              role="status"
            >
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <ResourceCardSkeleton key={index} index={index} />
              ))}
            </div>
          ) : searchResults.length === 0 && (isSearchPending || isQueryDebouncing) && hasCompletedSearch && !catalogError && !searchError ? (
            <div
              aria-busy="true"
              className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-[var(--tess-hairline,#D9D6CF)] bg-white p-8 text-center text-xs text-[var(--tess-ink-muted,#62666F)]"
              role="status"
            >
              Searching catalogue…
            </div>
          ) : searchResults.length === 0 && !isSearchPending && !catalogError && !searchError ? (
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
                  setCommittedQuery('');
                  setFilters({});
                }}
                className="mt-2 h-8 px-3 rounded-lg bg-[var(--tess-cobalt,#2547E8)] text-white text-xs font-medium shadow-xs"
              >
                Reset search & filters
              </button>
            </div>
          ) : (
            <div
              aria-busy={isSearchPending || isQueryDebouncing ? true : undefined}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {searchResults.map((manifest) => (
                <ResourceCard key={manifest.id} manifest={manifest} />
              ))}
            </div>
          )}

          {searchResults.length < totalHits && !isLoading && !isSearching && !catalogError && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="self-center min-h-10 px-4 border border-[var(--tess-hairline-strong,#C7C3BA)] bg-white text-sm font-medium text-[var(--tess-ink,#111217)] hover:border-[var(--tess-cobalt,#2547E8)] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingMore ? 'Loading more…' : 'Show more resources'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Rail */}
      {mobileRailOpen && (
        <div
          id="explore-mobile-filter-dialog"
          ref={mobileRailDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="explore-filter-dialog-title"
          tabIndex={-1}
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setMobileRailOpen(false)}
          />
          <div className="relative ml-auto w-80 max-w-full bg-[var(--tess-surface,#FAF9F6)] p-6 shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--tess-hairline,#D9D6CF)] mb-4">
              <span id="explore-filter-dialog-title" className="font-semibold text-sm">Explore filters</span>
              <button
                type="button"
                ref={mobileRailCloseRef}
                aria-label="Close filters"
                onClick={() => setMobileRailOpen(false)}
                className="p-1 rounded text-[var(--tess-ink-muted,#62666F)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ExploreRail
              filters={filters}
              onFilterChange={setFilters}
              onReset={() => setFilters({})}
              availableOptions={availableFacetOptions}
              className="w-full"
              showHeading={false}
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
