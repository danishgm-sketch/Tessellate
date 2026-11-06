import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const origin='https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const require=createRequire(import.meta.url);
const axeRequire=createRequire(require.resolve('@axe-core/playwright'));
const axeSource=await readFile(axeRequire.resolve('axe-core/axe.min.js'),'utf8');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const warnings=[]; const errors=[]; const failed=[]; const bad=[]; const csp=[];
page.on('console',m=>{if(m.type()==='warning')warnings.push({text:m.text(),location:m.location()});if(m.type()==='error')errors.push({text:m.text(),location:m.location()})});
page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText??null}));
page.on('response',r=>{if(r.status()>=400)bad.push({status:r.status(),url:r.url()}); if(r.url().includes('/preview-content/')) csp.push({url:r.url(),csp:r.headers()['content-security-policy']??null})});
try {
 await page.route('**/_astro/axe-audit.min.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:axeSource}));
 const response=await page.goto(`${origin}/preview/?resource=button&variant=quiet`,{waitUntil:'networkidle'});
 const frame=page.frames().find(f=>f.url().includes('/preview-content/'));
 if(!frame) throw new Error('preview frame not found');
 await frame.locator('.tess-screen').waitFor({state:'visible',timeout:15000});
 await frame.evaluate(()=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/_astro/axe-audit.min.js';script.onload=resolve;script.onerror=()=>reject(new Error('axe script failed to load'));document.head.append(script)}));
 const axe=await frame.evaluate(async()=>{const result=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});return result.violations.map(({id,impact,help,nodes})=>({id,impact,help,nodes:nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))}))});
 console.log(JSON.stringify({status:response?.status(),frameUrl:frame.url(),axe,errors,warnings,failed,bad,csp},null,2));
}finally{await browser.close()}
