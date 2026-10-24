import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { lintSource } from '../../packages/linter/src/index.js';

interface Case {
  id: string;
  rule: string;
  file: string;
  code: string;
  expected: boolean;
  scope: 'included' | 'excluded';
  limitation?: string;
}

const root = process.cwd();
const casesPath = path.join(root, 'quality/linter-benchmark-cases.json');
const cases = JSON.parse(await readFile(casesPath, 'utf8')) as Case[];
const rules = [
  ...new Set(cases.filter((item) => item.scope === 'included').map((item) => item.rule)),
].sort();
const counts = Object.fromEntries(rules.map((rule) => [rule, { tp: 0, fp: 0, fn: 0, tn: 0 }]));
const evaluated = cases.map((item) => {
  if (item.scope === 'excluded')
    return { id: item.id, scope: item.scope, expected: item.expected, limitation: item.limitation };
  const prediction = lintSource(item.code, item.file).issues.some(
    (issue) => issue.ruleId === item.rule
  );
  const entry = counts[item.rule]!;
  if (item.expected && prediction) entry.tp++;
  else if (!item.expected && prediction) entry.fp++;
  else if (item.expected && !prediction) entry.fn++;
  else entry.tn++;
  return {
    id: item.id,
    scope: item.scope,
    rule: item.rule,
    expected: item.expected,
    predicted: prediction,
    pass: item.expected === prediction,
  };
});

const metrics = Object.fromEntries(
  Object.entries(counts).map(([rule, value]) => {
    const precisionDenominator = value.tp + value.fp;
    const recallDenominator = value.tp + value.fn;
    return [
      rule,
      {
        ...value,
        precision:
          precisionDenominator === 0 ? null : Number((value.tp / precisionDenominator).toFixed(4)),
        recall: recallDenominator === 0 ? null : Number((value.tp / recallDenominator).toFixed(4)),
      },
    ];
  })
);
const includedCases = cases.filter((item) => item.scope === 'included').length;
const failedCases = evaluated.filter((item) => item.scope === 'included' && item.pass === false);
const result = {
  generatedAt: new Date().toISOString(),
  methodology:
    'Manually adjudicated static TSX cases, separate from the 1,095-file repository corpus. Excluded cases document unsupported dynamic CSS contexts and do not count as false negatives.',
  corpusCases: { included: includedCases, excluded: cases.length - includedCases },
  totals: Object.values(counts).reduce(
    (sum, value) => ({
      tp: sum.tp + value.tp,
      fp: sum.fp + value.fp,
      fn: sum.fn + value.fn,
      tn: sum.tn + value.tn,
    }),
    { tp: 0, fp: 0, fn: 0, tn: 0 }
  ),
  byRule: metrics,
  passed: failedCases.length === 0,
  failures: failedCases,
  cases: evaluated,
};
const outputPath = path.join(root, 'quality/evidence/step-28/after/linter-benchmark-report.json');
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
process.stdout.write(
  `${JSON.stringify({ outputPath, passed: result.passed, corpusCases: result.corpusCases, totals: result.totals, byRule: result.byRule }, null, 2)}\n`
);
if (!result.passed) process.exitCode = 1;
