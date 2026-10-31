# Step 14 — Composition quality evidence

## Scope and current status

The new `quality/COMPOSITION_QUALITY_BENCHMARK.json` carries the 100 manually
adjudicated no-override briefs and their semantic acceptance profiles into the
composition layer. `composition-quality-benchmark.test.ts` generates directions
A/B/C for every brief and checks 300 manifests for schema validity, audience and
workflow relevance, cross-domain residue, route integrity, Gold/Core resource
eligibility, mobile strategy, truthful illustrative metrics, resolved roles,
standalone Vite source-tree generation without Tessellate runtime dependencies,
and structural differences across at least two axes. These checks verify
generation and resource source resolution; clean install/build/browser checks
for benchmark exports remain in Step 23.

Step 14 is **complete locally**. The visible Compose benchmark covers 100 adjudicated briefs and all three directions at 1440 × 900, 768 × 1024, and 390 × 844. All three reports were captured from source commit `fbfe17db24a076c152ac7905334437053a23d346`; each records the visible Product Architecture summary and all 38 Design DNA fields for each direction. The reports contain 300 directions each, with zero unresolved diagnostics, console errors or warnings, uncaught exceptions, failed requests, and HTTP errors. All 30 contact sheets were visually reviewed, together with the full-size flagship direction captures at desktop and mobile. The directions retain readable layouts and visibly distinct navigation, composition grammar, and component-role structures. The flagship architecture identifies Employee Experience, preserves the 500-person input, and uses people, teams, onboarding, engagement, and policy content without finance or observability residue. The before/after AI-03 Direction 02 captures show the resource contrast correction at full size. AUD-134–142 record current content, contrast, keyboard-accessibility, and responsive findings. Resource-level Axe and responsive regressions pass locally; runtime findings remain open until a deployed review Site is checked during Step 45.

AUD-140 was reproduced in the visible product and by Axe against all 40 Gold resources in expressive variants on dark canvases. Before the fix, 16 resources failed contrast, including 1.44:1 table values, 1.53:1 profile badges, and 2.20:1 muted labels on white. Resource-local semantic text tokens and opaque expressive surfaces fix the shared cause. The desktop 40-resource report is `quality/evidence/step-14/accessibility/gold-expressive-dark-after.json`; the mobile report is `quality/evidence/step-14/accessibility/gold-expressive-dark-mobile-after.json`. Before and after screenshots are `quality/evidence/step-14/manual-review/versions/87a90100/desktop/ai-03-direction-02.png` and `quality/evidence/step-14/manual-review/current/desktop/ai-03-direction-02.png`. The source fix is commit `79e780b1`; deployed review verification remains pending.

The PR mobile Axe gate then exposed AUD-141: scrollable regions in Error State,
Feature Matrix, and Three-Pane App Shell were skipped by keyboard navigation.
Local reproduction failed on Feature Matrix and Three-Pane; the CI run also
identified Error State. The resources now provide focusable, labelled scroll
regions with visible focus. AUD-142 was found in the same inspection: the
three-pane shell's fixed desktop columns clipped the inspector at 390px despite
declaring a mobile collapse strategy. It now stacks navigation, canvas, and
inspector on phones and retains its columns at desktop width. The 40-resource
mobile Axe sweep and six focused browser checks pass locally. Desktop/mobile
after screenshots and desktop/mobile Axe reports, each containing the exact fix
SHA and viewport, are committed under `quality/evidence/step-14/accessibility/`;
hosted verification remains pending.

The follow-up timeline review found literal “Example” labels in
activity timestamp positions across generated product domains (AUD-124); its
benchmark failure was reproduced and fixed, and desktop/mobile visible-browser
checks now pass with clean console and network reports. The latest FIN-05
screenshots exposed a fintech
trading brief that inherited banking workflows (AUD-119), generic “Example” KPI
values (AUD-120), and status copy crammed into two columns on mobile (AUD-121).
The interpretation/composition benchmarks and visible Compose tests now check
market-specific screens, truthful unavailable-data values, and actual responsive
grid columns. The follow-up SaaS visual review found repeated generic workspace
branding (AUD-122) and a duplicated page/KPI heading (AUD-123); both now have
red-to-green visible-browser regressions and desktop/mobile before/after captures.
The preview review then found placeholder timeline timestamps across the benchmark
set (AUD-124); the benchmark and visible desktop/mobile browser regression now
pass, with before/after captures recorded.
The next content review found AUD-125–127: a real-estate search screen rendered
generic marketing cards under a false map title, marketplace search inherited
onboarding copy, and a travel hero repeated its objective. AUD-128 exposed a
Filter Builder whose apparent controls were static and inserted a canned rule.
AUD-129–130 found unrelated proposal/review search rows and fabricated numeric
progress values. Mobile screenshots then exposed AUD-131–132: important table
fields were clipped offscreen, and unavailable values used the success color.
The screen planner/content bindings, editable filter state, and shared table
renderer now address those root causes. Visible Sites Worker regressions cover
all three directions at desktop/mobile widths and the Filter Builder add/edit/
remove flow; before/after screenshots and clean console/network reports are
recorded. These local checks do not close the findings until a deployed review
version is audited.
The current-source flagship review found AUD-133: employee KPI badges said “No
connected data” while using the green success treatment. A visible Playwright
regression first failed on the employee UI, then passed after the shared KPI
resource classified no-data states as neutral. Desktop/mobile before/after
captures and clean runtime reports are recorded; deployed verification remains
open.
The full-size flagship and tablet reviews are complete. Independent clean-install/build/runtime verification of benchmark exports remains in Step 23. This checkpoint does not claim public review-site verification.

The local fixes for AUD-101–105 and AUD-107–110 are in commit
`8686e0b9d7e7aca869a7677113492ded53af27b6`. The runtime audit records this SHA
for those findings; they remain open to release until the public review Site is
verified during Step 45.

The visible UI review found AUD-111 through AUD-115. AUD-111 fixed e-commerce
conversion actions that said “Continue onboarding” and linked to a missing
overview fragment. AUD-112 specialized an explicit returns-portal brief away from
a new-purchase storefront and checkout plan. AUD-113 removed the blank fourth
Feature Bento card for three-item input. AUD-114 preserves the returns-service
explanation on the disabled request action. AUD-115 removes the duplicated
product navigation from the returns form. Red semantic/browser regressions were
recorded for the underlying failures; the rebuilt local Site now passes the CTA
and returns workflows, and the Sites Worker passes the partial Bento state. All
remain awaiting deployed review verification.

The full-benchmark screenshot review found AUD-116–118 in an ordinary SaaS
overview. The fixed pipeline uses `timeline` for ordinary activity and reserves
`notification-centre` for explicit Notifications, Inbox, and Alerts screens. The
shared content binder labels generated event times as “Example”, humanizes
workflow steps, and gives the feed a distinct “Recent activity” heading. The
benchmark regression passed for all 100 briefs and all three directions after
being verified red on SAS-01 Direction A. A separate visible Compose test
recomposes the SAS-01 brief and checks all three rendered directions at
1440 × 900 and 390 × 844. Screenshots and machine-readable console/network
reports are under `quality/evidence/step-14/manual-review/after/`. Local browser
reports show zero console errors, uncaught exceptions, failed requests, or HTTP
errors. All three findings await deployed review verification.

The FIN-05 brokerage terminal review found that `fintech` defaults had assigned
retail banking workflows to explicit trading intent. The before screenshot at
`quality/evidence/step-14/manual-review/before/full-benchmark-initial/desktop/fin-05-direction-01.png`
shows Account Balances and a bank-statement event. A focused specialization now
produces Market Overview, Order Book, Positions & Risk, and Trade History, with
market-depth and equity-trade examples; the 100-brief interpreter and composition
tests were red before the specialization and pass afterward. The visible browser
test opens and checks all three directions at 1440 × 900 and 390 × 844. Captures
and runtime reports are under
`quality/evidence/step-14/manual-review/after/fintech-trading-*`. The browser
reports contain zero console errors, uncaught exceptions, failed requests, or
HTTP errors. This remains awaiting deployed review verification.

The same before screenshot showed generic KPI values rendered as the literal
word “Example”. Composition now uses an em dash when source data is unavailable,
states when market data or another connection is missing, and marks brief-derived
values without calling them examples. Unavailable status badges use neutral
styling. The composition benchmark failed on FIN-05 before this change and now
checks all benchmark briefs for placeholder metric values.

The mobile FIN-05 capture also showed “Market data not connected” split across
multiple narrow lines because the Gold KPI resource forced two columns at small
widths. A screenshot was preserved at
`quality/evidence/step-14/manual-review/before/fintech-kpi-mobile-before-layout.png`.
The resource now uses one column in compact containers, two at intermediate
widths, and three at wide widths; the browser test checks computed grid columns,
not just the absence of page overflow. The after mobile capture and report are in
the same `fintech-trading-*` evidence directory. Both KPI changes await deployed
review verification.

## Browser findings fixed locally

### AUD-101 — Freelance marketplace messaging inherited unrelated booking workflows (high)

- **Evidence:** the before screenshot at
  `quality/evidence/composition-quality/before/composition-mkt-01-direction-01.png`
  showed a freelance designer/client inbox containing “message host”, “complete
  booking”, “choose dates”, “confirm payment”, and a seller-side asset upload flow.
  The matching after screenshot replaces these with a project inquiry and proposal
  exchange. The browser report is
  `quality/evidence/composition-quality/after/runtime.json`.
- **Reproduction:** open `/compose` at 1440 × 900; enter benchmark brief MKT-01;
  compose; inspect Direction A's `Messages & Inquiries` screen.
- **Root cause:** the marketplace archetype's generic accommodation/transaction
  workflows and screen purposes were reused for freelance services without
  specializing the existing archetype from the brief's service and proposal terms.
- **Affected code:** `packages/composer/src/domain-context.ts`,
  `packages/composer/src/interpreter.ts`, and contextual resource copy in
  `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** specialize marketplace workflow and screen language for
  freelance services while preserving distinct appointment, used-goods and
  instrument-marketplace contexts. The 100-brief benchmark rejects booking and
  seller-upload residue in MKT-01.
- **Verification:** the regression failed before the fix on “complete booking”; it
  passes across all three directions after the change. The local browser report
  records zero unresolved roles, console errors, uncaught exceptions, failed
  requests, or HTTP errors.
- **Disposition:** fixed locally; awaiting deployed review verification.

### AUD-102 — Community activity was composed as a notifications inbox (high)

- **Evidence:** the before screenshot at
  `quality/evidence/composition-quality/before/composition-con-04-direction-01.png`
  rendered the community's Activity Stream with a notification resource and a
  “Mark all as read” control. The after screenshot uses a chronological timeline
  with group updates and member conversations.
- **Reproduction:** open `/compose` at 1440 × 900; enter benchmark brief CON-04;
  compose; inspect Activity Stream in Directions A, B and C.
- **Root cause:** the shared `activity-feed` role allowed the notification centre,
  whose inbox semantics conflict with casual community posts and conversations.
- **Affected code:** `packages/compatibility/src/compose-pipeline.ts` and
  `packages/compatibility/src/semantic-roles.ts`.
- **Remediation:** prefer the Gold chronological timeline for consumer community
  activity and retain notification-centre only where inbox semantics are intended.
  The benchmark now asserts that the consumer Activity Stream resolves to
  `timeline` in all three directions.
- **Verification:** the regression failed before the fix for Directions A/B; it
  passes for all three. The browser evidence has no unresolved role or runtime
  failures.
- **Disposition:** fixed locally; awaiting deployed review verification.

### AUD-104 — Community activity screen contained irrelevant placeholder KPI cards (medium)

- **Evidence:** the before community preview displayed four em-dash values and
  “Connect your data” prompts despite having no data integration. An intermediate
  capture then showed unrelated Profile, Group, Community Update and Notification
  cards labelled “Example”. The final screenshot removes this generic metric section.
- **Reproduction:** compose CON-04 and inspect the Activity Stream summary area in
  all three directions.
- **Root cause:** the generic dashboard grammar required metric cards even when the
  community Activity Stream had no relevant summary data.
- **Affected code:** `packages/composer/src/planner.ts` and
  `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** omit the KPI role from community Activity Stream planning rather
  than presenting entity names as measurements.
- **Verification:** the 100-brief benchmark requires no KPI resource on CON-04's
  activity screen in any direction. The rebuilt production preview and all three
  screenshots show only the community feed.
- **Disposition:** fixed locally; awaiting deployed review verification.

### AUD-105 — Profile header included an unrelated hardcoded summary (medium)

- **Evidence:** the before community screenshot showed “Example profile summary”
  at the far right of the profile header despite no corresponding prop or
  community-profile content. The after screenshot removes the static phrase.
- **Reproduction:** compose CON-04 and inspect the header in any direction.
- **Root cause:** the reusable `entity-profile-header` resource rendered static
  summary copy outside its typed props, so composition could not bind relevant
  text or suppress it.
- **Affected code:** `resources/blocks/entity-profile-header/index.tsx` and its
  generated registry/export source `packages/exporter/src/generated-gold-sources.ts`.
- **Remediation:** remove the hardcoded summary and keep header content bound to
  declared props.
- **Verification:** after rebuilding the catalog, the generated resource source
  and the three browser previews contain no “Example profile summary”.
- **Disposition:** fixed locally; awaiting deployed review verification.

### AUD-103 — Marketplace messaging roles had no explicit Gold resource contract (high)

- **Evidence:** the initial 100-brief composition run reported unresolved required
  roles for marketplace message layouts. The after browser report lists
  `channels-rail`, `message-thread`, and `message-composer` resolved respectively
  to `collapsible-sidebar`, `timeline`, and `input` in all three directions.
- **Reproduction:** run the composition quality benchmark without role mappings;
  inspect the unresolved-role assertions for marketplace message screens.
- **Root cause:** the semantic-role allowlist had no contracts for channels rails,
  message threads or message composers, so generic resource scoring could not
  guarantee the required runtime resources.
- **Affected code:** `packages/compatibility/src/semantic-roles.ts` and
  `packages/compatibility/src/compose-pipeline.ts`.
- **Remediation:** add explicit Gold role mappings and prevent a channels rail
  from receiving a duplicate generic navigation resource. Bind the composer to
  the existing Input resource with helper copy that states messaging requires a
  connected backend.
- **Verification:** the benchmark asserts exact resource slugs and truthful
  composer helper copy for every generated messaging screen; the browser journey
  reports no unresolved-resource diagnostics.
- **Disposition:** fixed locally; awaiting deployed review verification.

### AUD-107 — Community timeline exposed internal workflow identifiers (medium)

- **Evidence:** `quality/evidence/composition-quality/before/community-intermediate-metrics-direction-01.png` shows generic “Step 1” labels and identifiers such as `choose-community` and `publish-community-event`. The after capture uses explicitly labelled examples with natural-language activity copy.
- **Reproduction:** compose CON-04 and read the Direction A Activity Stream timeline.
- **Root cause:** generic workflow binding copied internal workflow step IDs into user-facing descriptions.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** bind contextual community activity examples instead of serializing workflow identifiers.
- **Verification:** the benchmark rejects internal step tokens and the browser test checks the rendered text. Deployed verification remains open.

### AUD-108 — Community Activity Stream repeated its screen heading (medium)

- **Evidence:** the intermediate screenshot titled both the main screen and timeline card “Activity Stream”. The after screenshot distinguishes the card as “Latest community updates”.
- **Reproduction:** compose CON-04 and compare the screen header with the timeline heading.
- **Root cause:** activity-feed content defaulted to the screen name even where an overview header already used it.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** use a contextual heading for the community feed.
- **Verification:** benchmark and browser assertions pass locally; deployed verification remains open.

### AUD-109 — Direction C left most of a community activity canvas empty (medium)

- **Evidence:** the before screenshot `quality/evidence/composition-quality/before/composition-con-04-direction-03.png` places the only feed in the narrow right grid column. The after screenshot fills the content width, and the browser regression compares feed width with its parent grid.
- **Reproduction:** compose CON-04, select Direction C, and inspect the Activity Stream workspace at 1440 × 900.
- **Root cause:** the shared multi-pane layout always assigned activity-feed to column two, even without a data-table sibling.
- **Affected code:** `packages/renderer/src/layout-contract.ts`.
- **Remediation:** mark activity-only workspace nodes and span their feed across the available column.
- **Verification:** the production preview confirms at least 95% width utilization. Deployed verification remains open.

### AUD-110 — Employee dashboard included invented summary values (medium)

- **Evidence:** the before flagship screenshot `quality/evidence/directions/before/direction-01-team-overview.png` shows an unprovided count of 12 journeys and a Positive team pulse. The current UI capture retains the brief's 500-person value and labels other values Example / Illustrative only.
- **Reproduction:** compose the exact employee-experience brief and inspect Direction A's Team Overview KPI cards.
- **Root cause:** the employee content binder inserted plausible count and sentiment values without an input source.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`.
- **Remediation:** use the supplied employee count only and mark remaining summary values as illustrative.
- **Verification:** the composition benchmark checks employee summary-card provenance, and the visible browser journey records updated desktop screenshots. Deployed verification remains open.

### AUD-113 through AUD-115 — E-commerce detail verification

The post-fix ECOM-06 browser test inspects Order Lookup, Return Request, and
Refund Status in each of the three directions. It verifies the request form is
truthfully disabled until a returns service is connected, the disabled title
identifies that service, and the refund timeline contains return-specific sample
events. It also checks the Return Request canvas renders only one navigation
landmark. Direction C screenshots are in
`quality/evidence/step-14/manual-review/after/ecom-06-return-request-direction-03-desktop.png`
and `quality/evidence/step-14/manual-review/after/ecom-06-return-request-direction-03-mobile.png`;
the refund timeline appears in `ecom-06-direction-03-desktop.png` and
`ecom-06-direction-03-mobile.png` in the same directory. The storefront CTA
regression also has separate desktop/mobile screenshots and runtime reports under
`after/`. All four browser reports record zero console errors, uncaught errors,
failed requests, or HTTP errors.

The isolated Sites Worker test supplies exactly three feature items, verifies
three non-empty cards and no horizontal overflow at 390 × 844 and 1440 × 900,
and captures the full resource page at both widths under
`audit/evidence/step-06/after/gold-state-matrix/feature-bento-three-items-*.png`.
The before image shows the empty fourth card at
`quality/evidence/step-14/manual-review/before/feature-bento-three-items-order-lookup-desktop.png`.
The focused Sites Worker regression asserts three non-empty cards and clean
browser diagnostics at both widths.

### AUD-122 — Generic workspace branding repeated the word Workspace (medium)

- **Evidence:** the desktop and mobile before captures in
  `quality/evidence/step-14/manual-review/before/aud-122-workspace-brand-duplicate-*`
  show “Workspace Workspace” with a “WW” avatar. The after captures replace them
  with “Team Workspace” and “TW”.
- **Reproduction:** compose benchmark brief SAS-01 and open Direction 01's Overview
  Dashboard at 1440 × 900 or 390 × 844.
- **Root cause:** the shared content binder appended “Workspace” to the first
  inferred entity even when that entity was already named Workspace.
- **Affected code:** `packages/compatibility/src/content-bindings.ts` and the
  visible browser regression in `tests/e2e/composition-quality-smoke.spec.ts`.
- **Remediation:** use “Team Workspace” for a generic Workspace entity, preserve
  existing Workspace suffixes, and derive initials from the final brand.
- **Verification:** the visible assertion failed at desktop and mobile before the
  fix; both browser runs pass and the after screenshots were visually inspected.
  Local runtime reports record zero browser/network errors. Deployed verification
  remains open.

### AUD-123 — SaaS overview repeated its page heading above KPI cards (medium)

- **Evidence:** the before captures at
  `quality/evidence/step-14/manual-review/before/aud-123-duplicate-kpi-heading-*`
  show two exact “Overview Dashboard” headings. The after captures retain one
  page heading and label the metric section “Key metrics”.
- **Reproduction:** compose benchmark brief SAS-01 and open Direction 01's Overview
  Dashboard at 1440 × 900 or 390 × 844.
- **Root cause:** generic metric-card sections fell back to `screen.name`, repeating
  the parent page heading.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the
  composition benchmark, and the visible Compose browser regression.
- **Remediation:** assign generic metric-card roles a “Key metrics” heading while
  retaining employee and returns-specific labels.
- **Verification:** the visible browser assertion found two page headings at both
  viewport sizes before the fix. The 300-direction composition benchmark and the
  desktop/mobile browser journey now pass. Deployed verification remains open.

### AUD-124 — Timeline sample data used “Example” as a timestamp (medium)

- **Evidence:** the desktop and mobile before captures in
  `quality/evidence/step-14/manual-review/before/` show the activity feed's
  timestamp label rendered as “EXAMPLE”. The composition benchmark found the
  placeholder in activity feeds across 51 brief cases.
- **Reproduction:** compose the SAS-01 consultancy workspace brief at 1440 × 900
  or 390 × 844, open Direction 01's Overview Dashboard, and inspect Recent
  activity.
- **Root cause:** the shared content binder used the sample marker as the
  timeline's time value for generic and several domain-specific feed examples.
- **Affected code:** `packages/compatibility/src/content-bindings.ts`, the
  composition-quality benchmark, and the visible Compose browser regression.
- **Remediation:** use deterministic relative labels such as Today, Yesterday,
  and Earlier this week; keep sample provenance in the existing example banner.
- **Verification:** the new 100-brief benchmark failed before the fix (51 failing
  brief cases) and passes after it. Desktop and mobile visible-browser assertions
  pass; after captures and runtime reports show zero browser/network errors.
  Deployed review verification remains open.

## Browser evidence

The Playwright journey uses the visible `/compose` UI and captures every full
preview for MKT-01 and CON-04. The marketplace previews fit their dialog. Community
previews intentionally overflow the dialog vertically; the test scrolls to the
end, verifies the final content remains reachable, and saves continuation
screenshots. Runtime report:
`quality/evidence/composition-quality/after/runtime.json`.

The exact flagship employee brief was also entered through the visible Compose
controls, and all three Team Overview previews were captured in
`quality/evidence/directions/current/`. These screenshots show the 500-person
figure taken from the brief and clearly marked illustrative values for onboarding
and team pulse. The browser report records Design DNA, screen list, navigation,
grammar, selected resources, diagnostics, geometry, console errors, failed requests
and HTTP errors.

- Viewport: 1440 × 900.
- Directions: six full previews, all three directions for each brief.
- Unresolved resources: zero.
- Console errors and uncaught exceptions: zero.
- Failed requests and HTTP errors: zero.
- Red-to-green semantic checks: generic booking workflow, consumer inbox resource,
  and missing messaging role contracts failed before the fixes and pass now.
- The benchmark caught a temporary one-character monogram regression in 76 briefs
  during remediation. The follow-on entity-derived mark check passes after restoring
  context-rich workspace names and two-character initials; the two public showcase
  routes now have dedicated browser regressions.
- The initial 46b53fcb full-benchmark report remains baseline evidence. Its screenshots expose defects fixed later and do not certify current output. The current run is archived separately with the tested source SHA.
- Distinctness: every pair must differ across at least two of navigation model,
  composition grammar, semantic component roles, and selected resources. The
  benchmark now compares component-role structure instead of screen names, which
  remain intentionally consistent across directions.

## Local validation

- `pnpm install --frozen-lockfile` — passed; all 23 workspace projects were
  already current.
- `pnpm build:catalog` — passed; 324 resources validated, Gold registry rebuilt.
- Focused interpreter and composition benchmarks — all 100 reviewed briefs
  passed, including the explicit fintech-trading profile.
- `pnpm test` — 902 tests passed across 63 files.
- `pnpm typecheck` — all 22 projects passed.
- `pnpm lint` — zero errors; 51 existing warnings.
- `pnpm audit:all` — all 16 release gates passed; the production build emitted
  717 pages and bundle budget, provenance, licence, and security audits passed.
- Playwright public desktop/mobile suite — 121 passed and 61 explicitly skipped.
  The Sites Worker suite passed after the first run exposed a stale test selector
  following the mobile-card change; its corrected state test now checks the actual
  mobile layout. The full Worker suite passed 45 tests, with 27 explicitly skipped,
  including all 324 resources at certified widths. The standalone preview suite
  passed all 3 tests.
- The same E2E run passed the Compose activity/trading regressions at 1440 × 900
  and 390 × 844, including the truthful missing-data metric state and computed
  one/three-column KPI layout. Runtime reports record zero console errors,
  uncaught exceptions, failed requests, or HTTP errors.
- Focused composition browser journey — passed at 1440 × 900 and 390 × 844 with
  clean console/network reports and separate screenshots for each viewport.
- Flagship direction browser journey — passed at 1440 × 900 with three visible
  direction previews and zero unresolved roles, console errors, uncaught errors,
  failed requests or HTTP errors.
- `pnpm quality:composition-review` passed all 100 briefs and 300 directions at 1440 × 900, 390 × 844, and 768 × 1024. The reports are under `quality/evidence/step-14/manual-review/current/`; all identify source `fbfe17db24a076c152ac7905334437053a23d346` and record zero unresolved resources, console errors or warnings, uncaught exceptions, failed requests, or HTTP errors. Each direction includes the complete 38-field Design DNA snapshot; each brief includes the visible Product Architecture text.
- `pnpm quality:composition-contact-sheets` produced 30 sheets (ten per viewport), which were visually reviewed. The previews retain readable content and show distinct sidebar, top-navigation, and rail/workspace structures. The exact employee-experience case retains the 500-person figure and people, teams, engagement, onboarding, and policies content at all three sizes. Full-size Direction A/B/C screenshots are also captured at desktop; Direction C is captured at mobile.
- Structural comparison across all three reports: every pair differs in navigation model, composition grammar, and semantic component roles for all 100 briefs. A/B and A/C also select different resources in 89 cases; B/C share resource sets but remain structurally distinct. Machine-readable counts are in `quality/evidence/step-14/manual-review/current/direction-distinctness.json`.
- The prior 46b53fcb full capture remains baseline-only. AUD-134–138 were fixed locally and are included in the reviewed current outputs; issue-specific deployed checks remain scheduled for Step 45.
- Current-source `pnpm audit:all` — passed all 16 release gates, production build,
  bundle budget, provenance, and security/secret checks.

The local production build has existing chunk-size advisory output for Workbench
and the separate Vite preview app; the configured bundle budget audit passed.

The same browser pass inspected the AI and financial showcase routes at desktop
and mobile sizes. It confirmed the product brands and `PW` / `AW` initials, and
surfaced AUD-106: the first AI editor screen renders its global navigation twice
because `editor-toolbar` resolves to the same top-navigation resource. The finding
is recorded and deferred to the ordered showcase-hardening step (Step 43).

## Subsequent ordered gates

1. Step 15 covers catalogue loading/failure, retry, empty and invalid input,
   repeated composition, interruption, and mobile controls.
2. Step 23 independently installs, builds, and runs benchmark exports outside
   the monorepo.
3. Step 45 repeats release-critical browser checks against the public review
   Site; locally verified findings remain open for deployed verification.

The full unit test run also exposed a stale golden expectation for the Developer
Observability Platform: it expected generic Documentation, while the generated
architecture correctly contains Trace Explorer, Service Map, and Span Detail.
The fixture now uses the canonical screen IDs (`screen-trace-explorer`,
`screen-overview`, and `screen-span-detail`). This is test-data maintenance, not
a deployed product finding. The focused composer test passes (14/14), and the
full unit suite passes (63 files, 909 tests).
