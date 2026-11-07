import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { expect, test } from '@playwright/test';

type CatalogResource = { slug: string; status: string };
const catalog = JSON.parse(
  readFileSync(resolve(process.cwd(), 'apps/site/public/data/catalog.json'), 'utf8'),
) as { resources: CatalogResource[] };

// The deployed audit found dark-mode contrast defects across this Gold set.
// Keep the full certified set in this guard so new failures cannot hide in an
// untested resource after a shared renderer or theme change.
const goldResources = catalog.resources
  .filter((resource) => resource.status === 'verified-gold')
  .map((resource) => resource.slug);

const deployedDefectSlugs = new Set([
  'advanced-data-table',
  'ai-prompt-composer',
  'ai-research-answer',
  'ai-suggested-actions',
  'area-chart',
  'cta-minimal',
  'donut-chart',
  'empty-workspace',
  'entity-profile-header',
  'error-state',
  'feature-bento',
  'feature-matrix',
  'filter-builder',
  'input',
  'kanban-board',
  'logo-cloud-minimal',
  'marketing-nav-cta',
  'notification-centre',
  'pricing-three-tier',
  'select',
  'subtle-grid-field',
  'three-pane-app-shell',
  'time-series-chart',
  'two-pane-master-detail-shell',
]);

async function readContrastFailures(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    type BrowserRGBA = [number, number, number, number];
    const composite = (foreground: BrowserRGBA, background: BrowserRGBA): BrowserRGBA => {
      const foregroundAlpha = foreground[3] / 255;
      const backgroundAlpha = background[3] / 255;
      const alpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha);
      if (alpha === 0) return [0, 0, 0, 0];
      return [0, 1, 2].map((channel) => Math.round(
        (foreground[channel]! * foregroundAlpha + background[channel]! * backgroundAlpha * (1 - foregroundAlpha)) / alpha,
      )).concat(Math.round(alpha * 255)) as BrowserRGBA;
    };
    const toSrgb = (channel: number) => {
      const encoded = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
      return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
    };
    const oklabToRgb = (lightness: number, a: number, b: number): BrowserRGBA => {
      const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
      const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
      const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
      return [
        toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
        255,
      ];
    };
    const parseColor = (value: string): BrowserRGBA => {
      const oklab = value.match(/^oklab\(\s*([\d.]+)%?\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)(?:\s*\/\s*([\d.]+)%?)?\s*\)$/i);
      if (oklab) {
        const lightness = Number(oklab[1]) / (oklab[1]!.includes('.') && Number(oklab[1]) <= 1 ? 1 : 100);
        const alpha = oklab[4] ? Number(oklab[4]) / (oklab[4]!.includes('.') && Number(oklab[4]) <= 1 ? 1 : 100) : 1;
        const rgb = oklabToRgb(lightness, Number(oklab[2]), Number(oklab[3]));
        rgb[3] = Math.round(alpha * 255);
        return rgb;
      }
      const oklch = value.match(/^oklch\(\s*([\d.]+)%?\s+([+-]?[\d.]+)\s+([+-]?[\d.]+|none)(?:deg)?(?:\s*\/\s*([\d.]+)%?)?\s*\)$/i);
      if (oklch) {
        const lightness = Number(oklch[1]) / (oklch[1]!.includes('.') && Number(oklch[1]) <= 1 ? 1 : 100);
        const chroma = Number(oklch[2]);
        const hue = oklch[3] === 'none' ? 0 : Number(oklch[3]) * Math.PI / 180;
        const alpha = oklch[4] ? Number(oklch[4]) / (oklch[4]!.includes('.') && Number(oklch[4]) <= 1 ? 1 : 100) : 1;
        const rgb = oklabToRgb(lightness, chroma * Math.cos(hue), chroma * Math.sin(hue));
        rgb[3] = Math.round(alpha * 255);
        return rgb;
      }
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return [0, 0, 0, 0];
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = 'rgba(0,0,0,0)';
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data] as BrowserRGBA;
    };
    const luminance = (color: BrowserRGBA) => {
      const linear = (channel: number) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(color[0]) + 0.7152 * linear(color[1]) + 0.0722 * linear(color[2]);
    };
    const screen = document.querySelector('.tess-screen');
    if (!screen) throw new Error('Resource preview screen did not render.');
    const failures: Array<{ text: string; ratio: number; threshold: number; foreground: string; background: string }> = [];
    for (const element of Array.from(screen.querySelectorAll<HTMLElement>('*'))) {
      const text = Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (!text || rect.width < 1 || rect.height < 1 || style.visibility === 'hidden' || style.display === 'none') continue;
      if (element.closest('[aria-hidden="true"]')) continue;

      const ancestors: Element[] = [];
      for (let parent: Element | null = element; parent; parent = parent.parentElement) ancestors.unshift(parent);
      let background: BrowserRGBA = [255, 255, 255, 255];
      let cumulativeOpacity = 1;
      let gradient = false;
      for (const ancestor of ancestors) {
        const ancestorStyle = getComputedStyle(ancestor);
        if (ancestorStyle.backgroundImage !== 'none') gradient = true;
        cumulativeOpacity *= Number(ancestorStyle.opacity);
        const layer = parseColor(ancestorStyle.backgroundColor);
        layer[3] = Math.round(layer[3] * cumulativeOpacity);
        background = composite(layer, background);
      }
      if (gradient || cumulativeOpacity === 0) continue;
      const foreground = parseColor(style.color);
      foreground[3] = Math.round(foreground[3] * cumulativeOpacity);
      const paintedForeground = composite(foreground, background);
      const foregroundLuminance = luminance(paintedForeground);
      const backgroundLuminance = luminance(background);
      const ratio = (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
        (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
      const fontSize = Number.parseFloat(style.fontSize);
      const largeText = fontSize >= 24 || (fontSize >= 18.66 && Number.parseInt(style.fontWeight, 10) >= 700);
      const threshold = largeText ? 3 : 4.5;
      if (ratio < threshold) failures.push({
        text: text.slice(0, 100),
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === 'string' ? element.className.slice(0, 120) : '',
        ratio: Number(ratio.toFixed(2)),
        threshold,
        foreground: style.color,
        background: `rgb(${background[0]}, ${background[1]}, ${background[2]})`,
      });
    }
    return failures;
  });
}

test('Gold resources keep Expressive previews readable in dark mode', async ({ page }, info) => {
  test.setTimeout(5 * 60 * 1000);
  expect(goldResources).toHaveLength(40);
  const failures: Array<{ slug: string; text: string; tag: string; className: string; ratio: number; threshold: number; foreground: string; background: string }> = [];
  const evidenceDir = resolve(process.cwd(), 'audit/evidence/local-dark-contrast/after', info.project.name);
  await mkdir(evidenceDir, { recursive: true });
  const results: Array<{ slug: string; failures: Awaited<ReturnType<typeof readContrastFailures>>; screenshot: string | null }> = [];

  for (const slug of goldResources) {
    await page.goto(`/preview-content/?resource=${slug}&variant=expressive&theme=dark`);
    await expect(page.locator(`[data-node-id="preview-${slug}"]`)).toBeAttached();
    const resourceFailures = await readContrastFailures(page);
    failures.push(...resourceFailures.map(({ text, tag, className, ratio, threshold, foreground, background }) => ({ slug, text, tag, className, ratio, threshold, foreground, background })));
    const screenshot = resourceFailures.length || deployedDefectSlugs.has(slug)
      ? join(evidenceDir, `${slug}-${page.viewportSize()?.width}x${page.viewportSize()?.height}.png`)
      : null;
    if (screenshot) await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
    results.push({ slug, failures: resourceFailures, screenshot });
    await writeFile(join(evidenceDir, 'report.partial.json'), JSON.stringify({ viewport: page.viewportSize(), checked: results.length, total: goldResources.length, results }, null, 2) + '\n');
  }

  await writeFile(join(evidenceDir, 'report.json'), JSON.stringify({
    viewport: page.viewportSize(),
    checked: results.length,
    total: goldResources.length,
    sourceCommit: process.env.GITHUB_SHA ?? 'working-tree at ' + new Date().toISOString(),
    results,
  }, null, 2) + '\n');
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});
