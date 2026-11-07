import type { DesignDNA, ProjectManifest, ProjectNode } from '@tessellate/schemas';

export interface InferredDnaResult {
  dna: DesignDNA;
  confidence: number;
  detectedPalette: string;
  detectedCurvature: number;
  detectedVisualMode: 'light' | 'dark' | 'unknown';
  inferredFields: Array<keyof DesignDNA>;
  defaultedFields: Array<keyof DesignDNA>;
}

export interface IngestedScreen {
  id: string;
  name: string;
  slug: string;
  route: string;
  componentName: string;
  filePath: string;
  /** Next.js layout files that wrap this route, ordered from outermost to innermost. */
  layoutFilePaths: string[];
  rootNode: ProjectNode;
  detectedRoles: string[];
}

export interface IngestionResult {
  projectManifest: ProjectManifest;
  screens: IngestedScreen[];
  inferredDna: InferredDnaResult;
  sourceFileCount: number;
  layoutFilePaths: string[];
  ignoredSourceFilePaths: string[];
  warnings: string[];
  productIntentInferred: false;
}

export interface AstDiff {
  filePath: string;
  originalContent: string;
  modifiedContent: string;
  hasChanges: boolean;
  unifiedDiff: string;
}

export type PatchSafety = 'SAFE' | 'REVIEW_REQUIRED' | 'UNSUPPORTED';

export interface JSXAttributeMutation {
  fileName: string;
  componentName: string;
  /** Stable element path such as `main[0]/h1[0]` within the named component. */
  elementPath: string;
  attributeName: 'className';
  expectedValue: string;
  replacementValue: string;
}

export interface VisualMutationResult {
  safety: PatchSafety;
  reason: string;
  modifiedCode: string;
  applied: boolean;
}
