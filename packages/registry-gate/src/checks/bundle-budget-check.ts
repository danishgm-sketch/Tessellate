import type { GateCheckResult } from '../types.js';

const PROHIBITED_HEAVY_DEPS = [
  'lodash',
  'moment',
  'jquery',
  'bootstrap',
  'highcharts',
  'chart.js',
  'styled-components',
  '@emotion/react',
];

export function checkBundleBudgetGate(code: string, sizeBytes: number): GateCheckResult {
  const maxBytes = 50 * 1024; // 50 KB ceiling

  const foundHeavyDeps = PROHIBITED_HEAVY_DEPS.filter((dep) =>
    new RegExp(`['"]${dep}(?:/.*)?['"]`).test(code)
  );

  if (foundHeavyDeps.length > 0) {
    return {
      id: 'bundle-budget',
      name: 'Bundle Size & Dependency Budget',
      category: 'bundle-budget',
      status: 'fail',
      score: 30,
      details: `Disallowed heavy dependency imported: ${foundHeavyDeps.join(', ')}.`,
      remediation: 'Remove bulky runtime dependencies. Rely on Tailwind CSS 4, standard React hooks, or native web APIs.',
    };
  }

  if (sizeBytes > maxBytes) {
    const sizeKb = Math.round(sizeBytes / 1024);
    return {
      id: 'bundle-budget',
      name: 'Bundle Size & Dependency Budget',
      category: 'bundle-budget',
      status: 'fail',
      score: 40,
      details: `Source code size (${sizeKb} KB) exceeds the 50 KB component ceiling.`,
      remediation: 'Decompose large monolithic components into smaller sub-resources or remove unnecessary inline assets.',
    };
  }

  const sizeKb = (sizeBytes / 1024).toFixed(1);
  return {
    id: 'bundle-budget',
    name: 'Bundle Size & Dependency Budget',
    category: 'bundle-budget',
    status: 'pass',
    score: 100,
    details: `Component size (${sizeKb} KB) is well within performance ceiling budget (<50 KB). Zero prohibited dependencies.`,
  };
}
