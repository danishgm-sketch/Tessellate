# Public v49 route smoke audit

- **Deployment:** [Tessellate review Site](https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/), Sites version v49.
- **Runtime source:** `be97d567bc32fac74abc4bc70921f5edb3739abf`.
- **Captured:** 2026-10-27 18:11 UTC.
- **Coverage:** 31 routes at desktop 1440×900 and mobile 390×844 (62 page loads and screenshots).
- **Result:** 62/62 smoke checks classified `PASS`; every response was HTTP 200. No console errors or warnings, uncaught exceptions, failed requests, bad HTTP responses, horizontal overflow, or catalogue preview/readiness timeouts were recorded.
- **Workbench readiness:** The route audit waits for the visible project heading `A better workday starts with people.` before capturing `/workbench`. The completed screenshots show the loaded project at both viewport sizes.
- **Visual inspection:** Homepage, Explore, Compose, Workbench, resource detail, showcase detail and documentation detail captures were inspected. The Workbench screenshots show the canvas and inspector on desktop and the project preview with the mobile navigation controls on mobile.
- **Limit:** This is route/runtime/layout smoke coverage. `PASS` does not claim every page control, content claim, interaction, accessibility condition or responsive state was fully audited. Detailed checks remain tracked separately in `audit/runtime-audit.json` and `audit/RUNTIME_AUDIT.md`.

Machine-readable per-route evidence is in [`route-audit.json`](route-audit.json). The repeatable capture script is [`route-audit.mjs`](route-audit.mjs). The 62 viewport captures are in [`routes/`](routes/).

## Routes

`/`, `/explore`, `/components`, `/sections`, `/blocks`, `/pages`, `/effects`, `/motion`, `/backgrounds`, `/ai`, `/data`, `/compose`, `/workbench`, `/blueprints`, `/collections`, `/creators`, `/showcase`, `/trends`, `/tools`, `/agents`, `/docs`, `/sponsor`, `/about`, `/license`, `/privacy`, `/terms`, `/r/button`, `/blueprints/b2b-saas/`, `/showcase/showcase-playful-hr/`, `/tools/dna`, `/docs/manifest`.
