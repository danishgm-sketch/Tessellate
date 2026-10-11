import {
  type DesignDNA,
  type PartialDesignDNA,
  DesignDNASchema,
  DESIGN_DNA_NUMERIC_KEYS,
} from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA, clampPartialDNA } from './dimensions.js';

export type NodeHierarchyLevel = 'project' | 'page' | 'section' | 'component' | 'element';

export interface NodeHierarchyChain {
  project: DesignDNA;
  page?: PartialDesignDNA;
  section?: PartialDesignDNA;
  component?: PartialDesignDNA;
  element?: PartialDesignDNA;
}

export interface InspectedProperty<T = unknown> {
  key: keyof DesignDNA;
  effectiveValue: T;
  sourceLevel: NodeHierarchyLevel;
  isOverridden: boolean;
  inheritedValue: T;
}

/**
 * Resolves the effective Design DNA by applying a chain of partial overrides
 * from top (project) down to leaf (element).
 */
export function resolveEffectiveDNA(
  chain: (PartialDesignDNA | undefined | null)[],
  fallbackBase: DesignDNA = DEFAULT_DESIGN_DNA
): DesignDNA {
  const merged: Record<string, unknown> = { ...fallbackBase };

  for (const layer of chain) {
    if (!layer || typeof layer !== 'object') continue;
    const clampedLayer = clampPartialDNA(layer);

    for (const [key, val] of Object.entries(clampedLayer)) {
      if (val !== undefined && val !== null) {
        merged[key] = val;
      }
    }
  }

  return DesignDNASchema.parse(merged);
}

/**
 * Resolves effective Design DNA for the canonical 5-level node hierarchy:
 * Project -> Page -> Section -> Component -> Element.
 */
export function resolveNodeHierarchyDNA(levels: NodeHierarchyChain): DesignDNA {
  return resolveEffectiveDNA(
    [levels.project, levels.page, levels.section, levels.component, levels.element],
    levels.project || DEFAULT_DESIGN_DNA
  );
}

/**
 * Adds or updates an override in a node's local overrides object.
 * Returns a new object without mutating input.
 */
export function applyOverride(
  current: PartialDesignDNA = {},
  updates: PartialDesignDNA = {}
): PartialDesignDNA {
  const clamped = clampPartialDNA(updates);
  return {
    ...current,
    ...clamped,
  };
}

/**
 * Removes a specific override from a node's local overrides object.
 * Once removed, the node will seamlessly inherit this dimension from its ancestor without residue.
 */
export function removeOverride(
  current: PartialDesignDNA = {},
  key: keyof DesignDNA
): PartialDesignDNA {
  const next = { ...current };
  delete next[key];
  return next;
}

/**
 * Resets specified overrides or all overrides if no keys are passed.
 * Returns an empty object or cleaned subset.
 */
export function resetOverrides(
  current: PartialDesignDNA = {},
  keys?: (keyof DesignDNA)[]
): PartialDesignDNA {
  if (!keys || keys.length === 0) {
    return {};
  }
  const next = { ...current };
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

/**
 * Calculates minimal diff between base DNA and modified DNA,
 * storing only values that actually changed.
 */
export function diffDNA(base: DesignDNA, modified: DesignDNA): PartialDesignDNA {
  const diff: PartialDesignDNA = {};
  for (const key of Object.keys(base) as (keyof DesignDNA)[]) {
    if (base[key] !== modified[key]) {
      // @ts-expect-error key assignment is type-safe
      diff[key] = modified[key];
    }
  }
  return diff;
}

/**
 * Inspects a specific DNA property across the hierarchy levels to determine:
 * - its effective value,
 * - which level provided the value,
 * - whether it is an override over the parent level,
 * - the parent's inherited value.
 */
export function inspectDNAProperty<K extends keyof DesignDNA>(
  key: K,
  levels: NodeHierarchyChain
): InspectedProperty<DesignDNA[K]> {
  const levelValues: { level: NodeHierarchyLevel; value: unknown }[] = [];

  const candidates: [NodeHierarchyLevel, PartialDesignDNA | undefined][] = [
    ['project', levels.project],
    ['page', levels.page],
    ['section', levels.section],
    ['component', levels.component],
    ['element', levels.element],
  ];

  for (const [level, obj] of candidates) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      levelValues.push({ level, value: obj[key] });
    }
  }

  // The effective value is the last defined value in the chain
  const effectiveEntry = levelValues[levelValues.length - 1] ?? {
    level: 'project' as NodeHierarchyLevel,
    value: DEFAULT_DESIGN_DNA[key],
  };

  // Inherited value is the value from the predecessor in the chain, or default
  const parentCandidate = levelValues.length > 1 ? levelValues[levelValues.length - 2] : undefined;
  const parentEntry = parentCandidate ?? {
    level: 'project' as NodeHierarchyLevel,
    value: levels.project?.[key] ?? DEFAULT_DESIGN_DNA[key],
  };

  const isOverridden = effectiveEntry.level !== 'project';

  return {
    key,
    effectiveValue: effectiveEntry.value as DesignDNA[K],
    sourceLevel: effectiveEntry.level,
    isOverridden,
    inheritedValue: parentEntry.value as DesignDNA[K],
  };
}

/**
 * Inspects all DNA properties across the node hierarchy.
 */
export function inspectAllDNAProperties(
  levels: NodeHierarchyChain
): Record<keyof DesignDNA, InspectedProperty> {
  const result: Partial<Record<keyof DesignDNA, InspectedProperty>> = {};
  const allKeys = [
    ...DESIGN_DNA_NUMERIC_KEYS,
    'primaryArchetype',
    'visualMode',
    'geometryFamily',
    'navigationModel',
    'responsivePhilosophy',
    'contentTone',
    'primaryStack',
    'motionPersonality',
    'typographyPersonality',
    'surfacePersonality',
  ] as (keyof DesignDNA)[];

  for (const key of allKeys) {
    result[key] = inspectDNAProperty(key, levels);
  }

  return result as Record<keyof DesignDNA, InspectedProperty>;
}
