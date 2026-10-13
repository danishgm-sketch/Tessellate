import type {
  ProductModel,
  ScreenGraph,
  DesignDNA,
} from '@tessellate/schemas';
import { DEFAULT_DESIGN_DNA } from '@tessellate/dna';
import { SeededRandom } from './prng.js';
import { COMPOSITION_GRAMMARS, type NavigationStyle } from './grammars.js';

export interface GeneratedDirection {
  id: 'direction-a' | 'direction-b' | 'direction-c';
  type: 'conservative' | 'expressive' | 'structural-alternative';
  name: string;
  tagline: string;
  rationale: string;
  dna: DesignDNA;
  navigationModel: NavigationStyle;
  primaryGrammarId: string;
  layoutFamily: string;
  divergenceSummary: {
    visualAmbitionDelta: number;
    structuralCreativityDelta: number;
    notes: string[];
  };
}

export interface DirectionGenerationInput {
  productModel: ProductModel;
  screenGraph?: ScreenGraph;
  baseDna?: Partial<DesignDNA>;
  seed?: string | number;
}

export interface DirectionGenerationResult {
  directionA: GeneratedDirection;
  directionB: GeneratedDirection;
  directionC: GeneratedDirection;
  seedUsed: string | number;
}

const DIRECTION_NAMES: Record<
  string,
  {
    conservative: { name: string; tagline: string };
    expressive: { name: string; tagline: string };
    structural: { name: string; tagline: string };
  }
> = {
  fintech: {
    conservative: { name: 'Institutional Ledger', tagline: 'Rock-solid compliance and dense telemetry.' },
    expressive: { name: 'Kinetic Capital', tagline: 'Dynamic market pulse and high-contrast typography.' },
    structural: { name: 'Command Terminal', tagline: 'Docked multi-pane workspace with keyboard shortcuts.' },
  },
  ai: {
    conservative: { name: 'Assisted Workspace', tagline: 'Reliable assistant side-rail with clean cards.' },
    expressive: { name: 'Neural Flow', tagline: 'Fluid generative stream and ambient reactive motion.' },
    structural: { name: 'Infinite Synthesis', tagline: 'Spatial prompt canvas with graph-driven exploration.' },
  },
  'developer-tools': {
    conservative: { name: 'Console Standard', tagline: 'Familiar sidebar navigation and crisp monospaced output.' },
    expressive: { name: 'Cyber Terminal', tagline: 'High-energy developer aesthetic with vivid syntax highlights.' },
    structural: { name: 'Three-Pane Cockpit', tagline: 'Unified editor, runtime logs, and inspector panes.' },
  },
  saas: {
    conservative: { name: 'Clean Operations', tagline: 'Familiar executive overview and dependable card grids.' },
    expressive: { name: 'Vibrant Velocity', tagline: 'Bold brand accents, spring micro-motion, and rich cards.' },
    structural: { name: 'Master-Detail Explorer', tagline: 'Split-view density for high-throughput records triage.' },
  },
  default: {
    conservative: { name: 'Calm Foundation', tagline: 'Disciplined hierarchy and maximum accessibility.' },
    expressive: { name: 'Expressive Horizon', tagline: 'Elevated visual ambition and crafted motion.' },
    structural: { name: 'Adaptive Architecture', tagline: 'Alternative spatial topology tailored to rapid workflows.' },
  },
};

/**
 * Deterministically generates exactly three distinct product directions:
 * - Direction A: Conservative Fit (closest to baseline, familiar grammar, high a11y/perf priority)
 * - Direction B: Expressive Fit (elevated visual ambition, motion, typographic expression)
 * - Direction C: Structural Alternative (elevated structural creativity, alternative layout & nav model)
 */
export function generateDirections(input: DirectionGenerationInput): DirectionGenerationResult {
  const { productModel, seed = 'tessellate-seed-default' } = input;
  const baseDna: DesignDNA = {
    ...DEFAULT_DESIGN_DNA,
    ...(input.baseDna ?? {}),
  };
  const rng = new SeededRandom(seed);

  const primaryArch = productModel.productArchetypes[0]?.tag ?? 'saas';
  const namePack = DIRECTION_NAMES[primaryArch] ?? DIRECTION_NAMES['default']!;

  // 1. DIRECTION A: Conservative Fit
  const dnaA: DesignDNA = {
    ...baseDna,
    structuralCreativity: Math.max(10, (baseDna.structuralCreativity ?? 35) - 15),
    visualAmbition: Math.max(15, (baseDna.visualAmbition ?? 40) - 10),
    accessibilityPriority: Math.min(100, (baseDna.accessibilityPriority ?? 60) + 20),
    performancePriority: Math.min(100, (baseDna.performancePriority ?? 60) + 15),
    curvature: Math.max(10, (baseDna.curvature ?? 40) - 10),
    motionPlayfulness: Math.max(0, (baseDna.motionPlayfulness ?? 30) - 20),
  };

  const navModelA: NavigationStyle = 'sidebar';
  const grammarA = COMPOSITION_GRAMMARS['classic-sidebar-dashboard'] ?? Object.values(COMPOSITION_GRAMMARS)[0]!;

  const directionA: GeneratedDirection = {
    id: 'direction-a',
    type: 'conservative',
    name: namePack.conservative.name,
    tagline: namePack.conservative.tagline,
    rationale:
      'Closest to inferred product priors with standard sidebar navigation, reinforced accessibility floors, and rock-solid predictable ergonomics.',
    dna: dnaA,
    navigationModel: navModelA,
    primaryGrammarId: grammarA.id,
    layoutFamily: grammarA.layoutFamily,
    divergenceSummary: {
      visualAmbitionDelta: -10,
      structuralCreativityDelta: -15,
      notes: [
        'Reduced visual ambition to guarantee low cognitive load.',
        'Maximized accessibility and performance priority thresholds.',
        'Standard hierarchical sidebar navigation.',
      ],
    },
  };

  // 2. DIRECTION B: Expressive Fit
  const dnaB: DesignDNA = {
    ...baseDna,
    visualAmbition: Math.min(95, (baseDna.visualAmbition ?? 40) + 25),
    structuralCreativity: baseDna.structuralCreativity ?? 35, // same structural familiar grammar
    typographicExpression: Math.min(95, (baseDna.typographicExpression ?? 45) + 25),
    motion: Math.min(90, (baseDna.motion ?? 40) + 20),
    motionPlayfulness: Math.min(85, (baseDna.motionPlayfulness ?? 30) + 25),
    imageryIntensity: Math.min(90, (baseDna.imageryIntensity ?? 30) + 20),
    colourfulness: Math.min(85, (baseDna.colourfulness ?? 35) + 20),
    depth: Math.min(80, (baseDna.depth ?? 30) + 15),
  };

  const navModelB: NavigationStyle = 'top-nav';
  const grammarB =
    COMPOSITION_GRAMMARS['product-proof-marketing'] ??
    COMPOSITION_GRAMMARS['dense-analytical-dashboard'] ??
    grammarA;

  const directionB: GeneratedDirection = {
    id: 'direction-b',
    type: 'expressive',
    name: namePack.expressive.name,
    tagline: namePack.expressive.tagline,
    rationale:
      'Elevated aesthetic expression, richer motion personalities, and bolder typographic presence while maintaining identical functional workflow jobs.',
    dna: dnaB,
    navigationModel: navModelB,
    primaryGrammarId: grammarB.id,
    layoutFamily: grammarB.layoutFamily,
    divergenceSummary: {
      visualAmbitionDelta: +25,
      structuralCreativityDelta: 0,
      notes: [
        'Increased visual ambition and typographic expression.',
        'Enhanced kinetic motion and layered depth.',
        'Maintains familiar structural jobs and workflows.',
      ],
    },
  };

  // 3. DIRECTION C: Structural Alternative
  const dnaC: DesignDNA = {
    ...baseDna,
    structuralCreativity: Math.min(95, (baseDna.structuralCreativity ?? 35) + 30),
    visualAmbition: Math.min(85, (baseDna.visualAmbition ?? 40) + 10),
    interactionDensity: Math.min(90, (baseDna.interactionDensity ?? 50) + 20),
    asymmetry: Math.min(80, (baseDna.asymmetry ?? 25) + 25),
  };

  // Pick alternative navigation model and grammar
  const candidateNavs: NavigationStyle[] = ['command-palette', 'rail', 'header-minimal'];
  const navModelC = rng.pick(candidateNavs) ?? 'rail';

  let grammarC = COMPOSITION_GRAMMARS['three-pane-intelligence-workspace'];
  if (primaryArch === 'fintech' || primaryArch === 'developer-tools') {
    grammarC = COMPOSITION_GRAMMARS['research-terminal'] ?? grammarC;
  } else if (primaryArch === 'creative-portfolio') {
    grammarC = COMPOSITION_GRAMMARS['canvas-workspace'] ?? grammarC;
  }
  if (!grammarC) {
    grammarC = COMPOSITION_GRAMMARS['dense-analytical-dashboard'] ?? grammarA;
  }

  const directionC: GeneratedDirection = {
    id: 'direction-c',
    type: 'structural-alternative',
    name: namePack.structural.name,
    tagline: namePack.structural.tagline,
    rationale:
      'Explores an inventive structural topology (three-pane workspace or docked terminal) with higher interaction density and alternative spatial navigation.',
    dna: dnaC,
    navigationModel: navModelC,
    primaryGrammarId: grammarC.id,
    layoutFamily: grammarC.layoutFamily,
    divergenceSummary: {
      visualAmbitionDelta: +10,
      structuralCreativityDelta: +30,
      notes: [
        'Meaningfully elevated structural creativity.',
        `Alternative navigation topology (${navModelC}) and layout family (${grammarC.layoutFamily}).`,
        'High interaction density for professional power users.',
      ],
    },
  };

  return {
    directionA,
    directionB,
    directionC,
    seedUsed: seed,
  };
}
