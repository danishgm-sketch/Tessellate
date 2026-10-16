# Baseline defect evidence

Consolidation began on 2026-10-16 from aaef85c. These are baseline blockers,
not a claim that the subsequent product hardening programme is complete.

| ID | Failure reproduced | Root cause | Remediation / regression |
| --- | --- | --- | --- |
| BASE-001 | Main CI run 38754919634 fails ESLint | Unnecessary escape in registry secret-pattern character class | Preserve regex semantics and remove the unnecessary escape; full lint must pass. |
| BASE-002 | Next.js exporter test and typecheck fail after reconciliation | Older target generator omitted the audited shared renderer's Design DNA argument | Pass manifest DNA through existing Next.js target; existing source-tree tests verify generation. Fidelity certification remains later. |
| BASE-003 | Production browser build fails on node:url fileURLToPath | Public exporter index exports Node filesystem adapter into browser dependency graph | Keep Node adapter behind its already-existing explicit package subpath. browser-entry.test.ts fails before repair with filesystem mock error, then passes. Actual production build is required. |
| BASE-004 | All tests pass but Vitest exits nonzero with onTaskUpdate timeout | Independent export test blocks its worker event loop during synchronous install/build | Await child processes; retain clean external install/build and real browser assertions. Full rerun required. |
| BASE-005 | Fresh checkout cannot execute audit:all before a build | Bundle audit assumes existing dist and may audit stale output | audit:all builds current source before budget/security checks; fresh checkout verifies the owner's exact sequence. |
| BASE-006 | CI flagship browser flows log `net::ERR_CONNECTION_REFUSED` on startup | CommandBar probes hard-coded `localhost:8787` every ten seconds even when the static Astro preview has no API proxy; recognized deterministic commands also checked health before running locally | Keep Astro preview offline without requests, use the Sites Worker same-origin proxy on port 4323, and execute deterministic commands before health checks. Regression tests assert no fetch in the unconfigured preview and preserve the Sites proxy path. |
| BASE-007 | CI Workbench Axe scan reports serious target-size and target-offset failures for Execute command | The 14px icon button overlays the entire text input, creating both a small target and overlapping target geometry | Give the action a 36px visible button beside the input with a visible focus outline; rerun the same Axe browser regression. |

Transient evidence: one external npm registry ECONNRESET interrupted the first
standalone install; no assertion was skipped. Subsequent independent installation
passed. Concurrency is bounded so local CPU count does not create dozens of
simultaneous compiler/test processes.

Logs are captured under the runner's temporary directory during local iteration;
the final fresh-checkout summary and CI URLs will be recorded when all eight
commands pass. None of these local repairs certifies deployed behavior. P0/P1
product issues require deployed verification at their ordered gate.
