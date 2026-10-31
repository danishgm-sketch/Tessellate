# Preview host origin regression — failing evidence

Captured during the Sites Worker E2E run before the fix on 2026-10-21.

- Route: `/resources/advanced-data-table/` (resolved to `/r/advanced-data-table/`)
- Viewport: 360 × 844
- Interaction: the test sent a valid `TESSELLATE_PREVIEW_UPDATE` from the page host to the sandboxed resource frame, setting the title to “People directory” and rows to an empty array.
- Expected: the preview exposes a “Filter People directory” textbox and the empty-state message.
- Actual: the textbox never appeared; Playwright timed out waiting for `iframe[title$=" live preview"]` to contain it. The host message was ignored by `PreviewHost`.
- Browser error context: the failing locator and call are preserved in the test-run output recorded in the session. The test aborted before it serialized runtime diagnostics.

Reproduction:

```powershell
pnpm exec playwright test --config tests/e2e/sites-preview.playwright.config.ts tests/e2e/gold-resource-state-certification.spec.ts --project=sites-chromium
```

Root cause: the renderer is hosted in an opaque sandbox, but `MessageEvent.origin` identifies the sender. `PreviewHost` incorrectly required the sender origin to be `null`; the actual app host sent from the Site origin. The renderer therefore rejected valid initialization and update messages. The fix now requires the direct parent window and exact same-origin sender. The top-level wrapper initializes read-only previews from URL parameters and cannot mutate them.

After screenshots: `preview-host-variant-before-1440.png`, `preview-host-variant-after-1440.png`, `preview-host-variant-before-390.png`, and `preview-host-variant-after-390.png` show the button changing from Quiet to Expressive through the visible resource-detail toolbar.
