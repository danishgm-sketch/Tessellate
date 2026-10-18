import type {
  ResourceManifest,
  ProjectConstraints,
  DeviceTarget,
} from '@tessellate/schemas';

export interface HardConstraintEvaluationInput {
  resource: ResourceManifest;
  constraints?: ProjectConstraints;
  targetFramework?: string; // default: 'react'
  targetStyling?: string; // default: 'tailwind-v4'
  requestedLicenseAllowlist?: string[];
  requiredAccessibilityFloor?: 'A' | 'AA' | 'AAA';
  performanceCeiling?: 'lightweight' | 'balanced' | 'rich';
  targetDevices?: DeviceTarget[];
  currentArchetype?: string;
  lockedSurroundingResources?: ResourceManifest[];
  requiredSlots?: string[];
}

export interface HardConstraintResult {
  pass: boolean;
  rejectionReasons: string[];
}

const ACCESSIBILITY_LEVEL_RANK: Record<string, number> = {
  none: 0,
  A: 1,
  AA: 2,
  AAA: 3,
};

const PERFORMANCE_COST_RANK: Record<string, number> = {
  none: 0,
  tiny: 1,
  low: 2,
  medium: 3,
  high: 4,
};

/**
 * Pure evaluation of hard constraints.
 * Rejects resource before scoring if ANY constraint is violated.
 * Hard constraints cannot be bypassed by AI or score tuning.
 */
export function evaluateHardConstraints(input: HardConstraintEvaluationInput): HardConstraintResult {
  const { resource } = input;
  const reasons: string[] = [];

  // 1. Incompatible Framework
  const targetFramework = input.targetFramework ?? 'react';
  if (resource.framework !== targetFramework) {
    reasons.push(
      `Framework incompatibility: resource uses '${resource.framework}', target requires '${targetFramework}'.`
    );
  }

  // 2. Incompatible Styling Strategy
  const targetStyling = (input.targetStyling ?? 'tailwind').toLowerCase();
  const flexRes = resource as {
    styling?: string | { strategy?: string };
    dependencies?: Array<{ package: string }> | { packages?: Record<string, string>; peerDependencies?: Record<string, string> };
    license?: { spdx?: string };
    provenance?: { license?: string };
  };

  const resStyling = (
    typeof flexRes.styling === 'string'
      ? flexRes.styling
      : flexRes.styling?.strategy ?? ''
  ).toLowerCase();

  const stylingCompatible =
    resStyling === targetStyling ||
    (resStyling.startsWith('tailwind') && targetStyling.startsWith('tailwind'));
  if (!stylingCompatible) {
    reasons.push(
      `Styling incompatibility: resource uses '${resStyling}', target requires '${targetStyling}'.`
    );
  }

  // 3. Prohibited Dependencies
  const prohibited = input.constraints?.prohibitedDependencies ?? [];
  const allowed = input.constraints?.allowedDependencies;
  const declaredDeps: string[] = Array.isArray(flexRes.dependencies)
    ? flexRes.dependencies.map((d) => d.package)
    : [
        ...Object.keys(flexRes.dependencies?.packages ?? {}),
        ...Object.keys(flexRes.dependencies?.peerDependencies ?? {}),
      ];
  for (const dep of declaredDeps) {
    if (prohibited.some((p) => p.trim().toLowerCase() === dep.trim().toLowerCase())) {
      reasons.push(`Prohibited dependency detected: '${dep}'.`);
    }
  }
  if (allowed) {
    const approvedDependencies = new Set(allowed.map((dependency) => dependency.trim().toLowerCase()));
    for (const dep of declaredDeps) {
      if (!approvedDependencies.has(dep.trim().toLowerCase())) {
        reasons.push(`Dependency '${dep}' is not in the approved allowlist [${allowed.join(', ')}].`);
      }
    }
  }

  // 4. Missing Required Semantic Slots
  if (input.requiredSlots && input.requiredSlots.length > 0) {
    const resourceSlots = new Set((resource.slots ?? []).map((s) => s.id));
    for (const reqSlot of input.requiredSlots) {
      if (!resourceSlots.has(reqSlot)) {
        reasons.push(`Missing required slot: '${reqSlot}'.`);
      }
    }
  }

  // 5. License Compatibility
  const licenseAllowlist = input.requestedLicenseAllowlist ?? input.constraints?.licenseAllowlist;
  const resLicense = (flexRes.license?.spdx ?? flexRes.provenance?.license ?? '').trim().toLowerCase();
  if (licenseAllowlist && licenseAllowlist.length > 0) {
    if (!resLicense) {
      reasons.push('License metadata is missing while the project requires an approved license allowlist.');
    } else if (!licenseAllowlist.some((lic) => lic.trim().toLowerCase() === resLicense)) {
      reasons.push(
        `License '${resLicense}' is not in the approved allowlist [${licenseAllowlist.join(', ')}].`
      );
    }
  }

  // 6. Accessibility Floor Model
  const requiredA11y = input.requiredAccessibilityFloor ?? input.constraints?.accessibilityFloor ?? 'AA';
  const resourceA11yLevel = resource.accessibility.levelTarget;
  const reqRank = ACCESSIBILITY_LEVEL_RANK[requiredA11y] ?? 2;
  const resRank = ACCESSIBILITY_LEVEL_RANK[resourceA11yLevel] ?? 0;

  if (resRank < reqRank) {
    reasons.push(
      `Accessibility floor violation: target requires '${requiredA11y}', resource achieves '${resourceA11yLevel}'.`
    );
  }

  if (requiredA11y === 'AAA') {
    if (!resource.accessibility.contrastTokenCompatible) {
      reasons.push('Accessibility AAA violation: contrast tokens not fully compatible.');
    }
    if (!resource.accessibility.reducedMotionVerified) {
      reasons.push('Accessibility AAA violation: reduced-motion not verified.');
    }
  }

  // 7. Performance Class Ceiling
  const perfCeiling = input.performanceCeiling ?? input.constraints?.performanceCeiling;
  if (perfCeiling === 'lightweight' || perfCeiling === 'balanced') {
    const maximumCost = perfCeiling === 'lightweight' ? 'low' : 'medium';
    const maximumRank = PERFORMANCE_COST_RANK[maximumCost]!;
    const costs = [
      ['jsCost', resource.performance.jsCost],
      ['gpuCost', resource.performance.gpuCost],
      ['mediaCost', resource.performance.mediaCost],
    ] as const;

    for (const [name, cost] of costs) {
      const rank = PERFORMANCE_COST_RANK[cost] ?? Number.POSITIVE_INFINITY;
      if (rank > maximumRank) {
        reasons.push(`Performance ceiling violation: ${name} '${cost}' exceeds ${perfCeiling} limit.`);
      }
    }

    if (perfCeiling === 'lightweight') {
      const heavyTags = ['webgl', '3d', 'threejs', 'physics', 'particle-system', 'particles', 'simulation'];
      const hasHeavyTag = (resource.tags ?? []).some((t) => heavyTags.includes(t.toLowerCase()));
      if (hasHeavyTag) {
        reasons.push(`Performance ceiling violation: heavy graphics or simulation tags detected for lightweight target.`);
      }
    }
  }

  // 8. Missing Required Mobile Strategy
  const targetDevices = input.targetDevices ?? input.constraints?.targetDevices ?? ['desktop', 'tablet', 'mobile'];
  if (targetDevices.includes('mobile')) {
    const hasSmallVerifiedWidth = resource.responsive.verifiedWidths.some((w) => w <= 480);
    const hasBreakpointOverride = (resource.responsive.breakpointStrategies ?? []).some(
      (breakpoint) => breakpoint.maxWidth >= 360,
    );
    const defaultStrategy = resource.responsive.defaultStrategy;

    if (!hasSmallVerifiedWidth && !hasBreakpointOverride && defaultStrategy === 'compress') {
      reasons.push('Mobile strategy missing: resource unverified under 480px and lacks responsive adaptation.');
    }
  }

  // 9. Archetype Avoidance
  if (input.currentArchetype) {
    const currentArch = input.currentArchetype.toLowerCase();
    const isAvoided = resource.intent?.avoidFor?.some((a) => a.toLowerCase() === currentArch);
    if (isAvoided) {
      reasons.push(`Explicitly prohibited for archetype: '${input.currentArchetype}'.`);
    }

    const relAvoided = resource.relationships?.some(
      (r) => r.type === 'AVOID_FOR' && r.target.toLowerCase() === currentArch
    );
    if (relAvoided) {
      reasons.push(`Relationship graph declares AVOID_FOR archetype '${input.currentArchetype}'.`);
    }
  }

  // 10. Conflict with Locked Surrounding Resources
  if (input.lockedSurroundingResources && input.lockedSurroundingResources.length > 0) {
    for (const surrounding of input.lockedSurroundingResources) {
      // Check if this resource avoids the surrounding resource
      const thisAvoids = resource.relationships?.some(
        (r) => r.type === 'AVOID_FOR' && (r.target === surrounding.id || r.target === surrounding.slug)
      );
      if (thisAvoids) {
        reasons.push(`Resource declares conflict (AVOID_FOR) with active resource '${surrounding.name}'.`);
      }

      // Check if surrounding resource avoids this resource
      const surroundingAvoids = surrounding.relationships?.some(
        (r) => r.type === 'AVOID_FOR' && (r.target === resource.id || r.target === resource.slug)
      );
      if (surroundingAvoids) {
        reasons.push(`Active resource '${surrounding.name}' declares conflict with '${resource.name}'.`);
      }
    }
  }

  return {
    pass: reasons.length === 0,
    rejectionReasons: reasons,
  };
}
