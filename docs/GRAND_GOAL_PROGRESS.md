# Tessellate Grand Goal progress ledger

This ledger tracks the persistent product-hardening and Verso-integration goal
without replacing the ordered gates in
[`PRODUCT_HARDENING.md`](PRODUCT_HARDENING.md), the capability snapshot in
[`CURRENT_PRODUCT_INVENTORY.md`](CURRENT_PRODUCT_INVENTORY.md), the test matrix
in [`../quality/FEATURE_MATRIX.md`](../quality/FEATURE_MATRIX.md), or the
machine-readable issue register in [`../audit/runtime-audit.json`](../audit/runtime-audit.json).

## Goal and guardrails

Make Tessellate a coherent, dependable product for interpreting a brief,
producing materially different interface directions, editing safely, and
exporting a working application. Finish and verify existing product hardening
before widening the resource ecosystem. Then integrate every technically and
legally eligible Verso resource through shared contracts while preserving its
source identity and rights restrictions.

- No major product expansion until the release gates in `PRODUCT_HARDENING.md`
  pass.
- The owner's external-user-study waiver is recorded as **waived, not passed**;
  simulated perspectives do not count as human sessions.
- Verso's private/unlicensed status remains a distribution restriction until
  documented rights authorize redistribution.
- No silent merge, rights-restricted publication, paid infrastructure, or
  production Site change. The public review Site currently remains v72.

## Current checkpoint — 2026-11-02

- Working copy: a dedicated Codex worktree for this review branch.
- Branch: `codex/aud443-deployed-verification`.
- The local remediation code commits end at
  `8c5a4f1d06c187b2af9c766188ed330b8fc706a1`. The review branch contains
  three scoped local remediation commits after the
  pushed AUD-452 commit: renderer control handling
  (`174b3c7c006864d5486f7e6b93953e8e1d6d93f1`), mobile menu accessible name
  (`046146fe474a4e07831a5c0e03e39913e9dccfc6`), and internal docs route
  exclusion (`8c5a4f1d06c187b2af9c766188ed330b8fc706a1`). They pass the local
  browser profiles recorded below but have not yet been pushed.
- AUD-452 fix commit `8768e58a4d6a554d8e0e5319b0cd9d54edf7de30` is pushed to
  PR #8 branch `codex/step-48-review-fixes`. The new exact-head CI runs
  41406642682 and 41406660080 were still in the Playwright/Axe step at 07:48Z;
  Component Quality Gate run 41406660036 passed. These CI jobs cover `8768e58`
  only and do not certify the three newer local commits.
- At the preceding checkpoint PR #8 was open and unmerged at
  `25954eda8bd578811da89769f0903f5ff4b3b373`; its push CI, PR CI and Component
  Quality Gate runs were still active. This continuation added a separate
  keyboard regression for AUD-451 and fresh deployed DevTools evidence. Those
  existing runs do not certify the added regression/evidence commit; the new
  exact branch head needs fresh CI before publication.
- Public review Site: `https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/`
  remains v72. D1/R2 are unprovisioned; no deployment or infrastructure change
  was made in this checkpoint.
- The latest scoped v72 audit covered 31 public routes at 1440x900 and 390x844,
  the employee-experience journey, responsive shells through 1536px, and the
  independent desktop React export build. Its scope is recorded in
  `quality/STEP_48_EVIDENCE.md`; it does not complete Step 48.

### Work in progress

- **AUD-450, medium:** the mobile preview menu's accessible name omitted its
  visible `Menu` label. Fixed locally; issue-specific deployed verification is
  pending.
- **AUD-451, high:** tapping that menu selected the enclosing renderer node
  and switched the mobile Workbench to Inspect. Fixed locally by allowing
  semantic interactive descendants to handle their own events. A keyboard
  Enter activation also reproduces on public v72; the new test fails there
  because the preview toggle detaches and passes on the local Sites Worker.
  Deployed verification is pending.
- **AUD-452, high/open; fix committed, deployed verification pending:** a fresh cache-bypass DevTools trace on public v72
  reproduced CLS 0.5028 at 412x823, DPR 1.75, 4x CPU and Fast 4G. It identifies
  the hero, value-proposition, conversion CTA and footer wrappers shifting as
  five Gold chunks load behind the Workbench shell. The first mobile preload
  gate also had a fail-fast race: when one Gold chunk failed, the screen mounted
  before other delayed chunks settled. The shared hook now waits for every
  deduplicated resource attempt, including failures. After a fresh `pnpm build`,
  first load, reload and injected partial failure all measured CLS 0.00. The
  failure case retained its visible resource-specific error, one expected
  aborted request and zero uncaught exceptions. Four related mobile Workbench
  regressions pass. A new Chrome DevTools trace on the live v72 Site reproduced
  CLS 0.5028 with LCP 3,826 ms (TTFB 45 ms; render delay 3,781 ms); 39 requests
  completed without HTTP failures or console messages. Machine evidence:
  `quality/evidence/step-48/public-v72-live-audit-2026-11-02/flagship/devtools-cold-workbench-412.json`.
  Deployed verification remains pending.
- **AUD-453, medium:** the internal progress ledger was included in public docs
  routes. Fixed locally by excluding it from the public route set and removing
  the absolute worktree path; the route now returns 404 across four browser
  profiles. Deployed verification is pending.
- The local Sites Worker regression passes 6 tests with 2 configured desktop
  profile skips. The delayed Gold-load test records CLS 0.01754 on first load
  and reload. The full unit suite passes 1,282 tests with 1 configured skip;
  all 22 workspace typechecks, lint (zero warnings), the 734-page production
  build, standalone export fidelity, and the mobile Workbench Axe test pass.
  Logs and machine evidence are under
  `quality/evidence/step-48/public-v72-live-audit-2026-11-02/flagship/`.
- Fresh E2E profile runs are green: 394 passed / 130 skips in default
  desktop/mobile, 206 / 8 in Sites desktop, 172 / 42 in Sites mobile, and 3 / 0
  in the standalone preview app. Four additional targeted docs-index checks
  cover desktop/mobile in Astro and Sites. The production build now emits 733
  pages because the internal progress route is excluded. Full results are
  recorded in `quality/STEP_48_EVIDENCE.md`.

## Mission order and next action

1. **Mission A — existing hardening:** active. Step 48 and the full release
   gate remain incomplete; do not infer release readiness from the scoped v72
   sweep or existing green CI.
2. **Mission B — Verso integration:** not started in this checkpoint. Inspect
   the current Verso repository against its verified source snapshot and
   preserve the private/unlicensed redistribution boundary before integration.
3. Continue the remaining product, renderer, mutation, persistence, export,
   CLI/MCP, accessibility, performance, reliability and security acceptance
   work in the order defined by the source programme.

**Next:** push the keyboard regression and captured evidence to PR #8, then wait
for push CI, PR CI and the Component Quality Gate on that exact new head. If
they pass, mirror the exact source into the existing Sites source, build/save/
deploy it to the review Site, and rerun route/docs plus mobile Workbench label,
keyboard/tap interaction and cold-load checks. Public v72 remains unchanged
until deployed verification passes; close AUD-450–453 only after their
corresponding hosted checks pass.
## Evidence and unresolved conditions

- Detailed deployed audit: [`../quality/STEP_48_EVIDENCE.md`](../quality/STEP_48_EVIDENCE.md).
- Issue details and status: [`../audit/RUNTIME_AUDIT.md`](../audit/RUNTIME_AUDIT.md)
  and [`../audit/runtime-audit.json`](../audit/runtime-audit.json).
- Current baseline feature rows remain historical inventory evidence, not
  certification. Refresh them only when their ordered feature gates are
  actually verified.
- Human usability evidence remains unavailable by owner waiver. Verso rights,
  remaining hardening gates, broader integration benchmarks, and deployed
  verification of local-only fixes remain unresolved.
