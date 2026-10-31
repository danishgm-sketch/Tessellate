import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

type Resource = { slug: string; status: string };
const catalogue = JSON.parse(
  readFileSync(path.resolve(process.cwd(), 'apps/site/public/data/catalog.json'), 'utf8')
) as { resources: Resource[] };
const gold = catalogue.resources.filter((resource) => resource.status === 'verified-gold');

async function measure(screenLocator: import('@playwright/test').Locator) {
  return screenLocator.evaluate((screenElement) => {
    type RGBA = [number, number, number, number];
    const over = (fg: RGBA, bg: RGBA): RGBA => {
      const fa = fg[3] / 255;
      const ba = bg[3] / 255;
      const alpha = fa + ba * (1 - fa);
      if (!alpha) return [0, 0, 0, 0];
      return [0, 1, 2]
        .map((index) => Math.round((fg[index]! * fa + bg[index]! * ba * (1 - fa)) / alpha))
        .concat(Math.round(alpha * 255)) as RGBA;
    };
    const gamma = (channel: number) =>
      Math.round(
        Math.min(
          1,
          Math.max(0, channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055)
        ) * 255
      );
    const labRgb = (l: number, a: number, b: number): RGBA => {
      const ll = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
      const mm = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
      const ss = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
      return [
        gamma(4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss),
        gamma(-1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss),
        gamma(-0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss),
        255,
      ];
    };
    const parse = (value: string): RGBA => {
      const lab = value.match(
        /^oklab\(\s*([\d.]+)%?\s+([+-]?[\d.]+)\s+([+-]?[\d.]+)(?:\s*\/\s*([\d.]+)%?)?\s*\)$/i
      );
      const lch = value.match(
        /^oklch\(\s*([\d.]+)%?\s+([+-]?[\d.]+)\s+([+-]?[\d.]+|none)(?:deg)?(?:\s*\/\s*([\d.]+)%?)?\s*\)$/i
      );
      let result: RGBA;
      if (lab) result = labRgb(Number(lab[1]), Number(lab[2]), Number(lab[3]));
      else if (lch) {
        const h = lch[3] === 'none' ? 0 : (Number(lch[3]) * Math.PI) / 180;
        result = labRgb(Number(lch[1]), Number(lch[2]) * Math.cos(h), Number(lch[2]) * Math.sin(h));
      } else {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return [0, 0, 0, 0];
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        result = [...context.getImageData(0, 0, 1, 1).data] as RGBA;
      }
      const alpha = lab?.[4] ?? lch?.[4];
      if (alpha)
        result[3] = Math.round(
          Number(alpha) * (alpha.includes('.') && Number(alpha) <= 1 ? 255 : 2.55)
        );
      return result;
    };
    const luminance = (color: RGBA) => {
      const linear = (channel: number) => {
        const n = channel / 255;
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(color[0]) + 0.7152 * linear(color[1]) + 0.0722 * linear(color[2]);
    };
    const screen = screenElement;
    const failures: Array<Record<string, unknown>> = [];
    for (const element of Array.from(screen.querySelectorAll<HTMLElement>('*'))) {
      const text = Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (
        !text ||
        rect.width < 1 ||
        rect.height < 1 ||
        style.visibility === 'hidden' ||
        style.display === 'none' ||
        element.closest('[aria-hidden="true"]')
      )
        continue;
      const chain: Element[] = [];
      for (let parent: Element | null = element; parent; parent = parent.parentElement)
        chain.unshift(parent);
      let background: RGBA = [255, 255, 255, 255];
      let opacity = 1;
      let gradient = false;
      for (const ancestor of chain) {
        const ancestorStyle = getComputedStyle(ancestor);
        if (ancestorStyle.backgroundImage !== 'none') gradient = true;
        opacity *= Number(ancestorStyle.opacity);
        const layer = parse(ancestorStyle.backgroundColor);
        layer[3] = Math.round(layer[3] * opacity);
        background = over(layer, background);
      }
      if (gradient || opacity === 0) continue;
      const foreground = parse(style.color);
      foreground[3] = Math.round(foreground[3] * opacity);
      const painted = over(foreground, background);
      const a = luminance(painted);
      const b = luminance(background);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const size = Number.parseFloat(style.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number.parseInt(style.fontWeight, 10) >= 700);
      const threshold = large ? 3 : 4.5;
      if (ratio < threshold)
        failures.push({
          text: text.slice(0, 100),
          tag: element.tagName.toLowerCase(),
          foreground: style.color,
          background: `rgb(${background[0]}, ${background[1]}, ${background[2]})`,
          ratio: Number(ratio.toFixed(2)),
          threshold,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
        });
    }
    return { theme: document.documentElement.dataset.theme ?? 'light', failures };
  });
}

test('published Site: accurately rechecks dark Expressive contrast across all Gold resources', async ({
  page,
}, info) => {
  test.setTimeout(15 * 60 * 1000);
  const diagnostics = {
    console: [] as string[],
    warnings: [] as string[],
    pageErrors: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.console.push(message.text());
    if (message.type() === 'warning') diagnostics.warnings.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    diagnostics.failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? ''}`)
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      diagnostics.httpErrors.push(`${response.status()} ${response.url()}`);
  });
  const output = path.resolve(
    process.cwd(),
    'audit/evidence/v26/gold-dark-contrast-accurate',
    info.project.name
  );
  await mkdir(output, { recursive: true });
  const results: Array<Record<string, unknown>> = [];

  for (const resource of gold) {
    const route = `/resources/${resource.slug}/`;
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(200);
    const iframe = page.locator('iframe[title$=" live preview"]');
    const expectedId = `preview-${resource.slug}`;
    await expect(iframe).toBeVisible();
    await expect(
      page.frameLocator('iframe[title$=" live preview"]').locator(`[data-node-id="${expectedId}"]`)
    ).toBeAttached({ timeout: 20000 });
    await page.getByRole('button', { name: 'Expressive', exact: true }).click();
    await expect(iframe).toHaveAttribute('src', /variant=expressive/, { timeout: 20000 });
    await expect
      .poll(() =>
        page
          .frames()
          .some(
            (frame) =>
              frame.url().includes(`/preview-content/?resource=${resource.slug}&`) &&
              frame.url().includes('variant=expressive')
          )
      )
      .toBe(true);
    await page.getByRole('button', { name: 'Switch to Dark theme' }).click();
    await expect(iframe).toHaveAttribute('src', /variant=expressive.*theme=dark/, {
      timeout: 20000,
    });
    const expectedFrameUrl = `/preview-content/?resource=${resource.slug}&variant=expressive&theme=dark`;
    await expect
      .poll(() => page.frames().some((frame) => frame.url().includes(expectedFrameUrl)))
      .toBe(true);
    const preview = page.frameLocator('iframe[title$=" live preview"]');
    const screen = preview.locator('.tess-screen');
    const content = (await screen.isVisible().catch(() => false))
      ? screen
      : preview.locator('body');
    const contrast = await measure(content);
    const screenshot = path.join(
      output,
      `${resource.slug}-${page.viewportSize()?.width}x${page.viewportSize()?.height}.png`
    );
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
    results.push({
      slug: resource.slug,
      route,
      status: response?.status(),
      failures: contrast.failures,
      screenshot,
    });
    await writeFile(
      path.join(output, 'report.partial.json'),
      JSON.stringify(
        {
          site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
          viewport: page.viewportSize(),
          checked: results.length,
          total: gold.length,
          diagnostics,
          results,
        },
        null,
        2
      ) + '\n'
    );
    console.log(`${resource.slug}: ${contrast.failures.length} contrast findings`);
  }

  const report = {
    site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    capturedAt: new Date().toISOString(),
    viewport: page.viewportSize(),
    goldResources: gold.length,
    diagnostics,
    results,
  };
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  expect(gold).toHaveLength(40);
  expect(diagnostics.console).toEqual([]);
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.httpErrors).toEqual([]);
  expect(
    diagnostics.failedRequests.filter((request) => !request.includes('net::ERR_ABORTED'))
  ).toEqual([]);
});
