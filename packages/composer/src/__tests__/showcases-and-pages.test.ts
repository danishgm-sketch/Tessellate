import { describe, it, expect } from 'vitest';
import { ProjectManifestSchema, ProjectScreenSchema } from '@tessellate/schemas';
import {
  getAllPageCompositions,
  getPageComposition,
  PAGE_COMPOSITIONS,
  getAllShowcaseProjects,
  getShowcaseProject,
  SHOWCASE_PROJECTS,
  PRODUCT_BLUEPRINTS,
} from '../index.js';

describe('Phase 19 — Page Compositions, Blueprints & Showcases', () => {
  it('defines exactly 36 canonical page compositions', () => {
    expect(PAGE_COMPOSITIONS).toHaveLength(36);
    expect(getAllPageCompositions()).toHaveLength(36);

    for (const page of PAGE_COMPOSITIONS) {
      expect(page.id).toBeTruthy();
      expect(page.title).toBeTruthy();
      expect(page.slug).toBeTruthy();
      expect(page.screenType).toBeTruthy();
      expect(page.requiredRoles.length).toBeGreaterThan(0);
      expect(page.recommendedSections.length).toBeGreaterThan(0);
      expect(page.archetypeFit.length).toBeGreaterThan(0);

      // Verify screen creation
      const screen = page.createScreen();
      expect(() => ProjectScreenSchema.parse(screen)).not.toThrow();
      expect(screen.rootNode.children.length).toBeGreaterThan(0);
    }
  });

  it('retrieves individual page compositions by ID and slug', () => {
    const home = getPageComposition('marketing-home');
    expect(home).toBeDefined();
    expect(home?.title).toBe('Marketing Home');

    const pricing = getPageComposition('pricing-page');
    expect(pricing).toBeDefined();
    expect(pricing?.title).toBe('Pricing');

    const unknown = getPageComposition('non-existent-page');
    expect(unknown).toBeUndefined();
  });

  it('defines exactly 12 product blueprints with full specifications', () => {
    expect(PRODUCT_BLUEPRINTS).toHaveLength(12);

    for (const bp of PRODUCT_BLUEPRINTS) {
      expect(bp.id).toBeTruthy();
      expect(bp.name).toBeTruthy();
      expect(bp.archetypeId).toBeTruthy();
      expect(bp.priors).toBeDefined();
      expect(bp.requiredPageClasses.length).toBeGreaterThan(0);
      expect(bp.defaultNavigationFamily).toBeTruthy();
      expect(bp.applicableDnaPresets.length).toBeGreaterThanOrEqual(3);
      expect(bp.antiPatterns.length).toBeGreaterThan(0);
    }
  });

  it('defines exactly 8 complete showcase projects conforming to ProjectManifestSchema', () => {
    expect(SHOWCASE_PROJECTS).toHaveLength(8);
    expect(getAllShowcaseProjects()).toHaveLength(8);

    for (const sc of SHOWCASE_PROJECTS) {
      expect(sc.id).toBeTruthy();
      expect(sc.name).toBeTruthy();
      expect(sc.tagline).toBeTruthy();
      expect(sc.archetypeId).toBeTruthy();
      expect(sc.navigationModel).toBeTruthy();
      expect(sc.dnaPresetName).toBeTruthy();
      expect(sc.designDNA).toBeDefined();

      // Validate manifest against canonical ProjectManifestSchema
      expect(() => ProjectManifestSchema.parse(sc.manifest)).not.toThrow();
      expect(sc.manifest.screens.length).toBeGreaterThanOrEqual(3);
      expect(sc.manifest.navigation.primaryItems.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('enforces required showcase diversity and differentiation rules', () => {
    const navModels = new Set(SHOWCASE_PROJECTS.map((s) => s.navigationModel));
    // Rule: no two showcases may use the same dominant navigation model
    expect(navModels.size).toBe(SHOWCASE_PROJECTS.length);

    // Rule: no two showcases may use the same DNA preset unchanged
    const dnaPresets = new Set(SHOWCASE_PROJECTS.map((s) => s.dnaPresetName));
    expect(dnaPresets.size).toBe(SHOWCASE_PROJECTS.length);

    // Rule: at least one dark/dense showcase
    const darkDense = SHOWCASE_PROJECTS.find(
      (s) => s.colorMode === 'dark' && s.designDNA.density >= 90
    );
    expect(darkDense).toBeDefined();
    expect(darkDense?.id).toBe('showcase-financial-terminal');

    // Rule: at least one light/minimal showcase
    const lightMinimal = SHOWCASE_PROJECTS.find(
      (s) => s.colorMode === 'light' && s.designDNA.whitespace >= 85 && s.designDNA.density <= 40
    );
    expect(lightMinimal).toBeDefined();
    expect(lightMinimal?.id).toBe('showcase-minimal-productivity');

    // Rule: at least one warm/editorial showcase
    const warmEditorial = SHOWCASE_PROJECTS.find(
      (s) => s.designDNA.editorial >= 90 && s.designDNA.warmth >= 80
    );
    expect(warmEditorial).toBeDefined();
    expect(warmEditorial?.id).toBe('showcase-luxury-hospitality');

    // Rule: at least one professional + playful showcase
    const playful = SHOWCASE_PROJECTS.find(
      (s) => s.designDNA.playfulness >= 70 && s.designDNA.warmth >= 75
    );
    expect(playful).toBeDefined();
    expect(playful?.id).toBe('showcase-playful-hr');

    // Rule: at least one high visual ambition marketing showcase
    const highAmbition = SHOWCASE_PROJECTS.find(
      (s) => s.designDNA.visualAmbition >= 85
    );
    expect(highAmbition).toBeDefined();

    // Rule: at least one low-motion / high-accessibility showcase
    const lowMotionA11y = SHOWCASE_PROJECTS.find(
      (s) => s.designDNA.motion <= 15 && s.designDNA.accessibilityPriority === 100
    );
    expect(lowMotionA11y).toBeDefined();
    expect(lowMotionA11y?.id).toBe('showcase-scientific-research');
  });

  it('retrieves individual showcase projects by ID', () => {
    const sc = getShowcaseProject('showcase-financial-terminal');
    expect(sc).toBeDefined();
    expect(sc?.name).toContain('Financial Intelligence');

    const unknown = getShowcaseProject('invalid-showcase');
    expect(unknown).toBeUndefined();
  });
});
