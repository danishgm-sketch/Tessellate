/* global window */
import { webkit } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('quality/evidence/step-45/public-v55-reaudit-2026-10-28');
const site=process.env.SITES_AUDIT_BASE_URL??'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const version=process.env.SITES_AUDIT_VERSION??'55';
const outputName=process.env.SITES_AUDIT_OUTPUT??`webkit-explore-csp-v${version}.json`;
await mkdir(path.join(root,'webkit'),{recursive:true});
const browser=await webkit.launch({headless:true});
const results=[];
for(const viewport of [{name:'desktop-1440x900',width:1440,height:900},{name:'mobile-390x844',width:390,height:844}]){
 const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
 const page=await context.newPage();
 const consoleErrors=[],consoleWarnings=[],pageErrors=[],failedRequests=[],badResponses=[];
 await page.addInitScript(()=>{window.__cspEvents=[];window.addEventListener('securitypolicyviolation',event=>window.__cspEvents.push({directive:event.violatedDirective,blockedURI:event.blockedURI,sourceFile:event.sourceFile,lineNumber:event.lineNumber,disposition:event.disposition}));});
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push({text:m.text(),location:m.location()});else if(m.type()==='warning')consoleWarnings.push(m.text());});
 page.on('pageerror',e=>pageErrors.push(e.message));
 page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText??'unknown'}));
 page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});
 let status=null,navigationError=null;
 try{
  const response=await page.goto(site+'/explore?q=onboarding',{waitUntil:'domcontentloaded',timeout:45000});status=response?.status()??null;
  await page.getByRole('heading',{name:'Explore Resource Library'}).waitFor({state:'visible',timeout:20000});
  const frame=page.locator('iframe[src*="/preview-content/"]').first();
  await frame.waitFor({state:'visible',timeout:20000});
  await page.frameLocator('iframe[src*="/preview-content/"]').first().locator('.tess-screen').waitFor({state:'visible',timeout:20000});
  await page.waitForTimeout(800);
  await page.screenshot({path:path.join(root,'webkit',`explore-onboarding-${viewport.name}-v${version}.png`),fullPage:false});
 }catch(error){navigationError=String(error);}
 const cspEvents=[];
 for(const frame of page.frames()){
  try{const found=await frame.evaluate(()=>window.__cspEvents??[]);for(const e of found)cspEvents.push({frameUrl:frame.url(),...e});}catch{ /* Detached or opaque frames do not expose this listener. */ }
 }
 results.push({viewport:viewport.name,url:page.url(),status,navigationError,cspEvents,consoleErrors,consoleWarnings,pageErrors,failedRequests,badResponses,resourceFrameCount:await page.locator('iframe[src*="/preview-content/"]').count().catch(()=>0),screensRendered:await page.locator('iframe[src*="/preview-content/"]').count().catch(()=>0),screenshot:path.relative(process.cwd(),path.join(root,'webkit',`explore-onboarding-${viewport.name}-v${version}.png`)).replaceAll('\\','/')});
 await context.close();
}
await browser.close();
const report={site,siteVersion:version,browser:'Playwright WebKit (not Safari)',capturedAt:new Date().toISOString(),route:'/explore?q=onboarding',results};
await writeFile(path.join(root,outputName),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
