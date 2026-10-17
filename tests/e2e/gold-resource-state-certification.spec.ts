import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

type StateEvidence = {
  slug: string;
  route: string;
  viewport: string;
  emptyState: 'PASS';
  largeData: 'PASS';
  interaction: 'PASS';
  screenshots: string[];
};

type BrowserDiagnostics = {
  consoleErrors: string[];
  consoleWarnings: string[];
  pageErrors: string[];
  failedRequests: string[];
  httpErrors: string[];
};

async function updatePreviewProps(
  iframe: import('@playwright/test').Locator,
  props: Record<string, unknown>
) {
  await iframe.evaluate((element, nextProps) => {
    const previewWindow = (element as HTMLIFrameElement).contentWindow;
    // Sandboxed previews have an opaque origin, so the host protocol targets "*";
    // PreviewHost validates the sender against window.parent and document.referrer.
    previewWindow?.postMessage({ type: 'TESSELLATE_PREVIEW_UPDATE', props: nextProps }, '*');
  }, props);
}

test('Gold data resources handle empty states, large datasets, long content, and interaction', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'These state fixtures run against the isolated Sites Worker preview.'
  );
  test.setTimeout(60000);

  const viewport = { width: 360, height: 844 };
  await page.setViewportSize(viewport);
  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/state-captures');
  mkdirSync(evidenceDir, { recursive: true });
  const results: StateEvidence[] = [];
  const diagnostics: BrowserDiagnostics = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    failedRequests: [],
    httpErrors: [],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
    if (message.type() === 'warning') diagnostics.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    diagnostics.failedRequests.push(
      `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`
    );
  });
  page.on('response', (response) => {
    if (response.status() >= 400)
      diagnostics.httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/resources/advanced-data-table/', { waitUntil: 'domcontentloaded' });
  const tableIframe = page.locator('iframe[title$=" live preview"]');
  const table = page.frameLocator('iframe[title$=" live preview"]');
  await expect(table.locator('.tess-screen')).toHaveCount(1);
  await updatePreviewProps(tableIframe, { title: 'People directory', rows: [] });
  await expect(table.getByRole('textbox', { name: 'Filter People directory' })).toBeVisible();
  await expect(table.getByRole('status')).toHaveText('No records to show.');
  const tableEmptyScreenshot = path.join(evidenceDir, 'advanced-data-table-empty-360.png');
  await page.screenshot({ path: tableEmptyScreenshot, animations: 'disabled' });

  const longName = `Employee ${'Alexandria '.repeat(9).trim()}`;
  const rows = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    name: index === 99 ? longName : `employee-${String(index + 1).padStart(3, '0')}`,
    type: 'engineering',
    quality: 95,
    status: 'active',
  }));
  await updatePreviewProps(tableIframe, { rows });
  await expect(table.locator('tbody tr')).toHaveCount(100);
  await expect(table.getByText(longName, { exact: true })).toBeVisible();
  const tableDimensions = await table
    .locator('html')
    .evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  expect(tableDimensions.scrollWidth).toBeLessThanOrEqual(tableDimensions.clientWidth + 2);
  const firstCheckbox = table.getByRole('checkbox', { name: 'Select employee-001' });
  await firstCheckbox.press('Space');
  await expect(firstCheckbox).toBeChecked();
  await table.getByRole('textbox', { name: 'Filter People directory' }).fill('employee-099');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table.getByText('employee-099', { exact: true })).toBeVisible();
  await table.getByRole('textbox', { name: 'Filter People directory' }).fill('no-matching-person');
  await expect(table.getByRole('status')).toHaveText('No records match this filter.');
  await table.getByRole('textbox', { name: 'Filter People directory' }).fill('employee-099');
  const tableLargeScreenshot = path.join(evidenceDir, 'advanced-data-table-large-360.png');
  await page.screenshot({ path: tableLargeScreenshot, animations: 'disabled' });
  results.push({
    slug: 'advanced-data-table',
    route: '/resources/advanced-data-table/',
    viewport: '360x844',
    emptyState: 'PASS',
    largeData: 'PASS',
    interaction: 'PASS',
    screenshots: [tableEmptyScreenshot, tableLargeScreenshot].map((file) =>
      path.relative(process.cwd(), file).replaceAll('\\', '/')
    ),
  });

  await page.goto('/resources/kanban-board/', { waitUntil: 'domcontentloaded' });
  const boardIframe = page.locator('iframe[title$=" live preview"]');
  const board = page.frameLocator('iframe[title$=" live preview"]');
  await expect(board.locator('.tess-screen')).toHaveCount(1);
  await updatePreviewProps(boardIframe, { title: 'Employee onboarding', columns: [] });
  await expect(board.getByRole('status')).toHaveText(
    'No tasks yet. Add a column or task to get started.'
  );
  const boardEmptyScreenshot = path.join(evidenceDir, 'kanban-board-empty-360.png');
  await page.screenshot({ path: boardEmptyScreenshot, animations: 'disabled' });

  const tasks = Array.from(
    { length: 20 },
    (_, index) => `onboarding-task-${String(index + 1).padStart(2, '0')}`
  );
  tasks[19] = `Prepare employee welcome pack ${'with role-specific notes '.repeat(5).trim()}`;
  await updatePreviewProps(boardIframe, { columns: [{ title: 'First week', tasks }] });
  await expect(board.getByRole('button')).toHaveCount(20);
  await expect(board.getByRole('button', { name: tasks[19] })).toBeVisible();
  const boardDimensions = await board
    .locator('html')
    .evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  expect(boardDimensions.scrollWidth).toBeLessThanOrEqual(boardDimensions.clientWidth + 2);
  const taskButton = board.getByRole('button', { name: tasks[0] });
  await taskButton.press('Space');
  await expect(taskButton).toHaveAttribute('aria-pressed', 'true');
  const boardLargeScreenshot = path.join(evidenceDir, 'kanban-board-large-360.png');
  await page.screenshot({ path: boardLargeScreenshot, animations: 'disabled' });
  results.push({
    slug: 'kanban-board',
    route: '/resources/kanban-board/',
    viewport: '360x844',
    emptyState: 'PASS',
    largeData: 'PASS',
    interaction: 'PASS',
    screenshots: [boardEmptyScreenshot, boardLargeScreenshot].map((file) =>
      path.relative(process.cwd(), file).replaceAll('\\', '/')
    ),
  });

  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.pageErrors).toEqual([]);
  expect(diagnostics.failedRequests).toEqual([]);
  expect(diagnostics.httpErrors).toEqual([]);

  writeFileSync(
    path.resolve(process.cwd(), 'audit/evidence/step-06/results/gold-resource-states-final.json'),
    JSON.stringify(
      {
        schemaVersion: '1.0.0',
        browserProject: testInfo.project.name,
        findings: 0,
        viewport: '360x844',
        diagnostics,
        resources: results,
      },
      null,
      2
    )
  );
});
