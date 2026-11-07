# Step 44 — Clean-machine verification

Date: 2026-10-24

## Environment

- Docker image: mcr.microsoft.com/playwright:v1.63.0-noble
- pnpm: 11.20.0; a fresh pnpm store was used.
- Source base revision: 76812fb26211a779ca93279ec49b7df2d5d02243.
- The staged source snapshot included the current uncommitted worktree (14,946 files, 818,625,512 bytes); it did not include .git, repository node_modules, credentials, or developer environment secrets. The clean-container record explicitly notes that this was not a clean Git checkout.
- Container execution used container-native storage, isolated HOME/Corepack/pnpm/npm caches, and no repository dependency cache reuse.

## Results

The fresh container passed frozen dependency installation (570 packages, zero store reuse), catalogue build (324 resources, 40 Gold), TypeScript typecheck, ESLint, unit tests, audit:all (16/16 behavioral gates and 324 resource isolation checks), and production build.

The first browser run found one test-harness-only failure: Chromium could not capture a full-page screenshot of the long mobile homepage after all page assertions had passed. The test now captures the mobile viewport and keeps full-page capture on desktop. The complete browser run was repeated in the isolated container:

| Profile | Passed | Configured skips | Failed |
| --- | ---: | ---: | ---: |
| Astro / Chromium | 286 | 108 | 0 |
| Sites Worker / Chromium desktop and mobile | 251 | 41 | 0 |
| Isolated preview app | 3 | 0 | 0 |
| **Total** | **540** | **149** | **0** |

The 149 skips are project-scoped browser cases excluded by their configured profile, not failures.

The responsive run also found two product defects and now covers them with regressions:

- AUD-315: long CLI documentation code samples widened the document at 360px and could not be scrolled by keyboard. The snippets now remain within the viewport, expose focus, and scroll horizontally by keyboard.
- AUD-316: the Workbench project title collapsed out of view at 430px when sibling toolbar groups competed for flex space. The identity/save cluster now takes a dedicated row on narrow screens.

The Sites profile certified all 324 catalogue resources and passed the applicable Gold accessibility, security isolation, responsive, content-truthfulness, and network checks. The test log contains one Workerd broken-pipe diagnostic from the Sites dev-server process while the suite continued; it did not fail a browser assertion or the final run. This is recorded as a test-server shutdown diagnostic, not as evidence of a browser runtime error.

## Evidence

- Initial clean-container run and its test-harness failure: quality/evidence/step-44/clean-container-attempt-8.json, clean-container-attempt-8.log, and sites-homepage-copy-mobile-error-context.md.
- Post-fix full browser rerun: quality/evidence/step-44/clean-container-final-e2e-rerun.log and clean-container-final.json.
- Before/after CLI layout: quality/evidence/step-44/sites-docs-cli-before-360.png, sites-docs-cli-after-360.png.
- Before/after Workbench toolbar: quality/evidence/step-44/sites-workbench-before-430.png, sites-workbench-after-430.png.
- The audit entries AUD-315 and AUD-316 are in audit/runtime-audit.json and audit/RUNTIME_AUDIT.md.

This closes the isolated clean-environment install and browser-suite gate. It does not certify a clean Git checkout because the audited source snapshot was dirty, and it does not close the public review/deployment gate.
