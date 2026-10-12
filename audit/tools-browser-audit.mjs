/* global process, console, document */
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const base=process.env.AUDIT_URL??'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const phase=process.env.AUDIT_PHASE??'before';
const directory=path.resolve(`audit/evidence/${phase}/tools`);await mkdir(directory,{recursive:true});
const browser=await chromium.launch();const context=await browser.newContext({acceptDownloads:true});
const page=await context.newPage();
let events;page.on('pageerror',error=>events.exceptions.push({message:error.message,stack:error.stack}));page.on('console',message=>{if(['error','warning'].includes(message.type()))events.console.push({level:message.type(),message:message.text()});});page.on('requestfailed',request=>events.network.push({url:request.url(),failure:request.failure()?.errorText}));
try{for(const tool of ['dna','backgrounds','motion','palette','typography','layout','section-planner','dataviz','accessibility','icons']){
 events={console:[],exceptions:[],network:[]};
 for(const width of [1440,390]){
 await page.setViewportSize({width,height:width===390?844:900});const response=await page.goto(`${base}/tools/${tool}/`);await page.waitForFunction(()=>!document.querySelector('astro-island[ssr][client="load"]'));
 const controls=await page.locator('main').evaluate(element=>({text:element.innerText,buttons:Array.from(element.querySelectorAll('button')).map(button=>({label:button.innerText,aria:button.getAttribute('aria-label'),disabled:button.disabled})),fields:Array.from(element.querySelectorAll('input,select,textarea')).map(field=>({tag:field.tagName,type:field.getAttribute('type'),aria:field.getAttribute('aria-label'),value:field.value,options:field.tagName==='SELECT'?Array.from(field.options).map(option=>option.text):undefined}))}));
 const axe=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()).violations;
 const screenshot=`${tool}-${width}.png`;await page.screenshot({path:path.join(directory,screenshot)});
 await writeFile(path.join(directory,`${tool}-${width}.json`),JSON.stringify({url:page.url(),viewport:`${width}x${width===390?844:900}`,status:response.status(),screenshot,controls,axe,...events},null,2));
 console.log(JSON.stringify({tool,width,status:response.status(),errors:events.exceptions.length,failedRequests:events.network.length,axe:axe.map(violation=>({id:violation.id,impact:violation.impact,count:violation.nodes.length})),buttons:controls.buttons.slice(-8).map(button=>button.label)}));
 }
}}finally{await browser.close();}
