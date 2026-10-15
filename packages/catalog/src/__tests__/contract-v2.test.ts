import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';

/**
 * Phase 30 gate checks for every contract-v2 resource:
 * - token-only styling (no hex, rgb/hsl, Tailwind palette classes or dark: variants);
 * - manifest props match the component's Props interface;
 * - props drive the output (changing content changes the DOM);
 * - declared loading/error states render.
 */
const resourcesDir = path.resolve(__dirname, '../../../../resources');

function v2Resources(): Array<{ dir: string; manifest: ResourceManifest }> {
  const out: Array<{ dir: string; manifest: ResourceManifest }> = [];
  for (const cat of fs.readdirSync(resourcesDir)) {
    const catDir = path.join(resourcesDir, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    for (const slug of fs.readdirSync(catDir)) {
      const file = path.join(catDir, slug, 'manifest.json');
      if (!fs.existsSync(file)) continue;
      const manifest = ResourceManifestSchema.parse(JSON.parse(fs.readFileSync(file, 'utf8')));
      if (manifest.contractVersion === 2) out.push({ dir: path.join(catDir, slug), manifest });
    }
  }
  return out;
}

const PALETTE =
  /\b(?:bg|text|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|decoration|accent|caret|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)\b/;

const resources = v2Resources();

describe('Phase 30 — resource contract v2', () => {
  it('has contract-v2 resources to check', () => {
    expect(resources.length).toBeGreaterThanOrEqual(10);
  });

  for (const { dir, manifest } of resources) {
    describe(manifest.slug, () => {
      const code = fs.readFileSync(path.join(dir, 'index.tsx'), 'utf8');

      it('styles only with semantic token utilities', () => {
        const classStrings = [...code.matchAll(/(?:className=|`|')([^`'"]*(?:bg-|text-|border-)[^`'"]*)/g)].map((m) => m[1]!);
        for (const cls of classStrings) {
          expect(cls, `${manifest.slug}: palette class in "${cls}"`).not.toMatch(PALETTE);
          expect(cls, `${manifest.slug}: dark: variant in "${cls}"`).not.toMatch(/\bdark:/);
        }
        expect(code, 'hex colour').not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
        expect(code, 'rgb()/hsl()').not.toMatch(/\b(?:rgba?|hsla?)\(/);
        expect(manifest.stylingContract?.tokenOnly).toBe(true);
      });

      it('declares exactly the props its component accepts', () => {
        const body = /export interface \w+Props\s*\{([\s\S]*?)\n\}/.exec(code)?.[1] ?? '';
        const accepted = new Set([...body.matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]!));
        const declared = new Set((manifest.props ?? []).map((p) => p.name));
        expect([...declared].sort()).toEqual([...accepted].sort());
      });

      it('renders content from props and its declared states', async () => {
        const mod = (await import(path.join(dir, 'index.tsx'))) as Record<string, React.ComponentType<Record<string, unknown>>>;
        const Component = Object.entries(mod).find(([k, v]) => /^[A-Z]/.test(k) && typeof v === 'function')![1];
        const sample = (manifest.preview.defaultProps ?? {}) as Record<string, unknown>;
        const html = (props: Record<string, unknown>) => renderToStaticMarkup(React.createElement(Component, { ...sample, ...props }));

        const base = html({});
        expect(base.length).toBeGreaterThan(50);
        const textProp = (manifest.props ?? []).find((p) => p.type === 'string' && ['heading', 'productName', 'entity', 'amountLabel'].includes(p.name));
        if (textProp) {
          const marker = 'Zephyr Marker 42';
          expect(html({ [textProp.name]: marker }), `${textProp.name} should reach the DOM`).toContain(marker);
        }
        if (manifest.states?.loading) expect(html({ loading: true })).not.toEqual(base);
        if (manifest.states?.error && (manifest.props ?? []).some((p) => p.name === 'errorMessage')) {
          const withError = html({ errorMessage: 'Card was declined' });
          expect(withError).toContain('Card was declined');
          expect(withError).toMatch(/role="alert"/);
        }
      });
    });
  }
});
