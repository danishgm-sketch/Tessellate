# Step 17 failing regressions

These red runs were captured against the production Astro preview before their
respective fixes. The corresponding before screenshots and machine-readable
runtime reports are alongside this file.

## AUD-148 — disabled canvas action did not select its node

- Route: `/workbench?project=Direction-C`
- Viewport: 390 × 844.
- Action: select Settings & Policies and tap the disabled “Explore Interface
  System” resource button in Preview.
- Failing assertion: the Workbench inspector did not show `Node: component`, and
  the mobile navigation remained on Preview.
- Browser runtime: zero console errors, warnings, uncaught exceptions, failed
  requests, or HTTP errors.
- Screenshot: `disabled-resource-canvas-selection-not-selectable-mobile-390x844.png`.
- Report: `disabled-resource-canvas-selection-not-selectable-mobile-390x844.json`.

## AUD-149 — resource kinds were flattened into sections

- Route: `/workbench?project=Direction-C`
- Viewport: 1440 × 900.
- Action: compose the exact employee-experience brief and open Direction C.
- Failing browser assertion: the visible project had no
  `[data-node-type="component"]` to select.
- Failing contract assertion: `entity-profile-header`, a `block` resource, was
  emitted with node type `section`.
- Screenshot: `resource-kinds-flattened-desktop-1440x900.png`.
- Report: `resource-kinds-flattened-desktop-1440x900.json`.
