# Step 08 — Catalogue and search evidence

Status: Site v16 Explore/search findings AUD-088–093 and Site v17 detail/accessibility findings AUD-094–097 have local fixes and await issue-specific verification on the next public Site version. Site v18 revealed AUD-098, a CSP failure blocking compiled styles in opaque previews; the narrowly scoped Worker correction also awaits deployed verification. The baseline and first new-finding audit used `https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/` at 1440 × 900 and 390 × 844. Site v16 source: canonical `7b49224898066edc9162d901e0cc945af7b24105`, Sites `37fd259499ac4a634db77e091f0a8cd3ff6f1464`. Site v17 source: canonical `60aae2107ebd246dc1615b2cd36a8bc30f4e78f2`, Sites `adbe7877dff0cdfb896b81b1af7b8e5fe53927b8`.

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

`quality/STEP_08_LOCAL_VERIFICATION.json` records the current local gates. Frozen installation passed; 630 unit/integration tests passed; all 22 workspace typechecks passed; lint passed with zero errors and 51 existing configured warnings. `pnpm audit:all` passed all 16 scripted criteria, built 717 Astro pages, and passed the bundle, provenance and secret/security audits. The complete Playwright suite passed 133 tests with 56 configured skips, including 28 Sites Worker tests and a CSP regression asserting opaque previews can fetch only compiled assets. The keyboard-dialog test also passed three repeated mobile runs. `quality/STEP_08_SEARCH_RESULTS.json` records 19 adjudicated queries over all 324 manifests, including all eight visible suggestions. Checkout currently finds Funnel Chart for checkout-conversion analysis; the catalogue has no dedicated checkout-form resource. Payment includes Billing Overview, and `luxury checkout` returns no unrelated result. These are local results only; deployed confirmation remains required.

The local Astro screenshot harness forced sandboxed preview requests and recorded localhost-specific CORS/hydration failures. Those captures remain under [`catalog-search-step-08-local/`](../audit/evidence/catalog-search-step-08-local/) and are not treated as product failures or deployed passes. A separate normal deployed Site v17 resource-page load recorded zero console errors, failed requests, or HTTP errors. The next hosted pass uses viewport screenshots without forcing offscreen preview frames and records any cancellations instead of silently discarding them.

## Additional deployed findings

- **AUD-098 — Opaque preview CSP blocked compiled styles.** Site v18 emitted CSP errors for `/_astro/style.*.css` on desktop and mobile, leaving some visible cards in a loading state. The Sites Worker now permits connections only to the same-origin immutable `/_astro/` path, with unit and browser tests confirming APIs, arbitrary paths, external hosts and nested frames remain blocked. See [`audit/evidence/catalog-search-v18/runtime-audit.json`](../audit/evidence/catalog-search-v18/runtime-audit.json). Site v19 verification is pending; this is not yet counted as fixed.

- **AUD-092 — Accessibility target presented as verification.** Site v16 showed “Verified AA” while all 324 records declare `levelTarget: AAA`; the before report and screenshot are `accessibility-label-before.json` and `accessibility-label-before-1440x900.png`. The local UI now distinguishes “AA target or higher” and “AAA target.”
- **AUD-093 — Facet options absent from the catalogue.** Site v16 advertised Motion `None`/`Heavy`, Density `Sparse`, and resource types absent from all 324 records; see `empty-filter-options-before.json` and `empty-motion-facet-options-1440x900.png`. The local rail now intersects its supported vocabulary with indexed values and preserves only stale selections needed to remove URL state.
- **AUD-094 — Mobile filter drawer lacked modal keyboard behavior.** At 390 × 844 on Site v17, focus remained on the obscured trigger; the drawer had no dialog semantics and Escape did not close it. See [`mobile-filter-keyboard-before.json`](../audit/evidence/catalog-search-v17/mobile-filter-keyboard-before.json) and [`mobile-filter-drawer-before-escape-390x844.png`](../audit/evidence/catalog-search-v17/mobile-filter-drawer-before-escape-390x844.png). The drawer now traps/restores focus, locks background scrolling, exposes dialog semantics and closes on Escape/backdrop.
- **AUD-095 — Isolated activity preview started at H4.** The Site v17 preview started with `Agent Swarm Activity` at level four. See [`ai-agent-heading-before.json`](../audit/evidence/catalog-search-v17/ai-agent-heading-before.json) and its screenshot. The static example now starts at H2 and the filter buttons have explicit button semantics.
- **AUD-096 — Detail tabs skipped heading levels.** On Site v17 the H1 was followed by H4 section headings. See [`resource-tabs-heading-before.json`](../audit/evidence/catalog-search-v17/resource-tabs-heading-before.json) and [`resource-tabs-heading-before-1440x900.png`](../audit/evidence/catalog-search-v17/resource-tabs-heading-before-1440x900.png). Detail-tab section headings now use H2 and variant cards use H3.
- **AUD-097 — Example activity was described as live telemetry.** The detail page advertised “Real-time telemetry” while the preview showed invented events. The before image is [`ai-agent-heading-before-1440x900.png`](../audit/evidence/catalog-search-v17/ai-agent-heading-before-1440x900.png). Description, metadata and event copy now identify static sample data and describe Tessellate review examples.

## Deployed acceptance still required

After the updated branch is saved and deployed to the existing Sites project, repeat visible search/relevance checks, every facet family, combined filters, reload/back-forward, pagination, natural-paced typing and the mobile dialog keyboard path at desktop/mobile widths. On the representative resource page, inspect all eight detail tabs, sample-data disclosure/filter interaction, heading hierarchy, Axe, overflow and network/runtime diagnostics. Evidence is written by `audit/audit-deployed-explore.mjs` and `audit/audit-deployed-resource-details.mjs` under the matching version directory. Only then close AUD-088–097 and mark Step 08 complete. Broader keyboard/screen-reader testing remains part of the ordered accessibility step.
