# Tessellate Grand Goal progress ledger

This ledger tracks the persistent product-hardening and Verso-integration goal
without replacing the ordered gates in
[`PRODUCT_HARDENING.md`](PRODUCT_HARDENING.md), the capability snapshot in
[`CURRENT_PRODUCT_INVENTORY.md`](CURRENT_PRODUCT_INVENTORY.md), the test matrix
in [`../quality/FEATURE_MATRIX.md`](../quality/FEATURE_MATRIX.md), or the
machine-readable issue register in [`../audit/runtime-audit.json`](../audit/runtime-audit.json).

## Goal and guardrails

Finish the technically and legally permitted Verso integration first, then
make Tessellate a coherent, dependable product for interpreting a brief,
producing materially different interface directions, editing safely, and
exporting a working application. Reuse the existing shared contracts and
preserve Verso source identity and rights restrictions. Public distribution
and certification stay blocked until redistribution rights are documented.

- No major product expansion until the release gates in `PRODUCT_HARDENING.md`
  pass.
- The owner's external-user-study waiver is recorded as **waived, not passed**;
  simulated perspectives do not count as human sessions.
- Verso's private/unlicensed status remains a distribution restriction until
  documented rights authorize redistribution.
- No silent merge, rights-restricted publication, paid infrastructure, or
  unapproved production Site change. Public review Site changes remain owner-
  authorized and post-CI; it currently remains v72.

## Current checkpoint — 2026-11-03

- Working copy: the scoped Verso-integration worktree.
- Branch: codex/verso-integration-private, currently at `3367ac5987142adaa9efe58127d6d97c2e2f06da`; PR #8 remains open and unmerged. Both exact-head GitHub workflows passed on this source (PR CI run 41586587136; Push CI run 41586570562), including Playwright E2E/Axe. The remaining uncommitted changes are dated audit evidence and progress documentation.
- The private Verso inspection integration is implemented and exercised locally across 1,053/1,053 source modules. It reuses the canonical resource schema and preview app, exposes a separate loopback-only source runtime, and keeps all Verso items out of public catalogue/Gold, Workbench, registry, CLI/MCP and export surfaces.
- Verso source declares UNLICENSED/private. Rights and attribution remain unresolved, so public distribution and certification are intentionally blocked. Local render success is not component-quality certification. No private source or projection was copied into the repository.
- The repeat private preview audit on 2026-11-03 recorded 1,053 successful renders, zero unresolved items/failures/warnings, zero uncaught browser errors, zero failed requests, and no non-200 essential responses. Axe found zero violations and one contrast-incomplete result; no contrast certification is claimed. Evidence summary: quality/VERSO_LOCAL_INTEGRATION_EVIDENCE.md; raw source-tree evidence remains outside Git.
- The current local product-hardening ledger has 456 findings: 0 Critical, 87 High, 342 Medium and 27 Low. AUD-454 (direct preview wrapper navigation), AUD-455 (confirmation spacing), and AUD-456 (Workbench startup layout shift) are fixed and locally verified at desktop/mobile; deployed verification is pending. AUD-456 was reproduced on public v72 at desktop and mobile under delayed startup: the full-height loading shell collapsed to one line; mobile CLS measured 0.510487 and desktop content disappeared. AUD-452's cold mobile resource failure is fixed locally: the final 412×823 Sites Worker run measured 0.017716 CLS on first load, reload, and an injected Gold chunk failure; the failed hero retained 448px and produced no uncaught exception. A new public v72 cache-bypass trace still measured CLS 0.18, while another same-day clean-profile trace measured 0; AUD-452 remains open pending deployed verification. Evidence: `audit/evidence/step-48/aud452-mobile-cold-resource-load/public-v72-devtools-repeat-2026-11-03.json`.
- Frozen installation, catalogue generation (324 resources/40 Gold), all 22 workspace typechecks, lint, unit/integration suite (1,313 passed/1 configured skip), `audit:all` (16/16 behavioral release gate plus provenance/security/dependency checks), and production build passed. The final full Playwright rerun passed 779 tests with 186 configured profile skips and zero failures: Astro 394/134, Sites desktop 207/10, Sites mobile 175/42, and isolated preview 3/0. The complete log is `quality/evidence/step-48/test-e2e-final-2026-11-03-after-preview-harness.log`. Exact-head GitHub PR CI run 41586587136 and Push CI run 41586570562 both passed E2E/Axe on 3367ac5.
- Public review Site remains v72 at https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/. D1/R2 are unprovisioned; the £20/month ceiling, zero-secret persistence rule and strict preview CSP remain in force. No deployment or infrastructure change has occurred in this checkpoint.

### 2026-11-03 continuation — public homepage sample

The live v72 homepage and `/compose` were checked at 1440×900 and 390×844. Both routes had no console errors/warnings, uncaught exceptions, failed requests, HTTP errors, or horizontal overflow. Homepage Lighthouse snapshots scored 100 for accessibility, best practices, SEO, and agentic browsing; DevTools cold traces recorded LCP 364ms desktop / 337ms mobile and CLS 0 for both. Compose loaded `/data/catalog.json` (324 resources, 40 `verified-gold`), reached Ready, exposed the primary brief in the mobile viewport, and its sample controls and keyboard focus worked. The visible sample-data and illustrative-preview disclosures were truthful; no copy defect was identified in these sampled routes. Evidence is in `audit/evidence/step-39/live-v72/` and `quality/STEP_39_EVIDENCE.md`. The full copy review remains incomplete.

The same public v72 sample also covers `/explore` at desktop and mobile. Search, query/category composition, URL state, lazy previews, mobile filter-dialog Escape handling, and focus restoration behaved as expected; captured screenshots and request details are in `audit/evidence/step-39/live-v72/`. This still does not certify all catalogue search terms, resource cards, or the full feature matrix.

### Work in progress

- The deployment-side preview-wrapper handoff failure was reproduced against a production-like Sites Worker. A direct navigation request used a concrete Site target origin even though the wrapper's response CSP makes it an opaque-origin document. The bounded protocol now targets only the direct parent; each host still validates sender frame/origin/schema/resource ID, and navigation still requires a visible user confirmation. The pre-fix browser regression fails; the post-fix direct-wrapper desktop/mobile regression passes with zero console errors, uncaught exceptions or failed requests.
- Product hardening remains open. In particular, the hosted provider-header path cannot be verified while the laptop backend and provider endpoint are unconfigured; cold mobile Workbench, the new shared Workbench startup shell, and recent accessibility/responsive changes still need issue-specific deployed verification. The broader feature matrix, exhaustive resource certification, cross-surface acceptance and release gate are not complete.
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
