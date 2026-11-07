# Public v85 route and flagship re-audit

- Site: https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/
- Sites version: 85
- Sites version ID: `appgprj_6acc036de8cc8191a823339566972d85~appgver_a4a58b31f42881918ef627fd99d8c643`
- Deployment ID: `appgdep_6aee912c731481919084dcd2d2423405`
- Canonical source: `8574755fe9c1f51d90357c3a7b039ca6b8adac37`
- Sites source mirror: `ca1b4663edc74727a0d54c258458feca7432a02a`
- Browser: Playwright Chromium
- Viewports: desktop `1440×900`; mobile `390×844`

## Route results

`PASS` means the deployed route produced its route-specific heading and visible content, returned HTTP 200, fit the viewport, and had clean browser/network telemetry. This is a route-shell classification; interactions called out below have separate visible-UI evidence.

| Route | Desktop | Mobile | Route-specific heading |
|---|---|---|---|
| `/` | PASS | PASS | Describe the product. / Get the interface. |
| `/explore` | PASS | PASS | Explore Resource Library |
| `/components` | PASS | PASS | Components |
| `/sections` | PASS | PASS | Sections |
| `/blocks` | PASS | PASS | Application blocks |
| `/pages` | PASS | PASS | Page architectures |
| `/effects` | PASS | PASS | Effects |
| `/motion` | PASS | PASS | Motion |
| `/backgrounds` | PASS | PASS | Backgrounds |
| `/ai` | PASS | PASS | AI patterns |
| `/data` | PASS | PASS | Data visualisation |
| `/compose` | PASS | PASS | Product Composer |
| `/workbench` | PASS | PASS | Workbench: Example employee workspace |
| `/blueprints` | PASS | PASS | Product blueprints |
| `/collections` | PASS | PASS | Your resource collection |
| `/creators` | PASS | PASS | Resource creators |
| `/showcase` | PASS | PASS | Showcase projects |
| `/trends` | PASS | PASS | Catalogue signals |
| `/tools` | PASS | PASS | Ten Interface Tools. |
| `/agents` | PASS | PASS | Tessellate for agents |
| `/docs` | PASS | PASS | Documentation |
| `/sponsor` | PASS | PASS | Support the open commons |
| `/about` | PASS | PASS | About Tessellate |
| `/license` | PASS | PASS | Licences and provenance |
| `/privacy` | PASS | PASS | Privacy in this review |
| `/terms` | PASS | PASS | Review terms |
| `/r/editorial-hero` | PASS | PASS | Editorial Hero |
| `/showcase/showcase-playful-hr` | PASS | PASS | Kudos Employee Experience |
| `/blueprints/b2b-saas` | PASS | PASS | B2B SaaS |
| `/tools/palette` | PASS | PASS | Palette Studio |
| `/docs/cli` | PASS | PASS | Tessellate CLI (`tess`) |

The route runner captured 62 desktop/mobile screenshots and machine-readable DOM, console, network, response, and overflow data in `report.json`. Every direct route returned HTTP 200. Across those captures there were zero console errors, console warnings, uncaught exceptions, failed requests, HTTP errors, missing primary headings, empty content samples, or horizontal overflows. Representative home, Compose, Workbench, and Blocks screenshots were visually reviewed.

## Supplemental route and interaction checks

- `/blocks`: clicked **Show more resources** in the visible UI. Both viewports changed from 50 to 56 loaded resources; the control disappeared at 56/56. Both runs had zero console errors, uncaught exceptions, failed requests, HTTP errors, or overflow. Evidence: `blocks-show-more.json` and `blocks-all-resources-*.png`.
- `/r/api-key-management`: the detail route and isolated resource preview loaded at both sizes. The detail and preview disclosed sample/preview-only behavior, contained no credential-like values, and had zero console errors, uncaught exceptions, failed requests, HTTP errors, or overflow. The visible Add/Remove interactions also passed with Enter and Space on both viewports. Evidence: `api-key-detail.json`, `api-key-detail-*.png`, plus the UI interaction regression in `quality/evidence/step-45/public-v85-route-sweep/playwright-artifacts/`.
- `/collections`, `/agents`, `/sponsor`, `/privacy`, and `/terms` visibly explain their local-only, Beta, hosting, or review limitations; their empty or unavailable states are truthful rather than presented as connected services.

## Flagship employee-experience journey

The exact brief was entered through `/compose`, with Feel set to `professional but playful`, Visual Ambition `Refined`, and non-trivial Structural Creativity `Radical`. Catalogue status reached `Catalogue ready`. The visible Product Architecture and all three directions loaded without unresolved-resource or renderer diagnostics.

| Direction | Navigation | Composition grammar | Screens | Unique resource slugs | Diagnostics |
|---|---|---|---:|---:|---|
| A — Clean Operations | Sidebar | `classic-sidebar-dashboard` | 7 | 14 | 0 |
| B — Vibrant Velocity | Top navigation | `product-proof-marketing` | 7 | 14 | 0 |
| C — Rail workspace | Rail | `three-pane-intelligence-workspace` | 7 | 15 | 0 |

The approaches differ in navigation, grammar, layout, resource selection, density, and DNA, not only in title or colour. Settled card screenshots and full-size visible previews are in `flagship/`; per-direction DNA, screen names, navigation, grammar, resource slugs, project IDs, and diagnostics are in `flagship/directions-*.json`.

Direction C opened the matching Workbench project through the UI. The desktop and mobile acceptance runs each selected C, edited onboarding and settings, locked the dashboard KPI subtree, recomposed, replaced the activity feed with `notification-centre`, used Surprise Me, restored exact states through Undo/Redo, and exported the manifest. The locked node was `node-screen-overview-metric-cards-3`, resource `dashboard-kpi-grid`; its subtree hash remained `f23205c7366f907557f65f9b433ad6788ed497044d5defe5248a33350741c560`. The desktop standalone React ZIP installed in a clean temporary directory, built, started, and opened in a browser; it contained 35 files and no `@tessellate/*` runtime dependency. There were zero workflow console errors, failed requests, HTTP errors, or unresolved resources.

Machine summaries and exported evidence: [desktop workflow](../../../../quality/evidence/step-45/public-v85-route-sweep/flagship/workflow-desktop.json), [mobile workflow](../../../../quality/evidence/step-45/public-v85-route-sweep/flagship/workflow-mobile.json), [direction screenshots and DNA](../../../../quality/evidence/step-45/public-v85-route-sweep/flagship/), [final manifests](../../../../quality/evidence/step-45/public-v85-route-sweep/flagship/), and [standalone React ZIP](../../../../quality/evidence/step-45/public-v85-route-sweep/flagship/standalone-export-desktop.zip).

## Accessibility

Live v85 Axe checks passed on both viewports:

- 7 core routes, including home, Explore, Compose, Workbench, representative resource detail, showcase, and isolated preview: zero WCAG 2.2 A/AA and target-size violations.
- All 5 Workbench modes at both sizes: zero WCAG 2.2 A/AA and target-size violations.
- Generated employee-experience Workbench at both sizes: zero serious/critical Axe violations, heading-order violations, or target-size violations.
- Resource keyboard Add/Remove interactions, reduced-motion smoke, and site-header keyboard/focus checks passed.

Core-route screenshots and reports are under [desktop Axe evidence](../../../../quality/evidence/step-35/sites-chromium-v85/) and [mobile Axe evidence](../../../../quality/evidence/step-35/sites-mobile-chromium-v85/). The live test artifacts are under [Playwright artifacts](../../../../quality/evidence/step-45/public-v85-route-sweep/playwright-artifacts/).

## Audit correction and remaining scope

The first v85 flagship capture showed the expected lazy resource loader because the acceptance test waited only for the preview container. The Site then rendered the actual direction. The test now waits until both resource and deferred-section loading statuses disappear, checks rendered node presence and unresolved-role diagnostics, and captures full previews only after settlement. The corrected deployed run passed on desktop and mobile. This was an audit-harness defect, not a user-facing rendering failure.

This v85 pass found no new deployed product defects in the listed route shells or flagship flow. The full product-hardening gate is still open: the audit ledger has 513 entries; `AUD-419` remains the one non-closed High because public BYO-provider forwarding needs the optional laptop host/provider endpoint. The laptop-dependent service remains truthfully unavailable when no endpoint is configured; deterministic browsing, composition, editing, and export work without it. D1/R2 are unbound. Verso remains local-only because its source licence is `UNLICENSED`; no Verso source or derivative was published. The other fixed findings awaiting their own deployed checks, the wider manual copy/resource review, the full responsive matrix, and the final release gate remain outstanding.
