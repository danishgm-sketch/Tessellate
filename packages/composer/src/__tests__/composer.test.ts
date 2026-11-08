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

  it('treats explicitly excluded domain cues as negative evidence', () => {
    const mealPlannerMatches = detectProductArchetypes(
      'A mobile-first meal-planning app for busy households. Plan weeknight dinners, shopping lists, and pantry freshness. No bank accounts, payments, transfers, transaction history, bill pay, or financial dashboards.'
    );
    expect(mealPlannerMatches[0]?.tag).toBe('productivity');
    expect(mealPlannerMatches.some(({ tag }) => tag === 'fintech')).toBe(false);

    const mixedIntentMatches = detectProductArchetypes(
      'A fintech treasury platform transfers funds between business bank accounts. No ecommerce checkout. It also supports corporate card payments.'
    );
    expect(mixedIntentMatches[0]?.tag).toBe('fintech');
    expect(mixedIntentMatches.some(({ tag }) => tag === 'ecommerce')).toBe(false);
  });

  it('does not treat not-only or quantified-limit phrases as negated domain evidence', () => {
    expect(detectProductArchetypes('Not only a fintech wallet but also an expense app for card payments.')[0]?.tag).toBe('fintech');
    expect(detectProductArchetypes('A fintech trading account that executes no more than 50 transfers each day.')[0]?.tag).toBe('fintech');
  });

  it('does not promote one generic evidence cue to a product archetype', () => {
    expect(detectProductArchetypes('A general app for tracking evidence in a review queue.')[0]?.tag).toBe('saas');
    expect(detectProductArchetypes('A trip planner that keeps evidence for each booking.')[0]?.tag).toBe('travel');
  });

  it('does not confuse plural verbs with ecommerce or generic rentals with SaaS', () => {
    expect(
      detectProductArchetypes(
        'A reading organizer stores saved articles, groups them into lists, and helps a reader resume where they stopped.'
      )[0]?.tag
    ).toBe('productivity');
    expect(
      detectProductArchetypes(
        'A rental platform helps tenants inspect apartment details, check lease terms, ask a property manager questions, and request a tour.'
      )[0]?.tag
    ).toBe('real-estate');
  });

  it('classifies a public library service without treating lending as commerce', () => {
    const brief =
      'A mobile-first public library service for rural towns. Residents search the shared book catalogue, reserve books for branch pickup, join reading circles, and find local author events. Volunteers coordinate opening hours and hold queues across three branches. Make browsing work on weak connections, provide large text and screen-reader friendly controls, and keep member reading history private. No book sales, purchases, payments, bank accounts, bill pay, or financial dashboards.';

    const matches = detectProductArchetypes(brief);
    expect(matches[0]?.tag).toBe('media');
    expect(matches.some(({ tag }) => tag === 'ecommerce' || tag === 'fintech')).toBe(false);

    const { productModel } = interpretProductBrief({ description: brief });
    expect(productModel.primaryAudience.toLowerCase()).toContain('library members');
    expect(productModel.primaryObjective.toLowerCase()).toContain('reserve titles');
    expect(productModel.entities.map(({ name }) => name)).toEqual([
      'BookRecord',
      'HoldRequest',
      'LibraryBranch',
      'LibraryProgramme',
    ]);
    expect(productModel.workflows.map(({ id }) => id)).toEqual([
      'discover-library-items',
      'coordinate-private-holds',
      'find-reading-programmes',
      'set-reading-accessibility',
    ]);
    expect(productModel.likelyScreens.map(({ name }) => name)).toEqual([
      'Catalogue & Branch Availability',
      'Holds & Pickup',
      'Reading Circles & Events',
      'Accessibility & Privacy',
    ]);
    const screenGraph = planScreenGraph(productModel).screenGraph;
    const rolesByScreen = new Map(
      screenGraph.groups.flatMap((group) =>
        group.screens.map((screen) => [screen.name, screen.requiredRoles] as const)
      )
    );
    expect(rolesByScreen.get('Catalogue & Branch Availability')).toEqual(
      expect.arrayContaining([
        'book-catalogue-search',
        'branch-availability-and-hours',
        'low-bandwidth-catalogue-browsing',
      ])
    );
    expect(rolesByScreen.get('Holds & Pickup')).toEqual(
      expect.arrayContaining(['private-hold-requests', 'branch-pickup-windows'])
    );
    expect(rolesByScreen.get('Reading Circles & Events')).toContain(
      'reading-circle-and-event-discovery'
    );
    expect(rolesByScreen.get('Accessibility & Privacy')).toEqual(
      expect.arrayContaining(['accessible-reading-controls', 'private-reading-history'])
    );
    expect(productModel.trustRequirement).toBe(96);
    expect(productModel.transactionCriticality).toBe(18);
    expect(productModel.mobileImportance).toBe(100);
    expect(JSON.stringify(productModel).toLowerCase()).not.toMatch(
      /account balances|transaction history|money movement|purchase-item|checkout|payment-complete/
    );
  });

  it('does not specialize software client libraries as public library services', () => {
    const brief =
      'A developer portal publishes a client library release with version notes, API examples, and installation instructions.';
    const result = interpretProductBrief({ description: brief });
    expect(result.productModel.productArchetypes[0]?.tag).toBe('developer-tools');
    expect(result.productModel.likelyScreens.map(({ name }) => name)).not.toContain(
      'Catalogue & Branch Availability'
    );
  });

  it('specializes household meal planning without inventing financial operations', () => {
    const interpreted = interpretProductBrief({
      description:
        'A mobile-first meal-planning app for busy households of 2–5 people. Plan five weeknight dinners from dietary preferences and pantry ingredients, create consolidated shopping lists, let adult household members suggest and vote on meals, track pantry freshness, and set optional weekly grocery budgets. No bank accounts, payments, transfers, transaction history, bill pay, or financial dashboards. Lists must work offline in a grocery store and sync across adults. Recipes need editable portions, clear allergen labels, and large-text controls; adults manage household membership.',
    });
    const { productModel } = interpreted;

    expect(productModel.productArchetypes[0]?.tag).toBe('productivity');
    expect(productModel.primaryAudience).toContain('Adults planning meals');
    expect(productModel.primaryObjective).toContain('consolidated grocery list usable offline');
    expect(productModel.entities.map((entity) => entity.name)).toEqual([
      'WeeklyMealPlan',
      'Recipe',
      'PantryItem',
      'ShoppingList',
      'MealSuggestion',
    ]);
    expect(productModel.workflows.map((workflow) => workflow.id)).toEqual([
      'plan-weeknight-meals',
      'build-shopping-list',
      'coordinate-meal-suggestions',
      'track-pantry-freshness',
    ]);
    expect(productModel.likelyScreens.map((screen) => screen.name)).toEqual([
      'Weekly Meal Plan',
      'Recipes & Dietary Needs',
      'Shopping List & Pantry',
    ]);
    expect(productModel.jobsToBeDone).toEqual(productModel.workflows.map((workflow) => workflow.name));
    expect(productModel.trustRequirement).toBe(88);
    expect(productModel.transactionCriticality).toBe(30);
    expect(productModel.mobileImportance).toBe(100);
    expect(interpreted.inferredAssumptions).not.toContain(
      'The brief calls for strong trust and compliance cues.'
    );
    expect(productModel.workflows.map((workflow) => workflow.id)).not.toContain('transfer-funds');
    expect(productModel.likelyScreens.map((screen) => screen.name)).not.toContain('Transaction History');
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

  it('specializes community food pantries without importing finance or sensitive intake fields', () => {
    const description =
      'An appointment and fulfilment tool for a volunteer-led community food pantry serving 300 households each week. Households choose weekly grocery packs; staff coordinate same-day emergency parcels, chilled stock and expiry dates, multilingual plain-language pickup instructions, and a waitlist. Volunteers use shared tablets, coordinators use desktop, and intake often happens on an unreliable connection. Collect only a household’s chosen name and pickup essentials: do not request proof of immigration, income, medical diagnosis, or payment. Allergy details are visible only to assigned food-safety coordinators; volunteers see a neutral packing alert, not private notes. Provide a separate safeguarding escalation route without exposing case notes. No payments or donations.';
    const interpreted = interpretProductBrief({ description });
    const productModel = interpreted.productModel;
    const screens = planScreenGraph(productModel).screenGraph.groups.flatMap((group) => group.screens);
    const businessModelText = JSON.stringify({
      audience: productModel.primaryAudience,
      objective: productModel.primaryObjective,
      entities: productModel.entities,
      workflows: productModel.workflows,
      screens: productModel.likelyScreens,
    }).toLowerCase();

    expect(productModel.productArchetypes).toEqual([{ tag: 'erp-operations', weight: 100 }]);
    expect(interpreted.inferredAssumptions[0]).toBe(
      'Your brief points to: Community Food Pantry Operations.'
    );
    expect(productModel.primaryAudience).toContain('pantry volunteers');
    expect(productModel.mobileImportance).toBe(96);
    expect(productModel.entities.map((entity) => entity.name)).toEqual([
      'Household Pickup',
      'Pack Selection',
      'Stock Lot',
      'Restricted Safety Route',
    ]);
    expect(productModel.entities[0]?.fields).toEqual([
      'id',
      'chosenName',
      'pickupEssentials',
      'packSelection',
      'pickupStatus',
    ]);
    expect(productModel.likelyScreens.map((screen) => screen.name)).toEqual([
      'Pickup Schedule & Waitlist',
      'Household Intake & Pickup',
      'Weekly Pack Choices',
      'Emergency Parcels',
      'Stock & Expiry',
      'Food Safety & Safeguarding',
    ]);
    expect(productModel.workflows.map((workflow) => workflow.id)).toEqual([
      'schedule-pantry-pickups',
      'select-weekly-pack',
      'prepare-emergency-parcel',
      'rotate-chilled-stock',
      'route-restricted-safety-concern',
    ]);
    expect(productModel.requiredCapabilities).toEqual(
      expect.arrayContaining([
        'minimal-household-data-intake',
        'offline-intake-continuity',
        'multilingual-pickup-instructions',
        'coordinator-restricted-allergy-details',
        'private-safeguarding-route',
      ])
    );
    expect(screens.find((screen) => screen.name === 'Household Intake & Pickup')?.requiredRoles).toEqual([
      'entity-header',
      'minimal-household-intake',
      'chosen-name-only',
      'offline-intake-continuity',
      'multilingual-pickup-instructions',
    ]);
    expect(screens.find((screen) => screen.name === 'Food Safety & Safeguarding')?.requiredRoles).toEqual([
      'entity-header',
      'assigned-coordinator-allergy-details',
      'neutral-volunteer-alert',
      'private-safeguarding-route',
      'case-note-confidentiality',
    ]);
    expect(businessModelText).not.toMatch(/bank account|transaction|money movement|income|immigration|diagnosis|case notes/);
    expect(interpreted.inferredAssumptions).not.toContain(
      'Payment and purchase steps need clear confirmation.'
    );

    const generalOperations = interpretProductBrief({
      description: 'An inventory and warehouse operations tool for a small manufacturing team.',
    });
    expect(generalOperations.inferredAssumptions[0]).toBe('Your brief points to: ERP & Operations.');
  });

  it('specializes volunteer emergency coordination without inventing personal or live-dispatch data', () => {
    const description =
      'A volunteer mutual-aid network for a flood-prone coastal town. Coordinate requests for bottled water, charging, blankets, accessible transport, and welfare checks between three shelters and six neighborhood hubs. Needs shared-tablet intake that works during outages, multilingual updates, disability-aware prioritisation, volunteer shift handoffs, and stock visibility. Never collect immigration status, diagnoses, or financial data; no payments or fundraising. Public status should show only aggregated capacity and safe pickup points. Record requests locally for later sync, but do not imply that SMS dispatch, live mapping, or synchronisation works while disconnected.';
    const matches = detectProductArchetypes(description);
    const { productModel, inferredAssumptions } = interpretProductBrief({ description });
    const screens = planScreenGraph(productModel).screenGraph.groups.flatMap((group) => group.screens);

    expect(matches[0]?.tag).toBe('erp-operations');
    expect(productModel.productArchetypes[0]?.tag).toBe('erp-operations');
    expect(inferredAssumptions[0]).toBe(
      'Your brief points to: Community Emergency Response Operations.'
    );
    expect(productModel.primaryAudience).toMatch(/volunteer coordinators/i);
    expect(productModel.primaryObjective).toContain('safe pickup points');
    expect(productModel.mobileImportance).toBe(98);
    expect(productModel.entities.map((entity) => entity.name)).toEqual([
      'ReliefRequest',
      'HubCapacity',
      'SupplyStock',
      'ShiftHandover',
    ]);
    expect(productModel.entities[0]?.fields).toEqual([
      'id',
      'aidType',
      'assignedHubId',
      'manualPriority',
      'status',
    ]);
    expect(productModel.workflows.map((workflow) => workflow.id)).toEqual([
      'review-aid-requests',
      'coordinate-shelter-pickup-capacity',
      'track-relief-supplies',
      'handover-volunteer-shift',
      'publish-aggregated-public-status',
      'reconcile-outage-requests',
    ]);
    expect(productModel.likelyScreens.map((screen) => screen.name)).toEqual([
      'Coordination Overview',
      'Request Intake & Triage',
      'Shelter & Hub Capacity',
      'Supplies & Distribution',
      'Volunteer Shift Handover',
      'Public Capacity Status',
    ]);
    expect(productModel.requiredCapabilities).toEqual(
      expect.arrayContaining([
        'community-emergency-response-workflow',
        'offline-request-capture-and-reconciliation',
        'manual-priority-review',
        'aggregated-public-capacity',
      ])
    );
    expect(screens.find((screen) => screen.name === 'Request Intake & Triage')?.requiredRoles).toEqual([
      'entity-header',
      'settings-form',
      'save-footer',
    ]);
    const intakeScreen = screens.find((screen) => screen.name === 'Request Intake & Triage');
    expect(intakeScreen?.screenType).toBe('workspace-editor');
    expect(intakeScreen?.slug).toBe('/request-intake-and-triage');
    expect(screens.find((screen) => screen.name === 'Public Capacity Status')?.requiredRoles).toEqual([
      'overview-header',
      'metric-cards',
      'activity-feed',
    ]);
    expect(JSON.stringify(productModel.entities).toLowerCase()).not.toMatch(
      /immigration|diagnosis|financial|medical|exact address|phone number/
    );
    expect(inferredAssumptions).not.toContain(
      'Payment and purchase steps need clear confirmation.'
    );

    const routineVolunteerNetwork = interpretProductBrief({
      description:
        'A volunteer network that organizes monthly litter cleanups and neighborhood garden events.',
    });
    expect(routineVolunteerNetwork.inferredAssumptions[0]).not.toBe(
      'Your brief points to: Community Emergency Response Operations.'
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
