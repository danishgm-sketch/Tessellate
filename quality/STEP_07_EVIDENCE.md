# Step 07 — Renderer and export parity evidence

Status: in progress on the current consolidation branch. Site v11 is deployed from the
current-source tree and has passed a desktop/mobile flagship smoke. AUD-071 is closed
after deployed verification; AUD-072 through AUD-078 still need issue-specific checks
against the published review Site. The review source commit is
`f2d0443bd9cbd0c3172dd1d85f199ee552c43248`.

## Defects reproduced and corrected locally

| Finding | Prior behavior | Corrected behavior | Regression evidence |
|---|---|---|---|
| AUD-071 | Unknown preview IDs displayed the Button resource and never reached the missing-resource error branch. | The preview renders an accessible unavailable state, sends `TESSELLATE_PREVIEW_ERROR`, and does not send `TESSELLATE_PREVIEW_READY`. | `tests/e2e/preview-unknown-resource-regression.spec.ts`; [before](../audit/evidence/step-07/before/unknown-resource-button-fallback.png), [after](../audit/evidence/step-07/after/unknown-resource-error-state.png). |
| AUD-072 | In Workbench, a Gold resource's `props.children` replaced its nested `ProjectNode` children. | Canvas and Workbench Preview preserve both child sources. | `packages/renderer/src/__tests__/gold-registry.test.tsx`, `tests/e2e/renderer-children-parity.spec.ts`; [before](../audit/evidence/step-07/before/manifest-prop-child-only.png), [canvas](../audit/evidence/step-07/after/manifest-and-prop-children.png), [desktop Preview](../audit/evidence/step-07/after/preview-modal-children.png), [mobile shell](../audit/evidence/step-07/after/workbench-mobile-shell-390.png). |
| AUD-073 | Exported JSX emitted `props.children` or nested node JSX, dropping one source. | Exported JSX emits both sources; a clean generated project displays both. | `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`; [standalone result](../audit/evidence/step-07/after/standalone-export-children.png). The pre-fix source-generation assertion failed because the prop-child text was omitted. |
| AUD-074 | Workbench allowed an undeclared variant to reach a component, which silently selected its default style; export also accepted it. | Workbench shows a recoverable diagnostic without rendering that component; export rejects it and lists the declared variants. | `packages/renderer/src/__tests__/gold-registry.test.tsx`, `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`, `tests/e2e/unsupported-resource-variant-regression.spec.ts`; [before](../audit/evidence/step-07/before/unsupported-variant-fell-through.png), [after](../audit/evidence/step-07/after/unsupported-variant-diagnostic.png). |
| AUD-075 | Workbench ignored a resource's declared `slots.children` when the node also had nested manifest children. | Canvas and Preview show both slot content and nested nodes, with resource child-prop eligibility enforced. | `packages/renderer/src/__tests__/gold-registry.test.tsx`, `tests/e2e/renderer-children-parity.spec.ts`; [before](../audit/evidence/step-07/before/resource-slot-child-lost.png), [desktop canvas](../audit/evidence/step-07/after/resource-slot-and-nested-children.png), [mobile shell](../audit/evidence/step-07/after/resource-slot-and-nested-children-mobile-390.png), [Preview](../audit/evidence/step-07/after/preview-modal-slot-children.png). |
| AUD-076 | Standalone export ignored node-level mobile `omit`, `stack`, and `collapse` strategies. | Generated React applies the strategies at 390 px; Workbench and exported browser use the same shared fixture. | `packages/testing/src/renderer-parity-fixture.ts`, `packages/renderer/src/__tests__/renderer-parity.test.tsx`, `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`, `tests/e2e/renderer-children-parity.spec.ts`; [before](../audit/evidence/step-07/before/export-responsive-override-visible.png), [export after](../audit/evidence/step-07/after/standalone-export-responsive-390.png), [Workbench after](../audit/evidence/step-07/after/workbench-responsive-390.png). |
| AUD-077 | Standalone export filtered standard `data-*` and `aria-*` resource props that Workbench preserves. | Exported resources retain these standard attributes while other undeclared props remain filtered. | Shared Button fixture and clean standalone install/build/browser regression in `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`; [before](../audit/evidence/step-07/before/export-data-attribute-dropped.png), [after](../audit/evidence/step-07/after/export-data-attribute-preserved.png). |
| AUD-078 | A saved Dialog node made standalone export fail compilation because `onClose` was required but cannot be serialized. | `onClose` remains controlled when supplied; otherwise Escape and backdrop close local state. | The [pre-fix clean-build log](../audit/evidence/step-07/before/gold-dialog-export-build-failure.txt) shows TS2741. The clean standalone browser matrix builds, opens the Dialog, and closes it with Escape; [capture](../audit/evidence/step-07/after/export-dialog-open-1440.png). |

The before captures were gathered by running the prior implementations against a
local browser session. Unknown Preview IDs showed Button controls. The first
Workbench child probe found prop content visible and nested content absent; the
slot regression found nested content visible and declared slot content absent.
These failures were silent: no console errors or failed network requests.

## Verification

- `pnpm install --frozen-lockfile`, `pnpm typecheck`, and `pnpm lint` passed. Lint reported zero errors and the configured 51 existing warnings.
- `pnpm test -- --reporter=dot` passed 56/56 files and 622/622 tests. The Miniflare restart test now has a 30-second case budget because it disposes and recreates the local D1 runtime; no behavior or assertion was weakened.
- `pnpm audit:all` passed all 16 behavioral release gates, rebuilt the catalogue and 717 Astro pages, passed bundle budgets, and reported zero licence, provenance, secret, or isolation violations.
- The complete `pnpm test:e2e` command exited 0: 85 main browser tests passed and 51 were explicitly skipped by browser/project scope; all 25 Sites Worker tests passed; the preview-app smoke passed 1/1. The Worker run includes the new favicon and missing-resource alert regressions and the 324-resource / 972-variant certification.
- The saved [324-resource Sites Worker report](../audit/evidence/step-07/after/catalog-324-worker-pass.json) covers 972 declared variants at 360, 390, 430, 768, 1024, 1280, and 1440px, with zero findings, failed requests, or cancelled requests. It includes 63 route screenshots.
- The saved [Gold resource report](../audit/evidence/step-07/after/gold-40-worker-pass.json) covers all 40 Gold resources and 120 variants at the same widths, with zero findings and 120 screenshots. Separate checks passed Gold contrast/accessibility, state, and interaction coverage.
- The clean standalone exporter installed outside repository `node_modules`, built, and ran in Chromium at desktop and mobile sizes; it rendered the Gold fixtures, closed the hostless Dialog with Escape, and recorded no browser errors or failed requests.
- The Workbench/Preview parity checks passed across the 120-node Gold matrix, semantic parity fixture, slot and nested-child rendering, responsive overrides, and unsupported-resource/variant diagnostics. The keyboard Fade-Up check was corrected to observe the actual animated card rather than its inner text wrapper; the complete rerun passed.
- `audit/runtime-audit.json` contains 81 findings: 17 High, 63 Medium and 1 Low. Three findings are closed after deployed verification; AUD-072 through AUD-078 and the other prior fixes still await their specified public checks. AUD-080 remains open for Step 12.
- Site v11 desktop/mobile smoke loaded all 324 catalogue entries, showed three directions, opened Direction C in Workbench, and reported no console errors, uncaught exceptions, failed requests or HTTP errors. The new favicon and assertive missing-resource message work at 1440 × 900 and 390 × 844. Full evidence is in `audit/evidence/public-site-v11/`.

## Remaining Step 07 work

The shared browser fixture covers all 40 Gold resources and their 120 declared variants through Workbench canvas, Workbench Preview, and a clean standalone application. Contract-specific cases cover prop children, declared slot children, nested ProjectManifest nodes, responsive strategies, standard data/ARIA attributes, unknown resources, unsupported variants, and a hostless accessible Dialog.

The matrix does not claim full renderer/export DOM parity for every possible prop value. Step 07 remains in progress until current PR CI passes and the deployed review audit verifies the remaining renderer/export findings. Local evidence alone does not close those findings.
