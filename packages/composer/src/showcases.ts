import type { ProjectManifest, DesignDNA } from '@tessellate/schemas';
import { ProjectManifestSchema } from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA } from '@tessellate/dna';
import { getPageComposition } from './page-compositions.js';

export interface ShowcaseProject {
  id: string;
  name: string;
  tagline: string;
  archetypeId: string;
  navigationModel: string;
  dnaPresetName: string;
  colorMode: 'light' | 'dark' | 'adaptive';
  designDNA: DesignDNA;
  manifest: ProjectManifest;
}

const NOW = '2026-10-10T12:00:00.000Z';

function createShowcaseManifest(params: {
  id: string;
  name: string;
  description: string;
  archetypeTag: string;
  dna: DesignDNA;
  navigationModel: string;
  navItems: Array<{ label: string; targetScreenId: string; icon?: string }>;
  pageIds: string[];
}): ProjectManifest {
  const screens = params.pageIds.map((pId) => {
    const comp = getPageComposition(pId);
    if (!comp) {
      throw new Error(`Unknown page composition: ${pId}`);
    }
    return comp.createScreen();
  });

  const screenNodes = screens.map((s, idx) => ({
    id: s.screenNodeId,
    name: s.name,
    slug: s.slug,
    screenType: s.name.toLowerCase().replace(/\s+/g, '-'),
    purpose: s.name,
    jobs: ['inspect-view'],
    required: idx === 0,
    navigationVisibility: (idx < 5 ? 'primary' : 'secondary') as 'primary' | 'secondary' | 'hidden',
    importance: 80 - idx * 5,
    expectedData: ['records'],
    requiredRoles: ['content'],
    optionalRoles: [],
  }));

  const manifest: ProjectManifest = {
    schemaVersion: '1.0.0',
    id: params.id,
    name: params.name,
    description: params.description,
    createdAt: NOW,
    updatedAt: NOW,
    catalogVersion: '1.0.0',
    seed: `seed_${params.id}`,
    productModel: {
      schemaVersion: '1.0.0',
      productArchetypes: [{ tag: params.archetypeTag, weight: 100 }],
      primaryAudience: 'Domain specialists',
      userSophistication: params.dna.technicality,
      primaryObjective: params.description,
      secondaryObjectives: ['Maximize workflow speed and cognitive clarity'],
      jobsToBeDone: ['Analyze domain data', 'Execute actions', 'Inspect telemetry'],
      entities: [],
      workflows: [],
      trustRequirement: params.dna.trust,
      informationComplexity: params.dna.dataDensity,
      dataDensity: params.dna.dataDensity,
      collaborationLevel: 50,
      transactionCriticality: 70,
      navigationComplexity: 60,
      mobileImportance: 50,
      likelyScreens: [],
      requiredCapabilities: ['export', 'search', 'audit'],
      forbiddenPatterns: [],
      constraints: {
        targetDevices: ['desktop', 'tablet'],
        accessibilityFloor: 'AA',
        performanceCeiling: 'rich',
      },
    },
    designDNA: params.dna,
    constraints: {
      targetDevices: ['desktop', 'tablet'],
      accessibilityFloor: 'AA',
      performanceCeiling: 'rich',
    },
    screenGraph: {
      id: `sg_${params.id}`,
      groups: [
        {
          id: 'group_main',
          name: 'Main Workspace',
          screens: screenNodes,
        },
      ],
      edges: screenNodes.slice(1).map((s, idx) => ({
        id: `edge_${idx}`,
        fromScreenId: screenNodes[0]!.id,
        toScreenId: s.id,
      })),
    },
    screens,
    navigation: {
      model: params.navigationModel,
      primaryItems: params.navItems,
    },
    assets: [],
    locks: [],
    historyMeta: {
      totalOperations: 12,
      headRevision: 1,
    },
    exportSettings: {
      framework: 'react',
      styling: 'tailwind',
      includeTypes: true,
      target: 'vite-react-tailwind',
    },
  };

  return ProjectManifestSchema.parse(manifest);
}

// 1. Financial Intelligence Terminal (Dense/Dark, Cockpit)
const dnaFinancial: DesignDNA = {
  ...DEFAULT_DESIGN_DNA,
  professionalism: 98,
  playfulness: 5,
  luxury: 50,
  warmth: 15,
  technicality: 98,
  editorial: 50,
  futurism: 65,
  visualAmbition: 50,
  structuralCreativity: 40,
  density: 95,
  whitespace: 20,
  contrast: 95,
  colourfulness: 25,
  curvature: 15,
  depth: 25,
  motion: 30,
  motionPlayfulness: 10,
  typographicExpression: 60,
  dataDensity: 98,
  interactionDensity: 90,
  asymmetry: 15,
  conversionIntensity: 25,
  trust: 98,
  accessibilityPriority: 95,
  performancePriority: 99,
  primaryArchetype: 'fintech',
  visualMode: 'dark',
  geometryFamily: 'sharp',
  navigationModel: 'cockpit-dense',
  responsivePhilosophy: 'desktop-dense-mobile-focused',
  contentTone: 'technical-authoritative',
  motionPersonality: 'snappy-productive',
  typographyPersonality: 'monospace-data',
  surfacePersonality: 'obsidian-subtle-borders',
};

// 2. AI Developer Platform (High Visual Ambition, Command First)
const dnaAiDev: DesignDNA = {
  ...DEFAULT_DESIGN_DNA,
  professionalism: 92,
  playfulness: 35,
  luxury: 55,
  warmth: 30,
  technicality: 95,
  editorial: 60,
  futurism: 95,
  visualAmbition: 92,
  structuralCreativity: 80,
  density: 70,
  whitespace: 60,
  contrast: 90,
  colourfulness: 65,
  curvature: 40,
  depth: 60,
  motion: 75,
  motionPlayfulness: 45,
  typographicExpression: 85,
  dataDensity: 70,
  interactionDensity: 85,
  asymmetry: 35,
  conversionIntensity: 65,
  trust: 92,
  accessibilityPriority: 96,
  performancePriority: 96,
  primaryArchetype: 'ai',
  visualMode: 'adaptive',
  geometryFamily: 'rounded',
  navigationModel: 'command-first',
  responsivePhilosophy: 'equal-capability-adaptive',
  contentTone: 'visionary-technical',
  motionPersonality: 'luxury-glide',
  typographyPersonality: 'future-display',
  surfacePersonality: 'luminous-glow',
};

// 3. Luxury Hospitality Marketplace (Warm Editorial, Split Horizontal)
const dnaHospitality: DesignDNA = {
  ...DEFAULT_DESIGN_DNA,
  professionalism: 95,
  playfulness: 20,
  luxury: 98,
  warmth: 85,
  technicality: 40,
  editorial: 96,
  futurism: 25,
  visualAmbition: 90,
  structuralCreativity: 75,
  density: 45,
  whitespace: 85,
  contrast: 85,
  colourfulness: 45,
  curvature: 25,
  depth: 40,
  motion: 45,
  motionPlayfulness: 20,
  typographicExpression: 98,
  dataDensity: 40,
  interactionDensity: 50,
  asymmetry: 45,
  conversionIntensity: 70,
  trust: 98,
  accessibilityPriority: 96,
  performancePriority: 95,
  primaryArchetype: 'hospitality',
  visualMode: 'light',
  geometryFamily: 'classic-editorial',
  navigationModel: 'split-horizontal',
  responsivePhilosophy: 'mobile-first-progressive',
  contentTone: 'poetic-refined',
  motionPersonality: 'editorial-reveal',
  typographyPersonality: 'editorial-serif',
  surfacePersonality: 'warm-vellum-paper',
};

// 4. Playful Collaborative HR (Professional + Playful, Pill Rail)
const dnaHr: DesignDNA = {
  ...DEFAULT_DESIGN_DNA,
  professionalism: 85,
  playfulness: 75,
  luxury: 30,
  warmth: 85,
  technicality: 50,
  editorial: 60,
  futurism: 40,
  visualAmbition: 70,
  structuralCreativity: 65,
  density: 55,
  whitespace: 65,
  contrast: 80,
  colourfulness: 80,
  curvature: 65,
  depth: 45,
  motion: 65,
  motionPlayfulness: 70,
  typographicExpression: 70,
  dataDensity: 50,
  interactionDensity: 75,
  asymmetry: 25,
  conversionIntensity: 50,
  trust: 90,
  accessibilityPriority: 98,
  performancePriority: 96,
  primaryArchetype: 'hr',
  visualMode: 'light',
  geometryFamily: 'soft-pill',
  navigationModel: 'pill-rail',
  responsivePhilosophy: 'equal-capability-adaptive',
  contentTone: 'encouraging-joyful',
  motionPersonality: 'playful-spring',
  typographyPersonality: 'friendly-sans',
  surfacePersonality: 'pastel-cards',
};

// 5. High-End Ecommerce Brand (High-Ambition Commerce, Minimal Editorial)
const dnaEcommerce: DesignDNA = {
  ...DEFAULT_DESIGN_DNA,
  professionalism: 92,
  playfulness: 25,
  luxury: 92,
  warmth: 60,
  technicality: 35,
  editorial: 90,
  futurism: 50,
  visualAmbition: 92,
  structuralCreativity: 75,
  density: 45,
  whitespace: 80,
  contrast: 90,
  colourfulness: 55,
  curvature: 20,
  depth: 35,
  motion: 55,
  motionPlayfulness: 25,
  typographicExpression: 92,
  dataDensity: 45,
  interactionDensity: 60,
  asymmetry: 40,
  conversionIntensity: 85,
  trust: 95,
  accessibilityPriority: 97,
  performancePriority: 98,
  primaryArchetype: 'ecommerce',
  visualMode: 'light',
  geometryFamily: 'sharp-minimal',
  navigationModel: 'minimal-editorial',
  responsivePhilosophy: 'mobile-first-progressive',
  contentTone: 'chic-aspirational',
  motionPersonality: 'luxury-glide',
  typographyPersonality: 'monumental-display',
  surfacePersonality: 'monochrome-specular',
};

// 6. Scientific Research Environment (Low-Motion, High A11y, Three-Pane)
const dnaScience: DesignDNA = {
  ...DEFAULT_DESIGN_DNA,
  professionalism: 98,
  playfulness: 5,
  luxury: 25,
  warmth: 20,
  technicality: 98,
  editorial: 65,
  futurism: 50,
  visualAmbition: 45,
  structuralCreativity: 50,
  density: 80,
  whitespace: 45,
  contrast: 98,
  colourfulness: 20,
  curvature: 15,
  depth: 20,
  motion: 10,
  motionPlayfulness: 5,
  typographicExpression: 50,
  dataDensity: 92,
  interactionDensity: 85,
  asymmetry: 10,
  conversionIntensity: 15,
  trust: 99,
  accessibilityPriority: 100,
  performancePriority: 99,
  primaryArchetype: 'scientific',
  visualMode: 'adaptive',
  geometryFamily: 'rigorous-orthogonal',
  navigationModel: 'three-pane',
  responsivePhilosophy: 'equal-capability-adaptive',
  contentTone: 'rigorous-academic',
  motionPersonality: 'instant-utility',
  typographyPersonality: 'technical-mono-sans',
  surfacePersonality: 'clean-high-contrast',
};

// 7. Creator Analytics Product (Data-First Studio, Standard Sidebar)
const dnaCreator: DesignDNA = {
  ...DEFAULT_DESIGN_DNA,
  professionalism: 88,
  playfulness: 50,
  luxury: 40,
  warmth: 65,
  technicality: 80,
  editorial: 70,
  futurism: 65,
  visualAmbition: 75,
  structuralCreativity: 60,
  density: 75,
  whitespace: 50,
  contrast: 85,
  colourfulness: 75,
  curvature: 45,
  depth: 40,
  motion: 60,
  motionPlayfulness: 40,
  typographicExpression: 75,
  dataDensity: 85,
  interactionDensity: 80,
  asymmetry: 25,
  conversionIntensity: 60,
  trust: 92,
  accessibilityPriority: 97,
  performancePriority: 97,
  primaryArchetype: 'analytics',
  visualMode: 'adaptive',
  geometryFamily: 'rounded',
  navigationModel: 'sidebar-standard',
  responsivePhilosophy: 'equal-capability-adaptive',
  contentTone: 'insightful-empowering',
  motionPersonality: 'calm-precision',
  typographyPersonality: 'dynamic-metric',
  surfacePersonality: 'gradient-accented-cards',
};

// 8. Minimal Personal Productivity (Light/Minimal, Floating Dock)
const dnaProductivity: DesignDNA = {
  ...DEFAULT_DESIGN_DNA,
  professionalism: 92,
  playfulness: 15,
  luxury: 45,
  warmth: 40,
  technicality: 60,
  editorial: 80,
  futurism: 40,
  visualAmbition: 45,
  structuralCreativity: 45,
  density: 35,
  whitespace: 92,
  contrast: 85,
  colourfulness: 15,
  curvature: 30,
  depth: 25,
  motion: 20,
  motionPlayfulness: 15,
  typographicExpression: 75,
  dataDensity: 35,
  interactionDensity: 50,
  asymmetry: 20,
  conversionIntensity: 25,
  trust: 96,
  accessibilityPriority: 98,
  performancePriority: 99,
  primaryArchetype: 'productivity',
  visualMode: 'light',
  geometryFamily: 'subtle-radius',
  navigationModel: 'floating-dock',
  responsivePhilosophy: 'mobile-first-progressive',
  contentTone: 'quiet-zen',
  motionPersonality: 'soft-ease',
  typographyPersonality: 'understated-sans',
  surfacePersonality: 'monastic-white-canvas',
};

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  // 1. Financial Intelligence Terminal
  {
    id: 'showcase-financial-terminal',
    name: 'Apex Financial Intelligence Terminal',
    tagline: 'High-density institutional equity telemetry and risk analytics',
    archetypeId: 'fintech',
    navigationModel: 'cockpit-dense',
    dnaPresetName: 'dense-terminal',
    colorMode: 'dark',
    designDNA: dnaFinancial,
    manifest: createShowcaseManifest({
      id: 'showcase-financial-terminal',
      name: 'Apex Financial Intelligence Terminal',
      description: 'Institutional trading terminal with real-time order books and risk telemetry.',
      archetypeTag: 'fintech',
      dna: dnaFinancial,
      navigationModel: 'cockpit-dense',
      navItems: [
        { label: 'Overview', targetScreenId: 'node-app-overview' },
        { label: 'Analytics', targetScreenId: 'node-analytics-dashboard' },
        { label: 'Watchlists', targetScreenId: 'node-watchlists' },
        { label: 'Reports', targetScreenId: 'node-reports-library' },
      ],
      pageIds: ['app-overview-dashboard', 'analytics-dashboard-page', 'watchlists-page', 'reports-library'],
    }),
  },

  // 2. AI Developer Platform
  {
    id: 'showcase-ai-developer-platform',
    name: 'Synthetix AI Developer Platform',
    tagline: 'Autonomous agent orchestration canvas and prompt compiler',
    archetypeId: 'ai',
    navigationModel: 'command-first',
    dnaPresetName: 'future-command',
    colorMode: 'adaptive',
    designDNA: dnaAiDev,
    manifest: createShowcaseManifest({
      id: 'showcase-ai-developer-platform',
      name: 'Synthetix AI Developer Platform',
      description: 'Autonomous multi-agent orchestration canvas with live streaming telemetry.',
      archetypeTag: 'ai',
      dna: dnaAiDev,
      navigationModel: 'command-first',
      navItems: [
        { label: 'Home', targetScreenId: 'node-marketing-home' },
        { label: 'Workspace', targetScreenId: 'node-research-workspace' },
        { label: 'Developers', targetScreenId: 'node-developers' },
        { label: 'Integrations', targetScreenId: 'node-integrations' },
      ],
      pageIds: ['marketing-home', 'research-workspace', 'developer-api-landing', 'api-integrations'],
    }),
  },

  // 3. Luxury Hospitality Marketplace
  {
    id: 'showcase-luxury-hospitality',
    name: 'Velluto Private Estate Residences',
    tagline: 'Bespoke global villa reservations and editorial destination dossiers',
    archetypeId: 'hospitality',
    navigationModel: 'split-horizontal',
    dnaPresetName: 'luxury-editorial',
    colorMode: 'light',
    designDNA: dnaHospitality,
    manifest: createShowcaseManifest({
      id: 'showcase-luxury-hospitality',
      name: 'Velluto Private Estate Residences',
      description: 'Curated 5-star private estate reservations with editorial travel essays.',
      archetypeTag: 'hospitality',
      dna: dnaHospitality,
      navigationModel: 'split-horizontal',
      navItems: [
        { label: 'Residences', targetScreenId: 'node-marketing-home' },
        { label: 'Editorial', targetScreenId: 'node-blog' },
        { label: 'Story', targetScreenId: 'node-case-study' },
      ],
      pageIds: ['marketing-home', 'blog-editorial-index', 'case-study-page'],
    }),
  },

  // 4. Playful Collaborative HR
  {
    id: 'showcase-playful-hr',
    name: 'Kudos Team Culture & Hiring',
    tagline: 'Joyful applicant pipelines, peer recognition kudos, and people operations',
    archetypeId: 'hr',
    navigationModel: 'pill-rail',
    dnaPresetName: 'professional-playful',
    colorMode: 'light',
    designDNA: dnaHr,
    manifest: createShowcaseManifest({
      id: 'showcase-playful-hr',
      name: 'Kudos Team Culture & Hiring',
      description: 'Approachably joyful hiring pipelines and peer recognition kudos.',
      archetypeTag: 'hr',
      dna: dnaHr,
      navigationModel: 'pill-rail',
      navItems: [
        { label: 'Roster', targetScreenId: 'node-team-directory' },
        { label: 'Schedule', targetScreenId: 'node-schedule' },
        { label: 'Onboarding', targetScreenId: 'node-onboarding' },
      ],
      pageIds: ['team-directory', 'calendar-schedule', 'role-onboarding'],
    }),
  },

  // 5. High-End Ecommerce Brand
  {
    id: 'showcase-luxury-ecommerce',
    name: 'Atelier Chronos Horology',
    tagline: 'Artisanal mechanical timepieces and bespoke bespoke leatherwork catalogue',
    archetypeId: 'ecommerce',
    navigationModel: 'minimal-editorial',
    dnaPresetName: 'high-end-commerce',
    colorMode: 'light',
    designDNA: dnaEcommerce,
    manifest: createShowcaseManifest({
      id: 'showcase-luxury-ecommerce',
      name: 'Atelier Chronos Horology',
      description: 'Bespoke mechanical timepiece catalog and artisanal craftsmanship storytelling.',
      archetypeTag: 'ecommerce',
      dna: dnaEcommerce,
      navigationModel: 'minimal-editorial',
      navItems: [
        { label: 'Catalogue', targetScreenId: 'node-marketing-home' },
        { label: 'Specimen', targetScreenId: 'node-entity-detail' },
        { label: 'Pricing', targetScreenId: 'node-pricing' },
      ],
      pageIds: ['marketing-home', 'entity-detail-page', 'pricing-page'],
    }),
  },

  // 6. Scientific Research Environment
  {
    id: 'showcase-scientific-research',
    name: 'Cortex Laboratory Environment',
    tagline: 'High-contrast genomics sequencing analysis and molecular workbench',
    archetypeId: 'scientific',
    navigationModel: 'three-pane',
    dnaPresetName: 'scientific-instrument',
    colorMode: 'adaptive',
    designDNA: dnaScience,
    manifest: createShowcaseManifest({
      id: 'showcase-scientific-research',
      name: 'Cortex Laboratory Environment',
      description: 'Zero-distraction genomics sequence inspection with WCAG AAA contrast.',
      archetypeTag: 'scientific',
      dna: dnaScience,
      navigationModel: 'three-pane',
      navItems: [
        { label: 'Sequences', targetScreenId: 'node-entity-index' },
        { label: 'Workspace', targetScreenId: 'node-research-workspace' },
        { label: 'Telemetry', targetScreenId: 'node-analytics-dashboard' },
      ],
      pageIds: ['entity-index-page', 'research-workspace', 'analytics-dashboard-page'],
    }),
  },

  // 7. Creator Analytics Product
  {
    id: 'showcase-creator-analytics',
    name: 'Pulse Media Creator Studio',
    tagline: 'Multi-platform audience attribution and subscriber growth telemetry',
    archetypeId: 'analytics',
    navigationModel: 'sidebar-standard',
    dnaPresetName: 'data-first-analytical',
    colorMode: 'adaptive',
    designDNA: dnaCreator,
    manifest: createShowcaseManifest({
      id: 'showcase-creator-analytics',
      name: 'Pulse Media Creator Studio',
      description: 'Multi-platform creator subscriber revenue and attribution curves.',
      archetypeTag: 'analytics',
      dna: dnaCreator,
      navigationModel: 'sidebar-standard',
      navItems: [
        { label: 'Dashboard', targetScreenId: 'node-app-overview' },
        { label: 'Analytics', targetScreenId: 'node-analytics-dashboard' },
        { label: 'Billing', targetScreenId: 'node-billing' },
      ],
      pageIds: ['app-overview-dashboard', 'analytics-dashboard-page', 'billing-usage-page'],
    }),
  },

  // 8. Minimal Personal Productivity
  {
    id: 'showcase-minimal-productivity',
    name: 'Scribe Zen Monastic Notes',
    tagline: 'Distraction-free markdown thought buffer with zero cloud latency',
    archetypeId: 'productivity',
    navigationModel: 'floating-dock',
    dnaPresetName: 'quiet-productivity',
    colorMode: 'light',
    designDNA: dnaProductivity,
    manifest: createShowcaseManifest({
      id: 'showcase-minimal-productivity',
      name: 'Scribe Zen Monastic Notes',
      description: 'Monastic distraction-free thought buffer with instant local persistence.',
      archetypeTag: 'productivity',
      dna: dnaProductivity,
      navigationModel: 'floating-dock',
      navItems: [
        { label: 'Today', targetScreenId: 'node-tasks-approvals' },
        { label: 'Search', targetScreenId: 'node-global-search' },
        { label: 'Profile', targetScreenId: 'node-profile' },
      ],
      pageIds: ['tasks-approvals', 'global-search-page', 'profile-page'],
    }),
  },
];

export function getShowcaseProject(id: string): ShowcaseProject | undefined {
  return SHOWCASE_PROJECTS.find((s) => s.id === id);
}

export function getAllShowcaseProjects(): ShowcaseProject[] {
  return SHOWCASE_PROJECTS;
}
