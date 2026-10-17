import { expect, test } from '@playwright/test';

test('the public Site serves its declared Tessellate favicon', async ({ request }) => {
  const response = await request.get('/favicon.svg');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/svg+xml');
  expect(await response.text()).toContain('<svg');
});
