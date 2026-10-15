import { performance } from 'node:perf_hooks';
import {
  ProductModelSchema,
  ScreenGraphSchema,
  ProjectManifestSchema,
  type ResourceManifest,
  type ProjectManifest,
  type ProjectNode,
} from '../../packages/schemas/src/index.js';
import { composeProjectPipeline } from '../../packages/compatibility/src/compose-pipeline.js';
import { generateSourceTree } from '../../packages/exporter/src/source-tree.js';
import '../../packages/exporter/src/node-disk-resolver.js';
import type { ClientScenario, ScenarioBenchmarkResult } from './benchmark-types.js';

function collectNodeIds(node: ProjectNode, idSet: Set<string>, duplicates: string[]) {
  if (idSet.has(node.id)) {
    duplicates.push(node.id);
  } else {
    idSet.add(node.id);
  }
  for (const child of node.children ?? []) {
    collectNodeIds(child, idSet, duplicates);
  }
}

export function evaluateScenario(
  scenario: ClientScenario,
  catalogResources: ResourceManifest[]
): ScenarioBenchmarkResult {
  const startTime = performance.now();

  const schemaErrors: string[] = [];
  const exportErrors: string[] = [];
  const dnaViolations: string[] = [];
  const unresolvedRoleSet = new Set<string>();

  let score = 0;
  let detectedArchetype = 'unknown';
  let screenCount = 0;

  const directionResults = {
    directionA: { valid: false, screenCount: 0, diagnosticsCount: 0 },
    directionB: { valid: false, screenCount: 0, diagnosticsCount: 0 },
    directionC: { valid: false, screenCount: 0, diagnosticsCount: 0 },
  };

  try {
    const briefInput = {
      description: scenario.description,
      archetypeOverride: scenario.archetypeExpected,
      feel: scenario.feel,
      visualAmbition: scenario.visualAmbition,
      structuralCreativity: scenario.structuralCreativity,
      accessibilityFloor: scenario.accessibilityFloor,
      performanceCeiling: scenario.performanceCeiling,
      targetDevices: scenario.targetDevices,
      requiredScreens: scenario.requiredScreens,
      forbiddenScreens: scenario.forbiddenScreens,
    };

    const result = composeProjectPipeline(briefInput, {
      catalogResources,
      seed: scenario.id,
    });

    detectedArchetype = result.productModel.productArchetypes[0]?.tag ?? 'unknown';

    // 1. Schema Validation (20 pts)
    const pmParse = ProductModelSchema.safeParse(result.productModel);
    if (pmParse.success) {
      score += 5;
    } else {
      schemaErrors.push(`ProductModel: ${pmParse.error.message}`);
    }

    const sgParse = ScreenGraphSchema.safeParse(result.screenGraph);
    if (sgParse.success) {
      score += 5;
    } else {
      schemaErrors.push(`ScreenGraph: ${sgParse.error.message}`);
    }

    const dirs = [
      { key: 'directionA' as const, out: result.directionA },
      { key: 'directionB' as const, out: result.directionB },
      { key: 'directionC' as const, out: result.directionC },
    ];

    let allManifestsValid = true;
    for (const d of dirs) {
      const mParse = ProjectManifestSchema.safeParse(d.out.manifest);
      const sCount = d.out.manifest.screens.length;
      const dCount = d.out.diagnostics?.length || 0;

      directionResults[d.key] = {
        valid: mParse.success,
        screenCount: sCount,
        diagnosticsCount: dCount,
      };

      if (!mParse.success) {
        allManifestsValid = false;
        schemaErrors.push(`${d.key} manifest: ${mParse.error.message}`);
      }

      if (d.out.diagnostics) {
        for (const diag of d.out.diagnostics) {
          if (diag.code === 'UNRESOLVED_REQUIRED_ROLE') {
            unresolvedRoleSet.add(diag.role);
          }
        }
      }
    }

    if (allManifestsValid) {
      score += 10;
    }

    // 2. Zero Unresolved Roles / Synthetic Fallbacks (25 pts)
    // Also inspect nodes for missing resourceRef or res_synth_
    for (const screen of result.directionA.manifest.screens) {
      function checkNode(n: ProjectNode) {
        if (n.nodeType === 'section' && (!n.resourceRef || !n.resourceRef.id || n.resourceRef.id.startsWith('res_synth_'))) {
          unresolvedRoleSet.add(n.semanticRole);
        }
        for (const child of n.children ?? []) {
          checkNode(child);
        }
      }
      checkNode(screen.rootNode);
    }

    const unresolvedCount = unresolvedRoleSet.size;
    const unresolvedScore = Math.max(0, 25 - unresolvedCount * 5);
    score += unresolvedScore;

    // 3. Screen Graph Completeness & Architecture (20 pts)
    screenCount = result.directionA.manifest.screens.length;
    const nodeIdSet = new Set<string>();
    const duplicateNodeIds: string[] = [];

    for (const screen of result.directionA.manifest.screens) {
      collectNodeIds(screen.rootNode, nodeIdSet, duplicateNodeIds);
    }

    let screenGraphPassed = true;
    if (screenCount < 2) {
      screenGraphPassed = false;
      schemaErrors.push(`Too few screens generated: ${screenCount}`);
    }
    if (duplicateNodeIds.length > 0) {
      screenGraphPassed = false;
      schemaErrors.push(`Duplicate node IDs in manifest: ${duplicateNodeIds.slice(0, 5).join(', ')}`);
    }

    const navItems = result.directionA.manifest.navigation?.primaryItems ?? [];
    const screenIdSet = new Set(result.directionA.manifest.screens.map((s) => s.id));
    for (const nav of navItems) {
      if (!screenIdSet.has(nav.targetScreenId)) {
        screenGraphPassed = false;
        schemaErrors.push(`Nav item target screen "${nav.targetScreenId}" does not exist in screens`);
      }
    }

    if (screenGraphPassed) {
      score += 20;
    } else {
      score += 10;
    }

    // 4. Design DNA Coherence & Constraints (15 pts)
    const dna = result.directionA.manifest.designDNA;
    let dnaValid = true;

    if (scenario.accessibilityFloor === 'AAA') {
      if ((dna.accessibilityPriority ?? 0) < 90 || (dna.contrast ?? 0) < 80) {
        dnaValid = false;
        dnaViolations.push(`Accessibility floor AAA violated: priority=${dna.accessibilityPriority}, contrast=${dna.contrast}`);
      }
    } else if (scenario.accessibilityFloor === 'AA') {
      if ((dna.accessibilityPriority ?? 0) < 70) {
        dnaValid = false;
        dnaViolations.push(`Accessibility floor AA violated: priority=${dna.accessibilityPriority}`);
      }
    }

    if (scenario.performanceCeiling === 'lightweight') {
      if ((dna.motion ?? 0) > 30 || (dna.videoIntensity ?? 0) > 0 || (dna.threeDIntensity ?? 0) > 0) {
        dnaValid = false;
        dnaViolations.push(`Lightweight performance ceiling violated: motion=${dna.motion}`);
      }
    }

    if (dnaValid) {
      score += 15;
    } else {
      score += 5;
    }

    // 5. Multi-Target Exportability (20 pts)
    // Vite Target
    try {
      const viteTree = generateSourceTree(result.directionA.manifest);
      if (viteTree && Object.keys(viteTree).length > 5) {
        score += 10;
      } else {
        exportErrors.push('Vite source tree generated insufficient files');
      }
    } catch (err: unknown) {
      exportErrors.push(`Vite export failure: ${(err as Error).message}`);
    }

    // Next.js 15 Target
    try {
      const nextManifest: ProjectManifest = {
        ...result.directionA.manifest,
        exportSettings: {
          ...result.directionA.manifest.exportSettings,
          target: 'next-tailwind',
        },
      };
      const nextTree = generateSourceTree(nextManifest);
      if (nextTree && Object.keys(nextTree).length > 5) {
        score += 10;
      } else {
        exportErrors.push('Next.js source tree generated insufficient files');
      }
    } catch (err: unknown) {
      exportErrors.push(`Next.js 15 export failure: ${(err as Error).message}`);
    }

  } catch (err: unknown) {
    schemaErrors.push(`Fatal pipeline exception: ${(err as Error).message}`);
  }

  const durationMs = Math.round(performance.now() - startTime);
  const passed =
    score >= 95 &&
    schemaErrors.length === 0 &&
    exportErrors.length === 0 &&
    unresolvedRoleSet.size === 0 &&
    dnaViolations.length === 0;

  return {
    scenarioId: scenario.id,
    index: scenario.index,
    domain: scenario.domain,
    title: scenario.title,
    passed,
    score: Math.min(100, Math.max(0, score)),
    durationMs,
    detectedArchetype,
    screenCount,
    unresolvedRolesCount: unresolvedRoleSet.size,
    unresolvedRoles: Array.from(unresolvedRoleSet),
    schemaErrors,
    exportErrors,
    dnaViolations,
    directionResults,
    details: passed
      ? `100% benchmark compliance (${score}/100 pts in ${durationMs}ms)`
      : `Defects encountered: score=${score}/100, unresolved=${unresolvedRoleSet.size}, schemaErrors=${schemaErrors.length}, exportErrors=${exportErrors.length}, dnaViolations=${dnaViolations.length}`,
  };
}
