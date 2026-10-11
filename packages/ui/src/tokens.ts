/**
 * Canonical Tessellate design tokens exported as TypeScript constants.
 */

export const colors = {
  light: {
    canvas: '#F4F2ED',
    canvasStrong: '#ECE9E2',
    surface: '#FAF9F6',
    surfaceRaised: '#FFFFFF',
    ink: '#111217',
    inkSecondary: '#62666F',
    inkMuted: '#8B8F97',
    hairline: '#D9D6CF',
    hairlineStrong: '#C7C3BA',
    cobalt: '#2547E8',
    cobaltHover: '#1E3CCD',
    cobaltSoft: '#E7EBFF',
    lime: '#C9FF57',
    danger: '#C83D48',
    success: '#177B55',
    warning: '#A66A15',
  },
  dark: {
    canvas: '#0B0D10',
    panel: '#111419',
    raised: '#171B21',
    hover: '#1C2128',
    border: '#272C34',
    borderStrong: '#353C46',
    text: '#F5F7FA',
    textSecondary: '#A8AFBA',
    textMuted: '#707986',
    accent: '#6782FF',
    accentSoft: '#1C2752',
  },
} as const;

export const radii = {
  xs: '4px',
  sm: '8px',
  md: '14px',
  lg: '20px',
  xl: '28px',
  full: '999px',
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
} as const;

export const typography = {
  fontSans: '"Geist", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontMono: '"Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
} as const;
