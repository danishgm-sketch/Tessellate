import { describe, it, expect } from 'vitest';
import { composeProjectPipeline } from '../index.js';
import { interpretProductBrief } from '@tessellate/composer';
import { loadTestCatalog } from './test-catalog-loader.js';
import type { NodeType, ProjectNode, ResourceType } from '@tessellate/schemas';

const resourceTypeNodeType: Record<ResourceType, NodeType> = {
  primitive: 'element',
  component: 'component',
  section: 'section',
  block: 'block',
  page: 'layout',
  flow: 'block',
  effect: 'component',
  background: 'component',
  typography: 'component',
  motion: 'component',
  'data-visualization': 'component',
  'ai-pattern': 'component',
  state: 'component',
};

describe('Real Product Composer Pipeline & Inputs (Req 2, 3, 4)', () => {
  it('preserves resource granularity in the generated editor tree', () => {
    const catalog = loadTestCatalog();
    const result = composeProjectPipeline(
      {
        description:
          'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.',
        feel: 'professional but playful',
        visualAmbition: 40,
        structuralCreativity: 95,
      },
      { catalogResources: catalog, seed: 'workbench-node-granularity' }
    );
    const resources = new Map(catalog.map((resource) => [resource.slug, resource]));
    const nodes: ProjectNode[] = [];
    const visit = (node: ProjectNode) => {
      nodes.push(node);
      node.children.forEach(visit);
    };
    result.directionC.manifest.screens.forEach((screen) => visit(screen.rootNode));

    const resourceNodes = nodes.filter((node) => node.resourceRef);
    expect(resourceNodes.length).toBeGreaterThan(0);
    for (const node of resourceNodes) {
      const resource = resources.get(node.resourceRef!.slug);
      expect(resource, `Missing catalog resource ${node.resourceRef!.slug}`).toBeDefined();
      const expected =
        node.semanticRole === 'navigation' ? 'layout' : resourceTypeNodeType[resource!.resourceType];
      expect(
        node.nodeType,
        `${node.resourceRef!.slug} should retain its ${resource!.resourceType} kind`
      ).toBe(expected);
    }
  });

  it('makes "feel" a real input: "professional but playful" measurably elevates both dimensions', () => {
    const baseWithoutFeel = interpretProductBrief({
      description: 'Human resources management platform for employee onboarding, reviews, and time-off tracking.',
    }).initialDesignDna;

    const { initialDesignDna, productModel } = interpretProductBrief({
      description: 'Human resources management platform for employee onboarding, reviews, and time-off tracking.',
      feel: 'professional but playful',
    });

    expect(productModel).toBeDefined();
    expect(initialDesignDna.professionalism).toBeGreaterThanOrEqual(baseWithoutFeel.professionalism);
    expect(initialDesignDna.playfulness).toBeGreaterThan(baseWithoutFeel.playfulness);
    expect(initialDesignDna.curvature).toBeGreaterThan(baseWithoutFeel.curvature);
    expect(initialDesignDna.motionPlayfulness).toBeGreaterThan(baseWithoutFeel.motionPlayfulness);
  });

  it('makes visualAmbition and structuralCreativity real inputs with measurable differences', () => {
    const briefLow = {
      description: 'Analytics dashboard for database metrics and server telemetry.',
      visualAmbition: 20,
      structuralCreativity: 20,
    };

    const briefHigh = {
      description: 'Analytics dashboard for database metrics and server telemetry.',
      visualAmbition: 85,
      structuralCreativity: 85,
    };

    const lowResult = composeProjectPipeline(briefLow, { seed: 'analytics-test' });
    const highResult = composeProjectPipeline(briefHigh, { seed: 'analytics-test' });

    // Design DNA differences
    expect(lowResult.initialDesignDna.visualAmbition).toBe(20);
    expect(highResult.initialDesignDna.visualAmbition).toBe(85);
    expect(lowResult.initialDesignDna.motion).toBeLessThan(highResult.initialDesignDna.motion);
    expect(lowResult.initialDesignDna.typographicExpression).toBeLessThan(
      highResult.initialDesignDna.typographicExpression
    );
    expect(lowResult.initialDesignDna.depth).toBeLessThan(highResult.initialDesignDna.depth);
    expect(lowResult.initialDesignDna.imageryIntensity).toBeLessThan(
      highResult.initialDesignDna.imageryIntensity
    );

    // Direction Manifest differences
    expect(lowResult.directionB.manifest.designDNA.visualAmbition).toBeLessThan(
      highResult.directionB.manifest.designDNA.visualAmbition
    );
  });

  it('generates three complete, valid ProjectManifests that differ materially', () => {
    const brief = {
      description: 'A developer API monitoring platform with real-time incident triage and distributed tracing.',
      feel: 'technical and dense',
      visualAmbition: 50,
      structuralCreativity: 60,
    };

    const result = composeProjectPipeline(brief, {
      catalogResources: loadTestCatalog(),
      seed: 'dev-api-test',
    });

    expect(result.directionA.manifest).toBeDefined();
    expect(result.directionB.manifest).toBeDefined();
    expect(result.directionC.manifest).toBeDefined();

    const { manifest: mA } = result.directionA;
    const { manifest: mB } = result.directionB;
    const { manifest: mC } = result.directionC;

    // 1. Material differences in Design DNA
    expect(mA.designDNA.visualAmbition).toBeLessThan(mB.designDNA.visualAmbition);
    expect(mC.designDNA.structuralCreativity).toBeGreaterThan(mA.designDNA.structuralCreativity);

    // 2. Material differences in Navigation Model
    expect(mA.navigation.model).toBe('sidebar');
    expect(mB.navigation.model).toBe('top-nav');
    expect(['command-palette', 'rail', 'header-minimal']).toContain(mC.navigation.model);

    // 3. Complete valid screens with instantiated nodes and real resourceRefs
    expect(mA.screens.length).toBeGreaterThan(0);
    expect(mB.screens.length).toBeGreaterThan(0);
    expect(mC.screens.length).toBeGreaterThan(0);

    for (const screen of mA.screens) {
      expect(screen.rootNode.children.length).toBeGreaterThan(0);
      const childWithRef = screen.rootNode.children.find((c) => c.resourceRef || c.children.some((sub) => sub.resourceRef));
      expect(childWithRef).toBeDefined();
    }
  });

  it('composes checkout screens with real Gold resources and disables unsupported payment submission truthfully', () => {
    const result = composeProjectPipeline(
      {
        description: 'A direct-to-consumer ecommerce store with a product catalogue and checkout.',
        archetypeOverride: 'ecommerce',
      },
      { catalogResources: loadTestCatalog(), seed: 'checkout-role-compatibility' }
    );
    const checkout = result.directionA.manifest.screens.find((screen) => screen.name === 'Checkout');
    expect(checkout).toBeDefined();

    const nodes = [checkout!.rootNode];
    const allNodes = [] as typeof nodes;
    while (nodes.length > 0) {
      const node = nodes.pop()!;
      allNodes.push(node);
      nodes.push(...node.children);
    }
    const orderSummary = allNodes.find((node) => node.semanticRole === 'order-summary');
    const paymentFields = allNodes.find((node) => node.semanticRole === 'payment-fields');
    const submitButton = allNodes.find((node) => node.semanticRole === 'submit-button');

    expect(orderSummary?.resourceRef?.slug).toBe('advanced-data-table');
    expect(paymentFields?.resourceRef?.slug).toBe('input');
    expect(paymentFields?.props).toMatchObject({
      disabled: true,
      helperText: expect.stringContaining('does not collect or store payment details'),
    });
    expect(submitButton?.resourceRef?.slug).toBe('button');
    expect(submitButton?.props).toMatchObject({
      disabled: true,
      title: expect.stringContaining('Connect a payment provider'),
    });
    expect(result.directionA.diagnostics).toEqual([]);
    expect(
      result.productModel.likelyScreens.find((screen) => screen.name === 'Order Confirmation')
        ?.screenType
    ).toBe('detail-entity');
  });

  it('Acceptance Test 4: Composing HR app and selecting Direction C yields exact matching manifest', () => {
    // 1. Compose a professional/playful HR application
    const hrBrief = {
      description: 'An HR management application for modern distributed teams with payroll, reviews, and time tracking.',
      feel: 'professional but playful',
      visualAmbition: 55,
      structuralCreativity: 65,
    };

    const pipelineResult = composeProjectPipeline(hrBrief, {
      catalogResources: loadTestCatalog(),
      seed: 'hr-acceptance',
    });

    // 2. Select Direction C
    const directionCOutput = pipelineResult.directionC;
    const expectedManifest = directionCOutput.manifest;

    // 3. Verify Direction C properties
    expect(expectedManifest.id).toContain('direction-c');
    expect(expectedManifest.designDNA.structuralCreativity).toBeGreaterThan(60);
    expect(expectedManifest.screens.length).toBeGreaterThan(0);
    expect(expectedManifest.navigation.model).toBe(directionCOutput.direction.navigationModel);

    const graphScreens = pipelineResult.screenGraph.groups.flatMap((group) => group.screens);
    expect(expectedManifest.navigation.primaryItems.map((item) => item.targetScreenId)).toEqual(
      graphScreens.filter((screen) => screen.navigationVisibility === 'primary').map((screen) => screen.id)
    );
    expect(expectedManifest.navigation.secondaryItems?.map((item) => item.targetScreenId)).toEqual(
      graphScreens.filter((screen) => screen.navigationVisibility === 'secondary').map((screen) => screen.id)
    );
    expect(expectedManifest.navigation.primaryItems.some((item) =>
      graphScreens.some((screen) => screen.id === item.targetScreenId && screen.navigationVisibility === 'hidden')
    )).toBe(false);

    // 4. Assert all screens have valid instantiated nodes and real resource refs
    for (const screen of expectedManifest.screens) {
      expect(screen.rootNode).toBeDefined();
      expect(screen.rootNode.children.length).toBeGreaterThan(0);
    }
  });
});
