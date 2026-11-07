# Schema and Contract Hardening Matrix

This matrix records exercised canonical contracts. Object and payload coverage is
in `packages/schemas/src/__tests__/leaf-contracts.test.ts` (87 fixture and
mutation cases) plus `schemas.test.ts`. A check is marked `PASS` only
when a focused regression or an existing integration test demonstrates it.
Unrun checks remain `FAIL` and are not inferred from TypeScript types.

| Contract | Valid fixture / producer | Boundaries | Missing required | Unknown fields | Malformed values | Version compatibility | Migration | JSON round trip | Cross-reference integrity |
|---|---|---|---|---|---|---|---|---|---|
| DesignDNA | PASS | PASS | PASS | PASS | PASS | N/A | N/A | PASS | N/A |
| ProductModel | PASS | PASS | PASS | PASS | PASS | PASS | PASS (nested project migration) | PASS | N/A |
| ScreenGraph | PASS | PASS (declared minimum) | PASS | PASS | PASS | N/A | N/A | PASS | PASS |
| ResourceManifest | PASS | PASS (declared minima and numeric bounds) | PASS | PASS | PASS | PASS | PASS (current only) | PASS | N/A |
| ProjectManifest | PASS | N/A (no declared maximum) | PASS | PASS | PASS | PASS | PASS (0.1.0 → 1.0.0) | PASS | PASS |
| ProjectMutation | PASS (all 19 discriminants) | PASS (declared bounds) | PASS | PASS | PASS | N/A | N/A | PASS | PASS (duplicated targets) |
| LockSpec | PASS | PASS (one to all lock types) | PASS | PASS | PASS | N/A | N/A | PASS | PASS (ProjectManifest) |
| HistoryOperation | PASS | PASS (one or more mutations) | PASS | PASS | PASS | N/A | N/A | PASS | PASS (nested mutations) |
| ExportSettings | PASS | PASS (closed target enum/defaults) | PASS (defaults) | PASS | PASS | N/A | N/A | PASS | N/A |
| IntentCommand | PASS | PASS (-100 to 100 delta) | PASS | PASS | PASS | N/A | N/A | PASS | N/A |
| AuditResult | PASS | PASS (score minima/maxima) | PASS | PASS | PASS | N/A | N/A | PASS | N/A |

## Implemented contract rules

- Persisted `ProductModel`, `ResourceManifest`, and `ProjectManifest` objects use
  the exact current version `1.0.0`.
- The one registered project migration upgrades version `0.1.0`; missing,
  malformed, unsupported older, and future project versions fail with an
  actionable error. Resources have no legacy migration yet, so only `1.0.0` is
  accepted.
- Canonical object schemas reject unknown declared-object keys. Explicit value
  maps such as node props and slots remain open records.
- Screen graph edge endpoints must resolve. Project screens must refer to graph
  screen nodes; navigation targets must refer to project screens; lock targets
  must refer to existing nodes; node IDs must be unique across the manifest.
- Mutations with both an outer target and a payload target reject mismatches.
  The executor validates the mutation before lock checks and validates its
  output manifest before returning it.
- Screen deletion removes its navigation items and incident graph edges and is
  blocked when the deleted screen contains locked nodes.

## Remaining gaps

All declared object schemas and all mutation payloads now have valid JSON
fixtures, malformed/missing/unknown-field checks where the field is required,
and semantic JSON round-trip checks. Numeric contracts and required collection
minima have focused boundary cases. Schema versions apply only to the three
persisted top-level contracts: ProjectManifest 0.1.0 has a deterministic
migration; ProductModel follows that migration when nested; ResourceManifest
rejects all non-current versions because no older version is documented.
Untyped/open maps (props, slots, and declared metadata maps) remain open by
contract. No other migration is inferred.
