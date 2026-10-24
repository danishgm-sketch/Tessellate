# Step 43 — Stress and scale evidence

## Project scale

The built ChatGPT Sites Worker was exercised in desktop Chromium at 1440×900. Each fixture derives from the current employee-experience showcase, uses the visible Workbench Pages panel, switches to the first/middle/final screens, reloads, and exports the manifest through the UI. Each screen contains one root, twelve sections, and forty-eight children.

| Screens | Nodes | Workbench ready | Screen switches (first/middle/final) | Manifest export | Runtime/layout |
| ---: | ---: | ---: | ---: | ---: | --- |
| 3 | 183 | 956 ms | 48 / 58 / 49 ms | 348 ms | no console, page, request, or HTTP errors; no overflow |
| 10 | 610 | 973 ms | 51 / 52 / 53 ms | 176 ms | no console, page, request, or HTTP errors; no overflow |
| 30 | 1,830 | 869 ms | 50 / 51 / 47 ms | 164 ms | no console, page, request, or HTTP errors; no overflow |
| 50 | 3,050 | 372 ms | 38 / 59 / 50 ms | 188 ms | no console, page, request, or HTTP errors; no overflow |

All four scale journeys passed. Their individual machine-readable results and screenshots are in `quality/evidence/step-43/`. These are local Worker measurements on this laptop, not field performance claims. Existing Step 38 evidence separately covers the 30-screen standalone ZIP export budget.

The 50-screen fixture rendered and exported all 3,050 nodes; maximum measured screen-switch latency was 59 ms and manifest export took 188 ms. Chromium heap samples for the scale fixtures were 19.3–29.4 MB. The 30-screen result is consistent with the earlier Step 38 large-project run.

## Sustained editing session

`pnpm quality:step-43-long-session` completed a visible Workbench browser session lasting **60.15 minutes**. It performed 240 Design DNA edits at 15-second intervals, visited Style, Motion, Content, Audit, and Structure six times, waited for 24 durable save checkpoints, and reloaded at edits 80, 160, and 240. It records save state, operation timing, Chromium heap samples, screenshots, console output, request failures, and HTTP errors under `quality/evidence/step-43/long-session/`.

The reduced-duration harness smoke passed 80 UI edits, eight inspector-mode changes, and one reload. The full run passed with all 240 mutations, 24/24 saved checkpoints, all three reloads, and zero console errors/warnings, uncaught exceptions, failed requests, or HTTP errors. Used JS heap rose from 15.2 MB to 23.1 MB early in the session and then stayed flat through the remaining checkpoints; the final sample was 23.1 MB. The slowest sampled UI edit was 457 ms.

## Reproduction

```powershell
pnpm exec playwright test --config tests/e2e/sites-preview.playwright.config.ts tests/e2e/project-scale-step-43.spec.ts
pnpm quality:step-43-long-session
```

The long-session command has a 67-minute timeout. `TESS_STEP43_MUTATIONS`, `TESS_STEP43_IDLE_MS`, `TESS_STEP43_MIN_DURATION_MS`, and `TESS_STEP43_TIMEOUT_MS` can shorten local harness smoke runs; the acceptance run uses the defaults above.
