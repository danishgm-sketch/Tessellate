# Step 45 — Public review verification

Status: in progress. The latest broad route, flagship and Axe checkpoint remains Sites v37. The latest targeted documentation evidence covers public Sites v40–v42; these version references are historical observations. V39 closes AUD-357. V40 exposed AUD-358's stale version claim; v41 removed it but exposed stale issue-status wording. Public v42 verified the corrected historical copy on desktop and mobile and closes AUD-358. Earlier v32, saved v35, and v37 material below remains historical. AUD-356 remains the external Sites/Cloudflare deprecation finding. Step 45 and the product-hardening programme remain open.

## Public v37 deployed audit

Sites version `appgprj_6acc036de8cc8191a823339566972d85~appgver_918118e36d4c819196088b063bfab113` deployed successfully as `appgdep_6adfb7fd932c8191ae443e9a0af85c25`. The route smoke captured 31 public routes at 1440×900 and 390×844: all 62 responses were HTTP 200, with no console errors, uncaught exceptions, failed requests, bad responses, or document overflow. Route PASS is scoped to runtime/layout smoke and is not a full interaction/content claim.

The visible flagship workflow used the exact employee-experience brief on desktop and mobile, generated and inspected three directions, opened the selected Direction C in Workbench, changed onboarding and settings intent, locked dashboard content, recomposed, replaced a Gold hero resource, used Surprise Me and undo/redo, exported the manifest and standalone React ZIP, and verified the ZIP outside the monorepo with a clean install/build/browser run. The dedicated workflow report has four passed tests, two configured skips, and zero unexpected results. Generated-product Axe passes 2/2 with zero violations. General Axe has 15 passes and one configured skip; hydration checks have 12 passes and four configured skips. The focused replacement dialog and typed preview-to-Compose handoff pass at their tested desktop/mobile viewports.

The 390×844 homepage hero is 647.53px, below the 759.6px 90svh limit, and Compose ends at y=678.53 with all five preset labels visible. Home responsiveness was measured at 360, 390, 430, 768, 1024, 1280, and 1440px; the structure diagram was checked at 360, 390, 430, 768, 1024, and 1440px. Live CSP checks confirm a rotating per-response nonce, no `unsafe-inline` script source, and no loopback origins. No D1/R2 binding was provisioned.

Chrome DevTools cold traces: Home desktop LCP 270ms / TTFB 58ms / CLS 0; Workbench mobile under 4× CPU and Fast 4G has four LCP readings of 1,739ms, 1,747ms, 1,762ms, and 2,994ms (CLS 0). The outlier had a 1,184ms document TTFB; three samples are below 2.5s. CrUX has no field data for the page. Lighthouse scores Accessibility 100, SEO 100, Agentic Browsing 100, and Best Practices 81; the sole failed audit is three deprecated APIs in the Cloudflare-injected challenge script, recorded as AUD-356.

Machine-readable results and screenshots are in [`evidence/step-45/public-v37/`](evidence/step-45/public-v37/), with a concise index in [`verification-summary.json`](evidence/step-45/public-v37/verification-summary.json). The public Site uses the same application code captured on the current branch; this checkpoint adds tests and evidence, not a new runtime deployment. The runtime audit still has 210 locally fixed findings awaiting issue-specific deployed verification, including 25 High-severity items. This is verification debt, not proof that each item remains broken; no release-complete claim is made.

## Saved candidate capture — v35 local preview

The v35 review preview was inspected at desktop 1440×900 and mobile 390×844. Home exposes all five preset labels at both sizes without horizontal overflow. Compose reaches `Catalogue ready` and requests `/data/catalog.json` once at each viewport. All four navigation responses were HTTP 200; browser console errors/warnings, uncaught errors, failed requests, and HTTP errors were zero. Evidence: `quality/evidence/step-45/sites-v35-preview/preview-audit.json` and the four viewport screenshots in the same directory. The candidate is saved, not deployed; public v32 is the current Site. This evidence is local preview evidence and does not close deployed-verification findings.

## Baseline capture

The current public review Site is version 20, associated with Sites source-mirror commit
`ba10560aa5be5771e9565af250d4be5012072b88`. A clean Playwright Chromium
context was used at 1440×900 and 390×844, with empty localStorage. Both routes
returned HTTP 200; the baseline reported no browser console errors or warnings,
uncaught exceptions, failed requests, or HTTP error responses. The document
width matched each viewport.

The deployed home page still prefilled an AI market-intelligence/procurement
brief in the clean context. At 390×844 its Compose action was below the first
viewport (top at y=1018), and the hero was 1,452px tall. The six reported form
fields lacked both `id` and `name`; each had an accessible name. The mobile
homepage had no horizontal overflow. Evidence is in
`quality/evidence/step-45/pre-rc-public-browser.json` and the two
`pre-rc-home-*.png` captures. These are defects in the deployed v20 baseline,
not proof that the local fixes have reached the Site.

## Performance trace

Chrome DevTools MCP recorded one cold-load trace at Fast 4G for each viewport.
Desktop at 1440×900 with 1× CPU throttle measured LCP 556ms (TTFB 38ms,
render delay 518ms), CLS 0.00. Mobile at 390×844 with 4× CPU throttle measured
LCP 851ms (TTFB 169ms, render delay 682ms), CLS 0.00. CrUX field data and field
INP are unavailable. The DevTools estimates showed 0ms FCP/LCP savings from
render-blocking requests and 0ms estimated paint savings from document latency,
despite 56.9kB estimated wasted transfer. No performance change is justified
from those zero-savings findings alone. The trace measurements and limitations
are recorded in `quality/evidence/step-45/pre-rc-performance.json`.

A separate live homepage DevTools trace at 929×861 measured LCP 321ms (TTFB
47ms, render delay 274ms) and CLS 0; its 27 requests all returned HTTP 200.
The Explore interaction run made 128 requests: 127 returned HTTP 200 and the browser's
automatic `/favicon.ico` request returned HTTP 404 (AUD-291); `/data/catalog.json`
returned HTTP 200. No console errors or horizontal overflow were observed. The
trace and interaction record are in
`quality/evidence/step-38/after/sites-home-trace-v20-2026-10-24.json` and
`quality/evidence/step-45/site-v20-explore-search-live.json`; desktop and mobile
before screenshots are the adjacent `site-v20-*` captures. The live v20 kept
all 50 current result links and the same four preview iframe nodes mounted for
273ms while `onboarding` was typed, then showed 15 matching results; this closes
AUD-320 against the deployed Site. AUD-321's stale zero-results transition did
reproduce locally and remains pending public verification.

## Findings and local fixes

- AUD-317 records the unrelated default brief. The default is now an employee
  experience platform example. A browser regression was observed failing with
  the old brief and passes against the fixed local build at desktop and mobile.
- AUD-318 records missing field identity attributes in the deployed markup.
  The local composer now assigns stable IDs and names; the existing browser
  checks pass.
- AUD-268 records the deployed version's permissive inline script/style CSP;
  the local Sites Worker has a generated-hash policy. It remains open until a
  saved candidate is previewed and deployed verification is authorized.
- AUD-306 records the mobile homepage height and below-fold Compose action in
  the deployed version. The local responsive change is covered by browser
  tests and is awaiting deployed verification.

The audit contains 321 findings: 0 critical, 66 high, 241 medium, and 14 low.
At this point 28 are closed after deployed verification, 203 are fixed locally
and awaiting deployed checks, 88 are locally verified, and 2 retain a legacy
`fixed` status. AUD-320 is closed against deployed v20 behavior. AUD-321 was
found and fixed during the full browser rerun; it is not closed until a new
published review version verifies it.

## Local release-gate rerun

On the current source, frozen install, catalogue build, typecheck, lint, all 77
unit-test files (1,214 passed / 1 configured skip), all 16 behavioral release
gates, resource-isolation, licence/provenance, secret/security/dependency audits,
bundle budgets, production build (733 Astro pages), and the full three-profile
E2E run passed. E2E totals are 548 passed, 149 configured skips, zero failures
(Astro: 290 passed / 108 skips; Sites Worker: 255 passed / 41 skips; isolated
preview: 3 passed / 0 skips). The Sites Worker suite rendered/certified all 324
catalogue resources. Exact counts and limitations are in
`quality/evidence/step-45/local-release-gates.json`.
Lint initially caught missing globals in the newly added evidence-capture script;
the script declaration was corrected and lint rerun successfully before the full
suite. Vite still prints its raw minified-chunk size warning, while the measured
gzip budgets pass.

## Release boundary

The only version currently available to the public is version 20. Version 21
was saved from Sites source commit
`5b4280647b1ce9443e72d56a17f292810ecd2e63`; version 22 was saved from mirror
commit `892723597b36ae5dcca964899fa1daa8be21e5f9`, corresponding to canonical
source `849894fe5e325b20908984be540ab4420d5763c9`. Neither has a deployment ID
or hosted screenshot. D1 and R2 bindings are also null. The exact packaged
Worker was smoke-tested locally at 1440×900 and 390×844: 26/26 requests returned
HTTP 200, there were no console errors or horizontal overflow, and the mobile
document width matched 390px. Its screenshots were shown in the Codex task but
Sites did not provide a hosted preview URL. Version 22 includes the narrow-header
fix but predates the Explore search fixes now under review. Both saved versions
are superseded. The corrected source must pass current-head GitHub CI and be
saved as a new version; publication remains blocked pending the owner's
approval of that exact version.

The Sites source mirror excludes only the large audit screenshot/evidence
directories to fit the connector's source-push limits. Those files remain in
the canonical GitHub repository; the runtime application source is included in
the saved Worker artifact.

The Sites connector uses a separate `cloudflare_artifact` source repository
whose own branch is `main`; it is not the canonical GitHub repository branch.
Its current source history diverges from the local product-hardening branch.
The first read/open attempt refused the divergent histories and performed no
commit or push. See `quality/evidence/step-45/source-sync-open.json`. I will
reconcile this through an isolated Sites checkout and an ordinary fast-forward
mirror commit, while keeping `main` untouched in the canonical GitHub repo.

## Approved v28 publication and live verification — 2026-10-25

The owner approved publishing saved Site v28 from source-mirror commit
`500dbfc17b13cff99388b5959124b47bf3c1e3cc`. The Sites deployment record is
terminal `succeeded`; the public URL remains
`https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/`. A clean Chrome
DevTools context verified `/` and `/compose` at 1440×900. Both returned HTTP
200; the home page's 26 observed requests and the Compose route's observed
requests succeeded, with no console messages. `/data/catalog.json` returned
HTTP 200 and the Compose page showed `Catalogue ready`.

The exact employee-experience brief was entered and composed through the visible
UI with automatic archetype inference, Refined ambition, and Inventive
structural creativity. It inferred the Employee Experience archetype and
appropriate audience/objective, planned seven domain-relevant screens, and
produced three distinct navigation/layout grammars: sidebar/card grid,
top-navigation/feature grid, and rail/tri-column workspace. Existing full
desktop/mobile Direction C workflow records, screenshots, lock and replacement
subtree evidence, and export verification are in `audit/evidence/v28/flagship/`.
No console messages or failed network requests were observed in the clean
homepage and Compose checks.

The same public v28 response-header capture verified the generated-hash CSP and
absence of local API or preview-server origins. It closes deployed findings
AUD-268 and AUD-336; evidence is in
`quality/evidence/step-37/deployed-v28-csp-allowlist.json`. The header Search
accessible-name defect AUD-337 is confirmed on v28 and remains open until the
next explicitly approved version is rechecked. This approval did not authorize
publishing a later version.

## Current release-candidate continuation — 2026-10-26

### AUD-351: mobile preset labels

The public v30 homepage at 390×844 showed the preset row at 342px wide with
691px of scroll content; the third button extended beyond the visible row.
The before screenshot is `audit/evidence/step-45/aud-351-home-mobile-390-before-live-v30.png`.
The local fix changes the row to wrap at every breakpoint. The after screenshot
is `audit/evidence/step-45/aud-351-home-mobile-390-after.png`. A regression
failed before the code change and now verifies all preset buttons fit at 360,
390, 430, 768, 1024, and 1440px and that two presets update the brief. The
Sites Worker test passes both desktop and mobile profiles.

### Local checks after the fix

- `pnpm audit:all`: passed all 16 behavioral gates, 324/324 resource isolation,
  license/provenance, zero security violations, dependency audit, bundle gzip
  budgets, and the production build (733 Astro pages; 324 resources; 731 CSP
  HTML records). Vite still reports its raw chunk-size warning; gzip budgets
  pass.
- TypeScript, ESLint, and Vitest: passed on the candidate source (1,220 unit
  tests passed, one configured skip; 22 workspace typechecks; lint passed).
- Astro Playwright browser matrix: 324 passed, 112 configured skips, zero
  failures. Flagship mobile acceptance passed through independent React export.
- Isolated preview app: 3 passed, zero skipped.
- Sites Worker broad desktop/mobile run: 319 passed, 42 configured skips, and
  one failure. The failing detail was `faq-searchable`: its preview iframe
  stayed unmounted while a manifest JS request remained unsettled. The route
  passed alone, and a second exhaustive Sites Worker run passed all 324
  resources / 972 variants with zero findings in 11 minutes. This transient
  combined-run failure is recorded rather than omitted; current exact-head
  GitHub CI must independently confirm the full suite.
- The mobile preset regression and screenshot show no horizontal overflow and
  no clipped chip labels. Detailed machine evidence is in
  `quality/evidence/step-45/aud-351-local-validation.json` and the full
  resource result is `audit/evidence/step-07/after/catalog-324-worker-pass.json`.

### Release boundary and remaining work

The current public deployment is v32. D1 and R2 remain null. The strict CSP
still blocks one Sites-injected dynamic bootstrap per response (AUD-342), and
the 390px homepage still clips the third preset (AUD-351); `unsafe-inline` was
not added. The saved v35 candidate contains the local preset wrapping and
spacing corrections but is not deployed or approved. Step 45 remains open
until those issues receive exact-version deployed verification and the full
route, accessibility, flagship, responsive, and export acceptance checks pass.

### AUD-352: wrapped presets and first-viewport height

The first exact-head GitHub PR run for `d22d5c269c622161dc494420eaef4fee3c030ba8`
failed the pre-existing `home-visual-rhythm-step-40` regression in both
Chromium projects. Linux Chromium reported an 814.0625px hero at 390×844,
exceeding the 759.6px threshold; the test retry reproduced the same measurement.
The job ran 322 tests successfully and did not publish a screenshot artifact or
record browser-console/network details for the failed assertion. See
`audit/runtime-audit.json` / AUD-352 and the [exact PR workflow run](https://github.com/danishgm-sketch/Tessellate/actions/runs/40290991268).

Root cause: the AUD-351 label fix changed the preset list from a single clipped
line to three visible lines. With Linux system-font metrics, the additional
height regressed the first-viewport composer target. `HeroComposer` now reduces
only small-screen vertical spacing; chip labels still wrap and remain visible,
while spacing at tablet/desktop breakpoints is retained. The focused rhythm and
preset regressions pass 4/4 on a freshly built isolated preview. The captured
390×844 browser reports a 647.53px hero, Compose bottom at y=678.53, 342px
client/scroll widths for the preset row, five complete labels, HTTP 200, no
document overflow, no console/page errors, no failed requests, and no HTTP
errors. After screenshot and measurements:
`audit/evidence/step-45/aud-352-home-mobile-390-after.png` and
`audit/evidence/step-45/aud-352-home-mobile-390-after.json`.

The exact-head Linux CI rerun for candidate code commit
`5c2521bf75b72b86520ebfbfc4816aa50c6490a1` passed the full CI and component
sandbox workflows: [CI run](https://github.com/danishgm-sketch/Tessellate/actions/runs/40300330018), [component sandbox](https://github.com/danishgm-sketch/Tessellate/actions/runs/40300330012).
The full browser stage passed. Sites v34 is saved from Site-source commit
`eedfa4e58ba38f497f90960f09167283d0a57f7c`; it is not deployed, and Sites
returned no hosted screenshot or preview URL. The public Site remains v30.
Issue-specific deployed verification is still pending owner approval.

### Corrected candidate local revalidation — 2026-10-26

The corrected working tree passed frozen dependency install, catalogue build
(324 resources, 40 Gold), typecheck (22 workspace packages), ESLint, 1,220 unit
tests (one configured skip), and `pnpm audit:all` (16/16 behavioral gates,
324/324 resource isolation and licence/provenance, no security violations or
dependency advisories, bundle budgets, and 733-page production build). The
standalone default `pnpm test:e2e` invocation completed the Astro suite with
324 passes and 112 configured skips, then could not bind the default Sites
Worker port 4323 because an unrelated preview from the primary checkout was
already using it. No existing process was stopped. The remaining constituents
were rerun independently with `SITES_PREVIEW_BASE_URL=http://127.0.0.1:4333`:
Sites Worker desktop passed 179 with 2 configured skips, including all 324
catalogue resources at 360/390/430/768/1024/1280/1440 widths; Sites Worker
mobile passed 141 with 40 profile-specific skips; the isolated Preview app
passed 3 with no skips. Exact command output is local machine evidence; CI is
still needed for Linux font metrics.

The fixed candidate browser evidence is at
`audit/evidence/step-45/aud-352-home-mobile-390-after.json` and its screenshot.
It records HTTP 200, 647.53px hero height against 759.6px, Compose ending at
y=678.53, five visible presets without horizontal overflow, and zero captured
console errors, uncaught errors, failed requests, and HTTP errors. These checks
were run against code commit `aa4d83ffdd1121c3dd9d80f253e42b7b32b3b9d9`.
The full exact-head Linux CI and component sandbox passed on
`5c2521bf75b72b86520ebfbfc4816aa50c6490a1`. Sites v34 is saved but not
deployed; AUD-352 remains pending issue-specific deployed verification.

### Public v32 post-deploy verification — 2026-10-26

The owner approved the exact saved version v32. Sites reports deployment
`appgdep_6adf44a090608191ab748b8458c150ec` succeeded at the existing public URL.
It contains canonical source `4eca97890e2d8182bcd72edfe5659997d4317c21`
(Sites source mirror `5533d1082b649ec4429bb356cdc91ab3e2f2daf5`). Exact-head CI
run [40257364776](https://github.com/danishgm-sketch/Tessellate/actions/runs/40257364776)
and Component Quality Gate Sandbox run
[40257364864](https://github.com/danishgm-sketch/Tessellate/actions/runs/40257364864)
passed. No D1 or R2 bindings are provisioned.

Playwright loaded Home and Compose at 1440×900 and 390×844. All four route
loads returned HTTP 200, viewport widths matched document widths, Compose
reached `Catalogue ready`, and `/data/catalog.json` loaded once per fresh
Compose route. The saved employee Workbench rendered before catalogue loading;
Library then showed a retryable error when the first catalogue response was
deliberately changed to HTTP 503, and the retry returned HTTP 200 and rendered
Gold resources while leaving the project open. There were no uncaught app
errors or failed essential requests. A follow-up sweep visited all 26 requested
shell routes plus representative resource, showcase, blueprint, tool, and docs
details at both viewport sizes: 31 routes / 62 captures. All returned HTTP 200
with no overflow, uncaught exceptions, failed requests, unexpected HTTP
statuses, or preview timeouts. Every route is classified DEGRADED because the
same Sites-injected CSP error remains on each response (AUD-342). The mobile
homepage screenshot confirms AUD-351 still clips the third preset. Scrolling
the live `/pages` route exposed stale role-onboarding wording (AUD-353); the
local copy correction passes its new red-to-green test and its production Astro
preview at both viewports, but awaits deployment. Local after screenshots and
browser records are in `quality/evidence/step-45/public-v32/onboarding-copy-local-after-*`.
Captures, network records, and retry evidence are in
`quality/evidence/step-45/public-v32/`. This is targeted verification; the
complete public RC and flagship re-audit are not complete.

### Local gate rerun after AUD-353 — 2026-10-26

The current working tree passes `pnpm exec vitest run --maxWorkers=4` (1,221
passed, one configured skip), root typecheck, ESLint, `pnpm build`, and
`pnpm audit:all`. The audit reports 16/16 behavioral gates, 324/324 resource
isolation and licence/provenance checks, all gzip bundle budgets within limits,
and no security violations or dependency advisories. Vite still emits its raw
chunk-size warning; the measured gzip route budgets pass. The public v32 site is
unchanged. AUD-353, AUD-351 and AUD-342 still need exact-version deployed
verification, and the complete flagship, accessibility and standalone-export
re-audit is outstanding.

### Public v32 direction and flagship re-audit — 2026-10-26

The deployed direction review opened all three full previews from the visible
Compose UI at 1440×900 and 390×844. The compact cards initially looked
structurally alike at their narrow responsive width, but the full previews
proved that no direction-generation defect exists: A renders a 220px sidebar,
B a horizontal top bar, and C a 180px rail with a two-column dashboard table
and activity stream. At 390px the content stacks without document overflow.
Each screen uses resolvable Gold resources and has zero unresolved required
roles. Machine measurements and six full-preview screenshots are in
`quality/evidence/step-45/public-v32/directions-{desktop,mobile}-full/`; the
review summary is `quality/evidence/step-45/public-v32/DIRECTION_REVIEW.md`.

The exact flagship brief was entered through the live UI at desktop 1440×900
and mobile 390×844. Catalogue readiness was visible before Compose. All three
directions rendered; Direction C opened Workbench with the same project ID and
seven-screen manifest. The UI retained onboarding and settings DNA overrides
after reload, kept the dashboard KPI subtree (node
`node-screen-overview-metric-cards-3`, SHA-256
`34f785dbb7562f5287b16b0091ec14785cded809132af918562e1ea4b239a8ce`) through
95% recomposition and Surprise Me, replaced the activity feed with Gold
`notification-centre`, and restored exact snapshots through undo/redo. The
33-file standalone React ZIP installed in a clean directory, built, and ran
in a browser at desktop and mobile widths; it contains no `@tessellate/*`
runtime dependency. Machine records and exported ZIPs are under
`quality/evidence/step-45/public-v32/flagship/`.

Both browser journeys completed every product action with zero uncaught app
exceptions, failed requests, or HTTP errors. Each run recorded three blocked
inline-script CSP console errors injected by Sites (AUD-342), so the strict
zero-console-error release gate is not met. This is a hosting constraint; no
application CSP relaxation was added. The Playwright run is recorded as failed
at that final console assertion rather than reported as a clean pass.

The Axe browser harness also recorded `securitypolicyviolation` events on Home,
Explore, resource detail, Compose, and Workbench: `blockedURI` is `inline`, the
effective directive is `script-src-elem`, and disposition is `enforce`. Its
`sourceFile` is the current Site document and no blocked network request was
created. This reproduces AUD-342 directly in the browser rather than inferring
it only from console text.

An Axe scan against the live v32 Site covered Home, Explore, representative
resource detail, Compose ready state, and the generated Direction C Workbench
at both viewports. It found zero automated violations across these ten
route/view captures, including zero serious or critical findings. The scans
also recorded Axe `incomplete` checks for manual review; this is not a claim of
full WCAG 2.2 AA conformance. No app exception, failed request, or HTTP error
occurred during the Axe scans. See the repeatable spec/config and JSON/screen
records in `quality/evidence/step-45/public-v32/a11y/`.

The wider route sweep remains 31 routes × two viewports, all HTTP 200 and no
overflow, uncaught exceptions, failed requests, unexpected HTTP statuses or
preview timeouts. Every route is still classified DEGRADED because of
AUD-342. Public v32 also still has AUD-351’s clipped third homepage preset and
AUD-353’s stale onboarding copy; both have local fixes but await a later
approved Site version. The public RC is not accepted.

## Local candidate verification update — 2026-10-26

The Sites Worker now adds a fresh cryptographic nonce to the public HTML
`script-src` response header while preserving generated hashes, strict preview
policies, unchanged HTML, and the compression-friendly cache policy. The
focused Worker regression passes 6/6 and the changed Worker files pass ESLint.
Cloudflare's documented JavaScript Detections CSP integration says it copies a
nonce from the response policy to injected scripts. This remains unverified on
the hosted Site: public v32 is unchanged and AUD-342 stays open pending
deployed browser confirmation. Local evidence is in
`quality/evidence/step-45/aud-342-local-source.json`.

The first full Playwright attempt detected an existing Astro preview on port
4321 from a separate `C:/Users/ismay/Development/Tessellate` checkout. Because
the old config silently reused it, that run's preset failure and all other
results were discarded. The configs now start their own preview by default,
accept an explicit port per run, and require opt-in before server reuse. The
preset regression then passed against the current worktree on port 4322.
The fresh-worktree rerun used isolated ports (Astro 4412, Sites Worker 4413, preview app 4414) and ran the performance workloads in the Sites projects. The combined root suite had one transient Windows screenshot-file write error after 325 passes and 120 configured skips; the affected desktop keyboard case passed when rerun alone. No application assertion failed. The complete Sites desktop suite then passed 180 tests with 6 configured skips, including the 324-resource responsive matrix, Gold certification, accessibility, isolation, and performance workloads. Sites mobile passed 146 with 40 configured skips; the skipped cases are desktop-only or resource/state certification cases. The standalone preview app passed 3/3. A separate direct workload/stress run passed 12/12. This records the one-off artifact write failure rather than presenting the combined root attempt as a clean pass. The exact run outputs and browser artifacts are retained under `quality/evidence/step-45/`.

## Live DevTools continuation — 2026-10-26

Sites version history shows v32 as the latest successful publish (source 5533d1082b649ec4429bb356cdc91ab3e2f2daf5); saved v35 and v36 have no deployment IDs. Chrome DevTools traces on the live URL recorded desktop LCP/CLS: Home 352ms/0.00, Explore 318ms/0.00, Compose 418ms/0.00, Workbench 2,566ms/0.00 on one cold run and 518ms/0.00 on repeat. At 390x844, 4x CPU and Fast 4G: Home 859ms/0.00, Compose 833ms/0.00 and Workbench 1,814ms/0.00. CrUX field data is unavailable. The single slow Workbench trace was not repeatable; no stable LCP defect was established.

Desktop Lighthouse on Home, Explore, Compose, Workbench, and /r/advanced-data-table scored 100 accessibility, 92 best practices, 100 SEO and 100 agentic browsing on each route. Every route failed errors-in-console and inspector-issues because of the dynamic CSP bootstrap tracked as AUD-342. Workbench also reproduced AUD-350 label-content-name-mismatch on the visible laptop switch; local source and desktop/mobile Axe regressions contain the fix, but the deployed v32 Site predates it. The machine-readable trace, Lighthouse, console and network summary is quality/evidence/step-45/performance/public-v32-traces.json. The public Site remains unchanged; AUD-342, AUD-350 and the new local AUD-354/AUD-355 fixes await verification on a newly published source-complete version.

The live Workbench screenshot was inspected at 1440x900. It shows the full editor, tree, canvas, inspector, command bar, viewport controls and the visible laptop Lab Off label; it also confirms that the hosting Site returns a truthful Backend offline state when no laptop backend binding is configured.

## Public v39 targeted recheck — 2026-10-26

Sites v39 is the current public review deployment. On the changed documentation
route, Chrome DevTools verified `/docs/product-hardening/` at 390×844 and
1440×900. Both responses were HTTP 200; document/article widths matched their
available widths, with no overflowing prose/list items or out-of-viewport
inline code. There were zero failed essential requests, application console
errors, or uncaught exceptions. Three injected Sites/Cloudflare deprecation
messages remain AUD-356. The mobile capture and machine measurements are in
`quality/evidence/step-45/public-v39/docs-product-hardening-mobile-390.png` and
`quality/evidence/step-45/public-v39/docs-product-hardening-live.json`.
AUD-357 is closed after this issue-specific deployed check.

The homepage received a fresh performance smoke on the same deployed version.
Cold desktop (1440×900, Fast 3G, 1× CPU) measured LCP 1,484ms, TTFB 61ms,
render delay 1,423ms, and CLS 0.00. Cold mobile (390×844, Fast 3G, 4× CPU)
measured LCP 1,741ms, TTFB 56ms, render delay 1,685ms, and CLS 0.00. Both
single lab LCP readings are below the 2.5-second good threshold, but no field
CrUX data or INP result is available. Lighthouse returned 100 accessibility,
SEO and agentic browsing scores and 81 Best Practices at both viewports; its
only failed audit was the three injected host challenge-script deprecation
messages already tracked as AUD-356. Chrome reported one unattributed 99ms
forced reflow and no estimated savings. The 29 desktop requests had no failed
application requests or errors. No code change was justified by these results.
Full data: `quality/evidence/step-45/public-v39/homepage-performance.json`.

This is an issue-specific recheck plus a homepage performance baseline, not a
repeat of the full route/flagship/export audit. The v37 broad audit remains the
latest full-scope evidence; Step 45 and the release gate are still incomplete.

## Public v40 documentation recheck — 2026-10-27

On public Sites v40, the documentation page returned HTTP 200 at desktop
1440×900 and mobile 390×844. At desktop, document and article widths were
1440/1440 and 896/896; at mobile, they were 390/390 and 358/358. There were no
overflowing prose/list items, console errors, failed requests, or HTTP errors.
The latest continuation heading and v40 record were visible at both viewports.
Screenshots of the page top and current continuation, plus machine-readable
measurements, are under `quality/evidence/step-45/public-v40/`.

This recheck also found that the v40 page itself still claimed v39 was current.
AUD-358 records that separate documentation accuracy defect. The canonical
document now calls the v40 observation historical and adds the correction; it
remains open until deployed verification. This does not repeat the v37 route,
flagship, accessibility, or export suite, and does not close any other finding.

## Public v41 documentation verification — 2026-10-27

The public route returned HTTP 200 at 1440×900 and 390×844. At desktop,
document/article widths were 1440/1440 and 896/896; at mobile they were
390/390 and 358/358. No prose/list/code overflow, console error, failed
request, or HTTP error occurred. The v41 page no longer says v39 is current.
Screenshots and measurements are in
`quality/evidence/step-45/public-v41/`.

The live page still said AUD-358 remained open after the v41 check had already
verified the corrected version claim. This is the same stale checkpoint-copy
defect, not a separate app-runtime issue. The source now records the v41 check
as a historical observation and removes the stale pending-status sentence;
that final copy still needed verification after v41. Public v42 below completes
the check and closes AUD-358.

## Public v42 final copy verification — 2026-10-27

The public `/docs/product-hardening/` route returned HTTP 200 at 1440×900
and 390×844. Document/article widths were 1440/896 on desktop and 390/358
on mobile. There was no horizontal or text overflow, browser console error,
failed request, or HTTP error. The latest correction record was visible and
neither the stale “current version” nor stale “still open” claim appeared.
This issue-specific deployed check closes AUD-358; it does not repeat the
full route, flagship, accessibility, or export audit. The latest full-scope
checkpoint remains v37 and Step 45 remains in progress.

Sites v42 (`appgprj_6acc036de8cc8191a823339566972d85~appgver_6d07e70ea3c48191b0f782121aecb626`)
deployed as `appgdep_6adfffd2f6fc8191b0ac0bbd755a6ba5` from canonical source
`480647cae712fd78740094b76ccd244f676ccf8b` (Sites mirror
`3b6bbf98e425954a9d391b866200c6586692709b`). Screenshots and measurements
are under `quality/evidence/step-45/public-v42/`.

## Local browser gate — page-recipe fix — 2026-10-27

The full local browser matrix passed after isolating the Sites Worker on port
4335. Results: Astro desktop/mobile 334 passed and 120 configured skips;
Sites Worker desktop 181 passed and 6 configured skips; Sites Worker mobile
147 passed and 40 configured skips; standalone exported-preview app 3 passed.
That is 665 passed, 166 configured skips, and zero test failures across the
four profiles. The new page-recipe handoff regression passed on desktop and
mobile in the Astro profile. The Sites desktop profile included the 324
resource render certification and the preview-CSP suite.

The first aggregate `pnpm test:e2e` invocation completed its 454-case Astro
profile (334 passed, 120 configured skips), then could not start the Sites
Worker because an already-running `workerd.exe` owned port 4323. Its command
line pointed to another Tessellate Sites source checkout. I left that service
running and reran the two Sites profiles with
`SITES_PREVIEW_BASE_URL=http://127.0.0.1:4335`; both passed. The standalone
preview checks then passed on their configured isolated port. Browser runs
regenerated tracked screenshot/report artifacts; those test outputs were
restored, while the new v42 before-capture evidence and existing user trace
archives were preserved. This is local validation only: AUD-359/360 still
require a fresh public deployment and issue-specific live verification.
