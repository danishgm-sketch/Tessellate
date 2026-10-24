import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type GoldResource = {
  slug: string;
  status: string;
  variants: Array<{ id: string }>;
};

const cataloguePath = path.resolve(process.cwd(), 'apps/site/public/data/catalog.json');
const goldResources = (JSON.parse(readFileSync(cataloguePath, 'utf8')) as { resources: GoldResource[] }).resources
  .filter((resource) => resource.status === 'verified-gold');

test('Gold resources expose accessible semantics and contrast in every variant', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'Run the full Gold accessibility matrix against the Sites Worker preview.');
  test.setTimeout(15 * 60 * 1000);
  await page.setViewportSize({ width: 1440, height: 900 });

  const results: Array<{
    slug: string;
    variant: string;
    violations: Array<{
      id: string;
      impact: string | undefined;
      help: string;
      nodes: Array<{ target: string[]; summary: string }>;
    }>;
  }> = [];
  const beforeEvidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06/before/a11y-gold');
  const afterEvidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/a11y-gold');
  const screenshotCases = new Set([
    'ai-prompt-composer:nocturne',
    'ai-research-answer:quiet',
    'ai-research-answer:nocturne',
    'error-state:expressive',
    'fade-up-reveal:nocturne',
    'feature-matrix:quiet',
    'input:quiet',
    'pricing-three-tier:quiet',
    'pricing-three-tier:nocturne',
  ]);

  for (const resource of goldResources) {
    for (const variant of resource.variants) {
      await page.goto(`/preview/?resource=${resource.slug}&variant=${variant.id}`, { waitUntil: 'domcontentloaded' });
      const preview = page.frameLocator('iframe[title="Isolated Tessellate resource preview"]');
      await expect(preview.locator(`[data-node-id="preview-${resource.slug}"]`)).toBeAttached();
      const screenshotKey = `${resource.slug}:${variant.id}`;
      if (screenshotCases.has(screenshotKey)) {
        const screenshotPath = path.join(beforeEvidenceDir, `${resource.slug}-${variant.id}-1440.png`);
        if (!existsSync(screenshotPath)) {
          mkdirSync(beforeEvidenceDir, { recursive: true });
          await page.screenshot({ path: screenshotPath, animations: 'disabled' });
        }
      }
      const scan = await new AxeBuilder({ page })
        .options({ preload: false })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      results.push({
        slug: resource.slug,
        variant: variant.id,
        violations: scan.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.map((node) => ({ target: node.target.map(String), summary: node.failureSummary ?? '' })),
        })),
      });
      if (screenshotCases.has(screenshotKey)) {
        const screenshotPath = path.join(afterEvidenceDir, `${resource.slug}-${variant.id}-1440.png`);
        if (!existsSync(screenshotPath)) {
          mkdirSync(afterEvidenceDir, { recursive: true });
          await page.screenshot({ path: screenshotPath, animations: 'disabled' });
        }
      }
    }
  }

  const outputDir = path.resolve(process.cwd(), 'test-results/resource-certification');
  mkdirSync(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'gold-accessibility.json'), JSON.stringify({
    schemaVersion: '1.0.0',
    resourceCount: goldResources.length,
    variantCount: results.length,
    violationCount: results.reduce((count, result) => count + result.violations.length, 0),
    results,
  }, null, 2));
  expect(goldResources).toHaveLength(40);
  expect(results).toHaveLength(120);
  const violations = results.flatMap((result) => result.violations
    .map((violation) => `${result.slug}/${result.variant}: ${violation.id} (${violation.impact ?? 'unknown'})`));
  expect(violations, `Gold accessibility findings:\n${violations.join('\n')}`).toEqual([]);
});

test('Split Product Hero Nocturne keeps its badge readable on the dark canvas', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'Run the isolated preview regression against the Sites Worker.');
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto('/preview/?resource=split-product-hero&variant=nocturne', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const preview = page.frameLocator('iframe[title="Isolated Tessellate resource preview"]');
  await expect(preview.locator('[data-node-id="preview-split-product-hero"]')).toBeVisible();

  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-35/followup');
  const beforePath = path.join(evidenceDir, 'split-product-hero-nocturne-before.png');
  mkdirSync(evidenceDir, { recursive: true });
  if (!existsSync(beforePath)) {
    await page.screenshot({ path: beforePath, animations: 'disabled' });
  }

  const scan = await new AxeBuilder({ page })
    .options({ preload: false })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const contrastViolations = scan.violations.filter((violation) => violation.id === 'color-contrast');
  expect(contrastViolations, JSON.stringify(contrastViolations, null, 2)).toEqual([]);
  await page.screenshot({ path: path.join(evidenceDir, 'split-product-hero-nocturne-after.png'), animations: 'disabled' });
});
