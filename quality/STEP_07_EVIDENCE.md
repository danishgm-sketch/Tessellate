# Step 07 — Renderer and export parity evidence

Status: in progress on the current consolidation branch. These are local regression results; no public Site or review
deployment has been updated. The seven new runtime-audit findings remain open until
the deployed review build is re-audited.

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

The before captures were gathered by running the prior implementations against a
local browser session. Unknown Preview IDs showed Button controls. The first
Workbench child probe found prop content visible and nested content absent; the
slot regression found nested content visible and declared slot content absent.
These failures were silent: no console errors or failed network requests.

## Verification

- `pnpm build` passed after regenerating catalogue and runtime resource artifacts. The build retains existing large-chunk warnings; they are not introduced by this parity fix.
- `pnpm typecheck` passed across the workspace.
- `pnpm lint` passed with zero errors and 51 existing warnings.
- Renderer/exporter Vitest suites passed 81/81 across seven files, including all 324 resource variant declarations and the clean standalone install/build/browser test. The exported app ran in Chromium with zero console errors and failed requests.
- Focused Workbench/Preview Playwright checks passed 4/4 across desktop and mobile shells, including shared node parity, declared-slot content, and unsupported variants. Mobile checks now exercise the actual single-column Workbench preview surface rather than assuming the desktop canvas exists at phone widths; screenshots are kept separate by viewport.
- Full `pnpm test:e2e` passed: 79 public desktop/mobile checks, 51 tests skipped by configured project scope, 23/23 Sites Worker checks (including all 324 resources across certified viewports), and 1/1 PreviewApp unknown-resource regression. The flagship employee-experience flow passed in Chromium.
- `pnpm install --frozen-lockfile` had already passed on this checkout; `pnpm typecheck` passed across the workspace. `pnpm lint` passed with zero errors and 51 existing warnings.
- `pnpm audit:all` passed on the current source: all 16 behavioral release criteria, 717-page production build, bundle budgets, catalogue licence/provenance, and security/secret checks. The build emits existing large-chunk warnings; bundle budgets pass.
- AUD-077 regression proof: the clean standalone install/build/browser assertion passed after the exporter fix; before the fix, the same test failed because the data attribute locator was absent. It also verified zero console errors and failed requests. Renderer parity unit tests passed 2/2; Workbench parity browser checks passed 3/3.
- `audit/runtime-audit.json` now contains 77 findings: 16 High and 61 Medium. The seven new findings are `fixed-awaiting-deployed-verification`.

## Remaining Step 07 work

This evidence covers the seven failures found while tracing the renderer contract.
It does not yet certify parity for every manifest/resource combination, every
variant/slot/prop edge, or every Preview, Workbench, and export rendering path.
Do not mark Step 07 complete until a broader shared-fixture parity matrix verifies
those contracts and the changes pass CI. The public Site has not been deployed or
re-audited, so no finding is closed.
