import { count, search } from '@orama/orama';
import type { ResourceOramaDb } from './indexer.js';
import type {
  SearchDocument,
  SearchFilters,
  SearchResponse,
  SearchResultGroup,
  SearchResultItem,
} from './types.js';

const STOP_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or', 'the', 'to', 'with']);

function normalizeToken(token: string): string {
  const lower = token.toLocaleLowerCase();
  if (lower.length > 4 && lower.endsWith('ies')) return `${lower.slice(0, -3)}y`;
  if (lower.length > 4 && lower.endsWith('s') && !lower.endsWith('ss')) return lower.slice(0, -1);
  return lower;
}

function tokens(value: string): string[] {
  return (value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .map(normalizeToken)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function searchableText(document: SearchDocument): string {
  return [
    document.name,
    document.description,
    ...document.categories,
    ...document.roles,
    ...document.purposes,
    ...document.tags,
    ...document.contentRequirements,
    document.intentSummary,
    ...document.intentJobs,
    ...document.intentIdealFor,
    ...document.archetypes,
    ...document.feel,
  ].join(' ');
}

function matchesFacet(selected: string[] | undefined, values: string[]): boolean {
  if (!selected?.length) return true;
  const normalizedValues = new Set(values.map((value) => value.toLocaleLowerCase()));
  return selected.some((value) => normalizedValues.has(value.toLocaleLowerCase()));
}

function matchesFilters(document: SearchDocument, filters?: SearchFilters): boolean {
  if (!filters) return true;
  if (!matchesFacet(filters.resourceTypes, [document.resourceType])) return false;
  if (!matchesFacet(filters.purposes, document.purposes)) return false;
  if (!matchesFacet(filters.feel, document.feel)) return false;
  if (!matchesFacet(filters.intensity, document.intensity)) return false;
  if (!matchesFacet(filters.motion, document.motion)) return false;
  if (!matchesFacet(filters.density, document.density)) return false;
  if (!matchesFacet(filters.performance, document.performance)) return false;
  if (!matchesFacet(filters.accessibility, document.accessibility)) return false;
  if (!matchesFacet(filters.dependencies, document.dependencies)) return false;
  if (!matchesFacet(filters.license, [document.license])) return false;
  return typeof filters.minQuality !== 'number' || document.qualityScore >= filters.minQuality;
}

/**
 * Searches the full indexed catalogue, applies every declared facet before
 * pagination, and returns a truthful total for the current query and filters.
 */
export async function executeSearch(
  db: ResourceOramaDb,
  queryTerm: string,
  filters?: SearchFilters,
  limit = 50,
  offset = 0
): Promise<SearchResponse> {
  const start = performance.now();
  const trimmed = queryTerm.trim();
  const queryTokens = [...new Set(tokens(trimmed))];
  const indexedCount = count(db);

  const searchResult = await search(db, trimmed
    ? {
        term: trimmed,
        properties: [
          'name',
          'description',
          'categories',
          'tags',
          'roles',
          'purposes',
          'contentRequirements',
          'intentSummary',
          'intentJobs',
          'intentIdealFor',
          'archetypes',
          'feel',
        ],
        boost: {
          name: 3,
          tags: 2,
          roles: 1.5,
          purposes: 1.2,
          contentRequirements: 1.5,
          intentSummary: 1.5,
        },
        limit: indexedCount,
      }
    : { limit: indexedCount });

  const candidates = searchResult.hits
    .map((hit) => {
      const document = hit.document as unknown as SearchDocument;
      const documentTokens = new Set(tokens(searchableText(document)));
      const matchedTerms = queryTokens.filter((token) => documentTokens.has(token)).length;
      return { id: hit.id, score: hit.score, document, matchedTerms };
    })
    .filter(({ document, matchedTerms }) => {
      if (!matchesFilters(document, filters)) return false;
      if (queryTokens.length === 0) return true;

      // Short queries are precise only when every meaningful term is present.
      // Longer natural-language queries can omit low-value descriptors, but
      // must still match at least 60% of their meaningful terms (minimum two).
      const requiredTerms = queryTokens.length <= 2
        ? queryTokens.length
        : Math.max(2, Math.ceil(queryTokens.length * 0.6));
      return matchedTerms >= requiredTerms;
    })
    .sort((left, right) => right.matchedTerms - left.matchedTerms || right.score - left.score);

  const totalHits = candidates.length;
  const page = candidates.slice(Math.max(0, offset), Math.max(0, offset) + Math.max(0, limit));
  const items: SearchResultItem[] = page.map(({ id, score, document }) => ({
    id: document.id || id,
    slug: document.slug,
    score,
    document,
  }));

  const groupMap = new Map<string, SearchResultItem[]>();
  for (const item of items) {
    const key = item.document.resourceType;
    const existing = groupMap.get(key) ?? [];
    existing.push(item);
    groupMap.set(key, existing);
  }

  const groups: SearchResultGroup[] = Array.from(groupMap.entries()).map(([groupName, groupItems]) => ({
    groupName,
    count: groupItems.length,
    items: groupItems,
  }));

  return {
    query: queryTerm,
    totalHits,
    elapsedMs: Math.round((performance.now() - start) * 100) / 100,
    groups,
    items,
  };
}
