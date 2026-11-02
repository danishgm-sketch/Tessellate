import { defineConfig, devices } from '@playwright/test';
const baseURL=process.env.TESS_SITE_URL;
if(!baseURL) throw new Error('Set TESS_SITE_URL to the deployed review Site.');
export default defineConfig({testDir:process.cwd(),testMatch:['quality/evidence/step-48/public-v72-live-audit-2026-11-02/flagship/responsive-matrix.spec.ts'],workers:1,fullyParallel:false,reporter:'list',use:{baseURL,trace:'on-first-retry'},projects:[{name:'desktop-chrome',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}}]});
