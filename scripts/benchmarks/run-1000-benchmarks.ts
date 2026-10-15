import * as fs from 'node:fs';
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import type { ResourceManifest } from '../../packages/schemas/src/index.js';
import { generate1000ClientScenarios } from './scenarios-1000.js';
import { evaluateScenario } from './evaluate-scenario.js';
import type {
  ClientScenario,
  ScenarioBenchmarkResult,
  BenchmarkAggregateSummary,
} from './benchmark-types.js';

function loadCatalog(): ResourceManifest[] {
  const p = path.resolve(process.cwd(), 'apps/site/public/data/catalog.json');
  if (!fs.existsSync(p)) {
    throw new Error(`Catalog not found at ${p}`);
  }
  const raw = fs.readFileSync(p, 'utf-8');
  const data = JSON.parse(raw);
  return data.resources ?? [];
}

export async function run1000Benchmarks(limit?: number): Promise<{
  summary: BenchmarkAggregateSummary;
  results: ScenarioBenchmarkResult[];
}> {
  console.log('========================================================================');
  console.log(' TESSELLATE — 1,000 UNIQUE CLIENT SCENARIOS BENCHMARK HARNESS           ');
  console.log('========================================================================\n');

  const catalog = loadCatalog();
  console.log(`[INFO] Loaded canonical catalog with ${catalog.length} resources.`);

  let scenarios = generate1000ClientScenarios();
  if (typeof limit === 'number' && limit > 0) {
    scenarios = scenarios.slice(0, limit);
    console.log(`[INFO] Limited run to first ${limit} scenarios.`);
  } else {
    console.log(`[INFO] Generated all ${scenarios.length} unique client scenarios across 32 domains.`);
  }

  const results: ScenarioBenchmarkResult[] = [];
  const startAll = performance.now();

  const unresolvedRoleFreq: Record<string, number> = {};
  const domainBreakdown: Record<string, { total: number; failed: number; failRate: number }> = {};
  const archetypeBreakdown: Record<string, { total: number; failed: number; failRate: number }> = {};

  let totalScore = 0;
  let passedCount = 0;
  let failedCount = 0;

  const failureCategories = {
    schemaErrors: 0,
    unresolvedRoles: 0,
    exportFailures: 0,
    dnaViolations: 0,
    screenGraphDefects: 0,
  };

  for (let i = 0; i < scenarios.length; i++) {
    const scen = scenarios[i]!;
    const res = evaluateScenario(scen, catalog);
    results.push(res);

    totalScore += res.score;
    if (res.passed) {
      passedCount++;
    } else {
      failedCount++;
      if (res.schemaErrors.length > 0) failureCategories.schemaErrors++;
      if (res.unresolvedRolesCount > 0) failureCategories.unresolvedRoles++;
      if (res.exportErrors.length > 0) failureCategories.exportFailures++;
      if (res.dnaViolations.length > 0) failureCategories.dnaViolations++;
      if (res.screenCount < 2) failureCategories.screenGraphDefects++;
    }

    // Domain stats
    if (!domainBreakdown[scen.domain]) {
      domainBreakdown[scen.domain] = { total: 0, failed: 0, failRate: 0 };
    }
    domainBreakdown[scen.domain]!.total++;
    if (!res.passed) {
      domainBreakdown[scen.domain]!.failed++;
    }

    // Archetype stats
    const arch = res.detectedArchetype || 'unknown';
    if (!archetypeBreakdown[arch]) {
      archetypeBreakdown[arch] = { total: 0, failed: 0, failRate: 0 };
    }
    archetypeBreakdown[arch]!.total++;
    if (!res.passed) {
      archetypeBreakdown[arch]!.failed++;
    }

    // Unresolved roles
    for (const r of res.unresolvedRoles) {
      unresolvedRoleFreq[r] = (unresolvedRoleFreq[r] || 0) + 1;
    }

    // Live progress output
    if ((i + 1) % 50 === 0 || i + 1 === scenarios.length) {
      const currentPassRate = ((passedCount / (i + 1)) * 100).toFixed(1);
      const avgScore = (totalScore / (i + 1)).toFixed(1);
      console.log(
        `[PROGRESS] ${String(i + 1).padStart(4, ' ')} / ${scenarios.length} scenarios completed | Pass Rate: ${currentPassRate}% (${passedCount} passed, ${failedCount} failed) | Avg Score: ${avgScore}/100`
      );
    }
  }

  const totalDurationMs = Math.round(performance.now() - startAll);
  const avgDurationMs = Math.round(totalDurationMs / scenarios.length);
  const passRatePercent = parseFloat(((passedCount / scenarios.length) * 100).toFixed(2));
  const averageScore = parseFloat((totalScore / scenarios.length).toFixed(2));

  // Compute final failure rates
  for (const dom of Object.keys(domainBreakdown)) {
    const entry = domainBreakdown[dom]!;
    entry.failRate = parseFloat(((entry.failed / entry.total) * 100).toFixed(1));
  }
  for (const arch of Object.keys(archetypeBreakdown)) {
    const entry = archetypeBreakdown[arch]!;
    entry.failRate = parseFloat(((entry.failed / entry.total) * 100).toFixed(1));
  }

  const summary: BenchmarkAggregateSummary = {
    timestamp: new Date().toISOString(),
    totalScenarios: scenarios.length,
    passedCount,
    failedCount,
    passRatePercent,
    averageScore,
    averageDurationMs: avgDurationMs,
    totalDurationMs,
    unresolvedRoleFrequencies: unresolvedRoleFreq,
    domainFailureBreakdown: domainBreakdown,
    archetypeFailureBreakdown: archetypeBreakdown,
    failureCategories,
  };

  // Ensure results directory exists
  const outDir = path.resolve(process.cwd(), 'scripts/benchmarks/results');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outDir, 'benchmark_summary.json'),
    JSON.stringify(summary, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(outDir, 'benchmark_results_sample.json'),
    JSON.stringify(results.slice(0, 50), null, 2),
    'utf-8'
  );

  console.log('\n========================================================================');
  console.log(' BENCHMARK HARNESS EXECUTION COMPLETE                                  ');
  console.log('========================================================================');
  console.log(`Total Scenarios:     ${summary.totalScenarios}`);
  console.log(`Passed:              ${summary.passedCount} (${summary.passRatePercent}%)`);
  console.log(`Failed:              ${summary.failedCount}`);
  console.log(`Average Score:       ${summary.averageScore} / 100`);
  console.log(`Total Duration:      ${(summary.totalDurationMs / 1000).toFixed(2)}s (${summary.averageDurationMs}ms / scenario)`);
  console.log('------------------------------------------------------------------------');
  console.log('Defect Categories:');
  console.log(` - Schema Errors:         ${failureCategories.schemaErrors}`);
  console.log(` - Unresolved Roles:      ${failureCategories.unresolvedRoles}`);
  console.log(` - Export Failures:       ${failureCategories.exportFailures}`);
  console.log(` - DNA Violations:        ${failureCategories.dnaViolations}`);
  console.log(` - Screen Graph Defects:  ${failureCategories.screenGraphDefects}`);
  console.log('------------------------------------------------------------------------');

  const topUnresolved = Object.entries(unresolvedRoleFreq).sort((a, b) => b[1] - a[1]);
  if (topUnresolved.length > 0) {
    console.log('Top Unresolved Semantic Roles:');
    for (const [role, count] of topUnresolved.slice(0, 15)) {
      console.log(` - "${role}": ${count} occurrences`);
    }
  }

  return { summary, results };
}

const limitArg = process.argv[2] ? parseInt(process.argv[2], 10) : undefined;
run1000Benchmarks(limitArg).catch((err) => {
  console.error('Benchmark fatal error:', err);
  process.exit(1);
});
