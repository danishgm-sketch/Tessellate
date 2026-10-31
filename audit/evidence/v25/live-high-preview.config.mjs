import process from 'node:process';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ testDir: path.resolve(process.cwd(), 'tests/e2e'), testMatch: ['preview-form-interactions.spec.ts', 'gold-dialog-accessibility.spec.ts'], fullyParallel: false, workers: 1, timeout: 60000, reporter: 'list', outputDir: path.resolve(process.cwd(), 'audit/evidence/v25/high-preview-test-results'), use: { baseURL: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site', trace: 'off' }, projects: [{ name: 'sites-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }] });
