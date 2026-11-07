import { chromium, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
const { setTimeout } = globalThis;
const base = process.env.TESSELLATE_TEST_SITE ?? 'http://127.0.0.1:4323';
if (!base.startsWith('http://127.0.0.1:')) throw new Error('Outage tests require the local Site adapter');
const directory = 'apps/laptop-backend/evidence';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const checks = [];
let paused = false;
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(`${base}/workbench`);
    expect(response.status()).toBe(200);
    if (viewport.width < 768) await page.getByRole('button', { name: 'Command', exact: true }).click();
    await expect(page.getByTestId('laptop-host-status')).toHaveText('Host online', { timeout: 20000 });
    const command = page.getByRole('textbox', { name: 'Tessellate command', exact: true });
    await command.fill('Improve visual hierarchy and keep existing structure coherent');
    await command.press('Enter');
    await expect(page.getByTestId('command-bar')).toContainText('[Laptop Model]', { timeout: 20000 });
    await page.screenshot({ path: `${directory}/workbench-online-${viewport.width}.png`, fullPage: true });
    checks.push({ viewport, check: 'visible-command-completes-via-laptop', result: 'PASS' });

    execFileSync('docker', ['pause', 'tessellate-laptop-host-1'], { stdio: 'ignore' }); paused = true;
    await new Promise(resolve => setTimeout(resolve, 16000));
    await expect(page.getByTestId('laptop-host-status')).toHaveText('Host offline', { timeout: 15000 });
    await command.fill('Explain the employee sentiment report for last Tuesday');
    await command.press('Enter');
    await expect(page.getByTestId('command-bar')).toContainText('Laptop inference is unavailable', { timeout: 5000 });
    await page.screenshot({ path: `${directory}/workbench-offline-${viewport.width}.png`, fullPage: true });
    expect(errors).toEqual([]);
    checks.push({ viewport, check: 'visible-offline-state-and-error', result: 'PASS', uncaughtErrors: errors });
    execFileSync('docker', ['unpause', 'tessellate-laptop-host-1'], { stdio: 'ignore' }); paused = false;
    await expect(page.getByTestId('laptop-host-status')).toHaveText('Host online', { timeout: 20000 });
    await page.close();
  }
} finally {
  if (paused) execFileSync('docker', ['unpause', 'tessellate-laptop-host-1'], { stdio: 'ignore' });
  await browser.close();
}
await writeFile(`${directory}/local-site-runtime.json`, JSON.stringify({ recordedAt: new Date().toISOString(), base, checks }, null, 2));
process.stdout.write(JSON.stringify({ result: 'PASS', checks: checks.length }) + '\n');
