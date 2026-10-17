# Step 07 — Renderer and export parity evidence

Status: in progress on 6baf9d1e93b2a6e11cac075b21d879cfa2c863ae. These are local regression results; no public Site or review
deployment has been updated. The six new runtime-audit findings remain open until
the deployed review build is re-audited.

## Defects reproduced and corrected locally

| Finding | Prior behavior | Corrected behavior | Regression evidence |
|---|---|---|---|
| AUD-071 | Unknown preview IDs displayed the Button resource and never reached the missing-resource error branch. | The preview renders an accessible unavailable state, sends `TESSELLATE_PREVIEW_ERROR`, and does not send `TESSELLATE_PREVIEW_READY`. | `tests/e2e/preview-unknown-resource-regression.spec.ts`; [before](../audit/evidence/step-07/before/unknown-resource-button-fallback.png), [after](../audit/evidence/step-07/after/unknown-resource-error-state.png). |
| AUD-072 | In Workbench, a Gold resource's `props.children` replaced its nested `ProjectNode` children. | Canvas and Workbench Preview preserve both child sources. | `packages/renderer/src/__tests__/gold-registry.test.tsx`, `tests/e2e/renderer-children-parity.spec.ts`; [before](../audit/evidence/step-07/before/manifest-prop-child-only.png), [canvas](../audit/evidence/step-07/after/manifest-and-prop-children.png), [Preview](../audit/evidence/step-07/after/preview-modal-children.png). |
| AUD-073 | Exported JSX emitted `props.children` or nested node JSX, dropping one source. | Exported JSX emits both sources; a clean generated project displays both. | `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`; [standalone result](../audit/evidence/step-07/after/standalone-export-children.png). The pre-fix source-generation assertion failed because the prop-child text was omitted. |
| AUD-074 | Workbench allowed an undeclared variant to reach a component, which silently selected its default style; export also accepted it. | Workbench shows a recoverable diagnostic without rendering that component; export rejects it and lists the declared variants. | `packages/renderer/src/__tests__/gold-registry.test.tsx`, `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`, `tests/e2e/unsupported-resource-variant-regression.spec.ts`; [before](../audit/evidence/step-07/before/unsupported-variant-fell-through.png), [after](../audit/evidence/step-07/after/unsupported-variant-diagnostic.png). |
| AUD-075 | Workbench ignored a resource's declared `slots.children` when the node also had nested manifest children. | Canvas and Preview show both slot content and nested nodes, with resource child-prop eligibility enforced. | `packages/renderer/src/__tests__/gold-registry.test.tsx`, `tests/e2e/renderer-children-parity.spec.ts`; [before](../audit/evidence/step-07/before/resource-slot-child-lost.png), [canvas](../audit/evidence/step-07/after/resource-slot-and-nested-children.png), [Preview](../audit/evidence/step-07/after/preview-modal-slot-children.png). |
| AUD-076 | Standalone export ignored node-level mobile `omit`, `stack`, and `collapse` strategies. | Generated React applies the strategies at 390 px; Workbench and exported browser use the same shared fixture. | `packages/testing/src/renderer-parity-fixture.ts`, `packages/renderer/src/__tests__/renderer-parity.test.tsx`, `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`, `tests/e2e/renderer-children-parity.spec.ts`; [before](../audit/evidence/step-07/before/export-responsive-override-visible.png), [export after](../audit/evidence/step-07/after/standalone-export-responsive-390.png), [Workbench after](../audit/evidence/step-07/after/workbench-responsive-390.png). |

The before captures were gathered by running the prior implementations against a
local browser session. Unknown Preview IDs showed Button controls. The first
Workbench child probe found prop content visible and nested content absent; the
slot regression found nested content visible and declared slot content absent.
These failures were silent: no console errors or failed network requests.

## Verification

- `pnpm build` passed after regenerating catalogue and runtime resource artifacts. The build retains existing large-chunk warnings; they are not introduced by this parity fix.
- `pnpm typecheck` passed across the workspace.
- `pnpm lint` passed with zero errors and 51 existing warnings.
- Focused Vitest: 69 passed across renderer registry, renderer behavior, the shared desktop/mobile parity fixture, all 324 resource variant declarations, and exporter fidelity. The standalone project is installed in a clean temporary directory, built, started with Vite preview, and opened in Chromium. The final run completed without worker errors.
- Focused Playwright: 4 passed across PreviewApp, shared Workbench canvas/Preview/mobile rendering, declared-slot child rendering, and Workbench invalid-variant handling. The standalone browser run also recorded zero console errors and failed requests.
- `pnpm typecheck` passed across the workspace. `pnpm lint` passed with zero errors and 51 existing warnings. `pnpm build` passed, including the Sites artifact build.
- `pnpm audit:all` passed on the responsive renderer fix: all 16 release criteria, 717-page production build, bundle budgets, catalogue licence/provenance, and security/secret checks.
- `audit/runtime-audit.json` now contains 76 findings: 16 High and 60 Medium. The six new findings are `fixed-awaiting-deployed-verification`.

## Remaining Step 07 work

This evidence covers the six failures found while tracing the renderer contract.
It does not yet certify parity for every manifest/resource combination, every
variant/slot/prop edge, or every Preview, Workbench, and export rendering path.
Do not mark Step 07 complete until a broader shared-fixture parity matrix verifies
those contracts and the changes pass CI. The public Site has not been deployed or
re-audited, so no finding is closed.
