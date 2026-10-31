# Step 41 — Cross-feature workflow evidence

Step 41 checks whether supported manifests retain their meaning across the visible Workbench, CLI, MCP client and export boundaries. Tests ran against the locally built Sites Worker at 1440×900 and 390×844. This does not verify the public review Site; deployed verification remains a later release gate.

## Results

- UI Compose → Direction C → Workbench → ZIP, CLI validate/export and MCP validate/export: passed. The same project ID, seven screens and 31 generated files were preserved. CLI and MCP generated trees matched exactly.
- MCP Design DNA edit → CLI/MCP validate/export: passed. The visible Workbench result and both generated trees reflected playfulness 74.
- CLI compose → visible Workbench manifest import → visible DNA edit → manifest export → CLI validation: passed at desktop and mobile sizes. Invalid input and a duplicate project ID were rejected without replacing the open project.
- MCP compose → visible Workbench manifest import → visible DNA edit → CLI/MCP validation: passed at desktop and mobile sizes.
- Simple source ingestion → manifest → CLI/MCP validation/export: passed. The 112-byte source fixture remained unchanged and both exporters produced the same 13 files. Ingestion is Beta and did not reconstruct business logic.
- Axe on the manifest import action reported zero violations. Recorded browser console, page, failed-request and HTTP-error arrays are empty.
- OS restart recovery: all 8 expected containers returned; both Tessellate containers were healthy and the local API health endpoint returned HTTP 200. See the Step 37 recovery record.
- The first full `pnpm audit:all` run exposed 10 dependency advisories in two packages (2 high, 6 moderate, 2 low). The locked undici 7/8 and fast-uri 3 lines were below the patched versions. Targeted overrides now resolve undici 7.30.1/8.12.2 and fast-uri 3.1.9; `pnpm audit:dependencies` reports no known vulnerabilities. See AUD-312/AUD-313 and the before/after dependency logs.

The full local browser regression is `tests/e2e/cross-surface-manifest-step-41.spec.ts`. It passes in the aggregate suite on desktop Chromium, mobile Chromium, and both Sites Worker profiles. The initial aggregate run also caught a brittle handoff test that assumed exactly three export-menu Tab stops; after the import control added a fourth visible action, the test was changed to verify the live button order. The focused handoff regression then passed 2/2 desktop/mobile cases.

## Final local quality rerun

- Frozen dependency installation: passed.
- `pnpm test`: 1,214 tests across 77 files passed.
- `pnpm typecheck`: passed across the configured workspace projects.
- `pnpm lint`: passed with the configured warning cap.
- `pnpm audit:all`: passed, including 16/16 behavioral gates, 324/324 resource-isolation scans, 733 Astro pages, Sites Worker artifact generation, bundle budgets, provenance/licence, secrets/security, and dependency audits.
- `pnpm test:e2e`: 521 passed, 144 configured skips, zero failures. Breakdown: main desktop/mobile projects 284 passed / 108 skipped; Sites Worker desktop/mobile 234 passed / 36 skipped; isolated preview app 3 passed.
- `pnpm audit:dependencies`: no known vulnerabilities after the targeted undici and fast-uri updates.

Command logs are stored in `quality/evidence/step-41/`; the machine-readable totals and workflow records are in `quality/evidence/step-41/integration-matrix.json`.

## Findings and fixes

### AUD-310 — identical manifests produced timestamp-dependent exports

- **Evidence:** the new exporter regression was run red before the change; its first comparison found README timestamps differed between exports of the same manifest. See `quality/evidence/step-41/before/export-determinism-regression.json`.
- **Root cause:** all five target README generators embedded the current timestamp in output.
- **Affected code:** `packages/exporter/src/targets/vite.ts`, `next.ts`, `expo.ts`, `swiftui.ts`, `tokens.ts`, and `packages/exporter/src/__tests__/exporter.test.ts`.
- **Remediation:** use stable attribution text and assert byte-for-byte determinism across all five generated source trees.
- **Disposition:** fixed and locally verified; public review verification remains pending.

### AUD-311 — Workbench could not import a manifest from CLI or MCP

- **Evidence:** before the fix, the visible Workbench Export menu had no manifest-import action; the browser regression failed because the expected file chooser did not exist. See `quality/evidence/step-41/before/workbench-import-regression.json`. After screenshots and machine-readable results are in `quality/evidence/step-41/after/`.
- **Root cause:** the canonical JSON importer existed in the exporter package but no Workbench UI exposed it.
- **Affected code:** `packages/workbench/src/components/TopToolbar.tsx`, `docs/WORKBENCH_SPEC.md`, `docs/CURRENT_PRODUCT_INVENTORY.md`, and `tests/e2e/cross-surface-manifest-step-41.spec.ts`.
- **Remediation:** add a visible manifest-open action to the existing Export menu, validate through the canonical importer, cap input at 5 MiB, reject project-ID collisions, preserve the current project on malformed input, and announce success or error.
- **Disposition:** fixed and locally verified at desktop/mobile sizes; public review verification remains pending.

### AUD-312 — transitive undici versions failed the dependency security gate

- **Evidence:** `quality/evidence/step-41/pnpm-audit.json` records high/moderate advisories affecting undici 7.29.1 and 8.11.2 in the Wrangler/Miniflare and Astro/Unifont dependency paths. `dependency-audit-after.log` records the clean result.
- **Root cause:** the workspace pinned the undici 7 line below the latest security patch and did not constrain the newly introduced undici 8 line.
- **Affected code:** `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
- **Remediation:** resolve undici 7 to 7.30.1 and undici 8 to 8.12.2, the patched releases from the upstream advisories.
- **Disposition:** fixed and dependency-audited locally; full release gate rerun is in progress and published verification remains pending.

### AUD-313 — transitive fast-uri version failed the dependency security gate

- **Evidence:** `quality/evidence/step-41/pnpm-audit.json` records four advisories affecting fast-uri 3.1.8 in the MCP SDK’s Ajv dependency path. `dependency-audit-after.log` records the clean result.
- **Root cause:** the lockfile resolved the MCP validation dependency to fast-uri 3.1.8, below patched 3.1.9.
- **Affected code:** `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
- **Remediation:** constrain the fast-uri 3 line to 3.1.9 and rerun the dependency gate.
- **Disposition:** fixed and dependency-audited locally; full release gate rerun is in progress and published verification remains pending.

## Limits

This is evidence for the tested manifest crossings, not certification of every feature listed in the product plan. The source-ingestion case is a small Beta smoke; it makes no claim that Tessellate reconstructs application behavior. No Site version was saved or published during this step.
