# Step 06 — Resource certification (in progress)

## Scope and test boundary

Browser testing ran against the built Sites Worker preview at
`http://127.0.0.1:4323`, preserving the opaque-origin resource iframe sandbox.
This validates the local deployment adapter; it does not verify the public
review deployment. The build compiles Astro's 717 pages and all dynamically
imported resource code. No public Site version was created or deployed during
this step.

## Results

| Evidence | Result |
| --- | --- |
| `pnpm build:catalog` | PASS — all 324 ResourceManifest entries and declared required files validated; 40 Gold candidates emitted. |
| `pnpm build` | PASS — 717 static pages and the Sites Worker artifact built. Preview client chunk is approximately 188.06 KB gzip, under the configured bundle gate. |
| 324-resource browser matrix | PASS locally — every default preview at 360, 390, 430, 768, 1024, 1280 and 1440px; zero console, page, network, HTTP, link, preview or overflow findings. Final official E2E report: [`catalog-324-e2e-final.json`](../audit/evidence/step-06/results/catalog-324-e2e-final.json). |
| 324-resource variant smoke | PASS locally — all 972 declared variants selected and rendered at 1440px with zero findings, failed requests or cancellations. |
| Canonical `/r/:slug` route | PASS locally — `/r/ai-prompt-hero/` returned HTTP 200 at 390x844 and 1440x900 with exact title/heading, live preview, no browser errors or overflow; desktop preview measured 764px. |
| 40-resource Gold browser matrix | PASS locally — all 120 Gold variants at 360, 390, 430, 768, 1024, 1280 and 1440px; isolated iframe preserved; zero findings. Final report: [`gold-40-e2e-final.json`](../audit/evidence/step-06/results/gold-40-e2e-final.json), with 120 browser captures preserved in the same evidence tree. |
| Gold keyboard/reduced-motion checks | PASS locally — 33 enabled controls were keyboard reachable with visible focus and produced expected feedback; reduced-motion preference reached all 40 renderers. |
| Navigation/control regression | PASS locally — all 324 previews were checked for dead fragment links; visible action feedback, mega-menu disclosure and mobile drawer behavior passed. |
| `pnpm typecheck` | PASS — all 22 workspace packages. |
| `pnpm lint` | PASS — 0 errors, 51 existing warnings. |
| `pnpm test` | PASS — 54 files, 612 tests. |
| `pnpm audit:all` | PASS — 16/16 release gates, build, bundle budgets, catalogue licence/provenance and secret/security audits. |
| `pnpm test:e2e` | PASS — 73/84 regular browser tests passed, 11 explicitly skipped; all 3 Sites Worker tests passed. The flagship acceptance journey and standalone export browser build passed. Aggregate: [`e2e-suite-final.json`](../audit/evidence/step-06/results/e2e-suite-final.json). |

The two detailed browser reports reference 177 saved screenshots under
`audit/evidence/step-06/after/` and record zero missing screenshot paths.

An earlier catalogue-matrix attempt recorded 39 iframe execution-context errors
when the test switched variants before the prior preview finished loading. The
diagnostic is preserved as [`catalog-324-variant-race.json`](../audit/evidence/step-06/results/catalog-324-variant-race.json).
The test now waits for iframe load and outstanding page requests; the final
official run completed with zero such errors, failed requests or cancellations.

## Findings and remediation

The local browser audit has **42 defects** recorded: 6 High and 36 Medium. The
original 29 include enabled actions without behavior, 52 placeholder navigation
links, compact-width overflows, an undisclosed menu state and an unsupported
operational-status claim. The expanded resource matrix found a malformed Astro
resource-detail title/layout, 11 compact-preview overflows and a separate narrow
activity-text regression. Every issue has its own machine-readable record with
reproduction, root cause, affected code, remediation and evidence references in
[audit/RUNTIME_AUDIT.md](../audit/RUNTIME_AUDIT.md) and
[audit/runtime-audit.json](../audit/runtime-audit.json).

All 42 fixes pass local resource-specific browser regressions and the full
catalogue/Gold render matrices. Their machine-readable status remains
`fixed-awaiting-deployed-verification`; none is closed because the public review
Site has not been updated and re-audited. Before and
after screenshots are under `audit/evidence/step-06/`; 10 of the 11 newly found
overflow defects have no retained before screenshot because their original
Playwright output directory was cleared before preservation. This evidence gap
is recorded in each corresponding issue; no screenshot has been reconstructed
or presented as a baseline.

## Changes made

- Added host-action contracts and honest disabled states for the marketing CTA,
  pricing plan buttons, empty-workspace action, magnetic button and retry example.
- Removed placeholder fragment destinations throughout the audited navigation
  resources; an item without a consumer destination is now a noninteractive label.
- Connected preview actions to visible feedback, removed an unconnected default
  CTA, exposed disclosure expanded state, and made the mobile drawer keyboard-safe.
- Removed an unsupported static “Operational” service-health claim.
- Fixed the documentation shell, floating navigation and webhook row at narrow
  widths.
- Added repeatable browser matrices for all 324 default previews at seven widths,
  all 972 declared catalogue variants at desktop, all Gold variants across seven
  widths, plus exact `/r` route and narrow-content regression checks.

## Remaining before Step 06 can close

- Expand Gold state coverage to interactive, loading, error, empty, long-text and
  large-data cases for every applicable resource, including disabled states.
- Verify screen-reader semantics and contrast in real browser runs. Keyboard,
  visible-focus and reduced-motion checks are recorded above; they do not replace
  screen-reader or contrast evidence.
- Establish an Axe strategy for the opaque preview frame. Injecting Axe directly
  into the isolated frame caused its stylesheet inspection to attempt a
  `connect-src` fetch, correctly blocked by the Sites CSP (`connect-src 'none'`).
  This was test instrumentation, not a product request; the CSP remains intact.
- Run the same regression matrix against a published review Site during the
  public-RC phase before recording deployed closure.
