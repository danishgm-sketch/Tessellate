# Step 14 — Composition quality evidence

## Scope and current status

The new `quality/COMPOSITION_QUALITY_BENCHMARK.json` carries the 100 manually
adjudicated no-override briefs and their semantic acceptance profiles into the
composition layer. `composition-quality-benchmark.test.ts` generates directions
A/B/C for every brief and checks 300 manifests for schema validity, audience and
workflow relevance, cross-domain residue, route integrity, Gold/Core resource
eligibility, mobile strategy, truthful illustrative metrics, resolved roles, and
structural differences across at least two axes.

Step 14 remains **in progress**. Nine full previews were inspected in real
1440 × 900 browser sessions: all three directions for marketplace MKT-01,
community CON-04, and the flagship employee-experience brief. The full manual
visual review of all 300 generated directions, and responsive review across the
full benchmark, are still required before this gate can be marked complete. This
checkpoint does not claim public review-site verification.

The local fixes for AUD-101–105 and AUD-107–110 are in commit
`8686e0b9d7e7aca869a7677113492ded53af27b6`. The runtime audit records this SHA
for those findings; they remain open to release until the public review Site is
verified during Step 45.

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
- Distinctness: all 100 benchmark cases must differ between every direction pair
  across at least two structural axes (navigation, grammar, hierarchy, and resource
  selection).

## Local validation

- `pnpm build:catalog` — passed; 324 resources validated, Gold registry rebuilt.
- Focused interpreter/planner/composition benchmark — 212 tests passed.
- `pnpm test` — 901 tests passed across 63 files.
- `pnpm typecheck` — all 22 projects passed.
- `pnpm lint` — zero errors; 51 existing warnings.
- `pnpm audit:all` — all 16 release gates passed, including production build,
  bundle budget, provenance and security audits.
- `pnpm test:e2e` — desktop/mobile suite 109 passed and 59 explicitly skipped;
  Sites Worker suite 28 passed, including all 324 resources at certified widths;
  standalone preview suite 3 passed.
- Focused composition browser journey — passed at 1440 × 900 with clean
  console/network report and the six preview screenshots above.
- Flagship direction browser journey — passed at 1440 × 900 with three visible
  direction previews and zero unresolved roles, console errors, uncaught errors,
  failed requests or HTTP errors.

The local production build has existing chunk-size advisory output for Workbench
and the separate Vite preview app; the configured bundle budget audit passed.

The same browser pass inspected the AI and financial showcase routes at desktop
and mobile sizes. It confirmed the product brands and `PW` / `AW` initials, and
surfaced AUD-106: the first AI editor screen renders its global navigation twice
because `editor-toolbar` resolves to the same top-navigation resource. The finding
is recorded and deferred to the ordered showcase-hardening step (Step 43).

## Remaining gate work

1. Manually inspect the generated output for all 100 briefs × 3 directions and
   attach adjudicated output-quality results, not just structural assertions.
2. Repeat composition visual checks at mobile/tablet widths and exercise Compose
   loading, failure, empty and invalid-input states under the Compose UX gate.
3. Re-run the same browser checks on the public review Site during Step 45; these
   local fixes are not closed for release until deployed verification succeeds.
