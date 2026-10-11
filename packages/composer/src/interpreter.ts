import {
  type ProductModel,
  type ProjectConstraints,
  type DesignDNA,
  ProductModelSchema,
  DesignDNASchema,
} from '@tessellate/schemas';
import {
  DEFAULT_DESIGN_DNA,
  DNA_PRESETS,
  applyFeelDescriptors,
  clampScore,
} from '@tessellate/dna';
import { detectProductArchetypes, getProductArchetype } from './archetypes.js';
import { findBlueprintByArchetype, type ProductBlueprint } from './blueprints.js';

export interface ProductBriefInput {
  description: string;
  archetypeOverride?: string;
  audience?: string;
  objective?: string;
  feel?: string;
  visualAmbition?: number;
  structuralCreativity?: number;
  requiredScreens?: string[];
  forbiddenScreens?: string[];
  accessibilityFloor?: 'A' | 'AA' | 'AAA';
  performanceCeiling?: 'lightweight' | 'balanced' | 'rich';
  targetDevices?: Array<'desktop' | 'tablet' | 'mobile'>;
}

export interface InterpretedProduct {
  productModel: ProductModel;
  inferredAssumptions: string[];
  initialDesignDna: DesignDNA;
}

export function deriveInitialDesignDNA(
  primaryArchetype: string,
  blueprint: ProductBlueprint,
  input: ProductBriefInput
): DesignDNA {
  let base: DesignDNA = {
    ...DEFAULT_DESIGN_DNA,
    primaryArchetype,
    dataDensity: blueprint.priors.dataDensity,
    trust: blueprint.priors.trustRequirement,
    interactionDensity: blueprint.priors.informationComplexity,
  };

  if (blueprint.applicableDnaPresets && blueprint.applicableDnaPresets.length > 0) {
    const presetId = blueprint.applicableDnaPresets[0];
    const foundPreset = DNA_PRESETS.find((p) => p.id === presetId);
    if (foundPreset) {
      base = { ...foundPreset.dna };
    }
  }

  if (input.feel && input.feel.trim()) {
    base = applyFeelDescriptors(base, input.feel.trim());
  }

  if (typeof input.visualAmbition === 'number') {
    const va = clampScore(input.visualAmbition);
    base.visualAmbition = va;

    if (va <= 25) {
      base.motion = Math.min(base.motion ?? 40, 20);
      base.motionPlayfulness = Math.min(base.motionPlayfulness ?? 30, 10);
      base.motionPersonality = 'calm-precision';
      base.typographicExpression = Math.min(base.typographicExpression ?? 45, 30);
      base.imageryIntensity = Math.min(base.imageryIntensity ?? 30, 15);
      base.depth = Math.min(base.depth ?? 30, 15);
    } else if (va <= 50) {
      base.motion = clampScore((base.motion ?? 40) * 0.9);
      base.typographicExpression = clampScore(base.typographicExpression ?? 45);
    } else if (va <= 75) {
      base.motion = clampScore(Math.max(base.motion ?? 40, 55));
      base.typographicExpression = clampScore(Math.max(base.typographicExpression ?? 45, 60));
      base.imageryIntensity = clampScore(Math.max(base.imageryIntensity ?? 30, 50));
      base.depth = clampScore(Math.max(base.depth ?? 30, 45));
    } else {
      base.motion = clampScore(Math.max(base.motion ?? 40, 75));
      base.motionPlayfulness = clampScore(Math.max(base.motionPlayfulness ?? 30, 65));
      base.motionPersonality = 'playful-spring';
      base.typographicExpression = clampScore(Math.max(base.typographicExpression ?? 45, 80));
      base.imageryIntensity = clampScore(Math.max(base.imageryIntensity ?? 30, 75));
      base.depth = clampScore(Math.max(base.depth ?? 30, 70));
    }
  }

  if (typeof input.structuralCreativity === 'number') {
    const sc = clampScore(input.structuralCreativity);
    base.structuralCreativity = sc;
    if (sc >= 70) {
      base.asymmetry = clampScore(Math.max(base.asymmetry ?? 25, 45));
      base.interactionDensity = clampScore(Math.max(base.interactionDensity ?? 50, 65));
    } else if (sc <= 30) {
      base.asymmetry = clampScore(Math.min(base.asymmetry ?? 25, 15));
    }
  }

  if (input.accessibilityFloor === 'AAA') {
    base.accessibilityPriority = Math.max(base.accessibilityPriority ?? 60, 95);
    base.contrast = Math.max(base.contrast ?? 60, 85);
  } else if (input.accessibilityFloor === 'AA') {
    base.accessibilityPriority = Math.max(base.accessibilityPriority ?? 60, 80);
  }

  if (input.performanceCeiling === 'lightweight') {
    base.performancePriority = Math.max(base.performancePriority ?? 60, 90);
    base.motion = Math.min(base.motion ?? 40, 25);
    base.videoIntensity = 0;
    base.threeDIntensity = 0;
  }

  return DesignDNASchema.parse(base);
}

/**
 * Deterministically interprets a product brief into a validated ProductModel without an LLM.
 * Extracts archetypes, estimates complexity metrics, derives JTBD, entities, and workflows.
 */
export function interpretProductBrief(input: ProductBriefInput): InterpretedProduct {
  const assumptions: string[] = [];
  const text = (input.description || (input as { prompt?: string }).prompt || '').trim();

  // 1. Detect archetypes
  const detectedArchetypes = detectProductArchetypes(text, input.archetypeOverride);
  const primaryTag = detectedArchetypes[0]?.tag ?? 'saas';
  const archetypeDef = getProductArchetype(primaryTag);
  const blueprint = findBlueprintByArchetype(primaryTag);

  assumptions.push(`Identified primary archetype as "${archetypeDef?.name ?? primaryTag}" based on domain vocabulary.`);

  // 2. Audience & Objective
  const audience = input.audience?.trim() || archetypeDef?.primaryAudience || 'Professional teams and operators';
  if (!input.audience) {
    assumptions.push(`Inferred target audience as "${audience}".`);
  }

  const primaryObjective = input.objective?.trim() || archetypeDef?.primaryObjective || 'Streamline workflows and manage resources';
  if (!input.objective) {
    assumptions.push(`Inferred primary objective: "${primaryObjective}".`);
  }

  // 3. User Sophistication & Metric Priors
  let userSophistication = blueprint.priors.userSophistication;
  let trustRequirement = blueprint.priors.trustRequirement;
  let informationComplexity = blueprint.priors.informationComplexity;
  let dataDensity = blueprint.priors.dataDensity;
  let collaborationLevel = blueprint.priors.collaborationLevel;
  let transactionCriticality = blueprint.priors.transactionCriticality;
  let navigationComplexity = blueprint.priors.navigationComplexity;
  let mobileImportance = blueprint.priors.mobileImportance;

  // Nuanced keyword tuning
  const lower = text.toLowerCase();
  if (lower.includes('developer') || lower.includes('engineer') || lower.includes('terminal')) {
    userSophistication = Math.min(100, userSophistication + 15);
    dataDensity = Math.min(100, dataDensity + 10);
    assumptions.push('Elevated technical user sophistication due to developer/terminal focus.');
  }

  if (lower.includes('bank') || lower.includes('security') || lower.includes('compliance') || lower.includes('confidential')) {
    trustRequirement = Math.min(100, trustRequirement + 15);
    assumptions.push('Elevated trust & compliance requirement to maximum priority.');
  }

  if (lower.includes('team') || lower.includes('collaborat') || lower.includes('multiplayer')) {
    collaborationLevel = Math.min(100, collaborationLevel + 20);
    assumptions.push('Elevated collaboration requirement for multi-user workflow.');
  }

  if (lower.includes('checkout') || lower.includes('payment') || lower.includes('transaction') || lower.includes('order')) {
    transactionCriticality = Math.min(100, transactionCriticality + 20);
    assumptions.push('Elevated transaction criticality for fiscal operations.');
  }

  if (lower.includes('analytics') || lower.includes('scientific') || lower.includes('telemetry') || lower.includes('dataset')) {
    informationComplexity = Math.min(100, informationComplexity + 15);
    assumptions.push('Elevated information complexity for dense telemetry and dataset analysis.');
  }

  if (lower.includes('nested') || lower.includes('hierarchy') || lower.includes('multi-level')) {
    navigationComplexity = Math.min(100, navigationComplexity + 15);
    assumptions.push('Elevated navigation complexity for deep hierarchical structures.');
  }

  if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android') || lower.includes('phone')) {
    mobileImportance = Math.min(100, mobileImportance + 20);
    assumptions.push('Prioritized mobile ergonomics and touch-first interaction.');
  }

  // 4. Jobs To Be Done (JTBD)
  const jobsToBeDone: string[] = [
    `Authenticate and access ${archetypeDef?.name ?? 'workspace'}`,
    `Inspect primary overview telemetry and health metrics`,
    `Create, update, and manage records`,
  ];

  if (archetypeDef) {
    for (const wf of archetypeDef.defaultWorkflows) {
      jobsToBeDone.push(wf.name);
    }
  }

  // 5. Entities & Workflows
  const entities = archetypeDef?.defaultEntities ?? [
    { name: 'Item', description: 'Core operational record', fields: ['id', 'title', 'createdAt'] },
  ];

  const workflows = archetypeDef?.defaultWorkflows ?? [
    { id: 'manage-record', name: 'Create and update record', steps: ['open-form', 'fill-fields', 'save'] },
  ];

  // 6. Likely Screens
  const likelyScreens = (archetypeDef?.recommendedScreens ?? []).map((s) => ({
    name: s.name,
    screenType: s.screenType,
    purpose: s.purpose,
    jobs: s.jobs,
  }));

  // 7. Constraints
  const constraints: ProjectConstraints = {
    accessibilityFloor: input.accessibilityFloor ?? 'AA',
    performanceCeiling: input.performanceCeiling ?? 'balanced',
    targetDevices: input.targetDevices ?? ['desktop', 'tablet', 'mobile'],
    requiredScreens: input.requiredScreens ?? [],
    forbiddenScreens: input.forbiddenScreens ?? [],
    requiredPatterns: [],
    forbiddenPatterns: blueprint.antiPatterns,
    allowedDependencies: ['react', 'tailwindcss', 'lucide-react'],
    prohibitedDependencies: ['jquery', 'bootstrap'],
  };

  const productModel = ProductModelSchema.parse({
    schemaVersion: '1.0.0',
    productArchetypes: detectedArchetypes,
    primaryAudience: audience,
    userSophistication,
    primaryObjective,
    secondaryObjectives: ['Ensure high accessibility standards', 'Maintain responsive layout across devices'],
    jobsToBeDone,
    entities,
    workflows,
    trustRequirement,
    informationComplexity,
    dataDensity,
    collaborationLevel,
    transactionCriticality,
    navigationComplexity,
    mobileImportance,
    likelyScreens,
    requiredCapabilities: archetypeDef?.requiredCapabilities ?? ['authentication', 'responsive-layout'],
    forbiddenPatterns: blueprint.antiPatterns,
    constraints,
  });

  if (input.feel && input.feel.trim()) {
    assumptions.push(`Applied feel descriptors "${input.feel}" with mathematical DNA adjustments.`);
  }
  if (typeof input.visualAmbition === 'number') {
    assumptions.push(`Applied Visual Ambition level ${input.visualAmbition} to motion, typography, and depth.`);
  }
  if (typeof input.structuralCreativity === 'number') {
    assumptions.push(`Applied Structural Creativity level ${input.structuralCreativity} to spatial topology.`);
  }

  const initialDesignDna = deriveInitialDesignDNA(primaryTag, blueprint, input);

  return {
    productModel,
    inferredAssumptions: assumptions,
    initialDesignDna,
  };
}
