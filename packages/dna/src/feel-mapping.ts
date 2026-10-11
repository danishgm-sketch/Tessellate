import {
  type DesignDNA,
  type DesignDNANumericKey,
  DESIGN_DNA_NUMERIC_KEYS,
  DesignDNASchema,
} from '@tessellate/schemas';
import { clampScore } from './dimensions.js';

export interface AdjectiveModifier {
  label: string;
  deltas: Partial<Record<DesignDNANumericKey, number>>;
  categoricalSuggestions?: {
    geometryFamily?: string;
    motionPersonality?: string;
    typographyPersonality?: string;
    surfacePersonality?: string;
    contentTone?: string;
  };
}

/**
 * Authoritative adjective mapping dictionary.
 * Each entry defines numeric score deltas (can be positive or negative) and categorical cues.
 */
export const FEEL_ADJECTIVE_MAP: Record<string, AdjectiveModifier> = {
  professional: {
    label: 'Professional',
    deltas: {
      professionalism: 30,
      trust: 20,
      motionPlayfulness: -20,
      asymmetry: -15,
    },
    categoricalSuggestions: {
      contentTone: 'calm',
      surfacePersonality: 'subtle-contrast',
    },
  },
  playful: {
    label: 'Playful',
    deltas: {
      playfulness: 40,
      curvature: 25,
      colourfulness: 20,
      motionPlayfulness: 35,
      professionalism: -10,
    },
    categoricalSuggestions: {
      geometryFamily: 'pill',
      motionPersonality: 'playful-spring',
      contentTone: 'enthusiastic',
    },
  },
  premium: {
    label: 'Premium',
    deltas: {
      whitespace: 25,
      typographicExpression: 25,
      depth: 15,
      visualAmbition: 20,
      trust: 15,
    },
    categoricalSuggestions: {
      motionPersonality: 'luxury-glide',
      surfacePersonality: 'subtle-contrast',
    },
  },
  luxury: {
    label: 'Luxury',
    deltas: {
      luxury: 45,
      whitespace: 30,
      typographicExpression: 30,
      colourfulness: -20,
      interactionDensity: -15,
      motion: -15,
    },
    categoricalSuggestions: {
      geometryFamily: 'sharp',
      motionPersonality: 'luxury-glide',
      contentTone: 'aspirational',
    },
  },
  technical: {
    label: 'Technical',
    deltas: {
      technicality: 40,
      dataDensity: 35,
      interactionDensity: 25,
      performancePriority: 20,
      curvature: -20,
    },
    categoricalSuggestions: {
      geometryFamily: 'sharp',
      motionPersonality: 'technical-mechanical',
      typographyPersonality: 'technical-mono-geist',
      contentTone: 'technical',
    },
  },
  cinematic: {
    label: 'Cinematic',
    deltas: {
      imageryIntensity: 40,
      videoIntensity: 40,
      motion: 30,
      visualAmbition: 35,
      depth: 25,
      typographicExpression: 20,
    },
    categoricalSuggestions: {
      motionPersonality: 'cinematic-slow',
      surfacePersonality: 'subtle-contrast',
    },
  },
  institutional: {
    label: 'Institutional',
    deltas: {
      professionalism: 35,
      trust: 35,
      density: 15,
      playfulness: -30,
      curvature: -20,
      asymmetry: -20,
    },
    categoricalSuggestions: {
      geometryFamily: 'sharp',
      motionPersonality: 'calm-precision',
      contentTone: 'authoritative',
    },
  },
  warm: {
    label: 'Warm',
    deltas: {
      warmth: 40,
      curvature: 15,
      colourfulness: 10,
    },
    categoricalSuggestions: {
      geometryFamily: 'curved',
      motionPersonality: 'soft-ease',
      contentTone: 'friendly',
    },
  },
  futuristic: {
    label: 'Futuristic',
    deltas: {
      futurism: 45,
      visualAmbition: 20,
      depth: 15,
      threeDIntensity: 25,
    },
    categoricalSuggestions: {
      motionPersonality: 'data-reactive',
      contentTone: 'expressive',
    },
  },
  future: {
    label: 'Future',
    deltas: {
      futurism: 45,
      visualAmbition: 20,
      depth: 15,
      threeDIntensity: 25,
    },
  },
  editorial: {
    label: 'Editorial',
    deltas: {
      editorial: 40,
      typographicExpression: 30,
      whitespace: 20,
    },
    categoricalSuggestions: {
      typographyPersonality: 'editorial-serif-geist',
      motionPersonality: 'editorial-reveal',
      contentTone: 'thoughtful',
    },
  },
  minimal: {
    label: 'Minimal',
    deltas: {
      whitespace: 30,
      colourfulness: -25,
      motion: -20,
      depth: -20,
      imageryIntensity: -20,
    },
    categoricalSuggestions: {
      geometryFamily: 'minimal',
      motionPersonality: 'minimal-fade',
      contentTone: 'understated',
    },
  },
  quiet: {
    label: 'Quiet',
    deltas: {
      whitespace: 30,
      colourfulness: -25,
      motion: -25,
      depth: -20,
      imageryIntensity: -20,
    },
    categoricalSuggestions: {
      geometryFamily: 'sharp',
      motionPersonality: 'instant-utility',
      contentTone: 'direct',
    },
  },
  dense: {
    label: 'Dense',
    deltas: {
      density: 40,
      dataDensity: 35,
      whitespace: -35,
    },
  },
  bold: {
    label: 'Bold',
    deltas: {
      contrast: 30,
      typographicExpression: 25,
      visualAmbition: 25,
    },
    categoricalSuggestions: {
      contentTone: 'bold',
      motionPersonality: 'energetic-bounce',
    },
  },
  calm: {
    label: 'Calm',
    deltas: {
      trust: 20,
      whitespace: 20,
      motion: -20,
      contrast: -15,
    },
    categoricalSuggestions: {
      motionPersonality: 'soft-ease',
      contentTone: 'calm',
    },
  },
  scientific: {
    label: 'Scientific',
    deltas: {
      technicality: 40,
      dataDensity: 30,
      trust: 25,
      playfulness: -25,
    },
    categoricalSuggestions: {
      typographyPersonality: 'scientific-sans-mono',
      motionPersonality: 'technical-mechanical',
      contentTone: 'technical',
    },
  },
  brutalist: {
    label: 'Brutalist',
    deltas: {
      asymmetry: 35,
      contrast: 40,
      structuralCreativity: 30,
      curvature: -40,
    },
    categoricalSuggestions: {
      geometryFamily: 'sharp',
      motionPersonality: 'instant-utility',
      typographyPersonality: 'brutalist-grotesk-mono',
    },
  },
  organic: {
    label: 'Organic',
    deltas: {
      curvature: 35,
      warmth: 25,
      technicality: -20,
    },
    categoricalSuggestions: {
      geometryFamily: 'curved',
      motionPersonality: 'organic-drift',
    },
  },
  accessible: {
    label: 'Accessible',
    deltas: {
      accessibilityPriority: 50,
      contrast: 30,
      motion: -25,
      threeDIntensity: -30,
    },
    categoricalSuggestions: {
      motionPersonality: 'reduced-motion-first',
    },
  },
  performant: {
    label: 'Performant',
    deltas: {
      performancePriority: 50,
      videoIntensity: -30,
      threeDIntensity: -40,
      motion: -20,
    },
  },
  fast: {
    label: 'Fast',
    deltas: {
      performancePriority: 45,
      motion: -20,
      videoIntensity: -25,
      threeDIntensity: -35,
    },
    categoricalSuggestions: {
      motionPersonality: 'instant-utility',
    },
  },
  commercial: {
    label: 'Commercial',
    deltas: {
      conversionIntensity: 40,
      trust: 20,
    },
  },
  conversion: {
    label: 'Conversion',
    deltas: {
      conversionIntensity: 45,
      trust: 20,
    },
  },
  contemporary: {
    label: 'Contemporary',
    deltas: {
      visualAmbition: 15,
      structuralCreativity: 15,
      curvature: 10,
    },
  },
  flashy: {
    label: 'Flashy',
    deltas: {
      colourfulness: 35,
      motion: 30,
      threeDIntensity: 35,
      visualAmbition: 30,
    },
  },
};

export interface ParsedDescriptorToken {
  word: string;
  weight: number; // positive or negative
  isModifier?: boolean;
}

export interface ParsedFeelResult {
  tokens: ParsedDescriptorToken[];
  accumulatedDeltas: Partial<Record<DesignDNANumericKey, number>>;
  categoricalSuggestions: Record<string, string>;
  recognizedAdjectives: string[];
}

/**
 * Returns list of recognized feel adjectives.
 */
export function getFeelAdjectiveList(): string[] {
  return Object.keys(FEEL_ADJECTIVE_MAP);
}

/**
 * Parses a compound or simple feel string and computes weighted dimension deltas.
 * Examples:
 * - "professional but playful"
 * - "luxury without being flashy"
 * - "institutional but contemporary"
 * - "technical, dense and fast"
 */
export function parseFeelDescriptors(input: string): ParsedFeelResult {
  const normalized = input.toLowerCase().trim();
  const accumulatedDeltas: Partial<Record<DesignDNANumericKey, number>> = {};
  const categoricalSuggestions: Record<string, string> = {};
  const recognizedAdjectives: string[] = [];
  const tokens: ParsedDescriptorToken[] = [];

  if (!normalized) {
    return { tokens, accumulatedDeltas, categoricalSuggestions, recognizedAdjectives };
  }

  // Check for conjunction patterns:
  // Pattern 1: "X without being Y" or "X without Y" or "X not Y"
  const withoutMatch = normalized.match(/^(.*?)\s+(?:without\s+being|without|not)\s+(.*)$/i);
  // Pattern 2: "X but Y" or "X yet Y" or "X while still Y"
  const contrastMatch = normalized.match(/^(.*?)\s+(?:but|yet|while\s+still)\s+(.*)$/i);

  if (withoutMatch && withoutMatch[1] && withoutMatch[2]) {
    const primaryPart = withoutMatch[1].trim();
    const excludedPart = withoutMatch[2].trim();

    const primaryAdjs = extractAdjectives(primaryPart);
    const excludedAdjs = extractAdjectives(excludedPart);

    for (const adj of primaryAdjs) {
      tokens.push({ word: adj, weight: 1.0 });
      recognizedAdjectives.push(adj);
    }
    for (const adj of excludedAdjs) {
      tokens.push({ word: adj, weight: -0.75, isModifier: true });
      recognizedAdjectives.push(`not ${adj}`);
    }
  } else if (contrastMatch && contrastMatch[1] && contrastMatch[2]) {
    const primaryPart = contrastMatch[1].trim();
    const secondaryPart = contrastMatch[2].trim();

    const primaryAdjs = extractAdjectives(primaryPart);
    const secondaryAdjs = extractAdjectives(secondaryPart);

    for (const adj of primaryAdjs) {
      tokens.push({ word: adj, weight: 1.0 });
      recognizedAdjectives.push(adj);
    }
    for (const adj of secondaryAdjs) {
      // Contrastive secondary: weight 0.7
      tokens.push({ word: adj, weight: 0.7 });
      recognizedAdjectives.push(adj);
    }
  } else {
    // Additive / list pattern: "X, Y and Z"
    const adjs = extractAdjectives(normalized);
    for (const adj of adjs) {
      tokens.push({ word: adj, weight: 0.85 });
      recognizedAdjectives.push(adj);
    }
  }

  // Collect active positive keys across tokens to prevent cross-penalty cancellation
  const activeBoostedKeys = new Set<DesignDNANumericKey>();
  for (const token of tokens) {
    if (token.weight > 0) {
      const entry = FEEL_ADJECTIVE_MAP[token.word];
      if (entry) {
        for (const [k, d] of Object.entries(entry.deltas)) {
          if (typeof d === 'number' && d > 0) {
            activeBoostedKeys.add(k as DesignDNANumericKey);
          }
        }
      }
    }
  }

  // Apply deltas with resolution rules
  for (const token of tokens) {
    const entry = FEEL_ADJECTIVE_MAP[token.word];
    if (!entry) continue;

    for (const [k, delta] of Object.entries(entry.deltas)) {
      const key = k as DesignDNANumericKey;
      if (typeof delta !== 'number') continue;

      let effectiveDelta = delta * token.weight;

      // In a compound descriptor ("professional but playful"),
      // do not let primary's negative delta squash secondary's positive goal!
      if (token.weight > 0 && delta < 0 && activeBoostedKeys.has(key)) {
        // Suppress or halve cross-cancellation
        effectiveDelta = 0;
      }

      accumulatedDeltas[key] = (accumulatedDeltas[key] ?? 0) + Math.round(effectiveDelta);
    }

    if (token.weight > 0 && entry.categoricalSuggestions) {
      for (const [catKey, catVal] of Object.entries(entry.categoricalSuggestions)) {
        if (!categoricalSuggestions[catKey]) {
          categoricalSuggestions[catKey] = catVal;
        }
      }
    }
  }

  return {
    tokens,
    accumulatedDeltas,
    categoricalSuggestions,
    recognizedAdjectives,
  };
}

/**
 * Extracts recognized adjectives from a text fragment.
 */
function extractAdjectives(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const matched: string[] = [];
  for (const word of words) {
    if (FEEL_ADJECTIVE_MAP[word]) {
      matched.push(word);
    }
  }
  return matched;
}

/**
 * Applies a feel query (e.g. "professional but playful") onto an existing DesignDNA object.
 * Returns a new, fully validated DesignDNA object.
 */
export function applyFeelDescriptors(
  base: DesignDNA,
  feelInput: string,
  intensity: number = 1.0
): DesignDNA {
  const parsed = parseFeelDescriptors(feelInput);
  const next: Record<string, unknown> = { ...base };

  for (const key of DESIGN_DNA_NUMERIC_KEYS) {
    const delta = parsed.accumulatedDeltas[key];
    if (typeof delta === 'number') {
      const current = typeof base[key] === 'number' ? (base[key] as number) : 50;
      next[key] = clampScore(current + delta * intensity);
    }
  }

  for (const [catKey, catVal] of Object.entries(parsed.categoricalSuggestions)) {
    if (catVal && next[catKey] !== undefined) {
      next[catKey] = catVal;
    }
  }

  return DesignDNASchema.parse(next);
}
