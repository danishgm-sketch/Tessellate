import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const widths=[360,390,430,768,1024,1280,1440,1536];
test('deployed Compose and Direction C Workbench remain usable across the full viewport matrix',async({page})=>{
 test.setTimeout(120000);
 const runtime={consoleErrors:[],consoleWarnings:[],uncaught:[],failedRequests:[],badResponses:[]};
 page.on('console',m=>{if(m.type()==='error')runtime.consoleErrors.push(m.text());if(m.type()==='warning')runtime.consoleWarnings.push(m.text());});
 page.on('pageerror',e=>runtime.uncaught.push(e.message));
 page.on('requestfailed',r=>runtime.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText??''}`));
 page.on('response',r=>{if(r.status()>=400)runtime.badResponses.push({status:r.status(),url:r.url()});});
 const exact='Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
 await page.goto('/compose');
 await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
 await page.locator('#description').fill(exact);
 await page.locator('#feel').fill('professional but playful');
 await page.getByRole('button',{name:'Refined',exact:true}).click();
 await page.getByRole('button',{name:'Radical',exact:true}).click();
 const report={deploymentUrl:'',projectId:'',responsive:[],runtime};
 for(const width of widths){
  await page.setViewportSize({width,height:844});
  const state=await page.evaluate(()=>({viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,headingVisible:!!document.querySelector('h1')&&document.querySelector('h1').getBoundingClientRect().width>0,submitVisible:!!document.querySelector('[data-testid="compose-submit-btn"]')&&document.querySelector('[data-testid="compose-submit-btn"]').getBoundingClientRect().width>0,catalogueReady:document.body.innerText.includes('Catalogue ready')}));
  await page.screenshot({path:join(root,`compose-${width}.png`),fullPage:true});
  report.responsive.push({surface:'compose',width,...state});
 }
 await page.getByTestId('compose-submit-btn').click();
 await expect(page.getByTestId('direction-card-03')).toBeVisible();
 report.projectId=await page.getByTestId('direction-card-03').getAttribute('data-project-id')??'';
 await page.getByTestId('open-workbench-dir-03').click();
 await page.waitForURL(/\/workbench\?project=/);
 await expect(page.getByTestId('top-toolbar')).toBeVisible();
 for(const width of widths){
  await page.setViewportSize({width,height:844});
  if(width<1024){
   await expect(page.getByTestId('mobile-workbench')).toBeVisible({timeout:15000});
   const mobileNav=page.getByRole('navigation',{name:'Mobile Workbench'});
   await expect(mobileNav).toBeVisible();
   const pagesTab=mobileNav.getByRole('button',{name:'Pages',exact:true});
   await pagesTab.click();
   await expect(pagesTab).toHaveAttribute('aria-pressed','true');
   await expect(page.getByTestId('pages-tab')).toBeVisible();
   const previewTab=mobileNav.getByRole('button',{name:'Preview',exact:true});
   await previewTab.click();
   await expect(previewTab).toHaveAttribute('aria-pressed','true');
  } else {
   await expect(page.getByTestId('top-toolbar')).toBeVisible({timeout:15000});
   await expect(page.getByTestId('workbench-canvas')).toBeVisible({timeout:15000});
  }
  await expect(page.locator('#workbench-main')).toBeVisible({timeout:15000});
  const state=await page.evaluate(()=>{const main=document.querySelector('#workbench-main');const mobile=document.querySelector('[data-testid="mobile-workbench"]');const toolbar=document.querySelector('[data-testid="top-toolbar"]');const canvas=document.querySelector('[data-testid="workbench-canvas"]');return {viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,mobileShellVisible:!!mobile&&mobile.getBoundingClientRect().width>0,topToolbarVisible:!!toolbar&&toolbar.getBoundingClientRect().width>0,canvasVisible:!!canvas&&canvas.getBoundingClientRect().width>0,mainVisible:!!main&&main.getBoundingClientRect().width>0,mainWidth:main?.getBoundingClientRect().width??0,projectContentCharacters:main?.innerText.trim().length??0,visibleActions:[...document.querySelectorAll('button')].filter(b=>/Recompose|Surprise|Preview|Export/.test(b.innerText)&&b.getBoundingClientRect().width>0).map(b=>b.innerText.trim())}});
  await page.screenshot({path:join(root,`workbench-${width}.png`),fullPage:true});
  report.responsive.push({surface:'workbench-direction-c',width,...state});
 }
 report.deploymentUrl=page.url();
 await writeFile(join(root,'responsive-matrix.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({projectId:report.projectId,responsive:report.responsive,runtime}));
 expect(report.responsive.filter(r=>r.documentWidth>r.viewportWidth+1),'horizontal overflow across core surfaces').toEqual([]);
 expect(report.responsive.filter(r=>r.surface==='compose'&&(!r.headingVisible||!r.submitVisible||!r.catalogueReady)),'Compose primary controls stay visible').toEqual([]);
 expect(report.responsive.filter(r=>r.surface==='workbench-direction-c'&&((r.width<1024&&!r.mobileShellVisible)||(r.width>=1024&&!r.topToolbarVisible)||!r.mainVisible||r.mainWidth<200||r.projectContentCharacters<100||(r.width>=1024&&!r.canvasVisible))),'Workbench shell and project content remain usable at each width').toEqual([]);
 expect(runtime.consoleErrors).toEqual([]); expect(runtime.uncaught).toEqual([]); expect(runtime.failedRequests).toEqual([]); expect(runtime.badResponses).toEqual([]);
});
