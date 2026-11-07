/* global process, console, document, navigator */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(path.resolve("node_modules/.pnpm/playwright@1.63.0/node_modules/playwright"));
const origin = "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const outDir = path.resolve("quality/evidence/step-39/deployed-v30-interactions");
fs.mkdirSync(outDir,{recursive:true});
const browser = await chromium.launch({headless:true});
const results=[];
async function pageCase(name,route,viewport,fn){
 const context=await browser.newContext({viewport,reducedMotion:"reduce"});
 await context.grantPermissions(["clipboard-read","clipboard-write"],{origin});
 const page=await context.newPage();
 const runtime={console:[],uncaught:[],failed:[],badResponses:[]};
 page.on("console",m=>{if(m.type()==="error"||m.type()==="warning")runtime.console.push({type:m.type(),text:m.text().slice(0,600)});});
 page.on("pageerror",e=>runtime.uncaught.push(String(e).slice(0,600)));
 page.on("requestfailed",r=>runtime.failed.push({url:r.url(),failure:r.failure()?.errorText??"unknown"}));
 page.on("response",r=>{if(r.status()>=400)runtime.badResponses.push({url:r.url(),status:r.status()});});
 const response=await page.goto(origin+route,{waitUntil:"domcontentloaded",timeout:30000});
 await page.waitForTimeout(900);
 let result;
 try { result=await fn(page); } catch(e){ result={error:String(e)}; }
 const screenshot=path.join(outDir,`${name}-${viewport.width}x${viewport.height}.png`);
 await page.screenshot({path:screenshot,fullPage:false,animations:"disabled"}).catch(e=>{result={...result,screenshotError:String(e)};});
 results.push({id:name,route,viewport:`${viewport.width}x${viewport.height}`,httpStatus:response?.status()??null,result,runtime,screenshot:path.relative(process.cwd(),screenshot)});
 await context.close();
}
async function previewFrame(page,slug){
 await page.waitForFunction(s=>[...document.querySelectorAll("iframe")].some(f=>f.src.includes(`/preview-content/?resource=${s}`)),slug,{timeout:15000});
 const frame=page.frames().find(f=>f.url().includes(`/preview-content/?resource=${slug}`));
 if(!frame)throw new Error(`preview frame not ready for ${slug}`);
 await frame.locator("body").waitFor({timeout:10000});
 return frame;
}
try{
 const desktop={width:1440,height:900},mobile={width:390,height:844};
 await pageCase("ai-prompt-hero", "/r/ai-prompt-hero", desktop, async page=>{
  const frame=await previewFrame(page,"ai-prompt-hero");
  const field=frame.locator("textarea").first();
  const before=await field.inputValue();
  const action=frame.getByRole("button",{name:"Generate Blueprint"});
  const disabled=await action.isDisabled();
  await frame.getByRole("button",{name:"An employee onboarding workspace for a growing team"}).click();
  return {presetApplied:await field.inputValue(),presetChanged:before!==await field.inputValue(),generationActionDisabled:disabled,disclosure:(await frame.locator("body").innerText()).includes("does not generate a blueprint")};
 });
 await pageCase("inline-rewrite", "/r/inline-ai-rewrite", mobile, async page=>{
  const frame=await previewFrame(page,"inline-ai-rewrite");
  const before=await frame.locator("body").innerText();
  await frame.getByRole("button",{name:"Energetic"}).click();
  const after=await frame.locator("body").innerText();
  return {visibleOutputChanged:before!==after,disclosure:after.includes("do not send an AI request"),sampleOnly:after.includes("fixed examples")};
 });
 await pageCase("ai-chat-click-and-enter", "/r/ai-chat-panel", mobile, async page=>{
  const frame=await previewFrame(page,"ai-chat-panel");
  const input=frame.locator("input").first();
  await input.fill("Can employees see their onboarding progress?");
  await frame.getByRole("button",{name:"Send example"}).click();
  const afterClick=await frame.locator("body").innerText();
  const firstInputValue=await input.inputValue();
  await input.fill("How do I find workplace policies?");
  await input.press("Enter");
  const afterEnter=await frame.locator("body").innerText();
  return {clickMessageAdded:afterClick.includes("Can employees see their onboarding progress?"),clickInputCleared:firstInputValue==="",enterMessageAdded:afterEnter.includes("How do I find workplace policies?"),replyCount:(afterEnter.match(/Example reply:/g)||[]).length,enterInputCleared:(await input.inputValue())==="",localOnlyDisclosure:afterEnter.includes("does not connect to a model")};
 });
 await pageCase("mode-switcher-keyboard", "/r/ai-model-mode-switcher", mobile, async page=>{
  const frame=await previewFrame(page,"ai-model-mode-switcher");
  const target=frame.getByRole("button",{name:/Long context/});
  await target.focus(); await target.press("Enter");
  const states=await frame.getByRole("button").evaluateAll(bs=>bs.map(b=>({label:b.innerText.trim(),pressed:b.getAttribute("aria-pressed"),disabled:b.disabled})));
  const selected=states.find(b=>/Long context/.test(b.label));
  return {states,keyboardSelected:selected?.pressed,disclosure:(await frame.locator("body").innerText()).includes("no provider or local model is connected")};
 });
 await pageCase("citations-keyboard", "/r/ai-source-citations", mobile, async page=>{
  const frame=await previewFrame(page,"ai-source-citations");
  const first=frame.getByRole("button").first();
  const before=await first.evaluate(b=>({pressed:b.getAttribute("aria-pressed"),expanded:b.getAttribute("aria-expanded"),className:b.className,text:b.innerText}));
  await first.focus(); await first.press("Enter");
  const afterEnter=await first.evaluate(b=>({pressed:b.getAttribute("aria-pressed"),expanded:b.getAttribute("aria-expanded"),className:b.className,text:b.innerText}));
  await first.press("Space");
  const afterSpace=await first.evaluate(b=>({pressed:b.getAttribute("aria-pressed"),expanded:b.getAttribute("aria-expanded"),className:b.className,text:b.innerText}));
  return {before,afterEnter,afterSpace,disclosure:(await frame.locator("body").innerText()).includes("not retrieved or verified")};
 });
 await pageCase("cta-community-destinations", "/r/cta-community", desktop, async page=>{
  const frame=await previewFrame(page,"cta-community");
  return {links:await frame.locator("a").evaluateAll(as=>as.map(a=>({label:a.innerText.trim(),href:a.href,target:a.target}))),body:(await frame.locator("body").innerText()).slice(0,700)};
 });
 await pageCase("cta-product-preview-handoff", "/r/cta-product-preview", desktop, async page=>{
  const frame=await previewFrame(page,"cta-product-preview");
  const links=await frame.locator("a").evaluateAll(as=>as.map(a=>({label:a.innerText.trim(),href:a.href,target:a.target})));
  const link=frame.getByRole("link",{name:/START COMPOSING/i});
  const count=await link.count();
  if(count)await link.click();
  await frame.waitForURL(/\/compose/, {timeout:3000}).catch(()=>undefined);
  await page.waitForTimeout(500);
  return {links,linkCount:count,topPageAfterClick:page.url(),frameAfterClick:frame.url(),disclosure:(await frame.locator("body").innerText().catch(()=>"" )).includes("No project is connected")};
 });
 await pageCase("cta-product-preview-handoff-mobile", "/r/cta-product-preview", mobile, async page=>{
  const frame=await previewFrame(page,"cta-product-preview");
  const links=await frame.locator("a").evaluateAll(as=>as.map(a=>({label:a.innerText.trim(),href:a.href,target:a.target})));
  const link=frame.getByRole("link",{name:/START COMPOSING/i});
  const count=await link.count();
  if(count)await link.click();
  await frame.waitForURL(/\/compose/, {timeout:3000}).catch(()=>undefined);
  await page.waitForTimeout(500);
  return {links,linkCount:count,topPageAfterClick:page.url(),frameAfterClick:frame.url(),disclosure:(await frame.locator("body").innerText().catch(()=>"" )).includes("No project is connected")};
 });
 await pageCase("section-planner-five-archetypes-and-copy", "/tools/section-planner", mobile, async page=>{
  const names=["B2B SaaS Conversion Landing","Developer Documentation Hub","Fintech Analytics Cockpit","Luxury Editorial Sanctuary","Operational Triage & Admin Tool"];
  const samples=[];
  for(const name of names){await page.getByRole("button",{name}).click(); await page.waitForTimeout(80); const text=await page.locator("main").innerText(); samples.push({name,text:text.replace(/\s+/g," ").slice(0,1500),claimMarkers:(text.match(/SOC 2|ISO 27001|99\.9|verified benchmark|measured latency|connected booking/gi)||[])});}
  const moveButtons=await page.locator('button[aria-label^="Move "]').evaluateAll(buttons=>buttons.map(button=>({label:button.getAttribute("aria-label"),disabled:button.disabled})));
  const moveLabel=moveButtons.find(button=>!button.disabled&&button.label?.endsWith(" down"))?.label;
  if(!moveLabel)throw new Error("No enabled section reorder action was found.");
  const orderBefore=await page.locator('button[aria-label$=" up"]').evaluateAll(buttons=>buttons.map(button=>button.getAttribute("aria-label")?.replace(/^Move | up$/g,"")??""));
  await page.getByRole("button",{name:moveLabel,exact:true}).click();
  const orderAfter=await page.locator('button[aria-label$=" up"]').evaluateAll(buttons=>buttons.map(button=>button.getAttribute("aria-label")?.replace(/^Move | up$/g,"")??""));
  const reordered=orderBefore.join("|")!==orderAfter.join("|");
  await page.getByRole("button",{name:"Copy Section Graph JSON"}).click();
  const clipboard=await page.evaluate(()=>navigator.clipboard.readText());
  let jsonValid=false; let hasUpdatedOrder=false;
  try{const value=JSON.parse(clipboard); jsonValid=true; const s=JSON.stringify(value); hasUpdatedOrder=s.indexOf("Triage Queue Table")>=0&&s.indexOf("Triage Queue Table")<s.indexOf("Global Command Bar & Filters");}catch{ /* Invalid output remains recorded as false below. */ }
  const status=await page.locator('[role="status"]').allInnerTexts();
  return {samples,moveButtons,movedSection:moveLabel,orderBefore,orderAfter,reordered,clipboardJsonValid:jsonValid,copiedContent:clipboard.slice(0,500),hasUpdatedOrder,status};
 });
 await pageCase("dna-reset-baseline", "/tools/dna", desktop, async page=>{
  const target=page.getByRole("button",{name:/Bold Startup/});
  await target.click();
  const before={boldPressed:await target.getAttribute("aria-pressed"),heading:await page.locator("main h2").first().innerText()};
  await page.getByRole("button",{name:"Reset Baseline"}).click();
  const baseline=page.getByRole("button",{name:/Institutional Intelligence/});
  return {before,after:{boldPressed:await target.getAttribute("aria-pressed"),baselinePressed:await baseline.getAttribute("aria-pressed"),heading:await page.locator("main h2").first().innerText(),boldClass:(await target.getAttribute("class"))?.slice(0,300),baselineClass:(await baseline.getAttribute("class"))?.slice(0,300)}};
 });
 await pageCase("typography-golden-ratio-mobile", "/tools/typography", mobile, async page=>{
  await page.getByRole("button",{name:/Golden Ratio/}).click();
  await page.waitForTimeout(200);
  return {layout:await page.evaluate(()=>({clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth})),selected:await page.getByRole("button",{name:/Golden Ratio/}).getAttribute("aria-pressed"),text:(await page.locator("main").innerText()).slice(-700)};
 });
} finally {await browser.close();}
fs.writeFileSync(path.resolve("quality/evidence/step-39/deployed-v30-interactions.json"),JSON.stringify({generatedAt:new Date().toISOString(),site:origin,version:30,results},null,2)+"\n");
console.log(JSON.stringify(results.map(r=>({id:r.id,httpStatus:r.httpStatus,result:r.result,errors:r.runtime.console.length,uncaught:r.runtime.uncaught.length,failed:r.runtime.failed,badResponses:r.runtime.badResponses.length,screenshot:r.screenshot})),null,2));
