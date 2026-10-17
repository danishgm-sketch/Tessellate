# Step 07 — Renderer and export parity evidence

Status: in progress on 8b2cf2cd5cae1a0e87ae0e37e479b0b74ed5c2e8. These are local regression results; no public Site or review
deployment has been updated. The four new runtime-audit findings remain open until
the deployed review build is re-audited.

## Defects reproduced and corrected locally

| Finding | Prior behavior | Corrected behavior | Regression evidence |
|---|---|---|---|
| AUD-071 | Unknown preview IDs displayed the Button resource and never reached the missing-resource error branch. | The preview renders an accessible unavailable state, sends `TESSELLATE_PREVIEW_ERROR`, and does not send `TESSELLATE_PREVIEW_READY`. | `tests/e2e/preview-unknown-resource-regression.spec.ts`; [before](../audit/evidence/step-07/before/unknown-resource-button-fallback.png), [after](../audit/evidence/step-07/after/unknown-resource-error-state.png). |
| AUD-072 | In Workbench, a Gold resource's `props.children` replaced its nested `ProjectNode` children. | The declared children prop and rendered child nodes are composed, preserving both sources. | `packages/renderer/src/__tests__/gold-registry.test.tsx`, `tests/e2e/renderer-children-parity.spec.ts`; [before](../audit/evidence/step-07/before/manifest-prop-child-only.png), [after](../audit/evidence/step-07/after/manifest-and-prop-children.png). |
| AUD-073 | Exported JSX emitted `props.children` or nested node JSX, dropping one source. | Exported JSX emits both sources; a clean generated project displays both. | `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`; [standalone result](../audit/evidence/step-07/after/standalone-export-children.png). The pre-fix source-generation assertion failed because the prop-child text was omitted. |
| AUD-074 | Workbench allowed an undeclared variant to reach a component, which silently selected its default style; export also accepted it. | Workbench shows a recoverable diagnostic without rendering that component; export rejects it and lists the declared variants. | `packages/renderer/src/__tests__/gold-registry.test.tsx`, `packages/exporter/src/__tests__/standalone-export-fidelity.test.ts`, `tests/e2e/unsupported-resource-variant-regression.spec.ts`; [before](../audit/evidence/step-07/before/unsupported-variant-fell-through.png), [after](../audit/evidence/step-07/after/unsupported-variant-diagnostic.png). |

The two Workbench before captures were gathered by running the prior renderer and
preview implementations from commit `dbc85c4` against a local browser session.
The missing preview showed Button controls for an unknown ID. The Workbench child
probe found the prop child visible and the nested child absent. Both sessions had
no console errors or failed network requests, so these failures were silent.

## Verification

- `pnpm build` passed after regenerating catalogue and runtime resource artifacts. The build retains existing large-chunk warnings; they are not introduced by this parity fix.
- `pnpm typecheck` passed across the workspace.
- `pnpm lint` passed with zero errors and 51 existing warnings.
- Focused Vitest: 65 passed across renderer registry, renderer behavior, and exporter fidelity. The standalone project is installed in a clean temporary directory, built, started with Vite preview, and opened in Chromium. The final run completed without worker errors.
- Focused Playwright: 3 passed across PreviewApp, Workbench child rendering, and Workbench invalid-variant handling. No uncaught browser errors or failed requests were recorded by these tests.
- `audit/runtime-audit.json` now contains 74 findings: 14 High and 60 Medium. The new findings are `fixed-awaiting-deployed-verification`.

## Remaining Step 07 work

This evidence covers the four failures found while tracing the renderer contract.
It does not yet certify parity for every manifest/resource combination, every
variant/slot/prop edge, or every Preview, Workbench, and export rendering path.
Do not mark Step 07 complete until a broader shared-fixture parity matrix verifies
those contracts and the changes pass CI. The public Site has not been deployed or
re-audited, so no finding is closed.
