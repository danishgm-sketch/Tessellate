# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: live-all-gold-dark-contrast-v25.spec.ts >> published Site: all 40 Gold resources keep expressive dark-theme text readable
- Location: audit\evidence\v25\live-all-gold-dark-contrast-v25.spec.ts:4:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 46

- Array []
+ Array [
+   "ai-prompt-composer: Context: 2 files (2.58:1, expected 4.5:1)",
+   "ai-prompt-composer: ~ 240 tokens (2.58:1, expected 4.5:1)",
+   "ai-prompt-composer: Shift + Enter for newline (2.58:1, expected 4.5:1)",
+   "ai-research-answer: 1. (2.58:1, expected 4.5:1)",
+   "ai-research-answer: 2. (2.58:1, expected 4.5:1)",
+   "ai-research-answer: 3. (2.58:1, expected 4.5:1)",
+   "ai-suggested-actions: ✦ (2.13:1, expected 4.5:1)",
+   "cta-minimal: Example content. Replace it with your product story. (3.65:1, expected 4.5:1)",
+   "donut-chart: Total (2.58:1, expected 4.5:1)",
+   "empty-workspace: No Projects Found (3.77:1, expected 4.5:1)",
+   "empty-workspace: Start by creating a new composition or choose from 12 pre-built blueprints. (3.77:1, expected 4.5:1)",
+   "feature-matrix: Example capability matrix (2.61:1, expected 3:1)",
+   "feature-matrix: Verified Zod Schemas (2.61:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Accessibility review (2.61:1, expected 4.5:1)",
+   "feature-matrix: Required (1:1, expected 4.5:1)",
+   "feature-matrix: Required (1:1, expected 4.5:1)",
+   "feature-matrix: Required (1:1, expected 4.5:1)",
+   "feature-matrix: Required (1:1, expected 4.5:1)",
+   "feature-matrix: Zero External CSS Dependencies (2.61:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Curated Nocturne Theme (2.61:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "feature-matrix: Yes (1:1, expected 4.5:1)",
+   "filter-builder: Filter Rules (3.77:1, expected 4.5:1)",
+   "filter-builder: + Add Condition (3.77:1, expected 4.5:1)",
+   "filter-builder: No conditions yet. Add a condition to build a filter. (1.49:1, expected 4.5:1)",
+   "filter-builder: Example rules only. Connect a data source to apply filters. (1.49:1, expected 4.5:1)",
+   "input: Full name (1.88:1, expected 4.5:1)",
+   "kanban-board: Sample task board (2.61:1, expected 4.5:1)",
+   "logo-cloud-minimal: Illustrative logos · replace with approved marks before publishing (2.12:1, expected 4.5:1)",
+   "marketing-nav-cta: BETA (2.03:1, expected 4.5:1)",
+   "select: Select an option (1.88:1, expected 4.5:1)",
+   "subtle-grid-field: Architectural Surface (1.47:1, expected 4.5:1)",
+   "subtle-grid-field: Vector coordinate grid providing structural rhythm with zero client bundle overhead. (1.72:1, expected 4.5:1)",
+   "time-series-chart: req/s (2.58:1, expected 4.5:1)",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f78e1]:
  - generic [ref=f78e2]:
    - link "Skip to content" [ref=f78e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=f78e4]:
      - generic [ref=f78e5]:
        - generic [ref=f78e6]:
          - link "Tessellate Mark Tessellate" [ref=f78e7] [cursor=pointer]:
            - /url: /
            - img "Tessellate Mark" [ref=f78e8]
            - generic [ref=f78e13]: Tessellate
          - navigation "Primary" [ref=f78e14]:
            - link "Explore" [ref=f78e15] [cursor=pointer]:
              - /url: /explore
            - link "Compose" [ref=f78e16] [cursor=pointer]:
              - /url: /compose
            - link "Workbench" [ref=f78e17] [cursor=pointer]:
              - /url: /workbench
            - link "Tools" [ref=f78e18] [cursor=pointer]:
              - /url: /tools
            - link "Agents" [ref=f78e19] [cursor=pointer]:
              - /url: /agents
            - link "Creators" [ref=f78e20] [cursor=pointer]:
              - /url: /creators
            - link "Docs" [ref=f78e21] [cursor=pointer]:
              - /url: /docs
        - generic [ref=f78e22]:
          - button "Search resources (Press Command-K)" [ref=f78e23] [cursor=pointer]:
            - generic [ref=f78e27]: Search...
            - generic [ref=f78e28]: ⌘K
          - link "GitHub Repository" [ref=f78e29] [cursor=pointer]:
            - /url: https://github.com/danishgm-sketch/Tessellate
          - button "Local projects" [ref=f78e32] [cursor=pointer]
          - link "Start building" [ref=f78e33] [cursor=pointer]:
            - /url: /compose
  - main [ref=f78e34]:
    - navigation "Resource breadcrumb" [ref=f78e35]:
      - link "Home" [ref=f78e36] [cursor=pointer]:
        - /url: /
      - generic [ref=f78e37]: /
      - link "Explore" [ref=f78e38] [cursor=pointer]:
        - /url: /explore
      - generic [ref=f78e39]: /
      - generic [ref=f78e40]: shells
      - generic [ref=f78e41]: /
      - generic [ref=f78e42]: Two-Pane Master Detail Shell
    - generic [ref=f78e43]:
      - generic [ref=f78e44]:
        - heading "Two-Pane Master Detail Shell" [level=1] [ref=f78e45]
        - generic [ref=f78e46]:
          - generic [ref=f78e47]: "@tess/two-pane-master-detail-shell"
          - generic [ref=f78e48]: v1.0.0
          - generic [ref=f78e49]: verified
        - paragraph [ref=f78e50]: Split-view shell pairing searchable master entity list with comprehensive detail reader pane.
        - generic [ref=f78e51]:
          - generic [ref=f78e52]: "Install:"
          - code [ref=f78e53]: tess add two-pane-master-detail-shell
          - code [ref=f78e54]: "Registry source: /r/two-pane-master-detail-shell.json"
      - list [ref=f78e55]:
        - listitem [ref=f78e56]: "#two-pane-master-detail-shell"
        - listitem [ref=f78e57]: "#split-view"
        - listitem [ref=f78e58]: "#master-detail"
        - listitem [ref=f78e59]: "#shell"
    - generic [ref=f78e60]:
      - generic [ref=f78e61]:
        - generic [ref=f78e63]:
          - generic [ref=f78e64]:
            - generic [ref=f78e65]:
              - generic [ref=f78e66]: "Variant:"
              - button "Quiet" [ref=f78e67]
              - button "Expressive" [ref=f78e68]
              - button "Nocturne" [ref=f78e69]
            - generic [ref=f78e70]:
              - generic [ref=f78e71]:
                - button "Desktop (1440px)" [ref=f78e72]
                - button "Tablet (768px)" [ref=f78e75]
                - button "Mobile (360px)" [ref=f78e78]
              - button "Switch to Light theme" [active] [ref=f78e81]
              - button "Motion" [ref=f78e88]
              - button "Reset preview state" [ref=f78e92]
          - iframe [ref=f78e98]:
            - generic [ref=f79e3]:
              - heading "Two-Pane Master Detail Shell preview" [level=1] [ref=f79e4]
              - generic [ref=f79e8]:
                - generic [ref=f79e9]:
                  - generic [ref=f79e10]: Incidents Queue
                  - button [pressed] [ref=f79e11] [cursor=pointer]:
                    - paragraph [ref=f79e12]: "Alert: High CPU Usage"
                    - paragraph [ref=f79e13]: 10m ago
                  - button [ref=f79e14] [cursor=pointer]:
                    - paragraph [ref=f79e15]: "Deploy: Version 0.1.0 Successful"
                    - paragraph [ref=f79e16]: 1h ago
                  - button [ref=f79e17] [cursor=pointer]:
                    - paragraph [ref=f79e18]: "Security: Token Refresh"
                    - paragraph [ref=f79e19]: 3h ago
                - generic [ref=f79e20]:
                  - 'heading "Incident Details (ID: 1)" [level=2] [ref=f79e21]'
                  - paragraph [ref=f79e22]: Telemetry metrics indicate node threshold normalization.
        - generic [ref=f78e100]:
          - generic [ref=f78e101]:
            - button "Intent" [ref=f78e102]
            - button "Code" [ref=f78e106]
            - button "Variants" [ref=f78e111]
            - button "Anatomy" [ref=f78e119]
            - button "Accessibility" [ref=f78e125]
            - button "Performance" [ref=f78e130]
            - button "Dependencies" [ref=f78e134]
            - button "Versions" [ref=f78e140]
          - generic [ref=f78e146]:
            - generic [ref=f78e147]:
              - generic [ref=f78e148]:
                - heading "Summary & Purpose" [level=2] [ref=f78e149]
                - paragraph [ref=f78e150]: Split-view shell pairing searchable master entity list with comprehensive detail reader pane.
              - generic [ref=f78e151]:
                - generic [ref=f78e152]:
                  - generic [ref=f78e153]: When It Works (Ideal For)
                  - list [ref=f78e158]:
                    - listitem [ref=f78e159]:
                      - generic [ref=f78e160]: •
                      - generic [ref=f78e161]: Browsing entity queues where immediate detail reading is required
                - generic [ref=f78e162]:
                  - generic [ref=f78e163]: When It Is Inappropriate (Avoid For)
                  - list [ref=f78e169]:
                    - listitem [ref=f78e170]:
                      - generic [ref=f78e171]: •
                      - generic [ref=f78e172]: Freeform full-canvas drawing apps
              - generic [ref=f78e173]:
                - heading "Jobs To Be Done" [level=2] [ref=f78e174]
                - generic [ref=f78e175]: Coordinate master list selection with detail pane updating
              - generic [ref=f78e177]:
                - heading "Expected Content Requirements" [level=2] [ref=f78e178]
                - list [ref=f78e179]:
                  - listitem [ref=f78e180]: Accessible navigation semantics and responsive containment
              - generic [ref=f78e181]:
                - heading "Target Product Archetypes" [level=2] [ref=f78e182]
                - generic [ref=f78e183]:
                  - generic [ref=f78e184]: developer-tool (90%)
                  - generic [ref=f78e185]: b2b-saas (85%)
            - status
      - generic [ref=f78e188]:
        - generic [ref=f78e189]:
          - link "Use in Workbench" [ref=f78e190] [cursor=pointer]:
            - /url: /workbench?resource=two-pane-master-detail-shell
          - generic [ref=f78e195]:
            - button "Copy import" [ref=f78e196]
            - button "npx install" [ref=f78e201]
        - generic [ref=f78e206]:
          - note [ref=f78e207]: "Quality assessment: Not assessed."
          - generic [ref=f78e208]:
            - generic [ref=f78e209]: Category
            - generic [ref=f78e210]: shells
          - generic [ref=f78e211]:
            - generic [ref=f78e212]: SPDX License
            - generic [ref=f78e213]: MIT
          - generic [ref=f78e214]:
            - generic [ref=f78e215]: Creator
            - generic [ref=f78e216]: Tessellate Core
          - generic [ref=f78e217]:
            - generic [ref=f78e218]: Framework & Styling
            - generic [ref=f78e219]: react + tailwind
        - generic [ref=f78e221]:
          - generic [ref=f78e222]: Design DNA Profile
          - generic [ref=f78e236]:
            - generic [ref=f78e238]:
              - generic [ref=f78e239]: Density
              - generic [ref=f78e240]: 65%
            - generic [ref=f78e244]:
              - generic [ref=f78e245]: Visual Ambition
              - generic [ref=f78e246]: 60%
            - generic [ref=f78e250]:
              - generic [ref=f78e251]: Contrast
              - generic [ref=f78e252]: 75%
            - generic [ref=f78e256]:
              - generic [ref=f78e257]: Curvature
              - generic [ref=f78e258]: 40%
            - generic [ref=f78e262]:
              - generic [ref=f78e263]: Motion
              - generic [ref=f78e264]: 35%
  - contentinfo [ref=f78e267]: Tessellate Interface Intelligence Layer — Open resource library under MIT License.
```

# Test source

```ts
  1 | import {mkdir,writeFile}from'node:fs/promises';import path from'node:path';import{readFileSync}from'node:fs';import{expect,test}from'@playwright/test';
  2 | type Resource={slug:string;name:string;status:string};const catalogue=JSON.parse(readFileSync(path.resolve(process.cwd(),'apps/site/public/data/catalog.json'),'utf8'))as{resources:Resource[]};const gold=catalogue.resources.filter(r=>r.status==='verified-gold');
  3 | async function measure(frame:any){return frame.evaluate(()=>{type RGBA=[number,number,number,number];const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return{error:'canvas unavailable',samples:[],failures:[]};const parse=(value:string):RGBA=>{ctx.clearRect(0,0,1,1);ctx.fillStyle='rgba(0,0,0,0)';ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return[...ctx.getImageData(0,0,1,1).data]as RGBA};const over=(fg:RGBA,bg:RGBA):RGBA=>{const fa=fg[3]/255,ba=bg[3]/255,a=fa+ba*(1-fa);if(!a)return[0,0,0,0];return[0,1,2].map(i=>Math.round((fg[i]*fa+bg[i]*ba*(1-fa))/a)).concat(Math.round(a*255))as RGBA};const lum=(c:RGBA)=>{const f=(v:number)=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const samples=[]as Array<Record<string,unknown>>;const screen=document.querySelector('.tess-screen');if(!screen)return{error:'screen missing',samples,failures:samples};for(const el of Array.from(screen.querySelectorAll<HTMLElement>('*'))){const text=Array.from(el.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent?.trim()??'').filter(Boolean).join(' ');const rect=el.getBoundingClientRect();const style=getComputedStyle(el);if(!text||rect.width<1||rect.height<1||style.visibility==='hidden'||style.display==='none')continue;const chain:HTMLElement[]=[];for(let n:HTMLElement|null=el;n;n=n.parentElement)chain.unshift(n);let bg:RGBA=[255,255,255,255];let gradient=false;for(const ancestor of chain){const s=getComputedStyle(ancestor);if(s.backgroundImage!=='none')gradient=true;bg=over(parse(s.backgroundColor),bg)}if(bg[3]<255)bg=over(bg,[255,255,255,255]);const fg=parse(style.color);const painted=over(fg,bg);const ratio=(Math.max(lum(painted),lum(bg))+.05)/(Math.min(lum(painted),lum(bg))+.05);const px=parseFloat(style.fontSize);const large=px>=24||(px>=18.66&&parseInt(style.fontWeight,10)>=700);const sample={text:text.slice(0,100),tag:el.tagName.toLowerCase(),className:typeof el.className==='string'?el.className.slice(0,100):'',foreground:style.color,background:`rgb(${bg[0]},${bg[1]},${bg[2]})`,ratio:+ratio.toFixed(2),threshold:large?3:4.5,gradient,fontSize:style.fontSize,fontWeight:style.fontWeight};samples.push(sample)}return{theme:document.documentElement.dataset.theme??'light',textCount:samples.length,failures:samples.filter(s=>!s.gradient&&Number(s.ratio)<Number(s.threshold)),samples}})}
  4 | test('published Site: all 40 Gold resources keep expressive dark-theme text readable',async({page},info)=>{test.setTimeout(15*60*1000);const diagnostics={console:[]as string[],warnings:[]as string[],pageErrors:[]as string[],failedRequests:[]as string[],httpErrors:[]as string[]};page.on('console',m=>{if(m.type()==='error')diagnostics.console.push(m.text());if(m.type()==='warning')diagnostics.warnings.push(m.text())});page.on('pageerror',e=>diagnostics.pageErrors.push(e.message));page.on('requestfailed',r=>diagnostics.failedRequests.push(`${r.url()} ${r.failure()?.errorText??''}`));page.on('response',r=>{if(r.status()>=400)diagnostics.httpErrors.push(`${r.status()} ${r.url()}`)});const out=path.resolve(process.cwd(),'audit/evidence/v25/gold-dark-contrast-sweep',info.project.name);await mkdir(out,{recursive:true});const results=[]as Array<Record<string,unknown>>;
  5 | for(const resource of gold){const route=`/resources/${resource.slug}/`;const res=await page.goto(route,{waitUntil:'domcontentloaded'});expect(res?.status(),route).toBe(200);const iframe=page.locator('iframe[title$=" live preview"]');await expect(iframe).toBeVisible();const preview=page.frameLocator('iframe[title$=" live preview"]');const expectedId=`preview-${resource.slug}`;await expect(preview.locator(`[data-node-id="${expectedId}"]`)).toBeAttached({timeout:20000});await page.getByRole('button',{name:'Expressive',exact:true}).click();await expect(iframe).toHaveAttribute('src',/variant=expressive/);await expect.poll(()=>page.frames().some(f=>f.url().includes(`/preview-content/?resource=${resource.slug}&`)&&f.url().includes('variant=expressive')),{timeout:20000}).toBe(true);await expect(preview.locator(`[data-node-id="${expectedId}"]`)).toBeAttached({timeout:20000});await page.getByRole('button',{name:'Switch to Dark theme'}).click();await expect(iframe).toHaveAttribute('src',/variant=expressive.*theme=dark/);const expectedFrameUrl=`/preview-content/?resource=${resource.slug}&variant=expressive&theme=dark`;await expect.poll(()=>page.frames().some(f=>f.url().includes(expectedFrameUrl)),{timeout:20000,message:`${resource.slug} dark expressive frame should finish loading`}).toBe(true);await expect(preview.locator(`[data-node-id="${expectedId}"]`)).toBeAttached({timeout:20000});const frame=page.frames().find(f=>f.url().includes(expectedFrameUrl));expect(frame,route).toBeTruthy();const contrast=await measure(frame!);const screenshot=Array.isArray((contrast as any).failures)&&(contrast as any).failures.length?path.join(out,`${resource.slug}-1440x900.png`):null;if(screenshot)await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});const result={slug:resource.slug,route,status:res?.status(),textCount:(contrast as any).textCount,failures:(contrast as any).failures,screenshot};results.push(result);await writeFile(path.join(out,'report.partial.json'),JSON.stringify({site:'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',viewport:page.viewportSize(),checked:results.length,total:gold.length,diagnostics,results},null,2)+'\n');console.log(`${resource.slug}: ${(contrast as any).textCount} text nodes; ${(contrast as any).failures?.length??0} contrast failures`);}
> 6 | const report={site:'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',capturedAt:new Date().toISOString(),viewport:page.viewportSize(),goldResources:gold.length,diagnostics,results};await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');expect(gold).toHaveLength(40);expect(results.flatMap(r=>(r.failures as unknown[]).map((f:any)=>`${r.slug}: ${f.text} (${f.ratio}:1, expected ${f.threshold}:1)`))).toEqual([]);expect(diagnostics.console).toEqual([]);expect(diagnostics.pageErrors).toEqual([]);expect(diagnostics.httpErrors).toEqual([]);expect(diagnostics.failedRequests.filter(x=>!x.includes('net::ERR_ABORTED'))).toEqual([])});
    |                                                                                                                                                                                                                                                                                                                                                                                                                                                     ^ Error: expect(received).toEqual(expected) // deep equality
  7 | 
```