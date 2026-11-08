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

  it('does not promote one generic evidence cue to a product archetype', () => {
    expect(detectProductArchetypes('A general app for tracking evidence in a review queue.')[0]?.tag).toBe('saas');
    expect(detectProductArchetypes('A trip planner that keeps evidence for each booking.')[0]?.tag).toBe('travel');
  });

  it('interprets marine fieldwork as a mobile survey and evidence workflow', () => {
    const interpreted = interpretProductBrief({
      description:
        'A marine biology field atlas for 12 survey crews: offline transects, species evidence, permit workflows, and a calm review queue.',
    });
    const productModel = interpreted.productModel;
    const serialized = JSON.stringify(productModel).toLowerCase();
    const screens = productModel.likelyScreens.map((screen) => screen.name);

    expect(productModel.productArchetypes[0]?.tag).toBe('intelligence-research');
    expect(productModel.primaryAudience).toContain('Marine biologists');
    expect(productModel.mobileImportance).toBe(95);
    expect(productModel.entities.map((entity) => entity.name)).toEqual([
      'Species',
      'Survey',
      'Observation',
      'Permit',
    ]);
    expect(screens).toEqual([
      'Survey Overview',
      'Field Survey',
      'Observation Review',
      'Permits & Protocols',
    ]);
    expect(serialized).toContain('offline-field-capture');
    expect(serialized).not.toContain('millions of verified profiles');
    expect(serialized).not.toContain('automated monitoring triggers');
  });

  it('specializes a bicycle repair co-op into consent-aware service operations', () => {
    const interpreted = interpretProductBrief({
      description:
        'A neighborhood bicycle repair co-op for eight mechanics and two front-desk volunteers: same-day intake, safety triage for brakes and steering, parts availability, consented repair estimates, and pickup readiness. The shared workbench runs on a counter tablet and desktop. Do not handle payments.',
    });
    const productModel = interpreted.productModel;

    expect(productModel.productArchetypes[0]?.tag).toBe('erp-operations');
    expect(interpreted.inferredAssumptions[0]).toBe(
      'Your brief points to: Bicycle Repair Operations.'
    );
    expect(productModel.primaryAudience).toContain('bicycle repair co-ops');
    expect(productModel.mobileImportance).toBe(92);
    expect(productModel.entities.map((entity) => entity.name)).toEqual([
      'RepairJob',
      'Inspection',
      'Part',
    ]);
    expect(productModel.likelyScreens.map((screen) => screen.name)).toEqual([
      'Service Desk',
      'Repair Intake',
      'Safety Inspection',
      'Parts & Estimates',
      'Pickup & Handover',
    ]);
    expect(productModel.jobsToBeDone).toEqual([
      'Check in a bicycle and record the rider-reported issue',
      'Inspect brake and steering safety before assigning repair work',
      'Confirm estimate consent, check parts, and assign a mechanic',
      'Verify completed safety checks and prepare a bicycle for pickup',
    ]);
    expect(interpreted.inferredAssumptions).not.toContain(
      'Payment and purchase steps need clear confirmation.'
    );
  });

  it('does not infer payment activity from an explicit exclusion', () => {
    const excluded = interpretProductBrief({
      description: 'A repair intake tool for a bicycle workshop. Do not handle payments.',
    });
    const explicit = interpretProductBrief({
      description: 'A bicycle repair service with payment processing and checkout.',
    });

    expect(excluded.inferredAssumptions).not.toContain(
      'Payment and purchase steps need clear confirmation.'
    );
    expect(explicit.inferredAssumptions).toContain(
      'Payment and purchase steps need clear confirmation.'
    );
  });

  it('specializes adult language learning without classroom or pressure-based defaults', () => {
    const interpreted = interpretProductBrief({
      description:
        'An offline-first Spanish learning app for adults with dyslexia who study in 10-minute sessions. Include clear progress, adjustable text spacing, audio pronunciation, short speaking practice, and downloadable lessons for commutes with no mobile signal.',
    });
    const productModel = interpreted.productModel;
    const serialized = JSON.stringify(productModel).toLowerCase();

    expect(productModel.productArchetypes[0]?.tag).toBe('education');
    expect(interpreted.inferredAssumptions[0]).toBe('Your brief points to: Language Learning.');
    expect(productModel.primaryAudience).toContain('dyslexia-friendly reading controls');
    expect(productModel.mobileImportance).toBe(100);
    expect(productModel.entities.map((entity) => entity.name)).toEqual([
      'Language Course',
      'Learning Unit',
      'Vocabulary Item',
      'Practice Attempt',
    ]);
    expect(productModel.likelyScreens.map((screen) => screen.name)).toEqual([
      'Today',
      'Practice Session',
      'Vocabulary Review',
      'Offline Library',
    ]);
    expect(productModel.jobsToBeDone).toEqual([
      'Start a short Spanish practice session',
      'Download selected lessons before a commute without mobile signal',
      'Review vocabulary with adjustable reading and audio controls',
    ]);
    expect(serialized).toContain('downloadable-offline-lessons');
    expect(serialized).toContain('dyslexia-friendly-text-controls');
    expect(serialized).not.toMatch(/gradebook|essays|claim xp|certification catalog/);
  });

  it('keeps general language learning within the broad education archetype', () => {
    const { inferredAssumptions, productModel } = interpretProductBrief({
      description:
        'A language-learning app guides learners through vocabulary practice, listening lessons, and spaced review sessions.',
    });

    expect(inferredAssumptions[0]).toBe('Your brief points to: Education Product.');
    expect(productModel.likelyScreens.map((screen) => screen.name)).toEqual([
      'Learning Path',
      'Lesson Classroom',
      'Course Catalog',
    ]);
  });

  it('marks unsupported language-learning controls as missing screen roles', () => {
    const { productModel } = interpretProductBrief({
      description:
        'An offline-first Spanish learning app for adults with dyslexia who study in 10-minute sessions. Include clear progress, adjustable text spacing, audio pronunciation, short speaking practice, and downloadable lessons for commutes with no mobile signal.',
    });
    const screens = planScreenGraph(productModel).screenGraph.groups.flatMap((group) => group.screens);

    expect(screens.find((screen) => screen.name === 'Today')?.requiredRoles).toEqual([
      'overview-header',
      'language-progress-summary',
      'activity-feed',
    ]);
    expect(screens.find((screen) => screen.name === 'Practice Session')?.requiredRoles).toEqual([
      'overview-header',
      'pronunciation-audio',
      'speaking-practice',
      'dyslexia-friendly-reading-controls',
    ]);
    expect(screens.find((screen) => screen.name === 'Vocabulary Review')?.requiredRoles).toContain(
      'vocabulary-review'
    );
    expect(screens.find((screen) => screen.name === 'Offline Library')?.requiredRoles).toContain(
      'offline-lesson-downloads'
    );
  });

  it('marks unsupported bicycle safety, estimate, and pickup controls as missing screen roles', () => {
    const { productModel } = interpretProductBrief({
      description:
        'A neighborhood bicycle repair co-op for mechanics: safety triage for brakes and steering, parts availability, consented repair estimates, and pickup readiness. Do not handle payments.',
    });
    const screens = planScreenGraph(productModel).screenGraph.groups.flatMap((group) => group.screens);

    expect(screens.find((screen) => screen.name === 'Service Desk')?.requiredRoles).toEqual([
      'overview-header',
      'safety-triage-queue',
      'priority-alerts',
    ]);
    expect(screens.find((screen) => screen.name === 'Repair Intake')?.requiredRoles).toEqual([
      'entity-header',
      'repair-intake-form',
      'reported-issue-capture',
    ]);
    expect(screens.find((screen) => screen.name === 'Safety Inspection')?.requiredRoles).toEqual([
      'entity-header',
      'brake-steering-checklist',
      'inspection-evidence',
    ]);
    expect(screens.find((screen) => screen.name === 'Parts & Estimates')?.requiredRoles).toEqual([
      'index-header',
      'parts-availability',
      'consented-repair-estimate',
    ]);
    expect(screens.find((screen) => screen.name === 'Pickup & Handover')?.requiredRoles).toEqual([
      'entity-header',
      'safety-signoff',
      'pickup-readiness',
    ]);
  });

  it('keeps employee experience separate from hiring while respecting explicit overrides', () => {
    const employeeMatches = detectProductArchetypes(
      'Employee experience platform for colleagues, teams, onboarding and workplace policies.'
    );
    const hiringMatches = detectProductArchetypes(
      'Applicant tracking platform for recruiters to manage candidates and interview panels.'
    );
    const overriddenMatches = detectProductArchetypes(
      'Employee experience platform for colleagues and teams.',
      'recruitment'
    );
    const overriddenInterpretation = interpretProductBrief({
      description: 'Employee experience platform for colleagues and teams.',
      archetypeOverride: 'recruitment',
    });

    expect(employeeMatches).toEqual([{ tag: 'saas', weight: 100 }]);
    expect(hiringMatches[0]?.tag).toBe('recruitment');
    expect(overriddenMatches[0]?.tag).toBe('recruitment');
    expect(overriddenInterpretation.productModel.productArchetypes[0]?.tag).toBe('recruitment');
    expect(overriddenInterpretation.initialDesignDna.primaryArchetype).toBe('recruitment');
    expect(overriddenInterpretation.inferredAssumptions[0]).toContain(
      'Recruitment & People Operations'
    );
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
