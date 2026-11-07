import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
const targets = [
 {slug:'advanced-data-table', content:'Sample records'},
 {slug:'error-state', content:'Manifest Compilation Fault'},
 {slug:'feature-matrix', content:'Example capability matrix'},
 {slug:'three-pane-app-shell', content:'Nav Tree'},
 {slug:'pricing-three-tier', content:'Simple, Honest Pricing'},
];
async function inspect(page:Page, slug:string, content:string){
 const route=`/resources/${slug}/`;const response=await page.goto(route,{waitUntil:'domcontentloaded'});expect(response?.status(),route).toBe(200);
 const preview=page.frameLocator('iframe[title$=" live preview"]');const screen=preview.locator('.tess-screen');await expect(screen,route).toBeVisible({timeout:15000});await expect(screen,route).not.toContainText('Loading the actual resource',{timeout:15000});await expect(screen,route).toContainText(content,{timeout:15000});
 const before=await screen.innerText();
 const dark=page.getByRole('button',{name:'Switch to Dark theme'});await dark.click();await expect(preview.locator('html')).toHaveClass(/dark/);await expect(screen,route).toContainText(content,{timeout:15000});await expect(page.locator('iframe[title$=" live preview"]')).toHaveAttribute('src',/theme=dark/);
 const expressive=page.getByRole('button',{name:'Expressive',exact:true});await expressive.click();await expect(page.locator('iframe[title$=" live preview"]')).toHaveAttribute('src',/variant=expressive.*theme=dark/);await expect(preview.locator('[data-resource-variant]')).toHaveAttribute('data-resource-variant','expressive',{timeout:15000});await expect(screen,route).toContainText(content,{timeout:15000});
 const visibleText=await screen.innerText();const result=await screen.evaluate(el=>({nodeCount:el.querySelectorAll('*').length,rect:(()=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})(),html:el.innerHTML.slice(0,300)}));return{route,status:response?.status(),before,visibleText,result};
}
test('published Site renders real Gold resource content and exposes keyboard scroll regions',async({page},info)=>{
 const diagnostics={consoleErrors:[] as string[],warnings:[] as string[],pageErrors:[] as string[],failedRequests:[] as string[],httpErrors:[] as string[]};page.on('console',m=>{if(m.type()==='error')diagnostics.consoleErrors.push(m.text());if(m.type()==='warning')diagnostics.warnings.push(m.text())});page.on('pageerror',e=>diagnostics.pageErrors.push(e.message));page.on('requestfailed',r=>diagnostics.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText??''}`));page.on('response',r=>{if(r.status()>=400)diagnostics.httpErrors.push(`${r.status()} ${r.url()}`)});
 const output=path.resolve(process.cwd(),'audit/evidence/v25/gold-runtime-dark-verified',info.project.name);await mkdir(output,{recursive:true});const results=[];
 for(const item of targets){const result=await inspect(page,item.slug,item.content);const screenshot=path.join(output,`${item.slug}-expressive-dark-${page.viewportSize()?.width}.png`);await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});results.push({...result,screenshot});}
 const scrollTargets=[{slug:'error-state',selector:'[aria-label="Error code sample"]',text:'Manifest Compilation Fault'},{slug:'feature-matrix',selector:'[aria-label="Example capability matrix comparison table"]',text:'Example capability matrix'},{slug:'three-pane-app-shell',selector:'[aria-label="Workspace canvas"]',text:'Visual Canvas'}];const keyboard=[];
 for(const item of scrollTargets){await inspect(page,item.slug,item.text);const frame=page.frameLocator('iframe[title$=" live preview"]');const region=frame.locator(item.selector);await expect(region).toBeVisible();await expect(region).toHaveAttribute('tabindex','0');await region.focus();await expect(region).toBeFocused();keyboard.push({slug:item.slug,selector:item.selector,tabIndex:await region.getAttribute('tabindex'),focused:true});}
 const report={site:'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',capturedAt:new Date().toISOString(),viewport:page.viewportSize(),diagnostics,results,keyboard};await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');expect(diagnostics).toEqual({consoleErrors:[],warnings:[],pageErrors:[],failedRequests:[],httpErrors:[]});
});
