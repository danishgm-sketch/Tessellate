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

## Current checkpoint — 2026-11-03

- Working copy: the scoped Verso-integration worktree.
- Branch: codex/verso-integration-private, based at c59490ea967f7983cc6d1e2c38c7d4d38bf382fd. No code has been pushed from this worktree yet. PR #8 remains open and unmerged; the local branch will be reconciled with its exact current remote head before pushing.
- The private Verso inspection integration is implemented and exercised locally across 1,053/1,053 source modules. It reuses the canonical resource schema and preview app, exposes a separate loopback-only source runtime, and keeps all Verso items out of public catalogue/Gold, Workbench, registry, CLI/MCP and export surfaces.
- Verso source declares UNLICENSED/private. Rights and attribution remain unresolved, so public distribution and certification are intentionally blocked. Local render success is not component-quality certification. No private source or projection was copied into the repository.
- The repeat private preview audit on 2026-11-03 recorded 1,053 successful renders, zero unresolved items/failures/warnings, zero uncaught browser errors, zero failed requests, and no non-200 essential responses. Axe found zero violations and one contrast-incomplete result; no contrast certification is claimed. Evidence summary: quality/VERSO_LOCAL_INTEGRATION_EVIDENCE.md; raw source-tree evidence remains outside Git.
- The current local product-hardening ledger has 455 findings: 0 Critical, 86 High, 342 Medium and 27 Low. AUD-454 (direct preview wrapper navigation) and AUD-455 (confirmation spacing) are fixed and locally verified at desktop/mobile; deployed verification is pending. AUD-452's cold mobile resource failure is also fixed locally: the final 412×823 Sites Worker run measured 0.017716 CLS on first load, reload, and an injected Gold chunk failure; the failed hero retained 448px and produced no uncaught exception. Deployed verification is pending for all three local-only findings.
- Frozen installation, catalogue generation (324 resources/40 Gold), all 22 workspace typechecks, lint, unit/integration suite (1,313 passed/1 configured skip), `audit:all` (16/16 behavioral release gate plus provenance/security/dependency checks), and production build passed. The final full Playwright rerun passed 779 tests with 186 configured profile skips and zero failures: Astro 394/134, Sites desktop 207/10, Sites mobile 175/42, and isolated preview 3/0. The complete log is `quality/evidence/step-48/test-e2e-final-2026-11-03-after-preview-harness.log`.
- Public review Site remains v72 at https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/. D1/R2 are unprovisioned; the £20/month ceiling, zero-secret persistence rule and strict preview CSP remain in force. No deployment or infrastructure change has occurred in this checkpoint.

### Work in progress

- The deployment-side preview-wrapper handoff failure was reproduced against a production-like Sites Worker. A direct navigation request used a concrete Site target origin even though the wrapper's response CSP makes it an opaque-origin document. The bounded protocol now targets only the direct parent; each host still validates sender frame/origin/schema/resource ID, and navigation still requires a visible user confirmation. The pre-fix browser regression fails; the post-fix direct-wrapper desktop/mobile regression passes with zero console errors, uncaught exceptions or failed requests.
- Product hardening remains open. In particular, the hosted provider-header path cannot be verified while the laptop backend and provider endpoint are unconfigured; cold mobile Workbench and recent accessibility/responsive changes still need issue-specific deployed verification. The broader feature matrix, exhaustive resource certification, cross-surface acceptance and release gate are not complete.
- Human usability sessions remain owner-waived, not passed.

## Mission order and next action

1. **Mission B — Verso component integration:** complete as a local, owner-only inspection adapter within the existing licence restriction. Do not publish or make these components eligible for Core until rights are documented and each component passes its own certification.
2. **Mission A — Product Hardening:** continue in the required order. The local repository gates and full E2E rerun are now green on this working tree. Next reconcile and commit the source/evidence changes by root cause, verify exact-head CI, publish the review build under the standing owner instruction, and recheck the same affected browser behaviors on the deployed Site. Continue the remaining ordered hardening work afterward; this checkpoint is not a release gate.
3. Update the existing unmerged PR #8 from the scoped branch after reconciling its remote head; do not merge. Because user authorization for automatic recommended deployment persists, publish only after exact-head CI passes, then rerun the same affected preview/Workbench checks against the new review Site and close issues only after hosted evidence.

**Completion state:** Verso's technically permitted local integration is complete; Product Hardening is not complete. The release gate remains blocked pending the remaining P0/P1 conditions, exact-head CI, deployed verification, broader ordered hardening work and human-validation waiver disposition.

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
