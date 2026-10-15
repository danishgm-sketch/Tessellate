import type { DesignDNA, ProjectManifest, ProjectNode, ProjectScreen } from '@tessellate/schemas';

export interface InferredDnaResult {
  dna: DesignDNA;
  confidence: number;
  detectedPalette: string;
  detectedCurvature: number;
  detectedVisualMode: 'light' | 'dark';
}

export interface IngestedScreen {
  id: string;
  name: string;
  slug: string;
  filePath: string;
  rootNode: ProjectNode;
  detectedRoles: string[];
}

export interface IngestionResult {
  projectManifest: ProjectManifest;
  screens: IngestedScreen[];
  inferredDna: InferredDnaResult;
  sourceFileCount: number;
}

export interface AstDiff {
  filePath: string;
  originalContent: string;
  modifiedContent: string;
  hasChanges: boolean;
  unifiedDiff: string;
}
