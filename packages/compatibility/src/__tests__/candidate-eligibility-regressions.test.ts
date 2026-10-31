import { describe, expect, it } from 'vitest';
import type { ResourceManifest } from '@tessellate/schemas';
import { isGoldResource, loadJsonManifest } from '@tessellate/catalog';
import { isResourceComposerEligible, isResourceCompositionCapable } from '../capabilities.js';
import { evaluateHardConstraints } from '../hard-constraints.js';
import { composeProjectPipeline } from '../compose-pipeline.js';
import { loadTestCatalog } from './test-catalog-loader.js';
import * as path from 'node:path';

const buttonManifestPath = path.resolve(__dirname, '../../../../resources/primitives/button/manifest.json');
const button = loadJsonManifest(buttonManifestPath) as ResourceManifest;

describe('Core candidate eligibility fails closed', () => {
  it('does not treat an unverified resource as runtime and export capable from caller hints alone', () => {
    expect(isResourceCompositionCapable({
      slug: 'experimental-hero',
      runtimeRenderable: true,
      browserExportable: true,
    })).toBe(false);
  });

  it('honors explicit negative capability flags for a Gold resource', () => {
    expect(isResourceCompositionCapable({
      slug: button.slug,
      runtimeRenderable: false,
      browserExportable: true,
    })).toBe(false);
  });

  it('keeps non-Gold resources out of Core composition eligibility', () => {
    const experimental = { ...button, id: 'res_experimental_hero', slug: 'experimental-hero' };

    expect(isResourceComposerEligible(experimental)).toBe(false);
    expect(isResourceComposerEligible(button)).toBe(true);
  });

  it('rejects a nominal Gold resource when it cannot provide every generated direction variant', () => {
    const quietOnly = { ...button, variants: button.variants.filter((variant) => variant.id === 'quiet') };

    expect(isResourceComposerEligible(quietOnly)).toBe(false);
  });

  it('verifies every Core Gold resource supports the three generated direction variants', () => {
    const requiredVariants = ['quiet', 'expressive', 'nocturne'];
    const goldResources = loadTestCatalog().filter((resource) => isGoldResource(resource.slug));

    expect(goldResources).toHaveLength(40);
    for (const resource of goldResources) {
      const declaredVariants = new Set(resource.variants.map((variant) => variant.id.toLowerCase()));
      for (const variant of requiredVariants) {
        expect(declaredVariants, `${resource.slug} must support the generated ${variant} variant`).toContain(variant);
      }
    }
  });
});

describe('Hard constraints reject incomplete or over-budget candidates', () => {
  it('rejects a candidate with missing licence metadata when the project has an allowlist', () => {
    const unlicensed = { ...button, license: undefined } as unknown as ResourceManifest;
    const result = evaluateHardConstraints({
      resource: unlicensed,
      constraints: {
        accessibilityFloor: 'AA',
        targetDevices: ['desktop'],
        licenseAllowlist: ['MIT'],
      },
    });

    expect(result.pass).toBe(false);
    expect(result.rejectionReasons).toContain('License metadata is missing while the project requires an approved license allowlist.');
  });

  it('rejects high media cost under the balanced performance ceiling', () => {
    const mediaHeavy = {
      ...button,
      performance: {
        ...button.performance,
        jsCost: 'low' as const,
        gpuCost: 'low' as const,
        mediaCost: 'high' as const,
      },
    };
    const result = evaluateHardConstraints({ resource: mediaHeavy, performanceCeiling: 'balanced' });

    expect(result.pass).toBe(false);
    expect(result.rejectionReasons).toContain("Performance ceiling violation: mediaCost 'high' exceeds balanced limit.");
  });

  it('rejects runtime dependencies outside an explicit allowlist', () => {
    const dependencyHeavy = {
      ...button,
      dependencies: [{ package: 'unapproved-ui-kit', range: '^1.0.0', kind: 'runtime' as const }],
    };
    const result = evaluateHardConstraints({
      resource: dependencyHeavy,
      constraints: {
        accessibilityFloor: 'AA',
        targetDevices: ['desktop'],
        allowedDependencies: ['react', 'tailwindcss'],
      },
    });

    expect(result.pass).toBe(false);
    expect(result.rejectionReasons).toContain("Dependency 'unapproved-ui-kit' is not in the approved allowlist [react, tailwindcss].");
  });

  it('does not treat a breakpoint below the supported mobile range as a mobile strategy', () => {
    const desktopOnly = {
      ...button,
      responsive: {
        verifiedWidths: [768, 1440],
        defaultStrategy: 'compress' as const,
        breakpointStrategies: [{ maxWidth: 320, strategy: 'stack' as const }],
      },
    };
    const result = evaluateHardConstraints({
      resource: desktopOnly,
      constraints: { accessibilityFloor: 'AA', targetDevices: ['mobile'] },
    });

    expect(result.pass).toBe(false);
    expect(result.rejectionReasons).toContain('Mobile strategy missing: resource unverified under 480px and lacks responsive adaptation.');
  });

  it('applies dependency allowlists during visible product composition', () => {
    const catalog = loadTestCatalog();
    const hero = catalog.find((resource) => resource.slug === 'editorial-hero')!;
    const navigation = catalog.find((resource) => resource.slug === 'minimal-top-nav')!;
    const disallowedHero = {
      ...hero,
      dependencies: [{ package: 'unapproved-ui-kit', range: '^1.0.0', kind: 'runtime' as const }],
    };
    const result = composeProjectPipeline(
      { description: 'Build a clear marketing site for a team collaboration product.' },
      { catalogResources: [disallowedHero, navigation], seed: 'dependency-allowlist-regression' },
    );
    const selectedSlugs = result.directionA.manifest.screens.flatMap((screen) => {
      const visit = (node: (typeof screen.rootNode)): string[] => [
        ...(node.resourceRef ? [node.resourceRef.slug] : []),
        ...node.children.flatMap(visit),
      ];
      return visit(screen.rootNode);
    });

    expect(result.productModel.constraints.allowedDependencies).not.toContain('unapproved-ui-kit');
    expect(selectedSlugs).not.toContain('editorial-hero');
  });
});
