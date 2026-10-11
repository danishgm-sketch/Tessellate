export interface SemanticColorTokens {
  canvas: string;
  canvasStrong: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  signalLime: string;
  signalDanger: string;
  signalSuccess: string;
  signalWarning: string;
}

export interface SemanticTypographyTokens {
  displayFont: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingLetterSpacing: string;
  bodyLineHeight: number;
  scaleRatio: number;
}

export interface SemanticRadiusTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface SemanticSpacingTokens {
  baseUnit: number;
  multiplier: number;
  gutterDesktop: string;
  gutterMobile: string;
  sectionGapDesktop: string;
  sectionGapMobile: string;
}

export interface SemanticSurfaceDepthTokens {
  borderWidth: string;
  shadowSubtle: string;
  shadowMedium: string;
  shadowStrong: string;
}

export interface SemanticMotionTokens {
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  easing: string;
  reducedMotion: boolean;
}

export interface SemanticFocusTokens {
  ringColor: string;
  ringWidth: string;
  ringOffset: string;
}

export interface SemanticTokenContract {
  colors: SemanticColorTokens;
  typography: SemanticTypographyTokens;
  radius: SemanticRadiusTokens;
  spacing: SemanticSpacingTokens;
  surfaceDepth: SemanticSurfaceDepthTokens;
  motion: SemanticMotionTokens;
  focus: SemanticFocusTokens;
}

/**
 * Converts a SemanticTokenContract into standard CSS variable record
 * compatible with Tailwind CSS and CSS inline custom properties.
 */
export function tokensToCssVariables(tokens: SemanticTokenContract): Record<string, string> {
  return {
    '--tess-canvas': tokens.colors.canvas,
    '--tess-canvas-strong': tokens.colors.canvasStrong,
    '--tess-surface': tokens.colors.surface,
    '--tess-surface-raised': tokens.colors.surfaceRaised,
    '--tess-hairline': tokens.colors.border,
    '--tess-hairline-strong': tokens.colors.borderStrong,
    '--tess-ink': tokens.colors.textPrimary,
    '--tess-ink-secondary': tokens.colors.textSecondary,
    '--tess-ink-muted': tokens.colors.textMuted,
    '--tess-accent': tokens.colors.accent,
    '--tess-accent-hover': tokens.colors.accentHover,
    '--tess-accent-soft': tokens.colors.accentSoft,
    '--tess-signal-lime': tokens.colors.signalLime,
    '--tess-signal-danger': tokens.colors.signalDanger,
    '--tess-signal-success': tokens.colors.signalSuccess,
    '--tess-signal-warning': tokens.colors.signalWarning,

    '--tess-font-display': tokens.typography.displayFont,
    '--tess-font-heading': tokens.typography.headingFont,
    '--tess-font-body': tokens.typography.bodyFont,
    '--tess-font-mono': tokens.typography.monoFont,
    '--tess-heading-letter-spacing': tokens.typography.headingLetterSpacing,
    '--tess-body-line-height': String(tokens.typography.bodyLineHeight),

    '--tess-radius-xs': tokens.radius.xs,
    '--tess-radius-sm': tokens.radius.sm,
    '--tess-radius-md': tokens.radius.md,
    '--tess-radius-lg': tokens.radius.lg,
    '--tess-radius-xl': tokens.radius.xl,
    '--tess-radius-full': tokens.radius.full,

    '--tess-gutter-desktop': tokens.spacing.gutterDesktop,
    '--tess-gutter-mobile': tokens.spacing.gutterMobile,
    '--tess-section-gap-desktop': tokens.spacing.sectionGapDesktop,
    '--tess-section-gap-mobile': tokens.spacing.sectionGapMobile,

    '--tess-border-width': tokens.surfaceDepth.borderWidth,
    '--tess-shadow-1': tokens.surfaceDepth.shadowSubtle,
    '--tess-shadow-2': tokens.surfaceDepth.shadowMedium,
    '--tess-shadow-3': tokens.surfaceDepth.shadowStrong,

    '--tess-duration-fast': tokens.motion.durationFast,
    '--tess-duration-normal': tokens.motion.durationNormal,
    '--tess-duration-slow': tokens.motion.durationSlow,
    '--tess-easing': tokens.motion.easing,

    '--tess-focus-ring-color': tokens.focus.ringColor,
    '--tess-focus-ring-width': tokens.focus.ringWidth,
    '--tess-focus-ring-offset': tokens.focus.ringOffset,
  };
}
