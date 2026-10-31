import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const baseUrl='https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const out=path.resolve('audit/evidence/deployed-v64-2026-10-31/core-axe/no-axe-runtime.json');
const browser=await chromium.launch({headless:true});
const results=[];
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const context=await browser.newContext({viewport,isMobile:viewport.width<600,hasTouch:viewport.width<600,reducedMotion:'reduce'});
 const page=await context.newPage();
 const record={viewport,consoleErrors:[],consoleWarnings:[],uncaughtExceptions:[],failedRequests:[],httpErrors:[]};
 page.on('console',m=>{if(m.type()==='error')record.consoleErrors.push(m.text());if(m.type()==='warning')record.consoleWarnings.push(m.text());});
 page.on('pageerror',e=>record.uncaughtExceptions.push(e.message));
 page.on('requestfailed',r=>record.failedRequests.push({url:r.url(),error:r.failure()?.errorText??null}));
 page.on('response',r=>{if(r.status()>=400)record.httpErrors.push({url:r.url(),status:r.status()});});
 for(const route of ['/','/explore','/compose','/workbench','/r/ai-empty-state/']){
  const response=await page.goto(new URL(route,baseUrl).toString(),{waitUntil:'networkidle',timeout:45000});
  if(route==='/compose')await page.getByTestId('catalog-status').getByText(/Catalogue ready/i).waitFor({timeout:30000});
  if(route==='/workbench')await page.getByTestId('top-toolbar').waitFor({timeout:30000});
  record.route=route;
  record.lastHttpStatus=response?.status()??null;
 }
 results.push(record);await context.close();
}
await browser.close();await mkdir(path.dirname(out),{recursive:true});await writeFile(out,JSON.stringify({capturedAt:new Date().toISOString(),siteUrl:baseUrl,results},null,2)+'\n');
console.log(JSON.stringify(results.map(({viewport,consoleErrors,consoleWarnings,uncaughtExceptions,failedRequests,httpErrors})=>({viewport,consoleErrors,consoleWarnings,uncaughtExceptions,failedRequests,httpErrors})),null,2));
