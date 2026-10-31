import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type ContrastSample = {
  elapsedMs: number;
  foreground: string;
  background: string;
  opacity: number;
  ratio: number;
};

declare global {
  interface Window {
    __tessellateFilterContrastSamples?: ContrastSample[];
  }
}

test('homepage catalogue filters keep readable contrast through initial hydration', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const samples: ContrastSample[] = [];
    window.__tessellateFilterContrastSamples = samples;
    const observed = new WeakSet<Element>();
    const parse = (value: string) => {
      const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return {
        red: channels[0] ?? 0,
        green: channels[1] ?? 0,
        blue: channels[2] ?? 0,
        alpha: channels.length > 3 ? channels[3] : 1,
      };
    };
    const composite = (
      foreground: ReturnType<typeof parse>,
      background: ReturnType<typeof parse>,
    ) => {
      const alpha = foreground.alpha;
      return {
        red: foreground.red * alpha + background.red * (1 - alpha),
        green: foreground.green * alpha + background.green * (1 - alpha),
        blue: foreground.blue * alpha + background.blue * (1 - alpha),
        alpha: 1,
      };
    };
    const luminance = (color: ReturnType<typeof parse>) => {
      const channel = (value: number) => {
        const normalized = value / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(color.red) + 0.7152 * channel(color.green) + 0.0722 * channel(color.blue);
    };
    const contrast = (first: ReturnType<typeof parse>, second: ReturnType<typeof parse>) => {
      const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
      return (values[0] + 0.05) / (values[1] + 0.05);
    };

    document.addEventListener('transitionrun', (event) => {
      const target = event.target;
      if (
        !(target instanceof HTMLButtonElement) ||
        target.textContent?.trim() !== 'All' ||
        observed.has(target)
      ) return;
      observed.add(target);
      const startedAt = performance.now();
      const capture = () => {
        if (!target.isConnected) return;
        const style = getComputedStyle(target);
        const backdrop = parse(getComputedStyle(target.parentElement ?? document.body).backgroundColor);
        const buttonBackground = parse(style.backgroundColor);
        const visibleBackground = composite(buttonBackground, backdrop);
        const textOnButton = composite(parse(style.color), visibleBackground);
        const opacity = Number.parseFloat(style.opacity) || 0;
        const visibleText = composite(
          { ...textOnButton, alpha: opacity },
          backdrop,
        );
        const finalBackground = composite(
          { ...visibleBackground, alpha: opacity },
          backdrop,
        );
        samples.push({
          elapsedMs: Math.round(performance.now() - startedAt),
          foreground: `rgb(${Math.round(visibleText.red)}, ${Math.round(visibleText.green)}, ${Math.round(visibleText.blue)})`,
          background: `rgb(${Math.round(finalBackground.red)}, ${Math.round(finalBackground.green)}, ${Math.round(finalBackground.blue)})`,
          opacity,
          ratio: Number(contrast(visibleText, finalBackground).toFixed(2)),
        });
        if (performance.now() - startedAt < 250) requestAnimationFrame(capture);
      };
      capture();
    }, true);
  });

  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const filterHeading = page.getByRole('heading', { name: 'Open resources. Clear sample data.' });
  await filterHeading.scrollIntoViewIfNeeded();
  const allFilter = page.getByRole('button', { name: 'All', exact: true });
  await expect(allFilter).toBeVisible();
  await expect(allFilter).toBeEnabled();
  await page.waitForTimeout(300);

  const samples = await page.evaluate(() => window.__tessellateFilterContrastSamples ?? []);
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const evidence = {
    route: page.url(),
    viewport: page.viewportSize(),
    capturedTransitionFrames: samples.length,
    minimumContrastRatio: samples.length ? Math.min(...samples.map((sample) => sample.ratio)) : null,
    samples,
    postHydrationContrastViolations: axe.violations
      .filter((violation) => violation.id === 'color-contrast')
      .map(({ id, impact, nodes }) => ({
        id,
        impact,
        nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
      })),
  };
  await testInfo.attach('homepage-filter-hydration-contrast.json', {
    body: JSON.stringify(evidence, null, 2),
    contentType: 'application/json',
  });
  await page.screenshot({
    path: testInfo.outputPath(`homepage-filter-hydration-${testInfo.project.name}.png`),
    animations: 'disabled',
  });

  expect(samples.filter((sample) => sample.ratio < 4.5), JSON.stringify(evidence, null, 2)).toEqual([]);
  expect(evidence.postHydrationContrastViolations, JSON.stringify(evidence, null, 2)).toEqual([]);
});
