import { ProjectManifestSchema, type ProjectManifest } from '@tessellate/schemas';

export interface RecoveryResult {
  status: 'valid' | 'recovered' | 'safe_mode';
  manifest: ProjectManifest;
  rawRecord: string;
  repairedIssues: string[];
  safeModeMessage?: string;
}

const DEFAULT_DESIGN_DNA = {
  professionalism: 50,
  playfulness: 50,
  luxury: 50,
  warmth: 50,
  technicality: 50,
  editorial: 50,
  futurism: 50,
  visualAmbition: 50,
  structuralCreativity: 50,
  density: 50,
  whitespace: 50,
  contrast: 50,
  colourfulness: 50,
  curvature: 50,
  depth: 50,
  motion: 50,
  motionPlayfulness: 50,
  typographicExpression: 50,
  imageryIntensity: 50,
  videoIntensity: 0,
  threeDIntensity: 0,
  dataDensity: 50,
  interactionDensity: 50,
  asymmetry: 50,
  conversionIntensity: 50,
  trust: 80,
  accessibilityPriority: 80,
  performancePriority: 80,
  primaryArchetype: 'general-web',
  visualMode: 'light' as const,
  geometryFamily: 'rounded-corporate',
  navigationModel: 'header-standard',
  responsivePhilosophy: 'stack-and-scroll',
  contentTone: 'approachable-direct',
  primaryStack: 'react-tailwind',
  motionPersonality: 'smooth-standard',
  typographyPersonality: 'modern-sans',
  surfacePersonality: 'clean-flat',
};

/**
 * Migrates older or unversioned project manifests to current schema version
 */
export function migrateManifestVersion(raw: Record<string, unknown>): Record<string, unknown> {
  const now = new Date().toISOString();
  const id = typeof raw.id === 'string' && raw.id ? raw.id : `proj_rec_${Date.now()}`;
  const name = typeof raw.name === 'string' && raw.name ? raw.name : 'Recovered Project';

  const rawDNA = (typeof raw.designDNA === 'object' && raw.designDNA !== null ? raw.designDNA : {}) as Record<string, unknown>;
  const designDNA = { ...DEFAULT_DESIGN_DNA, ...rawDNA };

  const rawScreens = Array.isArray(raw.screens) && raw.screens.length > 0 ? raw.screens : [{ id: 'scr_1', name: 'Home', slug: 'home' }];

  const screens = rawScreens.map((s, idx) => {
    const sObj = (typeof s === 'object' && s !== null ? s : {}) as Record<string, unknown>;
    const screenId = typeof sObj.id === 'string' && sObj.id ? sObj.id : `scr_${idx + 1}`;
    const screenName = typeof sObj.name === 'string' && sObj.name ? sObj.name : `Screen ${idx + 1}`;
    const screenSlug = typeof sObj.slug === 'string' && sObj.slug ? sObj.slug : `screen-${idx + 1}`;

    const rootNode = (typeof sObj.rootNode === 'object' && sObj.rootNode !== null ? sObj.rootNode : {
      id: `node_root_${screenId}`,
      nodeType: 'section',
      semanticRole: 'main-content',
      children: [],
      slots: {},
      props: {},
    }) as Record<string, unknown>;

    return {
      id: screenId,
      screenNodeId: screenId,
      name: screenName,
      slug: screenSlug,
      rootNode,
    };
  });

  const screenNodes = screens.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    screenType: 'dashboard',
    purpose: 'Main functional surface',
    jobs: ['Display information'],
    required: true,
    navigationVisibility: 'primary' as const,
    importance: 80,
    expectedData: [],
    requiredRoles: ['main-content'],
    optionalRoles: [],
  }));

  const screenGraph = {
    id: `sg_${id}`,
    groups: [
      {
        id: `grp_main_${id}`,
        name: 'Main Views',
        screens: screenNodes,
      },
    ],
    edges: [],
  };

  const productModel = (typeof raw.productModel === 'object' && raw.productModel !== null ? raw.productModel : {
    schemaVersion: '1.0.0',
    productArchetypes: [{ tag: 'general', weight: 80 }],
    primaryAudience: 'General Users',
    userSophistication: 50,
    primaryObjective: 'Provide productive interface',
    secondaryObjectives: [],
    jobsToBeDone: ['Interact with application'],
    entities: [],
    workflows: [],
    trustRequirement: 70,
    informationComplexity: 50,
    dataDensity: 50,
    collaborationLevel: 30,
    transactionCriticality: 40,
    navigationComplexity: 40,
    mobileImportance: 60,
    likelyScreens: [],
    requiredCapabilities: [],
    forbiddenPatterns: [],
    constraints: {
      accessibilityFloor: 'AA' as const,
      targetDevices: ['desktop', 'tablet', 'mobile'] as const,
    },
  });

  return {
    schemaVersion: '1.0.0',
    id,
    name,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    catalogVersion: '1.0.0',
    seed: typeof raw.seed === 'string' ? raw.seed : 'seed_recovered',
    productModel,
    designDNA,
    constraints: {
      accessibilityFloor: 'AA',
      targetDevices: ['desktop', 'tablet', 'mobile'],
    },
    screenGraph,
    screens,
    navigation: {
      model: 'header-standard',
      primaryItems: screens.map((s) => ({ label: s.name, targetScreenId: s.id })),
    },
    assets: [],
    locks: [],
    historyMeta: {
      totalOperations: 0,
      headRevision: 0,
    },
    exportSettings: {
      framework: 'react',
      styling: 'tailwind',
      includeTypes: true,
      target: 'vite-react-tailwind',
    },
  };
}

/**
 * Recovers a raw string or JSON record into a valid ProjectManifest.
 * Guarantees zero data loss by always preserving rawRecord, and enters
 * a recoverable safe mode when necessary per AGENTS.md Section 12.
 */
export function recoverProjectManifest(input: unknown): RecoveryResult {
  const rawRecord = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
  const repairedIssues: string[] = [];

  let parsed: unknown;
  try {
    parsed = typeof input === 'string' ? JSON.parse(input) : input;
  } catch (err) {
    repairedIssues.push(`JSON Parse Error: ${(err as Error).message}`);
    const safeManifest = migrateManifestVersion({}) as unknown as ProjectManifest;
    return {
      status: 'safe_mode',
      manifest: safeManifest,
      rawRecord,
      repairedIssues,
      safeModeMessage: 'Project file was corrupted and unparseable. Entered recoverable Safe Mode with raw record preserved.',
    };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    repairedIssues.push('Project manifest root is not an object');
    const safeManifest = migrateManifestVersion({}) as unknown as ProjectManifest;
    return {
      status: 'safe_mode',
      manifest: safeManifest,
      rawRecord,
      repairedIssues,
      safeModeMessage: 'Project manifest root was non-object. Entered recoverable Safe Mode with raw record preserved.',
    };
  }

  // First check if directly valid
  const directCheck = ProjectManifestSchema.safeParse(parsed);
  if (directCheck.success) {
    return {
      status: 'valid',
      manifest: directCheck.data,
      rawRecord,
      repairedIssues: [],
    };
  }

  // Record structural issues found
  for (const issue of directCheck.error.issues) {
    repairedIssues.push(`${issue.path.join('.')}: ${issue.message}`);
  }

  // Attempt structural migration and repair
  const migrated = migrateManifestVersion(parsed as Record<string, unknown>);
  const migratedCheck = ProjectManifestSchema.safeParse(migrated);

  if (migratedCheck.success) {
    return {
      status: 'recovered',
      manifest: migratedCheck.data,
      rawRecord,
      repairedIssues,
    };
  }

  // Fallback to safe mode
  const fallback = migrateManifestVersion({}) as unknown as ProjectManifest;
  return {
    status: 'safe_mode',
    manifest: fallback,
    rawRecord,
    repairedIssues: [...repairedIssues, ...migratedCheck.error.issues.map((i) => `Post-migration: ${i.path.join('.')}: ${i.message}`)],
    safeModeMessage: 'Schema validation required recovery to safe defaults while preserving raw input.',
  };
}
