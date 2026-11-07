/* global process, console, document, getComputedStyle, location, innerWidth, innerHeight */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(path.resolve("node_modules/.pnpm/playwright@1.63.0/node_modules/playwright"));

const base = "https://tessellate-v1-review.ismayildanish-gm.chatgpt.site";
const outDir = path.resolve("quality/evidence/step-39/deployed-v30-routes");
fs.mkdirSync(outDir, { recursive: true });
const routes = [
  ["home", "/"], ["tools", "/tools"],
  ["tool-dna", "/tools/dna"], ["tool-backgrounds", "/tools/backgrounds"],
  ["tool-motion", "/tools/motion"], ["tool-palette", "/tools/palette"],
  ["tool-typography", "/tools/typography"], ["tool-layout", "/tools/layout"],
  ["tool-section-planner", "/tools/section-planner"], ["tool-dataviz", "/tools/dataviz"],
  ["tool-accessibility", "/tools/accessibility"], ["tool-icons", "/tools/icons"],
  ["docs-cli", "/docs/cli"], ["docs-mcp", "/docs/mcp"],
  ["ai-prompt-hero", "/r/ai-prompt-hero"], ["inline-ai-rewrite", "/r/inline-ai-rewrite"],
  ["ai-tool-execution-timeline", "/r/ai-tool-execution-timeline"], ["ai-chat-panel", "/r/ai-chat-panel"],
  ["ai-model-mode-switcher", "/r/ai-model-mode-switcher"], ["ai-source-citations", "/r/ai-source-citations"],
  ["ai-research-answer", "/r/ai-research-answer"], ["cta-community", "/r/cta-community"],
  ["cta-product-preview", "/r/cta-product-preview"], ["customer-metrics-strip", "/r/customer-metrics-strip"],
  ["logo-cloud-marquee", "/r/logo-cloud-marquee"], ["feature-metrics", "/r/feature-metrics"],
  ["social-proof-hero", "/r/social-proof-hero"], ["testimonial-grid", "/r/testimonial-grid"]
];
const viewports = [{name:"desktop-1440x900",width:1440,height:900},{name:"mobile-390x844",width:390,height:844}];
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [key, route] of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const consoleMessages = [];
      const uncaught = [];
      const failedRequests = [];
      const badResponses = [];
      page.on("console", m => { if (m.type() === "error" || m.type() === "warning") consoleMessages.push({type:m.type(),text:m.text().slice(0,700)}); });
      page.on("pageerror", e => uncaught.push(String(e).slice(0,700)));
      page.on("requestfailed", r => failedRequests.push({url:r.url(),failure:r.failure()?.errorText ?? "unknown"}));
      page.on("response", r => { if (r.status() >= 400) badResponses.push({url:r.url(),status:r.status()}); });
      const started = Date.now();
      let response = null;
      let navigationError = null;
      try {
        response = await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(1100);
      } catch (e) { navigationError = String(e).slice(0,700); }
      const pageData = await page.evaluate(() => {
        const visible = el => { const r=el.getBoundingClientRect(), s=getComputedStyle(el); return r.width>0 && r.height>0 && s.visibility!="hidden" && s.display!="none"; };
        const text = document.body?.innerText ?? "";
        const buttons = [...document.querySelectorAll("button")].filter(visible).map(b=>({label:(b.innerText||b.getAttribute("aria-label")||b.title||"").trim().slice(0,160),disabled:b.disabled,pressed:b.getAttribute("aria-pressed")})).filter(b=>b.label).slice(0,60);
        const links = [...document.querySelectorAll("a")].filter(visible).map(a=>({label:(a.innerText||a.getAttribute("aria-label")||"").trim().slice(0,120),href:a.href})).filter(a=>a.label).slice(0,80);
        const claims = [...new Set((text.match(/.{0,55}(zero hallucinations|production[- ]grade|fully accessible|WCAG\s*(?:2\.2\s*)?(?:AA|AAA)|12,?000\+?|thousands of developers|zero[- ]debt|verified manifests|real[- ]time streaming|zero cognitive strain|telemetry|MEASURED METRIC|100-point audit|Export Data|Join Discord|Open Canvas Now|verified sources|provider connected|active credentials).{0,100}/gi)||[]))].slice(0,40);
        return {url:location.href,title:document.title,viewport:{width:innerWidth,height:innerHeight},layout:{clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body?.scrollWidth??null,scrollHeight:document.documentElement.scrollHeight},text:text.slice(0,7000),claims,buttons,links};
      });
      const shot = path.join(outDir, `${key}-${viewport.name}.png`);
      try { await page.screenshot({ path: shot, fullPage: false, animations: "disabled" }); } catch (e) { navigationError = `${navigationError ? navigationError+" | " : ""}screenshot: ${String(e).slice(0,350)}`; }
      results.push({id:`${key}-${viewport.name}`,route,viewport:viewport.name,url:base+route,httpStatus:response?.status()??null,title:pageData.title,elapsedMs:Date.now()-started,layout:pageData.layout,claims:pageData.claims,buttons:pageData.buttons,links:pageData.links,visibleText:pageData.text,console:consoleMessages,uncaught,network:{failedRequests,badResponses},screenshot:path.relative(process.cwd(),shot),navigationError});
      await context.close();
    }
  }
} finally { await browser.close(); }
const audit = {generatedAt:new Date().toISOString(),site:base,siteVersion:30,viewportCount:viewports.length,routes:routes.map(([key,path])=>({key,path})),results};
fs.writeFileSync(path.resolve("quality/evidence/step-39/deployed-v30-route-audit.json"), JSON.stringify(audit,null,2)+"\n");
const summary = results.map(r=>({id:r.id,status:r.httpStatus,overflow:r.layout.scrollWidth>r.layout.clientWidth,consoleErrors:r.console.filter(x=>x.type==="error").length,uncaught:r.uncaught.length,failed:r.network.failedRequests.length,badResponses:r.network.badResponses.length,screenshot:r.screenshot}));
console.log(JSON.stringify({generatedAt:audit.generatedAt,count:results.length,summary},null,2));
