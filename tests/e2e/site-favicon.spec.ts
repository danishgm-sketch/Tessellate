import { expect, test } from '@playwright/test';

test('the public Site serves its declared Tessellate favicon', async ({ request }) => {
  const response = await request.get('/favicon.svg');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
  expect(await response.text()).toContain('<svg');
});

test('the public Site serves the browser-requested ICO fallback without a failed request', async ({ request }) => {
  const response = await request.get('/favicon.ico');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/image\/(x-icon|vnd\.microsoft\.icon)/);
  const bytes = Buffer.from(await response.body());
  expect([...bytes.subarray(0, 6)]).toEqual([0, 0, 1, 0, 1, 0]);
});
