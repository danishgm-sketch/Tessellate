# Step 16 — Compose to Workbench handoff evidence

## Scope and result

The exact employee-experience brief was entered through `/compose`, with
Professional but playful feel, Refined Visual Ambition, and Radical Structural
Creativity. Direction C was inspected in the visible DNA/resource dialog, then
opened with the visible “Open in Workbench” control. This ran at 1440 × 900 and
390 × 844 against the built Astro production preview.

The selected card project ID matched the ID in the visible direction snapshot,
the `/workbench?project=…` URL, and the active browser project. The Workbench
manifest download parsed against `ProjectManifestSchema`. Its entire manifest
deep-equals the active and ID-keyed local records, and its canonical SHA-256
matches the active record. The Workbench manifest also matches the visible
Direction C preview's Design DNA, navigation model, complete seven-screen list,
and nested node trees. Those trees preserve all 46 nodes, resource references,
variants, props, slots, and node lock fields; project lock records are also
included in the stored/exported manifest equality check. The selection contains
33 resource references and zero visible unresolved-resource diagnostics.

The handoff passed in both browser projects. Each machine-readable report
contains the exact brief, visible Direction C snapshot, persisted manifest,
screen/node/resource counts, equality checks, full request/response inventory,
and final route/viewport. Both reports show zero console errors, console
warnings, uncaught exceptions, failed requests, or HTTP error responses. The
screenshots show the loaded Direction C project in the desktop three-panel
Workbench and the mobile Workbench surface.

## Evidence and validation

- Browser test: `pnpm exec playwright test tests/e2e/compose-workbench-handoff.spec.ts --reporter=line` — 2 passed.
- Desktop capture/report: `quality/evidence/step-16/after/compose-workbench-handoff-desktop-chrome.png` and `.json`.
- Mobile capture/report: `quality/evidence/step-16/after/compose-workbench-handoff-mobile-chrome.png` and `.json`.
- The test uses visible Compose preview controls and the Workbench manifest-export control. It does not read or mutate the Workbench store.

This confirms local production-preview behaviour only. The public review Site
still requires the ordered deployed audit at Step 45.
