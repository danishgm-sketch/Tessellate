# Accepted baseline lint debt

2026-10-16: 51 warnings, zero errors. No lint rule is disabled by this acceptance.

This bounded debt is accepted for baseline consolidation, not as a Core quality certification. Unused declarations are maintenance debt. Explicit any occurs in legacy analysis/test/agent boundaries and must be narrowed during the ordered package gate; no new unvalidated boundary is authorized. Runtime schema validation and browser workflows remain mandatory.

The lint command caps total warnings at 51. This register names each affected file and rule so acceptance is reviewable. Reduce the cap as debt is removed; do not raise it to admit new warnings.

| File | Rule | Count | Remediation gate |
| --- | --- | ---: | --- |
| packages/exporter/src/targets/expo-native.ts | @typescript-eslint/no-unused-vars | 3 | 17/41 Workbench and integration tests |
| packages/ingest/src/ast-mapper.ts | @typescript-eslint/no-unused-vars | 3 | 29 ingestion/patching |
| packages/ingest/src/types.ts | @typescript-eslint/no-unused-vars | 1 | 29 ingestion/patching |
| packages/mcp/src/tools.ts | @typescript-eslint/no-explicit-any | 1 | 27 MCP |
| packages/registry-gate/src/__tests__/registry-gate.test.ts | @typescript-eslint/no-unused-vars | 4 | 30 registry gate |
| packages/registry-gate/src/checks/license-provenance-check.ts | @typescript-eslint/no-explicit-any | 4 | 30 registry gate |
| packages/registry-gate/src/checks/token-hygiene-check.ts | @typescript-eslint/no-unused-vars | 1 | 30 registry gate |
| packages/registry-gate/src/runner.ts | @typescript-eslint/no-unused-vars | 1 | 30 registry gate |
| scripts/benchmarks/run-1000-benchmarks.ts | @typescript-eslint/no-unused-vars | 1 | 17/41 Workbench and integration tests |
| tests/e2e/flagship-acceptance-journey.spec.ts | @typescript-eslint/no-explicit-any | 32 | 17/41 Workbench and integration tests |
