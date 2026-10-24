# Step 52 — Canonical flagship workflow evidence

The exact employee-experience brief was run through the visible Compose and Workbench UI in Chromium at 1440×900 and 390×844. Both runs generated three direction previews without unresolved-resource placeholders, selected Direction C, verified the handoff project through the exported manifest, applied onboarding and settings Design DNA overrides, locked the dashboard KPI subtree, recomposed at high divergence, replaced an activity resource, used Surprise Me, and checked exact undo/redo restoration through exported manifests. Both exported and inspected the standalone ZIP; the desktop run extracted it to a clean temporary directory, installed its dependencies, built it, and opened it in a real browser at desktop and mobile widths.

Evidence:

- Desktop screenshot: `quality/evidence/step-52/after/employee-workbench-desktop-1440.png`
- Mobile screenshot: `quality/evidence/step-52/after/employee-workbench-mobile-390.png`
- Desktop machine record: `quality/evidence/step-52/after/employee-workflow-desktop-1440.json`
- Mobile machine record: `quality/evidence/step-52/after/employee-workflow-mobile-390.json`
- Exported desktop and mobile ZIPs: `quality/evidence/step-52/after/employee-experience-desktop-1440.zip` and `quality/evidence/step-52/after/employee-experience-mobile-390.zip`
- Store-global test-integrity regression: `quality/evidence/step-52/workbench-debug-store-regression.json`

Both visible workflow records report empty console error, warning, uncaught exception, failed request, and HTTP error arrays. The desktop standalone export installed, built, and opened in browser. Trace-based performance evidence and public review-site verification remain outstanding; this evidence does not close the broader release gate.
The dedicated Apps/Sites smoke now launches the built Sites Worker rather than Astro's standalone preview. It passes 2/2 cases against the local adapter, including the standalone export journey and the tools/catalogue/resource detail check. Its machine record and desktop/mobile homepage captures are quality/evidence/step-52/sites-smoke-worker-regression.json and quality/evidence/step-52/after/sites-worker-home-*.png. This remains local verification; no public review deployment was performed.
