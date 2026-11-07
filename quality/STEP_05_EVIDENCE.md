# Step 05 — Contract and schema hardening evidence

Status: complete for local contract and regression gates. This closes the
contract-freeze phase only; it does not certify deployed browser behavior or
resource quality. Step 06 is the next phase.

## Defects corrected

| Defect | User-facing risk / reproduction | Root cause and affected code | Regression evidence |
|---|---|---|---|
| Unknown keys and ambiguous persisted versions could be silently accepted or stripped. | Submit a malformed project/resource manifest or an unsupported schema version; consumers could interpret different data. | Persisted contracts now use exact versions, declared object schemas are strict, and project migration accepts only the documented `0.1.0 → 1.0.0` path. See `packages/schemas/src/{version,project,product,resource,migrations/index}.ts`. | `packages/schemas/src/__tests__/schemas.test.ts`; `packages/schemas/src/__tests__/leaf-contracts.test.ts`. |
| Dangling graph, screen, navigation, node, lock, or mutation references could pass validation. | Validate a manifest with duplicated IDs, missing referenced nodes/screens, or a mutation whose outer and payload targets disagree. | Added cross-reference checks to `ScreenGraphSchema` and `ProjectManifestSchema`; mutation targets must agree; the executor validates inputs before lock checks and validates outputs. See `packages/schemas/src/{project,mutations}.ts` and `packages/workbench/src/mutations/executor.ts`. | Schema cross-reference tests; `packages/workbench/src/__tests__/phase10-gate.test.ts`. |
| A mismatched mutation target could bypass a lock check. | Lock a node, then submit a mutation with one ID in the envelope and another in its payload. | Lock enforcement previously trusted the outer target while execution could use the payload target. Schema validation now rejects the mismatch before lock evaluation. | Failing regression added in `phase10-gate.test.ts`, then verified passing. |
| Screen filtering and screen deletion could leave invalid navigation or graph references. | Compose with a forbidden screen, or delete a screen and validate/render the resulting project. | Planner edges were retained for omitted screens; showcase navigation used graph IDs instead of project-screen IDs; deletion did not clean references. Producers now use valid IDs and deletion removes incident edges/navigation, while locked descendants prevent deletion. See `packages/composer/src/{planner,showcases}.ts` and Workbench mutation/lock code. | Composer regression and Workbench phase-10 regressions. |
| Ingestion emitted undeclared navigation fields and inconsistent graph references. | Map a multi-screen source project, then validate its manifest. | AST mapping used graph-node IDs inconsistently and emitted extra navigation fields. Mapper now emits the canonical contract. | Existing ingest package tests plus strict project-schema coverage. |
| Release gate export fixture no longer represented a valid current project. | Run the behavioural release gate after schemas began rejecting legacy/invalid fixture data. | The fixture used an obsolete shape and placeholders. It now uses a schema-valid project and real runtime resource. | `scripts/verify-release-gate.ts`; included in `pnpm audit:all`. |

## Coverage and results

- `packages/schemas/src/__tests__/leaf-contracts.test.ts`: 87 cases across
  declared object contracts and all 19 mutation discriminants, including valid
  JSON round trips, malformed values, unknown keys, missing required fields,
  numeric limits, and collection minima.
- `packages/schemas/src/__tests__/schemas.test.ts`: 51 cases for versions,
  migration, persisted manifests, and cross-reference behavior.
- Full repository tests: **52 files, 576 tests passed**.
- TypeScript: `pnpm typecheck` passed, including the Sites adapter.
- Catalogue: `pnpm build:catalog` passed for **324 resources (40 Gold)**.
- Lint: `pnpm lint` passed with zero errors; 51 existing warnings remain.
- Full audit: `pnpm audit:all` passed, including 16/16 behavioural gates,
  production builds, bundle checks, provenance/licence validation, and security
  audit with zero violations.
- Browser suite: `pnpm test:e2e` passed **73**, skipped **7**; the executed
  Playwright desktop/mobile coverage includes the flagship Compose-to-Workbench
  path. Skips remain unverified and are not recorded as passes.
- `git diff --check` passed.

## Compatibility boundaries

Project manifests migrate only from the explicitly registered `0.1.0` version.
Product models nested in that migration accept their documented old/current
versions. Resource manifests accept only current `1.0.0`; no legacy resource
shape is documented, so no speculative migration was added. Open maps such as
props and slots remain open by contract. No external deployment or Sites
runtime claim is made by this schema phase.

## Remaining programme work

This evidence does not certify the 324 resources in real browsers, renderer
parity, deployed workflows, or the laptop/Docker backend. Those remain later
ordered programme phases and are not implied complete here.
