# Step 48 — Release evidence

Step 48 remains open. This record captures the current public review publication
and its targeted verification; a documentation-only Site publication is not a
release approval or a substitute for the complete product release gate.

## Public documentation publication — 2026-10-30

- Public Site: https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/
- Saved/published version:
  `appgprj_6acc036de8cc8191a823339566972d85~appgver_a265d974a0cc8191b4bfd079767f8624`
- Deployment: `appgdep_6ae4cc6dfba48191984d011a62d11de8`
- Sites source mirror commit: `f90ebd07e1055b461b26478807b69497c0450af2`
- Canonical content snapshot: `b74fc1e5da6c58588a6ab9c598bd627f85c1636d`
- D1/R2: not provisioned.
- Runtime: existing Astro/React application remains; no application, package,
  resource, schema, or security-policy changes were included in v56. The Site
  version publishes canonical decision, product inventory, hardening, and
  deployment documentation.

## Deployed smoke evidence

Playwright checked Home, Compose, Workbench, Decisions, Current Product
Inventory, and Product Hardening at 1440×900 and 390×844 (12 route/viewport
checks). All 12 had HTTP 200, no horizontal overflow, no console errors or
warnings, no uncaught exceptions, and no failed requests. Compose reported
`Catalogue ready`; Workbench hydrated the existing Employee Experience sample.
The two inspected page captures are:

- Desktop: `quality/evidence/step-48/sites-v56-targeted-smoke-2026-10-30/desktop-1440x900-product-hardening.png`
- Mobile: `quality/evidence/step-48/sites-v56-targeted-smoke-2026-10-30/mobile-390x844-product-hardening.png`
- Machine record: `quality/evidence/step-48/sites-v56-targeted-smoke-2026-10-30/runtime-smoke.json`

The full public v56 copy/resource browser suite separately passed 113 cases
with 9 configured skips and zero unexpected failures. Details and report:
`quality/STEP_39_EVIDENCE.md` and
`quality/evidence/step-39/public-v56-copy-2026-10-30/runner/report.json`.

Chrome DevTools lab traces on the unchanged public application measured desktop
homepage LCP 365 ms, CLS 0.00, TTFB 82 ms, and mobile LCP 969 ms, CLS 0.00,
TTFB 74 ms (mobile profile: 4× CPU, Fast 4G, reduced motion). Each trace
observed 26/26 successful requests and no console messages. INP and field CrUX
data are unavailable. These measurements are single-run lab samples and do not
represent the whole Site's field performance.

## Release boundary

The v55 full deployed product re-audit remains the latest complete application
audit. The v56 result is a docs-only publication plus targeted route and copy
checks; it does not close unrelated ledger entries. The PR still must satisfy
the protected `main` branch's exact-head checks and all remaining documented
release gates. Do not mark Step 48 complete before protected merge and final
release verification. The public Site remains public, with browser-local guest
flows; no paid infrastructure was introduced.

Sites metadata included a bypass bearer field in a read-only response during
verification. The owner had previously authorized rotation; the token was
rotated immediately, was not used, and the replacement was not recorded in the
repository or logs.


## Review defect reproduction and local remediation — 2026-10-30

The public v56 Site reproduced two user-visible defects before the fixes were applied to the local source. All browser data remained in isolated guest contexts. The evidence directory contains before screenshots, Playwright contexts, traces, and a machine-readable report:

- `quality/evidence/step-48/pre-fix-v56/locked-page-was-deleted.png`: Pages deleted Settings & Policies after its Settings form was locked.
- `quality/evidence/step-48/pre-fix-v56/content-history-undo-remains-stale.png`: Undo restored the project value but left the edited row visible in the Content JSON field.
- `quality/evidence/step-48/pre-fix-v56-playwright.json`: both deployed cases failed their expected-state assertions.

Seven additional review findings were reproduced in focused pre-fix unit/integration tests. The regressions now pass after the fixes:

| Finding | Root cause fixed | Regression coverage |
|---|---|---|
| AUD-378 | Stale synchronous recovery journal survived a newer IndexedDB write after quota failure. | `browser-session.test.ts` |
| AUD-379 | Shared active-project corruption leaked into project-specific loads. | `browser-session.test.ts` |
| AUD-380 | Node Visual Mode eagerly wrote descendant variants that reset did not remove. | `dna-hierarchy.test.ts` |
| AUD-381 | Page deletion bypassed validated mutation and left secondary navigation references. | `workbench-store.test.ts` |
| AUD-382 | Page deletion bypassed subtree lock validation. | Store and visible Playwright regression |
| AUD-383 | Structured content draft did not sync when Undo/Redo changed committed data. | Desktop/mobile visible Playwright regression |
| AUD-384/AUD-385 | Next.js export accessed browser state during SSR and omitted shared layout CSS. | Exporter regression |
| AUD-386 | API update wrote unvalidated revision summaries. | D1 integration regression |
| AUD-387 | Manifest-inherited project name/description bypassed stored metadata limits. | D1 create/update regression |
| AUD-388 | Journal quota failure prevented durable checkpoint writes. | Checkpoint persistence regression |
| AUD-389 | Top-navigation Surprise Me flattened locked content containers. | Deterministic mutation regression |

The complete local gates at the v56 checkpoint are recorded in `quality/STEP_47_EVIDENCE.md`. The targeted v57 audit and latest local gates are recorded below. The wider hardening programme remains incomplete. The static review Site has no D1/R2 bindings; Next.js export and authenticated cloud API are not Site runtime features, so their regression protection is the exporter and D1 integration suite. No security policy or persistence boundary was weakened.

## Public v57 targeted audit and local remediation — 2026-10-30

The public v57 Site was tested in an isolated guest browser at desktop 1440×900 and mobile 390×844. The exact employee-experience brief reached a ready catalogue, generated three directions, and opened Direction C in Workbench. All five modes were opened. The UI flow exercised a summary lock, recomposition, semantic Gold replacement, Surprise Me, and Undo/Redo. The mobile Workbench had no horizontal overflow; its requests and browser console were clean. This targeted audit is not a repeat of the full v55 route sweep.

Before screenshots and machine evidence:

- Workbench desktop showing the erroneous archetype and percentage: `quality/evidence/step-48/deployed-v57-2026-10-30/before-aud390-391-workbench-1440x900.png`.
- Compose directions: `quality/evidence/step-48/deployed-v57-2026-10-30/compose-directions-1440x900.png`.
- Workbench mobile: `quality/evidence/step-48/deployed-v57-2026-10-30/workbench-390x844.png`.
- Browser journey and route observations: `quality/evidence/step-48/deployed-v57-2026-10-30/runtime-smoke.json`.

This run reproduced AUD-390 (employee experience labelled Recruitment with recruitment-only hard constraints) and AUD-391 (100 displayed as 10000%). Their regressions failed before the fixes and pass after them. Full-root unit tests also exposed AUD-392: a clean standalone export install resolved `tslib@2.9.1`, whose npm tarball returned 404. The exporter now pins the verified 2.8.1 package when Motion is included. The same clean generated export now installs, builds, and passes its Chromium interaction/runtime assertions. Failure and corrected run evidence is in `export-registry-failure.json`.

### Latest local quality results

All gates passed on code head `680fbe1fab99d913885957bd0bb5dd8c3a55fbe1`:

- `pnpm install --frozen-lockfile`, `pnpm build:catalog` (324 resources, 40 Gold), `pnpm typecheck`, and `pnpm lint`.
- `pnpm test`: 1,236 passed, 1 configured skip, 0 failures.
- `pnpm audit:all`: 16/16 behavioural release checks, 324/324 source-isolation checks, 733 Astro pages built, bundle budgets passed, 324/324 licence/provenance checks, 0 security violations, and no known dependency vulnerabilities.
- The export regression completed a fresh npm install, production build, and Chromium browser check outside the repository dependency tree.
- `pnpm test:e2e`: 700 passed, 167 configured skips, 0 unexpected failures. Suite split: root desktop/mobile 357/121, Sites desktop 187/6, Sites mobile 153/40, preview app 3/0.

Exact gate outputs are summarized in `quality/evidence/step-48/local-quality-2026-10-30/verification-summary.json`. The public v58 issue-specific re-audit and exact-head GitHub CI are pending; AUD-390 and AUD-391 are not marked deployed-closed yet. AUD-392 is locally verified through the independent exporter runtime test and awaits exact-head CI before non-Site closure.
