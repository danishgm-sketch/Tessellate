# Step 27 — MCP hardening evidence

The MCP package now uses the same catalogue and composition contracts as the
product UI. The protocol tests launch the real stdio server from a clean,
unrelated working directory and connect to the local SSE server with the
official MCP SDK client. This hardens the existing integration; it does not
make remote unauthenticated SSE a supported deployment mode.

## Reproduced findings and remediation

| Finding | Severity | Evidence and reproduction | Root cause | Remediation | Status |
| --- | --- | --- | --- | --- | --- |
| MCP-27-01: agent working directories received a stale catalogue | High | Load the MCP provider from two different project roots after loading the canonical catalogue. The process-global cache returned the first catalogue for both roots; an agent could receive the wrong resource definitions. | One global catalogue cache ignored the requested workspace path. | Catalogue cache is keyed by resolved root/source. Regression tests load two independent temporary catalogues and verify their version and resources remain separate. | Fixed locally; regression passes. |
| MCP-27-02: invalid or unavailable catalogue looked like valid empty data | High | Put an invalid resource in a local catalogue and call the provider, or make the remote fallback unavailable. Previously this could return an empty/synthetic catalogue and make downstream searches appear successful. | Catalogue errors and schema failures were swallowed by fallback behavior. | Local catalogue metadata and each resource are validated. Remote fallback has a timeout and validation. Missing, malformed, or unavailable sources now fail with actionable errors. Regression verifies malformed input is rejected without rewriting it. | Fixed locally; regression passes. |
| MCP-27-03: MCP composition omitted controls used by the product UI | High | Compose the canonical employee-experience brief through the MCP tools and compare it with the shared composition pipeline. MCP could not pass feel, ambition, structural creativity, target devices, constraints, or a stable seed, so its output diverged. | The tool schema exposed a reduced, separately assembled input. | Both compose tools accept the relevant controls; screen composition accepts a reproducible seed and direction. Protocol regression checks the ProductModel, ScreenGraph, Design DNA, navigation, project identity, and resource refs against the shared engine. | Fixed locally; parity regression passes. |
| MCP-27-04: mutation success concealed missing targets and no-op operations | High | Call lock/mutation with a missing node or action arguments, then validate the returned manifest. Previously invalid targets could be reported as successful mutations. | Mutations lacked action-specific preconditions and result validation. | Required arguments and node IDs are validated, DNA deltas use the canonical schema, resulting manifests are validated, locks are retained, and invalid operations return MCP errors. Idempotent operations report `changed: false`. | Fixed locally; protocol regression passes. |
| MCP-27-05: accessibility audit overstated what manifest-only checks prove | High | Request an accessibility audit for a manifest without rendering it. The previous result could present an inferred level as achieved without inspecting DOM contrast, keyboard, or assistive-technology behavior. | Heuristic manifest checks were presented as browser certification. | Audit output names its heuristic scope, marks unmeasured dimensions as not assessed, and returns `not-assessed` rather than claiming conformance. | Fixed locally; protocol regression passes. |
| MCP-27-06: SSE used wildcard cross-origin access | High | Send an OPTIONS request with an untrusted Origin to the SSE message endpoint. The previous wildcard policy allowed arbitrary browser origins to access responses. | CORS was permissive and session routing was not isolated per SSE client. | CORS uses an explicit origin allowlist; untrusted preflight receives 403 without an allow-origin header. Each SSE client receives an independent server/session. The regression opens two simultaneous SDK clients and exercises both. | Fixed locally; protocol regression passes. |
| MCP-27-07: canonical DNA presets were not reliably resolved | Medium | Request a documented preset by ID. Presets are an array, but the previous lookup treated them like an object and could fall back to defaults. | Collection shape mismatch in preset lookup. | Presets resolve by canonical ID through `getDNAPreset`; unknown IDs list supported choices. | Fixed locally; protocol regression passes. |
| MCP-27-08: direction discovery claimed brief-specific semantics it did not implement | Medium | List the direction definitions and compare with actual A/B/C manifests for a supplied brief. Earlier static labels implied archetype-specific claims that the generator could not guarantee. | Documentation described sample behavior as an engine guarantee. | Directions are described as stable approach classes, and response labels match A/B/C. Tests verify the labels and approach identifiers. | Fixed locally; protocol regression passes. |
| MCP-27-09: alternatives and recommendations could be irrelevant | Medium | Request alternatives with criteria and request recommendations for an intent with no lexical matches. The old implementation did not use the criteria and could return arbitrary top-ranked items when scores were zero. | Ranking ignored the supplied criteria and treated zero-score results as recommendations. | Alternatives filter to compatible resource types/shared categories and disclose the ranking basis. Recommendations return no arbitrary items when lexical overlap is zero; blank intent is rejected. | Fixed locally; protocol regression passes. |
| MCP-27-10: public MCP setup instructions used an unpublished package | Medium | Follow the documented `npx @tessellate/mcp` command. The workspace package is private and not published, so a user could not install it as documented. | Documentation assumed a registry distribution that does not exist. | The guide now documents running the MCP server from a local checkout with pnpm, and states the package is private. A real stdio client starts that command from an unrelated current directory. | Fixed locally; startup regression passes. |
| MCP-27-11: horizontally scrolling setup sample was inaccessible by keyboard | Medium | At desktop and mobile widths, focus the `/docs/mcp/` configuration `<pre>`. It could not receive focus, and Axe reported `scrollable-region-focusable` as a serious violation. Before screenshots are in `quality/evidence/step-27/before/`. | The code sample had horizontal overflow but no focusability or accessible name. | Added `tabindex="0"` and an accessible label. The browser regression now parses the sample as JSON, verifies focus, checks Axe, console/network failures, and responsive overflow. After screenshots are in `quality/evidence/step-27/after/`. | Fixed locally; regression passes after verification. |

## Verification

- `pnpm exec vitest run packages/mcp/src/__tests__ --reporter=verbose`: 3 test
  files, 7 tests passed.
- Tests use the official MCP SDK `Client` over real stdio and SSE transports;
  all 15 registered tools are listed and exercised across the workflow and
  error cases.
- Employee-experience composition checks domain entities/screens, all three
  directions, resolved resource refs, stable-seed parity with the shared
  composition engine, locking, DNA mutation, navigation mutation, unlock,
  project validation, honest audit output, and Vite source generation.
- `pnpm typecheck`: passed across the workspace.
- `pnpm lint`: passed with 0 errors and 47 repository warnings; the MCP source
  lint check passed without warnings.
- `pnpm audit:all`: all 16 release gates passed, including catalogue build,
  Astro production build (717 pages), bundle budgets, provenance/licence, and
  secrets/security audit.
- `pnpm test`: 67 files and 939 tests passed.
- `pnpm test:e2e`: 203 Chromium tests passed / 67 skipped; 45 Sites Worker tests
  passed / 27 skipped, including all 324 catalogue resources at certified
  widths; 3 preview-app tests passed. No test failed. Playwright's
  `NO_COLOR`/`FORCE_COLOR` warning came from the runner environment.
- `pnpm exec playwright test tests/e2e/mcp-docs-regression.spec.ts
  --project=desktop-chrome --project=mobile-chrome`: passed after the fix on
  desktop and mobile; the initial run failed on both projects as expected and
  captured the Axe/focus defect.
- `git diff --check`: passed.

## Capability boundary

The MCP package remains a private workspace package. Its export tool generates
source files but this step does not install, build, or runtime-test those files;
export is therefore not certified as a production MCP capability. SSE is local
and unauthenticated. The server binds to loopback by default; non-loopback
exposure is not an approved remote service and must remain Beta/disabled until
authentication and authorization exist. Manifest-only accessibility output is
not a DOM or assistive-technology certification.
