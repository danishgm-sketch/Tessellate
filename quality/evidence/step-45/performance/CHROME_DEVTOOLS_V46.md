# Chrome DevTools Performance Review — public v46

Captured 2026-10-27 against the public review Site with Chrome DevTools MCP at 1× CPU and Fast 4G where noted. The report is lab data; CrUX has no field data for these pages.

| Surface | Viewport | LCP | TTFB | LCP render delay | CLS | Result |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Home | 390×844 | 549 ms | 57 ms | 492 ms | 0.00 | Pass |
| Home | 1440×900 | 559 ms | 65 ms | 494 ms | 0.00 | Pass |
| Compose | 390×844 | 322 ms | 132 ms | 190 ms | 0.00 | Pass |
| Compose | 1440×900 | 479 ms | 49 ms | 430 ms | 0.00 | Pass |
| Workbench with a saved employee project | 390×844 | 1,060 ms | 56 ms | 1,004 ms | 0.00 | Pass |
| Workbench with a saved employee project | 1440×900 | 1,085 ms | 44 ms | 1,041 ms | 0.00 | Pass |

The browser reported no console messages or failed/HTTP-error requests on the captured routes. Compose loaded `/data/catalog.json` with a 304 revalidation and cached catalogue data. Workbench loaded its local saved project without requesting the catalogue; its periodic host-status endpoint returned HTTP 200 and explicitly reported the laptop backend unavailable, with deterministic local editing still active.

The homepage trace reported an 855-element DOM and a 93 ms largest layout update. Its render-blocking stylesheet request took 209 ms end to end, but DevTools estimated zero FCP or LCP savings from deferring it. Workbench's largest observed layout update was 41 ms across 160 nodes. The longest observed critical request chain was 718 ms. These findings did not indicate a user-visible release blocker.

The build emits a generic >500 KB raw chunk warning. Inspection identifies the largest lazy resource module as 868,549 bytes raw / 175,090 bytes gzip. It is part of the Gold resource renderer and fits the documented Workbench gzip budget; the homepage does not request it.

Two interaction captures measured 45 ms and 25 ms. Chrome DevTools attributed the no-navigation trace URL to `/compose` even while the page showed Workbench, so these samples are retained as unassigned interaction timings rather than route-level INP. Field INP, FCP, TBT, and Speed Index were unavailable; no CrUX data exists for this review domain.

Machine details: [`chrome-devtools-v46.json`](./chrome-devtools-v46.json).
