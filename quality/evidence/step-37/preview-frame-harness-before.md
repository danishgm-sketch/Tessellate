# Preview frame test-harness regression

Date: 2026-10-22

Command: `pnpm test:e2e`

The Sites Worker stage reported 14 failures: the same seven resource-copy
assertions in desktop and mobile Chromium. Each failed while
`openResourcePreview` waited 15 seconds for `.tess-screen` on the top-level
page. Playwright's error context showed the top-level document contained only
the preview `iframe`, as required by the opaque-origin isolation design.

The failing assertion was a stale test assumption, not a product rendering or
network failure. Preview DOM and interaction checks needed to use
`iframe[data-tessellate-preview-frame]` as their frame scope.
