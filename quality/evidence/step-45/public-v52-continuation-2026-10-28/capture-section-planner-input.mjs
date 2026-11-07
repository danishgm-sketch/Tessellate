import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
const site='https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const dir=path.resolve('quality/evidence/step-45/public-v52-continuation-2026-10-28/interactive');
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true});
const captures=[];
for(const viewport of [
 {name:'desktop-1440x900',width:1440,height:900,mobile:false,touch:false},
 {name:'mobile-390x844',width:390,height:844,mobile:true,touch:true},
]) {
 const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.mobile,hasTouch:viewport.touch,deviceScaleFactor:1,reducedMotion:'reduce'});
 const page=await context.newPage();const console=[],pageErrors=[],failedRequests=[],badResponses=[];
 page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.push({type:m.type(),text:m.text().slice(0,700)})});
 page.on('pageerror',e=>pageErrors.push(String(e)));
 page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText??'unknown'}));
 page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()})});
 const response=await page.goto(site+'/tools/section-planner/',{waitUntil:'domcontentloaded'});
 const input=page.getByRole('textbox',{name:'Custom section title'});
 await input.scrollIntoViewIfNeeded();
 const attrs=await input.evaluate(el=>({id:el.id||null,name:el.getAttribute('name'),ariaLabel:el.getAttribute('aria-label'),placeholder:el.getAttribute('placeholder'),rect:(()=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()}));
 const screenshot=path.join(dir,'section-planner-field-before-'+viewport.name+'.png');
 await page.screenshot({path:screenshot,animations:'disabled',fullPage:false});
 captures.push({viewport:viewport.name,url:page.url(),httpStatus:response?.status()??null,input:attrs,screenshot:path.relative(process.cwd(),screenshot).replaceAll('\\','/'),console,pageErrors,failedRequests,badResponses});
 await context.close();
}
await browser.close();
await writeFile(path.join(dir,'section-planner-field-before.json'),JSON.stringify({site,siteVersion:52,captures},null,2)+'\n');
console.log(JSON.stringify(captures,null,2));
