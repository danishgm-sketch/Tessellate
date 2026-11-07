# Municipal water composition review — 2026-11-07

This is local browser evidence for one realistic public drinking-water utility brief. It covers the existing Compose flow and its three generated directions; it does not certify a live utility application.

## Scenario and result

The brief asks dispatchers and field crews to locate affected streets, assign qualified repair crews, verify isolation and water-quality clearance, and prepare accessible resident updates. The initial browser run produced generic SaaS/ERP screens without outage, repair, clearance, or resident-update workflows. The existing ERP interpreter now carries this operational water-utility brief through domain-specific entities, workflows, five required screens, safety safeguards, and accurately disclosed example content.

The regression uses the visible `/compose` interface in the local Sites Worker. It inspects all three directions and each of the five screens, checks screen-specific workflows and disconnected-data copy, selects screens with the keyboard, closes the dialog with Escape, verifies required resources resolved, and checks the preview for horizontal overflow. Reduced motion is enabled. The desktop profile is 1440×900; the mobile profile is 390×844.

Each observation JSON stores the rendered screen text and browser telemetry. Both report zero console errors, uncaught exceptions, failed requests, and HTTP errors. The preview has no unresolved required-role or missing-resource diagnostics and no horizontal overflow beyond 1px. The seven screenshots per profile show all five Direction 01 screens plus the Network Operations overview in Directions 02 and 03.

## Scope limits

All numbers and records are examples. The prototype does not connect to dispatch, network maps, field-device storage/synchronisation, water tests, approvals, persistence, or resident notification systems. It does not declare water safe or set a regulatory clearance standard. The export/backend remains an unconnected example and requires utility-owned integration and review before operational use.

## Verification record

- Water composition Playwright test: desktop and mobile passed; zero browser/network errors.
- Targeted Vitest composition and interpreter tests: 22 passed.
- Full unit suite: 97 files; 1,356 passed, 1 configured skip (a preceding run exposed one intermittent laptop-healthcheck temp-file failure; the complete rerun passed without source changes).
- Typecheck: all 22 workspace projects passed. Lint passed. `pnpm audit:all` passed all 16 release gates, audited 324 resources, and built 733 Astro pages.
- Full browser coverage: Astro desktop/mobile passed 402 with 140 configured skips; Sites Worker mobile passed 214 with 46 configured skips; standalone preview passed 3/3. The Sites Worker desktop profile recorded four timing/loading failures after the full catalogue run (245 passed, 11 skipped); each failed test passed individually on retry. An ordered reproduction then recorded one pending `/_astro/manifest.3vTMqesi.js` request for `multi-series-line-chart`; the same resource passed ten consecutive seven-width runs, and the downstream Gold-state, stress, responsive, and Workbench lazy-load tests passed in sequence. Keep this browser-suite stability issue visible; do not count the full E2E command as green.
- Build warnings remain for the preview's >500 kB raw JS chunk and an ineffective dynamic import of Button. Gzip route budgets passed. This iteration added no service binding, paid dependency, secret, or public deployment.

Step 39 remains open. The wider manual review of all catalogue resources, docs, CLI, MCP, errors, and secondary flows is incomplete. The product release gate remains open.
