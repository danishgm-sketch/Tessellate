import { appendFile, readFile } from 'node:fs/promises';

const classifications = JSON.parse(await readFile('quality/evidence/step-45/public-v52-continuation-2026-10-28/route-classifications.json', 'utf8'));
const current = await readFile('audit/RUNTIME_AUDIT.md', 'utf8');
if (current.includes('## Public Sites v52 continuation audit')) {
  console.log('v52 continuation section already present');
  process.exit(0);
}
const rows = classifications.classifications.map(x => '| ' + x.route + ' | ' + x.classification + ' | ' + x.rationale.replaceAll('|', '/') + ' |').join('\n');
const report = [
'',
'## Public Sites v52 continuation audit — 2026-10-28',
'',
'The current public review Site is https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/, canonical application source 00aee74806dacec62bc4a14986f51e284f083c46, Sites mirror 286fccc39903e6b945e1608ce791d5b6e58ac2a2. It has no D1 or R2 bindings. This continuation is an evidence checkpoint, not completion of Step 45 or the product-hardening programme.',
'',
'### Route classifications',
'',
'All 31 requested public routes were opened at 1440×900 and 390×844. Every page returned HTTP 200, loaded its main content, had no broken image, application console error, bad response, or document horizontal overflow. Representative content and live behavior were reviewed beyond status alone. PASS is limited to route/content smoke plus the interaction coverage listed below; it does not claim exhaustive testing of every control on every page.',
'',
'| Route | Classification | Runtime assessment |',
'|---|---|---|',
rows,
'',
'The public data artifact /data/showcases/index.json returns HTTP 200 but is MISLEADING: four of eight entries disagree with current canonical showcase records. It is listed separately because it is a public JSON resource, not one of the 31 page routes.',
'',
'### Interactions and flagship evidence',
'',
'- Explore: On desktop and mobile, the visible search for dashboard narrowed the catalogue to 25 results; adding the Motion facet produced 0; clearing the query preserved Motion and produced 24; clearing the facet restored 50 of 324. The URL tracked committed query/facet state. The browser recorded 10 net::ERR_ABORTED preview/script requests while result-list changes unmounted in-flight previews (8 desktop, 2 mobile). These were cancellations, not HTTP failures: each is preserved in the request log, there were no 4xx/5xx responses or console errors, and stable route sweeps loaded previews without errors.',
'- Section Planner: Employee timeline was entered and added through the visible UI on desktop and mobile; the count changed from 8 to 9 and no overflow occurred. Chrome DevTools separately reported one issue because the textbox has no id or name; this is AUD-376.',
'- Flagship employee workflow: The deployed desktop/mobile acceptance run passed 4 tests, skipped 2 configured matrix cases, and had 0 unexpected failures. It composed the exact brief, inspected the three structurally distinct directions, selected Direction C, handed off to the exact Workbench project, changed page intent, locked the dashboard KPI block, recomposed at 95, replaced a component through the UI, used Surprise Me, restored and replayed mutations with Undo/Redo, checked responsive sizes, reloaded, exported the manifest, and installed/built/ran the standalone React ZIP in a clean temporary directory. The exported project had no @tessellate/* runtime dependency and its browser smoke passed.',
'- Evidence is under quality/evidence/step-45/public-v52-continuation-2026-10-28/. Flagship manifests and run summaries are in flagship-playwright.json and flagship-results/; route screenshots and machine results are indexed by route-audit.json and route-classifications.json.',
'- All eight showcase detail routes were opened at both viewports (16/16 returned 200, no overflow, console errors, uncaught exceptions, failed requests or bad responses). Only the employee showcase had a duplicate heading, addressed by AUD-375.',
'',
'### Accessibility, performance, security and network',
'',
'Axe reported zero violations on six selected routes at desktop and mobile (12 scans), plus the generated employee Workbench at both sizes (2 scans). Axe injected style instrumentation and generated CSP console messages on Explore and the resource detail; a separate uninstrumented Chrome check did not reproduce those messages, so they are scanner interference rather than an observed product CSP failure. The direct Chrome Workbench and resource routes had no uncaught errors. The representative route scan recorded no application console warnings/errors or failed requests.',
'',
'Chrome DevTools traces at 1× CPU and no network throttling measured LCP/CLS: Compose 140ms / 0, Explore 142ms / 0, generated Workbench 635ms / 0. The earlier v52 homepage trace measured 278ms / 0 CLS. CrUX field data is unavailable; navigation traces do not provide representative INP. Explore also showed an unattributed 52ms ForcedReflow insight with no estimated savings. Full numbers are in quality/evidence/step-45/public-v52-continuation-2026-10-28/performance-summary.json.',
'',
'No secrets were exposed and no D1/R2 resources were provisioned. The public Site continues to identify local-host inference as unavailable when no laptop backend is configured.',
'',
'### Open findings from this continuation',
'',
'#### MEDIUM',
'',
'- AUD-375 — Employee showcase repeats the marketing hero in its conversion CTA. Evidence: desktop and mobile screenshots in quality/evidence/step-45/public-v52-continuation-2026-10-28/interactive/showcase-copy-before-*.png and interactive/showcase-copy-before.json. Reproduce by opening the employee showcase and scrolling below Made for everyday employee experiences; the hero H1 and CTA H2 are identical, and the repeated paragraph appears three times. Root cause: bindResourceContent sends both hero and conversion-cta roles the same headline and description. Affected code: packages/compatibility/src/content-bindings.ts. Remediation: provide distinct employee CTA copy and test rendered output.',
'- AUD-377 — Public showcase index disagrees with the canonical gallery. Evidence: live /data/showcases/index.json HTTP 200, the Showcase gallery screenshot, and compare-showcase-index.ts. Compare with SHOWCASE_PROJECTS: hospitality, employee, luxury ecommerce, and productivity records are stale. Root cause: scripts/build-catalog.ts rewrites showcase manifests but not the public index. Remediation: generate the index from canonical showcase definitions and add a consistency regression.',
'',
'#### LOW',
'',
'- AUD-376 — Section Planner custom-title field has no id or name. Evidence: desktop and mobile field screenshots and interactive/section-planner-field-before.json. Root cause: the input has only an aria-label. Affected code: apps/site/src/components/tools/SectionPlanner.tsx. Remediation: add a stable id and name, preserve the accessible name, and verify Add at desktop and mobile.',
'',
'Machine-readable per-route results and issue records are in route-classifications.json and audit/runtime-audit.json. These findings remain open until they pass exact-head CI and a new deployed verification.',
'',
].join('\n');
await appendFile('audit/RUNTIME_AUDIT.md', report);
console.log(JSON.stringify({ routeCount: classifications.classifications.length, appended: true }));
