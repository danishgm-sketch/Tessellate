/* global process,console */
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.AUDIT_URL??'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const directory=`audit/evidence/${process.env.AUDIT_PHASE??'deployed-version-5'}/preview-accessibility`;await mkdir(directory,{recursive:true});
const browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();const observations=[];
try{for(const slug of ['accessibility-commitment-section','ai-approval-request'])for(const width of [1440,390]){
 await page.setViewportSize({width,height:width===390?844:900});await page.goto(`${base}/preview/?resource=${slug}`);await expect(page.locator(`[data-node-id="preview-${slug}"]`)).toBeAttached();await page.waitForLoadState('networkidle');
 const axe=(await new AxeBuilder({page}).options({preload:false}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations;
 const screenshot=`${directory}/${slug}-${width}.png`;await page.screenshot({path:screenshot});observations.push({url:page.url(),slug,viewport:page.viewportSize(),screenshot,axe});await writeFile(`${directory}/results.json`,JSON.stringify(observations,null,2));console.log(JSON.stringify({slug,width,axe:axe.length}));
 if(process.env.AUDIT_CONTENT_BEFORE!=='1')expect(axe).toEqual([]);
}}finally{await browser.close();}
