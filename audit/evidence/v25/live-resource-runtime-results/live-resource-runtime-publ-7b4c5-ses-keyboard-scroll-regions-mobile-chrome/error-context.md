# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: live-resource-runtime.spec.ts >> published Site renders real Gold resource content and exposes keyboard scroll regions
- Location: audit\evidence\v25\live-resource-runtime.spec.ts:19:1

# Error details

```
Error: locator.evaluate: Execution context was destroyed, most likely because of a navigation
```

# Page snapshot

```yaml
- generic [ref=f8e1]:
  - generic [ref=f8e2]:
    - link "Skip to content" [ref=f8e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=f8e4]:
      - generic [ref=f8e5]:
        - link "Tessellate Mark Tessellate" [ref=f8e7] [cursor=pointer]:
          - /url: /
          - img "Tessellate Mark" [ref=f8e8]
          - generic [ref=f8e13]: Tessellate
        - generic [ref=f8e14]:
          - button "Search resources (Press Command-K)" [ref=f8e15] [cursor=pointer]
          - link "GitHub Repository" [ref=f8e19] [cursor=pointer]:
            - /url: https://github.com/danishgm-sketch/Tessellate
          - link "Start building" [ref=f8e22] [cursor=pointer]:
            - /url: /compose
          - button "Open mobile navigation" [ref=f8e23]
  - main [ref=f8e26]:
    - navigation "Resource breadcrumb" [ref=f8e27]:
      - link "Home" [ref=f8e28] [cursor=pointer]:
        - /url: /
      - generic [ref=f8e29]: /
      - link "Explore" [ref=f8e30] [cursor=pointer]:
        - /url: /explore
      - generic [ref=f8e31]: /
      - generic [ref=f8e32]: sections
      - generic [ref=f8e33]: /
      - generic [ref=f8e34]: Pricing Three Tier
    - generic [ref=f8e35]:
      - generic [ref=f8e36]:
        - heading "Pricing Three Tier" [level=1] [ref=f8e37]
        - generic [ref=f8e38]:
          - generic [ref=f8e39]: "@tess/pricing-three-tier"
          - generic [ref=f8e40]: v1.0.0
          - generic [ref=f8e41]: verified
        - paragraph [ref=f8e42]: Canonical 3-card pricing table (Free, Pro, Enterprise) with highlighted recommended tier.
        - generic [ref=f8e43]:
          - generic [ref=f8e44]: "Install:"
          - code [ref=f8e45]: tess add pricing-three-tier
          - code [ref=f8e46]: "Registry source: /r/pricing-three-tier.json"
      - list [ref=f8e47]:
        - listitem [ref=f8e48]: "#pricing-three-tier"
        - listitem [ref=f8e49]: "#pricing"
        - listitem [ref=f8e50]: "#plans"
        - listitem [ref=f8e51]: "#conversion"
    - generic [ref=f8e52]:
      - generic [ref=f8e53]:
        - generic [ref=f8e55]:
          - generic [ref=f8e56]:
            - generic [ref=f8e57]:
              - generic [ref=f8e58]: "Variant:"
              - button "Quiet" [ref=f8e59]
              - button "Expressive" [active] [ref=f8e60]
              - button "Nocturne" [ref=f8e61]
            - generic [ref=f8e62]:
              - generic [ref=f8e63]:
                - button "Desktop (1440px)" [ref=f8e64]
                - button "Tablet (768px)" [ref=f8e67]
                - button "Mobile (360px)" [ref=f8e70]
              - button "Switch to Light theme" [ref=f8e73]
              - button "Motion" [ref=f8e80]
              - button "Reset preview state" [ref=f8e84]
          - iframe [ref=f8e90]:
            - status [ref=f9e3]: Loading the actual resource…
        - generic [ref=f8e92]:
          - generic [ref=f8e93]:
            - button "Intent" [ref=f8e94]
            - button "Code" [ref=f8e98]
            - button "Variants" [ref=f8e103]
            - button "Anatomy" [ref=f8e111]
            - button "Accessibility" [ref=f8e117]
            - button "Performance" [ref=f8e122]
            - button "Dependencies" [ref=f8e126]
            - button "Versions" [ref=f8e132]
          - generic [ref=f8e138]:
            - generic [ref=f8e139]:
              - generic [ref=f8e140]:
                - heading "Summary & Purpose" [level=2] [ref=f8e141]
                - paragraph [ref=f8e142]: Canonical 3-card pricing table (Free, Pro, Enterprise) with highlighted recommended tier.
              - generic [ref=f8e143]:
                - generic [ref=f8e144]:
                  - generic [ref=f8e145]: When It Works (Ideal For)
                  - list [ref=f8e150]:
                    - listitem [ref=f8e151]:
                      - generic [ref=f8e152]: •
                      - generic [ref=f8e153]: Standard B2B SaaS pricing models
                - generic [ref=f8e154]:
                  - generic [ref=f8e155]: When It Is Inappropriate (Avoid For)
                  - list [ref=f8e161]:
                    - listitem [ref=f8e162]:
                      - generic [ref=f8e163]: •
                      - generic [ref=f8e164]: Free-only open source projects without paid tiers
              - generic [ref=f8e165]:
                - heading "Jobs To Be Done" [level=2] [ref=f8e166]
                - generic [ref=f8e167]: Provide clean comparative pricing with transparent features
              - generic [ref=f8e169]:
                - heading "Expected Content Requirements" [level=2] [ref=f8e170]
                - list [ref=f8e171]:
                  - listitem [ref=f8e172]: Clear hierarchy, responsive layout, accessible typography
              - generic [ref=f8e173]:
                - heading "Target Product Archetypes" [level=2] [ref=f8e174]
                - generic [ref=f8e175]:
                  - generic [ref=f8e176]: marketing-site (95%)
                  - generic [ref=f8e177]: b2b-saas (90%)
                  - generic [ref=f8e178]: developer-tool (85%)
            - status
      - generic [ref=f8e181]:
        - generic [ref=f8e182]:
          - link "Use in Workbench" [ref=f8e183] [cursor=pointer]:
            - /url: /workbench?resource=pricing-three-tier
          - generic [ref=f8e188]:
            - button "Copy import" [ref=f8e189]
            - button "npx install" [ref=f8e194]
        - generic [ref=f8e199]:
          - note [ref=f8e200]: "Quality assessment: Not assessed."
          - generic [ref=f8e201]:
            - generic [ref=f8e202]: Category
            - generic [ref=f8e203]: sections
          - generic [ref=f8e204]:
            - generic [ref=f8e205]: SPDX License
            - generic [ref=f8e206]: MIT
          - generic [ref=f8e207]:
            - generic [ref=f8e208]: Creator
            - generic [ref=f8e209]: Tessellate Core
          - generic [ref=f8e210]:
            - generic [ref=f8e211]: Framework & Styling
            - generic [ref=f8e212]: react + tailwind
        - generic [ref=f8e214]:
          - generic [ref=f8e215]: Design DNA Profile
          - generic [ref=f8e229]:
            - generic [ref=f8e231]:
              - generic [ref=f8e232]: Density
              - generic [ref=f8e233]: 50%
            - generic [ref=f8e237]:
              - generic [ref=f8e238]: Visual Ambition
              - generic [ref=f8e239]: 70%
            - generic [ref=f8e243]:
              - generic [ref=f8e244]: Contrast
              - generic [ref=f8e245]: 80%
            - generic [ref=f8e249]:
              - generic [ref=f8e250]: Curvature
              - generic [ref=f8e251]: 35%
            - generic [ref=f8e255]:
              - generic [ref=f8e256]: Motion
              - generic [ref=f8e257]: 30%
  - contentinfo [ref=f8e260]: Tessellate Interface Intelligence Layer — Open resource library under MIT License.
```

# Test source

```ts
  1  | import { mkdir, writeFile } from 'node:fs/promises';
  2  | import path from 'node:path';
  3  | import { expect, test, type Page } from '@playwright/test';
  4  | const targets = [
  5  |  {slug:'advanced-data-table', content:'Sample records'},
  6  |  {slug:'error-state', content:'Manifest Compilation Fault'},
  7  |  {slug:'feature-matrix', content:'Example capability matrix'},
  8  |  {slug:'three-pane-app-shell', content:'Nav Tree'},
  9  |  {slug:'pricing-three-tier', content:'Simple, Honest Pricing'},
  10 | ];
  11 | async function inspect(page:Page, slug:string, content:string){
  12 |  const route=`/resources/${slug}/`;const response=await page.goto(route,{waitUntil:'domcontentloaded'});expect(response?.status(),route).toBe(200);
  13 |  const preview=page.frameLocator('iframe[title$=" live preview"]');const screen=preview.locator('.tess-screen');await expect(screen,route).toBeVisible({timeout:15000});await expect(screen,route).not.toContainText('Loading the actual resource',{timeout:15000});await expect(screen,route).toContainText(content,{timeout:15000});
  14 |  const before=await screen.innerText();
  15 |  const dark=page.getByRole('button',{name:'Switch to Dark theme'});await dark.click();await expect(preview.locator('html')).toHaveClass(/dark/);await expect(screen,route).toContainText(content,{timeout:15000});await expect(page.locator('iframe[title$=" live preview"]')).toHaveAttribute('src',/theme=dark/);
  16 |  const expressive=page.getByRole('button',{name:'Expressive',exact:true});await expressive.click();await expect(page.locator('iframe[title$=" live preview"]')).toHaveAttribute('src',/variant=expressive.*theme=dark/);await expect(preview.locator('[data-resource-variant]')).toHaveAttribute('data-resource-variant','expressive',{timeout:15000});await expect(screen,route).toContainText(content,{timeout:15000});
> 17 |  const visibleText=await screen.innerText();const result=await screen.evaluate(el=>({nodeCount:el.querySelectorAll('*').length,rect:(()=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})(),html:el.innerHTML.slice(0,300)}));return{route,status:response?.status(),before,visibleText,result};
     |                                                                       ^ Error: locator.evaluate: Execution context was destroyed, most likely because of a navigation
  18 | }
  19 | test('published Site renders real Gold resource content and exposes keyboard scroll regions',async({page},info)=>{
  20 |  const diagnostics={consoleErrors:[] as string[],warnings:[] as string[],pageErrors:[] as string[],failedRequests:[] as string[],httpErrors:[] as string[]};page.on('console',m=>{if(m.type()==='error')diagnostics.consoleErrors.push(m.text());if(m.type()==='warning')diagnostics.warnings.push(m.text())});page.on('pageerror',e=>diagnostics.pageErrors.push(e.message));page.on('requestfailed',r=>diagnostics.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText??''}`));page.on('response',r=>{if(r.status()>=400)diagnostics.httpErrors.push(`${r.status()} ${r.url()}`)});
  21 |  const output=path.resolve(process.cwd(),'audit/evidence/v25/gold-runtime-dark-verified',info.project.name);await mkdir(output,{recursive:true});const results=[];
  22 |  for(const item of targets){const result=await inspect(page,item.slug,item.content);const screenshot=path.join(output,`${item.slug}-expressive-dark-${page.viewportSize()?.width}.png`);await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});results.push({...result,screenshot});}
  23 |  const scrollTargets=[{slug:'error-state',selector:'[aria-label="Error code sample"]',text:'Manifest Compilation Fault'},{slug:'feature-matrix',selector:'[aria-label="Example capability matrix comparison table"]',text:'Example capability matrix'},{slug:'three-pane-app-shell',selector:'[aria-label="Workspace canvas"]',text:'Visual Canvas'}];const keyboard=[];
  24 |  for(const item of scrollTargets){await inspect(page,item.slug,item.text);const frame=page.frameLocator('iframe[title$=" live preview"]');const region=frame.locator(item.selector);await expect(region).toBeVisible();await expect(region).toHaveAttribute('tabindex','0');await region.focus();await expect(region).toBeFocused();keyboard.push({slug:item.slug,selector:item.selector,tabIndex:await region.getAttribute('tabindex'),focused:true});}
  25 |  const report={site:'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',capturedAt:new Date().toISOString(),viewport:page.viewportSize(),diagnostics,results,keyboard};await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');expect(diagnostics).toEqual({consoleErrors:[],warnings:[],pageErrors:[],failedRequests:[],httpErrors:[]});
  26 | });
  27 | 
```