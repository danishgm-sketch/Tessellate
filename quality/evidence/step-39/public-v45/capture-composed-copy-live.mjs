/* global document */
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
const origin='https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const dir=path.resolve('quality/evidence/step-39/public-v45/interaction-readiness/generated-compose-before-fix');
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
const records=[];
for(const viewport of [{name:'desktop-1440x900',width:1440,height:900},{name:'mobile-390x844',width:390,height:844}]){
 const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
 const page=await context.newPage();
 const record={viewport:viewport.name,console:[],exceptions:[],failedRequests:[],httpErrors:[]};
 page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')record.console.push({type:m.type(),text:m.text().slice(0,500)});});
 page.on('pageerror',e=>record.exceptions.push(String(e).slice(0,500)));
 page.on('requestfailed',r=>record.failedRequests.push({url:r.url(),failure:r.failure()?.errorText}));
 page.on('response',r=>{if(r.status()>=400)record.httpErrors.push({url:r.url(),status:r.status()});});
 const response=await page.goto(`${origin}/compose`,{waitUntil:'domcontentloaded',timeout:30000});
 record.httpStatus=response?.status()??null;
 await page.getByText('Catalogue ready',{exact:true}).waitFor({state:'visible',timeout:45000});
 await page.getByRole('textbox',{name:'Product Description & Objectives'}).fill('Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.');
 await page.getByRole('button',{name:'Compose Interface System'}).click();
 await page.getByRole('heading',{name:'Inferred Product Architecture'}).waitFor({state:'visible',timeout:45000});
 record.url=page.url();
 record.visibleText=await page.locator('main').innerText();
 record.geometry=await page.evaluate(()=>({viewportWidth:globalThis.innerWidth,documentWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>globalThis.innerWidth}));
 record.screenshot=`generated-compose-before-fix/${viewport.name}.png`;
 await page.screenshot({path:path.join(dir,`${viewport.name}.png`),fullPage:true,animations:'disabled'});
 records.push(record);
 await context.close();
}
await browser.close();
const report={deployment:origin,version:45,workflow:'Compose exact employee-experience brief through the visible UI',capturedAt:new Date().toISOString(),records};
await fs.writeFile(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');
process.stdout.write(JSON.stringify(records.map(r=>({viewport:r.viewport,status:r.httpStatus,overflow:r.geometry?.overflow,consoleErrors:r.console.filter(x=>x.type==='error').length,consoleWarnings:r.console.filter(x=>x.type==='warning').length,exceptions:r.exceptions.length,failedRequests:r.failedRequests.length,httpErrors:r.httpErrors.length,screenshot:r.screenshot,visibleCopyExcerpt:r.visibleText.split('\n').filter(x=>/archetype|ProductModel|ScreenGraph|screen class|route slug|User Sophistication|Information Complexity|trust requirement|deterministic|telemetry|trading/i.test(x)).slice(0,20)})),null,2)+'\n');
