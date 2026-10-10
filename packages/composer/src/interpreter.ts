import {
  type ProductModel,
  type ProjectConstraints,
  ProductModelSchema,
} from '@tessellate/schemas';
import { detectProductArchetypes, getProductArchetype } from './archetypes.js';
import { findBlueprintByArchetype } from './blueprints.js';

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
}

/**
 * Deterministically interprets a product brief into a validated ProductModel without an LLM.
 * Extracts archetypes, estimates complexity metrics, derives JTBD, entities, and workflows.
 */
export function interpretProductBrief(input: ProductBriefInput): InterpretedProduct {
  const assumptions: string[] = [];
  const text = input.description.trim();

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

  return {
    productModel,
    inferredAssumptions: assumptions,
  };
}
