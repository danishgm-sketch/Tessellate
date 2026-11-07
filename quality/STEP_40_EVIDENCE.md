# Step 40 — Visual refinement evidence

Step 40 has passed its local visual review. It records the route-level presentation audit and three evidence-backed fixes: the mobile homepage brief, the documentation index, and misleading sample activity. The review-stage Site has not been updated, so these changes remain pending deployed verification; no issue here is marked deployed-closed.

## Scope and capture method

The built Sites Worker at `http://127.0.0.1:4323` was used as a real browser user at 1440×900 and 390×844. The harness captured viewport and full-page screenshots plus route status, title, heading, body-text length, horizontal overflow, console errors and warnings, uncaught page errors, failed requests, and HTTP errors.

| Evidence | Result |
| --- | --- |
| Public route presentations | 33 routes, each at desktop and mobile |
| Captures | 66 total; all HTTP 200 |
| Presentation classification | 33 PASS, 0 DEGRADED |
| Runtime/network telemetry | 0 console errors, 0 material warnings, 0 uncaught errors, 0 failed requests, 0 HTTP errors |
| Horizontal overflow | 0 routes at either captured width |

[`route-review.json`](evidence/step-40/after/all-routes/route-review.json) holds machine-readable classifications and per-viewport evidence. Its scope is route presentation only: a `PASS` does not claim every route-specific control or full workflow was exercised. [`visual-audit.json`](evidence/step-40/after/all-routes/visual-audit.json) is the raw capture record. The 12 desktop/mobile contact sheets are in [`contact-sheets/`](evidence/step-40/after/contact-sheets/); individual viewport and full-page captures are in [`all-routes/`](evidence/step-40/after/all-routes/).

The authored comparison references are `design/reference-home.svg`, `design/reference-workbench.svg`, and `design/REFERENCE_DIRECTIONS.md`. The captured shell retains the restrained editorial typography and neutral surfaces, blue action accent, and dark Workbench editing surface. The route contact sheets and full captures were inspected; no additional presentation defect was found in this local pass beyond the findings below. At 390px, Workbench panels and toolbar remain compact and readable, but this capture does not substitute for the dedicated multi-breakpoint interaction audit.

## AUD-306 — Mobile homepage composer below the fold

The design system sets an approximate 80–90svh ceiling for the homepage hero and explicitly rejects a 150vh hero (`docs/DESIGN_SYSTEM.md`, line 584). Before the fix, the hero measured 1,306.78px at 390×844 (154.8% of the viewport), and the Compose button ended at y=1,000.28, below the first screen. The regression failed in both mobile-capable Sites Chromium projects at the 759.6px limit.

The cause was desktop heading and spacing at the narrow breakpoint, wrapping preset chips, a three-row brief field, stacked Feel/ambition/structure controls, and a duplicate settings summary. The fix keeps the brief and Compose action in the first screen, makes presets horizontally scrollable, moves advanced settings into a native disclosure on narrow screens, and hides the redundant summary below `xl`.

After the fix, the same built Sites Worker measured a 658.53px hero (78.0% of the viewport); Compose ends at y=665.53. Opening “Feel, ambition and structure” exposes all three labeled controls. The regression is `tests/e2e/home-visual-rhythm-step-40.spec.ts`; evidence is in [`home-mobile-regression-green.log`](evidence/step-40/after/home-mobile-regression-green.log) and [`home-mobile-layout-measurement.json`](evidence/step-40/after/home-mobile-layout-measurement.json). Before/after screenshots are [`before/home-mobile-viewport.png`](evidence/step-40/before/home-mobile-viewport.png) and [`after/all-routes/home-mobile-viewport.png`](evidence/step-40/after/all-routes/home-mobile-viewport.png).

## AUD-307 — Vulnerable transitive body-parser dependency

The MCP SDK's Express dependency graph resolved affected `body-parser@2.3.0`, causing the dependency audit to fail. The workspace now pins the compatible 2.x package to patched `2.4.0` in `pnpm-workspace.yaml` and the lockfile. The Node HTTP SSE server does not use Express, but the vulnerable installed package still needed correction. The MCP client/SSE workflow passes 7/7 after the override, and `pnpm audit:all` reports no known vulnerabilities. Before/after dependency evidence is [`body-parser-audit.json`](evidence/step-40/body-parser-audit.json). See [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828).

## AUD-308 — Documentation index omitted canonical guides

Before the fix, `/docs` showed only its hard-coded Registry guide even though its introduction promised repository contracts and operating guides. The Markdown glob in `apps/site/src/lib/documentation.ts` walked five levels above the repository root. Correcting it to four levels makes all 15 canonical Markdown guides available alongside the Registry guide.

The red-to-green regression is `tests/e2e/documentation-index-step-40.spec.ts`: before the fix it found one link; after the fix it finds 16 on desktop and mobile. `/docs/product-spec` returns HTTP 200. After screenshots are [`docs-desktop-viewport.png`](evidence/step-40/after/all-routes/docs-desktop-viewport.png) and [`docs-mobile-viewport.png`](evidence/step-40/after/all-routes/docs-mobile-viewport.png); the original index captures are in `quality/evidence/step-40/before/`.

## AUD-309 — Activity Feed presented invented entries as live activity

The default `/blocks` preview showed fabricated named people and events, including a completion count, revision, and pull-request number, without saying they were sample data. The resource accepts no live event data, so its appearance implied functionality it did not have.

The resource now visibly labels the entries “Sample activity,” uses generic example roles, removes invented operational identifiers and counts, and documents that the feed is static in its manifest and README. `tests/resource-demo-truth.test.ts` failed before the change and passes afterward; `tests/e2e/activity-feed-sample-disclosure-step-40.spec.ts` passes on desktop and mobile in the Sites Worker with zero browser errors or failed requests. Before screenshots are in `quality/evidence/step-40/before/blocks-activity-feed-{desktop,mobile}-viewport.png`; after captures are [`desktop`](evidence/step-40/after/all-routes/resource-activity-feed-desktop-viewport.png) and [`mobile`](evidence/step-40/after/all-routes/resource-activity-feed-mobile-viewport.png).

## Validation

- Final `pnpm test:e2e` after the Activity Feed patch and harness correction: 509 passed, 144 configured skips, 0 failed across Astro, Sites Worker, and isolated preview. It includes desktop/mobile docs-index coverage, the flagship Compose-to-Workbench journey, all 324 resource browser certification, Gold accessibility/state matrices, responsive coverage, preview isolation/CSP, the Activity Feed disclosure in both Sites Worker profiles, and standalone preview checks. The exact result is [`e2e-activity-feed-final-summary.json`](evidence/step-40/e2e-activity-feed-final-summary.json); full output is [`e2e-activity-feed-final.log`](evidence/step-40/e2e-activity-feed-final.log).
- The first aggregate run after AUD-309 failed only because the new opaque-origin Activity Feed preview test was also collected by plain Astro, which does not provide the Sites Worker CORS policy. `playwright.config.ts` now excludes that test from plain Astro; it remains in the Sites Worker config, where the real sandbox/CORS path passes on desktop and mobile. No product CORS or sandbox policy was weakened.
- After the Activity Feed patch: `pnpm test` passed 1,213 tests across 77 files; its focused desktop/mobile Sites Worker browser regression passed 2/2, then the full aggregate rerun passed 509/144/0.
- After the final source change: `pnpm typecheck` passed all 22 workspace packages, `pnpm lint` passed, and `pnpm audit:all` passed.
- The final release audit records 16/16 behavioral gates, resource isolation 324/324, the 733-page Astro build and Sites artifact, bundle budgets, 324/324 licence/provenance records, zero security/secret violations, and no known dependency vulnerabilities. Logs are under `quality/evidence/step-40/`.
- A frozen dependency install passed after the body-parser override. After the final source change and Playwright harness correction, `pnpm exec eslint playwright.config.ts` and `git diff --check` pass.
- Homepage gzip is 99.55KB; Explore 175.60KB; Compose 270.43KB; Workbench 492.32KB; search index 112.52KB. Each is within its configured budget.

The production-review Site has not been updated. Local captures and local test results do not verify the deployed runtime; the fixes remain pending the release-candidate deployment and deployed re-audit.
