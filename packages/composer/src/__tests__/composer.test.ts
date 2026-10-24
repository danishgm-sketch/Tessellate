import { describe, it, expect } from 'vitest';
import { ProductModelSchema, ScreenGraphSchema } from '@tessellate/schemas';
import {
  PRODUCT_ARCHETYPES,
  detectProductArchetypes,
  getAllProductArchetypes,
  PRODUCT_BLUEPRINTS,
  getAllProductBlueprints,
  SCREEN_CLASS_GRAMMARS,
  getAllScreenClassGrammars,
  interpretProductBrief,
  planScreenGraph,
  GOLDEN_PRODUCT_BRIEFS,
  getGoldenBrief,
  getAllGoldenBriefs,
} from '../index.js';

describe('Product Archetypes (18 Categories)', () => {
  it('defines all 18 product archetypes', () => {
    const list = getAllProductArchetypes();
    expect(list.length).toBe(18);
    expect(Object.keys(PRODUCT_ARCHETYPES).length).toBe(18);

    for (const arch of list) {
      expect(arch.id).toBeTruthy();
      expect(arch.name).toBeTruthy();
      expect(arch.keywords.length).toBeGreaterThan(0);
      expect(arch.defaultEntities.length).toBeGreaterThan(0);
      expect(arch.defaultWorkflows.length).toBeGreaterThan(0);
      expect(arch.recommendedScreens.length).toBeGreaterThan(0);
    }
  });

  it('detectProductArchetypes correctly classifies domain vocabulary', () => {
    const aiMatches = detectProductArchetypes('an intelligent agent assistant running prompt completions');
    expect(aiMatches[0]?.tag).toBe('ai');

    const devMatches = detectProductArchetypes('cli tool for monitoring kubernetes infrastructure and error logs');
    expect(devMatches[0]?.tag).toBe('developer-tools');

    const fintechMatches = detectProductArchetypes('treasury banking and wire transfer ledger with instant settlement');
    expect(fintechMatches[0]?.tag).toBe('fintech');
  });
});

describe('Product Blueprints (12 Blueprints)', () => {
  it('defines all 12 canonical product blueprints', () => {
    const list = getAllProductBlueprints();
    expect(list.length).toBe(12);
    expect(Object.keys(PRODUCT_BLUEPRINTS).length).toBe(12);

    for (const bp of list) {
      expect(bp.id).toBeTruthy();
      expect(bp.name).toBeTruthy();
      expect(bp.applicableDnaPresets.length).toBeGreaterThanOrEqual(3);
      expect(bp.requiredPageClasses.length).toBeGreaterThan(0);
      expect(bp.antiPatterns.length).toBeGreaterThan(0);
    }
  });
});

describe('Screen Class Grammars (16 Classes)', () => {
  it('defines all 16 screen class grammars', () => {
    const grammars = getAllScreenClassGrammars();
    expect(Object.keys(grammars).length).toBe(16);
    expect(Object.keys(SCREEN_CLASS_GRAMMARS).length).toBe(16);

    for (const [key, grammar] of Object.entries(grammars)) {
      expect(grammar.id).toBe(key);
      expect(grammar.requiredRoles.length).toBeGreaterThan(0);
      expect(grammar.optionalRoles.length).toBeGreaterThan(0);
      expect(grammar.roleOrdering.length).toBeGreaterThan(0);
    }
  });
});

describe('Phase 6 Gate: Six Golden Product Briefs', () => {
  it('has all 6 golden product briefs from spec', () => {
    const briefs = getAllGoldenBriefs();
    expect(briefs.length).toBe(6);
  });

  for (const brief of GOLDEN_PRODUCT_BRIEFS) {
    it(`Golden Brief "${brief.title}" produces validated ProductModel and ScreenGraph without AI`, () => {
      const { productModel, inferredAssumptions } = interpretProductBrief(brief.input);

      // Validate against canonical ProductModelSchema
      expect(() => ProductModelSchema.parse(productModel)).not.toThrow();

      // Check expected primary archetype
      expect(productModel.productArchetypes[0]?.tag).toBe(brief.expectedPrimaryArchetype);

      // Check metric priors
      if (brief.expectedPriors.minTrustRequirement) {
        expect(productModel.trustRequirement).toBeGreaterThanOrEqual(brief.expectedPriors.minTrustRequirement);
      }
      if (brief.expectedPriors.minDataDensity) {
        expect(productModel.dataDensity).toBeGreaterThanOrEqual(brief.expectedPriors.minDataDensity);
      }
      if (brief.expectedPriors.minSophistication) {
        expect(productModel.userSophistication).toBeGreaterThanOrEqual(brief.expectedPriors.minSophistication);
      }

      // Inferred assumptions must be transparently surfaced
      expect(inferredAssumptions.length).toBeGreaterThan(0);

      // Plan ScreenGraph
      const plan = planScreenGraph(productModel);
      expect(() => ScreenGraphSchema.parse(plan.screenGraph)).not.toThrow();
      expect(plan.totalScreens).toBeGreaterThanOrEqual(3);
      expect(plan.requiredScreensCount).toBeGreaterThan(0);

      // Expected screens check
      const screenIds = plan.screenGraph.groups.flatMap((g) => g.screens.map((s) => s.id));
      for (const expectedId of brief.expectedScreens) {
        expect(screenIds).toContain(expectedId);
      }
    });
  }
});

describe('Required / Optional Screen Rules & Edge Routing', () => {
  it('omits billing screen when product intent is non-commercial', () => {
    const brief = getGoldenBrief('scientific-research-environment');
    expect(brief).toBeDefined();

    const { productModel, inferredAssumptions } = interpretProductBrief(brief!.input);
    expect(inferredAssumptions.length).toBeGreaterThan(0);
    const plan = planScreenGraph(productModel);

    const screenIds = plan.screenGraph.groups.flatMap((g) => g.screens.map((s) => s.id));
    expect(screenIds).not.toContain('screen-billing');
    expect(plan.inferredAssumptions.some((a) => a.includes('Billing omitted because'))).toBe(true);
  });

  it('adds a billing screen only when the brief explicitly describes product monetization', () => {
    const brief = getGoldenBrief('financial-intelligence-terminal');
    expect(brief).toBeDefined();

    const { productModel } = interpretProductBrief(brief!.input);
    const plan = planScreenGraph(productModel);

    const screenIds = plan.screenGraph.groups.flatMap((g) => g.screens.map((s) => s.id));
    expect(screenIds).not.toContain('screen-billing');

    const paidWorkspace = interpretProductBrief({
      description: 'A B2B SaaS workspace for collaborative product teams.',
      objective: 'Manage paid subscriptions, plans and downloadable invoices.',
    });
    const paidScreenIds = planScreenGraph(paidWorkspace.productModel).screenGraph.groups
      .flatMap((group) => group.screens.map((screen) => screen.id));
    expect(paidScreenIds).toContain('screen-billing');
  });

  it('respects forbiddenScreens constraints strictly', () => {
    const { productModel } = interpretProductBrief({
      description: 'Simple B2B SaaS platform for teams',
      forbiddenScreens: ['settings', 'sign-in'],
    });

    const plan = planScreenGraph(productModel);
    const screenIds = plan.screenGraph.groups.flatMap((g) => g.screens.map((s) => s.id));
    expect(screenIds).not.toContain('screen-settings');
    expect(screenIds).not.toContain('screen-sign-in');
    for (const edge of plan.screenGraph.edges) {
      expect(screenIds).toContain(edge.fromScreenId);
      expect(screenIds).toContain(edge.toScreenId);
    }
  });
});
