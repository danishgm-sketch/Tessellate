import * as ts from 'typescript';
import type { DesignDNA } from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA } from '@tessellate/dna';
import type { InferredDnaResult } from './types.js';

function collectStaticClassNames(fileContents: string[]): string {
  const classValues: string[] = [];
  for (let index = 0; index < fileContents.length; index++) {
    const sourceFile = ts.createSourceFile(
      `source-${index}.tsx`,
      fileContents[index]!,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const visit = (node: ts.Node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        for (const property of node.attributes.properties) {
          if (
            !ts.isJsxAttribute(property) ||
            !['className', 'class'].includes(property.name.getText(sourceFile))
          )
            continue;
          if (property.initializer && ts.isStringLiteral(property.initializer))
            classValues.push(property.initializer.text);
          else if (
            property.initializer &&
            ts.isJsxExpression(property.initializer) &&
            property.initializer.expression &&
            ts.isNoSubstitutionTemplateLiteral(property.initializer.expression)
          ) {
            classValues.push(property.initializer.expression.text);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return classValues.join('\n');
}

export function reverseEngineerDna(fileContents: string[]): InferredDnaResult {
  const allCode = collectStaticClassNames(fileContents);
  const baseClasses = allCode
    .split(/\s+/)
    .filter((token) => token.length > 0 && !token.includes(':'));

  // 1. Detect Color Palette
  const paletteKeywords: Record<string, string[]> = {
    'paper-cobalt': ['blue', 'cobalt', 'sky'],
    emerald: ['emerald', 'green', 'teal'],
    slate: ['slate', 'cyan'],
    zinc: ['zinc', 'gray', 'neutral'],
    amber: ['amber', 'orange', 'yellow'],
    rose: ['rose', 'red', 'pink'],
    violet: ['violet', 'purple', 'indigo'],
  };

  const paletteCounts: Record<string, number> = {};
  for (const [family, keywords] of Object.entries(paletteKeywords)) {
    paletteCounts[family] = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`^(?:text|bg|border)-${kw}-\\d+$`);
      paletteCounts[family] += baseClasses.filter((token) => regex.test(token)).length;
    }
  }

  let topPalette = 'unknown';
  let maxCount = -1;
  for (const [pal, count] of Object.entries(paletteCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topPalette = pal;
    }
  }
  if (maxCount === 0) topPalette = 'unknown';

  // 2. Detect Curvature (0 to 100)
  let curvature = 50;
  const countBaseClass = (pattern: RegExp) =>
    baseClasses.filter((token) => pattern.test(token)).length;
  const roundedNone = countBaseClass(/^rounded-none$/);
  const roundedSm = countBaseClass(/^rounded-sm$/);
  const roundedMd = countBaseClass(/^rounded-md$|^rounded$/);
  const roundedLg = countBaseClass(/^rounded-lg$|^rounded-xl$/);
  const roundedFull = countBaseClass(/^rounded-2xl$|^rounded-full$/);

  const totalRounding = roundedNone + roundedSm + roundedMd + roundedLg + roundedFull;
  if (totalRounding > 0) {
    curvature = Math.round(
      (roundedNone * 0 + roundedSm * 25 + roundedMd * 50 + roundedLg * 75 + roundedFull * 100) /
        totalRounding
    );
  }

  // 3. Detect the base visual mode from static, non-variant background utilities.
  // `dark:` overrides indicate support for a theme, not which theme is the default.
  const darkBackgrounds = baseClasses.filter((token) =>
    /^bg-(?:black|(?:slate|zinc|gray|neutral)-(?:800|900|950))$/.test(token)
  ).length;
  const lightBackgrounds = baseClasses.filter((token) =>
    /^bg-(?:white|(?:slate|zinc|gray|neutral)-(?:50|100))$/.test(token)
  ).length;
  const visualMode: 'light' | 'dark' | 'unknown' =
    darkBackgrounds === lightBackgrounds
      ? 'unknown'
      : darkBackgrounds > lightBackgrounds
        ? 'dark'
        : 'light';

  // 4. Construct complete DesignDNA
  const dna: DesignDNA = {
    ...DEFAULT_DESIGN_DNA,
    curvature,
    visualMode: visualMode === 'unknown' ? DEFAULT_DESIGN_DNA.visualMode : visualMode,
    density: 50,
    whitespace: 50,
    contrast: 70,
    primaryArchetype: 'unknown',
    navigationModel: 'unspecified-imported',
  };

  const inferredFields: Array<keyof DesignDNA> = [];
  if (totalRounding > 0) inferredFields.push('curvature');
  if (visualMode !== 'unknown') inferredFields.push('visualMode');
  const defaultedFields = (Object.keys(dna) as Array<keyof DesignDNA>).filter(
    (field) => !inferredFields.includes(field)
  );
  const hasEvidence = inferredFields.length > 0;
  return {
    dna,
    confidence: !hasEvidence
      ? 0
      : totalRounding > 5 || darkBackgrounds + lightBackgrounds > 5
        ? 0.85
        : 0.65,
    detectedPalette: topPalette,
    detectedCurvature: curvature,
    detectedVisualMode: visualMode,
    inferredFields,
    defaultedFields,
  };
}
