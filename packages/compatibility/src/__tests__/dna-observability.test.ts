import { describe, expect, it } from 'vitest';
import * as path from 'node:path';
import { DESIGN_DNA_NUMERIC_KEYS } from '@tessellate/schemas';
import { loadJsonManifest } from '@tessellate/catalog';
import { DEFAULT_DESIGN_DNA } from '@tessellate/dna';
import { calculateDnaFitScore } from '../index.js';

const resourceManifest = (category: string, slug: string) =>
  loadJsonManifest(path.resolve(__dirname, `../../../../resources/${category}/${slug}/manifest.json`));

describe('Design DNA observable resource-fit behavior', () => {
  it.each(DESIGN_DNA_NUMERIC_KEYS)(
    'changes candidate fit when only %s changes',
    (dimension) => {
      const target = { ...DEFAULT_DESIGN_DNA, [dimension]: 100 };
      const alignedCandidate = { ...DEFAULT_DESIGN_DNA, [dimension]: 100 };
      const misalignedCandidate = { ...DEFAULT_DESIGN_DNA, [dimension]: 0 };

      expect(calculateDnaFitScore(target, alignedCandidate)).toBe(100);
      expect(calculateDnaFitScore(target, misalignedCandidate)).toBeLessThan(100);
    }
  );

  it.each([
    ['visualMode', 'light', 'dark'],
    ['geometryFamily', 'curved', 'sharp'],
    ['motionPersonality', 'calm-precision', 'playful-spring'],
    ['typographyPersonality', 'geist-system', 'editorial-serif-geist'],
    ['surfacePersonality', 'paper-flat', 'elevated'],
  ] as const)('scores resource-level %s compatibility', (dimension, alignedValue, mismatchValue) => {
    const target = { ...DEFAULT_DESIGN_DNA, [dimension]: alignedValue };
    const alignedCandidate = { ...DEFAULT_DESIGN_DNA, [dimension]: alignedValue };
    const misalignedCandidate = { ...DEFAULT_DESIGN_DNA, [dimension]: mismatchValue };

    expect(calculateDnaFitScore(target, alignedCandidate)).toBe(100);
    expect(calculateDnaFitScore(target, misalignedCandidate)).toBeLessThan(100);
  });

  it('ranks the spring motion on a success celebration when playful motion is requested', () => {
    const celebration = resourceManifest('motion', 'success-celebration');
    const target = { ...DEFAULT_DESIGN_DNA, motionPlayfulness: 85 };
    const neutralizedMetadata = { ...celebration.visualDNA, motionPlayfulness: 30 };

    expect(celebration.visualDNA.motionPlayfulness).toBeGreaterThanOrEqual(60);
    expect(calculateDnaFitScore(target, celebration.visualDNA)).toBeGreaterThan(
      calculateDnaFitScore(target, neutralizedMetadata)
    );
  });

  it.each([
    ['backgrounds', 'three-d-orbital-field'],
    ['motion', 'card-tilt'],
  ])('marks %s/%s as using spatial depth in its visual DNA', (category, slug) => {
    const resource = resourceManifest(category, slug);
    expect(resource.visualDNA.threeDIntensity).toBeGreaterThan(0);
  });

  it('makes a perspective resource a better fit when the project requests spatial depth', () => {
    const orbital = resourceManifest('backgrounds', 'three-d-orbital-field');
    const target = { ...DEFAULT_DESIGN_DNA, threeDIntensity: 80 };
    const neutralizedMetadata = { ...orbital.visualDNA, threeDIntensity: 0 };

    expect(calculateDnaFitScore(target, orbital.visualDNA)).toBeGreaterThan(
      calculateDnaFitScore(target, neutralizedMetadata)
    );
  });
});
