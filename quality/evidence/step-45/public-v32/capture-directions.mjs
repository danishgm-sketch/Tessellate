import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL =
  process.env.TESSELLATE_AUDIT_URL ??
  'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/';
const viewportName = process.env.TESSELLATE_AUDIT_VIEWPORT ?? 'desktop';
const viewport = viewportName === 'mobile'
  ? { width: 390, height: 844 }
  : { width: 1440, height: 900 };
const outputDir = path.resolve(
  `quality/evidence/step-45/public-v32/directions-${viewportName}-full`
);
const brief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport });
const consoleErrors = [];
const consoleWarnings = [];
const uncaughtExceptions = [];
const failedRequests = [];
const httpErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
  if (message.type() === 'warning') consoleWarnings.push(message.text());
});
page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
page.on('requestfailed', (request) =>
  failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
);
page.on('response', (response) => {
  if (response.status() >= 400)
    httpErrors.push({ url: response.url(), status: response.status() });
});

try {
  await page.goto(new URL('/compose', baseURL).toString(), { waitUntil: 'domcontentloaded' });
  await page.getByTestId('catalog-status').getByText('Catalogue ready').waitFor();
  await page.locator('#description').fill(brief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await page.getByText('Inferred Product Architecture', { exact: true }).waitFor();

  const directions = [];
  for (const direction of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${direction}`);
    const preview = page.getByTestId(`direction-preview-${direction}`);
    await card.waitFor();
    await preview.waitFor();
    const previewFrame = preview.locator('iframe');
    const frameCount = await previewFrame.count();
    const previewSrc = frameCount ? await previewFrame.first().getAttribute('src') : null;
    const previewText = (await preview.innerText()).trim();
    const unresolved = {
      requiredRoleDiagnostics: await preview
        .locator('[data-testid="unresolved-required-role-diagnostic"]')
        .count(),
      missingResources: await preview
        .locator('[data-testid="missing-resource-recovery"]')
        .count(),
      unresolvedLabels: await preview.locator('text=Unresolved resource:').count(),
    };
    const screenshot = path.join(outputDir, `direction-${direction}.png`);
    await preview.screenshot({ path: screenshot });

    await card
      .getByRole('button', { name: 'Inspect full preview and DNA' })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await dialog.getByLabel('Direction preview screen').selectOption({ label: 'Team Overview' });
    const canvas = dialog.locator('.tess-screen');
    const details = dialog.locator('details').filter({ hasText: 'Design DNA and resource references' });
    const renderedStructure = await canvas.evaluate((root) => {
      const rect = (element) => {
        if (!element) return null;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
          display: style.display,
          flexDirection: style.flexDirection,
          gridTemplateColumns: style.gridTemplateColumns,
        };
      };
      const navigation = root.querySelector('[data-semantic-role="navigation"]');
      const navigationList = navigation?.querySelector('nav');
      const workspace = root.querySelector('[data-semantic-role="workspace-multi-pane"]');
      const table = root.querySelector('[data-semantic-role="data-table"]');
      const activity = root.querySelector('[data-semantic-role="activity-feed"]');
      return {
        screen: rect(root),
        rootRole: root.querySelector(':scope > .tess-node')?.getAttribute('data-semantic-role') ?? null,
        navigation: rect(navigation),
        navigationList: rect(navigationList),
        workspace: rect(workspace),
        dataTable: rect(table),
        activityFeed: rect(activity),
      };
    });
    const dialogScreenshot = path.join(outputDir, `direction-${direction}-team-overview-dialog.png`);
    await dialog.screenshot({ path: dialogScreenshot, animations: 'disabled' });
    await details.locator('summary').click();
    const manifest = JSON.parse(await details.locator('pre').innerText());
    const dialogText = (await dialog.innerText()).trim();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });

    directions.push({
      id: direction,
      projectId: await card.getAttribute('data-project-id'),
      cardText: (await card.innerText()).trim(),
      preview: { frameCount, src: previewSrc, text: previewText, unresolved },
      inspectionDialogText: dialogText,
      manifest: {
        id: manifest.id,
        navigation: manifest.navigation?.model,
        grammar: manifest.grammar,
        dashboardRoot: manifest.screens?.find((screen) => screen.name === 'Team Overview')?.rootNode?.semanticRole,
        dashboardNavigationResource: manifest.screens?.find((screen) => screen.name === 'Team Overview')?.rootNode?.children?.find((node) => node.semanticRole === 'navigation')?.resourceRef?.slug,
      },
      renderedStructure,
      dialogScreenshot: path.relative(process.cwd(), dialogScreenshot),
      screenshot: path.relative(process.cwd(), screenshot),
    });
  }

  await writeFile(
    path.join(outputDir, 'directions.json'),
    `${JSON.stringify(
      {
        route: page.url(),
        viewport: page.viewportSize(),
        brief,
        feel: 'professional but playful',
        visualAmbition: 'Refined',
        structuralCreativity: 'Radical',
        directions,
        consoleErrors,
        consoleWarnings,
        uncaughtExceptions,
        failedRequests,
        httpErrors,
      },
      null,
      2
    )}\n`
  );
} finally {
  await browser.close();
}
