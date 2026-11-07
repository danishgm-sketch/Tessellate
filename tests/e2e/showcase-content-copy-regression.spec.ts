import { expect, test } from '@playwright/test';

test('employee showcase gives the conversion CTA distinct copy from its hero', async ({ page }) => {
  await page.goto('/showcase/showcase-playful-hr/');

  await expect(
    page.getByRole('heading', { name: 'A better workday starts with people.', exact: true })
  ).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      name: 'Make the next step easier for every colleague.',
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByText('Help colleagues find their team, support and policies in one clear place.', {
      exact: true,
    })
  ).toBeVisible();
});

test('homepage employee experience example uses the SaaS taxonomy', async ({ page }) => {
  await page.goto('/');

  const example = page.locator('pre[aria-labelledby="agent-handoff-json-specification-label"]');
  await expect(example).toContainText('"name": "Employee experience"');
  await expect(example).toContainText('"tag": "saas"');
  await expect(example).not.toContainText('"tag": "recruitment"');
});
