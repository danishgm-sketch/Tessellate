/**
 * Semantic Tailwind CSS 4 utilities for resources (Phase 30, contract v2).
 *
 * Resources style themselves only with these utilities — `bg-surface`, `text-ink`, `border-hairline`,
 * `bg-accent text-on-accent`, `rounded-ui-md`, `shadow-ui-1`, `font-heading`, `ease-ui` — never hex values
 * or palette classes. Each utility reads a `--tess-*` token (see tokensToCssVariables), so Design DNA, dark
 * mode and brand changes reach every resource. The fallbacks are a light theme that meets WCAG AAA text
 * contrast (7:1), so a resource also renders accessibly outside a Tessellate token scope.
 *
 * The same text ships as `resource-theme.css` (site, preview app) and inside every export's stylesheet;
 * a unit test keeps the two identical.
 */
export const RESOURCE_THEME_CSS = `/* Semantic design-token utilities (bg-surface, text-ink, rounded-ui-md …). Generated; do not edit by hand. */
@theme inline {
  --color-canvas: var(--tess-canvas, #F4F2ED);
  --color-canvas-strong: var(--tess-canvas-strong, #ECE9E2);
  --color-surface: var(--tess-surface, #FAF9F6);
  --color-surface-raised: var(--tess-surface-raised, #FFFFFF);
  --color-ink: var(--tess-ink, #111217);
  --color-ink-secondary: var(--tess-ink-secondary, #4A4E57);
  --color-ink-muted: var(--tess-ink-muted, #62666F);
  --color-hairline: var(--tess-hairline, #D9D6CF);
  --color-hairline-strong: var(--tess-hairline-strong, #8B8F97);
  --color-accent: var(--tess-accent, #1E3CCD);
  --color-accent-hover: var(--tess-accent-hover, #1730A8);
  --color-accent-soft: var(--tess-accent-soft, #E7EBFF);
  --color-on-accent: var(--tess-on-accent, #FFFFFF);
  --color-danger: var(--tess-signal-danger, #9F1F18);
  --color-success: var(--tess-signal-success, #0F5A3D);
  --color-warning: var(--tess-signal-warning, #6E4708);
  --color-focus: var(--tess-focus-ring-color, #1E3CCD);

  --radius-ui-xs: var(--tess-radius-xs, 4px);
  --radius-ui-sm: var(--tess-radius-sm, 6px);
  --radius-ui-md: var(--tess-radius-md, 10px);
  --radius-ui-lg: var(--tess-radius-lg, 14px);
  --radius-ui-xl: var(--tess-radius-xl, 20px);

  --shadow-ui-1: var(--tess-shadow-1, 0 1px 2px rgba(17, 18, 23, 0.06));
  --shadow-ui-2: var(--tess-shadow-2, 0 6px 16px rgba(17, 18, 23, 0.08));
  --shadow-ui-3: var(--tess-shadow-3, 0 18px 40px rgba(17, 18, 23, 0.12));

  --font-display: var(--tess-font-display, ui-sans-serif, system-ui, sans-serif);
  --font-heading: var(--tess-font-heading, ui-sans-serif, system-ui, sans-serif);
  --font-body: var(--tess-font-body, ui-sans-serif, system-ui, sans-serif);

  --ease-ui: var(--tess-easing, cubic-bezier(0.2, 0, 0, 1));
}
`;

/** Text colour that stays readable on the given accent (WCAG relative luminance). */
export function readableOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#FFFFFF';
  const n = parseInt(m[1]!, 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
  const contrastWhite = 1.05 / (lum + 0.05);
  const contrastDark = (lum + 0.05) / (0.0072 + 0.05); // against #0B0D10
  return contrastWhite >= contrastDark ? '#FFFFFF' : '#0B0D10';
}
