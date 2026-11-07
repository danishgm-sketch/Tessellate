/* global console, document, location */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(path.resolve("node_modules/.pnpm/playwright@1.63.0/node_modules/playwright"));
const base="https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const slugs=["ai-prompt-hero","inline-ai-rewrite","ai-tool-execution-timeline","ai-chat-panel","ai-model-mode-switcher","ai-source-citations","ai-research-answer","cta-community","cta-product-preview","customer-metrics-strip","logo-cloud-marquee","feature-metrics","social-proof-hero","testimonial-grid"];
const browser=await chromium.launch({headless:true});
const out=[];
try { for(const slug of slugs){
 const context=await browser.newContext({viewport:{width:1440,height:900}}); const page=await context.newPage(); const consoleErrors=[],failed=[];
 page.on("console",m=>{if(m.type()==="error")consoleErrors.push(m.text().slice(0,500));}); page.on("pageerror",e=>consoleErrors.push(String(e).slice(0,500))); page.on("requestfailed",r=>failed.push({url:r.url(),error:r.failure()?.errorText??"unknown"}));
 const res=await page.goto(`${base}/r/${slug}`,{waitUntil:"domcontentloaded",timeout:30000}); await page.waitForTimeout(900);
 const frames=page.frames().filter(f=>f.url().includes("/preview-content/"));
 const frameData=[];
 for(const frame of frames){ try { frameData.push(await frame.evaluate(()=>({url:location.href,title:document.title,text:(document.body?.innerText??"").slice(0,4500),controls:[...document.querySelectorAll("button,input,textarea,select,[role=button],[role=radio],[role=option]")].map(e=>({tag:e.tagName,type:e.getAttribute("type"),role:e.getAttribute("role"),label:(e.innerText||e.getAttribute("aria-label")||e.getAttribute("placeholder")||e.getAttribute("title")||"").trim().slice(0,180),value:e.value??null,disabled:e.disabled??false,pressed:e.getAttribute("aria-pressed")})).slice(0,60),layout:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,clientWidth:document.documentElement.clientWidth}}))); } catch(e){frameData.push({error:String(e)});} }
 out.push({slug,httpStatus:res?.status()??null,frames:frameData,console:consoleErrors,failed}); await context.close();
 }} finally {await browser.close();}
fs.writeFileSync(path.resolve("quality/evidence/step-39/deployed-v30-preview-frames.json"),JSON.stringify({generatedAt:new Date().toISOString(),siteVersion:30,results:out},null,2)+"\n");
console.log(JSON.stringify(out.map(x=>({slug:x.slug,httpStatus:x.httpStatus,frame:x.frames.map(f=>({url:f.url,bodyText:f.text?.slice(0,700),controls:f.controls?.map(c=>`${c.tag}:${c.label}${c.disabled?"[disabled]":""}`).slice(0,20),layout:f.layout,error:f.error})),consoleErrors:x.console.length,failed:x.failed.length})),null,2));
