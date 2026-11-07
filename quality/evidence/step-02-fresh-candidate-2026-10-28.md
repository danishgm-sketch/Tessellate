# Fresh candidate baseline — 2026-10-28

## Source and environment

- Repository: `danishgm-sketch/Tessellate`
- Candidate branch: `codex/product-hardening-canonical`
- Exact source tested: `5ec42d5c0618546301beb8504e7760280994c71f`
- Integration target: `consolidation/product-hardening` (the candidate is its reviewed fast-forward descendant; no changes were made to `main`).
- Clean Windows worktree; Node `v24.20.0`; pnpm `11.20.0`.
- This candidate intentionally integrates the reviewed `codex/step-45-evidence` lineage into the consolidation history. The source comparison and PR #6 exact-head checks were inspected before integration.

## Required baseline commands

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | PASS | Clean worktree install completed; lockfile frozen. |
| `pnpm build:catalog` | PASS | 324 catalogue resources; 40 Gold runtime resources. |
| `pnpm typecheck` | PASS | All 22 configured workspace projects passed. |
| `pnpm lint` | PASS | Zero errors; one pre-existing unused-variable warning in a step-45 evidence helper. |
| `pnpm test` | PASS | 1,223 passed, 1 configured skip; 78 files. |
| `pnpm audit:all` | PASS | 16/16 behavioural release checks; isolation 324/324; 324 provenance/licence checks; no secret/security violations; no known dependency advisories; production build and bundle budgets passed. |
| `pnpm build` | PASS | Astro and Sites Worker production outputs generated; 733 static pages. |
| `pnpm test:e2e` | PASS on isolated rerun | Astro desktop/mobile: 347 passed, 121 configured skips. Sites Worker desktop: 184 passed, 6 skips. Sites Worker mobile: 150 passed, 40 skips. Standalone preview: 3 passed. Total: 684 passed, 167 configured skips, zero failures. |

The browser rerun used `SITES_PREVIEW_BASE_URL=http://127.0.0.1:4325` and `TESSELLATE_PREVIEW_APP_PORT=4326`, because port 4323 was already serving a separate Sites `wrangler dev` preview. That pre-existing process was left running and untouched. The first command attempt stopped at this port collision before the Sites project began; the full rerun then completed all four projects successfully.

## Audit and bundle results

- Homepage: 99.43 KB gzip / 150 KB budget.
- Explore: 177.59 KB / 200 KB.
- Compose: 254.85 KB / 750 KB.
- Workbench: 74.08 KB / 750 KB.
- Search catalogue: 112.52 KB / 2,048 KB.
- `audit:all` reported raw Vite chunk-size notices for preview/Astro outputs; formal gzip budgets passed.
- Build-generated public JSON changed only its generation timestamps during this run. Those clock-dependent outputs and browser evidence captures were restored after verification; this evidence note is the only baseline record added by this run.

## Hosted exact-head checks

The candidate source commit `5ec42d5c0618546301beb8504e7760280994c71f` has successful hosted CI and the 16-point quality/security gate:

- [PR CI](https://github.com/danishgm-sketch/Tessellate/actions/runs/40607632774)
- [Quality/security validation](https://github.com/danishgm-sketch/Tessellate/actions/runs/40607624625)

The local checks above were also run from a fresh checkout at that exact source commit. This records the baseline only; it does not close the ordered hardening steps or the deployed Step 45 audit.
