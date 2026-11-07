import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';
import { loadJsonManifest } from '@tessellate/catalog';
import {
  calculateCompatibilityScore,
  evaluateHardConstraints,
} from '../index.js';

const buttonManifestPath = path.resolve(__dirname, '../../../../resources/primitives/button/manifest.json');
const getExampleButtonResource = (): ResourceManifest => loadJsonManifest(buttonManifestPath);

describe('Compatibility Scoring Fidelity & Hard Constraints', () => {
  const baseButton = getExampleButtonResource();

  it('matches archetype using token/semantic overlap rather than exact string equality', () => {
    // Archetype "developer-tool" should match button which has productArchetype tag "developer-tool"
    const scoreResult1 = calculateCompatibilityScore({
      candidate: baseButton,
      targetDna: { density: 50, curvature: 50 },
      semanticRole: 'action',
      currentArchetype: 'developer-tool',
    });

    expect(scoreResult1.breakdown.intentFit).toBeGreaterThan(60);
    expect(scoreResult1.rationale.some((r) => r.includes('developer-tool') || r.includes('archetype'))).toBe(true);

    // Partial/related archetype "developer" should also match via token overlap
    const scoreResult2 = calculateCompatibilityScore({
      candidate: baseButton,
      targetDna: { density: 50, curvature: 50 },
      semanticRole: 'action',
      currentArchetype: 'developer-ecosystem',
    });

    expect(scoreResult2.breakdown.intentFit).toBeGreaterThan(50);
  });

  it('prefers Gold 40 resources with a preference bonus', () => {
    // Button is in GOLD_40_SLUGS
    const goldResult = calculateCompatibilityScore({
      candidate: baseButton,
      targetDna: { density: 50, curvature: 50 },
      semanticRole: 'action',
    });

    expect(goldResult.rationale.some((r) => r.includes('Gold 40'))).toBe(true);

    // Non-gold mock resource
    const nonGoldResource: ResourceManifest = {
      ...baseButton,
      id: 'res_custom_experimental_btn',
      slug: 'custom-experimental-btn',
      status: 'experimental',
      tags: ['experimental'],
    };

    const nonGoldResult = calculateCompatibilityScore({
      candidate: nonGoldResource,
      targetDna: { density: 50, curvature: 50 },
      semanticRole: 'action',
    });

    expect(nonGoldResult.rationale.some((r) => r.includes('Gold 40'))).toBe(false);
    expect(goldResult.totalScore).toBeGreaterThanOrEqual(nonGoldResult.totalScore);
  });

  it('does not let unassessed template scores influence resource selection', () => {
    const lowDeclaredScore: ResourceManifest = {
      ...baseButton,
      quality: { ...baseButton.quality, overall: 0, assessment: { status: 'unassessed', evidence: [] } },
    };
    const highDeclaredScore: ResourceManifest = {
      ...baseButton,
      quality: { ...baseButton.quality, overall: 100, assessment: { status: 'unassessed', evidence: [] } },
    };

    const low = calculateCompatibilityScore({ candidate: lowDeclaredScore, targetDna: { density: 50 }, semanticRole: 'action' });
    const high = calculateCompatibilityScore({ candidate: highDeclaredScore, targetDna: { density: 50 }, semanticRole: 'action' });

    expect(low.breakdown.quality).toBe(50);
    expect(high.breakdown.quality).toBe(50);
    expect(low.totalScore).toBe(high.totalScore);
    expect(low.rationale).toContain('Resource quality is unassessed; neutral quality weighting applied.');
  });

  it('rejects heavy WebGL / simulation tags under lightweight performance constraint', () => {
    const heavyResource: ResourceManifest = {
      ...baseButton,
      id: 'res_heavy_webgl_canvas',
      slug: 'heavy-webgl-canvas',
      tags: ['webgl', '3d', 'simulation'],
      performance: {
        ...baseButton.performance,
        gpuCost: 'high',
        jsCost: 'high',
      },
    };

    const constraintResult = evaluateHardConstraints({
      resource: heavyResource,
      performanceCeiling: 'lightweight',
    });

    expect(constraintResult.pass).toBe(false);
    expect(
      constraintResult.rejectionReasons.some((r) =>
        r.toLowerCase().includes('performance') || r.toLowerCase().includes('heavy')
      )
    ).toBe(true);
  });

  it('enforces AA accessibility floor by rejecting resources with lower target levels', () => {
    const lowA11yResource: ResourceManifest = {
      ...baseButton,
      id: 'res_low_a11y',
      slug: 'low-a11y',
      accessibility: {
        ...baseButton.accessibility,
        levelTarget: 'A',
      },
    };

    const constraintResult = evaluateHardConstraints({
      resource: lowA11yResource,
      requiredAccessibilityFloor: 'AA',
    });

    expect(constraintResult.pass).toBe(false);
    expect(
      constraintResult.rejectionReasons.some((r) =>
        r.includes('Accessibility floor violation')
      )
    ).toBe(true);

    // Also scoring should penalize when failing accessibility floor
    const scoreResult = calculateCompatibilityScore({
      candidate: lowA11yResource,
      targetDna: { density: 50, curvature: 50 },
      semanticRole: 'action',
      accessibilityFloor: 'AA',
    });

    expect(scoreResult.rationale.some((r) => r.includes('Failed required accessibility floor'))).toBe(true);
  });
});
