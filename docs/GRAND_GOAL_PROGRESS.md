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
  authorized and post-CI; public review Site currently remains v78.

## Current checkpoint — 2026-11-06

- Active scoped branch: codex/surprise-net-change-audit. PR #10 remains open and unmerged; the v78 application source passed GitHub CI on its product-code head before this audit-only evidence update. Public review Site v78 serves canonical code 3e889d0ca68345c5ccf5ef767c3c05ebc07716ca through Sites mirror e6387f7ff8e1080a5a4c191cf00faef813719a3d.
- Verso's technically permissible integration is complete as a private, local-only inspection adapter over 1,053/1,053 modules. Fresh current-source inventory/projection and browser audit passed 25 focused tests and rendered 1,053/1,053 previews with zero module failures. Source isolation was 404 at the Site origin and 200 at the distinct loopback preview origin; Axe found zero violations and one incomplete contrast check. One representative WebGL module emitted four GPU readback/stall warnings. No source or derivative is copied into public catalogue, Gold, Workbench, registry, CLI/MCP or exporters. Source license is UNLICENSED; public inclusion and Core certification remain blocked pending rights and per-resource checks. Aggregate evidence: quality/VERSO_LOCAL_INTEGRATION_EVIDENCE.md; raw inventory, projection, report and screenshots remain outside Git.
- A fresh manual v78 copy/control review opened eight public resource pages at desktop and mobile. It found AUD-496–AUD-505: misleading example organization/auth data, dead invite/replay controls, assistant-memory and prompt-history claims, action-preview ambiguity, undocumented example API routes, an implied immutable audit log, live-looking telemetry health, and undisclosed cohort metrics. The local source regressions pass and are awaiting deployed verification. Screenshots and machine evidence are in quality/evidence/step-45/public-v78-reaudit/manual-copy-suspects/.
- The audit register has 505 entries (0 Critical, 87 High, 389 Medium, 29 Low). 270 have deployed verification; 122 await their own deployed verification; 98 are locally verified; historical/local/host-limitation groups remain documented. AUD-419 is the sole nonclosed High finding; real provider forwarding needs the optional laptop host and provider endpoint. One mobile window.styleMedia deprecation warning was observed once and not reproduced; it remains documented.
- Clean detached validation worktree: frozen install succeeded; catalogue build validated 324 resources/40 Gold; typecheck, lint, full build and 1,343 unit tests passed. `pnpm test:e2e` completed with no failures: 532 tests in 93 files on Astro, Sites Worker desktop 238 passed/11 configured skips, Sites Worker mobile 205 passed/44 configured skips, and standalone preview 3 passed. The focused Sites Worker copy/control regressions passed 16/16 desktop/mobile. `pnpm audit:all` passed the 16-point behavioural gate, resource isolation, production build, bundle budgets, provenance/licence, security/secrets, and dependency checks. Existing build warnings remain for the large preview chunk and ineffective dynamic import. Sites v78 is unchanged until exact-head CI and this branch's review deployment.
- Product hardening is not complete. Step 39's full copy review and Step 48's final release gate remain open. Continue Step 39 in order, then follow the remaining hardening programme; PRODUCT_HARDENING.md remains authoritative. Human user sessions remain owner-waived, not passed. D1/R2 are unprovisioned and no paid infrastructure or secrets were added.

## Historical checkpoint — 2026-11-03

- Working copy: the scoped Verso-integration worktree.
- Branch: codex/verso-integration-private, currently at `efc2276bf9f4bd528db1e0233555df32eb33e31a`; PR #8 remains open and unmerged. Both exact-head GitHub workflows passed on the preceding code commit `3367ac5987142adaa9efe58127d6d97c2e2f06da` (PR CI run 41586587136; Push CI run 41586570562), including Playwright E2E/Axe. New audit-record-head runs 41591477851, 41591497534 and component-quality run 41591497546 are in progress. A new public v72 resource-route report has completed locally (648 route/viewport captures; 648 screenshots; zero route, runtime, network or copy-risk flags). That report is being added to the audit evidence.
- The private Verso inspection integration is implemented and exercised locally across 1,053/1,053 source modules. It reuses the canonical resource schema and preview app, exposes a separate loopback-only source runtime, and keeps all Verso items out of public catalogue/Gold, Workbench, registry, CLI/MCP and export surfaces.
- Verso source declares UNLICENSED/private. Rights and attribution remain unresolved, so public distribution and certification are intentionally blocked. Local render success is not component-quality certification. No private source or projection was copied into the repository.
- The repeat private preview audit on 2026-11-03 recorded 1,053 successful renders, zero unresolved items/failures/warnings, zero uncaught browser errors, zero failed requests, and no non-200 essential responses. Axe found zero violations and one contrast-incomplete result; no contrast certification is claimed. Evidence summary: quality/VERSO_LOCAL_INTEGRATION_EVIDENCE.md; raw source-tree evidence remains outside Git.
- The current local product-hardening ledger has 463 findings: 0 Critical, 87 High, 348 Medium and 28 Low. AUD-454 (direct preview wrapper navigation), AUD-455 (confirmation spacing), and AUD-456 (Workbench startup layout shift) are fixed and locally verified at desktop/mobile; deployed verification is pending. AUD-456 was reproduced on public v72 at desktop and mobile under delayed startup: the full-height loading shell collapsed to one line; mobile CLS measured 0.510487 and desktop content disappeared. AUD-452's cold mobile resource failure is fixed locally: the final 412×823 Sites Worker run measured 0.017716 CLS on first load, reload, and an injected Gold chunk failure; the failed hero retained 448px and produced no uncaught exception. A new public v72 cache-bypass trace still measured CLS 0.18, while another same-day clean-profile trace measured 0; AUD-452 remains open pending deployed verification. Evidence: `audit/evidence/step-48/aud452-mobile-cold-resource-load/public-v72-devtools-repeat-2026-11-03.json`.
- Manual reading of isolated resource previews on public v72 found AUD-457–AUD-463, covering unsupported pricing and plan claims, fabricated billing state/action, first-party FAQ claims, finance residue, and a false click affordance. All seven have local content/interaction fixes; the focused Sites Worker regression passes desktop/mobile. Hosted verification is pending, and the earlier static copy scan did not inspect preview iframe text semantically.
- On the updated working tree, frozen install, catalogue build (324/40), all 22 typechecks, lint, Vitest (1,324 passed/1 configured skip), `audit:all` (16/16 behavioral checks, provenance/security/dependency audits, bundle budgets), and production build passed. Browser evidence for the current tree is split across runs: the full Astro phase passed 394 with 134 configured skips; Sites desktop had 207 passes and 10 skips, plus one stale expected-label failure; that certification test was updated and its desktop rerun passed. Sites mobile passed 176 with 42 skips, the isolated preview app passed 3/3, and the new copy/billing regression passed 2/2. The full `pnpm test:e2e` command has not yet completed green as one clean run; exact-head CI is pending. Do not treat the previous `3367ac5` E2E result as validation of these newer changes.
- Frozen installation, catalogue generation (324 resources/40 Gold), all 22 workspace typechecks, lint, unit/integration suite (1,313 passed/1 configured skip), `audit:all` (16/16 behavioral release gate plus provenance/security/dependency checks), and production build passed. The final full Playwright rerun passed 779 tests with 186 configured profile skips and zero failures: Astro 394/134, Sites desktop 207/10, Sites mobile 175/42, and isolated preview 3/0. The complete log is `quality/evidence/step-48/test-e2e-final-2026-11-03-after-preview-harness.log`. Exact-head GitHub PR CI run 41586587136 and Push CI run 41586570562 both passed E2E/Axe on 3367ac5.
- Public review Site remains v72 at https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/. D1/R2 are unprovisioned; the £20/month ceiling, zero-secret persistence rule and strict preview CSP remain in force. No deployment or infrastructure change has occurred in this checkpoint.

### 2026-11-03 continuation — public homepage sample

The live v72 homepage and `/compose` were checked at 1440×900 and 390×844. Both routes had no console errors/warnings, uncaught exceptions, failed requests, HTTP errors, or horizontal overflow. Homepage Lighthouse snapshots scored 100 for accessibility, best practices, SEO, and agentic browsing; DevTools cold traces recorded LCP 364ms desktop / 337ms mobile and CLS 0 for both. Compose loaded `/data/catalog.json` (324 resources, 40 `verified-gold`), reached Ready, exposed the primary brief in the mobile viewport, and its sample controls and keyboard focus worked. The visible sample-data and illustrative-preview disclosures were truthful; no copy defect was identified in these sampled routes. Evidence is in `audit/evidence/step-39/live-v72/` and `quality/STEP_39_EVIDENCE.md`. The full copy review remains incomplete.

The same public v72 sample also covers `/explore` at desktop and mobile. Search, query/category composition, URL state, lazy previews, mobile filter-dialog Escape handling, and focus restoration behaved as expected; captured screenshots and request details are in `audit/evidence/step-39/live-v72/`. This still does not certify all catalogue search terms, resource cards, or the full feature matrix.

The v72 resource-route sweep visited every catalogue detail slug at both sizes: 648/648 HTTP 200 routes with zero browser/network errors, broken images, overflow, or configured copy-risk matches. Per-route screenshots and the full report are under `audit/evidence/step-39/live-v72/resource-route-sweep/`. This covers the deployed route shell and text-risk rules, not the manual semantic review, resource variants, or interaction-state certification.

The public v72 `/tools/` index and ten tool routes were also visited at both sizes (22 captures), with HTTP 200, no runtime/network failures or overflow, and no configured copy-risk matches. This does not exercise the tools' mutations or certify their output; that remains in the later ordered tools step.

### Work in progress

- The deployment-side preview-wrapper handoff failure was reproduced against a production-like Sites Worker. A direct navigation request used a concrete Site target origin even though the wrapper's response CSP makes it an opaque-origin document. The bounded protocol now targets only the direct parent; each host still validates sender frame/origin/schema/resource ID, and navigation still requires a visible user confirmation. The pre-fix browser regression fails; the post-fix direct-wrapper desktop/mobile regression passes with zero console errors, uncaught exceptions or failed requests.
- Product hardening remains open. In particular, the hosted provider-header path cannot be verified while the laptop backend and provider endpoint are unconfigured; cold mobile Workbench, the new shared Workbench startup shell, and recent accessibility/responsive changes still need issue-specific deployed verification. The broader feature matrix, exhaustive resource certification, cross-surface acceptance and release gate are not complete.
- Human usability sessions remain owner-waived, not passed.

## Mission order and next action

1. **Mission B — Verso component integration:** complete as a local, owner-only inspection adapter within the existing licence restriction. Do not publish or make these components eligible for Core until rights are documented and each component passes its own certification.
2. **Mission A — Product Hardening:** continue in the required order. Fixes from the fresh v78 audit now pass focused local browser checks; the full E2E matrix and exact-head CI remain outstanding. Commit the source and evidence by root cause, run exact-head CI, publish the review build under standing owner authorization, and recheck the same behaviors on the deployed Site. Continue the remaining ordered hardening work afterward; this checkpoint is not a release gate.
3. Update PR #10 from the scoped branch after exact-head CI; do not merge. Standing authorization for automatic recommended deployment persists, so publish only after CI passes, then re-run the affected browser flows on the new review Site and close findings only with hosted evidence.

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

### 2026-11-03 continuation — complete local regression pass

Starting from `c99c867cf064c9803511fd911f512dee23925952`, I fixed the Explore
preview failure-timer registration so the visible loading state only appears
after its timeout is armed, and changed the error-state regression to locate
the stable preview surface after the iframe is removed. I also retained the
Sites preview queue behavior for explicitly constrained connections and the
shared reduced-motion renderer fix. The browser runs now pass the full matrix:
Astro desktop/mobile 396 passed / 134 configured skips; Sites Worker desktop
209 / 10; Sites Worker mobile 177 / 42; standalone preview 3 / 0. Total: 785
passed, 186 configured skips, zero failures. Machine summary:
`../audit/evidence/step-48/local-full-e2e-2026-11-03.json`.

Frozen installation, catalogue generation (324 resources / 40 Gold), all 22
workspace typechecks, lint, Vitest (1,324 passed / 1 skipped), the 16/16
behavioral release gate, resource isolation, production build, bundle budgets,
license/provenance, secret/security and dependency audits also passed. This is
local evidence only: the public review Site is still v73. The audit now has
465 findings (0 Critical, 87 High, 350 Medium, 28 Low). AUD-452, AUD-464, and
AUD-465 remain pending issue-specific deployed rechecks; the wider release and
human-validation gates remain incomplete.

Verso integration remains the private owner-only adapter over the inspected
1,053 source modules. The private source declares `UNLICENSED`; without written
redistribution rights, those modules cannot be copied into the public
catalogue, Gold runtime, Workbench, registry, CLI/MCP or export. No source was
copied during this continuation. This completes the technically permitted
local integration, not public redistribution or per-component certification.

The two product fixes are isolated in commits `5a8310980808d87159cd2dfa1f6dcf63d4fa5e55` (reduced motion) and `72301ad3c890f36ce2a42fe1288700824b474933` (Explore previews). The delayed-response Playwright harness correction is `93b2ae606a72176acbdbbc851a4d2f7a9cbe8f20`. Audit findings AUD-464 and AUD-465 reference their respective fix commits. All three are locally verified; deployed verification remains pending.
