import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const tools = [
  { route: '/tools/dna', slug: 'design-dna', title: 'Design DNA Lab' },
  { route: '/tools/backgrounds', slug: 'background-studio', title: 'Background Studio' },
  { route: '/tools/motion', slug: 'motion-studio', title: 'Motion Studio' },
  { route: '/tools/palette', slug: 'palette-studio', title: 'Palette Studio' },
  { route: '/tools/typography', slug: 'typography-lab', title: 'Typography Lab' },
  { route: '/tools/layout', slug: 'layout-composer', title: 'Layout Composer' },
  { route: '/tools/section-planner', slug: 'section-planner', title: 'Section Planner' },
  { route: '/tools/dataviz', slug: 'dataviz-styler', title: 'Data Visualisation Styler' },
  { route: '/tools/accessibility', slug: 'accessibility-lab', title: 'Accessibility Lab' },
  { route: '/tools/icons', slug: 'icon-lab', title: 'SVG / Icon Lab' },
];

async function openTool(page: Page, route: string) {
  await page.goto(route);
  await page.locator('astro-island[client="load"]').evaluateAll(async (islands) => {
    await Promise.all(
      islands.map((island) => {
        if (!island.hasAttribute('ssr')) return Promise.resolve();
        return new Promise<void>((resolve) =>
          island.addEventListener('astro:hydrate', resolve, { once: true })
        );
      })
    );
  });
}

test.describe('Ten client-side tools: deployed-style browser audit', () => {
  for (const tool of tools) {
    test(`${tool.title} renders at the active viewport without runtime failures`, async ({
      page,
    }, testInfo) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];
      const badResponses: Array<{ status: number; url: string }> = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('requestfailed', (request) =>
        failedRequests.push(
          `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`
        )
      );
      page.on('response', (response) => {
        if (response.status() >= 400)
          badResponses.push({ status: response.status(), url: response.url() });
      });

      await openTool(page, tool.route);
      await expect(page.getByRole('heading', { level: 1, name: tool.title })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: path.join(
          'quality',
          'evidence',
          'step-33',
          'after',
          `${testInfo.project.name}-${tool.slug}.png`
        ),
        fullPage: true,
      });

      const viewport = page.viewportSize();
      const layout = await page.evaluate(() => ({
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        pageHeight: document.documentElement.scrollHeight,
        horizontalOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }));
      const axe = await new AxeBuilder({ page }).analyze();
      const evidence = {
        route: tool.route,
        viewport: viewport ? `${viewport.width}x${viewport.height}` : 'unknown',
        title: tool.title,
        layout,
        visibleButtons: await page.getByRole('button').allTextContents(),
        consoleErrors,
        pageErrors,
        failedRequests,
        badResponses,
        axe: axe.violations.map(({ id, impact, help, nodes }) => ({
          id,
          impact,
          help,
          nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
        })),
        screenshot: `audit/evidence/v26/tools/after/${testInfo.project.name}-${tool.slug}.png`,
      };
      const evidenceDirectory = path.join('quality', 'evidence', 'step-33', 'after');
      await mkdir(evidenceDirectory, { recursive: true });
      await writeFile(
        path.join(evidenceDirectory, `${testInfo.project.name}-${tool.slug}.json`),
        JSON.stringify(evidence, null, 2)
      );
    });
  }
});

test.describe('Tool output and truthful-state regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      let copied = '';
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            copied = value;
          },
          readText: async () => copied,
        },
      });
    });
  });

  test('Data Visualisation Styler exports the selected chart recipe', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/dataviz');
    await page.getByRole('button', { name: 'Categorical Column Ledger' }).click();
    await page.getByRole('button', { name: 'Copy SVG Chart Code' }).click();

    const copied = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copied).toContain('<svg');
    expect(copied).toContain('<rect');
    expect(copied).not.toContain('className=');
  });

  test('Icon Lab exports the selected icon paths as standalone SVG', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/icons');
    await page
      .getByRole('button', { name: /ArrowRight/ })
      .first()
      .click();
    await page.getByRole('button', { name: 'Copy SVG', exact: true }).click();

    const copied = await page.evaluate(async () => navigator.clipboard.readText());
    expect(copied).toContain('<svg');
    expect(copied).toMatch(/<(path|line|circle|polyline|polygon)\b/);
    expect(copied).toContain('width="24"');
  });

  test('Icon Lab reports clipboard denial without a false success or uncaught error', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    const browserErrors: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text());
    });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error('permission denied');
          },
          readText: async () => '',
        },
      });
      document.execCommand = () => false;
    });
    await openTool(page, '/tools/icons');
    await page.getByRole('button', { name: 'Copy SVG', exact: true }).click();

    await expect(page.getByRole('alert')).toContainText('Allow clipboard access');
    await expect(page.getByText('Copied SVG!', { exact: true })).toHaveCount(0);
    expect(browserErrors).toEqual([]);
  });

  test('Accessibility Lab describes only the checks it performs and labels paired inputs distinctly', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/accessibility');

    await expect(page.getByText('WCAG 2.2 AA Baseline Guaranteed')).toHaveCount(0);
    await expect(page.getByText(/reduced-motion fallbacks/i)).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Foreground colour hex value' })).toHaveCount(1);
    await expect(page.getByLabel('Foreground colour picker')).toHaveCount(1);
  });

  test('Accessibility Lab reports malformed colours instead of calculating with invalid values', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/accessibility');
    await page.getByRole('textbox', { name: 'Foreground colour hex value' }).fill('purple');

    await expect(page.getByRole('alert')).toContainText('valid six-digit hex colours');
    await expect(page.getByText('—', { exact: true })).toBeVisible();
    await expect(page.getByText('NaN:1', { exact: true })).toHaveCount(0);
  });

  test('Section Planner identifies example claims as content to verify', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/section-planner');
    await expect(
      page.getByText(/planning prompts, not implementation or verified proof/i)
    ).toBeVisible();
  });

  test('Typography reset restores the scale, pairing, numerical settings, and preview mode', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/typography');
    await page.getByRole('button', { name: 'Golden Ratio' }).click();
    await page.getByRole('button', { name: 'Newsreader Editorial & Inter' }).click();
    await page.getByRole('checkbox', { name: 'Use slashed zero' }).uncheck();
    await page.getByRole('button', { name: 'Tabular Figure Sample' }).click();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Minor Third' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByRole('button', { name: 'Geist & System Mono' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByRole('checkbox', { name: 'Use slashed zero' })).toBeChecked();
    await expect(page.getByRole('button', { name: 'Hierarchical Scale Ladder' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('Typography Lab keeps its specimen illustrative and its labels truthful', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/typography');

    const specimen = page.locator('main');
    await expect(specimen.getByText('zero cognitive strain', { exact: false })).toHaveCount(0);
    await expect(specimen.getByText('Status Indicator AA', { exact: false })).toHaveCount(0);
    await expect(specimen.getByText('MEASURED METRIC', { exact: false })).toHaveCount(0);
    await expect(specimen.getByRole('button', { name: 'Tabular Figure Sample' })).toBeVisible();

    await page.getByRole('button', { name: 'Golden Ratio' }).click();
    await expect(specimen.getByText('110px max', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Copy Scale CSS' }).click();
    await expect
      .poll(async () => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('--font-size-h1: clamp(36px, 7.64vw, 110px)');

    await page.getByRole('button', { name: 'Tabular Figure Sample' }).click();
    await expect(specimen.getByText(/Illustrative sample data/)).toBeVisible();
    await expect(specimen.getByRole('columnheader', { name: 'Record ID' })).toBeVisible();
    await expect(specimen.getByRole('columnheader', { name: 'Value' })).toBeVisible();
    await expect(specimen.getByText(/asset id|settlement|latency|£1,420,890/i)).toHaveCount(0);
  });

  test('Typography Lab keeps all numeric sample fields visible on mobile', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome');
    await openTool(page, '/tools/typography');
    await page.getByRole('button', { name: 'Tabular Figure Sample' }).click();

    const records = page.getByRole('list', { name: 'Illustrative numeric sample records' });
    await expect(records).toBeVisible();
    await expect(records.getByRole('listitem')).toHaveCount(4);
    await expect(
      page.getByRole('table', { name: 'Illustrative numeric sample records' })
    ).toBeHidden();
    for (const field of ['Record ID', 'Value', 'Change', 'Elapsed']) {
      await expect(records.getByText(field, { exact: true }).first()).toBeVisible();
    }

    const boxes = await records.getByRole('listitem').evaluateAll((items) =>
      items.map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      })
    );
    expect(boxes).toHaveLength(4);
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual((await page.viewportSize())!.width);
    }
  });

  test('Typography Lab scales its highest type preset without mobile overflow', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chrome');
    await openTool(page, '/tools/typography');
    await page.getByRole('button', { name: 'Golden Ratio' }).click();

    const dimensions = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('main h1')].find((node) =>
        node.textContent?.includes('A product, shaped by people.')
      );
      return {
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        headingFontSize: heading ? getComputedStyle(heading).fontSize : null,
        headingRight: heading?.getBoundingClientRect().right ?? null,
      };
    });
    expect(dimensions.headingFontSize).toBeTruthy();
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
    expect(dimensions.headingRight).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
  });

  test('Background Studio identifies its preview as a sample and disables example actions', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/backgrounds');
    const preview = page.locator('main');

    await expect(preview.getByText(/static preview/i)).toBeVisible();
    await expect(preview.getByText('Telemetry Node', { exact: true })).toHaveCount(0);
    await expect(preview.getByText('HEALTH 99.8%', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Dismiss sample' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Acknowledge sample' })).toBeDisabled();
  });

  test('Palette Studio describes calculated contrast without claiming full accessibility', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/palette');
    const preview = page.locator('main');

    await expect(
      preview.getByText(/inspect calculated contrast for selected colour pairs/i)
    ).toBeVisible();
    await expect(preview.getByText(/accessible palette tokens with live wcag/i)).toHaveCount(0);
    await expect(preview.getByText(/real-time token rendering proof/i)).toHaveCount(0);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /calculated contrast for selected colour pairs/i
    );
  });

  test('Palette Studio marks the numeric preview value as sample data and keeps its action working', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/palette');
    const preview = page.locator('main');

    await expect(preview.getByText(/sample value: 1,284/i)).toBeVisible();
    await expect(preview.getByText(/static sample, not a live product screen/i)).toBeVisible();
    await expect(preview.getByText('£2,450,000.00', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Try sample action' }).click();
    await expect(preview.getByRole('status')).toContainText('No transaction was submitted');
  });

  test('Motion Studio exposes a reset that returns its controls to the initial preset', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/motion');
    await page.getByRole('button', { name: 'Energetic Tactile' }).click();
    await expect(page.getByRole('button', { name: 'Spring Physics' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await page.getByRole('button', { name: 'Reset motion settings' }).click();

    await expect(page.getByRole('button', { name: 'Calm Precision' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByRole('button', { name: 'Cubic-Bezier', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByLabel('Is reduced motion')).not.toBeChecked();
  });

  test('Design DNA Feel Mixer applies a brief through its visible controls', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/dna');
    await page.getByRole('button', { name: /Feel Mixer/ }).click();
    await page
      .getByRole('textbox', { name: 'Describe the desired feel' })
      .fill('professional but playful');
    await page.getByRole('button', { name: 'Apply Feel to DNA' }).click();

    await expect(page.getByText('playful', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Reset Baseline' }).click();
  });

  test('Design DNA reset restores the baseline preset and its selected state', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    const runtime = {
      consoleErrors: [] as string[],
      uncaughtExceptions: [] as string[],
      failedRequests: [] as string[],
      httpErrors: [] as Array<{ url: string; status: number }>,
    };
    page.on('console', (message) => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) => runtime.failedRequests.push(request.url()));
    page.on('response', (response) => {
      if (response.status() >= 400)
        runtime.httpErrors.push({ url: response.url(), status: response.status() });
    });

    await openTool(page, '/tools/dna');
    await page.getByRole('button', { name: /Bold Startup/ }).click();
    await expect(page.getByRole('button', { name: /Bold Startup/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await page.getByRole('button', { name: 'Reset Baseline' }).click();

    await expect(page.getByRole('button', { name: /Institutional Intelligence/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByRole('button', { name: /Bold Startup/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    );

    const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-39/after/desktop');
    await mkdir(evidenceDirectory, { recursive: true });
    const screenshot = path.join(evidenceDirectory, 'dna-reset-baseline.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    await writeFile(
      path.join(evidenceDirectory, 'dna-reset-baseline.json'),
      `${JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          route: page.url(),
          viewport: page.viewportSize(),
          selectedBeforeReset: 'Bold Startup',
          selectedAfterReset: 'Institutional Intelligence',
          ariaPressedAfterReset: {
            baseline: await page
              .getByRole('button', { name: /Institutional Intelligence/ })
              .getAttribute('aria-pressed'),
            boldStartup: await page
              .getByRole('button', { name: /Bold Startup/ })
              .getAttribute('aria-pressed'),
          },
          runtime,
          screenshot,
        },
        null,
        2
      )}\n`,
      'utf8'
    );
  });

  test('Background Studio preset changes the preview and reset restores its baseline', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/backgrounds');
    await page.getByRole('button', { name: 'Subtle Hairline Grid' }).click();
    await expect(page.getByText('GRID FIELD')).toBeVisible();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByText('MESH FIELD')).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Grid cell pitch' })).toHaveValue('60');
  });

  test('Palette Studio preset updates its selected state and reset returns to default', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/palette');
    await page.getByRole('button', { name: 'Pure Monochrome' }).click();
    await expect(page.getByRole('button', { name: 'Pure Monochrome' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Zinc Editorial (Tessellate Default)' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('Layout Composer resets the grammar and viewport after changes', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/layout');
    await page.getByRole('button', { name: 'Asymmetric Bento Grid' }).click();
    await page.getByRole('button', { name: 'Mobile preview (375px)' }).click();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Standard Application Sidebar' })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Desktop preview (1440px)' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('Data Visualisation density changes the displayed sample count and reset restores it', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/dataviz');
    const chart = page.locator('svg[viewBox="0 0 500 220"]');
    await expect(chart.locator('circle')).toHaveCount(7);
    await page.getByRole('slider', { name: 'Data density' }).focus();
    await page.getByRole('slider', { name: 'Data density' }).press('Home');
    await expect(page.getByText('20/100')).toBeVisible();
    await expect(chart.locator('circle')).toHaveCount(3);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(chart.locator('circle')).toHaveCount(7);
  });

  test('Section Planner adds, reorders, copies, and resets its blueprint through the UI', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome');
    await openTool(page, '/tools/section-planner');
    await expect(page.getByText('WITHIN GUIDE')).toBeVisible();
    await page.getByRole('button', { name: 'Move Hero Value Proposition down' }).click();
    await page.getByRole('textbox', { name: 'Custom section title' }).fill('Employee Handbook');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByText('Employee Handbook', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Copy Section Graph JSON' }).click();

    const exported = JSON.parse(
      await page.evaluate(async () => navigator.clipboard.readText())
    ) as { grammar: Array<{ name: string }> };
    expect(exported.grammar[0]?.name).toBe('Evidence and Customer References');
    expect(exported.grammar.some((section) => section.name === 'Employee Handbook')).toBe(true);
    await page.getByRole('button', { name: 'Reset Blueprint' }).click();
    await expect(page.getByText('Employee Handbook')).toHaveCount(0);
  });
});
