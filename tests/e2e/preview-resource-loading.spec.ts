import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Button slug and canonical ID load the real keyboard-operable preview', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  page.on('requestfailed', (request) => failures.push(`${request.method()} ${request.url()}`));

  for (const resourceId of ['button', 'res_primitive_button_01']) {
    await page.goto(`/?resource=${resourceId}`);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Button preview' })).toBeAttached();
    const button = page.getByRole('button', { name: 'Click me' });
    await expect(button).toBeVisible();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toHaveText('Example action activated.');
  }
  expect(failures).toEqual([]);
});

const SHELL_RESOURCES = [
  'command-centre-shell',
  'documentation-shell',
  'kiosk-display-shell',
  'responsive-app-shell',
  'settings-shell',
] as const;

test('shell previews expose exactly one top-level named main landmark and pass landmark/label checks', async ({
  page,
}) => {
  for (const slug of SHELL_RESOURCES) {
    const failures: string[] = [];
    const onError = (error: Error) => failures.push(error.message);
    const onConsole = (message: { type: () => string; text: () => string }) => {
      if (message.type() === 'error') failures.push(message.text());
    };
    const onFailed = (request: { method: () => string; url: () => string }) =>
      failures.push(`${request.method()} ${request.url()}`);
    page.on('pageerror', onError);
    page.on('console', onConsole);
    page.on('requestfailed', onFailed);

    await page.goto(`/?resource=${slug}`);
    await expect(page.locator('.tess-screen')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.locator('main main, main [role="main"], [role="main"] main, [role="main"] [role="main"]')
    ).toHaveCount(0);

    const accessibleName = await page.getByRole('main').evaluate((el) => {
      const label = el.getAttribute('aria-label')?.trim();
      const labelledBy = el.getAttribute('aria-labelledby')?.trim();
      return label || labelledBy || '';
    });
    expect(accessibleName.length).toBeGreaterThan(0);
    expect(failures).toEqual([]);

    page.off('pageerror', onError);
    page.off('console', onConsole);
    page.off('requestfailed', onFailed);

    const axe = await new AxeBuilder({ page })
      .withRules([
        'landmark-one-main',
        'landmark-no-duplicate-main',
        'landmark-main-is-top-level',
        'landmark-unique',
        'label',
        'button-name',
      ])
      .analyze();
    expect(axe.violations, `${slug} failed Axe rules`).toEqual([]);
  }
});

test('interactive Step 39 resources expose accessible names, labels, and honest local state updates', async ({
  page,
}) => {
  const interactiveChecks: Array<{
    slug: string;
    verify: () => Promise<void>;
  }> = [
    {
      slug: 'organization-settings',
      verify: async () => {
        await expect(page.getByLabel('Organization Name')).toBeVisible();
        await expect(page.getByLabel('Custom Domain')).toBeVisible();
        await page.getByRole('button', { name: 'Update Organization' }).click();
        await expect(page.getByRole('status')).toContainText('Preview only:');
      },
    },
    {
      slug: 'profile-settings',
      verify: async () => {
        await expect(page.getByLabel('Display Name')).toBeVisible();
        await expect(page.getByLabel('Email Address')).toBeVisible();
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByRole('status')).toContainText('Preview only:');
      },
    },
    {
      slug: 'app-sidebar-compact',
      verify: async () => {
        const layers = page.getByRole('button', { name: 'Layers' });
        await expect(layers).toBeVisible();
        await layers.click();
        await expect(layers).toHaveAttribute('aria-current', 'page');
      },
    },
    {
      slug: 'search-first-header',
      verify: async () => {
        await expect(page.getByLabel('Search resources')).toBeVisible();
        await page.getByRole('button', { name: 'Toggle example notifications' }).click();
        await expect(page.getByRole('status')).toContainText('Preview only:');
      },
    },
    {
      slug: 'tab-workspace-nav',
      verify: async () => {
        const tokensTab = page.getByRole('button', { name: 'tokens.css', exact: true });
        await tokensTab.click();
        await expect(tokensTab).toHaveAttribute('aria-current', 'page');
        await page.getByRole('button', { name: 'Close tokens.css' }).click();
        await expect(tokensTab).toHaveCount(0);
      },
    },
    {
      slug: 'workspace-switcher',
      verify: async () => {
        await page.getByRole('button', { name: /Example Workspace/i }).click();
        await page.getByRole('option', { name: 'Starter Lab' }).click();
        await expect(page.getByRole('button', { name: /Starter Lab/i })).toBeVisible();
      },
    },
    {
      slug: 'approval-queue',
      verify: async () => {
        await page.getByRole('button', { name: 'Approve' }).click();
        await expect(page.getByRole('status')).toContainText('approved locally');
      },
    },
    {
      slug: 'floating-ai-assistant',
      verify: async () => {
        await page.getByRole('button', { name: 'Explain Design DNA' }).click();
        await expect(page.getByRole('status')).toContainText('no AI provider connected');
        await page.getByRole('button', { name: 'Close assistant panel' }).click();
        await expect(page.getByRole('button', { name: 'Explain Design DNA' })).toHaveCount(0);
      },
    },
  ];

  for (const item of interactiveChecks) {
    await page.goto(`/?resource=${item.slug}`);
    await expect(page.locator('.tess-screen')).toBeVisible({ timeout: 15_000 });
    await item.verify();
    const axe = await new AxeBuilder({ page })
      .withRules(['label', 'button-name'])
      .analyze();
    expect(axe.violations, `${item.slug} failed label/button-name Axe rules`).toEqual([]);
  }
});

test('navigation selection props remain reactive when updated by a host after mount', async ({
  page,
}) => {
  await page.route('**/__test-controlled-host__', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: '<!doctype html><html lang="en"><body></body></html>',
    })
  );
  await page.goto('/__test-controlled-host__');

  const cases = [
    {
      slug: 'app-sidebar-compact',
      firstProps: { activeId: 'dna' },
      firstCheck: async (frame: ReturnType<typeof page.frameLocator>) => {
        await expect(frame.getByRole('button', { name: 'Design DNA' })).toHaveAttribute(
          'aria-current',
          'page'
        );
        await expect(frame.getByRole('button', { name: 'Home' })).not.toHaveAttribute(
          'aria-current',
          'page'
        );
      },
      secondProps: { activeId: 'export' },
      secondCheck: async (frame: ReturnType<typeof page.frameLocator>) => {
        await expect(frame.getByRole('button', { name: 'Export' })).toHaveAttribute(
          'aria-current',
          'page'
        );
        await expect(frame.getByRole('button', { name: 'Design DNA' })).not.toHaveAttribute(
          'aria-current',
          'page'
        );
      },
    },
    {
      slug: 'tab-workspace-nav',
      firstProps: { activeId: '2' },
      firstCheck: async (frame: ReturnType<typeof page.frameLocator>) => {
        await expect(frame.getByRole('button', { name: 'tokens.css', exact: true })).toHaveAttribute(
          'aria-current',
          'page'
        );
      },
      secondProps: { activeId: '3' },
      secondCheck: async (frame: ReturnType<typeof page.frameLocator>) => {
        await expect(frame.getByRole('button', { name: 'schema.json', exact: true })).toHaveAttribute(
          'aria-current',
          'page'
        );
        await expect(
          frame.getByRole('button', { name: 'tokens.css', exact: true })
        ).not.toHaveAttribute('aria-current', 'page');
      },
    },
    {
      slug: 'project-switcher',
      firstProps: { currentProject: 'Design System' },
      firstCheck: async (frame: ReturnType<typeof page.frameLocator>) => {
        await expect(frame.getByRole('button', { name: /Design System/i })).toBeVisible();
      },
      secondProps: { currentProject: 'Documentation Site' },
      secondCheck: async (frame: ReturnType<typeof page.frameLocator>) => {
        await expect(frame.getByRole('button', { name: /Documentation Site/i })).toBeVisible();
      },
    },
    {
      slug: 'workspace-switcher',
      firstProps: { currentWorkspace: 'Starter Lab' },
      firstCheck: async (frame: ReturnType<typeof page.frameLocator>) => {
        await expect(frame.getByRole('button', { name: /Starter Lab/i })).toBeVisible();
      },
      secondProps: { currentWorkspace: 'Example Workspace' },
      secondCheck: async (frame: ReturnType<typeof page.frameLocator>) => {
        await expect(frame.getByRole('button', { name: /Example Workspace/i })).toBeVisible();
      },
    },
  ];

  for (const item of cases) {
    await page.evaluate((slug) => {
      document.body.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.id = 'controlled-host-frame';
      iframe.src = `/?resource=${slug}`;
      iframe.style.width = '1024px';
      iframe.style.height = '400px';
      document.body.appendChild(iframe);
    }, item.slug);

    const frame = page.frameLocator('#controlled-host-frame');
    await expect(frame.locator('.tess-screen')).toBeVisible({ timeout: 15_000 });

    await page.evaluate((props) => {
      const iframe = document.getElementById('controlled-host-frame') as HTMLIFrameElement | null;
      iframe?.contentWindow?.postMessage(
        { type: 'TESSELLATE_PREVIEW_UPDATE', props },
        window.location.origin
      );
    }, item.firstProps);
    await item.firstCheck(frame);

    await page.evaluate((props) => {
      const iframe = document.getElementById('controlled-host-frame') as HTMLIFrameElement | null;
      iframe?.contentWindow?.postMessage(
        { type: 'TESSELLATE_PREVIEW_UPDATE', props },
        window.location.origin
      );
    }, item.secondProps);
    await item.secondCheck(frame);
  }
});
