import type { DesignDNA } from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA } from '@tessellate/dna';
import type { InferredDnaResult } from './types.js';

export function reverseEngineerDna(fileContents: string[]): InferredDnaResult {
  const allCode = fileContents.join('\n');

  // 1. Detect Color Palette
  const paletteKeywords: Record<string, string[]> = {
    'paper-cobalt': ['blue', 'cobalt', 'sky'],
    'emerald': ['emerald', 'green', 'teal'],
    'slate': ['slate', 'cyan'],
    'zinc': ['zinc', 'gray', 'neutral'],
    'amber': ['amber', 'orange', 'yellow'],
    'rose': ['rose', 'red', 'pink'],
    'violet': ['violet', 'purple', 'indigo'],
  };

  const paletteCounts: Record<string, number> = {};
  for (const [family, keywords] of Object.entries(paletteKeywords)) {
    paletteCounts[family] = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b(?:text|bg|border)-${kw}-\\d+\\b`, 'g');
      const matches = allCode.match(regex);
      if (matches) {
        paletteCounts[family] += matches.length;
      }
    }
  }

  let topPalette = 'paper-cobalt';
  let maxCount = -1;
  for (const [pal, count] of Object.entries(paletteCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topPalette = pal;
    }
  }

  // 2. Detect Curvature (0 to 100)
  let curvature = 50;
  const roundedNone = (allCode.match(/\brounded-none\b/g) || []).length;
  const roundedSm = (allCode.match(/\brounded-sm\b/g) || []).length;
  const roundedMd = (allCode.match(/\brounded-md\b|\brounded\b/g) || []).length;
  const roundedLg = (allCode.match(/\brounded-lg\b|\brounded-xl\b/g) || []).length;
  const roundedFull = (allCode.match(/\brounded-2xl\b|\brounded-full\b/g) || []).length;

  const totalRounding = roundedNone + roundedSm + roundedMd + roundedLg + roundedFull;
  if (totalRounding > 0) {
    curvature = Math.round(
      (roundedNone * 0 + roundedSm * 25 + roundedMd * 50 + roundedLg * 75 + roundedFull * 100) /
        totalRounding
    );
  }

  // 3. Detect Visual Mode ('light' vs 'dark')
  const darkMatches = (allCode.match(/\bdark:\w+/g) || []).length;
  const darkBackgrounds = (allCode.match(/\bbg-(?:black|slate-950|zinc-950|gray-900|neutral-900)\b/g) || []).length;
  const visualMode: 'light' | 'dark' = darkMatches > 5 || darkBackgrounds > 3 ? 'dark' : 'light';

  // 4. Construct complete DesignDNA
  const dna: DesignDNA = {
    ...DEFAULT_DESIGN_DNA,
    curvature,
    visualMode,
    density: 50,
    whitespace: 50,
    contrast: 70,
  };

  return {
    dna,
    confidence: totalRounding > 5 || maxCount > 5 ? 0.85 : 0.65,
    detectedPalette: topPalette,
    detectedCurvature: curvature,
    detectedVisualMode: visualMode,
  };
}
