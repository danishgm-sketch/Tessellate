# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: live-resource-runtime.spec.ts >> published Site renders real Gold resource content and exposes keyboard scroll regions
- Location: audit\evidence\v25\live-resource-runtime.spec.ts:19:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

  Object {
    "consoleErrors": Array [],
-   "failedRequests": Array [],
+   "failedRequests": Array [
+     "GET https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/preview-content/?resource=three-pane-app-shell&variant=quiet&theme=dark&device=desktop&reducedMotion=false net::ERR_ABORTED",
+   ],
    "httpErrors": Array [],
    "pageErrors": Array [],
    "warnings": Array [],
  }
```

# Page snapshot

```yaml
- generic [ref=f14e1]:
  - generic [ref=f14e2]:
    - link "Skip to content" [ref=f14e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=f14e4]:
      - generic [ref=f14e5]:
        - generic [ref=f14e6]:
          - link "Tessellate Mark Tessellate" [ref=f14e7] [cursor=pointer]:
            - /url: /
            - img "Tessellate Mark" [ref=f14e8]
            - generic [ref=f14e13]: Tessellate
          - navigation "Primary" [ref=f14e14]:
            - link "Explore" [ref=f14e15] [cursor=pointer]:
              - /url: /explore
            - link "Compose" [ref=f14e16] [cursor=pointer]:
              - /url: /compose
            - link "Workbench" [ref=f14e17] [cursor=pointer]:
              - /url: /workbench
            - link "Tools" [ref=f14e18] [cursor=pointer]:
              - /url: /tools
            - link "Agents" [ref=f14e19] [cursor=pointer]:
              - /url: /agents
            - link "Creators" [ref=f14e20] [cursor=pointer]:
              - /url: /creators
            - link "Docs" [ref=f14e21] [cursor=pointer]:
              - /url: /docs
        - generic [ref=f14e22]:
          - button "Search resources (Press Command-K)" [ref=f14e23] [cursor=pointer]:
            - generic [ref=f14e27]: Search...
            - generic [ref=f14e28]: ⌘K
          - link "GitHub Repository" [ref=f14e29] [cursor=pointer]:
            - /url: https://github.com/danishgm-sketch/Tessellate
          - button "Local projects" [ref=f14e32] [cursor=pointer]
          - link "Start building" [ref=f14e33] [cursor=pointer]:
            - /url: /compose
  - main [ref=f14e34]:
    - navigation "Resource breadcrumb" [ref=f14e35]:
      - link "Home" [ref=f14e36] [cursor=pointer]:
        - /url: /
      - generic [ref=f14e37]: /
      - link "Explore" [ref=f14e38] [cursor=pointer]:
        - /url: /explore
      - generic [ref=f14e39]: /
      - generic [ref=f14e40]: shells
      - generic [ref=f14e41]: /
      - generic [ref=f14e42]: Three-Pane App Shell
    - generic [ref=f14e43]:
      - generic [ref=f14e44]:
        - heading "Three-Pane App Shell" [level=1] [ref=f14e45]
        - generic [ref=f14e46]:
          - generic [ref=f14e47]: "@tess/three-pane-app-shell"
          - generic [ref=f14e48]: v1.0.0
          - generic [ref=f14e49]: verified
        - paragraph [ref=f14e50]: Pro desktop shell with navigation sidebar, primary workspace canvas, and right property inspector.
        - generic [ref=f14e51]:
          - generic [ref=f14e52]: "Install:"
          - code [ref=f14e53]: tess add three-pane-app-shell
          - code [ref=f14e54]: "Registry source: /r/three-pane-app-shell.json"
      - list [ref=f14e55]:
        - listitem [ref=f14e56]: "#three-pane-app-shell"
        - listitem [ref=f14e57]: "#three-pane"
        - listitem [ref=f14e58]: "#workbench"
        - listitem [ref=f14e59]: "#layout"
    - generic [ref=f14e60]:
      - generic [ref=f14e61]:
        - generic [ref=f14e63]:
          - generic [ref=f14e64]:
            - generic [ref=f14e65]:
              - generic [ref=f14e66]: "Variant:"
              - button "Quiet" [ref=f14e67]
              - button "Expressive" [ref=f14e68]
              - button "Nocturne" [ref=f14e69]
            - generic [ref=f14e70]:
              - generic [ref=f14e71]:
                - button "Desktop (1440px)" [ref=f14e72]
                - button "Tablet (768px)" [ref=f14e75]
                - button "Mobile (360px)" [ref=f14e78]
              - button "Switch to Light theme" [ref=f14e81]
              - button "Motion" [ref=f14e88]
              - button "Reset preview state" [ref=f14e92]
          - iframe [active] [ref=f14e98]:
            - generic [ref=f15e3]:
              - heading "Three-Pane App Shell preview" [level=1] [ref=f15e4]
              - generic [ref=f15e8]:
                - generic [ref=f15e9]: Nav Tree
                - region "Workspace canvas" [active] [ref=f15e11]:
                  - generic [ref=f15e12]: Visual Canvas
                - generic [ref=f15e13]: Inspector
        - generic [ref=f14e100]:
          - generic [ref=f14e101]:
            - button "Intent" [ref=f14e102]
            - button "Code" [ref=f14e106]
            - button "Variants" [ref=f14e111]
            - button "Anatomy" [ref=f14e119]
            - button "Accessibility" [ref=f14e125]
            - button "Performance" [ref=f14e130]
            - button "Dependencies" [ref=f14e134]
            - button "Versions" [ref=f14e140]
          - generic [ref=f14e146]:
            - generic [ref=f14e147]:
              - generic [ref=f14e148]:
                - heading "Summary & Purpose" [level=2] [ref=f14e149]
                - paragraph [ref=f14e150]: Pro desktop shell with navigation sidebar, primary workspace canvas, and right property inspector.
              - generic [ref=f14e151]:
                - generic [ref=f14e152]:
                  - generic [ref=f14e153]: When It Works (Ideal For)
                  - list [ref=f14e158]:
                    - listitem [ref=f14e159]:
                      - generic [ref=f14e160]: •
                      - generic [ref=f14e161]: High-density creative editors and productivity tools
                - generic [ref=f14e162]:
                  - generic [ref=f14e163]: When It Is Inappropriate (Avoid For)
                  - list [ref=f14e169]:
                    - listitem [ref=f14e170]:
                      - generic [ref=f14e171]: •
                      - generic [ref=f14e172]: Mobile phones
              - generic [ref=f14e173]:
                - heading "Jobs To Be Done" [level=2] [ref=f14e174]
                - generic [ref=f14e175]: Coordinate 3 concurrent columns for simultaneous editing and inspection
              - generic [ref=f14e177]:
                - heading "Expected Content Requirements" [level=2] [ref=f14e178]
                - list [ref=f14e179]:
                  - listitem [ref=f14e180]: Accessible navigation semantics and responsive containment
              - generic [ref=f14e181]:
                - heading "Target Product Archetypes" [level=2] [ref=f14e182]
                - generic [ref=f14e183]:
                  - generic [ref=f14e184]: developer-tool (90%)
                  - generic [ref=f14e185]: b2b-saas (85%)
            - status
      - generic [ref=f14e188]:
        - generic [ref=f14e189]:
          - link "Use in Workbench" [ref=f14e190] [cursor=pointer]:
            - /url: /workbench?resource=three-pane-app-shell
          - generic [ref=f14e195]:
            - button "Copy import" [ref=f14e196]
            - button "npx install" [ref=f14e201]
        - generic [ref=f14e206]:
          - note [ref=f14e207]: "Quality assessment: Not assessed."
          - generic [ref=f14e208]:
            - generic [ref=f14e209]: Category
            - generic [ref=f14e210]: shells
          - generic [ref=f14e211]:
            - generic [ref=f14e212]: SPDX License
            - generic [ref=f14e213]: MIT
          - generic [ref=f14e214]:
            - generic [ref=f14e215]: Creator
            - generic [ref=f14e216]: Tessellate Core
          - generic [ref=f14e217]:
            - generic [ref=f14e218]: Framework & Styling
            - generic [ref=f14e219]: react + tailwind
        - generic [ref=f14e221]:
          - generic [ref=f14e222]: Design DNA Profile
          - generic [ref=f14e236]:
            - generic [ref=f14e238]:
              - generic [ref=f14e239]: Density
              - generic [ref=f14e240]: 65%
            - generic [ref=f14e244]:
              - generic [ref=f14e245]: Visual Ambition
              - generic [ref=f14e246]: 60%
            - generic [ref=f14e250]:
              - generic [ref=f14e251]: Contrast
              - generic [ref=f14e252]: 75%
            - generic [ref=f14e256]:
              - generic [ref=f14e257]: Curvature
              - generic [ref=f14e258]: 40%
            - generic [ref=f14e262]:
              - generic [ref=f14e263]: Motion
              - generic [ref=f14e264]: 35%
  - contentinfo [ref=f14e267]: Tessellate Interface Intelligence Layer — Open resource library under MIT License.
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
  17 |  const visibleText=await screen.innerText();const result=await screen.evaluate(el=>({nodeCount:el.querySelectorAll('*').length,rect:(()=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})(),html:el.innerHTML.slice(0,300)}));return{route,status:response?.status(),before,visibleText,result};
  18 | }
  19 | test('published Site renders real Gold resource content and exposes keyboard scroll regions',async({page},info)=>{
  20 |  const diagnostics={consoleErrors:[] as string[],warnings:[] as string[],pageErrors:[] as string[],failedRequests:[] as string[],httpErrors:[] as string[]};page.on('console',m=>{if(m.type()==='error')diagnostics.consoleErrors.push(m.text());if(m.type()==='warning')diagnostics.warnings.push(m.text())});page.on('pageerror',e=>diagnostics.pageErrors.push(e.message));page.on('requestfailed',r=>diagnostics.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText??''}`));page.on('response',r=>{if(r.status()>=400)diagnostics.httpErrors.push(`${r.status()} ${r.url()}`)});
  21 |  const output=path.resolve(process.cwd(),'audit/evidence/v25/gold-runtime-dark-verified',info.project.name);await mkdir(output,{recursive:true});const results=[];
  22 |  for(const item of targets){const result=await inspect(page,item.slug,item.content);const screenshot=path.join(output,`${item.slug}-expressive-dark-${page.viewportSize()?.width}.png`);await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});results.push({...result,screenshot});}
  23 |  const scrollTargets=[{slug:'error-state',selector:'[aria-label="Error code sample"]',text:'Manifest Compilation Fault'},{slug:'feature-matrix',selector:'[aria-label="Example capability matrix comparison table"]',text:'Example capability matrix'},{slug:'three-pane-app-shell',selector:'[aria-label="Workspace canvas"]',text:'Visual Canvas'}];const keyboard=[];
  24 |  for(const item of scrollTargets){await inspect(page,item.slug,item.text);const frame=page.frameLocator('iframe[title$=" live preview"]');const region=frame.locator(item.selector);await expect(region).toBeVisible();await expect(region).toHaveAttribute('tabindex','0');await region.focus();await expect(region).toBeFocused();keyboard.push({slug:item.slug,selector:item.selector,tabIndex:await region.getAttribute('tabindex'),focused:true});}
> 25 |  const report={site:'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',capturedAt:new Date().toISOString(),viewport:page.viewportSize(),diagnostics,results,keyboard};await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');expect(diagnostics).toEqual({consoleErrors:[],warnings:[],pageErrors:[],failedRequests:[],httpErrors:[]});
     |                                                                                                                                                                                                                                                                                         ^ Error: expect(received).toEqual(expected) // deep equality
  26 | });
  27 | 
```