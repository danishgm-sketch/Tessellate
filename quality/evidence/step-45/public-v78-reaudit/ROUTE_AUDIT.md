# Public v78 route and content re-audit

Captured: 2026-11-06T06:24:48.127Z
Site: [https://tessellate-v1-review.ismayildanish-gm.chatgpt.site](https://tessellate-v1-review.ismayildanish-gm.chatgpt.site)
Version: 78 — `appgprj_6acc036de8cc8191a823339566972d85~appgver_67206589708c81919ade92023cb90608`
Deployment: `appgdep_6aed6cf7cc288191a4ba98ee07ef81fc`
Canonical source: `3e889d0ca68345c5ccf5ef767c3c05ebc07716ca`
Sites source mirror: `e6387f7ff8e1080a5a4c191cf00faef813719a3d`

## Result

All 31 required routes are classified **PASS** for route rendering, visible content, responsive shell, and screenshot smoke at 1440×900 and 390×844 (62/62 captures). Every page returned HTTP 200. No route readiness or catalogue preview timeout, horizontal overflow, uncaught exception, failed request, or HTTP error was recorded. Screenshots and contact sheets are retained below.

The route smoke does not claim every button on every secondary page was exercised. The flagship editing flow and high-risk resource controls were tested separately; this report records what the browser opened and showed.

## Route matrix

| Route | Classification | Desktop / mobile HTTP | Desktop evidence | Mobile evidence |
| --- | --- | --- | --- | --- |
| `/` | PASS | 200 / 200 | [capture](routes/home-desktop-1440x900.png) | [capture](routes/home-mobile-390x844.png) |
| `/explore` | PASS | 200 / 200 | [capture](routes/explore-desktop-1440x900.png) | [capture](routes/explore-mobile-390x844.png) |
| `/components` | PASS | 200 / 200 | [capture](routes/components-desktop-1440x900.png) | [capture](routes/components-mobile-390x844.png) |
| `/sections` | PASS | 200 / 200 | [capture](routes/sections-desktop-1440x900.png) | [capture](routes/sections-mobile-390x844.png) |
| `/blocks` | PASS | 200 / 200 | [capture](routes/blocks-desktop-1440x900.png) | [capture](routes/blocks-mobile-390x844.png) |
| `/pages` | PASS | 200 / 200 | [capture](routes/pages-desktop-1440x900.png) | [capture](routes/pages-mobile-390x844.png) |
| `/effects` | PASS | 200 / 200 | [capture](routes/effects-desktop-1440x900.png) | [capture](routes/effects-mobile-390x844.png) |
| `/motion` | PASS | 200 / 200 | [capture](routes/motion-desktop-1440x900.png) | [capture](routes/motion-mobile-390x844.png) |
| `/backgrounds` | PASS | 200 / 200 | [capture](routes/backgrounds-desktop-1440x900.png) | [capture](routes/backgrounds-mobile-390x844.png) |
| `/ai` | PASS | 200 / 200 | [capture](routes/ai-desktop-1440x900.png) | [capture](routes/ai-mobile-390x844.png) |
| `/data` | PASS | 200 / 200 | [capture](routes/data-desktop-1440x900.png) | [capture](routes/data-mobile-390x844.png) |
| `/compose` | PASS | 200 / 200 | [capture](routes/compose-desktop-1440x900.png) | [capture](routes/compose-mobile-390x844.png) |
| `/workbench` | PASS | 200 / 200 | [capture](routes/workbench-desktop-1440x900.png) | [capture](routes/workbench-mobile-390x844.png) |
| `/blueprints` | PASS | 200 / 200 | [capture](routes/blueprints-desktop-1440x900.png) | [capture](routes/blueprints-mobile-390x844.png) |
| `/blueprints/b2b-saas/` | PASS | 200 / 200 | [capture](routes/blueprint-detail-desktop-1440x900.png) | [capture](routes/blueprint-detail-mobile-390x844.png) |
| `/collections` | PASS | 200 / 200 | [capture](routes/collections-desktop-1440x900.png) | [capture](routes/collections-mobile-390x844.png) |
| `/creators` | PASS | 200 / 200 | [capture](routes/creators-desktop-1440x900.png) | [capture](routes/creators-mobile-390x844.png) |
| `/showcase` | PASS | 200 / 200 | [capture](routes/showcase-desktop-1440x900.png) | [capture](routes/showcase-mobile-390x844.png) |
| `/showcase/showcase-playful-hr/` | PASS | 200 / 200 | [capture](routes/showcase-detail-desktop-1440x900.png) | [capture](routes/showcase-detail-mobile-390x844.png) |
| `/trends` | PASS | 200 / 200 | [capture](routes/trends-desktop-1440x900.png) | [capture](routes/trends-mobile-390x844.png) |
| `/tools` | PASS | 200 / 200 | [capture](routes/tools-desktop-1440x900.png) | [capture](routes/tools-mobile-390x844.png) |
| `/tools/dna` | PASS | 200 / 200 | [capture](routes/tool-detail-desktop-1440x900.png) | [capture](routes/tool-detail-mobile-390x844.png) |
| `/agents` | PASS | 200 / 200 | [capture](routes/agents-desktop-1440x900.png) | [capture](routes/agents-mobile-390x844.png) |
| `/docs` | PASS | 200 / 200 | [capture](routes/docs-desktop-1440x900.png) | [capture](routes/docs-mobile-390x844.png) |
| `/docs/manifest` | PASS | 200 / 200 | [capture](routes/docs-detail-desktop-1440x900.png) | [capture](routes/docs-detail-mobile-390x844.png) |
| `/sponsor` | PASS | 200 / 200 | [capture](routes/sponsor-desktop-1440x900.png) | [capture](routes/sponsor-mobile-390x844.png) |
| `/about` | PASS | 200 / 200 | [capture](routes/about-desktop-1440x900.png) | [capture](routes/about-mobile-390x844.png) |
| `/license` | PASS | 200 / 200 | [capture](routes/license-desktop-1440x900.png) | [capture](routes/license-mobile-390x844.png) |
| `/privacy` | PASS | 200 / 200 | [capture](routes/privacy-desktop-1440x900.png) | [capture](routes/privacy-mobile-390x844.png) |
| `/terms` | PASS | 200 / 200 | [capture](routes/terms-desktop-1440x900.png) | [capture](routes/terms-mobile-390x844.png) |
| `/r/button` | PASS | 200 / 200 | [capture](routes/resource-detail-desktop-1440x900.png) | [capture](routes/resource-detail-mobile-390x844.png) |

## Screenshot review

The full 31-route desktop and 31-route mobile screenshot sheets were visually inspected. No blank route, broken shell, clipped heading, or obvious responsive overflow was found. Individual captures are in [routes/](routes/); contact sheets: [desktop](contact/desktop-contact-sheet.png) and [mobile](contact/mobile-contact-sheet.png).

## Resource copy and variant sweep

The deployed catalogue loaded 324 unique resources. The browser visited 648 resource detail pages (324 at each viewport) and rendered 1944 variants (Quiet, Expressive, and Nocturne). Results: 0 route failures, 0 runtime/network failures, 0 empty previews, and 0 variant mismatches.

The conservative copy scanner returned 14 occurrences across 7 resources: card-grid-skeleton, empty-workspace, page-skeleton, plan-feature-matrix, pricing-two-tier, skeleton, table-skeleton. Manual review found these were expected loading skeletons, an explicit empty-state placeholder, or sample pricing/feature labels that tell users to replace example values. The flagged text did not present product activity or published pricing as real. No lorem ipsum, fake customer count, unsupported performance/accessibility guarantee, or unrelated finance residue was detected by the configured corpus checks.

The existing high-risk copy/interaction regressions passed 30/30 on public v78 across both viewports. Combined observed response statuses were 200: 1723, 302: 2; the two 302 responses completed the Cloudflare detection flow. Failed requests and HTTP errors were zero. One window.styleMedia deprecation warning appeared once in the initial mobile run on the interactive globe route; the subsequent 13-route reproduction recorded 0 warnings, and it did not recur in the full 648-page resource sweep, or in the preview capture run. Reproduction telemetry is in [console-warning-recheck.json](console-warning-recheck.json).

## Isolated preview and accessibility

A separate Axe run inspected both the resource detail shell and its actual isolated child frame on /r/button/ and /r/ai-empty-state/ at both viewports: 8 scans, zero violations. It retained the strict sandbox and CSP. The audit served Axe from a same-origin test-only route within the existing /_astro/ script allowlist; no product CSP rule was relaxed. Evidence: [Axe results](axe-resource-results.json), [screenshots](axe/).

A separate Axe run inspected both the resource detail shell and its actual isolated child frame on /r/button/ and /r/ai-empty-state/ at both viewports: 8 scans, zero violations. It retained the strict sandbox and CSP. The audit served Axe from a same-origin test-only route within the existing /_astro/ script allowlist; no product CSP rule was relaxed. Evidence: [Axe results](axe-resource-results.json), [screenshots](axe/).

## Targeted issue closeout

AUD-471–AUD-491 (21 medium findings from the public v75 review) are now closed after the same content and control assertions passed on v78 at both viewports. The ledger points to the v78 screenshots, runtime JSONL, full resource corpus, and Axe report. The 30-test deployed report is [copy-sweep-runtime.jsonl](copy-sweep-runtime.jsonl); detail-page captures are under [copy-after/](copy-after/).
