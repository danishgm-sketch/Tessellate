# Step 38 — Performance baseline

Status: **Step 38 performance gates are complete for the recorded local workloads and deployed v30 traces. AUD-343 remains a medium synthetic mobile LCP watch; field Web Vitals data is unavailable.**

## Scope and method

Measured cold route loads for `/`, `/explore`, `/compose`, and `/workbench` in the
local ChatGPT Sites compatibility Worker at 1440×900 and 390×844. Each route ran
in a fresh browser context, so cached assets from a previously visited route do
not reduce its transfer measurement. Playwright Chromium ran on the laptop without
CPU or network throttling. LCP and CLS are lab measurements, not field Web
Vitals. Chrome DevTools 156 cold traces were subsequently captured at 1440×900
and true 390×844 mobile emulation, plus a 500×844 narrow desktop window. These
ran at 1× CPU with no network throttling; CrUX field data is unavailable and
navigation-only traces do not provide INP. Explore, Compose, Direction C handoff,
Recompose and standalone ZIP export were timed through visible UI controls.
Evidence is in `quality/evidence/step-38/`.

## Route budgets and measured results

`pnpm audit:budgets` now traverses eager route entry points and their static
imports, fails on absent routes/chunks, and checks the built catalogue. This
replaces filename substring matching that could skip an unmeasured route.

| Route | Gzip budget | Measured eager bundle | Cold browser JS transfer | Ready time desktop / mobile |
| --- | ---: | ---: | ---: | ---: |
| Home | 150 KiB | 99.09 KiB | 111,019 B | 307 / 366 ms |
| Explore | 200 KiB | 149.98 KiB | 161,679 B | 532 / 635 ms |
| Compose | 750 KiB | 244.75 KiB | 256,329 B | 457 / 517 ms |
| Workbench | 750 KiB | 466.22 KiB | 489,710 B | 1,035 / 1,142 ms |
| Catalogue JSON | 2,048 KiB | 112.13 KiB gzip | 145,102 B response transfer; 2,142,756 B decoded | Loaded on Explore and Compose |

The cold JavaScript transfer column is the top document's
`PerformanceResourceTiming` total. Explore also mounts isolated preview iframes;
their script responses are recorded separately and included in the all-frame
figures for AUD-266 below. The app bundle budget remains the top-document eager
bundle budget.

The homepage's cold JavaScript transfer fell from 202,356 B to 106,329 B
(47.5%). Removing its duplicate client-side product interpreter eliminated the
355-request cascade previously triggered by editing the homepage brief. The
homepage now transfers the brief and selected controls to Compose via
`sessionStorage`; Compose validates that handoff and still runs the canonical
composition engine. The stack label is static and truthful rather than an unused
selector.

The latest route LCP samples ranged from 80–440 ms on desktop and 64–428 ms on
mobile; CLS was 0–0.03 on desktop and 0 on mobile. Search plus the first real
onboarding preview completed in 697 ms desktop / 461 ms mobile. Three direction
previews completed in 101 / 116 ms, Direction C Workbench became ready in
279 / 351 ms, visible Recompose feedback appeared in 66 / 31 ms, and standalone
ZIP download was ready in 249 / 204 ms (40,712 / 40,713 bytes). These are
unthrottled lab runs, not guaranteed user-device timings.

All four cold route tests passed the 10-second ready budget in Chromium. The
Chromium real-workload tests passed their route-specific 5–15 second ceilings.
Their browser records had no uncaught exceptions, console errors, actual failed
requests, HTTP errors, browser cancellations or document-width overflow. The
constrained-network run separately records nine preview-frame cancellations
when the user filters away resources; those are expected unmounts, not failed
requests. The Chromium run loaded the 324-resource catalogue on Explore and
Compose. See `quality/evidence/step-38/after/sites-worker/` for route metrics,
interaction metrics and screenshots.

## Constrained-network and large-project workload

The Explore route was also measured in Chromium with 150 ms network latency,
1.6 Mbps download, 750 Kbps upload, and 4× CPU slowdown. The latest isolated
rerun showed the 324-item catalogue in 4,038 ms; filtering to onboarding and
rendering the first real preview took 4,447 ms. The lab LCP sample was 704 ms
and CLS was 0.059. The
viewport remained 1,440 px wide, with no console errors, uncaught exceptions,
HTTP errors, or actual failed requests. Nine in-flight preview JavaScript
requests were cancelled when the user filtered away nonmatching cards; each came
from a `/preview/?resource=...` iframe and is recorded separately in
`constrained-4g.json`, not omitted from the network report. Screenshot:
`constrained-and-large/explore-slow-4g-cpu4.png`.

The same preview-ready measurement briefly reached 8,845 ms in an interrupted
long Sites Worker run after the 324-resource matrix. An isolated rerun passed
the existing 8,000 ms preview budget at 4,447 ms. The later complete
`pnpm test:e2e` run recorded 3,791 ms to show the catalogue and 3,745 ms to
render the first filtered preview, also within budget. Keep the earlier
slow observation as evidence of run-to-run variance; the successful complete
gate and isolated timing are both retained.

A local manifest derived from the current employee-experience showcase, expanded
to 30 screens, 1,830 nodes, and 355,470 bytes of compact JSON, was loaded from
browser storage. Through visible Workbench controls, it became ready in 953 ms,
switched to its final screen in 95 ms, exported its manifest in 221 ms, and
generated the standalone ZIP in 143 ms. The exported manifest retained all 30
screens and 1,830 nodes (681,238 bytes); the ZIP was 52,636 bytes. The selected
screen's domain copy was visible on the canvas. There
were no console errors, uncaught exceptions, failed requests, HTTP errors, or
horizontal overflow. See `workbench-large-project.json` and
`workbench-30-screens.png`.

These measurements establish a repeatable local baseline; they do not substitute
for long-session/history stress (Step 43) or real-user field Web Vitals. Public v30
deployed route and interaction measurements are now recorded below; CrUX data is
unavailable.

## WebKit CSP compatibility finding — fixed locally

The real multi-preview workflow exposed a strict-CSP console error on WebKit.
Evidence before and after the change is kept separately in
`quality/evidence/step-38/before/` and `quality/evidence/step-38/after/`.

- Reproduction: run the Sites Worker with WebKit, open `/explore`, search for
  `onboarding`, and wait for the visible resource previews to mount.
- Before: each mounted preview reported a `style-src-elem` violation with
  `blockedURI: inline`. The browser's `report-sample` diagnostic returned the
  exact sample `body {}`. No style element, application-side style insertion
  trace, or source file was present when the violation event fired, so the
  producer remains unidentified.
- Fix: the Sites artifact generator now adds the exact SHA-256 source for
  `body {}` to `style-src` and `style-src-elem`. This is an empty CSS rule with
  no visual effect. The change does not add `unsafe-inline`, and it leaves
  `script-src` and `style-src-attr` unchanged. The temporary `report-sample`
  diagnostic directive was removed before the passing verification run.
- After: complete Explore → Compose → Direction C → Workbench → Recompose → ZIP
  export workloads passed on WebKit at 1440×900 and 390×844. Both recorded zero
  CSP events, console errors, uncaught exceptions, failed requests, and HTTP
  errors. Eight additional WebKit CSP scenarios passed across the two viewports,
  including opaque-origin isolation and actual resource inline-style behavior.
- Regression: `performance-workloads-step-38.spec.ts` records the CSP sample,
  response policy, inline styles, insertion trace, browser errors, and screenshots
  before its clean-console assertions. `sites-preview-csp.spec.ts` verifies the
  exact empty-rule hash is allowed and that unrelated resource CSS remains
  hash-certified.

The CSP finding is fixed in the local Sites compatibility build; the source of
WebKit's sampled empty rule is still unknown. Firefox was rechecked after the
bundle change, but Playwright's `firefox-1543` executable failed with `spawn
UNKNOWN` before the route opened; no route screenshot or timing exists. The
machine record is `quality/evidence/step-38/after/firefox-launch-failure.json`.
Earlier direct launch diagnosed a Windows side-by-side configuration error.
Real Safari is not available on Windows; Playwright WebKit is recorded
separately and is not claimed as Safari coverage. The browser matrix and
deployed verification therefore remain incomplete. Playwright remains pinned at
1.63.0: the reported 1.64.0/1.64.1 WebKit 27.2 native `<select>` warning is a
separate issue ([upstream Playwright report](https://github.com/microsoft/playwright/issues/43497)).

## Defect found and fixed

**Medium — Explore resource previews were obscured on touch layouts.**

- Evidence: `quality/evidence/step-38/before/mobile-explore-preview-obscured-390.png`.
- Reproduction: open Explore at 390×844, search `onboarding`, and inspect the
  first rendered resource card. Before the fix its persistent touch overlay applied
  `backdrop-filter: blur(2px)` and dimmed the whole preview; its action buttons
  sat over the content.
- Root cause: the desktop hover overlay was also the always-visible mobile action
  surface, including its full-frame blur and tint.
- Fix: keep the actions visible on mobile in a compact, opaque bottom action bar;
  retain the full-frame blurred overlay only at the desktop hover/focus breakpoint.
- Regression: `site-route-performance-step-38.spec.ts` first failed on mobile
  because the computed preview backdrop filter was `blur(2px)`. After the fix the
  test verifies no mobile blur and that the action bar is under 80 CSS pixels.
- After: `quality/evidence/step-38/after/sites-worker/sites-mobile-chromium-explore.png`.

## Defect found and fixed — Compose loaded the full Workbench bundle

**Evidence:** The cold Compose browser previously transferred about 589 kB of
JavaScript in 39 resources (2.49 MB decoded). The failing browser regression
measured 588,984 bytes against a 450,000-byte budget. Before evidence is in
`quality/evidence/step-38/before/compose-workbench-bundle-isolation-sites-chromium.{png,json}`.

**Root cause:** `ComposeView` imported `saveLocalProject` from the public
`@tessellate/workbench` root. That root also re-exports WorkbenchShell, every
panel and modal, mutation engines and history, so Compose's static module graph
pulled in the editor before a user selected a direction.

**Fix:** Export the existing IndexedDB persistence implementation through the
narrow `@tessellate/workbench/persistence` subpath, and import only
`saveLocalProject` from Compose. No persistence behavior or architecture changed.

**After:** The same cold browser check passes on desktop and mobile at 349,756
JavaScript transfer bytes in 19 resources (1,387,940 bytes decoded), reducing
transfer by 40.6%. The eager Compose route budget fell from 561.55 KiB to
335.99 KiB gzip. The four-route browser matrix now reports zero console errors,
uncaught exceptions, failed requests or HTTP errors at both viewports. The real
Compose → Workbench → Recompose workload also passes on desktop and mobile.
After screenshots and machine reports are in
`quality/evidence/step-38/after/compose-workbench-bundle-isolation-sites-{chromium,mobile-chromium}.{png,json}`.

Regression protection: `tests/e2e/site-route-performance-step-38.spec.ts` fails
against the broad barrel import and passes against the persistence subpath. The
public review Site has not been updated; this finding awaits Step 45 deployment
verification.

## Defect found and fixed — Explore mounted offscreen resource previews

**Evidence:** Before the fix, the 1440×900 Explore route mounted nine isolated
preview frames while only six were in the viewport. Three started at y=955,
outside the 900px viewport. The baseline capture and data are in
`quality/evidence/step-38/before/sites-worker/explore-desktop-1440x900.png` and
`quality/evidence/step-38/before/explore-preview-visibility.json`. After the fix,
the desktop route mounts six visible frames, and the 390×844 route mounts two;
both have zero offscreen frames. The after metrics are in
`quality/evidence/step-38/after/explore-preview-visibility.json`, with profile
screenshots and full browser metrics alongside them.

**Root cause:** `ResourceCard` expanded each card's `IntersectionObserver` by
160px, so the next row of sandboxed components started before the user reached
it. This created three unnecessary iframe contexts and their preview script
requests on desktop.

**Fix:** Keep the existing lazy preview behavior and use a 0px intersection
margin. The user-facing regression checks the viewport boundary and performs a
normal mouse-wheel scroll to the next card, then waits for the actual
`.tess-screen` inside its iframe. At 1440×900 the cold route dropped from nine
frames to six, script responses from 108 to 87, and unique measured encoded
script-body bytes from 333,558 to 326,813. At 390×844 two in-view previews
remain available and the next one renders after scrolling. Chromium reports no
console errors, uncaught exceptions, failed requests, or HTTP errors. This is
local Sites Worker verification; public review verification remains pending.

## Remaining performance work

The route and flagship budgets do not close the broader performance programme.
The build still reports a Vite chunk above 500 kB before gzip. The latest route
audit measures Workbench at 466.22 KiB gzip and Compose at 244.75 KiB; the
Compose route does not download the editor bundle before handoff. Real-user field
LCP/INP/CLS, 50+ screen/long-session/history stress,
Firefox, real Safari, and deployed Site measurements remain open for their
ordered programme steps and release candidate. The constrained and large-project
measurements used Chromium on this laptop. No public Sites deployment was
changed.

## Validation

- `pnpm --filter @tessellate/site typecheck` — passed.
- `pnpm build` — passed; the catalogue validated 324 resources and Astro built
  718 pages before the Sites Worker artifact was prepared. Vite emitted its
  existing >500 kB minified-chunk advisory.
- `pnpm --filter @tessellate/sites build` — passed.
- `pnpm audit:budgets` — passed all four route budgets and catalogue budget.
- `pnpm exec vitest run tests/bundle-budgets.test.ts` — passed, 3 tests.
- ESLint for all changed app, budget and performance test files — passed.
- Sites Worker Playwright in Chromium: homepage brief handoff,
  Explore/Compose/Workbench workload, route performance, and standalone export —
  passed desktop and mobile.
- The initial WebKit CSP/multi-preview run had 8 scenario passes and 2 workflow
  failures, reproducing the inline `body {}` violation documented above. After
  the exact-hash CSP adjustment, the targeted WebKit workload and CSP suites
  passed all 10 checks across desktop/mobile with zero CSP events or runtime
  errors; that is the current local result.
- Full `pnpm test:e2e` chain after the final hash-only CSP adjustment — passed:
  Astro preview 256 passed / 92 skipped; Sites Worker 81 passed / 29 skipped;
  isolated preview app 3 passed (340 passed / 121 skipped total).
- Root `pnpm typecheck` — passed across 22 workspace packages; `pnpm lint` —
  passed with 0 errors and 33 existing warnings; `git diff --check` — passed.
- `pnpm install --frozen-lockfile` — passed; root `pnpm test` — 1,113 passed in
  74 files; `pnpm audit:all` — passed all 16 release-gate checks, production
  builds, resource provenance, security/secret audit, dependency audit and
  bundle budgets.
- Post-fix targeted WebKit workload and CSP suites — 10 passed across desktop
  and mobile; route performance checks passed on both WebKit viewports. Chromium
  CSP checks also passed at desktop and mobile sizes.
- `performance-stress-step-38.spec.ts` — Chromium constrained 4G/4× CPU Explore
  workload and 30-screen/1,830-node employee-experience Workbench load,
  navigation, manifest export, and standalone ZIP export passed (2 passed; 2
  mobile skips by design).
- Latest route-performance regression — Chromium desktop/mobile passed at
  1440×900 and 390×844, including scroll-to-render for the next Explore preview;
  all captured console, exception, failed-request and HTTP-error arrays are empty.

## 2026-10-21 continuation — Compose bundle isolation

AUD-265 was added after the browser test failed against the broad Workbench
package import at 588,984 bytes transferred. The source now exposes the existing
storage functions at `@tessellate/workbench/persistence`; Compose imports only
that subpath. The updated cold-route browser records show 349,756 JavaScript
transfer bytes in 19 resources on Chromium and WebKit at 1440×900 and 390×844,
down from 39 resources and about 589 kB. The after-code images were visually checked and
Compose remains intact. `pnpm build` passed, generating all 717 Astro routes and
the Sites Worker artifact. `pnpm audit:budgets` passed: Compose is now 335.99
KiB gzip versus 561.55 KiB before the fix. The focused red-to-green transfer test
and visible Compose→Workbench→Recompose journey passed in Chromium and WebKit at
desktop and mobile widths. The focused transfer regression records zero console
errors, uncaught exceptions, failed requests, or HTTP errors in all four profiles.
The four-route browser matrix passes in Chromium on desktop and mobile with no
runtime/network errors. Root `pnpm test` passes 1,120 tests in 74 files;
`pnpm typecheck` passes across 22 packages; targeted ESLint and
`git diff --check` pass. `pnpm audit:all` passes the behavioral release gate, all 717-page
and Sites Worker builds, bundle budgets, all 324 provenance/license checks, the
security/secret audit, and dependency audit. It still emits the existing Vite
raw-chunk advisory; gzip route budgets pass. The finding awaits published review
verification.

## 2026-10-21 continuation — Explore preview deferral

AUD-266 came from local Sites Worker browser evidence: Explore initially mounted
three sandboxed previews below the 900px fold because the resource-card observer
used a 160px margin. The margin is now zero; the same route matrix confirms no
offscreen frames at 1440×900 or 390×844, and a real mouse-wheel scroll mounts the
next component through to `.tess-screen`. At desktop, mounted frames fell from
nine to six and script responses from 108 to 87. The before/after captures and
all-frame metrics are in `quality/evidence/step-38/`. Targeted ESLint and the
Chromium desktop/mobile route regression pass. DevTools trace-based Core Web
Vitals remain paused pending DevTools setup, and deployed review verification
remains pending for Step 45.

## 2026-10-21 continuation — refreshed route and browser evidence

Rebuilt the current 717-page Astro artifact and Sites Worker, then reran the
four-route (`/`, `/explore`, `/compose`, `/workbench`) performance matrix on
Chromium and Playwright WebKit at 1440×900 and 390×844. Both browser profiles
passed all four checks at both viewport sizes (8 passes total). The cold route
measurements and screenshots were refreshed in `quality/evidence/step-38/after/`.
All four profiles recorded zero console errors, uncaught exceptions, failed
requests, browser cancellations, HTTP errors, or document-width overflow.
Screenshots of desktop/mobile Workbench, scrolled Explore previews, slow-network
Explore, and the 30-screen Workbench were visually checked.

The refreshed stress run on the same Sites build used 150 ms latency, 1.6 Mbps download,
and 4× CPU slowdown. Explore reached the catalogue in 3,799 ms and rendered the
first onboarding preview in 3,342 ms. Six preview-frame script requests were
cancelled as nonmatching iframes unmounted after search; there were zero failed
requests, HTTP errors, console errors, or uncaught exceptions. The 30-screen,
1,830-node Workbench loaded in 902 ms, switched to its last screen in 44 ms,
exported its manifest in 611 ms, and generated a 52,640-byte standalone ZIP in
159 ms. Its 681,238-byte manifest retained all screens and nodes, with no runtime
errors or horizontal overflow. Both Playwright stress checks passed. The full
measurements and captures are stored under quality/evidence/step-38/after/constrained-and-large/.

The fresh gzip budgets are 99.09 KiB for Home, 149.98 KiB for Explore, 244.75
KiB for Compose, 466.22 KiB for Workbench, and 112.13 KiB for the catalogue.
`pnpm audit:budgets` passes all five limits. The Astro build still emits its
existing Vite advisory for a raw minified chunk above 500 kB; the route gzip
budgets pass. These local `PerformanceObserver` LCP/CLS values remain lab
measurements and do not represent field Web Vitals or DevTools traces.

Firefox was force-reinstalled using Playwright 1.63.0 and the same route test
was rerun. It still fails before navigation with `spawn UNKNOWN`. Windows
SideBySide Event 33 identifies the missing dependent assembly as `mozglue`
version 1.0.0.0 even though `mozglue.dll` is adjacent to the executable; no
Tessellate route was exercised. Details are in
`quality/evidence/step-38/after/firefox-launch-failure.json`. Real Safari remains
unavailable on this Windows laptop. Chrome DevTools MCP 1.12.0 is registered
locally with usage statistics disabled. Trace collection resumed after the tools
became available; the latest results and network/console summaries are in
`quality/evidence/step-38/after/chrome-devtools-lab.json`.

## 2026-10-23 continuation — Explore startup CLS

**Defect:** Explore showed an empty results area while fetching and indexing the
catalogue. Adding the first 50 cards moved the main content and footer by 4,709 px
at 1440×900 and 16,713 px at 390×844. A second one-frame gap occurred after
catalogue indexing: `isLoading` became false before the first Orama search effect
set `isSearching`, briefly presenting “0 of 0” and moving the footer. At a 500×844
desktop viewport this produced CLS 0.23 across two shifts.

**Root cause:** Explore treated catalogue readiness as search completion. Its
empty state could render before the first search had returned, and no content
reserved the first results page while the catalogue was loading.

**Fix:** Render 50 inert card placeholders with the same preview ratio and footer
line heights as `ResourceCard`, and retain them until the first search completes.
The live results summary now says “Searching catalogue…” during the handoff and
shows an empty state only after a completed search returns no matches. Catalogue
failure continues to show its existing retry alert.

**Red-to-green evidence:** The delayed-catalogue regression first measured the
4,709 px desktop and 16,713 px mobile expansions. The 500 px viewport regression
then failed at CLS 0.2298 with two footer shifts. After both fixes, the same tests
pass; loading-to-results height deltas are 39 px at 1440×900 and 6 px at 390×844,
and the 500×844 CLS sample is 0. Screenshots and machine reports are under
`quality/evidence/step-38/before/` and `quality/evidence/step-38/after/`.

**Chrome DevTools cold traces after the fix:** Explore LCP / CLS was 194 ms / 0.00
at 1440×900, 100 ms / 0.00 at 500×844 desktop, and 101 ms / 0.00 at 390×844 mobile
emulation. Across `/`, `/explore`, `/compose`, and `/workbench` at desktop and
mobile, all 8 traces reported CLS 0.00; LCP ranged from 101–587 ms. The observed
Explore navigation made 107 requests at desktop and 56 on mobile; all had 200 or
304 responses, with no failed requests or browser console errors/warnings.
Machine-readable route metrics are in
`quality/evidence/step-38/after/chrome-devtools-lab.json`; the additional 500 px
trace is in `quality/evidence/step-38/after/explore-narrow-500-chrome-devtools.json`.

**Validation refresh:** The Explore loading/CLS regression set passes 6 tests,
with 2 intentional skips for narrow-desktop-only cases in the mobile project.
The desktop/mobile route and Compose transfer checks pass 4/4. The follow-up
empty-search-to-results UI check also passes at 500×844. `pnpm typecheck` passes
all 22 workspace packages, `pnpm lint` exits successfully, `pnpm test` passes
1,208 tests across 77 files, `pnpm build` passes with 324 catalogue resources and
718 Astro pages, `pnpm audit:budgets` passes all five budgets, and
`git diff --check` passes. The full performance programme remains open for
long-session/large-scale work and deployed review verification.

## 2026-10-23 continuation — search-state and loading accessibility regressions

The complete browser run exposed two Explore defects that the isolated CLS
measurements did not cover. First, Axe reported a serious `aria-prohibited-attr`
finding on desktop and mobile while the inert loading skeleton was present:
`aria-label` was applied to a generic container with no role. Adding
`role="status"` fixed the semantics; focused Core-surface Axe tests pass at both
viewports. The before/after loading captures are
`quality/evidence/step-38/before/explore-loading-sites-chromium.png` and
`quality/evidence/step-38/after/explore-loading-sites-chromium.png` (AUD-281).

Second, the browser run changed a completed zero-result query to one with
matches and caught Explore briefly reporting “Showing 0 of 0” while the 250ms
debounce still represented the previous query. Search completion is now keyed
to the visible query and normalized filters. During a mismatch, the result
summary says “Searching catalogue…” and the prior empty state is replaced by a
pending state. The red/green transition captures are
`quality/evidence/step-38/{before,after}/explore-query-transition-sites-chromium.{png,json}`.
The focused Sites Worker route suite passes 6/6 (AUD-282).

The final post-dependency and Compose-performance-fix `pnpm test:e2e` matrix
passed with 489 tests and 144 project-scoped skips across Astro preview (274
passed / 108 skipped), Sites Worker (212 passed / 36 skipped), and isolated
preview app (3 passed), with zero failures. The Sites Worker run certified all
324 catalogue resources and 40 Gold resources in real browsers. The full result
is recorded in `quality/evidence/step-38/after/e2e-full-20261023-final.json`.

The exact employee brief was entered through the visible Compose form at
1440×900, with Refined and Radical selected. A DevTools trace recorded the
Compose pointer interaction at 32 ms (0.8 ms input delay, 11 ms processing,
20 ms presentation), down from the earlier 299 ms sample. LCP was 119 ms and
CLS 0.00; all three real directions rendered with the Employee Experience
archetype, and the trace run reported no browser console messages or failed
requests. The interaction record is
`quality/evidence/step-38/after/compose-interaction-chrome-devtools.json`.

After the run, frozen install, 324-resource catalogue generation, all 22
workspace typechecks, lint, all 1,208 unit tests, `pnpm audit:all`, and
`pnpm test:e2e` passed. The initial typecheck/unit-test attempt overlapped and
timed out while the Gold security test created and removed a temporary resource
fixture; serial reruns passed cleanly. The production build still emits Vite's
raw-chunk advisory above 500 kB. The largest public route entry remains within
its documented gzip budget, Workbench code stays lazy until handoff, and all five
route/catalogue budgets pass, so this warning is accepted and tracked rather
than hidden.

Chrome DevTools measurements remain local lab samples; CrUX field data is
unavailable. The full Step 38 programme remains open for deployed review
verification, field data, longer-session, and scale work.

## 2026-10-24 live review comparison

Chrome DevTools 156 captured the user-provided review URL directly at
1440×900 and 390×844. The desktop cold navigation measured LCP 1,971 ms,
TTFB 838 ms, 1,133 ms LCP render delay, and CLS 0.00; 27 requests returned
without failed requests or HTTP errors. The mobile capture used 4× CPU and Fast
4G and measured LCP 925 ms, TTFB 65 ms, 861 ms render delay, and CLS 0.00;
again, all 27 requests succeeded. CrUX data is unavailable. Screenshots and
machine records are `quality/evidence/step-38/review-v20-home-desktop-1440.png`,
`quality/evidence/step-38/review-v20-home-mobile-390.png`,
`quality/evidence/step-38/review-v20-home-mobile-390.json`, and
`quality/evidence/step-38/review-v20-home-live-2026-10-24.json`.

The live desktop document response was 84,920 bytes, had no `content-encoding`,
and returned `cache-control: no-transform`. Its initial scripts transferred
170,561 bytes, above the local 150 KiB homepage JS target. The current branch's
separate local measurement remains 106–111 kB; the public page still showed the
stale procurement/market-intelligence brief and the four-field browser identity
warning, confirming that local fixes for AUD-317/318 have not reached this Site.
The response CSP still contains `unsafe-inline` in script and style directives
(AUD-268). These are existing release-verification findings, not regressions
introduced by the current source changes. The source SHA is not exposed by the
page; no hosting or repository change was made from this measurement. Recheck
these findings against the public release candidate in Step 45 before closing
them.

## 2026-10-25 deployed v28 Workbench cold-start audit

Chrome DevTools and fresh Playwright Chromium contexts measured the public v28
Site directly. At 1440×900, 1× CPU and Fast 4G, cold route LCP was 580 ms on
home (TTFB 60 ms, CLS 0), 493 ms on Explore (TTFB 62 ms, CLS 0), 526 ms on
Compose (TTFB 220 ms, CLS 0), and 3,925 ms on Workbench (TTFB 69 ms, CLS 0).
At 390×844, 4× CPU and Slow 4G, Explore measured LCP 1,599 ms and Compose
1,650 ms, both with CLS 0. CrUX field data is unavailable. Render-blocking
insights on the sampled routes estimated zero FCP/LCP savings.

The Workbench cold-start exposed AUD-338. A fresh mobile context had an empty
document body at 1.5 seconds. The first loading message became an LCP candidate
at 5,204 ms and a product-preview paragraph at 7,776 ms. Two separate cold
loads measured LCP at 5,664 and 6,132 ms with CLS 0. The fresh Playwright
context recorded 44 requests, all HTTP 200, with zero console errors, failed
requests, or horizontal overflow. A separate warmed DevTools-tab capture
recorded 45 responses, including one 304; it is not combined with the fresh
context counts. The 2.14 MB
decoded catalogue and roughly 1.1 MB decoded Workbench entry script contributed
to the cold transfer and execution workload; these measurements do not show a
field percentile. Full captures and timing details are in
`audit/evidence/v28/performance/deployed-v28-workbench-cold-start.json` and
the associated screenshot files in that directory.

The root cause was an empty Astro `client:only` island with no fallback. The
Workbench route now renders an accessible local-workspace status and a working
Compose link in Astro's fallback slot. The regression first failed before the
fix, then passed after a 1.6-second delayed client-bundle response at desktop
and mobile in both Astro preview and the Sites Worker. The latest Sites Worker
run showed the fallback at 82 ms on both desktop and mobile; Axe reported zero WCAG 2.2 A/AA violations,
and the Workbench Pages control worked after initialization. Screenshots and
machine records are in `quality/evidence/step-38/after/workbench-startup-fallback-*.{png,json}`.
This removes the blank interval; it does not reduce total editor startup time
under the synthetic low-end mobile profile. The change is not on public v28,
and AUD-338 remains fixed-awaiting-deployed-verification until the same check
passes on a later saved and explicitly approved Site.

## 2026-10-25 full local verification after AUD-338

The accessible Workbench fallback has now passed the full local verification
chain: `pnpm test` (1,216 passed, 1 skipped), all 22 workspace typechecks,
`pnpm lint`, `pnpm audit:all`, and `pnpm test:e2e` (616 passed, 149 configured
skips). The browser runs comprised 316 Astro cases, 297 Sites Worker cases,
and 3 isolated preview cases. All 324 resources rendered in their Sites Worker
certification; the 40 Gold resource accessibility checks also passed. The
production build generated 733 Astro pages and the Sites artifact. Route gzip
budgets passed at 99.63 KiB homepage, 175.82 KiB Explore, 270.82 KiB Compose,
and 494.33 KiB Workbench. This verifies local source and the production-like
Sites Worker only; public v28 still needs an approved follow-up deployment and
the same deployed Workbench check before AUD-338 can close.

## Chrome DevTools trace follow-up

Chrome DevTools Performance traces were added after the initial v28 cold-start
capture. Public v28 at 390×844 under Slow 4G and 4× CPU measured LCP 4,878 ms
(57 ms TTFB, 4,821 ms render delay), CLS 0, and no console errors or warnings.
The same route on the local Astro production preview for the candidate commit
measured mobile LCP from 1,571–2,453 ms and desktop LCP 2,653 ms. The separate
browser contexts still returned cached 304 responses for hashed assets, so this
is diagnostic evidence and not a clean uncached transfer comparison or field
Core Web Vitals. The desktop trace found a render-blocking stylesheet with an
estimated 178 ms saving; the total Workbench startup remains a performance
follow-up. Detailed machine-readable values and measurement limits are in
quality/evidence/step-38/after/workbench-chrome-devtools-traces-2026-10-25.json.

## 2026-10-25 resource preview update regression — AUD-339

The public v28 Site was exercised as a user at `/resources/fade-up-reveal/` on
1440×900 and 390×844. Each Reduced Motion toggle changed the live iframe URL
and navigated the isolated document once. All observed requests returned HTTP
200; the browser reported no console errors, warnings, or failed requests.
Before/after evidence is in `quality/evidence/step-38/v28-resource-preview-motion-*.png`.

Commit `b66af832482367051c8a35ffa625b4fc6aed71b6` keeps the initial preview URL
stable and uses the existing typed `TESSELLATE_PREVIEW_UPDATE` channel for
control changes. The desktop/mobile reduced-motion regression checks the
visible CSS response, stable URL, and zero iframe navigation after initialization.
The test update also changes catalogue and Gold certification to assert the
rendered variant instead of treating a query-string change as proof of state.

Verification after the change: `pnpm typecheck`, `pnpm lint`, `pnpm test`
(1,216 passed, 1 skipped), and `pnpm audit:all` passed. The 16-point behavioral
gate passed; the 324-resource seven-width Sites Worker matrix and Gold 40
variant/accessibility suite passed in full; the isolated Preview app suite passed
3/3. The first broad E2E run exposed two obsolete iframe-URL assertions; after
those assertions were corrected, both affected full certification tests passed,
and the Astro, remaining Sites Worker, and Preview app runs passed. The first
run's pre-fix result is retained in the terminal run log; it was a test contract
mismatch, not a runtime failure after the UI state had changed. Public v28 still
has the navigation behavior; AUD-339 remains fixed-awaiting-deployed-verification.

## 2026-10-25 deployed v28 Explore preview readiness — AUD-340

Fresh public v28 captures at 1440×900 showed all six visible card preview areas
blank about 1.2 seconds after the main Explore content appeared. After five
seconds, the same frames displayed their resource components. The public trace
recorded 108 successful HTTP requests, no console messages, and no document
overflow. This was an unhelpful loading state rather than a failed route or
resource; the before screenshot is
`quality/evidence/step-38/deployed-v28-explore-1440x900.png`.

The shared `ResourceCard` now listens only to the matching opaque-origin frame
and resource ID on the existing preview protocol. It marks the area `aria-busy`,
shows “Loading preview…” until the renderer signals readiness, and reports a
failed or overlong load with a link to the resource detail page. The regression
was observed failing before the code change. The Sites Worker tests pass 4/4 at
desktop and mobile with delayed and aborted frame requests. Local after captures
are under `quality/evidence/step-38/after/explore-preview-*`.

Chrome DevTools 156 public v28 cold traces at 1440×900, 1× CPU and unthrottled
network recorded LCP 187–569 ms and CLS 0 for Home, Explore, Compose, and
Workbench; a Compose constraints toggle recorded 18 ms lab INP. These are
single-run lab samples; no CrUX field data is available. The separate 390×844,
4× CPU, Slow 4G Workbench trace returned no navigation segment and is marked
inconclusive. Machine-readable results and limits are in
`quality/evidence/step-38/deployed-v28-core-traces-2026-10-25.json`.

AUD-340 is fixed locally and remains open until a new approved Sites version
passes the same deployed preview readiness check. Public v28 is unchanged.

### Local release verification after AUD-340

On 2026-10-25, `pnpm install --frozen-lockfile` completed with no dependency
changes. `pnpm typecheck`, `pnpm lint`, `pnpm test` (1,216 passed, 1 skipped),
and `pnpm audit:all` passed. The latter includes catalogue validation, the
16-point behavioral release gate, 324-resource isolation, the production build,
bundle budgets, licence/provenance, secrets/security, and dependency audits.

`pnpm test:e2e` passed all three configured legs: 316 passed and 108 skipped in
the plain Astro desktop/mobile run; 302 passed and 40 skipped in the Sites
Worker desktop/mobile run; and 3 passed in the isolated Preview app. The Sites
Worker leg includes the 324-resource seven-width matrix, the new delayed and
aborted preview tests, core Axe and keyboard checks, CSP/isolation checks,
responsive route checks, and scale/fault-injection workflows. The configured
skips are test-project restrictions, primarily resource matrices that run only
in the matching Sites desktop context or interactions unavailable on a given
viewport; no test failed. The successful E2E run does not close AUD-340 because
the public Site remains v28.

Visual review of the loaded Explore capture confirms that the library uses
deliberate 16:10 card thumbnails; taller resources are cropped in the card well,
while their detail routes provide the full interactive preview. The newly
reported defect is the blank, unlabelled loading interval documented above,
not this consistent thumbnail treatment.

## Public v28 home document compression audit — AUD-341

On 2026-10-25, Chrome DevTools measured the live v28 homepage at 1440×900 with
cache disabled, 1× CPU and unthrottled network. The cold navigation returned
HTTP 200 over HTTP/2, LCP 375 ms (65 ms TTFB, 309 ms render delay), CLS 0.00,
and no console messages. All 25 observed requests returned HTTP 200; the
hashed stylesheet was gzip encoded. The HTML response transferred 90,254 bytes
without `Content-Encoding` and included `Cache-Control: no-transform`. Chrome's
DocumentLatency insight marked compression as failed and estimated 60.5 kB of
avoidable transfer, with 0 ms estimated FCP/LCP savings. CrUX field data is
unavailable. The trace summary and response evidence are in
`quality/evidence/step-38/after/deployed-v28-home-1440-trace-2026-10-25.json`;
the route screenshot is `audit/evidence/v28/home-desktop-1440x900.png`.

The worker set `no-transform` on every HTML route to preserve vetted HTML and
CSP hashes. That directive also blocked transparent edge compression. The
red-to-green regression caught that applying the change to every route would
weaken the byte-stability contract of the isolated preview; those two routes
still receive `no-transform`. Public HTML now inherits its static asset cache
policy and retains the same strict `script-src` policy. The production build and
local Worker response return HTTP 200 with `Content-Encoding: gzip`, the
original `public, max-age=0, must-revalidate` cache policy, and unchanged CSP.
The local homepage browser smoke loaded 26/26 successful requests with no
console messages. AUD-341 remains open until an explicitly approved follow-up
Sites version returns a content-encoded public HTML response while preview
routes still retain `no-transform` and all CSP/isolation checks pass.

The complete local `pnpm test:e2e` chain then exited successfully across the
Astro, Sites Worker, and isolated preview-app Playwright profiles. The final
preview profile reported 3 passed; Playwright's final-run record reports
`status: passed` and an empty failed-test list. The Astro profile reported 316
passed and 108 configured skips. No aggregate Sites Worker count was retained
by the list reporter, so this record claims completion and zero failures,
without assigning an unverified pass/skip total to that profile.

## Public v30 DevTools verification — 2026-10-25

The deployed Site version is v30, from canonical source commit `2a201f4d13dbf5d2339994fd14dc2fe92c3e92ff` (Sites mirror `775af0c92354e8fdf33af60b8c0cc31b396c0ab6`). D1/R2 bindings were not provisioned. Chrome DevTools MCP recorded cold public traces at 1440×900 / 1× CPU / unthrottled and 390×844 / Fast 4G / 4× CPU. The route timings and request evidence are in `quality/evidence/step-38/deployed-v30-devtools-audit-2026-10-25.json`.

| Route | Desktop LCP / TTFB / render delay / CLS | Mobile LCP / TTFB / render delay / CLS |
| --- | --- | --- |
| Home | 284 / 42 / 242 ms / 0 | 772 / 56 / 716 ms / 0 |
| Explore | 187 / 42 / 145 ms / 0 | 745 / 40 / 705 ms / 0 |
| Compose | 266 / 126 / 140 ms / 0 | 792 / 42 / 751 ms / 0 |
| Workbench | 802 / 54 / 748 ms / 0 | 2,559 / 41 / 2,517 ms / 0 (saved Direction C); 2,809 / 36 / 2,773 ms (fresh context) |

A 1× CPU Fast 4G Workbench run at 390×844 measured LCP 1,296 ms (74 ms TTFB, 1,222 ms render delay, CLS 0). The 4× CPU Workbench samples slightly exceed the 2.5-second field p75 threshold, but they are synthetic lab data and cannot establish a field failure. The trace attributes 98.4–98.7% of LCP to render delay without locating one source hot spot or a credible estimated saving. AUD-343 remains a medium lab-only follow-up; CrUX is unavailable. Compose keyboard-input lab INP was 18 ms; Direction C became ready in Workbench in about 1.79 seconds.

The public v30 startup probe at 390×844 / 4× CPU / Slow 4G shows the Astro Workbench fallback by about 1.1 seconds and the full editor by about 4.6 seconds; it did not show the previous blank document. Explore returned 108 requests (101 HTTP 200, seven cached HTTP 304), with six visible isolated previews rendered and no failed/4xx/5xx requests. The Fade-Up Reveal Motion toggle changed to ON while retaining the same iframe URL and issuing no second preview-document request; Replay Entrance then announced that the animation was skipped. Its repeatable before/after screenshots and network record are in `quality/evidence/step-38/deployed-v30-fade-up-reveal-motion.json`. The homepage response is gzip encoded with `Cache-Control: public, max-age=0, must-revalidate`.

The only observed browser console error is AUD-342: a per-response ChatGPT Sites/Cloudflare inline bootstrap is blocked by the app strict CSP. It does not execute and the application remains interactive. No CSP relaxation was made. No new Axe scan was run in this Step 38 follow-up; older version results are not represented as v30 results.

Public v30 checks close AUD-338 (visible startup fallback), AUD-339 (no preview iframe reload), AUD-340 (truthful/rendered Explore previews) and AUD-341 (HTML compression). Step 38 is complete for its recorded lab workload and deployed-trace scope. Long-session/history stress belongs to the later stress-testing step; field Core Web Vitals remain unavailable.

## 2026-10-26 — Saved-project startup no longer waits on catalogue data

AUD-346 reproduced a Core availability failure behind the prior LCP observation: a valid saved browser project stayed behind Workbench's loading state until the entire 324-resource catalogue returned. An HTTP error in that request produced the startup error screen even though the project manifest and Gold renderer were local.

`WorkbenchShell` now restores saved manifests without requesting the catalogue. Library, Resource details, and Replace load the schema-validated Gold catalogue only when opened and deduplicate concurrent requests. Their loading and error states are explicit, with retry where catalogue access is required. First-run sample composition and imported showcase/resource projects still load the catalogue before generating a manifest; those flows remain fail-closed.

The regression was red before the change in desktop and mobile Sites Worker projects: a deliberately stalled `/data/catalog.json` kept both editor shells absent. After the fix, the same test shows the saved canvas before any catalogue request at 1440×900 and 390×844. Desktop project visibility was 2,132 ms and mobile visibility 965 ms; opening Library then made exactly one catalogue request and rendered Gold resource entries. A separate test returns HTTP 503 on the first request, verifies the saved project remains open with a recovery message, and then verifies a retry succeeds. The desktop/mobile startup Axe scan reports no violations; the tests recorded zero console errors, uncaught exceptions, failed requests, and unexpected HTTP responses.

Chrome DevTools traces on the local Sites Worker used 390×844, Fast 4G, 4× CPU, and cold cache. Three saved-project runs measured LCP 2,176 / 2,126 / 2,162 ms; TTFB 6 / 6 / 11 ms; render delay 2,170 / 2,119 / 2,151 ms; and CLS 0 in each run. The 324-resource catalogue did not appear in the critical request chain. LCP improved relative to public v30 traces, but remains mostly client render delay and has no available CrUX field data or DevTools-estimated saving. The local candidate does not close AUD-343/AUD-346 as deployed; public v30 remains unchanged pending a saved version, owner approval, and issue-specific re-audit.

Screenshots and machine-readable evidence are in `quality/evidence/step-38/after/catalogue-lazy-load/` and `quality/evidence/step-38/after/workbench-catalogue-lazy-load-devtools.json`.

The fix is committed as `ad735b37cdc81966ff1ce5fe6d727e4fd7cba959`. Typecheck and lint pass; `pnpm test` reports 1,220 passed and one skipped; `pnpm audit:all` passes all 16 behavioural checks, the 324-resource isolation check, production build, bundle budgets, licence/provenance, secret/security, and dependency audits. During `pnpm test:e2e`, the 428-test Astro matrix completed with 316 passed and 112 configured skips. The Sites Worker matrix completed with 310 passed and 42 skips, but its two stale-project cases still expected the previous recovery heading and sample link. The test now asserts the current `Workbench could not open` recovery, retained stale project identity, no replacement project, and no manifest export; the same Sites desktop/mobile cases pass 2/2. The standalone preview app passes 3/3. The full aggregate E2E command has not yet been rerun after that assertion update; a green exact-commit CI run is still required. This does not change the deployed status: public v30 remains live and AUD-346 awaits hosted verification.
