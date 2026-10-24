import type { GateCheckResult } from '../types.js';

export function checkTokenHygiene(code: string): GateCheckResult {
  // Exclude hex colors in comments or SVG path strings if any
  const rawHexInClasses = code.match(/(?:bg|text|border|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/g) || [];

  const arbitrarySpacingMatches = code.match(/\b(?:p|m|px|py|gap)-\[\d+px\]/g) || [];
  const offGridSpacing = arbitrarySpacingMatches.filter((m) => {
    const val = parseInt(m.match(/\d+/)?.[0] || '0', 10);
    return val % 4 !== 0;
  });

  // Approved Design DNA palette hex codes (Tessellate canonical themes)
  const APPROVED_PALETTE_HEXES = new Set([
    '#2547E8', '#1E3CCD', '#E7EBFF', '#FAF9F6', '#111217', '#62666F',
    '#D9D6CF', '#0B0D10', '#171B21', '#20242D', '#272C34', '#F5F7FA',
    '#A8AFBA', '#C83D48', '#A92A34', '#FF6B7A', '#171A21', '#2E3440',
    '#2A1518', '#3D1D22', '#522329', '#E5E2DA', '#1E232E', '#11141B',
    '#FFFFFF', '#000000',
  ].map((h) => h.toUpperCase()));

  const unapprovedHexes: string[] = [];
  const paletteHexes: string[] = [];

  for (const cls of rawHexInClasses) {
    const hexMatch = cls.match(/#[0-9a-fA-F]+/)?.[0]?.toUpperCase();
    if (hexMatch) {
      if (APPROVED_PALETTE_HEXES.has(hexMatch)) {
        paletteHexes.push(cls);
      } else {
        unapprovedHexes.push(cls);
      }
    }
  }

  if (unapprovedHexes.length > 0) {
    return {
      id: 'token-hygiene',
      name: 'Design DNA Semantic Token Hygiene',
      category: 'token-hygiene',
      status: 'fail',
      score: Math.max(0, 100 - unapprovedHexes.length * 25),
      details: `Detected ${unapprovedHexes.length} unapproved arbitrary color utility class(es): ${unapprovedHexes.slice(0, 3).join(', ')}.`,
      remediation: 'Replace raw hex color classes with Design DNA semantic tokens (e.g., var(--tess-canvas), var(--tess-accent)) or run "tess lint --fix".',
    };
  }

  if (paletteHexes.length > 0) {
    return {
      id: 'token-hygiene',
      name: 'Design DNA Semantic Token Hygiene',
      category: 'token-hygiene',
      status: 'warn',
      score: 85,
      details: `Uses ${paletteHexes.length} canonical Design DNA palette hex values. Recommend migrating to semantic CSS variables.`,
      remediation: 'Run "tess lint --fix" to migrate hardcoded palette hexes to semantic CSS variables (var(--tess-...)).',
    };
  }

  if (offGridSpacing.length > 0) {
    return {
      id: 'token-hygiene',
      name: 'Design DNA Semantic Token Hygiene',
      category: 'token-hygiene',
      status: 'warn',
      score: 80,
      details: `Detected ${offGridSpacing.length} off-grid arbitrary spacing value(s): ${offGridSpacing.slice(0, 3).join(', ')}.`,
      remediation: 'Align all spacing to the 4px baseline grid (4px, 8px, 12px, 16px, 24px) or run "tess lint --fix".',
    };
  }

  return {
    id: 'token-hygiene',
    name: 'Design DNA Semantic Token Hygiene',
    category: 'token-hygiene',
    status: 'pass',
    score: 100,
    details: 'Zero hardcoded colors or off-grid spacing. Component strictly obeys Design DNA semantic variables.',
  };
}
