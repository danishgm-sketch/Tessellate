# Baseline defect evidence

Consolidation began on 2026-10-16 from aaef85c. These are baseline blockers,
not a claim that the subsequent product hardening programme is complete.

| ID       | Failure reproduced                                                                               | Root cause                                                                                                                                                                                        | Remediation / regression                                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BASE-001 | Main CI run 38754919634 fails ESLint                                                             | Unnecessary escape in registry secret-pattern character class                                                                                                                                     | Preserve regex semantics and remove the unnecessary escape; full lint must pass.                                                                                                                                                                           |
| BASE-002 | Next.js exporter test and typecheck fail after reconciliation                                    | Older target generator omitted the audited shared renderer's Design DNA argument                                                                                                                  | Pass manifest DNA through existing Next.js target; existing source-tree tests verify generation. Fidelity certification remains later.                                                                                                                     |
| BASE-003 | Production browser build fails on node:url fileURLToPath                                         | Public exporter index exports Node filesystem adapter into browser dependency graph                                                                                                               | Keep Node adapter behind its already-existing explicit package subpath. browser-entry.test.ts fails before repair with filesystem mock error, then passes. Actual production build is required.                                                            |
| BASE-004 | All tests pass but Vitest exits nonzero with onTaskUpdate timeout                                | Independent export test blocks its worker event loop during synchronous install/build                                                                                                             | Await child processes; retain clean external install/build and real browser assertions. Full rerun required.                                                                                                                                               |
| BASE-005 | Fresh checkout cannot execute audit:all before a build                                           | Bundle audit assumes existing dist and may audit stale output                                                                                                                                     | audit:all builds current source before budget/security checks; fresh checkout verifies the owner's exact sequence.                                                                                                                                         |
| BASE-006 | CI flagship browser flows log `net::ERR_CONNECTION_REFUSED` on startup                           | CommandBar probes hard-coded `localhost:8787` every ten seconds even when the static Astro preview has no API proxy; recognized deterministic commands also checked health before running locally | Keep Astro preview offline without requests, use the Sites Worker same-origin proxy on port 4323, and execute deterministic commands before health checks. Regression tests assert no fetch in the unconfigured preview and preserve the Sites proxy path. |
| BASE-007 | CI Workbench Axe scan reports serious target-size and target-offset failures for Execute command | The 14px icon button overlays the entire text input, creating both a small target and overlapping target geometry                                                                                 | Give the action a 36px visible button beside the input with a visible focus outline; rerun the same Axe browser regression.                                                                                                                                |
| BASE-008 | Node 24 test logs warn about shell-based child launches (`DEP0190`)                              | Both standalone-export browser suites start the generated Vite preview with `spawn(..., shell: true)` even though the CLI can run directly                                                        | Launch the generated Vite CLI with the current Node executable and argument array in both suites; retain their independent build and browser assertions.                                                                                                   |

## Verification at `a889396`

All eight owner-required commands passed from a clean detached checkout at
`a889396f27976872aa629e1dbc4500857a5e655e`; the detailed outputs and test
counts are recorded in [BASELINE_RESULTS.md](BASELINE_RESULTS.md). The
corresponding source fixes have passing regression evidence:

| ID       | Verification evidence                                                                                               | State |
| -------- | ------------------------------------------------------------------------------------------------------------------- | ----- |
| BASE-001 | `pnpm lint`: exit 0, 0 errors; the 51 warnings are separately registered.                                           | Fixed |
| BASE-002 | `pnpm typecheck` and all 452 Vitest tests pass.                                                                     | Fixed |
| BASE-003 | Browser-entry regression passes; `pnpm build` succeeds.                                                             | Fixed |
| BASE-004 | All 452 Vitest tests pass, including both independent exported-project browser suites.                              | Fixed |
| BASE-005 | `pnpm audit:all` passes before the separate explicit `pnpm build`.                                                  | Fixed |
| BASE-006 | Host-routing regressions and the 65 executed desktop/mobile browser tests pass.                                     | Fixed |
| BASE-007 | Executed Axe/browser checks pass, including Workbench and command accessibility regressions.                        | Fixed |
| BASE-008 | Both export-browser suites pass without `DEP0190`; the independent install/build/runtime assertions remain enabled. | Fixed |

The Node 24-native GitHub Action pins and Ubuntu 24.04 runner passed on
`628c05d`; both required PR validation and the component security workflow are
green. These baseline defects are closed. Deployed product and feature-quality
defects remain open for their ordered programme gates.

Transient evidence: one external npm registry ECONNRESET interrupted the first
standalone install; no assertion was skipped. Subsequent independent installation
passed. Concurrency is bounded so local CPU count does not create dozens of
simultaneous compiler/test processes.

The clean-checkout run logs were captured under the runner's temporary
directory; committed command summaries and CI links are in
[BASELINE_RESULTS.md](BASELINE_RESULTS.md). None of these local repairs
certifies deployed behavior. P0/P1 product issues require deployed verification
at their ordered gate.
