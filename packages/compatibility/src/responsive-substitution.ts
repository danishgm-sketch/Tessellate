import type {
  ResourceManifest,
  ResponsiveStrategy,
} from '@tessellate/schemas';

export interface ResponsiveEvaluationResult {
  supported: boolean;
  effectiveStrategy: ResponsiveStrategy;
  substituteResourceId?: string;
  verifiedAtWidth: boolean;
  notes: string[];
}

/**
 * Resolves responsive strategy or alternative substitution for a given viewport width.
 */
export function resolveResponsiveSubstitution(
  resource: ResourceManifest,
  targetWidth: number = 360
): ResponsiveEvaluationResult {
  const notes: string[] = [];
  const verifiedAtWidth = resource.responsive.verifiedWidths.some((w) => w <= targetWidth);

  // 1. Check Explicit Breakpoint Strategies
  if (resource.responsive.breakpointStrategies) {
    // Sort ascending by maxWidth to find the most specific match
    const matchingStrategy = resource.responsive.breakpointStrategies
      .filter((bs) => targetWidth <= bs.maxWidth)
      .sort((a, b) => a.maxWidth - b.maxWidth)[0];

    if (matchingStrategy) {
      if (matchingStrategy.substituteResourceId) {
        notes.push(`Resolved breakpoint substitute '${matchingStrategy.substituteResourceId}' at <= ${matchingStrategy.maxWidth}px.`);
      }
      return {
        supported: true,
        effectiveStrategy: matchingStrategy.strategy,
        substituteResourceId: matchingStrategy.substituteResourceId,
        verifiedAtWidth,
        notes,
      };
    }
  }

  // 2. Check Relationship Graph for MOBILE_ALTERNATIVE if target is mobile (<= 640px)
  if (targetWidth <= 640) {
    const mobileAlt = resource.relationships.find((r) => r.type === 'MOBILE_ALTERNATIVE');
    if (mobileAlt) {
      notes.push(`Resolved MOBILE_ALTERNATIVE '${mobileAlt.target}' for narrow viewport.`);
      return {
        supported: true,
        effectiveStrategy: 'substitute',
        substituteResourceId: mobileAlt.target,
        verifiedAtWidth,
        notes,
      };
    }
  }

  // 3. Fallback to default strategy
  const defaultStrategy = resource.responsive.defaultStrategy;
  return {
    supported: verifiedAtWidth || defaultStrategy !== 'compress',
    effectiveStrategy: defaultStrategy,
    verifiedAtWidth,
    notes,
  };
}
