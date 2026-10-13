/* global process, console, document */
import {chromium,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base=process.env.AUDIT_URL??'http://127.0.0.1:4323';
const phase=process.env.AUDIT_PHASE??'local-final';
const directory=`audit/evidence/${phase}/resources`;await mkdir(directory,{recursive:true});
const catalogue=JSON.parse(await readFile('apps/site/public/data/catalog.json','utf8'));
const resources=Array.isArray(catalogue)?catalogue:catalogue.resources;
const browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();
let current;page.on('pageerror',error=>current.exceptions.push(error.message));page.on('console',message=>{if(['warning','error'].includes(message.type()))current.console.push({level:message.type(),message:message.text()});});page.on('requestfailed',request=>current.network.push({url:request.url(),failure:request.failure()?.errorText}));
const observations=[];
try{for(const resource of resources){for(const width of [1440,390]){current={slug:resource.slug,viewport:`${width}x${width===390?844:900}`,exceptions:[],console:[],network:[]};await page.setViewportSize({width,height:width===390?844:900});const response=await page.goto(`${base}/preview/?resource=${resource.slug}`);current.url=page.url();current.status=response.status();try{await expect(page.locator(`[data-node-id="preview-${resource.slug}"]`)).toBeAttached({timeout:10000});}catch(error){current.failure=String(error);}current.dom=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,text:document.body.innerText.slice(0,1200)}));current.screenshot=`${directory}/${resource.slug}-${width}.png`;await page.screenshot({path:current.screenshot});observations.push(current);await writeFile(`${directory}/results.json`,JSON.stringify(observations,null,2));console.log(JSON.stringify({slug:resource.slug,width,status:current.status,errors:current.exceptions,failedRequests:current.network.length,failure:current.failure,overflow:current.dom.scrollWidth>width}));}}}finally{await browser.close();}
