# Public Tessellate v81 follow-up

Captured 2026-11-06 against the current review deployment:

- URL: https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/
- Site version: `appgver_cb89890515f4819186a34bcfd9a2629e` (deployment `appgdep_6aedef3867988191b2c28c8aedb93307`)
- Application source: `21438fbdd12f43771bbbaab2bb925c714e709e6e`
- Sites mirror source: `3d2a4673d591591d1529775787d824cdc9981b63`

This is a review re-audit of v81. The v81 checks used the deployed source above. They exposed AUD-511, a transient loading-copy issue; its renderer fix is local to this branch and still needs full gates plus a deployed recheck.

## Public routes

The route harness visited all 31 required routes at 1440×900 and 390×844 (62 screenshots). It waited for the nine catalogue routes, Compose catalogue readiness, the direct Workbench startup, and the representative isolated resource preview before recording final screenshots. All routes returned HTTP 200. Both viewport reports contain zero application console errors/warnings, uncaught exceptions, failed requests, bad responses, horizontal overflow, or Axe violations. Machine-readable classifications are in `route-audit/route-classifications.json`; raw reports and screenshots are beside it.

Explore loaded `/data/catalog.json` with 324 unique resources. The settled result state rendered 50 initial resource cards. Searching `onboarding` returned 15 results. On mobile, the filter dialog opened, Escape closed it, and focus returned to the filter button. The direct Explore audit recorded no application console or network errors.

Six Axe scans per viewport returned zero violations. `color-contrast` was incomplete on complex rendered content, so these runs do not claim a full contrast certification. Axe's injected inline styles were blocked by the deployed CSP; those scanner instrumentation messages are stored separately from application telemetry. The production CSP was not relaxed.

## Flagship journey and directions

The exact employee-experience brief was run through the visible UI at both target viewports. Both flagship journeys passed. The catalogue became ready before Compose was enabled; the generated architecture contained the seven employee-experience screens, with no finance/trading terms. Direction C's selected project ID matched the manifest opened in Workbench.

All three direction previews settled in 319–1,542 ms depending on viewport and direction. Each rendered five real resource nodes with zero unresolved references, role diagnostics, or load failures. Their navigation and grammar differ:

| Direction | Name | Navigation | Composition grammar | Visual mode |
| --- | --- | --- | --- | --- |
| A | Clean Operations | Sidebar | Classic sidebar dashboard | Light |
| B | Vibrant Velocity | Top navigation | Product-proof marketing | Light |
| C | Master-Detail Explorer | Rail | Three-pane intelligence workspace | Dark |

Direction screenshots and the visible DNA/resource-reference details are in `directions-settled/`. The first desktop/mobile captures showed five lazy resource slots with internal resource slugs in their loading messages; they cleared as the modules loaded. AUD-511 covers both shared renderer paths that could expose slugs: React Suspense while a resource module loads, and the offscreen `DeferredResource` status before a section enters view. A regression failed red against the old Suspense copy, then passed after both paths were changed to accessible, neutral loading messages. This fix is local to the audit branch and is not in public v81 yet; deployed verification remains open.

The flagship browser journey verified inheritance overrides, persistence after reload, dashboard KPI locking, 95% recomposition preserving the locked subtree hash, Gold resource replacement, Surprise Me, exact Undo/Redo restoration, responsive views, Preview, manifest export, and a standalone React ZIP. The exported 35-file project installed in a clean temporary directory, built without a Tessellate runtime dependency, started a real server, and was browsed at desktop and mobile widths. The final replacement and lock survived export. Desktop/mobile Workbench manifests, screenshots, and ZIP downloads are in `flagship/`.

## Tools

The current public Site ran the existing real-UI suite for all ten client-side tools at desktop and mobile: 41 passed, 21 project-scoped skips, 0 failures. All ten tool routes rendered at both viewports; the run's 20 route snapshots report zero Axe violations, console errors, uncaught exceptions, failed requests, HTTP errors, or horizontal overflow. The suite also exercised the supported tool interactions; some interaction cases are intentionally scoped to one viewport and appear as skips in the other. Results and screenshots are under `tools/`.

## Local verification for AUD-511

The focused renderer regression passed, and the complete repository quality sequence passed: frozen install; catalogue build (324 resources, 40 Gold); TypeScript; ESLint; 1,344 unit/integration tests (one configured skip); the 16-point `audit:all` release gate; production build (733 Astro pages); bundle, provenance/licence, secret/security/isolation, and dependency audits; then `test:e2e`. The E2E command completed all four configured projects with 854 passed, 191 configured skips, and zero failures: default desktop/mobile 396/136, Sites Chromium 244/11, Sites mobile 211/44, and preview app 3/0. `git diff --check` also passed. The Sites production build remains static and has no D1/R2 bindings. Build output retains the known large-chunk and ineffective-dynamic-import warnings; route bundle budgets pass. Machine-readable run summary: `local-verification.json`.

These are local results only. Public v81 still contains the old copy, so AUD-511 remains open until the fixed branch is saved/deployed and the same visible loading states are verified in the hosted Site.

## Remaining release gates

- AUD-511 is fixed locally and all repository gates pass, but it is not deployed-verified. Public v81 still exposes internal slugs briefly at first paint.
- The broader product-hardening program remains incomplete.
- AUD-419 remains `fixed-local-verified` but not deployed-verified because the public Site is intentionally not connected to the laptop backend/provider endpoint. Do not treat public BYO-provider forwarding as verified.
- 133 findings still await deployed verification; the issue ledger has 511 entries, with 0 Critical and 1 nonclosed High.
- Full manual contrast review, broader route-specific control coverage, earlier incomplete product-hardening items, RC freeze, and release acceptance remain open. Step 46 human usability testing remains owner-waived, not passed.
- No D1 or R2 bindings were provisioned; the Sites review retains its no-new-hosted-infrastructure boundary.
