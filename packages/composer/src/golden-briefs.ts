import { type ProductBriefInput } from './interpreter.js';

export interface GoldenBrief {
  id: string;
  title: string;
  input: ProductBriefInput;
  expectedPrimaryArchetype: string;
  expectedArchetypeCategory: string;
  expectedPriors: {
    minTrustRequirement?: number;
    minDataDensity?: number;
    minSophistication?: number;
  };
  expectedScreens: string[];
}

export const GOLDEN_PRODUCT_BRIEFS: GoldenBrief[] = [
  // 1. Financial Intelligence Terminal
  {
    id: 'financial-intelligence-terminal',
    title: 'Financial Intelligence Terminal',
    input: {
      description:
        'A high-density financial intelligence trading terminal for equity analysts and portfolio managers, featuring real-time market data streams, order book depth, SEC filings research, and multi-asset risk telemetry.',
      feel: 'dense and technical',
      visualAmbition: 40,
      structuralCreativity: 35,
      accessibilityFloor: 'AA',
      performanceCeiling: 'rich',
      targetDevices: ['desktop'],
    },
    expectedPrimaryArchetype: 'fintech',
    expectedArchetypeCategory: 'finance',
    expectedPriors: {
      minTrustRequirement: 90,
      minDataDensity: 80,
      minSophistication: 70,
    },
    expectedScreens: [
      'screen-overview',
      'screen-collection-index',
      'screen-positions-and-risk',
      'screen-trade-history',
    ],
  },

  // 2. Playful HR Platform
  {
    id: 'playful-hr-platform',
    title: 'Playful HR Platform',
    input: {
      description:
        'An approachable, joyful team culture and applicant tracking hiring platform with visual candidate pipelines, peer recognition kudos, and friendly onboarding roadmaps.',
      feel: 'professional but playful',
      visualAmbition: 60,
      structuralCreativity: 50,
      accessibilityFloor: 'AA',
      performanceCeiling: 'balanced',
      targetDevices: ['desktop', 'tablet', 'mobile'],
    },
    expectedPrimaryArchetype: 'recruitment',
    expectedArchetypeCategory: 'operations',
    expectedPriors: {
      minTrustRequirement: 80,
      minDataDensity: 50,
    },
    expectedScreens: ['screen-workspace', 'screen-candidate-profile', 'screen-collection-index'],
  },

  // 3. Luxury Travel Marketplace
  {
    id: 'luxury-travel-marketplace',
    title: 'Luxury Travel Marketplace',
    input: {
      description:
        'A curated luxury hospitality and private villa marketplace connecting high-net-worth travelers with verified five-star estate hosts, bespoke concierge reservations, and editorial travel stories.',
      feel: 'luxury without being flashy',
      visualAmbition: 85,
      structuralCreativity: 55,
      accessibilityFloor: 'AA',
      performanceCeiling: 'rich',
      targetDevices: ['desktop', 'tablet', 'mobile'],
    },
    expectedPrimaryArchetype: 'travel',
    expectedArchetypeCategory: 'hospitality',
    expectedPriors: {
      minTrustRequirement: 85,
    },
    expectedScreens: ['screen-marketing-home', 'screen-property-detail'],
  },

  // 4. Developer Observability Platform
  {
    id: 'developer-observability-platform',
    title: 'Developer Observability Platform',
    input: {
      description:
        'A distributed tracing, real-time log streaming, and p99 latency observability platform for cloud infrastructure, CLI integration, and incident triage.',
      feel: 'technical and fast',
      visualAmbition: 45,
      structuralCreativity: 35,
      accessibilityFloor: 'AA',
      performanceCeiling: 'lightweight',
      targetDevices: ['desktop'],
    },
    expectedPrimaryArchetype: 'developer-tools',
    expectedArchetypeCategory: 'technical',
    expectedPriors: {
      minTrustRequirement: 85,
      minDataDensity: 85,
      minSophistication: 85,
    },
    expectedScreens: ['screen-trace-explorer', 'screen-overview', 'screen-span-detail'],
  },

  // 5. Minimalist Personal Finance Tool
  {
    id: 'minimalist-personal-finance',
    title: 'Minimalist Personal Finance Tool',
    input: {
      description:
        'A calm, distraction-free personal net worth tracker, cashflow envelope planner, and monthly savings goal calculator with zero advertising.',
      feel: 'calm, warm and minimal',
      visualAmbition: 25,
      structuralCreativity: 20,
      accessibilityFloor: 'AA',
      performanceCeiling: 'lightweight',
      targetDevices: ['desktop', 'tablet', 'mobile'],
    },
    expectedPrimaryArchetype: 'productivity',
    expectedArchetypeCategory: 'consumer',
    expectedPriors: {
      minTrustRequirement: 75,
    },
    expectedScreens: ['screen-overview', 'screen-workspace'],
  },

  // 6. Scientific Research Environment
  {
    id: 'scientific-research-environment',
    title: 'Scientific Research Environment',
    input: {
      description:
        'A reproducible laboratory data workspace and peer-reviewed dossier synthesis environment, mapping multi-hop chemical entity relationships and spectral charts.',
      feel: 'scientific and technical',
      visualAmbition: 40,
      structuralCreativity: 35,
      accessibilityFloor: 'AAA',
      performanceCeiling: 'balanced',
      targetDevices: ['desktop'],
    },
    expectedPrimaryArchetype: 'intelligence-research',
    expectedArchetypeCategory: 'research',
    expectedPriors: {
      minTrustRequirement: 90,
      minDataDensity: 85,
      minSophistication: 80,
    },
    expectedScreens: ['screen-workspace', 'screen-collection-index'],
  },
];

/**
 * Retrieves a golden brief by id.
 */
export function getGoldenBrief(id: string): GoldenBrief | undefined {
  return GOLDEN_PRODUCT_BRIEFS.find((b) => b.id === id);
}

/**
 * Retrieves all six golden product briefs.
 */
export function getAllGoldenBriefs(): readonly GoldenBrief[] {
  return GOLDEN_PRODUCT_BRIEFS;
}
