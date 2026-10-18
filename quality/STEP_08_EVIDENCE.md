# Step 08 — Catalogue and search evidence

Status: Site v16 baseline audit complete; six findings (AUD-088–093) are fixed locally and await a repeated deployed audit. The audit used the public Site v16 at `https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/`, canonical code commit `7b49224898066edc9162d901e0cc945af7b24105`, Sites source commit `37fd259499ac4a634db77e091f0a8cd3ff6f1464`.

## Deployed observations

The audit used the visible Explore controls at 1440 × 900 and 390 × 844. `/data/catalog.json` returned HTTP 200 and contained 324 resources. The mobile filter drawer opened at 390 × 844 without horizontal overflow; that run recorded zero console errors, failed requests, or HTTP errors. The same report and viewport captures are in [`audit/evidence/catalog-search-v16/`](../audit/evidence/catalog-search-v16/).

| Query | Results shown | First result | Manual assessment |
|---|---:|---|---|
| `pricing` | 8 | Pricing Usage Based | Pass; pricing resources lead. |
| `sidebar` | 10 | Collapsible Sidebar | Pass; navigation/sidebar resources lead. |
| `dashboard` | 15 | Dashboard Skeleton | Pass for retrieval; sample-preview content is a separate content-truthfulness concern. |
| `command palette` | 11 | Command Results | Pass; command resources lead. |
| `data table` | 50 | Advanced Data Table | Relevant ranking, but truncated with no way to continue (AUD-091). |
| `empty state` | 28 | Empty Collection State | Pass; multiple empty-state patterns lead. |
| `onboarding` | 8 | Onboarding Role Select | Pass; onboarding patterns lead. |
| `AI answer` | 24 | FAQ Two Column | Degraded; AI Research Answer appears, but not among the first two results. |
| `checkout` | 0 | — | Fail; matching intent fields are not indexed (AUD-089). |
| `payment` | 1 | Radio Group | Fail; Billing Overview is omitted despite its payment-related intent (AUD-089). |
| `settings` | 17 | Profile Settings | Pass; settings resources lead. |
| `navigation` | 30 | Mobile Drawer Navigation | Pass; navigation resources lead. |
| `hero` | 39 | Radial Spotlight | Degraded; a background effect precedes hero patterns. |
| suggested `luxury checkout` | 13 | Conic Light Field | Fail; the visible results are typography/background resources with no checkout result (AUD-089). |

## Reproduced defects

- **AUD-088 — Inert facets.** Searching `dashboard` showed 15 results. Selecting **Density → Dense** left the count at 15, left the URL at `?q=dashboard`, and the selection was gone after reload. See [`density-filter-regression.json`](../audit/evidence/catalog-search-v16/density-filter-regression.json) and its before/after screenshots.
- **AUD-089 — Search relevance and missing intent.** The suggested `luxury checkout` query returned irrelevant resources; `payment` omitted Billing Overview; `checkout` returned no results. See [`normal-use-network-audit.json`](../audit/evidence/catalog-search-v16/normal-use-network-audit.json) and [`luxury-checkout-suggested-query-1440x900.png`](../audit/evidence/catalog-search-v16/luxury-checkout-suggested-query-1440x900.png).
- **AUD-090 — Preview request churn.** Typing `luxury checkout` at 70 ms per character produced 45 aborted iframe-document or JS/CSS requests. The browser had zero console errors and zero HTTP status errors. See [`typed-search-network-audit.json`](../audit/evidence/catalog-search-v16/typed-search-network-audit.json).
- **AUD-091 — Truncated browsing.** The deployed catalogue contains 324 records, but Explore shows 50 initially and the `data table` query displays 50 results. There is no pagination or continuation control and the status does not state the total. See [`catalog-search-audit.json`](../audit/evidence/catalog-search-v16/catalog-search-audit.json) and [`explore-initial-1440x900.png`](../audit/evidence/catalog-search-v16/explore-initial-1440x900.png).

The first rapid-query screenshot harness generated additional cancelled preview loads while scrolling the full page to capture multiple states. Those cancellations are recorded in [`catalog-search-audit.json`](../audit/evidence/catalog-search-v16/catalog-search-audit.json) and are not used to count AUD-090; AUD-090 is based on the separate natural-cadence typing run. No HTTP 4xx/5xx response or console error was observed in the Explore runs. The filter/relevance defects were present in the deployed application, not inferred from source inspection alone.

## Local remediation verification

The fixes are in the shared search index/query and Explore UI. All supported facets are indexed and applied before pagination; combined facets use AND semantics, URL state survives reload/back-forward, the total is counted after all filters, and Show more requests the next page. Explore intersects its curated facet vocabulary with values present in the loaded catalogue, hides absent values, preserves stale URL selections for removal, and labels accessibility metadata as a declared target. Search includes intent content requirements and filters out results that fail meaningful-term coverage. Input changes are debounced so the card list does not churn on every keystroke. The suggested queries were revised to queries with manually adjudicated leading results.

`quality/STEP_08_LOCAL_VERIFICATION.json` records the current local gates. Frozen installation passed, all 629 unit/integration tests passed, all workspace TypeScript checks passed, repository lint passed with zero errors and its existing 51 configured warnings, and `pnpm audit:all` passed all 16 release gates, full production build, bundle, provenance, and security checks. Astro built 717 pages. The focused Explore Playwright suite passed 16/16 across 1440 × 900 and 390 × 844. Its request-churn regression requires zero aborted preview document requests during natural typing. `quality/STEP_08_SEARCH_RESULTS.json` records 19 adjudicated queries over all 324 manifests, including all eight visible suggestions; each suggestion returns a relevant first result. Checkout now finds Funnel Chart, payment includes Billing Overview, and `luxury checkout` returns no unrelated result.

The separate local Astro screenshot harness recorded CORS/hydration failures for resource preview modules because its opaque sandboxed iframe origin conflicts with the localhost-specific `Access-Control-Allow-Origin` response. The local screenshots and report are kept under [`catalog-search-step-08-local/`](../audit/evidence/catalog-search-step-08-local/). This is a local harness/runtime mismatch; it is not treated as a product fix or a passing runtime result. Site v16's deployed baseline had zero Explore console errors, failed requests, and HTTP errors. Repeat all runtime/network checks against the next hosted Site version before closing any of these findings.

## Additional deployed findings

- **AUD-092 — Accessibility target presented as verification.** Site v16 showed “Verified AA” while all 324 records declare `levelTarget: AAA`; the before report and screenshot are `accessibility-label-before.json` and `accessibility-label-before-1440x900.png`. The local UI now distinguishes “AA target or higher” and “AAA target.”
- **AUD-093 — Facet options absent from the catalogue.** Site v16 advertised Motion `None`/`Heavy`, Density `Sparse`, and resource types absent from all 324 records; see `empty-filter-options-before.json` and `empty-motion-facet-options-1440x900.png`. The local rail now intersects its supported vocabulary with indexed values and preserves only stale selections needed to remove URL state.

## Deployed acceptance still required

After the updated branch is saved and deployed to the existing Sites project, repeat the same visible searches, all facet families, combined filters, reload/back-forward, pagination, and natural-paced typing at desktop and mobile widths. Capture screenshots, console, uncaught errors, failed requests, and HTTP statuses. Only then close AUD-088–093 and mark Step 08 complete. Axe and manual keyboard coverage for Explore remain part of the later accessibility step.
