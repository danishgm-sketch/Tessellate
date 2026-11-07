# Step 17 — Workbench fundamentals evidence

## Scope and result

The exact 500-person employee-experience brief was entered through `/compose`,
Direction C was selected through the visible UI, and the resulting project was
opened in Workbench. The browser journey exercised the actual production Astro
preview at 1440 × 900 and 390 × 844 without reading or mutating the Workbench
store.

The desktop run exercised the Brief, Pages, Layers and Library panels; selected
the screen root by keyboard, a section, a component and a primitive element;
verified that the inspector followed selection; and used Escape to climb from an
element to its parent and back to Project Scope. It opened Structure, Style,
Motion, Content and Audit modes, checked active mode state, used the zoom toolbar
and keyboard shortcuts, and switched Fluid, 768px and 1440px device presets. The
1440px frame reached its requested width after its 300ms transition, and the
Workbench document remained within the desktop viewport.

The mobile run verified all five bottom navigation actions, changed to the
Settings & Policies screen, selected a disabled resource action by tapping its
canvas location, selected a component and an element, and opened Inspect,
Command, Audit and Motion. The disabled action remains unavailable while its
resource is selectable. The app had no horizontal document overflow at 390px.

This exposed two underlying defects. Composition had flattened resource-backed
blocks, components and primitives into `section` nodes, hiding the actual editor
hierarchy. The shared composition pipeline now maps each resource kind to its
corresponding node type, while navigation remains a layout. Separately, native
disabled controls suppressed the click Workbench used for selection; the renderer
now captures pointerdown at the resource boundary, prevents the disabled action,
and selects the resource node. Both defects have red-to-green regression evidence
and are recorded as AUD-148 and AUD-149 in `audit/runtime-audit.json`.

Both passing reports contain zero console errors or warnings, uncaught
exceptions, failed requests or HTTP error responses, and no missing-resource or
unresolved-role placeholders. The project presents seven coherent employee
experience screens: Marketing Home, Team Overview, People Directory, Teams,
Engagement, Onboarding, and Settings & Policies.

## Evidence and validation

- Red-to-green disabled-control regression: the mobile UI test fails when the
  pointer-capture handler is removed and passes with the handler restored.
- Red-to-green resource-kind contract regression: the exact brief's composed
  resource nodes fail when block/component/primitive kinds are flattened, then
  pass with the resource-to-node mapping.
- Browser test: `pnpm exec playwright test tests/e2e/workbench-fundamentals-hardening.spec.ts --reporter=line` — 2 passed (desktop and mobile; opposite viewport projects are explicitly skipped).
- Repository verification: `pnpm typecheck`, `pnpm test` (910 tests in 63 files), `pnpm lint` (0 errors, 51 configured warnings), `pnpm audit:all` (all 16 behavioral gates plus bundle, license/provenance, and security checks), and the 717-page Astro build all passed.
- Full E2E gate: `pnpm test:e2e` passed with 167 public-site tests (63 scoped skips), 45 Sites Worker tests (27 scoped skips), and 3 preview-app tests. This includes the 324-resource / certified-width rendering matrix and the clean standalone flagship export test.
- Desktop screenshot and machine report:
  `quality/evidence/step-17/after/workbench-fundamentals-desktop-chrome.png` and
  `.json`.
- Mobile screenshot and machine report:
  `quality/evidence/step-17/after/workbench-fundamentals-mobile-chrome.png` and
  `.json`.
- Disabled resource selection after capture:
  `quality/evidence/step-17/after/disabled-resource-canvas-selection-mobile-390x844.png`.
- Before screenshots, runtime reports and concise red-regression records are
  under `quality/evidence/step-17/before/`.

This verifies local production-preview behavior only. The affected public
review Site still requires the same browser checks at Step 45.
