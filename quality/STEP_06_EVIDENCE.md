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
| `pnpm install --frozen-lockfile` | PASS — all 23 workspace projects already up to date. |
| Baseline evidence preservation | PASS — the state test now writes before captures only when absent; a rerun preserved the committed baseline SHA-256. See [`baseline-preservation-check.json`](../audit/evidence/step-06/results/baseline-preservation-check.json). |
| `pnpm build:catalog` | PASS — all 324 ResourceManifest entries and declared required files validated; 40 Gold candidates emitted. |
| `pnpm build` | PASS — 717 static pages and the Sites Worker artifact built. The preview client bundle is 188.81 KB gzip and remains under its configured budget. |
| 324-resource browser matrix | PASS locally — every default preview at 360, 390, 430, 768, 1024, 1280 and 1440px; zero console, page, network, HTTP, link, preview or overflow findings. Final official E2E report: [`catalog-324-e2e-final.json`](../audit/evidence/step-06/results/catalog-324-e2e-final.json). |
| 324-resource variant smoke | PASS locally — all 972 declared variants selected and rendered at 1440px with zero findings, failed requests or cancellations. |
| Canonical `/r/:slug` route | PASS locally — `/r/ai-prompt-hero/` returned HTTP 200 at 390x844 and 1440x900 with exact title/heading, live preview, no browser errors or overflow; desktop preview measured 764px. |
| 40-resource Gold browser matrix | PASS locally — all 120 Gold variants at 360, 390, 430, 768, 1024, 1280 and 1440px; isolated iframe preserved; zero findings. Final report: [`gold-40-e2e-final.json`](../audit/evidence/step-06/results/gold-40-e2e-final.json), with 120 browser captures preserved in the same evidence tree. |
| Gold browser Axe / contrast / accessible-name checks | PASS locally — `/preview/?resource=...` rendered each Gold component directly without changing the sandbox or CSP; all 40 resources × 3 variants passed WCAG 2.2 AA Axe rules with zero violations. See [`gold-accessibility-clean.json`](../audit/evidence/step-06/after/gold-accessibility-clean.json) and paired captures under `audit/evidence/step-06/{before,after}/a11y-gold/`. |
| Gold keyboard/reduced-motion checks | PASS locally — 33 enabled controls were keyboard reachable with visible focus and produced expected feedback; reduced-motion preference reached all 40 renderers. |
| Gold data-resource state fixtures | PASS locally for `advanced-data-table`, `timeline`, `dashboard-kpi-grid`, `notification-centre`, `time-series-chart` and `kanban-board` at 360x844 — empty states, large inputs, long content, filtering, keyboard actions, notification prop updates, truthful sample labels on four charts, document width, and console/page/network diagnostics. Screenshots and machine diagnostics: [`gold-resource-states-final.json`](../audit/evidence/step-06/results/gold-resource-states-final.json). |
| Linux compact-header regression | PASS locally — `marketing-nav-cta` at outer widths 360px and 390px measured exact document/frame widths of 292/292px and 322/322px, no overlap, console errors or failed/HTTP requests. The prior Linux CI failure measured 316–321px inside a 292px frame; before evidence is retained as a log excerpt because CI did not upload screenshots. After screenshots and machine diagnostics: [`marketing-nav-cta-responsive.json`](../audit/evidence/step-06/results/marketing-nav-cta-responsive.json). |
| Navigation/control regression | PASS locally — all 324 previews were checked for dead fragment links; visible action feedback, mega-menu disclosure and mobile drawer behavior passed. |
| `pnpm typecheck` | PASS — all 22 workspace packages. |
| `pnpm lint` | PASS — 0 errors, 51 existing warnings. |
| `pnpm test` | PASS — 54 files, 612 tests. |
| `pnpm audit:all` | PASS — 16/16 release gates, build, bundle budgets, catalogue licence/provenance and secret/security audits. |
| `pnpm test:e2e` | PASS — 73/88 regular browser tests passed, 15 explicitly skipped; all 6 Sites Worker tests passed, including the new 40-resource × 3-variant Axe scan. The flagship acceptance journey and standalone export passed; Gold state fixtures cover six resources; compact-width regressions and the 324-resource matrix passed. Aggregate: [`e2e-suite-final.json`](../audit/evidence/step-06/results/e2e-suite-final.json). |

The full catalogue and Gold browser reports reference 183 saved screenshots
under `audit/evidence/step-06/after/` and record zero missing screenshot paths.
The additional state and marketing-header reports reference 16 after-state screenshots; four earlier empty-state baselines, two Kanban copy baselines and four chart sample-data baselines are preserved separately. All 217 unique screenshot paths referenced by the runtime audit and final E2E reports exist.

An earlier catalogue-matrix attempt recorded 39 iframe execution-context errors
when the test switched variants before the prior preview finished loading. The
diagnostic is preserved as [`catalog-324-variant-race.json`](../audit/evidence/step-06/results/catalog-324-variant-race.json).
The test now waits for iframe load and outstanding page requests; the final
official run completed with zero such errors, failed requests or cancellations.

## Findings and remediation

The local browser audit has **66 defects** recorded: 7 High and 59 Medium. The
original 29 include enabled actions without behavior, 52 placeholder navigation
links, compact-width overflows, an undisclosed menu state and an unsupported
operational-status claim. The expanded resource matrix found a malformed Astro
resource-detail title/layout, 11 compact-preview overflows and a separate narrow
activity-text and cross-platform header regressions. A Linux CI run later exposed
three additional 360px preview overflows in command-first navigation, feature tabs
and gradient accent text; each now has a responsive fix and passed the rebuilt
324-resource browser matrix. Every issue has its own machine-readable record with
reproduction, root cause, affected code, remediation and evidence references in
[audit/RUNTIME_AUDIT.md](../audit/RUNTIME_AUDIT.md) and
[audit/runtime-audit.json](../audit/runtime-audit.json). The data-state probe
found eight defects across the advanced table, timeline, KPI grid, notifications,
time-series chart and kanban board. These include blank empty states, stale
notification inputs, missing action feedback and a false zero chart value. Each
was reproduced before fixing and now passes the browser state regression.
The chart review additionally found four unlabeled synthetic datasets presented as live operational data. Each now uses sample-specific copy and an explicit illustrative-data disclaimer. Browser assertions cover the preview title and disclosure, and before/after captures are preserved. The full Gold Axe scan then found 26 violations across 120 resource variants: 23 contrast failures and three missing Input labels. Six root causes were fixed and the same full scan now reports zero violations. The Kanban review found an empty-state message promising unavailable add actions and fabricated resource totals; both defects have failing-before/passing-after assertions and before/after screenshots.

All 66 fixes pass local resource-specific browser regressions and the full
catalogue/Gold render matrices. Their machine-readable status remains
`fixed-awaiting-deployed-verification`; none is closed because the public review
Site has not been updated and re-audited. Before and after screenshots are
under `audit/evidence/step-06/`. Ten of the 11 earlier catalogue overflow
defects have no retained before screenshot because their original Playwright
output directory was cleared before preservation. The three later Linux CI
findings also have no screenshot baseline; their measured widths and DOM
geometry are recorded in the CI log excerpt. These evidence gaps are recorded
per issue; no screenshot has been reconstructed or presented as a baseline.

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
- Added isolated state fixtures for empty, long and large datasets in six Gold
  data resources, including keyboard actions, notification updates and
  runtime/network diagnostics.
- Corrected the marketing CTA header after Linux CI measured overflow that was
  not reproduced by the initial Windows matrix; retained the failing CI geometry,
  added 360/390px overlap/overflow checks and saved after screenshots.
- Corrected three compact resource layouts identified by Linux CI: command-first
  navigation now reflows its search field, feature tabs wrap with compact spacing,
  and gradient headlines reduce padding/type size and wrap long words.

## Remaining before Step 06 can close

- Expand Gold state coverage to interactive, loading, error, empty, long-text and large-data cases for every applicable resource, including disabled states. Existing state fixtures cover six data resources; the matrix does not yet certify every applicable Gold state.
- Run a manual screen-reader smoke with NVDA or VoiceOver and inspect zoom, target sizes and contrast beyond Axe. The 40 × 3 browser Axe matrix now passes, but it is not a substitute for assistive-technology review.
- Run the same resource and accessibility regressions against a published review Site during the public-RC phase before recording deployed closure.
- Push the current accessibility changes and confirm fresh Linux CI before considering the resource fixes fully closed.
