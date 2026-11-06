import { expect, test, type FrameLocator, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const runtimeFailures = new WeakMap<Page, { consoleErrors: string[]; uncaughtExceptions: string[]; failedRequests: string[]; httpErrors: string[] }>();

test.beforeEach(async ({ page }) => {
  const failures = { consoleErrors: [] as string[], uncaughtExceptions: [] as string[], failedRequests: [] as string[], httpErrors: [] as string[] };
  runtimeFailures.set(page, failures);
  page.on('console', (message) => {
    if (message.type() === 'error') failures.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => failures.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failures.failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.httpErrors.push(`${response.status()} ${response.url()}`);
  });
});

test.afterEach(async ({ page }) => {
  expect(runtimeFailures.get(page)).toEqual({ consoleErrors: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] });
});

async function openPreview(page: Page, slug: string): Promise<FrameLocator> {
  await page.goto(`/preview/?resource=${encodeURIComponent(slug)}`, { waitUntil: 'networkidle' });
  const preview = page.frameLocator('iframe[data-tessellate-preview-frame]');
  await expect(preview.locator('.tess-screen')).toBeVisible({ timeout: 15_000 });
  return preview;
}

test('multi-agent board identifies its lanes as sample content rather than a running swarm', async ({ page }) => {
  const preview = await openPreview(page, 'ai-multi-agent-board');
  const copy = await preview.locator('body').innerText();

  expect(copy).toMatch(/sample workflow/i);
  expect(copy).not.toMatch(/Antigravity SDK|Active Swarm|validating 324 resources/i);
});

test('plan review reports a local approval preview without claiming execution', async ({ page }) => {
  const preview = await openPreview(page, 'ai-plan-review');
  const button = preview.getByRole('button', { name: /preview plan approval/i });

  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  await expect(preview.getByRole('button', { name: /approval previewed/i })).toHaveAttribute('aria-pressed', 'true');
  await expect(preview.getByRole('status')).toContainText(/no tasks have started/i);
  expect(await preview.locator('body').innerText()).not.toMatch(/253 tests|~2m runtime|Plan Accepted & Running|Autonomous execution strategy/i);
});

test('marquee defaults avoid unsupported certification and configuration counts', async ({ page }) => {
  const preview = await openPreview(page, 'marquee-typography');
  const copy = await preview.locator('body').innerText();

  expect(copy).not.toMatch(/972 CONFIGURATIONS|WCAG AA VERIFIED/i);
  expect(copy).toMatch(/DESIGN WITH CLARITY/i);
});

test('story chapters are keyboard operable and do not claim unmeasured infrastructure performance', async ({ page }) => {
  const preview = await openPreview(page, 'sticky-scroll-story');
  const copy = await preview.locator('body').innerText();
  const review = preview.getByRole('button', { name: /review/i });

  expect(copy).not.toMatch(/sub-5ms|zero client bundle penalties/i);
  await review.focus();
  await page.keyboard.press('Enter');
  await expect(preview.getByText(/selected chapter/i)).toBeVisible();
  await expect(preview.getByText(/check the inputs before work moves to the next step/i)).toBeVisible();
});

test('number counter describes a sample count instead of verified catalogue certification', async ({ page }) => {
  const preview = await openPreview(page, 'number-count-up');
  const copy = await preview.locator('body').innerText();

  expect(copy).toMatch(/Example count/i);
  expect(copy).not.toMatch(/Canonical Resources Verified/i);
  await preview.getByRole('button', { name: /replay count/i }).click();
  await expect(preview.getByText('0', { exact: true })).toBeVisible();
  await expect(preview.getByText('1284', { exact: true })).toBeVisible({ timeout: 6000 });
});

test('number counter skips its animation when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const preview = await openPreview(page, 'number-count-up');

  await preview.getByRole('button', { name: /replay count/i }).click();
  await expect(preview.getByText('1284', { exact: true })).toBeVisible();
  await expect(preview.getByText('0', { exact: true })).toHaveCount(0);
});

test('version history uses sample revisions and restore preview gives visible local feedback', async ({ page }) => {
  const preview = await openPreview(page, 'version-history');
  const copy = await preview.locator('body').innerText();

  expect(copy).not.toMatch(/72 verified marketing sections|36 navigation shells|44 primitives/i);
  await preview.getByRole('button', { name: /preview restore/i }).first().click();
  await expect(preview.getByRole('status')).toContainText(/no project revision was changed/i);
});

test('data hero discloses that metrics are examples and are not live measurements', async ({ page }) => {
  const preview = await openPreview(page, 'data-hero');
  const copy = await preview.locator('body').innerText();

  expect(copy).toMatch(/sample metrics.*no live telemetry/i);
  expect(copy).not.toMatch(/Real-time telemetry|mission-critical dashboards where microsecond delays are unacceptable|vs baseline/i);
});

test('analytics shell presents sample data and disables unavailable date and export actions honestly', async ({ page }) => {
  const preview = await openPreview(page, 'analytics-shell');
  const copy = await preview.locator('body').innerText();

  expect(copy).toMatch(/illustrative sample data/i);
  await expect(preview.getByText(/Example period: last 30 days/i)).toBeVisible();
  await expect(preview.getByRole('button', { name: /export csv/i })).toBeDisabled();
  await expect(preview.getByText(/Connect a data source and export handler to enable CSV downloads/i)).toBeVisible();
});

test('data terminal labels its static quote and timings as sample values', async ({ page }) => {
  const preview = await openPreview(page, 'data-terminal-header');
  const copy = await preview.locator('body').innerText();

  expect(copy).toMatch(/SAMPLE DATA/i);
  expect(copy).toMatch(/No live feed/i);
  await expect(preview.locator('header div[title]')).toHaveAttribute('title', /static examples; no feed or probe is connected/i);
  expect(copy).not.toMatch(/● LIVE/i);
});

test('connection-lost state disables reconnect without a host callback and removes the false countdown', async ({ page }) => {
  const preview = await openPreview(page, 'connection-lost-state');
  const button = preview.getByRole('button', { name: /reconnect/i });
  const copy = await preview.locator('body').innerText();

  expect(copy).not.toMatch(/reconnecting automatically in 5s/i);
  await expect(button).toBeDisabled();
  await expect(preview.getByText(/automatic recovery is controlled by the host application/i)).toBeVisible();
});

test('feature toggle describes local preview state instead of claiming system connectivity', async ({ page }) => {
  const preview = await openPreview(page, 'feature-with-live-demo');
  const button = preview.getByRole('button', { name: /preview state: active/i });

  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(preview.getByText(/does not connect to an external system/i)).toBeVisible();
  expect(await preview.locator('body').innerText()).not.toMatch(/Live Sandbox|SYSTEM ACTIVE \[ONLINE\]|without re-render cascades/i);
  await button.click();
  await expect(preview.getByRole('button', { name: /preview state: inactive/i })).toHaveAttribute('aria-pressed', 'false');
});

test('kiosk shell identifies itself as an example and does not promise an absent inactivity timer', async ({ page }) => {
  const preview = await openPreview(page, 'kiosk-display-shell');
  const copy = await preview.locator('body').innerText();

  expect(copy).toMatch(/example signage interface/i);
  expect(copy).toMatch(/preview only.*no inactivity timer is running/i);
  expect(copy).not.toMatch(/Tessellate Signage Hub|Resets automatically after 60 seconds|Touch Screen to Begin/i);
});

test('globe preview identifies its locations and orbit as illustrative rather than live telemetry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const preview = await openPreview(page, 'interactive-globe');
  const copy = await preview.locator('body').innerText();

  expect(copy).toMatch(/illustrative locations.*no network or telemetry data is connected/i);
  expect(copy).toMatch(/Pulsing sample markers/i);
  expect(copy).not.toMatch(/Worldwide Telemetry Mesh|Live Orbit/i);
  const rotation = preview.getByRole('slider', { name: 'Map rotation' });
  const pulse = preview.locator('circle[class*="animate-ping"]').first();
  expect(await pulse.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
  await expect(rotation).toHaveValue('0');
  await rotation.focus();
  await page.keyboard.press('ArrowRight');
  await expect(rotation).toHaveValue('1');
  await expect(preview.getByText('Azimuth: 1°')).toBeVisible();
});

test('resource detail metadata matches the honest preview scope', async ({ page }) => {
  const cases = [
    { slug: 'ai-multi-agent-board', expected: /Kanban-style example board/i, preview: /Sample workflow/i, forbidden: /Antigravity SDK|swarm status board tracking assigned subagents/i },
    { slug: 'ai-plan-review', expected: /Structured example plan with steps/i, preview: /no coding agent is connected/i, forbidden: /Phase 18|253 tests|~2m runtime|proceed triggers/i },
    { slug: 'marquee-typography', expected: /Repeating text strip/i, preview: /DESIGN WITH CLARITY/i, forbidden: /972 configurations|WCAG AA verified|continuous horizontal scrolling/i },
    { slug: 'sticky-scroll-story', expected: /Selectable story chapters/i, preview: /Story chapters/i, forbidden: /sticky viewport|sub-5ms|zero client bundle penalties/i },
    { slug: 'number-count-up', expected: /Linear count-up animation/i, preview: /Example count/i, forbidden: /Canonical Resources Verified|Logarithmically eased/i },
    { slug: 'version-history', expected: /Example revision list/i, preview: /Example revision history/i, forbidden: /72 verified marketing sections|36 navigation shells|44 primitives/i },
    { slug: 'data-hero', expected: /sample metric cards/i, preview: /Sample metrics only/i, forbidden: /Fintech platforms|Trading terminals|Telemetry portals|real-time computation speeds/i },
    { slug: 'analytics-shell', expected: /illustrative metric cards/i, preview: /Illustrative sample data/i, forbidden: /MRR|DAU|churn|NPS/i },
    { slug: 'data-terminal-header', expected: /clearly labelled example market and latency values/i, preview: /SAMPLE DATA/i, forbidden: /\bLIVE\b/ },
    { slug: 'connection-lost-state', expected: /optional host-provided retry callback/i, preview: /cannot reconnect on its own/i, forbidden: /reconnecting automatically in 5s/i },
    { slug: 'feature-with-live-demo', expected: /local state toggle/i, preview: /does not connect to an external system/i, forbidden: /Live Sandbox|SYSTEM ACTIVE \[ONLINE\]|without re-render cascades/i },
    { slug: 'kiosk-display-shell', expected: /no inactivity timer is included/i, preview: /Example signage interface/i, forbidden: /Tessellate Signage Hub|Resets automatically after 60 seconds|Touch Screen to Begin/i },
    { slug: 'interactive-globe', expected: /sample location markers/i, preview: /no network or telemetry data is connected/i, forbidden: /Worldwide Telemetry Mesh|Live Orbit|real-time global telemetry hubs/i },
  ];
  const screenshotDir = 'quality/evidence/step-39/public-v75-fixes-2026-11-03/after';
  await mkdir(screenshotDir, { recursive: true });
  const viewportLabel = page.viewportSize()?.width === 390 ? '390x844' : '1440x900';

  for (const item of cases) {
    await page.goto(`/r/${item.slug}/`, { waitUntil: 'networkidle' });
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.frameLocator('main iframe').locator('body')).toContainText(item.preview, { timeout: 15_000 });
    const copy = await page.locator('main').innerText();
    expect(copy).toMatch(item.expected);
    expect(copy).not.toMatch(item.forbidden);
    await page.screenshot({ path: join(screenshotDir, `${item.slug}-${viewportLabel}.png`), fullPage: true });
  }
});

async function openAuditedResource(page: Page, slug: string): Promise<FrameLocator> {
  const response = await page.goto(`/r/${slug}/`, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `${slug} detail route should load`).toBe(true);
  const preview = page.frameLocator('iframe[title$=" live preview"]');
  await expect(preview.locator('.tess-screen')).toBeVisible({ timeout: 15_000 });
  return preview;
}

test('admin console example state and unavailable invitation are disclosed', async ({ page }) => {
  const preview = await openAuditedResource(page, 'admin-console-shell');
  await expect(preview.getByText('Example organization data')).toBeVisible();
  await expect(preview.getByText(/Member count and identity provider are not connected/i)).toBeVisible();
  await expect(preview.getByRole('button', { name: 'Invite User' })).toBeDisabled();
  await expect(preview.getByText(/Connect an invite handler to enable this action/i)).toBeVisible();
});

test('memory controls only clear local example state', async ({ page }) => {
  const preview = await openAuditedResource(page, 'ai-memory-context-panel');
  await expect(preview.getByText('Example assistant memory')).toBeVisible();
  await expect(preview.getByText(/Local preview only; not connected to an assistant/i)).toBeVisible();
  await preview.getByRole('button', { name: 'Clear examples' }).click();
  await expect(preview.getByRole('status')).toHaveText('No example memory entries.');
});

test('prompt history is example content and does not offer a dead replay action', async ({ page }) => {
  const preview = await openAuditedResource(page, 'ai-prompt-history');
  await expect(preview.getByText('Example prompt history')).toBeVisible();
  await expect(preview.getByText(/Sample records only; no prompt history or provider usage is stored/i)).toBeVisible();
  await expect(preview.getByRole('button', { name: 'Replay' }).first()).toBeDisabled();
  await expect(preview.getByText(/Connect a replay handler to enable these actions/i)).toBeVisible();
  await preview.getByRole('textbox', { name: 'Filter example prompts' }).fill('no matching example');
  await expect(preview.getByRole('status')).toHaveText('No example prompts match this filter.');
});

test('suggested actions are identified as examples and report a local preview instead of claiming execution', async ({ page }) => {
  const preview = await openAuditedResource(page, 'ai-suggested-actions');
  await expect(preview.getByText('Example suggested actions')).toBeVisible();
  const exportAction = preview.getByRole('button', { name: /Export as Vite App/ });
  await expect(exportAction).toBeEnabled();
  await exportAction.click();
  await expect(preview.getByRole('status')).toHaveText('Example action previewed locally; no product operation was run.');
});

test('API section labels route patterns as illustrative rather than current API docs', async ({ page }) => {
  const preview = await openAuditedResource(page, 'api-capability-section');
  await expect(preview.getByRole('heading', { name: 'Illustrative API examples' })).toBeVisible();
  await expect(preview.getByText(/These route patterns are examples, not API documentation/i)).toBeVisible();
});

test('audit log marks actors and events as sample data', async ({ page }) => {
  const preview = await openAuditedResource(page, 'audit-log');
  await expect(preview.getByRole('heading', { name: 'Example audit events' })).toBeVisible();
  await expect(preview.getByText(/Sample records; not live audit data/i)).toBeVisible();
});

test('command centre never reports sample systems as operational', async ({ page }) => {
  const preview = await openAuditedResource(page, 'command-centre-shell');
  await expect(preview.getByText('Example telemetry layout')).toBeVisible();
  await expect(preview.getByText('Sample status · not live')).toBeVisible();
  await expect(preview.getByText('ALL SYSTEMS OPERATIONAL')).toHaveCount(0);
});

test('cohort matrix discloses that sizes and percentages are illustrative', async ({ page }) => {
  const preview = await openAuditedResource(page, 'cohort-matrix');
  await expect(preview.getByText('Illustrative retention data — not live metrics.')).toBeVisible();
  await expect(preview.getByRole('table').getByRole('caption')).toHaveText(/Illustrative cohort retention examples/);
});
