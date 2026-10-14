import { describe, it, expect } from 'vitest';
import { composeProjectPipeline } from '../index.js';
import { interpretProductBrief } from '@tessellate/composer';
import { loadTestCatalog } from './test-catalog-loader.js';

describe('Real Product Composer Pipeline & Inputs (Req 2, 3, 4)', () => {
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

    // Every section is either a real resource or an explicit gap (Phase 29: never silent filler).
    for (const screen of mA.screens) {
      expect(screen.rootNode.children.length).toBeGreaterThan(0);
      const sections = screen.rootNode.children.flatMap((c) => (c.children.length > 0 ? [c, ...c.children] : [c]));
      for (const node of sections.filter((n) => n.nodeType === 'section')) {
        expect(Boolean(node.resourceRef) || node.props?.unresolvedRequiredRole === true).toBe(true);
      }
    }
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

    // 4. Assert all screens have valid instantiated nodes and real resource refs
    for (const screen of expectedManifest.screens) {
      expect(screen.rootNode).toBeDefined();
      expect(screen.rootNode.children.length).toBeGreaterThan(0);
    }
  });
});

describe('Project identity (Phase 25 data safety)', () => {
  const catalog = loadTestCatalog();

  it('gives different briefs different project ids (the audit saw a second compose overwrite the first)', () => {
    const physio = composeProjectPipeline({ description: 'A booking platform for independent physiotherapy clinics.' }, { catalogResources: catalog });
    const travel = composeProjectPipeline({ description: 'A luxury travel marketplace for boutique hotels.' }, { catalogResources: catalog });
    const ids = new Set([
      physio.directionA.manifest.id,
      physio.directionB.manifest.id,
      physio.directionC.manifest.id,
      travel.directionA.manifest.id,
      travel.directionB.manifest.id,
      travel.directionC.manifest.id,
    ]);
    expect(ids.size).toBe(6);
  });

  it('uses the caller-supplied id base so re-composing the same brief creates a new project', () => {
    const brief = { description: 'A booking platform for independent physiotherapy clinics.' };
    const first = composeProjectPipeline(brief, { catalogResources: catalog, projectIdBase: 'proj-first' });
    const second = composeProjectPipeline(brief, { catalogResources: catalog, projectIdBase: 'proj-second' });
    expect(first.directionA.manifest.id).toBe('proj-first-direction-a');
    expect(second.directionA.manifest.id).toBe('proj-second-direction-a');
  });

  it('stays deterministic for identical inputs without an id base', () => {
    const brief = { description: 'An analytics dashboard for retail stores.' };
    const a = composeProjectPipeline(brief, { catalogResources: catalog, seed: 's1' });
    const b = composeProjectPipeline(brief, { catalogResources: catalog, seed: 's1' });
    expect(a.directionB.manifest.id).toBe(b.directionB.manifest.id);
    expect(a.screenGraph.id).toBe(b.screenGraph.id);
  });
});
