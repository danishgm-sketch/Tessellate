# Exact-head baseline — 2026-10-25

## Source

- Repository: `danishgm-sketch/Tessellate`
- Branch: `consolidation/product-hardening`
- Exact source: `37654e58e6483a718240aa1b520c669b15cdbdad`
- Hosted runner: `ubuntu-24.04`, Node 24, pnpm 11.20.0
- Checkout: GitHub Actions fresh checkout for each workflow run.

## Required baseline commands

All commands ran in the required CI sequence at the exact source SHA.

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | PASS | Frozen lockfile is current; resolution step skipped. |
| `pnpm build:catalog` | PASS | Catalogue validated; the built Sites artifact contains 324 resources and 731 CSP records. |
| `pnpm typecheck` | PASS | 22 of 23 workspace projects are configured for typecheck; all 22 passed. |
| `pnpm lint` | PASS | ESLint exited 0 under the repository's configured warning ceiling. |
| `pnpm test` | PASS | 1,217 tests passed across 77 files. |
| `pnpm audit:all` | PASS | All 16 behavioural release-gate criteria passed; resource isolation passed 324/324; security, secret, licence/provenance and dependency audits passed. |
| `pnpm build` | PASS | Production Astro, Sites Worker, workspace and catalogue builds completed. |
| `pnpm audit:budgets` | PASS | Homepage 99.63 KB gzip / 150 KB; Explore 176.49 / 200 KB; Compose 270.57 / 750 KB; Workbench 494.04 / 750 KB; search catalogue 112.52 / 2,048 KB. |
| `pnpm test:e2e` | PASS | Astro: 316 passed, 108 configured skips; Sites Worker: 302 passed, 40 configured skips; isolated preview: 3 passed. Total: 621 passed, 148 configured skips, 0 failures. Axe is included in the browser workflows. |

## Hosted workflows

All three runs completed successfully on the exact SHA:

- [CI push run](https://github.com/danishgm-sketch/Tessellate/actions/runs/40226280979)
- [Required PR run](https://github.com/danishgm-sketch/Tessellate/actions/runs/40226271800)
- [16-point quality/security run](https://github.com/danishgm-sketch/Tessellate/actions/runs/40226280984)

The PR remains open and unmerged at this SHA: [PR #5](https://github.com/danishgm-sketch/Tessellate/pull/5).

## Notes and limits

The browser workflows reported 148 configured skips; those are not counted as passes. GitCommitInfo emitted a non-failing 3-second timeout while collecting a large diff in the browser job, and Playwright identified the 324-resource render file as slow (6.8 minutes). Neither condition failed CI. Firefox browser launch is unavailable on this Windows host because of a missing `mozglue` dependent assembly, and real Safari is unavailable; no cross-browser claim is made for those engines.

This artifact records the exact-head hosted baseline only. Product-hardening steps with explicit local-only or release-candidate deployment gates remain open according to `docs/PRODUCT_HARDENING.md`.
