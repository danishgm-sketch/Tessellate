# Step 24 before-fix regression observations

The failing regression was run against the pre-fix library and built Workbench UI.

- `pnpm exec vitest run packages/exporter/src/__tests__/exporter.test.ts` failed because the generator returned only `AGENT_BRIEF.md`, `PROJECT_DNA.json`, and `manifest.tess.json`; the product contract expects `AGENT_PROMPT.md`, `COMPONENTS.md`, `DESIGN.md`, `IMPLEMENTATION.md`, `PRODUCT.md`, `dependencies.json`, and `project.tess.json`.
- `pnpm exec playwright test tests/e2e/compose-workbench-handoff.spec.ts --project=desktop-chrome` timed out after 30 seconds waiting for `export-agent-handoff-btn` after opening the Workbench Export menu. The control was absent.
- The original failing run did not retain a before screenshot. The after screenshots show the new Beta action on desktop and mobile; the report files record browser errors and network state.