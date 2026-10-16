# Fresh-checkout baseline results

## Reproducible command run

The owner-required sequence was run from a new detached checkout at
`a889396f27976872aa629e1dbc4500857a5e655e` on 2026-10-16. The checkout was
verified clean before installation and had no `node_modules` directory. Runtime:
Node.js `v24.20.0`, pnpm `11.20.0`, Windows PowerShell. Every command exited 0.

| Command                          | Started (UTC+01:00) | Finished (UTC+01:00) | Result                                 |
| -------------------------------- | ------------------- | -------------------- | -------------------------------------- |
| `pnpm install --frozen-lockfile` | 15:29:54            | 15:30:55             | PASS                                   |
| `pnpm build:catalog`             | 15:30:55            | 15:31:05             | PASS; 324 resources                    |
| `pnpm typecheck`                 | 15:31:05            | 15:32:48             | PASS                                   |
| `pnpm lint`                      | 15:32:48            | 15:33:35             | PASS; 0 errors, 51 registered warnings |
| `pnpm test`                      | 15:33:35            | 15:35:19             | PASS; 51 files, 452 tests              |
| `pnpm audit:all`                 | 15:35:19            | 15:39:29             | PASS; see audit results below          |
| `pnpm build`                     | 15:39:29            | 15:42:23             | PASS; 717 static pages                 |
| `pnpm test:e2e`                  | 15:42:23            | 15:44:16             | PASS; 65 passed, 5 intentional skips   |

The Playwright run exercised desktop Chromium at 1440×900 and mobile Chromium
at 390×844. The five skips are viewport-specific: two desktop-only Workbench
checks on mobile, two desktop-only acceptance checks on mobile, and one
mobile-only acceptance check on desktop. They are explicit `test.skip` cases,
not failed or silently omitted tests.

## Audit results

- Catalogue/licence/provenance: all 324 resources passed schema, licence,
  provenance and minimum quality checks; zero failures.
- Bundle budgets: public initial JS 65.52 KB gzip / 150 KB; Explore 26.26 KB /
  200 KB; Workbench 183.22 KB / 750 KB; catalogue search data 111.09 KB /
  2,048 KB. All passed.
- Secret/security audit: zero violations; sandboxed resource preview and API
  authentication/ownership source checks passed.
- Production build: both the public Astro application and Sites artifact
  completed. The Sites artifact contained the 324-resource catalogue.
- Axe and browser regressions: all executed Playwright checks passed, including
  homepage, Explore, showcase, Workbench, keyboard focus, reduced motion,
  contrast, actual resource previews and responsive regressions.

The run regenerated tracked catalogue artifacts as expected from the resource
source of truth: catalogue `generatedAt` values and three generated Gold source
snapshots changed. No source manifest or resource file was modified by the
baseline run. The disposable verification checkout was not used as an
implementation checkout.

## CI evidence

At the tested source SHA, GitHub CI passed for push and pull-request events:

- [Push validation run 38915954400](https://github.com/danishgm-sketch/Tessellate/actions/runs/38915954400)
- [Pull-request validation run 38915962926](https://github.com/danishgm-sketch/Tessellate/actions/runs/38915962926)
- [Pull-request component security sandbox run 38915962822](https://github.com/danishgm-sketch/Tessellate/actions/runs/38915962822)
- [Final push validation run 38919580487](https://github.com/danishgm-sketch/Tessellate/actions/runs/38919580487)
- [Final pull-request validation run 38919590335](https://github.com/danishgm-sketch/Tessellate/actions/runs/38919590335)
- [Final component security sandbox run 38919590153](https://github.com/danishgm-sketch/Tessellate/actions/runs/38919590153)

The three GitHub Actions pins were updated to Node 24-native major releases,
and the runner is pinned to `ubuntu-24.04`. Full CI passed on the resulting
current SHA `628c05dc379f3ded3db7e832dbc367a19ef77520`, with both push and
required PR checks green. The fresh-checkout command evidence above is for the
unchanged application source at `a889396`.

## Remaining accepted warnings

- ESLint has 51 existing warnings and no errors. The per-file/rule register and
  retirement gates are in [LINT_DEBT.md](../LINT_DEBT.md); the CI cap is exactly
  51 and no lint rule is disabled.
- Vite reports raw JavaScript chunks above its 500 KB heuristic for the preview
  and Workbench bundles. Their gzip sizes pass the explicit budgets above.
  Real LCP/INP and interaction profiling remains scheduled for programme step
  38; passing compressed-byte limits is not a performance certification.
- Local Playwright output reports conflicting `NO_COLOR` and `FORCE_COLOR`
  runner variables. This comes from the test process environment, not browser
  console output or the application.
- The GitHub runner starts with a pnpm v10 `PNPM_HOME` layout. pnpm/action-setup
  refreshed the shims for v11 and installation plus all workflow stages passed.
  This is accepted as a runner bootstrap notice; migrate the runner's PNPM_HOME
  if the hosted image stops providing the compatibility refresh.

Steps 01 and 02 are complete. This result does not certify deployed behavior or
close any later feature-quality gate.
