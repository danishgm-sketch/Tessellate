# Fresh-checkout baseline — 2026-10-24

## Source

- Repository: `danishgm-sketch/Tessellate`
- Branch: `consolidation/product-hardening`
- Exact checkout: `2ba70b6f9a493951f0cb0e9c097204c7903e1248`
- Worktree: clean detached checkout under the system temporary directory before the command sequence.
- Runtime: Node 24.20.0, pnpm 11.20.0.

## Required command sequence

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | PASS | Completed from the frozen lockfile; no lockfile mutation. |
| `pnpm build:catalog` | PASS | Validated 324 resources and tagged exactly 40 Gold runtime resources. |
| `pnpm typecheck` | PASS | All 22 workspace projects. |
| `pnpm lint` | PASS | Exit code 0. |
| `pnpm test` | PASS | 1,214 passed, 1 skipped, 77 files. |
| `pnpm audit:all` | PASS | All 16 behavioral release-gate checks; 324/324 resource-isolation checks; no security violations; dependency audit reported no known vulnerabilities. |
| `pnpm build` | PASS | Astro built 733 static pages; Sites Worker artifact built; catalogue and workspace builds completed. Vite reported its existing >500 kB raw chunk advisory; the measured gzip budget remains within the configured budget. |
| `pnpm test:e2e` | PASS | Astro desktop/mobile: 290 passed, 108 configured skips; Sites Worker desktop/mobile: 257 passed, 41 configured skips, including the 324-resource and 40-Gold browser matrices; isolated preview app: 3 passed. Total: 550 passed, 149 configured skips, 0 failures. |

## Hosted CI

The exact commit has both required GitHub workflows complete successfully:

- [CI run 173](https://github.com/danishgm-sketch/Tessellate/actions/runs/40096927730) — success.
- [Component Quality Gate Sandbox run 74](https://github.com/danishgm-sketch/Tessellate/actions/runs/40096927706) — success.

## Observations and limits

The Playwright projects include 149 explicit project/viewport skips. They are not counted as passes; the results above report them separately. The Sites Worker desktop project executed the exhaustive 324-resource browser matrix, and the same script also exercised mobile Core flows, accessibility, and responsive behavior. The full Playwright suite also exercised the visible employee-experience journey through standalone React export.

The build and browser tests refreshed tracked evidence artifacts in the temporary checkout. Those generated changes were not copied into the canonical checkout; the canonical source worktree remains on this branch and the committed test-timeout fix only. The public review Site was not changed by this baseline run.

## Baseline fix immediately preceding this run

The first clean-checkout unit-test run at parent commit `7e1450d469365bda5dccc22cdcab8482d5848747` exposed a Miniflare D1 `beforeAll` timeout under full-suite contention. The same D1 tests passed alone. Increasing only that setup hook timeout to 30 seconds made the full suite pass (1,214 passed, 1 skipped). No product runtime behavior or assertions changed. The fix is commit `2ba70b6f9a493951f0cb0e9c097204c7903e1248`, pushed to `consolidation/product-hardening`; PR #5 remains open and unmerged.
