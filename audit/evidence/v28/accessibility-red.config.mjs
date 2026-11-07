import path from 'node:path';
import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:path.resolve(process.cwd(),'tests/e2e'),testMatch:['header-accessible-name.spec.ts'],
 fullyParallel:false,workers:1,timeout:60_000,reporter:'list',outputDir:path.resolve(process.cwd(),'audit/evidence/v28/accessibility-red'),
 use:{baseURL:'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',trace:'off'},
 projects:[{name:'desktop-1440',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}}],
});
