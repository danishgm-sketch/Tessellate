# Step 45 — Public review verification

Status: in progress. Sites versions 21 and 22 were saved, but not deployed. Version 21 predates the AUD-319 narrow-header correction. Version 22 packages canonical source `849894fe5e325b20908984be540ab4420d5763c9`. Both are superseded by the Explore search corrections now under review; neither is approved for deployment. Save and show a replacement version built from the exact pushed source before requesting publication approval.

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
