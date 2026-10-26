# Step 45 — Public review verification

Status: in progress. Public Site v30 remains live. The homepage spacing fix is in code commit `aa4d83ffdd1121c3dd9d80f253e42b7b32b3b9d9`; exact-head CI passed on code candidate `5c2521bf75b72b86520ebfbfc4816aa50c6490a1` (CI run 40300330018 and Component Quality Gate Sandbox run 40300330012). Sites v34 was saved from Site-source commit `eedfa4e58ba38f497f90960f09167283d0a57f7c` and remains undeployed; Sites returned no hosted preview URL. A refreshed candidate will include this audit update. The local review preview is available at `http://127.0.0.1:4337/`. No version will be deployed until the owner approves that exact saved version.

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

The current public deployment remains v30. The previously saved v33 is not the
current candidate and must not be published. D1 and R2 remain null. The only
open audit issue is AUD-342, a Sites-injected dynamic bootstrap script that
strict CSP blocks on the public page; `unsafe-inline` was not added. After exact
head CI passes, save and show a new version from the pushed source. Step 45
remains open until the owner approves that exact version, the deployment is
re-audited, and remaining release acceptance checks pass. No public deployment
has been made from this candidate.

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
