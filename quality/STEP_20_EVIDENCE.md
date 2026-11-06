# Step 20 — Structural operations

Step 20 checks the implemented structural operations through engine tests and
visible Workbench controls. `Rethink Structure` remains Lab-only because it has
no distinct operation contract; it is not presented as a Core operation.

The baseline 390 × 844 browser runs found one defect, AUD-156. Recompose and
Surprise Me changed the manifest and preserved the locked KPI subtree, but their
success explanations were absent from the active Pages tab. The before reports
record `mutationApplied: true`, `feedbackVisible: false`, and zero browser or
network errors. The shell now reads the shared action message and exposes it as a
polite status region beneath the toolbar whenever the Command tab is not active.

The engine suite covers Recompose divergence levels 20, 50, 70 and 95, with
exact subtree hashing for locked content, changed hierarchy at the intermediate
and radical levels, and unique node IDs. Surprise Me tests cover 20, 60 and 90,
with locked node preservation. The visible browser flow opens the Playful HR
showcase, selects Team Overview, locks the actual `dashboard-kpi-grid` node,
recomposes at 95%, then runs Surprise Me at 60%. At 1440 × 900 and 390 × 844 the
browser tests validate manifest exports, all 33 resource references against the
324-entry catalogue, exact locked subtree hashes, and exact undo/redo state. The
Surprise Me explanation agrees with the manifest DNA and navigation changes.

The locked node was `node-screen-overview-metric-cards-3`, resource
`res_blk_dashboard_kpi_grid` (`dashboard-kpi-grid`), variant `nocturne`, with its
original props and DNA overrides. Its canonical SHA-256 was
`5f2f23ca1b048a2673fecfba0be067840d393d0e24fdde204c16fe0b24e8b3ec` before and
after both structural operations. Recompose produced a `workspace-dock-shell`
with one `compound-workspace-pane`; Surprise Me produced a `sidebar-shell` with
`grid-dashboard-container`. Both operations restored the exact prior state on
Undo and the exact changed state on Redo.

The browser tests passed 4/4 across desktop and mobile. All reports show zero
console errors or warnings, uncaught exceptions, failed requests, and HTTP
errors. The mobile feedback region stays within the 390px viewport. Local build,
structural unit tests (8/8), and the two-operation browser suite pass. The full
unit/integration suite passes 913 tests; `pnpm typecheck` passes; lint passes with
zero errors and the existing 51-warning cap; `pnpm audit:all` passes all 16
behavioral release gates plus budget, licence/provenance, and security audits.
The full Playwright command passes 187 main-site, 45 Sites Worker, and 3 preview
tests; 94 additional cases are explicitly skipped by suite configuration. This
is local verification; the issue remains open for published review-version
checks in Step 45.

Before screenshots:

- [Recompose hid feedback on mobile](evidence/step-20/before/recompose-feedback-hidden-mobile-390.png)
- [Surprise Me hid feedback on mobile](evidence/step-20/before/surprise-feedback-hidden-mobile-390.png)

After screenshots:

- [Recompose mobile status](evidence/step-20/after/recompose-feedback-visible-mobile-390.png)
- [Surprise Me mobile status](evidence/step-20/after/surprise-feedback-visible-mobile-390.png)
- [Recompose desktop](evidence/step-20/after/radical-recompose-desktop-1440.png)
- [Recompose mobile](evidence/step-20/after/radical-recompose-mobile-390.png)
- [Surprise Me desktop](evidence/step-20/after/surprise-me-desktop-1440.png)
- [Surprise Me mobile](evidence/step-20/after/surprise-me-mobile-390.png)

Machine-readable reports and exported manifests are in
`quality/evidence/step-20/{before,after}/`. The local runtime finding and its
reproduction are documented as AUD-156 in `audit/runtime-audit.json` and
`audit/RUNTIME_AUDIT.md`.

### Public v77 follow-up — AUD-495 net variant feedback

The public flagship audit found that Surprise Me could report an intermediate variant transition with no net rendered change. With `split-product-hero` already rendered as Quiet, structural recomposition could temporarily choose Expressive, then Surprise Me selected Quiet again and reported `expressive → quiet`. The before/after UI captures and runtime report are in `audit/evidence/step-20/aud-495-surprise-net-variant/`.

A user-facing regression now asserts that Surprise Me changes the final rendered variant relative to its pre-operation value, and that the status describes the net result. It failed before the fix and passes after it (9/9 targeted tests); Workbench typecheck and targeted ESLint pass. The fix is commit `365295387776b6620f95d9705542b46a9cac256c`. The full local gates pass: 1,325 unit tests (one configured skip), 22 workspace typechecks, lint, 16/16 behavioral gates, catalogue/resource isolation/licence/security audits, production build/budgets, and the four-project E2E run (826 passed, 191 configured skips, zero failures). Machine-readable results are in `audit/evidence/step-20/aud-495-surprise-net-variant/local-verification.json`. This is local verification only. AUD-495 remains open pending the same check on a new published Sites review version.