import { readFile, writeFile } from 'node:fs/promises';
const input = 'quality/evidence/step-45/public-v78-reaudit/resource-copy-corpus/copy-corpus.json';
const output = 'quality/evidence/step-45/public-v78-reaudit/copy-review-candidates.json';
const corpus = JSON.parse(await readFile(input, 'utf8'));
const patterns = [
  ['execution-or-connection', /\b(?:live|real[- ]time|connected|operational|active|running|automatic(?:ally)?|reconnect|sync(?:ed|ing)?|uploaded|saving|saved|sent|received|generating|processing|executing|deployment|deployed)\b/i],
  ['verification-or-assurance', /\b(?:verified|certified|approved|secure|compliant|guaranteed|guarantee|zero (?:errors|latency|issues)|100%|99\.9%|WCAG|AA compliant|audit(?:ed)?)\b/i],
  ['people-or-social-proof', /\b(?:trusted by|used by|customers?|employees?|members?|users?|teams?|organizations?|partners?|clients?)\b/i],
  ['measured-or-operational-metric', /\b(?:\d+(?:\.\d+)?\s*(?:ms|%|users?|customers?|employees?|members?|teams?|checks?|tests?|requests?|seconds?|hours?)|latency|uptime|throughput|accuracy|score|benchmark|response time)\b/i],
  ['provider-or-data-source', /\b(?:provider|API|model|telemetry|analytics|source data|integration|webhook|database|cloud|import|export)\b/i],
];
const bySlug = new Map();
for (const row of corpus.results.filter((item) => item.viewport === '1440x900')) bySlug.set(row.slug, row);
const candidates = [];
for (const row of bySlug.values()) {
  const seen = new Set();
  for (const variant of row.variants ?? []) {
    for (const line of (variant.previewText ?? '').split(/\r?\n/).map((value) => value.trim()).filter(Boolean)) {
      const key = line.toLowerCase().replace(/\s+/g, ' ');
      if (seen.has(key)) continue;
      seen.add(key);
      const matches = patterns.filter(([, pattern]) => pattern.test(line)).map(([name]) => name);
      if (matches.length) candidates.push({ slug: row.slug, resource: row.name, variant: variant.variant, text: line, signals: matches });
    }
  }
}
const report = {
  capturedAt: corpus.capturedAt,
  sourceVersion: corpus.publicVersion,
  sourceCommit: corpus.canonicalSourceCommit,
  resourcesReviewed: bySlug.size,
  scope: 'Heuristic candidate extraction from visible isolated-preview text only. Each candidate requires human judgment; matches are not findings.',
  candidateCount: candidates.length,
  bySignal: Object.fromEntries(patterns.map(([name]) => [name, candidates.filter((row) => row.signals.includes(name)).length])),
  candidates,
};
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output, resources: report.resourcesReviewed, candidateCount: report.candidateCount, bySignal: report.bySignal }, null, 2));
