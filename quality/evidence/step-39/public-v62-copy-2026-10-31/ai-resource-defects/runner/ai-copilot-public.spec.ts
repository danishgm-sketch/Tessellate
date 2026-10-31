import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const evidenceDirectory = path.resolve(
  process.cwd(),
  'quality/evidence/step-39/public-v62-copy-2026-10-31/ai-resource-defects'
);
const evidencePhase = process.env.TESS_AUDIT_PHASE ?? 'before-v62';

test('AI Copilot Sidebar does not expose an unconnected Apply action', async ({ page }, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/r/ai-copilot-sidebar/');
  await expect(page.getByRole('heading', { name: 'AI Copilot Sidebar', level: 1 })).toBeVisible();
  await expect(
    page.getByText(/Example copilot sidebar with sample file context and suggested fixes/i).first()
  ).toBeVisible();
  const previewFrame = page.locator('iframe[title="AI Copilot Sidebar live preview"]');
  await expect(previewFrame).toBeVisible();
  const frame = page.frameLocator('iframe[title="AI Copilot Sidebar live preview"]');
  const applyButton = frame.getByRole('button', { name: 'Apply All Recommended Fixes' });
  const frameBody = await frame.locator('body').innerText().catch((error: unknown) =>
    `Could not read the preview frame body: ${error instanceof Error ? error.message : String(error)}`
  );
  const frameAttributes = await previewFrame.evaluate((element) => ({
    src: element.getAttribute('src'),
    title: element.getAttribute('title'),
    sandbox: element.getAttribute('sandbox'),
  }));
  const initialDiagnostic = {
    siteVersion: Number(process.env.TESS_AUDIT_SITE_VERSION ?? '62'),
    site: page.url(),
    viewport: page.viewportSize(),
    project: testInfo.project.name,
    frameAttributes,
    frameUrls: page.frames().map((childFrame) => childFrame.url()),
    frameBody,
    runtime,
  };
  mkdirSync(path.join(evidenceDirectory, evidencePhase), { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, `${evidencePhase}/ai-copilot-sidebar-${testInfo.project.name}.png`),
    fullPage: true,
  });
  writeFileSync(
    path.join(evidenceDirectory, `${evidencePhase}/ai-copilot-sidebar-${testInfo.project.name}.json`),
    `${JSON.stringify(initialDiagnostic, null, 2)}\n`
  );
  await expect(applyButton).toBeVisible();
  await expect(frame.getByTestId('ai-copilot-apply-help'))
    .toContainText('host connects a validated apply action');
  await expect(frame.getByText(/does not inspect files or change source code/i)).toBeVisible();

  const beforeText = await frame.locator('body').innerText();
  const initiallyEnabled = await applyButton.isEnabled();
  if (initiallyEnabled) {
    await applyButton.click();
  }
  const afterText = await frame.locator('body').innerText();
  const report = {
    siteVersion: Number(process.env.TESS_AUDIT_SITE_VERSION ?? '62'),
    site: new URL(page.url()).origin,
    route: page.url(),
    viewport: page.viewportSize(),
    project: testInfo.project.name,
    visibleDescriptionClaims: [
      'Example copilot sidebar with sample file context and suggested fixes',
      'The preview does not inspect files or change source code',
    ],
    applyButton: {
      label: 'Apply All Recommended Fixes',
      initiallyEnabled,
      textBeforeClick: beforeText,
      textAfterClick: afterText,
      visibleOutcome: initiallyEnabled
        ? beforeText === afterText
          ? 'Enabled action produces no visible result.'
          : 'Preview content changed.'
        : 'Action is unavailable until a host connects it.',
    },
    runtime,
    screenshot: `${evidencePhase}/ai-copilot-sidebar-${testInfo.project.name}.png`,
  };
  mkdirSync(path.join(evidenceDirectory, evidencePhase), { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, report.screenshot),
    fullPage: true,
  });
  writeFileSync(
    path.join(evidenceDirectory, `${evidencePhase}/ai-copilot-sidebar-${testInfo.project.name}.json`),
    `${JSON.stringify(report, null, 2)}\n`
  );

  expect(initiallyEnabled).toBe(false);
  await expect(applyButton).toBeDisabled();
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
