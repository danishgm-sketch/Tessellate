# AUD-452 — Mobile Workbench cold-load stability

## Public reproduction

Public review v72 was loaded in Chrome at 412×823, DPR 1.75, 4× CPU and Fast
4G with the cache disabled. Chrome DevTools recorded CLS 0.5028, LCP 4,844 ms,
TTFB 1,195 ms and 3,649 ms render delay. The shift session began at 4,829 ms
and affected the hero, value-proposition, conversion CTA and footer renderer
wrappers while five Gold chunks loaded. The DevTools trace could not be saved
to the workspace; its returned findings are retained in
`quality/evidence/step-48/public-v72-live-audit-2026-11-02/flagship/workbench-cls-investigation.json`.

## Regression and fix

Run the regression on the production-like Sites Worker:

```powershell
pnpm exec playwright test tests/e2e/workbench-mobile-cold-resource-layout-shift.spec.ts --config tests/e2e/sites-preview.playwright.config.ts --project=sites-mobile-chromium
```

Before the correction, a fault-injection run aborted the `editorial-hero` Gold
chunk and delayed four other active-screen chunks by 1.8 seconds. It reproduced
CLS 0.502772. The screen preload hook had used fail-fast `Promise.all` and marked
the screen ready in `finally` after the first rejected import, leaving the
other chunks pending while the renderer mounted.

The hook now deduplicates active-screen resource slugs and uses
`Promise.allSettled` across individual resource loads. The renderer mounts only
after every attempt settles; a failed resource still shows the renderer's
resource-specific recovery state and retains the project reference.

## Local result

After `pnpm build` regenerated the Sites artifact:

- cold load CLS: 0.00;
- reload CLS: 0.00;
- injected one-failed/four-delayed resource CLS: 0.00;
- normal console errors/warnings, uncaught exceptions, failed requests and HTTP
  errors: zero;
- injected failure: one expected failed request, visible specific resource
  error, zero uncaught exceptions;
- related mobile Workbench Playwright regressions: 4 passed;
- Workbench UI Vitest: 10 passed;
- mobile Workbench WCAG 2.2 A/AA scan: passed;
- Sites production build: 733 static pages; existing large-chunk warnings
  remain.

The pre-fix Playwright output is `red-fault-injection.log`. The green machine
report and screenshots distinguish the cold load, reload and injected failure.
Public review v72 is unchanged; this issue remains open until the same
regressions pass on a new review deployment.
