import process from 'node:process';
import path from'node:path';import{defineConfig,devices}from'@playwright/test';export default defineConfig({testDir:path.resolve(process.cwd(),'audit/evidence/v25'),testMatch:['live-mobile-scroll-v25.spec.ts'],fullyParallel:false,workers:1,timeout:120000,reporter:'list',outputDir:path.resolve(process.cwd(),'audit/evidence/v25/mobile-scroll-results'),use:{baseURL:'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',trace:'off'},projects:[{name:'mobile-chrome',use:{...devices['Pixel 7'],viewport:{width:390,height:844},isMobile:true}}]});

