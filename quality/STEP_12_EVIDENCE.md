# Step 12 — Direction generation evidence

## Scope and result

I used the visible Compose UI at 1440×900 with the exact employee-experience brief
from the hardening plan. The catalogue reached its ready state. I entered the brief,
set Feel to `professional but playful`, selected `Refined` visual ambition and
`Inventive` structural creativity, composed, then opened the full preview for each
direction and selected `Team Overview`.

The three generated projects preserve the same seven product screens and have no
unresolved-role diagnostics. Their rendered approaches are materially distinct:

| Direction | Grammar | Navigation | Dashboard hierarchy | Activity resource |
| --- | --- | --- | --- | --- |
| A — Calm Foundation | `classic-sidebar-dashboard` | sidebar | sidebar shell → main content | `notification-centre` |
| B — Expressive Horizon | `product-proof-marketing` | top navigation | vertical page canvas | `notification-centre` |
| C — Adaptive Architecture | `three-pane-intelligence-workspace` | rail | dock shell → content canvas with parallel table and timeline columns | `timeline` |

The topologies are visible in the before/after screenshots. A keeps navigation in a
left sidebar; B moves it above the page; C uses a left navigation dock, a central
data table and a right activity timeline. A and B use the existing notification
panel for the same role; C's narrower companion pane uses the existing Gold
Timeline resource, with the same employee-specific events bound into it. Pairwise
selected-resource Jaccard overlap after the change is 0.93 for A/B, 0.87 for A/C,
and 0.93 for B/C. This is evidence that the page plan remains stable while the
navigation, hierarchy, content grouping, resource choice and visual treatment vary.

## Defects and remediation

### DIR-001 — Direction C did not form a usable two-column content row (P1)

- **Evidence:** the initial 1440×900 preview placed the dashboard's activity feed
  and people table at the same x-coordinate, 257px. After assigning separate
  columns, the activity feed moved to x=1010px but remained at y=211px while the
  table began at y=556px, leaving the left half of the feed row empty. The failing
  `before-alignment` capture records those coordinates.
- **Reproduction:** Compose the exact brief, open Direction C, choose `Team Overview`,
  and inspect the workspace below the KPI summary. The initial test failed because
  both components occupied the first column; a strengthened test then failed because
  their vertical coordinates differed by 345px.
- **Root cause:** the shared renderer placed the data table in column 1 but did not
  place the activity feed in column 2. Once that was fixed, composition order still
  put the activity feed before the data table in the DOM. Grid auto-placement therefore
  started the table on the following row.
- **Affected code:** `packages/renderer/src/layout-contract.ts`,
  `packages/compatibility/src/compose-pipeline.ts`.
- **Fix:** give the activity feed column 2 in the existing ≥900px workspace rule,
  and order the structural alternative's data table before its activity feed. Both
  now auto-place on the same row. Below that container breakpoint, the grid remains
  a single-column stack.
- **Verification:** the visible UI regression failed before the row-order correction
  (table y=556px, feed y=211px) and passes afterward (both y=454px). The after
  screenshot shows populated employee rows beside the employee timeline. Deployed
  verification remains open for Step 45.

### DIR-002 — Direction C repeated Direction B's activity resource (P2)

- **Evidence:** the pre-fix UI journey's visible manifest details showed
  `notification-centre` for the `activity-feed` role in both B and C. That kept the
  structural alternative's content treatment identical to B inside its new pane.
- **Reproduction:** Compose the exact brief, inspect the `Team Overview` screen in B
  and C, then expand `Design DNA and resource references` in both previews.
- **Root cause:** role scoring picked the same notification panel for every
  direction, despite C's contextual side-pane layout and the existing compatible
  Timeline resource.
- **Affected code:** `packages/compatibility/src/compose-pipeline.ts`.
- **Fix:** for structural-alternative activity feeds, prefer the existing `timeline`
  resource when it is present in the catalogue; otherwise keep ordinary role scoring
  so a partial catalogue can still compose safely.
- **Verification:** the visible UI journey asserts A/B select `notification-centre`
  and C selects `timeline`; all directions still render with zero unresolved
  resources. Deployed verification remains open for Step 45.

## Browser evidence

The regression test is `tests/e2e/direction-generation-audit.spec.ts`. It exercises
Compose and each preview through visible controls; it does not access Workbench stores
or composer internals. It records actual rendered geometry, direction metadata,
selected resource slugs and variants, diagnostics, browser console errors, uncaught
exceptions, failed requests and HTTP errors in machine-readable JSON.

Before screenshots and runtime data:

- `quality/evidence/directions/before/direction-01-team-overview.png`
- `quality/evidence/directions/before/direction-02-team-overview.png`
- `quality/evidence/directions/before/direction-03-team-overview.png`
- `quality/evidence/directions/before/runtime.json`
- `quality/evidence/directions/before-resource/runtime.json` records the duplicate
  activity resource failure after the first column assignment but before the resource
  fix; it also captures the still-misaligned row now documented under DIR-001.
- `quality/evidence/directions/before-resource/direction-03-team-overview.png` shows
  the table and activity panel in separate columns with the old notification
  resource, before the Timeline selection and row-order corrections.
- `quality/evidence/directions/before-alignment/runtime.json` records the intermediate
  misaligned row after the first column fix; the strengthened browser assertion fails
  with a 345px top-coordinate difference.

After screenshots and runtime data:

- `quality/evidence/directions/after/direction-01-team-overview.png`
- `quality/evidence/directions/after/direction-02-team-overview.png`
- `quality/evidence/directions/after/direction-03-team-overview.png`
- `quality/evidence/directions/after/runtime.json`

The after record reports empty arrays for console errors, uncaught exceptions, failed
requests and HTTP errors. It confirms the expected dashboard root roles, navigation
models, distinct grammars, identical screen plan, zero unresolved diagnostics, and
the activity feed at (1010px, 454px) beside the table at (257px, 454px) for C.

## Checks run

- The browser regression failed before each corresponding fix: Direction C's initial
  same-column placement, its 345px row misalignment after the first layout change,
  and its repeated activity resource.
- `pnpm exec vitest run packages/compatibility/src/__tests__/compose-pipeline.test.ts packages/compatibility/src/__tests__/direction-previews-fidelity.test.tsx` — 6 tests passed.
- `pnpm test` — 787 tests passed across 61 files.
- `pnpm typecheck` — all 22 workspace projects passed.
- `pnpm lint` — 0 errors; the existing 51 warnings remain within the configured limit.
- `pnpm build` — passed; 717 Astro pages built. The existing Vite advisory about a
  chunk above 500 kB remains unchanged.
- `pnpm exec playwright test tests/e2e/direction-generation-audit.spec.ts --project=desktop-chrome` — passed at 1440×900.
- `pnpm test:e2e` — passed: default Chromium suite 106 passed / 58 explicitly
  skipped; Sites Worker suite 28 passed, including all 324 catalogue resources and
  Gold variant/state checks; standalone preview app suite 3 passed.
- `pnpm audit:all` — all 16 release gates, build budgets, 324-resource
  licence/provenance audit and security/secrets audit passed.
- The previous branch SHA `cc4986dc32b7ceb2bc9651e2fd407fcf0c6b107d` completed hosted CI,
  including Playwright/Axe. The Step 12 commit still requires its own hosted PR CI.

This is local Step 12 evidence, not a public deployment audit. The remaining
multi-width direction checks are covered by the later responsive gate; public review
Site confirmation remains scheduled for Step 45.
