/* global process,console,document */
import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.AUDIT_URL??'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const before=process.env.AUDIT_CONTENT_BEFORE==='1';
const directory=`audit/evidence/${process.env.AUDIT_PHASE??'deployed-version-5'}/demo-content`;
await mkdir(directory,{recursive:true});
const browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();
const events={exceptions:[],console:[],network:[]};const observations=[];
page.on('pageerror',e=>events.exceptions.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))events.console.push(m.text());});page.on('requestfailed',r=>events.network.push({url:r.url(),error:r.failure()?.errorText}));
try{
 for(const slug of ['customer-metrics-strip','counter-typography','performance-benchmark-section','compliance-proof','trust-badges-strip','feature-comparison','social-proof-hero','testimonial-quote','testimonial-carousel','testimonial-grid','pricing-enterprise','text-path-arc','press-mentions-strip','feature-metrics','security-proof','split-product-hero'])for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===390?844:900});const response=await page.goto(`${base}/preview/?resource=${slug}`);
  await expect(page.locator(`[data-node-id="preview-${slug}"]`)).toBeAttached();await page.waitForLoadState('networkidle');
  const text=await page.locator('body').innerText();const screenshot=`${directory}/${slug}-${width}.png`;await page.screenshot({path:screenshot});
  const entry={slug,url:page.url(),viewport:page.viewportSize(),status:response.status(),text,screenshot,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)};
  if(slug==='pricing-enterprise'){
   const button=page.getByRole('button');entry.bookingDisabled=await button.isDisabled();
   if(before){const old=page.url();await button.click();entry.urlAfterClick=page.url();entry.contentAfterClick=await page.locator('body').innerText();entry.deadControl=old===page.url()&&entry.contentAfterClick===text;}
   else {await expect(button).toBeDisabled();await expect(button).toContainText('Booking not configured');}
  }
  observations.push(entry);await writeFile(`${directory}/results.json`,JSON.stringify({observations,events,before},null,2));
  if(!before){assert.equal(entry.overflow,false,slug);assert.doesNotMatch(text,/99\.99|40,000|42,800|1,200 reviews|Elena Rostova|Samantha Reed|Marcus Vance|Certified|CERTIFIED|AA VERIFIED|24\/7 dedicated|Audited Latency|Tessellate Manifest Parse|TECHCRUNCH|WIRED|THE VERGE|100\/100|AES-256|zero bundle penalty|guaranteeing visual harmony/);}
  console.log(JSON.stringify({slug,width,status:entry.status,overflow:entry.overflow}));
 }
 if(!before){assert.deepEqual(events,{exceptions:[],console:[],network:[]});}
}finally{await browser.close();}
