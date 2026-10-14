import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * Phase 26 gate (D-037): real email + password accounts against the API and local D1.
 * Transactional email is read from the API's development outbox.
 */
const API = 'http://127.0.0.1:8787';
const PASSWORD = 'correct horse battery staple';
const run = Date.now().toString(36);

async function latestLink(request: APIRequestContext, to: string, subject: RegExp): Promise<string> {
  let link: string | undefined;
  await expect
    .poll(async () => {
      const { emails } = (await (await request.get(`${API}/api/dev/outbox`)).json()) as { emails: Array<{ to: string; subject: string; text: string }> };
      const mail = [...emails].reverse().find((m) => m.to === to && subject.test(m.subject));
      link = mail ? /(https?:\/\/[^\s]+)/.exec(mail.text)?.[1] : undefined;
      return Boolean(link);
    }, { timeout: 10000 })
    .toBe(true);
  return link!;
}

async function signUp(page: Page, request: APIRequestContext, email: string, name: string) {
  await page.goto('/sign-up');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByTestId('signup-check-email')).toBeVisible();
  await page.goto(await latestLink(request, email, /Confirm your email/));
  await page.waitForURL(/\/account/);
  await expect(page.getByText('Your email is confirmed')).toBeVisible();
}

async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.waitForURL((url) => url.pathname === '/');
}

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

test.describe('Accounts and administration', () => {
  test.skip(({ isMobile }) => isMobile, 'Account journeys are covered on desktop; forms are responsive by layout');

  test('sign-up, email confirmation, sign-out/in, and password reset', async ({ page, request }) => {
    test.setTimeout(90000);
    const email = `ada-${run}@clinic.test`;
    await signUp(page, request, email, 'Ada');

    await signOut(page);
    await signIn(page, email);
    await page.waitForURL(/\/workbench/);

    // Wrong password gives a clear, non-revealing message.
    await page.context().clearCookies();
    await signIn(page, email, 'not the right password');
    await expect(page.getByText('That email and password do not match an account.')).toBeVisible();

    // Forgot password → emailed link → new password works, old one does not.
    await page.goto('/forgot-password');
    await page.getByLabel('Email').fill(email);
    await page.getByRole('button', { name: 'Email me a reset link' }).click();
    await expect(page.getByText(/we have emailed a link/)).toBeVisible();
    await page.goto(await latestLink(request, email, /Reset your Tessellate password/));
    await page.waitForURL(/\/reset-password\?token=/);
    await page.getByLabel('New password', { exact: true }).fill('a completely new passphrase');
    await page.getByLabel('Confirm new password').fill('a completely new passphrase');
    await page.getByRole('button', { name: 'Set new password' }).click();
    await expect(page.getByText(/password has been changed/)).toBeVisible();

    await signIn(page, email, PASSWORD);
    await expect(page.getByText('That email and password do not match an account.')).toBeVisible();
    await signIn(page, email, 'a completely new passphrase');
    await page.waitForURL(/\/workbench/);
  });

  test('admin suspends a member, who can no longer sign in; non-admins cannot open admin', async ({ page, request, browser }) => {
    test.setTimeout(120000);
    const memberEmail = `member-${run}@clinic.test`;
    const memberCtx = await browser.newContext();
    const member = await memberCtx.newPage();
    await signUp(member, request, memberEmail, 'Member');

    await member.goto('/admin');
    await expect(member.getByText('This area is for Tessellate administrators.')).toBeVisible();

    await signUp(page, request, 'owner@tessellate.test', 'Owner');
    await page.goto('/admin');
    await page.getByLabel('Search users by email').fill(memberEmail);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const row = page.getByRole('row', { name: new RegExp(memberEmail) });
    page.once('dialog', (d) => void d.accept('Testing suspension'));
    await row.getByRole('button', { name: 'Suspend' }).click();
    await expect(page.getByText(`${memberEmail} suspended.`)).toBeVisible();

    // The member's existing session stops working immediately.
    await member.goto('/account');
    await member.waitForURL(/\/sign-in/);
    await signIn(member, memberEmail);
    await expect(member.getByText(/suspended/i)).toBeVisible();

    await page.getByRole('tab', { name: 'Audit log' }).click();
    await expect(page.getByRole('cell', { name: 'user.ban' })).toBeVisible();
    await memberCtx.close();
  });

  test('account deletion requires email confirmation', async ({ page, request }) => {
    test.setTimeout(90000);
    const email = `cara-${run}@clinic.test`;
    await signUp(page, request, email, 'Cara');
    page.once('dialog', (d) => void d.accept());
    await page.getByRole('button', { name: 'Delete my account' }).click();
    await expect(page.getByText('Check your email to confirm deleting your account.')).toBeVisible();
    await page.goto(await latestLink(request, email, /deleting your Tessellate account/));
    await page.context().clearCookies();
    await signIn(page, email);
    await expect(page.getByText('That email and password do not match an account.')).toBeVisible();
  });
});
