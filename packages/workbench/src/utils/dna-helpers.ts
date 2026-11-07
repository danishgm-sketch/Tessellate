import type { DesignDNA, PartialDesignDNA, ProjectManifest } from '@tessellate/schemas';
import { getNodePath } from './tree-helpers.js';
import type { InheritanceStatus, FeelTrait } from '../types.js';

export function getScopedTokens(manifest:ProjectManifest,screenId:string,nodeId:string|null):Record<string,string|number> {
 const root=manifest.screens.find(screen=>screen.id===screenId)?.rootNode;
 return root ? getNodePath(root,nodeId ?? root.id).reduce((tokens,node)=>({...tokens,...node.tokenOverrides}),{} as Record<string,string|number>) : {};
}

/** Resolve every ancestor, in the same order as the runtime renderer. */
export function getScopedDNA(manifest: ProjectManifest, screenId: string, nodeId: string | null): DesignDNA {
  const root = manifest.screens.find(screen=>screen.id===screenId)?.rootNode;
  return root && nodeId ? getNodePath(root,nodeId).reduce((dna,node)=>({...dna,...node.dnaOverrides}),manifest.designDNA) : manifest.designDNA;
}

export function isScopeLocked(manifest: ProjectManifest, screenId: string, nodeId: string | null, kind: 'dna'|'content'|'structure' = 'dna'): boolean {
  const root = manifest.screens.find(screen=>screen.id===screenId)?.rootNode;
  return Boolean(root && nodeId && getNodePath(root,nodeId).some(node=>node.locks?.node || node.locks?.[kind] || (kind==='dna' && (node.locks?.style || node.locks?.motion))));
}

/**
 * Computes effective Design DNA for a node given root project DNA and node overrides.
 */
export function getEffectiveNodeDNA(
  projectDNA: DesignDNA,
  nodeOverrides?: PartialDesignDNA
): DesignDNA {
  if (!nodeOverrides || Object.keys(nodeOverrides).length === 0) {
    return projectDNA;
  }
  return {
    ...projectDNA,
    ...nodeOverrides,
  };
}

/**
 * Determines whether a specific DNA dimension is inherited, overridden, or locked on a node.
 */
export function getDnaPropertyStatus(
  _projectDNA: DesignDNA,
  nodeOverrides: PartialDesignDNA | undefined,
  prop: keyof DesignDNA,
  isLocked = false
): InheritanceStatus {
  if (isLocked) {
    return 'locked';
  }
  if (nodeOverrides && nodeOverrides[prop] !== undefined) {
    return 'overridden';
  }
  return 'inherited';
}

export const CANONICAL_FEEL_TRAITS = [
  { id: 'professionalism', name: 'Professionalism', dnaKey: 'professionalism' },
  { id: 'playfulness', name: 'Playfulness', dnaKey: 'playfulness' },
  { id: 'warmth', name: 'Warmth', dnaKey: 'warmth' },
  { id: 'technicality', name: 'Technicality', dnaKey: 'technicality' },
  { id: 'luxury', name: 'Luxury', dnaKey: 'luxury' },
  { id: 'editorial', name: 'Editorial Authority', dnaKey: 'editorial' },
  { id: 'futurism', name: 'Futurism', dnaKey: 'futurism' },
  { id: 'density', name: 'Data Density', dnaKey: 'density' },
  { id: 'whitespace', name: 'Generous Whitespace', dnaKey: 'whitespace' },
  { id: 'contrast', name: 'Visual Contrast', dnaKey: 'contrast' },
] as const;

/**
 * Extracts pinned Feel Mixer traits from effective DNA.
 */
export function extractFeelTraits(
  dna: DesignDNA,
  overrides?: PartialDesignDNA,
  pinnedIds: string[] = ['professionalism', 'playfulness', 'warmth', 'technicality', 'luxury']
): FeelTrait[] {
  return pinnedIds.map((id) => {
    const canonical = CANONICAL_FEEL_TRAITS.find((t) => t.id === id);
    const key = (canonical?.dnaKey ?? id) as keyof DesignDNA;
    const value = typeof dna[key] === 'number' ? (dna[key] as number) : 50;
    const status = overrides && overrides[key] !== undefined ? 'overridden' : 'inherited';

    return {
      id,
      name: canonical?.name ?? id.charAt(0).toUpperCase() + id.slice(1),
      value,
      isPinned: true,
      status,
    };
  });
}

/**
 * Deterministically maps arbitrary feel phrases into partial DNA mutations.
 */
export function mapFeelPhraseToDna(phrase: string): PartialDesignDNA | null {
  const normalized = phrase.toLowerCase().trim();

  if (/professional.*playful|playful.*professional/i.test(normalized)) {
    return {
      professionalism: 80,
      playfulness: 65,
      curvature: 55,
      warmth: 60,
      motionPlayfulness: 55,
    };
  }

  if (/institutional.*contemporary|contemporary.*institutional/i.test(normalized)) {
    return {
      trust: 90,
      professionalism: 85,
      curvature: 25,
      typographicExpression: 45,
      density: 70,
    };
  }

  if (/luxury.*without.*flashy|restrained.*luxury|understated.*luxury/i.test(normalized)) {
    return {
      luxury: 85,
      colourfulness: 30,
      whitespace: 75,
      typographicExpression: 70,
      motion: 30,
    };
  }

  if (/dense.*technical|technical.*dense/i.test(normalized)) {
    return {
      technicality: 90,
      density: 85,
      dataDensity: 85,
      whitespace: 25,
      contrast: 80,
    };
  }

  if (/approachable.*friendly|friendly.*approachable/i.test(normalized)) {
    return {
      warmth: 85,
      playfulness: 70,
      curvature: 65,
      whitespace: 60,
    };
  }

  return null;
}
