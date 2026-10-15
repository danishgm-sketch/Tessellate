import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { RESOURCE_THEME_CSS, readableOn, tokensToCssVariables, normalizeDesignTokens } from '../index.js';
import { validProjectFixture } from '@tessellate/schemas';

describe('Phase 30 — resource theme', () => {
  it('the shipped CSS file is generated from the constant', () => {
    const file = fs.readFileSync(path.resolve(__dirname, '../tokens/resource-theme.css'), 'utf-8');
    expect(file.replace(/\r\n/g, '\n')).toBe(RESOURCE_THEME_CSS);
  });

  it('every utility reads a token that the normaliser actually emits', () => {
    const vars = tokensToCssVariables(normalizeDesignTokens(validProjectFixture.designDNA));
    for (const m of RESOURCE_THEME_CSS.matchAll(/var\((--tess-[a-z0-9-]+)/g)) expect(vars, m[1]).toHaveProperty(m[1]!);
  });

  it('text on accent stays readable', () => {
    expect(readableOn('#2547E8')).toBe('#FFFFFF');
    expect(readableOn('#C9FF57')).toBe('#0B0D10');
  });
});

describe('Phase 30 — contrast floor', () => {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const ch = (c: number) => ((c / 255) <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
    return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
  };
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x! + 0.05) / (y! + 0.05);
  };

  for (const mode of ['light', 'dark'] as const) {
    it(`AAA projects get 7:1 text, accent and signal colours (${mode})`, () => {
      const t = normalizeDesignTokens(validProjectFixture.designDNA, { accessibilityFloor: 'AAA', activeMode: mode }).colors;
      for (const fg of [t.textPrimary, t.textSecondary, t.accent, t.signalDanger, t.signalSuccess, t.signalWarning]) {
        for (const bg of [t.surface, t.surfaceRaised]) expect(ratio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(7);
      }
    });
  }

  it('AA projects get at least 4.5:1', () => {
    const t = normalizeDesignTokens(validProjectFixture.designDNA, { accessibilityFloor: 'AA' }).colors;
    for (const fg of [t.textSecondary, t.accent]) expect(ratio(fg, t.surface)).toBeGreaterThanOrEqual(4.5);
  });
});
