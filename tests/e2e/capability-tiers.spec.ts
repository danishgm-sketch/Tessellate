import { expect, test } from '@playwright/test';

test('Beta client tools disclose their tier and current limits on directory and detail routes', async ({
  page,
}, testInfo) => {
  await page.goto('/tools');
  await expect(page.getByRole('heading', { name: 'Ten Interface Tools.' })).toBeVisible();
  await expect(page.locator('[data-capability-tier="beta"]')).toHaveCount(12);
  await expect(page.getByText(/outputs are still being validated/i)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('tools-beta.png'), fullPage: true });

  await page.goto('/tools/motion');
  await expect(page.getByLabel('Beta capability notice')).toBeVisible();
  await expect(
    page.getByText(/does not certify or modify a saved Workbench project/i)
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});

test('creator review profile avoids false verification claims and discloses Beta status', async ({
  page,
}) => {
  await page.goto('/creators/core');
  await expect(page.getByLabel('Beta capability notice')).toBeVisible();
  await expect(page.getByText('Static example profile')).toBeVisible();
  await expect(page.getByText(/does not verify this identity/i)).toBeVisible();
  await expect(
    page.getByText(/Core System Contributor|verified canonical primitives/i)
  ).toHaveCount(0);
});

test('CLI documentation labels secondary tools and describes only the real Vite export command', async ({
  page,
}) => {
  await page.goto('/docs/cli');
  await expect(page.getByLabel('Beta capability notice')).toBeVisible();
  await expect(
    page.getByText(/Next.js and native targets are not selected by this CLI command/i)
  ).toBeVisible();
  await expect(
    page.locator('code').filter({ hasText: 'tess export project.tess.json --output ./my-app' })
  ).toBeVisible();
});

test('unavailable laptop model Lab remains opt-in and unsupported commands leave a visible safe failure', async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(isMobile, 'The desktop command bar is not shown in mobile inspection mode.');

  await page.goto('/workbench');
  await expect(page.getByTestId('command-bar')).toBeVisible();
  const labSwitch = page.getByRole('switch', { name: 'Laptop model Lab' });
  await expect(labSwitch).toBeDisabled();
  await expect(labSwitch).toHaveAttribute('aria-checked', 'false');

  await page
    .getByLabel('Tessellate command')
    .fill('Rebalance the information architecture for this screen');
  await page.getByRole('button', { name: 'Execute command' }).click();
  await expect(
    page.getByText(
      /Laptop inference is unavailable unless you explicitly enable the experimental Lab/i
    )
  ).toBeVisible();
  await expect(page.getByTestId('lab-proposal-review')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('workbench-lab-offline.png'), fullPage: true });
});

test('online laptop model output is reviewed before it can be applied', async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(isMobile, 'The desktop command bar is not shown in mobile inspection mode.');

  await page.route('http://localhost:4323/**', async (route) => {
    const requested = new URL(route.request().url());
    if (requested.pathname === '/api/inference/health') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ apiOnline: true, hostOnline: true, pendingTasks: 0 }),
      });
      return;
    }
    if (requested.pathname === '/api/inference/queue') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          ticketId: 'fixture-ticket',
          accessToken: 'fixture-token',
          tokenNumber: 7,
          position: 1,
          estimatedWaitSeconds: 0,
        }),
      });
      return;
    }
    if (requested.pathname === '/api/inference/status/fixture-ticket') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'completed',
          resultCommand: {
            action: 'adjust-dna',
            summary: 'Make the current screen more playful',
            dnaDeltas: { playfulness: 20 },
          },
        }),
      });
      return;
    }

    const upstream = new URL(requested.href);
    upstream.port = '4321';
    await route.fulfill({ response: await route.fetch({ url: upstream.href }) });
  });

  // Keep the browser on the adapter's configured local port while proxying
  // static files to Astro preview and deterministically faking only the host API.
  await page.goto('http://localhost:4323/workbench');
  const labSwitch = page.getByRole('switch', { name: 'Laptop model Lab' });
  await expect(labSwitch).toBeEnabled();
  await labSwitch.click();
  await page
    .getByLabel('Tessellate command')
    .fill('Rebalance the information architecture for this screen');
  await page.getByRole('button', { name: 'Execute command' }).click();

  const proposal = page.getByTestId('lab-proposal-review');
  await expect(proposal).toBeVisible();
  await expect(proposal).toContainText('Nothing has been applied yet.');
  await page.getByText('Inspect proposed operations').click();
  await expect(proposal.locator('pre')).toContainText('playfulness');
  await expect(page.getByLabel('Tessellate command')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Apply proposal' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('workbench-lab-review.png'), fullPage: true });
  await page.getByRole('button', { name: 'Discard' }).click();
  await expect(proposal).toHaveCount(0);
  await expect(
    page.getByRole('status').filter({ hasText: 'Laptop model proposal discarded' })
  ).toBeVisible();

  await page
    .getByLabel('Tessellate command')
    .fill('Rebalance the information architecture for this screen again');
  await page.getByRole('button', { name: 'Execute command' }).click();
  await expect(proposal).toBeVisible();

  const playfulness = page.getByRole('slider', { name: 'Playfulness' });
  await playfulness.press('ArrowRight');
  const editedValue = await playfulness.inputValue();
  await page.getByRole('button', { name: 'Apply proposal' }).click();
  await expect(proposal).toHaveCount(0);
  await expect(
    page.getByRole('status').filter({ hasText: 'project or selected screen changed' })
  ).toBeVisible();
  await expect(playfulness).toHaveValue(editedValue);
  await page.screenshot({
    path: testInfo.outputPath('workbench-lab-stale-discard.png'),
    fullPage: true,
  });

  await page
    .getByLabel('Tessellate command')
    .fill('Rebalance the information architecture for this screen once more');
  await page.getByRole('button', { name: 'Execute command' }).click();
  await expect(proposal).toBeVisible();
  await page.getByRole('button', { name: 'Apply proposal' }).click();
  await expect(proposal).toHaveCount(0);
  await expect(
    page.getByRole('status').filter({ hasText: 'applied as one undoable change' })
  ).toBeVisible();
  await expect(playfulness).toHaveValue(String(Number(editedValue) + 20));
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(playfulness).toHaveValue(editedValue);
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(playfulness).toHaveValue(String(Number(editedValue) + 20));
  await page.screenshot({ path: testInfo.outputPath('workbench-lab-redo.png'), fullPage: true });
});
