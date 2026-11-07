# Step 36 — Responsive behavior

Status: **local browser gate complete for the audited major surfaces; full catalog/resource matrix and public release verification remain open**.

## Scope and method

Ran `tests/e2e/responsive-hardening-step-36.spec.ts` against the rebuilt Sites Worker in desktop Chromium and Pixel 7 Chromium emulation. The matrix covered 14 routes at each required CSS width: 360, 390, 430, 768, 1024, 1280, 1440 and 1536. Surfaces were Home, Explore, Compose, Workbench, Button detail, Tools, Accessibility Lab, Blueprints, AI Product blueprint, Showcases, the playful HR showcase, Documentation, CLI documentation and About. All 224 route/viewport combinations returned HTTP 200 and retained visible primary content. Document width, main landmark geometry and header geometry stayed within the viewport; the browser recorded zero console errors, uncaught exceptions, failed requests or HTTP errors. Each route/width pair has a screenshot.

Interaction checks opened and closed the public navigation drawer at its breakpoint, opened and closed Explore filters below the desktop rail breakpoint, switched Workbench between its phone/tablet tabs and desktop panels at 1023/1024, and submitted a real brief through Compose at all eight widths. The three generated directions remained available and their Workbench actions stayed within the viewport. The Home primary action and Workbench title/save state also received dedicated 360/390/430 checks. The final Sites Worker run passed all 10 browser tests across the two Chromium profiles.

Visual review covered phone, tablet and desktop captures, including open navigation/filter states, Compose directions and Workbench panels. The public shell now keeps “Start building” on one line on phones. Workbench preserves its save status badge within the viewport while truncating a long project name in the available space.

## Findings and fixes

### Medium — Home primary action wrapped at 360px

**Evidence:** The first 360px Home screenshot at `quality/evidence/step-36/sites-chromium/360-home.png` showed “Start building” broken across two lines. The new regression failed with two rendered text lines before the fix.

**Reproduction:** Open `/` at 360 CSS pixels and inspect the header CTA.

**Root cause:** The desktop horizontal padding and CTA padding consumed the narrow header width, so the primary action's label wrapped.

**Affected code:** `apps/site/src/components/home/SiteHeader.tsx`.

**Remediation:** Reduce horizontal padding below the small-screen breakpoint, use a narrower phone CTA inset, and prevent the CTA label from wrapping. The 360, 390 and 430px regression now passes in desktop and mobile Chromium, and [the after capture](evidence/step-36/interactions/phone-header-360.png) shows one-line text.

### Medium — Workbench save status clipped at 360px

**Evidence:** The initial 360px Workbench capture showed the save-status badge extending to 364px. The regression failed before the fix because its right edge exceeded the 360px viewport. After the fix, the status remains fully inside the toolbar and the long project title truncates; see [the after capture](evidence/step-36/interactions/workbench-status-360.png).

**Reproduction:** Open `/workbench/` at 360 CSS pixels and compare the save-status badge's right edge with the viewport.

**Root cause:** The title and local-save status shared a non-shrinkable flex row. The title's intrinsic width pushed the persistence status outside the viewport while the shell hid page-level overflow.

**Affected code:** `packages/workbench/src/components/TopToolbar.tsx`.

**Remediation:** Allow the title cluster and project-name control to shrink, and keep the save status at its intrinsic width. At 360, 390 and 430px the project name and the complete save-state label are visible and in bounds.

## Evidence

- Machine-readable result: `quality/evidence/step-36/verification.json`.
- Desktop route/viewport screenshots and runtime records: `quality/evidence/step-36/sites-chromium/`.
- Pixel 7 route/viewport screenshots and runtime records: `quality/evidence/step-36/sites-mobile-chromium/`.
- Breakpoint interaction states: `quality/evidence/step-36/interactions/`.
- Compose generated directions at all eight widths: `quality/evidence/step-36/compose-workflows/`.

This gate samples the main product shells and representative tool/resource/example routes; it does not certify every catalogue resource at every width, Firefox/WebKit, every control state, or the published review Site. Those remain in their later resource, browser-matrix and public-release gates.
