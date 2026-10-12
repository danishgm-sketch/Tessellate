import type { DesignDNA, PartialDesignDNA } from '@tessellate/schemas';
import {
  DEFAULT_DESIGN_DNA,
  getSemanticPalette,
  getTypographyPairing,
  getMotionPersonality,
} from '@tessellate/dna';
import type {
  SemanticTokenContract,
  SemanticColorTokens,
  SemanticTypographyTokens,
  SemanticRadiusTokens,
  SemanticSpacingTokens,
  SemanticSurfaceDepthTokens,
  SemanticMotionTokens,
  SemanticFocusTokens,
} from './contract.js';

export interface NormalizerOptions {
  paletteId?: string;
  typographyId?: string;
  motionId?: string;
  reducedMotion?: boolean;
  activeMode?: 'light' | 'dark';
  tokenOverrides?: Record<string, string | number>;
}

/**
 * Normalises Design DNA into a cohesive SemanticTokenContract.
 * Enforces strict precedence:
 * 1. accessibility constraints;
 * 2. explicit node overrides;
 * 3. project Design DNA;
 * 4. resource semantic defaults;
 * 5. source resource fallback values.
 */
export function normalizeDesignTokens(
  partialDna?: PartialDesignDNA,
  options?: NormalizerOptions
): SemanticTokenContract {
  const dna: DesignDNA = {
    ...DEFAULT_DESIGN_DNA,
    ...(partialDna ?? {}),
  };

  const isReducedMotion = options?.reducedMotion ?? false;
  const isHighA11y = (dna.accessibilityPriority ?? 80) >= 80;

  // 1. Color Mapping
  const paletteId = options?.paletteId ?? (typeof options?.tokenOverrides?.paletteId==='string' ? options.tokenOverrides.paletteId : 'paper-cobalt');
  const palette = getSemanticPalette(paletteId) ?? getSemanticPalette('paper-cobalt')!;
  const mode =
    options?.activeMode ??
    (dna.visualMode === 'dark' ? 'dark' : 'light');
  const paletteTokens = mode === 'dark' ? palette.dark : palette.light;

  const colors: SemanticColorTokens = {
    canvas: paletteTokens.canvas,
    canvasStrong: paletteTokens.canvasStrong,
    surface: paletteTokens.surface,
    surfaceRaised: paletteTokens.surfaceRaised,
    border: paletteTokens.border,
    borderStrong: paletteTokens.borderStrong,
    textPrimary: isHighA11y && mode === 'light' ? '#0A0A0C' : paletteTokens.textPrimary,
    textSecondary: paletteTokens.textSecondary,
    textMuted: mode==='dark' ? '#A8AFBA' : '#62666F',
    accent: paletteTokens.accent,
    accentHover: paletteTokens.accentHover,
    accentSoft: paletteTokens.accentSoft,
    signalLime: paletteTokens.signalLime,
    signalDanger: paletteTokens.signalDanger,
    signalSuccess: paletteTokens.signalSuccess,
    signalWarning: paletteTokens.signalWarning,
  };

  // 2. Typography Mapping
  const typographyId = options?.typographyId ?? dna.typographyPersonality ?? 'geist-system';
  const pairing = getTypographyPairing(typographyId) ?? getTypographyPairing('geist-system')!;

  const typography: SemanticTypographyTokens = {
    displayFont: pairing.displayFont,
    headingFont: pairing.headingFont,
    bodyFont: pairing.bodyFont,
    monoFont: pairing.monoFont,
    headingLetterSpacing: pairing.headingLetterSpacing,
    bodyLineHeight: pairing.bodyLineHeight,
    scaleRatio: pairing.scaleRatio,
  };

  // 3. Radius Mapping (Based on curvature 0–100)
  const curvature = dna.curvature ?? 50;
  let radius: SemanticRadiusTokens;

  if (curvature <= 5) {
    // Sharp / brutalist
    radius = {
      xs: '0px',
      sm: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      full: '999px',
    };
  } else if (curvature <= 30) {
    // Crisp slight rounding
    radius = {
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '999px',
    };
  } else if (curvature <= 65) {
    // Standard canonical Tessellate rounding
    radius = {
      xs: '4px',
      sm: '8px',
      md: '14px',
      lg: '20px',
      xl: '28px',
      full: '999px',
    };
  } else if (curvature <= 85) {
    // High curvature
    radius = {
      xs: '6px',
      sm: '12px',
      md: '20px',
      lg: '28px',
      xl: '36px',
      full: '999px',
    };
  } else {
    // Hyper-rounded
    radius = {
      xs: '8px',
      sm: '16px',
      md: '28px',
      lg: '36px',
      xl: '48px',
      full: '999px',
    };
  }

  // Feel is a rendering input, not a metadata-only label. At 50, preserve the
  // canonical curvature tier; reserved/playful endpoints vary its radii by 25%.
  const feelRadiusScale=0.75+(partialDna?.playfulness ?? 50)/200;
  for(const key of ['xs','sm','md','lg','xl'] as const)radius[key]=`${Math.round(parseFloat(radius[key])*feelRadiusScale*2)/2}px`;

  // 4. Spacing Mapping (Density & Whitespace)
  const density = dna.density ?? 50;
  const whitespace = dna.whitespace ?? 50;
  // Factor between 0.8 (very dense) and 1.3 (very generous whitespace)
  const multiplier = Math.round((1.0 + (whitespace - density) * 0.003) * 100) / 100;

  const spacing: SemanticSpacingTokens = {
    baseUnit: 4,
    multiplier,
    gutterDesktop: multiplier < 1.0 ? '24px' : '32px',
    gutterMobile: '16px',
    sectionGapDesktop: multiplier > 1.1 ? '144px' : multiplier < 0.9 ? '80px' : '112px',
    sectionGapMobile: multiplier > 1.1 ? '96px' : multiplier < 0.9 ? '56px' : '72px',
  };

  // 5. Surface & Depth Mapping (Depth 0–100)
  const depth = dna.depth ?? 30;
  const borderWidth = dna.contrast >= 75 ? '1.5px' : '1px';

  let surfaceDepth: SemanticSurfaceDepthTokens;
  if (depth <= 10) {
    // Completely flat
    surfaceDepth = {
      borderWidth,
      shadowSubtle: 'none',
      shadowMedium: 'none',
      shadowStrong: 'none',
    };
  } else if (depth <= 40) {
    // Subtle elevation
    surfaceDepth = {
      borderWidth,
      shadowSubtle: '0 1px 2px rgba(17, 18, 23, 0.05)',
      shadowMedium: '0 4px 12px rgba(17, 18, 23, 0.07)',
      shadowStrong: '0 12px 36px rgba(17, 18, 23, 0.09)',
    };
  } else {
    // Deep elevation
    surfaceDepth = {
      borderWidth,
      shadowSubtle: '0 1px 3px rgba(17, 18, 23, 0.07)',
      shadowMedium: '0 8px 24px rgba(17, 18, 23, 0.10)',
      shadowStrong: '0 20px 60px rgba(17, 18, 23, 0.14)',
    };
  }

  // 6. Motion Mapping (Motion personality & reduced motion precedence)
  const motionId = options?.motionId ?? dna.motionPersonality ?? 'snappy-productive';
  const motionConfig = getMotionPersonality(motionId) ?? getMotionPersonality('snappy-productive')!;

  const motion: SemanticMotionTokens = {
    durationFast: isReducedMotion || dna.motion===0 ? '0ms' : `${Math.round(motionConfig.durationFast*(0.5+dna.motion/100))}ms`,
    durationNormal: isReducedMotion || dna.motion===0 ? '0ms' : `${Math.round(motionConfig.durationNormal*(0.5+dna.motion/100))}ms`,
    durationSlow: isReducedMotion || dna.motion===0 ? '0ms' : `${Math.round(motionConfig.durationSlow*(0.5+dna.motion/100))}ms`,
    easing: isReducedMotion ? 'linear' : motionConfig.easing,
    reducedMotion: isReducedMotion,
  };

  // 7. Focus / Accessibility Precedence
  const focus: SemanticFocusTokens = {
    ringColor: isHighA11y ? colors.accent : 'rgba(37, 71, 232, 0.65)',
    ringWidth: isHighA11y ? '3px' : '2px',
    ringOffset: '2px',
  };

  return {
    colors,
    typography,
    radius,
    spacing,
    surfaceDepth,
    motion,
    focus,
  };
}
