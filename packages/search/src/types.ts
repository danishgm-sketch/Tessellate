import type { ResourceManifest } from '@tessellate/schemas';

export interface SearchFilters {
  resourceTypes?: string[];
  purposes?: string[];
  feel?: string[];
  intensity?: string[];
  motion?: string[];
  density?: string[];
  performance?: string[];
  accessibility?: string[];
  dependencies?: string[];
  license?: string[];
  minQuality?: number;
}

export interface SearchDocument {
  id: string;
  slug: string;
  name: string;
  description: string;
  resourceType: string;
  categories: string[];
  roles: string[];
  purposes: string[];
  tags: string[];
  intentSummary: string;
  intentJobs: string[];
  intentIdealFor: string[];
  archetypes: string[];
  feel: string[];
  qualityScore: number;
  license: string;
}

export interface SearchResultItem {
  id: string;
  slug: string;
  score: number;
  document: SearchDocument;
  manifest?: ResourceManifest;
}

export interface SearchResultGroup {
  groupName: string;
  count: number;
  items: SearchResultItem[];
}

export interface SearchResponse {
  query: string;
  totalHits: number;
  elapsedMs: number;
  groups: SearchResultGroup[];
  items: SearchResultItem[];
}
