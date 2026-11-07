import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { expect, test, type Frame } from '@playwright/test';
type Resource = { slug: string; name: string; status: string };
type ContrastSample = {
  text: string;
  tag: string;
  className: string;
  foreground: string;
  background: string;
  ratio: number;
  threshold: number;
  gradient: boolean;
  fontSize: string;
  fontWeight: string;
};
type ContrastReport = {
  error?: string;
  theme?: string;
  textCount?: number;
  samples: ContrastSample[];
  failures: ContrastSample[];
};
const catalogue = JSON.parse(
  readFileSync(path.resolve(process.cwd(), 'apps/site/public/data/catalog.json'), 'utf8')
) as { resources: Resource[] };
const gold = catalogue.resources.filter((r) => r.status === 'verified-gold');
async function measure(frame: Frame): Promise<ContrastReport> {
  return frame.evaluate(() => {
    type RGBA = [number, number, number, number];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { error: 'canvas unavailable', samples: [], failures: [] };
    const parse = (value: string): RGBA => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data] as RGBA;
    };
    const over = (fg: RGBA, bg: RGBA): RGBA => {
      const fa = fg[3] / 255,
        ba = bg[3] / 255,
        a = fa + ba * (1 - fa);
      if (!a) return [0, 0, 0, 0];
      return [0, 1, 2]
        .map((i) => Math.round((fg[i] * fa + bg[i] * ba * (1 - fa)) / a))
        .concat(Math.round(a * 255)) as RGBA;
    };
    const lum = (c: RGBA) => {
      const f = (v: number) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    };
    const samples: ContrastSample[] = [];
    const screen = document.querySelector('.tess-screen');
    if (!screen) return { error: 'screen missing', samples, failures: samples };
    for (const el of Array.from(screen.querySelectorAll<HTMLElement>('*'))) {
      const text = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (
        !text ||
        rect.width < 1 ||
        rect.height < 1 ||
        style.visibility === 'hidden' ||
        style.display === 'none'
      )
        continue;
      const chain: HTMLElement[] = [];
      for (let n: HTMLElement | null = el; n; n = n.parentElement) chain.unshift(n);
      let bg: RGBA = [255, 255, 255, 255];
      let gradient = false;
      for (const ancestor of chain) {
        const s = getComputedStyle(ancestor);
        if (s.backgroundImage !== 'none') gradient = true;
        bg = over(parse(s.backgroundColor), bg);
      }
      if (bg[3] < 255) bg = over(bg, [255, 255, 255, 255]);
      const fg = parse(style.color);
      const painted = over(fg, bg);
      const ratio =
        (Math.max(lum(painted), lum(bg)) + 0.05) / (Math.min(lum(painted), lum(bg)) + 0.05);
      const px = parseFloat(style.fontSize);
      const large = px >= 24 || (px >= 18.66 && parseInt(style.fontWeight, 10) >= 700);
      const sample = {
        text: text.slice(0, 100),
        tag: el.tagName.toLowerCase(),
        className: typeof el.className === 'string' ? el.className.slice(0, 100) : '',
        foreground: style.color,
        background: `rgb(${bg[0]},${bg[1]},${bg[2]})`,
        ratio: +ratio.toFixed(2),
        threshold: large ? 3 : 4.5,
        gradient,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
      };
      samples.push(sample);
    }
    return {
      theme: document.documentElement.dataset.theme ?? 'light',
      textCount: samples.length,
      failures: samples.filter((s) => !s.gradient && Number(s.ratio) < Number(s.threshold)),
      samples,
    };
  });
}
test('published Site: all 40 Gold resources keep expressive dark-theme text readable', async ({
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
  page.on('console', (m) => {
    if (m.type() === 'error') diagnostics.console.push(m.text());
    if (m.type() === 'warning') diagnostics.warnings.push(m.text());
  });
  page.on('pageerror', (e) => diagnostics.pageErrors.push(e.message));
  page.on('requestfailed', (r) =>
    diagnostics.failedRequests.push(`${r.url()} ${r.failure()?.errorText ?? ''}`)
  );
  page.on('response', (r) => {
    if (r.status() >= 400) diagnostics.httpErrors.push(`${r.status()} ${r.url()}`);
  });
  const out = path.resolve(
    process.cwd(),
    'audit/evidence/v25/gold-dark-contrast-sweep',
    info.project.name
  );
  await mkdir(out, { recursive: true });
  const results: Array<{
    slug: string;
    route: string;
    status: number | undefined;
    textCount: number | undefined;
    failures: ContrastSample[];
    screenshot: string | null;
  }> = [];
  for (const resource of gold) {
    const route = `/resources/${resource.slug}/`;
    const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(res?.status(), route).toBe(200);
    const iframe = page.locator('iframe[title$=" live preview"]');
    await expect(iframe).toBeVisible();
    const preview = page.frameLocator('iframe[title$=" live preview"]');
    const expectedId = `preview-${resource.slug}`;
    await expect(preview.locator(`[data-node-id="${expectedId}"]`)).toBeAttached({
      timeout: 20000,
    });
    await page.getByRole('button', { name: 'Expressive', exact: true }).click();
    await expect(iframe).toHaveAttribute('src', /variant=expressive/);
    await expect
      .poll(
        () =>
          page
            .frames()
            .some(
              (f) =>
                f.url().includes(`/preview-content/?resource=${resource.slug}&`) &&
                f.url().includes('variant=expressive')
            ),
        { timeout: 20000 }
      )
      .toBe(true);
    await expect(preview.locator(`[data-node-id="${expectedId}"]`)).toBeAttached({
      timeout: 20000,
    });
    await page.getByRole('button', { name: 'Switch to Dark theme' }).click();
    await expect(iframe).toHaveAttribute('src', /variant=expressive.*theme=dark/);
    const expectedFrameUrl = `/preview-content/?resource=${resource.slug}&variant=expressive&theme=dark`;
    await expect
      .poll(() => page.frames().some((f) => f.url().includes(expectedFrameUrl)), {
        timeout: 20000,
        message: `${resource.slug} dark expressive frame should finish loading`,
      })
      .toBe(true);
    await expect(preview.locator(`[data-node-id="${expectedId}"]`)).toBeAttached({
      timeout: 20000,
    });
    const frame = page.frames().find((f) => f.url().includes(expectedFrameUrl));
    expect(frame, route).toBeTruthy();
    const contrast = await measure(frame!);
    const screenshot = contrast.failures.length
      ? path.join(out, `${resource.slug}-1440x900.png`)
      : null;
    if (screenshot)
      await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
    const result = {
      slug: resource.slug,
      route,
      status: res?.status(),
      textCount: contrast.textCount,
      failures: contrast.failures,
      screenshot,
    };
    results.push(result);
    await writeFile(
      path.join(out, 'report.partial.json'),
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
    console.log(
      `${resource.slug}: ${contrast.textCount} text nodes; ${contrast.failures.length} contrast failures`
    );
  }
  const report = {
    site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    capturedAt: new Date().toISOString(),
    viewport: page.viewportSize(),
    goldResources: gold.length,
    diagnostics,
    results,
  };
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  expect(gold).toHaveLength(40);
  expect(
    results.flatMap((result) =>
      result.failures.map(
        (failure) =>
          `${result.slug}: ${failure.text} (${failure.ratio}:1, expected ${failure.threshold}:1)`
      )
    )
  ).toEqual([]);
  expect(diagnostics.console).toEqual([]);
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.httpErrors).toEqual([]);
  expect(diagnostics.failedRequests.filter((x) => !x.includes('net::ERR_ABORTED'))).toEqual([]);
});
