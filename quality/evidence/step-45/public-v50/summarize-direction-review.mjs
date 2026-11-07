import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outputPath = path.join(root, 'quality/evidence/step-45/public-v50/flagship/directions-review.json');
const inputDirectory = path.join(root, 'quality/evidence/step-45/public-v50/flagship/settled-previews');
const inputs = [
  ['desktop', path.join(inputDirectory, 'report-desktop-1440.json')],
  ['mobile', path.join(inputDirectory, 'report-mobile-390.json')],
];

function collectNodes(screen) {
  const result = [];
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { for (const item of value) visit(item); return; }
    if (typeof value.id === 'string' && typeof value.nodeType === 'string') result.push(value);
    for (const [key, child] of Object.entries(value)) if (key !== 'parent') visit(child);
  };
  visit(screen.rootNode);
  return result;
}

function summarizeDirection(item) {
  const text = item.expandedDirectionDetails;
  const jsonStart = text.lastIndexOf('\n{');
  if (jsonStart < 0) throw new Error(`Visible Design DNA disclosure is missing for Direction ${item.direction}.`);
  const manifest = JSON.parse(text.slice(jsonStart + 1).trim());
  const nodes = manifest.screens.flatMap(collectNodes);
  const resourceRefs = nodes.filter((node) => node.resourceRef).map((node) => ({
    nodeId: node.id,
    role: node.semanticRole ?? null,
    slug: node.resourceRef.slug,
    variant: node.variant,
  }));
  const cardTitle = item.cardText.match(/DIRECTION\s+\d+\s+([\s\S]*?)\n\n/)?.[1]?.trim() ?? null;
  const strategy = item.cardText.split('\n').filter((line) => /^(Navigation:|Layout:)/.test(line));
  return {
    direction: item.direction,
    title: cardTitle,
    projectId: manifest.id,
    designDNA: manifest.dna,
    navigation: manifest.navigation,
    compositionGrammar: manifest.grammar,
    layoutStrategy: strategy,
    screens: manifest.screens.map((screen) => ({ id: screen.id, name: screen.name, slug: screen.slug })),
    resourceRefs,
    selectedResourceSlugs: [...new Set(resourceRefs.map((ref) => ref.slug))].sort(),
    unresolvedDiagnostics: manifest.diagnostics ?? [],
    previewSettled: item.settled,
    previewSettleMs: item.settleMs,
    loadingPlaceholdersAfterSettle: item.loadingText,
    screenshots: {
      preview: item.screenshot,
      initialPreview: item.initialScreenshot,
      dnaDialog: item.detailScreenshot,
      dnaDialogDisclosureOpen: item.expandedDetailScreenshot,
    },
  };
}

const captures = {};
for (const [key, inputPath] of inputs) {
  const capture = JSON.parse(await fs.readFile(inputPath, 'utf8'));
  captures[key] = {
    capturedAt: capture.capturedAt,
    url: capture.url,
    viewport: capture.viewport,
    httpStatus: capture.httpStatus,
    directions: capture.previews.map(summarizeDirection),
    diagnostics: {
      consoleErrors: capture.consoleErrors,
      uncaughtExceptions: capture.uncaughtExceptions,
      failedRequests: capture.failedRequests,
      badResponses: capture.badResponses,
    },
  };
}

const report = {
  siteVersion: 50,
  siteVersionId: 'appgprj_6acc036de8cc8191a823339566972d85~appgver_90ffb7eea6f0819187554301d0a0011f',
  canonicalSourceCommit: 'd4b0fd88a722225c221d8264b89af70525cb1d7d',
  siteSourceCommit: '11d7a1439caaf641a2d2f78eb2555c00cf30cc34',
  captures,
};
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  output: path.relative(root, outputPath).replaceAll('\\', '/'),
  captures: Object.fromEntries(Object.entries(captures).map(([key, capture]) => [key, {
    viewport: capture.viewport,
    httpStatus: capture.httpStatus,
    directions: capture.directions.map((direction) => ({
      direction: direction.direction,
      title: direction.title,
      projectId: direction.projectId,
      navigation: direction.navigation.model,
      grammar: direction.compositionGrammar,
      screens: direction.screens.length,
      resources: direction.selectedResourceSlugs.length,
      unresolvedDiagnostics: direction.unresolvedDiagnostics.length,
      settled: direction.previewSettled,
      settleMs: direction.previewSettleMs,
    })),
    diagnostics: capture.diagnostics,
  }])) ,
}, null, 2));
