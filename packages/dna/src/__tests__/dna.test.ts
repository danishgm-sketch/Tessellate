import { describe, it, expect } from 'vitest';
import { DesignDNASchema } from '@tessellate/schemas';
import {
  DEFAULT_DESIGN_DNA,
  DIMENSIONS_METADATA,
  DESIGN_DNA_NUMERIC_KEYS,
  clampScore,
  clampPartialDNA,
  validateAndNormalizeDNA,
  resolveEffectiveDNA,
  resolveNodeHierarchyDNA,
  applyOverride,
  removeOverride,
  resetOverrides,
  diffDNA,
  inspectDNAProperty,
  DNA_PRESETS,
  getDNAPreset,
  getAllDNAPresets,
  findDNAPresets,
  FEEL_ADJECTIVE_MAP,
  parseFeelDescriptors,
  applyFeelDescriptors,
  getFeelAdjectiveList,
  VISUAL_AMBITION_STOPS,
  STRUCTURAL_CREATIVITY_STOPS,
  getVisualAmbitionStop,
  getStructuralCreativityStop,
  applyVisualAmbition,
  applyStructuralCreativity,
  SEMANTIC_PALETTES,
  getPalette,
  getAllPalettes,
  TYPOGRAPHY_PAIRINGS,
  getTypographyPairing,
  getAllTypographyPairings,
  MOTION_PERSONALITIES,
  getMotionPersonality,
  getAllMotionPersonalities,
  RESPONSIVE_STRATEGIES,
  getResponsiveStrategy,
  getAllResponsiveStrategies,
  ACCESSIBILITY_STRATEGIES,
  getAccessibilityStrategy,
  getAllAccessibilityStrategies,
} from '../index.js';

describe('Design DNA Canonical Dimensions', () => {
  it('has metadata for all 28 canonical numeric dimensions', () => {
    expect(DESIGN_DNA_NUMERIC_KEYS.length).toBe(28);
    for (const key of DESIGN_DNA_NUMERIC_KEYS) {
      const meta = DIMENSIONS_METADATA[key];
      expect(meta).toBeDefined();
      expect(meta.key).toBe(key);
      expect(meta.min).toBe(0);
      expect(meta.max).toBe(100);
      expect(meta.defaultValue).toBeGreaterThanOrEqual(0);
      expect(meta.defaultValue).toBeLessThanOrEqual(100);
    }
  });

  it('DEFAULT_DESIGN_DNA conforms to DesignDNASchema', () => {
    expect(() => DesignDNASchema.parse(DEFAULT_DESIGN_DNA)).not.toThrow();
  });

  it('clampScore bounds values to 0-100 integers', () => {
    expect(clampScore(-15)).toBe(0);
    expect(clampScore(125)).toBe(100);
    expect(clampScore(42.7)).toBe(43);
    expect(clampScore(NaN)).toBe(0);
  });

  it('clampPartialDNA clamps only defined numeric fields', () => {
    const clamped = clampPartialDNA({
      professionalism: 150,
      playfulness: -20,
      visualMode: 'dark',
    });
    expect(clamped.professionalism).toBe(100);
    expect(clamped.playfulness).toBe(0);
    expect(clamped.visualMode).toBe('dark');
  });

  it('validateAndNormalizeDNA fills missing fields with defaults', () => {
    const dna = validateAndNormalizeDNA({
      professionalism: 95,
      visualMode: 'dark',
    });
    expect(dna.professionalism).toBe(95);
    expect(dna.visualMode).toBe('dark');
    expect(dna.playfulness).toBe(DEFAULT_DESIGN_DNA.playfulness);
    expect(dna.primaryStack).toBe('react-tailwind');
  });
});

describe('Design DNA 5-Level Inheritance & Overrides', () => {
  it('resolves effective DNA down Project -> Page -> Section -> Component -> Element', () => {
    const projectDNA = { ...DEFAULT_DESIGN_DNA, professionalism: 80, curvature: 40 };
    const pageOverrides = { curvature: 60 };
    const sectionOverrides = { warmth: 75 };
    const componentOverrides = { curvature: 20 };
    const elementOverrides = { professionalism: 95 };

    const effective = resolveNodeHierarchyDNA({
      project: projectDNA,
      page: pageOverrides,
      section: sectionOverrides,
      component: componentOverrides,
      element: elementOverrides,
    });

    // Element override wins on professionalism
    expect(effective.professionalism).toBe(95);
    // Component override wins on curvature (overriding page's 60 and project's 40)
    expect(effective.curvature).toBe(20);
    // Section override applies warmth
    expect(effective.warmth).toBe(75);
    // Project default remains for unoverridden values
    expect(effective.density).toBe(projectDNA.density);
  });

  it('override and reset logic cleanly restores inherited values without residue', () => {
    const projectDNA = { ...DEFAULT_DESIGN_DNA, professionalism: 70, playfulness: 25 };
    let componentOverrides = {};

    // Apply override
    componentOverrides = applyOverride(componentOverrides, { playfulness: 80 });
    let effective = resolveEffectiveDNA([projectDNA, componentOverrides]);
    expect(effective.playfulness).toBe(80);

    // Remove specific override
    componentOverrides = removeOverride(componentOverrides, 'playfulness');
    effective = resolveEffectiveDNA([projectDNA, componentOverrides]);
    expect(effective.playfulness).toBe(25); // Restored to inherited 25 cleanly!

    // Apply multiple overrides
    componentOverrides = applyOverride(componentOverrides, {
      luxury: 90,
      warmth: 85,
    });
    expect(componentOverrides).toEqual({ luxury: 90, warmth: 85 });

    // Reset all overrides
    componentOverrides = resetOverrides(componentOverrides);
    expect(componentOverrides).toEqual({});
    effective = resolveEffectiveDNA([projectDNA, componentOverrides]);
    expect(effective.luxury).toBe(projectDNA.luxury);
    expect(effective.warmth).toBe(projectDNA.warmth);
  });

  it('diffDNA captures only values that changed from base', () => {
    const base = DEFAULT_DESIGN_DNA;
    const modified = { ...base, professionalism: 95, visualMode: 'dark' as const };
    const diff = diffDNA(base, modified);
    expect(diff).toEqual({
      professionalism: 95,
      visualMode: 'dark',
    });
  });

  it('inspectDNAProperty correctly identifies source level and override state', () => {
    const projectDNA = { ...DEFAULT_DESIGN_DNA, professionalism: 70 };
    const pageOverrides = { professionalism: 85 };

    const inspected = inspectDNAProperty('professionalism', {
      project: projectDNA,
      page: pageOverrides,
    });

    expect(inspected.effectiveValue).toBe(85);
    expect(inspected.sourceLevel).toBe('page');
    expect(inspected.isOverridden).toBe(true);
    expect(inspected.inheritedValue).toBe(70);
  });
});

describe('Design DNA Presets (Phase 5 Inventory)', () => {
  it('has exactly 30 presets', () => {
    expect(DNA_PRESETS.length).toBe(30);
  });

  it('every preset parses validly against DesignDNASchema', () => {
    for (const preset of DNA_PRESETS) {
      expect(() => DesignDNASchema.parse(preset.dna)).not.toThrow();
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.version).toBe('1.0.0');
      expect(preset.recommendedPalette).toBeTruthy();
      expect(preset.recommendedTypography).toBeTruthy();
      expect(preset.recommendedMotion).toBeTruthy();
      expect(preset.recommendedResponsive).toBeTruthy();
      expect(preset.recommendedAccessibility).toBeTruthy();
    }
  });

  it('lookup functions return expected presets', () => {
    const inst = getDNAPreset('institutional-intelligence');
    expect(inst).toBeDefined();
    expect(inst?.name).toBe('Institutional Intelligence');
    expect(inst?.dna.professionalism).toBeGreaterThan(90);

    const dev = getDNAPreset('developer-native');
    expect(dev).toBeDefined();
    expect(dev?.dna.technicality).toBeGreaterThan(90);
    expect(dev?.dna.visualMode).toBe('dark');

    const all = getAllDNAPresets();
    expect(all.length).toBe(30);

    const found = findDNAPresets('luxury');
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it('preset output is strictly deterministic', () => {
    const preset1 = getDNAPreset('calm-saas');
    const preset2 = getDNAPreset('calm-saas');
    expect(preset1?.dna).toEqual(preset2?.dna);
  });
});

describe('Feel Mapping & Compound Descriptors', () => {
  it('maps "professional" predictably', () => {
    const base = DEFAULT_DESIGN_DNA;
    const modified = applyFeelDescriptors(base, 'professional');
    expect(modified.professionalism).toBeGreaterThan(base.professionalism);
    expect(modified.trust).toBeGreaterThan(base.trust);
    expect(modified.motionPlayfulness).toBeLessThanOrEqual(base.motionPlayfulness);
  });

  it('maps "playful" predictably', () => {
    const base = DEFAULT_DESIGN_DNA;
    const modified = applyFeelDescriptors(base, 'playful');
    expect(modified.playfulness).toBeGreaterThan(base.playfulness);
    expect(modified.curvature).toBeGreaterThan(base.curvature);
    expect(modified.colourfulness).toBeGreaterThan(base.colourfulness);
    expect(modified.motionPlayfulness).toBeGreaterThan(base.motionPlayfulness);
  });

  it('maps "luxury" predictably', () => {
    const base = DEFAULT_DESIGN_DNA;
    const modified = applyFeelDescriptors(base, 'luxury');
    expect(modified.luxury).toBeGreaterThan(base.luxury);
    expect(modified.whitespace).toBeGreaterThan(base.whitespace);
    expect(modified.typographicExpression).toBeGreaterThan(base.typographicExpression);
    expect(modified.colourfulness).toBeLessThan(base.colourfulness);
  });

  it('maps "technical" predictably', () => {
    const base = DEFAULT_DESIGN_DNA;
    const modified = applyFeelDescriptors(base, 'technical');
    expect(modified.technicality).toBeGreaterThan(base.technicality);
    expect(modified.dataDensity).toBeGreaterThan(base.dataDensity);
    expect(modified.interactionDensity).toBeGreaterThan(base.interactionDensity);
  });

  it('maps "cinematic" predictably', () => {
    const base = DEFAULT_DESIGN_DNA;
    const modified = applyFeelDescriptors(base, 'cinematic');
    expect(modified.imageryIntensity).toBeGreaterThan(base.imageryIntensity);
    expect(modified.videoIntensity).toBeGreaterThan(base.videoIntensity);
    expect(modified.motion).toBeGreaterThan(base.motion);
    expect(modified.visualAmbition).toBeGreaterThan(base.visualAmbition);
    expect(modified.depth).toBeGreaterThan(base.depth);
  });

  it('resolves compound contrast descriptor "professional but playful" harmoniously', () => {
    const base = DEFAULT_DESIGN_DNA;
    const result = parseFeelDescriptors('professional but playful');
    expect(result.recognizedAdjectives).toContain('professional');
    expect(result.recognizedAdjectives).toContain('playful');

    const blended = applyFeelDescriptors(base, 'professional but playful');
    // Both traits should be elevated rather than canceling to zero
    expect(blended.professionalism).toBeGreaterThan(base.professionalism);
    expect(blended.playfulness).toBeGreaterThan(base.playfulness);
    expect(blended.motionPlayfulness).toBeGreaterThan(base.motionPlayfulness);
  });

  it('resolves modifier descriptor "luxury without being flashy"', () => {
    const base = DEFAULT_DESIGN_DNA;
    const blended = applyFeelDescriptors(base, 'luxury without being flashy');
    expect(blended.luxury).toBeGreaterThan(base.luxury);
    expect(blended.whitespace).toBeGreaterThan(base.whitespace);
    // Flashy elements should be dampened
    expect(blended.colourfulness).toBeLessThan(base.colourfulness);
  });

  it('getFeelAdjectiveList returns recognized adjectives', () => {
    const list = getFeelAdjectiveList();
    expect(list).toContain('professional');
    expect(list).toContain('playful');
    expect(list).toContain('luxury');
    expect(list).toContain('technical');
    expect(list).toContain('cinematic');
    expect(list).toContain('institutional');
    expect(list).toContain('warm');
    expect(list).toContain('futuristic');
    expect(FEEL_ADJECTIVE_MAP['professional']?.deltas.professionalism).toBe(30);
  });
});

describe('Visual Ambition & Structural Creativity Sliders', () => {
  it('correctly maps 5 Visual Ambition stops', () => {
    expect(getVisualAmbitionStop(10)).toBe('essential');
    expect(getVisualAmbitionStop(30)).toBe('refined');
    expect(getVisualAmbitionStop(55)).toBe('striking');
    expect(getVisualAmbitionStop(75)).toBe('stunning');
    expect(getVisualAmbitionStop(95)).toBe('experimental');
  });

  it('applies Visual Ambition stop onto DesignDNA', () => {
    const base = DEFAULT_DESIGN_DNA;
    const essential = applyVisualAmbition(base, 'essential');
    expect(essential.visualAmbition).toBe(VISUAL_AMBITION_STOPS.essential.defaultScore);
    expect(essential.motion).toBe(10);
    expect(essential.threeDIntensity).toBe(0);

    const stunning = applyVisualAmbition(base, 'stunning');
    expect(stunning.visualAmbition).toBe(VISUAL_AMBITION_STOPS.stunning.defaultScore);
    expect(stunning.motion).toBe(70);
    expect(stunning.threeDIntensity).toBe(45);
  });

  it('correctly maps 5 Structural Creativity stops', () => {
    expect(getStructuralCreativityStop(10)).toBe('familiar');
    expect(getStructuralCreativityStop(30)).toBe('modern');
    expect(getStructuralCreativityStop(55)).toBe('inventive');
    expect(getStructuralCreativityStop(75)).toBe('radical');
    expect(getStructuralCreativityStop(95)).toBe('experimental');
  });

  it('applies Structural Creativity stop onto DesignDNA', () => {
    const base = DEFAULT_DESIGN_DNA;
    const familiar = applyStructuralCreativity(base, 'familiar');
    expect(familiar.structuralCreativity).toBe(10);
    expect(familiar.asymmetry).toBe(10);

    const experimental = applyStructuralCreativity(base, 'experimental');
    expect(experimental.structuralCreativity).toBe(95);
    expect(experimental.asymmetry).toBe(85);
    expect(STRUCTURAL_CREATIVITY_STOPS.familiar.defaultScore).toBe(10);
  });
});

describe('Semantic Palette Systems (20 Presets)', () => {
  it('has exactly 20 semantic palettes', () => {
    expect(SEMANTIC_PALETTES.length).toBe(20);
    expect(getAllPalettes().length).toBe(20);
  });

  it('every palette defines full light and dark token sets', () => {
    const requiredRoles = [
      'canvas',
      'canvasStrong',
      'surface',
      'surfaceRaised',
      'border',
      'borderStrong',
      'textPrimary',
      'textSecondary',
      'textMuted',
      'accent',
      'accentHover',
      'accentSoft',
      'signalLime',
      'signalDanger',
      'signalSuccess',
      'signalWarning',
    ] as const;

    for (const pal of SEMANTIC_PALETTES) {
      expect(pal.id).toBeTruthy();
      expect(pal.name).toBeTruthy();
      for (const role of requiredRoles) {
        expect(pal.light[role]).toBeTruthy();
        expect(pal.dark[role]).toBeTruthy();
      }
    }
  });

  it('retrieves default Paper Cobalt palette', () => {
    const pal = getPalette('paper-cobalt');
    expect(pal).toBeDefined();
    expect(pal?.light.accent).toBe('#2547E8');
    expect(pal?.dark.canvas).toBe('#0B0D10');
  });
});

describe('Typography Pairings (16 Presets)', () => {
  it('has exactly 16 typography pairings', () => {
    expect(TYPOGRAPHY_PAIRINGS.length).toBe(16);
    expect(getAllTypographyPairings().length).toBe(16);
  });

  it('retrieves Geist System default pairing', () => {
    const pairing = getTypographyPairing('geist-system');
    expect(pairing).toBeDefined();
    expect(pairing?.bodyFont).toContain('Geist');
    expect(pairing?.monoFont).toContain('Geist Mono');
  });
});

describe('Motion Personalities (24 Presets)', () => {
  it('has exactly 24 motion personalities', () => {
    expect(MOTION_PERSONALITIES.length).toBe(24);
    expect(getAllMotionPersonalities().length).toBe(24);
  });

  it('retrieves Calm Precision default motion', () => {
    const motion = getMotionPersonality('calm-precision');
    expect(motion).toBeDefined();
    expect(motion?.durationNormal).toBe(220);
  });

  it('all personalities declare valid reduced motion behavior', () => {
    for (const m of MOTION_PERSONALITIES) {
      expect(['instant', 'fade-only', 'disabled']).toContain(m.reducedMotionBehavior);
    }
  });
});

describe('Responsive & Accessibility Strategies', () => {
  it('has exactly 6 responsive strategies', () => {
    expect(RESPONSIVE_STRATEGIES.length).toBe(6);
    expect(getAllResponsiveStrategies().length).toBe(6);
    const resp = getResponsiveStrategy('desktop-dense-mobile-focused');
    expect(resp).toBeDefined();
    expect(resp?.minTouchTargetPx).toBe(44);
  });

  it('has exactly 5 accessibility strategies', () => {
    expect(ACCESSIBILITY_STRATEGIES.length).toBe(5);
    expect(getAllAccessibilityStrategies().length).toBe(5);
  });

  it('retrieves AA Balanced default accessibility strategy', () => {
    const a11y = getAccessibilityStrategy('aa-balanced');
    expect(a11y).toBeDefined();
    expect(a11y?.minContrastNormal).toBe(4.5);
    expect(a11y?.focusRingWidthPx).toBe(2);
  });
});
