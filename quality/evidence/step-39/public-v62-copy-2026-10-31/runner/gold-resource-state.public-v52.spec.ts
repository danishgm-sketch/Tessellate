import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

type StateEvidence = {
  slug: string;
  route: string;
  viewport: string;
  emptyState: 'PASS';
  largeData: 'PASS';
  interaction: 'PASS' | 'NOT_APPLICABLE';
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
    // PreviewHost validates the source window and the same-origin host sender.
    previewWindow?.postMessage({ type: 'TESSELLATE_PREVIEW_UPDATE', props: nextProps }, '*');
  }, props);
}

async function preserveBaselineScreenshot(
  page: import('@playwright/test').Page,
  screenshotPath: string
) {
  if (existsSync(screenshotPath)) return;
  mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, animations: 'disabled' });
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
  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-39/public-v62-copy-2026-10-31/resource-states/after/state-captures');
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
  const mobileRows = table.getByTestId('advanced-data-table-mobile-record');
  await expect(mobileRows).toHaveCount(100);
  await expect(mobileRows.nth(99).getByText(longName, { exact: true })).toBeVisible();
  const tableDimensions = await table
    .locator('html')
    .evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  expect(tableDimensions.scrollWidth).toBeLessThanOrEqual(tableDimensions.clientWidth + 2);
  const firstCheckbox = mobileRows.nth(0).getByRole('checkbox', { name: 'Select employee-001' });
  await firstCheckbox.press('Space');
  await expect(firstCheckbox).toBeChecked();
  await table.getByRole('textbox', { name: 'Filter People directory' }).fill('employee-099');
  await expect(mobileRows).toHaveCount(1);
  await expect(mobileRows.getByText('employee-099', { exact: true })).toBeVisible();
  await table.getByRole('textbox', { name: 'Filter People directory' }).fill('no-matching-person');
  await expect(mobileRows).toHaveCount(0);
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

  await page.goto('/resources/timeline/', { waitUntil: 'domcontentloaded' });
  const timelineIframe = page.locator('iframe[title$=" live preview"]');
  const timeline = page.frameLocator('iframe[title$=" live preview"]');
  await expect(timeline.locator('.tess-screen')).toHaveCount(1);
  await updatePreviewProps(timelineIframe, { title: 'Employee activity', events: [] });
  const timelineEmptyBeforePath = path.resolve(process.cwd(), 'quality/evidence/step-39/public-v62-copy-2026-10-31/resource-states/before/state-captures/timeline-empty-360-before.png');
  await preserveBaselineScreenshot(page, timelineEmptyBeforePath);
  await expect(timeline.getByRole('status')).toHaveText('No activity to show yet.');
  const timelineEmptyScreenshot = path.join(evidenceDir, 'timeline-empty-360.png');
  await page.screenshot({ path: timelineEmptyScreenshot, animations: 'disabled' });
  const timelineEvents = Array.from({ length: 40 }, (_, index) => ({
    time: `Week ${index + 1}`,
    title: `Employee milestone ${String(index + 1).padStart(2, '0')}`,
    desc: `Welcome and onboarding check-in for ${'Alexandria '.repeat(8).trim()} across the engineering team.`,
  }));
  await updatePreviewProps(timelineIframe, { events: timelineEvents });
  await expect(timeline.getByText(timelineEvents[39].title, { exact: true })).toBeVisible();
  const timelineDimensions = await timeline.locator('html').evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  expect(timelineDimensions.scrollWidth).toBeLessThanOrEqual(timelineDimensions.clientWidth + 2);
  const timelineLargeScreenshot = path.join(evidenceDir, 'timeline-large-360.png');
  await page.screenshot({ path: timelineLargeScreenshot, animations: 'disabled' });
  results.push({
    slug: 'timeline',
    route: '/resources/timeline/',
    viewport: '360x844',
    emptyState: 'PASS',
    largeData: 'PASS',
    interaction: 'NOT_APPLICABLE',
    screenshots: [timelineEmptyScreenshot, timelineLargeScreenshot].map((file) => path.relative(process.cwd(), file).replaceAll('\\', '/')),
  });

  await page.goto('/resources/dashboard-kpi-grid/', { waitUntil: 'domcontentloaded' });
  const kpiIframe = page.locator('iframe[title$=" live preview"]');
  const kpi = page.frameLocator('iframe[title$=" live preview"]');
  await expect(kpi.locator('.tess-screen')).toHaveCount(1);
  await updatePreviewProps(kpiIframe, { title: 'People overview', cards: [] });
  const kpiEmptyBeforePath = path.resolve(process.cwd(), 'quality/evidence/step-39/public-v62-copy-2026-10-31/resource-states/before/state-captures/dashboard-kpi-grid-empty-360-before.png');
  await preserveBaselineScreenshot(page, kpiEmptyBeforePath);
  await expect(kpi.getByRole('status')).toHaveText('No metrics to show yet.');
  const kpiEmptyScreenshot = path.join(evidenceDir, 'dashboard-kpi-grid-empty-360.png');
  await page.screenshot({ path: kpiEmptyScreenshot, animations: 'disabled' });
  const kpiCards = Array.from({ length: 50 }, (_, index) => ({
    label: `Employee measure ${String(index + 1).padStart(2, '0')} ${'across teams '.repeat(4).trim()}`,
    val: `${50 + index} people`,
    status: `Updated across ${24 + index} departments`,
  }));
  await updatePreviewProps(kpiIframe, { cards: kpiCards });
  await expect(kpi.getByText(kpiCards[49].label, { exact: true })).toBeVisible();
  const kpiDimensions = await kpi.locator('html').evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  expect(kpiDimensions.scrollWidth).toBeLessThanOrEqual(kpiDimensions.clientWidth + 2);
  const kpiLargeScreenshot = path.join(evidenceDir, 'dashboard-kpi-grid-large-360.png');
  await page.screenshot({ path: kpiLargeScreenshot, animations: 'disabled' });
  results.push({
    slug: 'dashboard-kpi-grid',
    route: '/resources/dashboard-kpi-grid/',
    viewport: '360x844',
    emptyState: 'PASS',
    largeData: 'PASS',
    interaction: 'NOT_APPLICABLE',
    screenshots: [kpiEmptyScreenshot, kpiLargeScreenshot].map((file) => path.relative(process.cwd(), file).replaceAll('\\', '/')),
  });

  await page.goto('/resources/notification-centre/', { waitUntil: 'domcontentloaded' });
  const defaultNotification = page.frameLocator('iframe[title$=" live preview"]');
  await expect(defaultNotification.getByText('Build Succeeded', { exact: true })).toBeVisible();
  const defaultMarkAllRead = defaultNotification.getByRole('button', { name: 'Mark all as read' });
  const notificationBeforeActionScreenshot = path.join(evidenceDir, 'notification-centre-before-mark-read-360.png');
  await page.screenshot({ path: notificationBeforeActionScreenshot, animations: 'disabled' });
  await defaultMarkAllRead.press('Enter');
  await expect(defaultNotification.getByRole('status')).toHaveText('2 notifications marked as read.');
  await expect(defaultMarkAllRead).toBeDisabled();
  const notificationFeedbackScreenshot = path.join(evidenceDir, 'notification-centre-read-feedback-360.png');
  await page.screenshot({ path: notificationFeedbackScreenshot, animations: 'disabled' });

  await page.goto('/resources/notification-centre/', { waitUntil: 'domcontentloaded' });
  const notificationIframe = page.locator('iframe[title$=" live preview"]');
  const notifications = page.frameLocator('iframe[title$=" live preview"]');
  await expect(notifications.locator('.tess-screen')).toHaveCount(1);
  await updatePreviewProps(notificationIframe, { title: 'Team updates', events: [] });
  const notificationEmptyBeforePath = path.resolve(process.cwd(), 'quality/evidence/step-39/public-v62-copy-2026-10-31/resource-states/before/state-captures/notification-centre-empty-360-before.png');
  await preserveBaselineScreenshot(page, notificationEmptyBeforePath);
  await expect(notifications.getByRole('status')).toHaveText('No notifications yet.');
  const markAllRead = notifications.getByRole('button', { name: 'Mark all as read' });
  await expect(markAllRead).toBeDisabled();
  const notificationEmptyScreenshot = path.join(evidenceDir, 'notification-centre-empty-360.png');
  await page.screenshot({ path: notificationEmptyScreenshot, animations: 'disabled' });
  const notificationEvents = Array.from({ length: 50 }, (_, index) => ({
    time: `${index + 1} minutes ago`,
    title: `Onboarding update ${String(index + 1).padStart(2, '0')} ${'for a new employee '.repeat(4).trim()}`,
    desc: 'A team member completed a first-week task.',
  }));
  await updatePreviewProps(notificationIframe, { events: notificationEvents });
  await expect(notifications.getByText(notificationEvents[49].title, { exact: true })).toBeVisible();
  await expect(markAllRead).toBeEnabled();
  await markAllRead.press('Enter');
  await expect(notifications.getByRole('status')).toHaveText('50 notifications marked as read.');
  const notificationDimensions = await notifications.locator('html').evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  expect(notificationDimensions.scrollWidth).toBeLessThanOrEqual(notificationDimensions.clientWidth + 2);
  const notificationLargeScreenshot = path.join(evidenceDir, 'notification-centre-large-360.png');
  await page.screenshot({ path: notificationLargeScreenshot, animations: 'disabled' });
  results.push({
    slug: 'notification-centre',
    route: '/resources/notification-centre/',
    viewport: '360x844',
    emptyState: 'PASS',
    largeData: 'PASS',
    interaction: 'PASS',
    screenshots: [notificationBeforeActionScreenshot, notificationFeedbackScreenshot, notificationEmptyScreenshot, notificationLargeScreenshot].map((file) => path.relative(process.cwd(), file).replaceAll('\\', '/')),
  });

  await page.goto('/resources/time-series-chart/', { waitUntil: 'domcontentloaded' });
  const chartIframe = page.locator('iframe[title$=" live preview"]');
  const chart = page.frameLocator('iframe[title$=" live preview"]');
  await expect(chart.locator('.tess-screen')).toHaveCount(1);
  await updatePreviewProps(chartIframe, { title: 'People onboarding activity', data: [] });
  const chartEmptyBeforePath = path.resolve(process.cwd(), 'quality/evidence/step-39/public-v62-copy-2026-10-31/resource-states/before/state-captures/time-series-chart-empty-360-before.png');
  await preserveBaselineScreenshot(page, chartEmptyBeforePath);
  await expect(chart.getByRole('status')).toContainText('No time-series data available for this period.');
  await expect(chart.getByText('No data yet', { exact: true })).toBeVisible();
  const chartEmptyScreenshot = path.join(evidenceDir, 'time-series-chart-empty-360.png');
  await page.screenshot({ path: chartEmptyScreenshot, animations: 'disabled' });
  const chartData = Array.from({ length: 48 }, (_, index) => ({ time: `Week ${index + 1}`, value: 40 + index * 2 }));
  await updatePreviewProps(chartIframe, { data: chartData });
  await expect(chart.locator('svg circle')).toHaveCount(0);
  await expect(chart.getByText('Week 48', { exact: true })).toBeVisible();
  const chartDimensions = await chart.locator('html').evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  expect(chartDimensions.scrollWidth).toBeLessThanOrEqual(chartDimensions.clientWidth + 2);
  const chartLargeScreenshot = path.join(evidenceDir, 'time-series-chart-large-360.png');
  await page.screenshot({ path: chartLargeScreenshot, animations: 'disabled' });
  results.push({
    slug: 'time-series-chart',
    route: '/resources/time-series-chart/',
    viewport: '360x844',
    emptyState: 'PASS',
    largeData: 'PASS',
    interaction: 'NOT_APPLICABLE',
    screenshots: [chartEmptyScreenshot, chartLargeScreenshot].map((file) => path.relative(process.cwd(), file).replaceAll('\\', '/')),
  });

  const sampleCharts = [
    { slug: 'bar-chart', heading: 'Sample daily sign-ups' },
    { slug: 'donut-chart', heading: 'Sample subscription mix' },
    { slug: 'area-chart', heading: 'Sample ingestion volume' },
    { slug: 'time-series-chart', heading: 'Sample API throughput (req/s)' },
  ];
  for (const sampleChart of sampleCharts) {
    const route = `/resources/${sampleChart.slug}/`;
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    const samplePreview = page.frameLocator('iframe[title$=" live preview"]');
    await expect(samplePreview.locator('.tess-screen')).toHaveCount(1);
    await expect(samplePreview.getByRole('heading', { name: sampleChart.heading, exact: true })).toBeVisible();
    await expect(samplePreview.getByText('Illustrative sample data — not live measurements.', { exact: true })).toBeVisible();
    const screenshot = path.join(evidenceDir, `${sampleChart.slug}-truthful-sample-360.png`);
    await page.screenshot({ path: screenshot, animations: 'disabled' });
    const previewText = await samplePreview.locator('body').innerText();
    writeFileSync(
      path.join(evidenceDir, `${sampleChart.slug}-truthful-sample-360.json`),
      JSON.stringify(
        {
          slug: sampleChart.slug,
          route: page.url(),
          viewport: '360x844',
          responseStatus: response?.status() ?? null,
          expectedHeading: sampleChart.heading,
          visibleSampleDisclosure: 'Illustrative sample data — not live measurements.',
          previewText,
          screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/'),
          diagnostics,
        },
        null,
        2
      ) + '\n'
    );
  }

  await page.goto('/resources/kanban-board/', { waitUntil: 'domcontentloaded' });
  const boardIframe = page.locator('iframe[title$=" live preview"]');
  const board = page.frameLocator('iframe[title$=" live preview"]');
  await expect(board.locator('.tess-screen')).toHaveCount(1);
  await expect(board.getByText('Scale 56 application blocks', { exact: true })).toHaveCount(0);
  await expect(board.getByText('72 Marketing sections verified', { exact: true })).toHaveCount(0);
  await expect(board.getByText('44 Primitives complete', { exact: true })).toHaveCount(0);
  await updatePreviewProps(boardIframe, { title: 'Employee onboarding', columns: [] });
  await expect(board.getByRole('status')).toHaveText('This board has no columns or tasks.');
  await expect(board.getByRole('button')).toHaveCount(0);
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

  const resultPath = path.resolve(
    process.cwd(),
    'quality/evidence/step-39/public-v62-copy-2026-10-31/resource-states/results/gold-resource-states-final.json'
  );
  mkdirSync(path.dirname(resultPath), { recursive: true });
  writeFileSync(
    resultPath,
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
