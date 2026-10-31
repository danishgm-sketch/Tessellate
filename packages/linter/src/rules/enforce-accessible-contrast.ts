import type { LintRule, LintIssue } from '../types.js';
import { getStaticClassValues } from './static-class-values.js';

const namedColors: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  'slate-50': '#f8fafc',
  'slate-300': '#cbd5e1',
  'slate-400': '#94a3b8',
  'slate-500': '#64748b',
  'slate-600': '#475569',
  'gray-50': '#f9fafb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'zinc-50': '#fafafa',
  'zinc-300': '#d4d4d8',
  'zinc-400': '#a1a1aa',
  'zinc-500': '#71717a',
  'zinc-600': '#52525b',
  'neutral-50': '#fafafa',
  'neutral-300': '#d4d4d4',
  'neutral-400': '#a3a3a3',
  'neutral-500': '#737373',
  'neutral-600': '#525252',
};

interface ColorClass {
  utility: 'text' | 'bg';
  token: string;
  variants: string;
  hex?: string;
}

function parseColorClass(token: string): ColorClass | undefined {
  const separator = token.lastIndexOf(':');
  const variants = separator >= 0 ? token.slice(0, separator) : '';
  const utility = separator >= 0 ? token.slice(separator + 1) : token;
  const match = /^(text|bg)-\[(?:#)?([\da-f]{3}|[\da-f]{6})\]$/i.exec(utility);

  if (match) {
    const digits = match[2]!;
    const hex =
      digits.length === 3
        ? `#${[...digits].map((digit) => `${digit}${digit}`).join('')}`
        : digits.length === 6
          ? `#${digits}`
          : undefined;
    return { utility: match[1] as ColorClass['utility'], token, variants, hex };
  }

  const namedMatch =
    /^(text|bg)-(white|black|transparent|current|inherit|(?:slate|gray|zinc|neutral|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})$/.exec(
      utility
    );
  if (!namedMatch) return undefined;
  const hex = namedColors[namedMatch[2]!];
  return { utility: namedMatch[1] as ColorClass['utility'], token, variants, hex };
}

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => parseInt(channel, 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a
  );
  return (lighter! + 0.05) / (darker! + 0.05);
}

function isCompatibleVariantState(variants: Set<string>): boolean {
  return !(
    (variants.has('dark') && variants.has('light')) ||
    (variants.has('motion-safe') && variants.has('motion-reduce')) ||
    (variants.has('enabled') && variants.has('disabled')) ||
    (variants.has('read-only') && variants.has('read-write'))
  );
}

function mostSpecificColor(colors: ColorClass[], state: Set<string>): ColorClass | undefined {
  const active = colors.filter((color) =>
    color.variants
      .split(':')
      .filter(Boolean)
      .every((variant) => state.has(variant))
  );
  if (active.length === 0) return undefined;
  const specificity = Math.max(
    ...active.map((color) => color.variants.split(':').filter(Boolean).length)
  );
  const mostSpecific = active.filter(
    (color) => color.variants.split(':').filter(Boolean).length === specificity
  );
  const hexes = new Set(mostSpecific.map((color) => color.hex?.toLowerCase() ?? color.token));
  return hexes.size === 1 ? mostSpecific[0] : undefined;
}

export const enforceAccessibleContrastRule: LintRule = {
  id: 'enforce-accessible-contrast',
  description:
    'Calculates explicit hex and selected Tailwind gray-palette text/background pairs; it is a partial static check, not WCAG certification.',
  check({ filePath, code }) {
    const issues: LintIssue[] = [];

    for (const classValue of getStaticClassValues(code)) {
      const classes = classValue.value
        .split(/\s+/)
        .map(parseColorClass)
        .filter((color): color is ColorClass => Boolean(color));
      const textColors = classes.filter((color) => color.utility === 'text');
      const backgroundColors = classes.filter((color) => color.utility === 'bg');
      const seenPairs = new Set<string>();

      for (const text of textColors) {
        for (const background of backgroundColors) {
          const state = new Set([
            ...text.variants.split(':').filter(Boolean),
            ...background.variants.split(':').filter(Boolean),
          ]);
          if (!isCompatibleVariantState(state)) continue;
          const effectiveText = mostSpecificColor(textColors, state);
          const effectiveBackground = mostSpecificColor(backgroundColors, state);
          if (!effectiveText?.hex || !effectiveBackground?.hex) continue;

          const pairKey = `${effectiveText.token}|${effectiveBackground.token}`;
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          const ratio = contrastRatio(effectiveText.hex, effectiveBackground.hex);
          if (ratio >= 4.5) continue;

          const offset = classValue.startIndex + classValue.value.indexOf(effectiveText.token);
          const linesUpToMatch = code.slice(0, offset).split('\n');
          issues.push({
            ruleId: 'enforce-accessible-contrast',
            severity: 'error',
            message: `The explicit text/background pair has a calculated contrast ratio of ${ratio.toFixed(2)}:1, below 4.5:1 for normal-sized text. This static check does not model inheritance, opacity, images, font size or browser rendering.`,
            file: filePath,
            line: linesUpToMatch.length,
            column: linesUpToMatch[linesUpToMatch.length - 1]!.length + 1,
            snippet: `${effectiveText.token} ${effectiveBackground.token}`,
          });
        }
      }
    }

    return issues;
  },
};
