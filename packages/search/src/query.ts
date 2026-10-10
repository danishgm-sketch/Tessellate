import { search } from '@orama/orama';
import type { ResourceOramaDb } from './indexer.js';
import type { SearchFilters, SearchResponse, SearchResultItem, SearchResultGroup, SearchDocument } from './types.js';

export async function executeSearch(
  db: ResourceOramaDb,
  queryTerm: string,
  filters?: SearchFilters,
  limit = 50
): Promise<SearchResponse> {
  const start = performance.now();
  const trimmed = queryTerm.trim();

  let rawHits: Array<{ id: string; score: number; document: SearchDocument }> = [];

  if (trimmed.length > 0) {
    const searchResult = await search(db, {
      term: trimmed,
      properties: [
        'name',
        'description',
        'tags',
        'roles',
        'purposes',
        'intentSummary',
        'archetypes',
        'feel',
      ],
      boost: {
        name: 3,
        tags: 2,
        roles: 1.5,
        purposes: 1.2,
        intentSummary: 1.5,
      },
      limit: 100,
    });

    rawHits = searchResult.hits.map((h) => ({
      id: h.id,
      score: h.score,
      document: h.document as unknown as SearchDocument,
    }));
  } else {
    // If query term is empty, search with empty term to get all documents
    const allResult = await search(db, {
      limit: 100,
    });
    rawHits = allResult.hits.map((h) => ({
      id: h.id,
      score: 1.0,
      document: h.document as unknown as SearchDocument,
    }));
  }

  // Apply strict filters
  const filteredItems: SearchResultItem[] = [];

  for (const hit of rawHits) {
    const doc = hit.document;

    if (filters) {
      // Filter: resourceTypes
      if (filters.resourceTypes && filters.resourceTypes.length > 0) {
        if (!filters.resourceTypes.includes(doc.resourceType)) {
          continue;
        }
      }

      // Filter: purposes
      if (filters.purposes && filters.purposes.length > 0) {
        const matchesPurpose = doc.purposes.some((p) =>
          filters.purposes?.some((fp) => fp.toLowerCase() === p.toLowerCase())
        );
        if (!matchesPurpose) {
          continue;
        }
      }

      // Filter: feel
      if (filters.feel && filters.feel.length > 0) {
        const matchesFeel = doc.feel.some((f) =>
          filters.feel?.some((ff) => ff.toLowerCase() === f.toLowerCase())
        );
        if (!matchesFeel) {
          continue;
        }
      }

      // Filter: license
      if (filters.license && filters.license.length > 0) {
        if (!filters.license.includes(doc.license)) {
          continue;
        }
      }

      // Filter: minQuality
      if (typeof filters.minQuality === 'number') {
        if (doc.qualityScore < filters.minQuality) {
          continue;
        }
      }
    }

    filteredItems.push({
      id: doc.id,
      slug: doc.slug,
      score: hit.score,
      document: doc,
    });

    if (filteredItems.length >= limit) {
      break;
    }
  }

  // Group results by resourceType
  const groupMap = new Map<string, SearchResultItem[]>();
  for (const item of filteredItems) {
    const key = item.document.resourceType;
    const existing = groupMap.get(key) ?? [];
    existing.push(item);
    groupMap.set(key, existing);
  }

  const groups: SearchResultGroup[] = Array.from(groupMap.entries()).map(([groupName, items]) => ({
    groupName,
    count: items.length,
    items,
  }));

  const elapsedMs = performance.now() - start;

  return {
    query: queryTerm,
    totalHits: filteredItems.length,
    elapsedMs: Math.round(elapsedMs * 100) / 100,
    groups,
    items: filteredItems,
  };
}
