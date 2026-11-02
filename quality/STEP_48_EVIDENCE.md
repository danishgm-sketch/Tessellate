# Step 48 — Release evidence

Step 48 remains open. This record captures the current public review publication
and its targeted verification; a documentation-only Site publication is not a
release approval or a substitute for the complete product release gate.

## Public documentation publication — 2026-10-30

- Public Site: https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/
- Saved/published version:
  `appgprj_6acc036de8cc8191a823339566972d85~appgver_a265d974a0cc8191b4bfd079767f8624`
- Deployment: `appgdep_6ae4cc6dfba48191984d011a62d11de8`
- Sites source mirror commit: `f90ebd07e1055b461b26478807b69497c0450af2`
- Canonical content snapshot: `b74fc1e5da6c58588a6ab9c598bd627f85c1636d`
- D1/R2: not provisioned.
- Runtime: existing Astro/React application remains; no application, package,
  resource, schema, or security-policy changes were included in v56. The Site
  version publishes canonical decision, product inventory, hardening, and
  deployment documentation.

## Deployed smoke evidence

Playwright checked Home, Compose, Workbench, Decisions, Current Product
Inventory, and Product Hardening at 1440×900 and 390×844 (12 route/viewport
checks). All 12 had HTTP 200, no horizontal overflow, no console errors or
warnings, no uncaught exceptions, and no failed requests. Compose reported
`Catalogue ready`; Workbench hydrated the existing Employee Experience sample.
The two inspected page captures are:

- Desktop: `quality/evidence/step-48/sites-v56-targeted-smoke-2026-10-30/desktop-1440x900-product-hardening.png`
- Mobile: `quality/evidence/step-48/sites-v56-targeted-smoke-2026-10-30/mobile-390x844-product-hardening.png`
- Machine record: `quality/evidence/step-48/sites-v56-targeted-smoke-2026-10-30/runtime-smoke.json`

The full public v56 copy/resource browser suite separately passed 113 cases
with 9 configured skips and zero unexpected failures. Details and report:
`quality/STEP_39_EVIDENCE.md` and
`quality/evidence/step-39/public-v56-copy-2026-10-30/runner/report.json`.

Chrome DevTools lab traces on the unchanged public application measured desktop
homepage LCP 365 ms, CLS 0.00, TTFB 82 ms, and mobile LCP 969 ms, CLS 0.00,
TTFB 74 ms (mobile profile: 4× CPU, Fast 4G, reduced motion). Each trace
observed 26/26 successful requests and no console messages. INP and field CrUX
data are unavailable. These measurements are single-run lab samples and do not
represent the whole Site's field performance.

## Release boundary

The v55 full deployed product re-audit remains the latest complete application
audit. The v56 result is a docs-only publication plus targeted route and copy
checks; it does not close unrelated ledger entries. The PR still must satisfy
the protected `main` branch's exact-head checks and all remaining documented
release gates. Do not mark Step 48 complete before protected merge and final
release verification. The public Site remains public, with browser-local guest
flows; no paid infrastructure was introduced.

Sites metadata included a bypass bearer field in a read-only response during
verification. The owner had previously authorized rotation; the token was
rotated immediately, was not used, and the replacement was not recorded in the
repository or logs.


## Review defect reproduction and local remediation — 2026-10-30

The public v56 Site reproduced two user-visible defects before the fixes were applied to the local source. All browser data remained in isolated guest contexts. The evidence directory contains before screenshots, Playwright contexts, traces, and a machine-readable report:

- `quality/evidence/step-48/pre-fix-v56/locked-page-was-deleted.png`: Pages deleted Settings & Policies after its Settings form was locked.
- `quality/evidence/step-48/pre-fix-v56/content-history-undo-remains-stale.png`: Undo restored the project value but left the edited row visible in the Content JSON field.
- `quality/evidence/step-48/pre-fix-v56-playwright.json`: both deployed cases failed their expected-state assertions.

Seven additional review findings were reproduced in focused pre-fix unit/integration tests. The regressions now pass after the fixes:

| Finding | Root cause fixed | Regression coverage |
|---|---|---|
| AUD-378 | Stale synchronous recovery journal survived a newer IndexedDB write after quota failure. | `browser-session.test.ts` |
| AUD-379 | Shared active-project corruption leaked into project-specific loads. | `browser-session.test.ts` |
| AUD-380 | Node Visual Mode eagerly wrote descendant variants that reset did not remove. | `dna-hierarchy.test.ts` |
| AUD-381 | Page deletion bypassed validated mutation and left secondary navigation references. | `workbench-store.test.ts` |
| AUD-382 | Page deletion bypassed subtree lock validation. | Store and visible Playwright regression |
| AUD-383 | Structured content draft did not sync when Undo/Redo changed committed data. | Desktop/mobile visible Playwright regression |
| AUD-384/AUD-385 | Next.js export accessed browser state during SSR and omitted shared layout CSS. | Exporter regression |
| AUD-386 | API update wrote unvalidated revision summaries. | D1 integration regression |
| AUD-387 | Manifest-inherited project name/description bypassed stored metadata limits. | D1 create/update regression |
| AUD-388 | Journal quota failure prevented durable checkpoint writes. | Checkpoint persistence regression |
| AUD-389 | Top-navigation Surprise Me flattened locked content containers. | Deterministic mutation regression |

The complete local gates at the v56 checkpoint are recorded in `quality/STEP_47_EVIDENCE.md`. The targeted v57 audit and latest local gates are recorded below. The wider hardening programme remains incomplete. The static review Site has no D1/R2 bindings; Next.js export and authenticated cloud API are not Site runtime features, so their regression protection is the exporter and D1 integration suite. No security policy or persistence boundary was weakened.

## Public v57 targeted audit and local remediation — 2026-10-30

The public v57 Site was tested in an isolated guest browser at desktop 1440×900 and mobile 390×844. The exact employee-experience brief reached a ready catalogue, generated three directions, and opened Direction C in Workbench. All five modes were opened. The UI flow exercised a summary lock, recomposition, semantic Gold replacement, Surprise Me, and Undo/Redo. The mobile Workbench had no horizontal overflow; its requests and browser console were clean. This targeted audit is not a repeat of the full v55 route sweep.

Before screenshots and machine evidence:

- Workbench desktop showing the erroneous archetype and percentage: `quality/evidence/step-48/deployed-v57-2026-10-30/before-aud390-391-workbench-1440x900.png`.
- Compose directions: `quality/evidence/step-48/deployed-v57-2026-10-30/compose-directions-1440x900.png`.
- Workbench mobile: `quality/evidence/step-48/deployed-v57-2026-10-30/workbench-390x844.png`.
- Browser journey and route observations: `quality/evidence/step-48/deployed-v57-2026-10-30/runtime-smoke.json`.

This run reproduced AUD-390 (employee experience labelled Recruitment with recruitment-only hard constraints) and AUD-391 (100 displayed as 10000%). Their regressions failed before the fixes and pass after them. Full-root unit tests also exposed AUD-392: a clean standalone export install resolved `tslib@2.9.1`, whose npm tarball returned 404. The exporter now pins the verified 2.8.1 package when Motion is included. The same clean generated export now installs, builds, and passes its Chromium interaction/runtime assertions. Failure and corrected run evidence is in `export-registry-failure.json`.

### Latest local quality results — 2026-10-31

The updated employee-experience taxonomy and homepage manifest example pass the local quality gates:

- `pnpm install --frozen-lockfile` and `pnpm build:catalog`: pass; 324 resources, 40 Gold.
- `pnpm typecheck` and `pnpm lint`: pass.
- `pnpm test`: 1,238 passed, 1 configured skip, 0 failures.
- `pnpm audit:all`: 16/16 behavioural release checks; 324/324 resource-isolation checks; 733 Astro pages built; bundle budgets passed; 324/324 licence/provenance checks; 0 security violations; no known dependency vulnerabilities.
- The independent employee React export regression completed clean install, production build, and Chromium interaction/runtime checks outside the repository dependency tree.
- Browser project reruns: root desktop/mobile Chromium 359 passed / 121 configured skips; Sites desktop Chromium 188 / 6; Sites mobile Chromium 154 / 40; preview app 3 / 0. Across the completed project runs: 704 passed, 167 configured skips, and no remaining failures.

One Sites desktop large-Workbench startup assertion timed out during the first chained E2E invocation. The exact 30-screen case passed on its isolated rerun in 2.3 seconds and passed again inside the complete 194-test desktop Sites rerun. The full desktop, mobile and preview-app project reruns completed cleanly; this isolated timeout did not reproduce.

Exact command results are summarized in `quality/evidence/step-48/local-quality-2026-10-31/verification-summary.json`. Public v58 issue-specific verification and exact-head GitHub CI remain pending. AUD-390, AUD-391 and AUD-393 remain open until the same visible checks pass on the newly published Site; AUD-392 is locally verified through the independent exporter runtime test and awaits exact-head CI for ledger closure. The review Site has no D1/R2 bindings, and no paid infrastructure was introduced.

### Fresh dependency advisory remediation — 2026-10-31

The exact PR head `bb064ce4c327e4777b84ef1ff4d8c333774358db` failed the fresh `pnpm audit:all` step after the registry published moderate advisories for `minimatch` below 11.0.1 and `glob` through 14.0.1. Local reproduction confirmed both findings. The direct `glob` ranges in CLI, ingestion, and linter now target 14.0.2+, and the workspace overrides transitive `minimatch` versions below 11.0.1 to 11.0.1. The patched releases retain the documented Node engine support range. Frozen install, 93 focused CLI/ingest/linter tests, all 1,238 unit/integration tests (one configured skip), typecheck, lint, and `pnpm audit:all` now pass. The fresh dependency audit reports no known vulnerabilities. Details and command evidence are in [`dependency-audit-2026-10-31.json`](evidence/step-48/security/dependency-audit-2026-10-31.json). Exact-head CI and public v58 verification remain pending.

## Public Sites v64 targeted hardening verification — 2026-10-31

Public v64 serves application code captured from canonical commit 248a2a09c84a0734998850f8f3b85a14ddf3b78c via Sites source mirror 8aca504b5d4231509bfd4d90d13aec949e979f58. The public URL and exact version/deployment IDs are in audit/evidence/deployed-v64-2026-10-31/deployed-smoke.json.

Four High findings are now closed as closed-deployed-verified after same-version desktop/mobile browser checks: AUD-378 (quota-failed journal recovery), AUD-381 (secondary navigation cleanup after deletion), AUD-382 (locked-descendant delete protection), and AUD-392 (independent React ZIP install/build/browser fidelity). Each check used visible Workbench UI and downloaded manifests. Evidence includes screenshots and manifest exports in audit/evidence/deployed-v64-2026-10-31/page-deletion/ and flagship/. The flagship employee brief passed at 1440×900 and 390×844; the standalone ZIP from the desktop run was installed and built outside repository dependencies and browsed at both widths.

A live Axe sweep covered Home, Explore, Compose, Workbench, representative AI Empty State, and the generated employee Workbench at desktop and mobile; all twelve scans reported zero WCAG 2.2 A/AA violations. AxeBuilder stylesheet injection was blocked by the Site CSP and its messages were separated from page runtime: the same routes in a no-Axe run, plus the flagship UI journey, had zero console messages, warnings, uncaught exceptions, failed requests, or HTTP errors. The Site CSP was unchanged. Homepage DevTools traces measured LCP 570 ms at desktop and 749 ms at mobile, CLS 0; INP and field data were unavailable.

The ledger now records 406 findings (0 Critical, 79 High, 303 Medium, 24 Low): 226 deployed-verified, 111 awaiting issue-specific deployed checks, 57 locally verified, 9 other closed, 2 legacy fixed, and 1 documented host limitation. AUD-387 remains fixed-local-verified because it belongs to the D1 API and Sites v64 has no D1/R2 bindings. Step 39 all-resource manual copy review, the broader final release gate, and the human usability study (owner-waived, not passed) remain incomplete. No infrastructure was provisioned and no paid services were added.


## Public Sites v71 baseline before v72 — 2026-11-01

This section records the pre-v72 review Site. At that point, v71 served canonical source 7ac7783de83e175ac410055da736b2218e2ba213 through Sites mirror 0bce228a4fbd5fedad02a3186cd6af62690d8405 (version appgprj_6acc036de8cc8191a823339566972d85~appgver_868c6bee9ec4819194495b52cc426e79). The exact-head CI and 16-point behavioral gate passed at that source; PR #8 remains unmerged.

The complete requested 31-route public shell was audited at 1440x900 and 390x844 (62/62 route classifications PASS). There were zero HTTP failures, console errors, uncaught exceptions, failed requests, bad responses, navigation aborts, horizontal overflow, screenshot instrumentation warnings, Axe violations, or unsupported-ARIA incomplete results. Twelve route Axe scans had 11 color-contrast incomplete results because the scanner cannot parse some CSS Color 4 values. The employee product received two additional Axe scans: zero violations; Axe-incomplete contrast nodes were manually calculated (23 desktop, 9 mobile), with zero AA failures and zero unverified nodes.

The exact employee-experience brief passed the visible Compose-to-Direction-C-to-Workbench workflow at desktop and mobile, with locks preserved through recomposition and Surprise Me, replacement, undo/redo, responsive preview, manifest export, and React ZIP export. The desktop ZIP was independently clean-installed, built and browsed at desktop and mobile viewports. The mobile profile also exported a ZIP; a second clean install was not repeated. AUD-443 passed a deployed hostile prop-name import/export check on both viewports. AUD-445, AUD-446 and AUD-447 passed issue-specific deployed verification on v71. Full route screenshots and machine reports are under quality/evidence/step-48/public-v71-live-audit-2026-11-01/.

A local host check found the laptop API and worker containers running but unhealthy. Restarting the existing API and then its dependent host restored the API health endpoint, both Docker health checks, and a fresh heartbeat without rebuilding or touching MGI containers. The initiating API failure is unknown and recorded open as AUD-448. The public Site backend remains intentionally unavailable because its backend URL is unconfigured; no provider credential was supplied. D1/R2 are unprovisioned and no security policy was weakened.

The ledger contains 453 findings: 0 Critical, 86 High, 341 Medium, and 26 Low. AUD-419 remains High and fixed locally: a new cross-boundary test covers Sites gateway → Hono API → stubbed provider, and a negative control fails when the gateway drops provider headers. Public v72 serves the fix but remains intentionally unconfigured for laptop access under D-041; no tunnel or real provider credential was used, so deployed provider forwarding remains unverified. AUD-448 remains an open Medium pending root-cause investigation. AUD-449 was reproduced on public v71 and is now closed after the same behavior passed on v72. AUD-450 and AUD-451 were reproduced on public v72 and fixed locally; their deployed verification is pending. AUD-452 is now confirmed as a cold-load CLS defect, fixed locally and awaiting deployed verification. The local keyboard/touch regression also passes at 360, 390, 430, 768, 1024, 1280 and 1440px. Step 48 and the broader hardening programme remain open; see audit/RUNTIME_AUDIT.md and docs/PRODUCT_HARDENING.md.

## Public Sites v72 deployed AUD-449 verification — 2026-11-01

Version 72 is live at the existing public review URL. It serves canonical commit `b5f9f1ea9a884c544f3f7c8862655a69648e6464` through Sites mirror commit `95cf423eac1f30d22e3aaf8dba3d29d08cb53f57`; exact-head CI run 41353416916 passed. The browser re-audit confirmed `/resources/minimal-top-nav/` returned HTTP 200 at desktop 1440x900 and touch mobile 390x844. Desktop links remain inline; the mobile menu opens by pointer or Enter, reveals Overview/People/Settings, and Escape closes it and restores focus. Document width matched the 390px viewport; no overflow was observed. Lighthouse mobile Accessibility and Best Practices both scored 100. A fresh reload had zero Tessellate errors, uncaught exceptions, failed requests or HTTP errors. Cloudflare challenge deprecation notices and the Lighthouse-only opaque-iframe postMessage warning are attributed in the machine report. LCP was 243ms, CLS 0 and TTFB 50ms. DevTools returned desktop/mobile captures inline but denied local screenshot paths; both were visually inspected. Machine-readable evidence: `quality/evidence/step-48/aud449-minimal-top-nav/deployed-v72-browser-evidence.json` and `deployed-v72-performance.json`. AUD-449 is closed after this deployed verification; the overall audit remains open.

## AUD-419 Sites-to-API provider-header revalidation — 2026-11-01

The focused integration test runs the actual `proxyBackend` gateway, the API Hono proxy route, and a stubbed Anthropic transport. It verifies the provider auth/version headers reach the allowlisted provider, while unrelated headers and the internal gateway secret do not. The test passes; temporarily disabling the gateway allowlist forwarding makes it fail because the provider receives no auth header. Evidence: `quality/evidence/step-48/aud419-sites-api-cross-boundary.json`. This uses only a synthetic test credential and makes no external provider request. Public v72 `/api/inference/health` returns HTTP 200 with the laptop backend offline because the server-side URL is not configured; D-041 prohibits a new tunnel. The deployed provider path therefore remains unverified. AUD-419 stays `fixed-local-verified`, not deployed-closed.

## Generated showcase manifest synchronization — 2026-11-01

The prescribed catalogue build refreshed the checked-in Site and preview manifests for seven showcases. Each now matches canonical composer output, including the `collapsible-sidebar` navigation resource. The showcase consistency regression and all 1,277 unit tests passed after generation; `audit:all` also passed 16/16 release criteria, the 733-page production build, bundle budgets, 324-resource licence/provenance checks, security/secret checks, and dependency audit. The earlier test failure came from running Vitest before the documented `pnpm build:catalog` step. Volatile generation timestamps were excluded. Evidence: `quality/evidence/step-48/showcase-manifest-sync.json`.

## Public Sites v72 settled route and flagship re-audit — 2026-11-02

The public v72 Site was rechecked without changing or redeploying it. A corrected
settled route runner visited all 31 requested routes at 1440×900 and 390×844.
All 62 pages returned HTTP 200 with nonempty page content; both viewports had
zero overflow, console errors/warnings, uncaught exceptions, failed requests,
bad responses, or navigation cancellations. The runner waits for client
catalogue results and network idle before capturing. Its 12 route Axe scans
reported zero violations; 5 desktop and 6 mobile `color-contrast` results remain
incomplete for manual review. Reports and settled screenshots are in
`quality/evidence/step-48/public-v72-live-audit-2026-11-02/routes/`.

The exact employee-experience brief passed the actual UI journey at desktop and
mobile. Direction C opened the matching seven-screen project. Overrides,
resource replacement, the locked dashboard summary, recomposition, Surprise
Me, exact Undo/Redo, preview, manifest export and ZIP export completed. The
desktop ZIP was installed and built outside the repository and exercised in a
browser at desktop and mobile sizes. The separate generated Workbench Axe scan
reported zero violations at both sizes. Compose and Workbench remained usable
without overflow at 360, 390, 430, 768, 1024, 1280, 1440 and 1536 pixels; the
mobile Pages and Preview tabs changed state. Browser, uncaught-exception and
network-error counts were zero throughout. Full results, screenshots, ZIPs,
and runners are in the linked evidence directory’s `flagship/` folder.

Two audit-harness timing issues were corrected in the evidence runner: a
Compose probe searched for letter-named directions although the UI renders
01/02/03, and the first route sweep captured catalogue skeletons before
hydration. The visible UI composed all three directions, and the settled route
run loaded `/sections` (50/72 resources) and `/data` (35/35) in under one
second. Neither was a product defect. Axe contrast-incomplete results remain
unadjudicated; this checkpoint does not complete WCAG manual review or Step 48.

Exact-head GitHub CI run
[41363451182](https://github.com/danishgm-sketch/Tessellate/actions/runs/41363451182)
was still in progress on PR #8 head `81695b52d659ad46561f4c1570de48af185c23c5`
when this evidence was captured. The PR remains open and the public Site is
unchanged. No D1/R2 binding or infrastructure was provisioned.

## AUD-448 bounded laptop Docker recovery — 2026-11-01

The initiating failure from the original unhealthy API incident remains unknown. A deterministic Docker control established the actionable recovery defect: a long-running container with a failing healthcheck remains running/unhealthy under `restart: unless-stopped` (restart count 0). The Compose healthcheck now runs a source-controlled Node probe. After its startup grace and six consecutive failures, the probe records a restart attempt in the existing `/data` volume and sends SIGTERM only to its own container's PID 1. It allows no more than three recovery attempts per rolling hour; if the persistent budget cannot be verified or has been exhausted, the API stays unhealthy so host features remain unavailable.

Five unit regressions cover consecutive failures, health recovery, startup grace, the persistent attempt limit, and malformed budget state. The disposable Docker integration uses the local API image and the actual healthcheck source; its endpoint returns 503 on boot one, the container restarts once, and boot two returns healthy. The test binds no host port, mounts no secrets, and cleans up only its generated test container and temporary directory. Evidence: `quality/evidence/step-37/aud448-docker-recovery.mjs` and `quality/evidence/step-37/aud448-docker-recovery.json`. This does not identify the original Wrangler failure and does not verify permanent Sites-to-laptop connectivity.

## Public v72 mobile Workbench label and interaction follow-up — 2026-11-02

The mobile Workbench Lighthouse audit exposed two deployed v72 defects that the broad route and flagship journey did not exercise: the visible `Menu` label was missing from the accessible name (AUD-450), and tapping the menu selected its parent canvas node, switched to Inspect, and unmounted the preview (AUD-451). Before screenshots and failing public regressions are in `quality/evidence/step-48/public-v72-live-audit-2026-11-02/flagship/`. Source corrections now include the visible word in the accessible name and let semantic interactive descendants receive their own click events. The targeted Sites Worker suite passes 6 tests with 2 configured desktop-profile skips; the delayed Gold-load regression records CLS 0.01754 on first load and reload under both profiles. The clean-install standalone export regression passes, the full unit suite passes 1,282 tests with 1 configured skip, all 22 workspace typechecks pass, lint passes with zero warnings, the 734-page production/Sites build passes, and the mobile Workbench Axe regression passes. Logs are in the same `flagship/` evidence directory. Both issues remain `fixed-local-verified`; the public Site has not changed.

Three Lighthouse mobile Agentic Browsing audits report CLS 0.502–0.503. The five earlier DevTools traces were warm/cached or captured before the late resource expansion; a new cache-bypass cold trace on public v72 at 412x823, DPR 1.75, 4x CPU and Fast 4G measured CLS 0.5028 and attributed the movement to four semantic resource wrappers. The active screen's five Gold chunks load behind the Workbench shell and manifest renderer. Machine trace findings and the earlier runs are recorded in quality/evidence/step-48/public-v72-live-audit-2026-11-02/flagship/workbench-cls-investigation.json. Local regression evidence reproduces the failure with 1.8-second delayed chunks and passes after a fresh production build: CLS 0.00 on first load and reload, with no console or network errors.

PR #8's two exact-head CI runs (41363451182 and 41363467212) and Component Quality Gate (41363467170) now pass on existing PR head `81695b52d659ad46561f4c1570de48af185c23c5`. That head predates this local fix; the PR remains open. The public v72 Site, D1/R2 configuration and infrastructure are unchanged.

### Local remediation and full browser-profile reruns — 2026-11-02

The first full local E2E pass exposed two stale assumptions in desktop tests: they clicked the centre of a rendered resource and expected the editor to select it even when that point was an interactive child, and one test then expected the Library panel while Layers was open. These tests now select through the visible Layers tree and return to Library before checking results. The renderer keeps interactive descendants' events intact.

The same full browser profiles were rerun after the corrections: default desktop/mobile Chromium 394 passed / 130 configured skips; Sites Worker desktop 206 / 8; Sites Worker mobile 172 / 42; standalone preview app 3 / 0. No failures remained. The documentation-index test was also run separately in desktop/mobile Astro and Sites profiles (4 additional passes); the internal progress route returned 404 in each profile. Aggregate complete profile runs: 775 passed, 180 configured skips, 0 failures, plus the four targeted docs-index checks. Logs are `workbench-mobile-e2e-remediated.log`, `workbench-mobile-e2e-sites-chromium-remediated.log`, `workbench-mobile-e2e-sites-mobile-remediated.log`, and `workbench-mobile-e2e-preview-app-remediated.log` under `quality/evidence/step-48/public-v72-live-audit-2026-11-02/flagship/`.

The new AUD-453 documents the internal progress ledger appearing as a 17th docs link in the pre-fix build. `apps/site/src/lib/documentation.ts` excludes the internal ledger, and the source document no longer contains an absolute local worktree path. The index stays at 16 canonical links; the ledger route is not built. Post-fix desktop, mobile, Sites desktop and Sites mobile screenshots/reports are in `audit/evidence/step-48/internal-doc-publication/`. This fix is only locally verified because public v72 has not changed.

The fresh 733-page production build, all 22 workspace typechecks, lint (zero warnings), all 1,282 unit tests (one configured skip), and `pnpm audit:all` now pass after the docs-index test was extended to save screenshots. The audit gate reports 16/16 behavioral checks, 324/324 resource-isolation checks, 324/324 licence/provenance checks, passing bundle budgets, zero security violations and no known dependency vulnerabilities. Logs are `workbench-mobile-unit-remediated.log` and `workbench-mobile-audit-all-remediated.log` in the flagship evidence directory. Public v72 and the laptop/D1/R2 infrastructure remain unchanged; AUD-450, AUD-451 and AUD-453 await deployed verification. AUD-452 is locally fixed but remains open until the same cold-load test passes on a new review deployment.


### AUD-452 local remediation — 2026-11-02

After a fresh Sites production build, the cold mobile Workbench regression passed on first load and reload with CLS 0.00. Five Gold chunks were delayed by 1.8 seconds under 4x CPU emulation; the stable mobile preload status remained visible until the active screen was ready, then the employee experience rendered. A partial-failure case then aborted `editorial-hero` and delayed the other four Gold chunks. Before the root-cause correction, the regression failed at CLS 0.502772 because the first rejected import released the screen gate while other chunks remained pending. The hook now waits for all deduplicated per-resource imports to settle. After the fix, the same injected case measured CLS 0.00, retained the explicit failed-resource message and had no uncaught exception; the single failed request and browser import error were expected fault-injection evidence. The test log records the red result, and the machine report plus before/after screenshots are in `audit/evidence/step-48/aud452-mobile-cold-resource-load/`. Four related mobile Workbench browser tests and 10 Workbench UI unit tests pass. Normal cold/reload runs recorded zero console errors or warnings, uncaught exceptions, failed requests or HTTP errors. The initial post-source-change run still failed at CLS 0.5028 because the test server was serving a stale generated Sites artifact; only the rebuilt artifact is valid post-fix evidence. This remains a local fix; public v72 is unchanged.
