import type { ProjectManifest, DesignDNA } from '@tessellate/schemas';

export type BlendSourceKey = 'A' | 'B' | 'C';

export type BlendCategory =
  | 'structure'
  | 'typography'
  | 'colour'
  | 'motion'
  | 'density'
  | 'geometry'
  | 'navigation'
  | 'imagery'
  | 'components';

export const ALL_BLEND_CATEGORIES: BlendCategory[] = [
  'structure',
  'typography',
  'colour',
  'motion',
  'density',
  'geometry',
  'navigation',
  'imagery',
  'components',
];

export interface BlendConfig {
  selections: Record<BlendCategory, BlendSourceKey>;
  name?: string;
}

/**
 * Blends two or three source manifests into a new coherent ProjectManifest
 * based on selected category origins without mutating source manifests.
 */
export function blendManifests(
  sourceA: ProjectManifest,
  sourceB: ProjectManifest,
  sourceC: ProjectManifest | undefined,
  config: BlendConfig
): ProjectManifest {
  const getSource = (key: BlendSourceKey): ProjectManifest => {
    if (key === 'C' && sourceC) return sourceC;
    if (key === 'B') return sourceB;
    return sourceA;
  };

  const structSource = getSource(config.selections.structure);
  const navSource = getSource(config.selections.navigation);
  const typoSource = getSource(config.selections.typography);
  const colourSource = getSource(config.selections.colour);
  const motionSource = getSource(config.selections.motion);
  const densitySource = getSource(config.selections.density);
  const geomSource = getSource(config.selections.geometry);
  const imgSource = getSource(config.selections.imagery);

  // Assemble blended Design DNA
  const blendedDNA: DesignDNA = {
    ...structSource.designDNA,

    // Typography
    typographicExpression: typoSource.designDNA.typographicExpression,
    typographyPersonality: typoSource.designDNA.typographyPersonality,

    // Colour
    colourfulness: colourSource.designDNA.colourfulness,
    contrast: colourSource.designDNA.contrast,
    visualMode: colourSource.designDNA.visualMode,

    // Motion
    motion: motionSource.designDNA.motion,
    motionPlayfulness: motionSource.designDNA.motionPlayfulness,
    motionPersonality: motionSource.designDNA.motionPersonality,

    // Density
    density: densitySource.designDNA.density,
    whitespace: densitySource.designDNA.whitespace,
    dataDensity: densitySource.designDNA.dataDensity,
    interactionDensity: densitySource.designDNA.interactionDensity,

    // Geometry
    curvature: geomSource.designDNA.curvature,
    depth: geomSource.designDNA.depth,
    asymmetry: geomSource.designDNA.asymmetry,
    geometryFamily: geomSource.designDNA.geometryFamily,

    // Imagery
    imageryIntensity: imgSource.designDNA.imageryIntensity,
    videoIntensity: imgSource.designDNA.videoIntensity,
    threeDIntensity: imgSource.designDNA.threeDIntensity,
  };

  // Clone screens from structural source
  const screens = JSON.parse(JSON.stringify(structSource.screens)) as typeof structSource.screens;

  const now = new Date().toISOString();

  return {
    schemaVersion: '1.0.0',
    id: `proj-blend-${Date.now()}`,
    name: config.name ?? `Blend of ${sourceA.name} & ${sourceB.name}`,
    description: `Synthesized design blend combining structure from ${config.selections.structure}, styling from ${config.selections.colour}, and typography from ${config.selections.typography}.`,
    createdAt: now,
    updatedAt: now,
    catalogVersion: structSource.catalogVersion,
    seed: `seed-blend-${Date.now()}`,
    productModel: JSON.parse(JSON.stringify(structSource.productModel)),
    designDNA: blendedDNA,
    brand: typoSource.brand ?? colourSource.brand,
    constraints: JSON.parse(JSON.stringify(structSource.constraints)),
    screenGraph: JSON.parse(JSON.stringify(structSource.screenGraph)),
    screens,
    navigation: JSON.parse(JSON.stringify(navSource.navigation)),
    assets: JSON.parse(JSON.stringify(structSource.assets)),
    locks: JSON.parse(JSON.stringify(structSource.locks)),
    historyMeta: {
      headRevision: 0,
      totalOperations: 0,
    },
    exportSettings: { ...structSource.exportSettings },
  };
}
