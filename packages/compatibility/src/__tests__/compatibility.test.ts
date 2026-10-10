import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import type { ResourceManifest } from '@tessellate/schemas';
import { loadJsonManifest } from '@tessellate/catalog';
import { interpretProductBrief, getGoldenBrief } from '@tessellate/composer';
import {
  COMPOSITION_GRAMMARS,
  getAllCompositionGrammars,
  getCompositionGrammar,
  evaluateHardConstraints,
  calculateDnaDistance,
  calculateDnaFitScore,
  ResourceRelationshipGraph,
  calculateCompositionSynergy,
  calculateDiversityAdjustment,
  evaluateResourcePerformance,
  aggregateScreenPerformance,
  evaluateAccessibility,
  resolveResponsiveSubstitution,
  SeededRandom,
  CANONICAL_SCORE_WEIGHTS,
  calculateCompatibilityScore,
  generateDirections,
} from '../index.js';

const buttonManifestPath = path.resolve(__dirname, '../../../../resources/primitives/button/manifest.json');
const getExampleButtonResource = (): ResourceManifest => loadJsonManifest(buttonManifestPath);

describe('Composition Grammars (40 Initial Grammars)', () => {
  it('defines exactly 40 composition/layout grammars', () => {
    const grammars = getAllCompositionGrammars();
    expect(grammars.length).toBe(40);
    expect(Object.keys(COMPOSITION_GRAMMARS).length).toBe(40);

    for (const g of grammars) {
      expect(g.id).toBeTruthy();
      expect(g.name).toBeTruthy();
      expect(g.description).toBeTruthy();
      expect(g.screenClass).toBeTruthy();
      expect(g.layoutFamily).toBeTruthy();
      expect(g.requiredRoles.length).toBeGreaterThan(0);
      expect(g.allowedRoles.length).toBeGreaterThan(0);
      expect(g.roleOrdering.length).toBeGreaterThan(0);
      expect(g.responsiveStrategies.length).toBeGreaterThan(0);
      expect(g.candidateCategories.length).toBeGreaterThan(0);
      expect(g.archetypeFit.length).toBeGreaterThan(0);
    }
  });

  it('can look up individual grammars by ID', () => {
    const editorial = getCompositionGrammar('editorial-marketing-narrative');
    expect(editorial).toBeDefined();
    expect(editorial?.layoutFamily).toBe('narrative-vertical');

    const terminal = getCompositionGrammar('research-terminal');
    expect(terminal).toBeDefined();
    expect(terminal?.defaultNavigationModel).toBe('command-palette');
  });
});

describe('Hard-Constraint Filter (Cannot be bypassed)', () => {
  const baseResource = getExampleButtonResource();

  it('passes valid resource conforming to all constraints', () => {
    const result = evaluateHardConstraints({
      resource: baseResource,
      targetFramework: 'react',
      targetStyling: 'tailwind-v4',
      requiredAccessibilityFloor: 'AA',
      performanceCeiling: 'balanced',
    });
    expect(result.pass).toBe(true);
    expect(result.rejectionReasons).toHaveLength(0);
  });

  it('rejects resource with incompatible framework', () => {
    const result = evaluateHardConstraints({
      resource: { ...baseResource, framework: 'vue' as unknown as 'react' },
      targetFramework: 'react',
    });
    expect(result.pass).toBe(false);
    expect(result.rejectionReasons.some((r) => r.includes('Framework incompatibility'))).toBe(true);
  });

  it('rejects resource with incompatible styling strategy', () => {
    const result = evaluateHardConstraints({
      resource: { ...baseResource, styling: 'css-modules' as unknown as 'tailwind' },
      targetStyling: 'tailwind',
    });
    expect(result.pass).toBe(false);
    expect(result.rejectionReasons.some((r) => r.includes('Styling incompatibility'))).toBe(true);
  });

  it('rejects resource with prohibited dependencies', () => {
    const result = evaluateHardConstraints({
      resource: {
        ...baseResource,
        dependencies: [
          { package: 'heavy-chart-lib', range: '^2.0.0', kind: 'runtime' },
        ],
      },
      constraints: {
        accessibilityFloor: 'AA',
        targetDevices: ['desktop'],
        prohibitedDependencies: ['heavy-chart-lib'],
      },
    });
    expect(result.pass).toBe(false);
    expect(result.rejectionReasons.some((r) => r.includes('Prohibited dependency detected'))).toBe(true);
  });

  it('rejects resource failing accessibility floor', () => {
    const lowA11yResource: ResourceManifest = {
      ...baseResource,
      accessibility: {
        ...baseResource.accessibility,
        levelTarget: 'A',
      },
    };

    const result = evaluateHardConstraints({
      resource: lowA11yResource,
      requiredAccessibilityFloor: 'AA',
    });
    expect(result.pass).toBe(false);
    expect(result.rejectionReasons.some((r) => r.includes('Accessibility floor violation'))).toBe(true);
  });

  it('rejects resource violating performance ceiling', () => {
    const heavyResource: ResourceManifest = {
      ...baseResource,
      performance: {
        ...baseResource.performance,
        jsCost: 'high',
        gpuCost: 'high',
      },
    };

    const result = evaluateHardConstraints({
      resource: heavyResource,
      performanceCeiling: 'lightweight',
    });
    expect(result.pass).toBe(false);
    expect(result.rejectionReasons.some((r) => r.includes('Performance ceiling violation'))).toBe(true);
  });

  it('rejects resource explicitly avoided for archetype', () => {
    const avoidedResource: ResourceManifest = {
      ...baseResource,
      intent: {
        ...baseResource.intent,
        avoidFor: ['fintech', 'banking'],
      },
    };

    const result = evaluateHardConstraints({
      resource: avoidedResource,
      currentArchetype: 'fintech',
    });
    expect(result.pass).toBe(false);
    expect(result.rejectionReasons.some((r) => r.includes('Explicitly prohibited for archetype'))).toBe(true);
  });

  it('rejects resource conflicting with locked surrounding resource', () => {
    const surrounding: ResourceManifest = {
      ...baseResource,
      id: 'res-hero-banner',
      slug: 'hero-banner',
      relationships: [{ type: 'AVOID_FOR', target: baseResource.id }],
    };

    const result = evaluateHardConstraints({
      resource: baseResource,
      lockedSurroundingResources: [surrounding],
    });
    expect(result.pass).toBe(false);
    expect(result.rejectionReasons.some((r) => r.includes('declares conflict'))).toBe(true);
  });
});

describe('Design DNA Distance & Fit Calculation', () => {
  it('computes distance 0 and fit 100 for identical DNA', () => {
    const dna = { professionalism: 80, visualAmbition: 40, contrast: 70 };
    const distance = calculateDnaDistance(dna, dna);
    const fit = calculateDnaFitScore(dna, dna);

    expect(distance).toBe(0);
    expect(fit).toBe(100);
  });

  it('computes large distance and low fit for opposing DNA', () => {
    const playful = { playfulness: 90, curvature: 90, colourfulness: 90, professionalism: 10 };
    const institutional = { playfulness: 5, curvature: 10, colourfulness: 10, professionalism: 95 };

    const distance = calculateDnaDistance(playful, institutional);
    const fit = calculateDnaFitScore(playful, institutional);

    expect(distance).toBeGreaterThan(60);
    expect(fit).toBeLessThan(40);
  });

  it('applies role-specific dimension weights', () => {
    const target = { motion: 80, visualAmbition: 80, dataDensity: 20 };
    const candA = { motion: 20, visualAmbition: 20, dataDensity: 20 }; // misses motion/ambition
    const candB = { motion: 80, visualAmbition: 80, dataDensity: 80 }; // misses dataDensity

    // For hero role, motion and visualAmbition are heavily weighted
    const heroDistA = calculateDnaDistance(target, candA, { role: 'hero' });
    const heroDistB = calculateDnaDistance(target, candB, { role: 'hero' });

    expect(heroDistA).toBeGreaterThan(heroDistB);
  });
});

describe('Relationship Graph & Composition Synergy', () => {
  const resourceA = getExampleButtonResource();
  const resourceB: ResourceManifest = {
    ...resourceA,
    id: 'res-card-primitive',
    slug: 'card-primitive',
    name: 'Card Primitive',
    relationships: [{ type: 'WORKS_WITH', target: resourceA.id, strength: 1.0 }],
  };

  it('indexes bidirectional relationships in ResourceRelationshipGraph', () => {
    const graph = new ResourceRelationshipGraph([resourceA, resourceB]);
    expect(graph.hasRelationship(resourceB.id, resourceA.id, 'WORKS_WITH')).toBe(true);
    expect(graph.getRelated(resourceB.id)).toContain(resourceA.id);
  });

  it('computes positive synergy for WORKS_WITH pairings', () => {
    const result = calculateCompositionSynergy({
      candidate: resourceB,
      surroundingResources: [resourceA],
    });
    expect(result.score).toBeGreaterThan(50);
    expect(result.reasons.some((r) => r.includes('WORKS_WITH'))).toBe(true);
  });

  it('penalizes severely when AVOID_FOR conflict exists', () => {
    const conflictingCand: ResourceManifest = {
      ...resourceB,
      relationships: [{ type: 'AVOID_FOR', target: resourceA.id }],
    };
    const result = calculateCompositionSynergy({
      candidate: conflictingCand,
      surroundingResources: [resourceA],
    });
    expect(result.score).toBeLessThan(30);
  });
});

describe('Diversity Adjustment', () => {
  const resourceA = getExampleButtonResource();

  it('penalizes repeated creator overuse', () => {
    const chosen = [resourceA, resourceA, resourceA];
    const result = calculateDiversityAdjustment({
      candidate: resourceA,
      chosenResources: chosen,
    });
    expect(result.penalty).toBeGreaterThanOrEqual(20);
    expect(result.score).toBeLessThanOrEqual(80);
    expect(result.notes.some((n) => n.includes('High creator repetition'))).toBe(true);
  });
});

describe('Performance and Accessibility Models', () => {
  const resource = getExampleButtonResource();

  it('evaluates resource performance against priority', () => {
    const normal = evaluateResourcePerformance(resource, 50);
    const strict = evaluateResourcePerformance(resource, 90);
    expect(normal.score).toBeGreaterThan(70);
    expect(strict.score).toBeGreaterThan(60);
  });

  it('aggregates performance across multiple resources', () => {
    const agg = aggregateScreenPerformance([resource, resource], 60);
    expect(agg.overallScore).toBeGreaterThan(70);
    expect(agg.budgetPassed).toBe(true);
  });

  it('evaluates accessibility compliance', () => {
    const a11y = evaluateAccessibility({ resource, requiredFloor: 'AA' });
    expect(a11y.meetsFloor).toBe(true);
    expect(a11y.score).toBeGreaterThan(75);
  });
});

describe('Responsive Substitution', () => {
  const resource = getExampleButtonResource();

  it('resolves responsive substitution for mobile', () => {
    const res = resolveResponsiveSubstitution(resource, 360);
    expect(res.supported).toBe(true);
    expect(res.effectiveStrategy).toBeDefined();
  });
});

describe('Deterministic PRNG (Mulberry32)', () => {
  it('produces identical sequences for identical seeds', () => {
    const rng1 = new SeededRandom('test-seed-xyz');
    const rng2 = new SeededRandom('test-seed-xyz');

    const seq1 = [rng1.next(), rng1.next(), rng1.nextInt(1, 100), rng1.next()];
    const seq2 = [rng2.next(), rng2.next(), rng2.nextInt(1, 100), rng2.next()];

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = new SeededRandom('seed-alpha');
    const rng2 = new SeededRandom('seed-beta');

    expect(rng1.next()).not.toBe(rng2.next());
  });
});

describe('Compatibility Scoring Formula (Exact 11 Weights = 100%)', () => {
  it('validates canonical score weights sum exactly to 1.00', () => {
    const sum = Object.values(CANONICAL_SCORE_WEIGHTS).reduce((acc, w) => acc + w, 0);
    expect(Math.abs(sum - 1.00)).toBeLessThan(0.0001);
  });

  it('computes transparent weighted score with full breakdown', () => {
    const resource = getExampleButtonResource();
    const result = calculateCompatibilityScore({
      candidate: resource,
      targetDna: { professionalism: 80, visualAmbition: 45 },
      semanticRole: 'action',
      grammar: COMPOSITION_GRAMMARS['classic-sidebar-dashboard'],
      currentArchetype: 'saas',
    });

    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.breakdown.intentFit).toBeGreaterThan(0);
    expect(result.breakdown.dnaFit).toBeGreaterThan(0);
    expect(result.breakdown.accessibility).toBeGreaterThan(0);
    expect(result.breakdown.performance).toBeGreaterThan(0);
  });
});

describe('Direction Generator (Directions A, B, C)', () => {
  it('generates three distinct, valid directions deterministically', () => {
    const brief = getGoldenBrief('financial-intelligence-terminal');
    expect(brief).toBeDefined();

    const { productModel } = interpretProductBrief(brief!.input);
    const result1 = generateDirections({ productModel, seed: 'finance-v1' });
    const result2 = generateDirections({ productModel, seed: 'finance-v1' });

    // Seed reproducibility check
    expect(result1.directionA).toEqual(result2.directionA);
    expect(result1.directionB).toEqual(result2.directionB);
    expect(result1.directionC).toEqual(result2.directionC);

    const { directionA, directionB, directionC } = result1;

    // Direction A (Conservative)
    expect(directionA.type).toBe('conservative');
    expect(directionA.dna.structuralCreativity).toBeLessThan(directionB.dna.structuralCreativity);
    expect(directionA.dna.accessibilityPriority).toBeGreaterThanOrEqual(80);

    // Direction B (Expressive)
    expect(directionB.type).toBe('expressive');
    expect(directionB.dna.visualAmbition).toBeGreaterThan(directionA.dna.visualAmbition);
    expect(directionB.dna.motion).toBeGreaterThanOrEqual(directionA.dna.motion);

    // Direction C (Structural Alternative)
    expect(directionC.type).toBe('structural-alternative');
    expect(directionC.dna.structuralCreativity).toBeGreaterThan(directionB.dna.structuralCreativity);
    expect(directionC.layoutFamily).toBeTruthy();
    expect(directionC.primaryGrammarId).toBeTruthy();

    // Verify all 3 directions are meaningfully different
    expect(directionA.name).not.toBe(directionB.name);
    expect(directionB.name).not.toBe(directionC.name);
    expect(directionA.layoutFamily).not.toBe(directionC.layoutFamily);
  });
});
