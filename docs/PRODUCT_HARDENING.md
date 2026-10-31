# Product hardening programme

Owner-directed programme, 2026-10-16. This governs work until release and
supersedes the historical feature-build checklist. No new major features,
export targets, model architectures, catalogue categories, labs, archetypes,
MCP product areas, marketplace systems, hosting architectures or Workbench modes.
Every change must improve reliability, usefulness or coherence of existing work.

Canonical integration candidate: `consolidation/product-hardening`. `main` remains
the protected released branch until a reviewed PR with green CI is merged.
Legacy branches are evidence/reference, never parallel sources of product truth.

## Current release evidence (2026-10-31)

The public review Site is v59 at
`https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/`, built from
canonical commit `9a93b41c080cc214313532807a336b4780ae73e4` (Sites source
mirror `1cb4327f8d28d6ee842ac88a80189c872cfa77d6`). The full public route pass
visited 44 routes at 1440×900 and 390×844; all 88 checks passed with no HTTP,
console, uncaught-exception, request, or overflow failures. The visible
employee-experience flagship flow and independent standalone React export also
passed. A corrected Axe scan found one serious keyboard-accessibility defect in
the generated desktop Workbench (AUD-401). The fix is committed as
`5dfb5b7207dd04b007e551add27aad7e5f918d91`; the full local suite passes, and
the finding remains open until a newly deployed version passes the same scan.
Full evidence is in
`quality/evidence/step-48/deployed-v59-2026-10-31/` and
`audit/RUNTIME_AUDIT.md`.

D1/R2 remain unprovisioned. Step 46 is
owner-waived, not passed; Step 47 is complete; Step 48 remains open until the
protected release path and required deployed verification are complete.
The owner-approved Windows restart on 2026-10-30 recovered all eight running
containers; the local laptop-backend lifecycle verifier passed 8/8. No ticket
was held across the full OS shutdown, so that queue-recovery case remains open.
See `quality/evidence/step-37/os-restart-recovery-2026-10-30.json`.

## Execution order

Do not advance a checkbox merely because code exists. Record evidence and defects.

- [x] 01 Canonicalise repository — reconcile source branches, ADRs, README, PR policy.
- [x] 02 Establish green baseline — all commands below, fresh checkout, green CI. The clean-checkout rerun at `2ba70b6f9a493951f0cb0e9c097204c7903e1248` is recorded in `quality/evidence/step-02-fresh-checkout-2026-10-24.md`; the later exact-head clean GitHub CI rerun at `37654e58e6483a718240aa1b520c669b15cdbdad` is recorded in `quality/evidence/step-02-current-head-2026-10-25.md`.
- [x] 03 Inventory every existing feature in `CURRENT_PRODUCT_INVENTORY.md`.
- [x] 04 Classify Core / Beta / Lab, with visible labels and safe isolation. See `quality/STEP_04_EVIDENCE.md`; the reviewed DNA mutation defect is locally fixed and remains open for deployed verification at the public-RC gate.
- [x] 05 Freeze and test contracts/schemas, versions, migrations and round trips. Evidence: `quality/SCHEMA_CONTRACT_MATRIX.md` and `quality/STEP_05_EVIDENCE.md`; all 87 leaf-contract cases and repository tests pass.
- [x] 06 Certify all 324 resources; Gold requires browser evidence, not metadata. Local resource certification passed the seven-width catalogue matrix, 972-variant smoke, Gold 40 × 3-variant/seven-width matrix, Axe, keyboard, reduced-motion and state checks; see `quality/STEP_06_EVIDENCE.md`. Keep the 70 fixed findings open until public-RC deployed re-audit.
- [x] 07 Certify renderer and Workbench/preview/export semantic parity. All 40 Gold resources and 120 variants pass the local renderer parity matrix. Site v14 closed AUD-072–073 and AUD-075–078; Site v15 found an unsupported baseline Button variant in export, which was fixed and rejected in v15. Site v15 then exposed expected validation logging as a console error; Site v16 confirms the invalid ZIP is rejected with no download, console error, uncaught exception, failed request, or HTTP error. AUD-085 is locally verified in the separate Vite preview runtime. D1/R2 remain unbound. See `quality/STEP_07_EVIDENCE.md`; completion is limited to the renderer/export parity scope and does not close the broader runtime audit.
- [x] 08 Catalogue/search, including manually adjudicated real queries. Site v20 desktop/mobile verification passed the catalogue search and facet interactions, and resource-detail tabs passed the responsive and Axe checks. AUD-099 is closed; AUD-100 has a local H4-to-H2 fix and remains awaiting Step 45 deployed verification. See `quality/STEP_08_EVIDENCE.md` and `audit/evidence/catalog-search-v20/`.
- [x] 09 Product interpretation — 100 adjudicated briefs across all 18 archetypes, interpreted from descriptions only. The benchmark rose from 45/100 to 100/100 cases after fixing primary-signal weighting, secondary-tag noise, blueprint metric fallback, and fiscal keyword overreach. The exact employee-experience brief now validates against its specialized audience, objective, entities, workflows and screens. See `quality/STEP_09_EVIDENCE.md` and `quality/PRODUCT_INTERPRETATION_BENCHMARK_RESULTS.json`. The deployed review Site remains v20; browser verification is still required at the RC gate.
- [x] 10 Screen planning — necessary, domain-correct, navigable mobile-aware screens. The 100-brief no-override planner benchmark, composition/build integration, all 744 unit/integration tests, production build, all 16 release gates, and the complete local Playwright command passed. Evidence: `quality/STEP_10_EVIDENCE.md`. Public review-site verification remains open for step 45.
- [x] 11 Design DNA — observable independent dimensions and interactions. Shared continuous slider mapping now preserves exact 0–100 scores in Compose/Workbench; token tests and the desktop Workbench browser journey verify rendered typography, motion and surface effects. Full tests (787), typecheck, lint, production build and `audit:all` passed; runtime evidence reports no browser errors or failed requests. Remaining catalog metadata/content-tone limits are documented for resource/showcase phases. See `quality/STEP_11_EVIDENCE.md` and `quality/evidence/design-dna/`. Public verification remains at Step 45.
- [x] 12 Directions — meaningful grammar, hierarchy, navigation and resource differences. The exact employee brief was composed through the visible UI at 1440×900; all three previews were inspected and recorded. A failing browser regression exposed Direction C's empty right pane and duplicate activity resource. The shared layout now places the data table and timeline in separate content panes, with C selecting the existing Gold Timeline resource. The latest visible browser run distinguishes A's sidebar shell, B's top-navigation canvas, and C's workspace-dock/rail layout with a two-pane data region; all unresolved-role, console, network, and HTTP error arrays are empty. See `quality/STEP_12_EVIDENCE.md` and `quality/evidence/directions/current/`. Public review verification remains at Step 45.
- [x] 13 Compatibility — fail closed on Core capability, variant, dependency, licence, performance, and mobile constraints. Added red-to-green regressions for composition and replacement candidate selection; 798 unit/integration tests, all 16 local release gates, the production build and budgets, the complete local Playwright/Sites Worker/standalone-preview suite, both hosted validation workflows, and the hosted 16-point audit passed. Evidence: `quality/STEP_13_EVIDENCE.md`. Public review verification remains scheduled for Step 45.
- [x] 14 Composition — manually reviewed quality benchmark, separate from integrity. The 100-brief × 3-direction visible review passed at 1440 × 900, 390 × 844, and 768 × 1024 from source `fbfe17db24a076c152ac7905334437053a23d346`. All three reports capture visible Product Architecture, all 38 Design DNA fields, and zero unresolved resources or browser/network errors. Thirty contact sheets and full-size flagship captures were visually reviewed. Every direction pair differs on navigation, composition grammar, and semantic component roles across all 100 briefs. Evidence: `quality/STEP_14_EVIDENCE.md` and `quality/evidence/step-14/manual-review/current/`.
- [x] 15 Compose UX — controls, loading, invalid input, interruption and mobile. Local production-preview browser checks pass on desktop/mobile with red-to-green regressions for five input, state, and accessibility defects. Evidence: `quality/STEP_15_EVIDENCE.md` and `quality/evidence/step-15/`; deployed review verification remains at Step 45.
- [x] 16 Exact Compose → Workbench manifest handoff, including props and locks. Direction C was selected through the visible preview and compared with the Workbench manifest export at desktop and mobile widths; evidence: `quality/STEP_16_EVIDENCE.md` and `quality/evidence/step-16/after/`.
- [x] 17 Workbench fundamentals — selection, canvas, panels, keyboard, mobile. The visible Direction C journey now selects project/root, section, component and element nodes, exercises all five modes and panels, and verifies desktop/mobile navigation. It exposed and fixed resource-kind flattening and canvas selection on disabled controls; both red-to-green regressions and runtime captures are in `quality/STEP_17_EVIDENCE.md` and `quality/evidence/step-17/`. Public review verification remains at Step 45.
- [x] 18 Intent inheritance — inherited/overridden/locked/reset at available visible Workbench levels. Project-scope DNA now says Project; locks disclose snapshot persistence; reset resumes ancestor inheritance. Desktop/mobile browser evidence and local runtime reports: `quality/STEP_18_EVIDENCE.md` and `quality/evidence/step-18/`. Public review verification remains at Step 45.
- [x] 19 Individual mutations — correct changes, unique IDs, undo and export. Local browser evidence covers screen and node duplication, unique route/ID handling, sibling move, confirmed delete, lock/unlock, Gold resource replacement, accessibility/performance Beta fixes, undo/redo, and manifest export at desktop/mobile sizes. Unspecified mutation verbs and hide remain Lab; untested matrix dimensions remain FAIL. See `quality/STEP_19_EVIDENCE.md`; public review verification remains scheduled for Step 45.
- [x] 20 Structural mutations — Recompose tests divergence 20/50/70/95, preserves exact locked subtrees, and is exercised at 95% through the visible desktop/mobile Workbench with undo/redo. Surprise Me tests 20/60/90 and is exercised at 60% through the visible Workbench. The browser run exposed AUD-156: mobile action feedback was hidden outside Command; a shared polite status now remains visible on the active tab. `Rethink Structure` stays isolated as Lab until its operation contract is defined. Evidence: `quality/STEP_20_EVIDENCE.md`; public review verification remains scheduled for Step 45.
- [x] 21 History — a visible 51-edit desktop/mobile journey verifies the 50-step undo/redo window survives reload, restores exact manifests, and persists named checkpoints. It exposed AUD-157 (history discarded on reload); versioned IndexedDB snapshots, latest-state coalescing, save feedback, and bounded checkpoint restoration now pass the browser regression. Evidence: `quality/STEP_21_EVIDENCE.md`; public review verification remains scheduled for Step 45.
- [x] 22 Persistence — browser store failures, corrupt-record recovery, schema migrations, quotas, separate projects and browser-process restart. The desktop/mobile fault-injection regressions and recovery evidence pass; cross-tab conflict and offline-network dimensions remain explicitly FAIL in `quality/FEATURE_MATRIX.md`. Site confirmation remains pending for Step 45; see `quality/STEP_22_EVIDENCE.md`.
- [x] 23 React export — all 100 adjudicated briefs × three directions were exported as independent ZIPs, extracted, installed outside repository `node_modules`, built, and smoke-tested in Vite preview at desktop/mobile sizes. The regression exposed AUD-165: quoted and markup-like user copy broke built-in semantic-role TSX. JSON-encoded JSX expressions fix it; the red-to-green runtime check and 300-project report pass. Evidence: `quality/STEP_23_EVIDENCE.md`; public review verification remains pending for Step 45.
- [x] 24 Agent handoff — seven project-specific files are generated from the exact Workbench manifest; a fresh evaluator scored the final archive 12/12. Desktop/mobile reports contain no browser/network errors, and a same-project 390px capture matches the desktop manifest ID/hash. The separate mobile browser run is a different generated project; see `quality/STEP_24_EVIDENCE.md`. The handoff remains Beta because resource source is not bundled and dependency allowlist review remains open.
- [x] 25 Secondary exporters — Next.js now has a clean npm install, production build, zero-advisory audit, and 1440px/390px browser/Axe smoke from the employee-experience manifest; token output builds with Style Dictionary 4.4.0 using DTCG font-family arrays. Fixed unsafe PostCSS resolution, quoted nav labels, undersized targets, Vite-only dependencies and unsupported importer claims. Next.js/tokens remain Beta pending broader parity; Expo/React Native and SwiftUI remain clearly labelled Lab scaffolds with synthetic metrics/actions removed. Evidence: `quality/STEP_25_EVIDENCE.md` and `quality/evidence/step-25/`.
- [x] 26 CLI — all 12 commands run from a packed, offline-installed tarball outside repository `node_modules`; source-level black-box regressions cover malformed input, missing resources, offline catalogues, Windows paths with spaces, traversal and generated-code escaping. `compose` now shares the compatibility pipeline and emits populated screens/resource refs. Full tests (941), typecheck, lint (0 errors), build and `audit:all` pass. Public registry release remains out of scope because the package is private pending licensing/release setup. See `quality/STEP_26_EVIDENCE.md`.
- [x] 27 MCP — the official SDK client lists and exercises all 15 stdio tools; the exact employee brief composes all three directions and matches the shared engine for a fixed seed; lock/unlock, DNA, navigation, validation, audits, and Vite source generation complete through the client. Two concurrent SSE clients pass on loopback with CORS allowlisting. Replaced cross-working-directory cache leakage, synthetic empty-catalogue fallback, ignored Compose controls, false audit certification, invalid preset lookup, false-success mutations, unranked/overstated alternatives, and wildcard CORS. The MCP docs route also passes desktop/mobile JSON, keyboard, Axe, console, network, and overflow checks after fixing a serious scrollable-code keyboard failure. Evidence: `quality/STEP_27_EVIDENCE.md`; SSE remains Beta because it has no authentication, and generated source is not asserted to build here.
- [x] 28 Linter — 1,095 real Tessellate application/resource source files scanned; a 20-case adjudicated static benchmark measures 10 TP, 10 TN, zero FP/FN (3 dynamic/CSS cases explicitly excluded). Fixed comment false positives, per-element reduced-motion misses, theme-aware contrast false positives, route-path landmark misses, and misleading certification copy. Removed color rewrites that guessed token roles; spacing autofix refuses zeroing or larger guesses. TSX autofix fixture passes TypeScript. Precision/recall applies only to this small declared panel; linter stays Beta. See `quality/STEP_28_EVIDENCE.md`.
- [x] 29 Ingestion/patching — accepted as Beta with bounded TypeScript-AST route
      analysis and fail-closed source edits. Pinned Vite and Next starters pass
      isolated build/browser checks; the Vite fixture applies two exact class
      edits, validates/applies the Git diff, rebuilds, and retains the counter's
      keyboard behavior. A 3,504-file shadcn tree maps 19 routes and 11 nested
      layouts. The CLI and saved manifest state that layout wrappers, CSS/data
      bindings, and business logic are not reconstructed. The upstream shadcn
      default Turbopack build and local Vercel Analytics requests remain
      degraded fixture behavior; Webpack builds with warnings. Evidence:
      `quality/STEP_29_EVIDENCE.md` and `quality/evidence/step-29/`.
- [x] 30 Registry gate — the CLI and reports now name the actual eight-check static contribution gate; hostile-source, dependency, metadata and malformed-path regressions are covered. This closes the gate implementation task, not catalogue certification: the static audit currently accepts 13/40 Gold resources and 104/324 canonical resources. See `quality/STEP_30_EVIDENCE.md` and `quality/evidence/step-30/`.
- [x] 31 Auth/cloud — removed unsigned test-user impersonation and fallback auth configuration; account routes fail closed, guest Core stays anonymous, session tokens are not returned, GitHub OAuth denial/success and duplicate-email linking are exercised against Miniflare D1, and ownership/session expiry/refresh/revocation/favourites/collections/publication are covered. Cloud saves require `expectedRevision`, return conflicts instead of overwriting newer data, and atomically commit the manifest with its revision. Evidence: `quality/STEP_31_EVIDENCE.md` and `quality/evidence/step-31/`. Live GitHub credentials and deployed D1 remain unverified, so account/cloud capability stays Beta.
- [x] 32 Backend/inference — local Docker outage/recovery, durable queue persistence, host/gateway authorization, schema-valid host completion and model evaluation are recorded in `quality/STEP_32_EVIDENCE.md`. The CPU model remains isolated as Lab after weak semantic and adversarial results; cloud tunnel/D1 operation and the broader fault matrix remain unverified for later gates.
- [x] 33 Ten tools — audited all ten client-side tools at 1440×900 and 390×844. Fixed misleading output/certification claims, incomplete SVG/chart exports, invalid-colour handling, missing reset coverage, inaccessible paired inputs and viewport labels, missing selected-state semantics, text-selection suppression, and clipboard false-success behavior. The browser suite passes 36 tests with 14 intentional mobile skips; route screenshots record zero Axe findings, runtime errors, failed requests, or horizontal overflow at the two audited widths. Tool interactions remain Beta pending full keyboard/screen-reader, reduced-motion, persistence, broader viewport and deployed-runtime certification. Evidence: `quality/STEP_33_EVIDENCE.md` and `quality/evidence/step-33/`.
- [x] 34 Blueprints/showcases — audited both galleries, all 12 blueprint details and all 8 showcases at 1440×900 and 390×844; rendered all 31 showcase screens; composed every blueprint into three directions, opened Direction C in Workbench, changed DNA and validated the export; opened every showcase as a local copy and validated its edited manifest. Fixed hospitality being composed as a newsroom, misleading employee showcase hiring copy, inaccurate/duplicate showcase claims, the Prompt Canvas duplicate navigation, and low-contrast Nocturne helper text on light canvases. Four moderate heading-order findings remain for Step 35; no serious/critical Axe findings, console errors, failed requests, HTTP errors or overflow. These example systems remain Beta and use disclosed sample data. See `quality/STEP_34_EVIDENCE.md` and `quality/evidence/step-34/`.
- [x] 35 Accessibility — Sites Worker browser gate passes WCAG 2.2 A/AA, color contrast, target size, accessible-tree smoke, keyboard skip/focus/dialog behavior, layer keyboard reordering, reduced motion and 720 CSS-pixel reflow equivalent to desktop at 200%. Fixed four showcase heading-order defects, the AI Chat Panel's isolated H4 heading (now H2), missing skip links/main targets across public shells, Workbench's missing main landmark/title, and a later Gold Nocturne badge contrast regression. The 120-variant Gold accessibility matrix now passes with zero Axe findings. Native browser zoom and spoken NVDA/VoiceOver review remain for the real-user accessibility gate; public review verification remains at Step 45. See `quality/STEP_35_EVIDENCE.md` and `quality/evidence/step-35/`.
- [x] 36 Responsive — the Sites Worker Chromium gate covers 14 major surfaces at 360/390/430/768/1024/1280/1440/1536 in desktop and Pixel 7 profiles (224 route/viewport pairs). No overflow or runtime/network failures. Fixed the 360px Home CTA wrap and Workbench save-status clipping. Full resource matrix, Firefox/WebKit and published-site verification remain open. Evidence: `quality/STEP_36_EVIDENCE.md` and `quality/evidence/step-36/`.
- [x] 37 Security — 118 local findings are regression-tested and fixed (2 critical, 21 high, 94 medium, 1 low), covering API/storage validation, ZIP and path handling, laptop inference controls, preview CSP/isolation, and static resource-code admission. On canonical commit 2a201f4d and documentation head 218f7427, frozen install, 22 typechecks, lint, 1,216 unit tests (one skip), all 16 audit:all gates, the 324-resource isolation matrix, the 616-pass/149-skip Playwright and Axe suite, and the 16-point security sandbox audit pass. The owner-authorized 2026-10-24 OS restart test recovered all eight expected containers; health checks and Tessellate API returned healthy/HTTP 200 without the verifier starting Docker. No inference job was held across shutdown. D-041 keeps the optional API and inference host on the laptop; remote Cloudflare namespaces, DNS, tunnel ingress, and OAuth are not applicable, and no D1/R2 bindings were added. Public Sites v30 is deployed at https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/ from canonical source 2a201f4d13dbf5d2339994fd14dc2fe92c3e92ff (Sites mirror 775af0c92354e8fdf33af60b8c0cc31b396c0ab6); the 324-resource catalogue matches the audited source, and deployed preview isolation/CSP/network checks pass. AUD-274 is closed as deployed-verified. A separate medium Sites runtime issue, AUD-342, records the host-injected per-response Cloudflare bootstrap blocked by strict CSP, which causes one homepage console error while the app remains interactive; no unsafe-inline permission was added. This external hosting limitation is documented. The Step 37 security gate is complete; full public release-candidate route and flagship re-audit remains Step 45. See quality/STEP_37_EVIDENCE.md and quality/evidence/step-37/.
- [x] 38 Performance — local route and flagship-workload budgets pass. Fixed AUD-265: Compose no longer imports the full Workbench barrel; its eager bundle fell from 561.55 to 335.99 KiB gzip and cold JS transfer from 588,984 to 349,756 bytes (40.6%). Fixed AUD-266: Explore now defers sandboxed preview iframes until visible; desktop starts six visible previews instead of nine, and real scrolling still renders the next resource. Fixed AUD-281–282: the Explore skeleton passes Axe semantics and its pending search status follows the exact query/filter signature. The 2026-10-24 clean-checkout `pnpm test:e2e` run passed 550 tests with 149 configured skips and zero failures across Astro, Sites Worker, and isolated preview; all 324 resources and 40 Gold resources passed real-browser certification. A new Compose feedback regression passes desktop/mobile at 4× CPU. Chrome DevTools measured the Compose pointer interaction at 32 ms after the visible busy-frame fix, down from 299 ms; four-route cold traces at desktop/mobile recorded LCP 101–587 ms and CLS 0.00. No field INP/CrUX claim is made. The WebKit CSP policy allows only the exact hash for its sampled no-op `body {}` style; no `unsafe-inline` was added. The slow-network Explore workload and 30-screen/1,830-node Workbench pass within recorded budgets. Public v30 verifies the server-rendered startup fallback on a fresh 390×844 mobile load; AUD-338 is closed. The same deployment closes the reduced-motion iframe, Explore preview-state, and public HTML compression findings (AUD-339–341). AUD-343 tracks a medium 4× CPU mobile LCP lab watch (2.559–2.809 s; CrUX unavailable); AUD-342 remains the host-injected strict-CSP error recorded under Step 37. The 2026-10-25 full verification after this fix passed 1,216 unit tests (1 skipped), all 22 typechecks, lint, `audit:all`, and 616 browser tests (149 configured skips) across Astro, Sites Worker, and isolated preview; bundle budgets, licence/provenance, security and dependency audits passed. The Sites Worker rendered all 324 resources, and the Workbench fallback regression passed on desktop and mobile. Playwright Firefox still fails before navigation because Windows reports a missing `mozglue` dependent assembly; no Firefox route evidence exists. Real Safari is unavailable on this host. The recorded Step 38 local workload and v30 deployed trace gates are complete; long-session/history stress remains in the later stress-testing step, and field Web Vitals remain unavailable. See `quality/STEP_38_EVIDENCE.md` and `quality/evidence/step-38/after/`.
- [ ] 39 Language/copy — in progress. The deployed-before review and local red/green browser work corrected misleading claims, illustrative samples, inert controls, inaccurate CLI/MCP setup text, and content that did not match rendered resource behavior (AUD-177, AUD-179–235, AUD-297–304). The 2026-10-25 public v30 follow-up captured 28 intended routes at desktop/mobile (56 HTTP 200 responses, no overflow, uncaught exceptions or route-sweep network failures); each route recorded the known Sites-injected CSP error (AUD-342). The homepage spectrum hydration guard works in v30 and closes AUD-300. The same visual review found a 390px preview-title wrap defect, fixed and regression-tested locally as AUD-345. A deployed CTA Product Preview interaction revealed frame-local Compose navigation and catalogue CORS failure (AUD-344); a host-confirmed navigation bridge now passes six desktop/mobile Sites Worker tests while preserving the sandbox, with public re-verification pending. On 2026-10-26 the full local gates passed: frozen install, catalogue build, 22-package typecheck, lint, 1,220 unit tests (one skipped), `audit:all`, production build, and 628 E2E tests with 149 configured skips across Astro, Sites Worker, and isolated preview. Public review fixes are not closed until a new Site version is deployed and audited.

Public v45 follow-up (2026-10-27): a 32-route desktop/mobile sweep recorded 64 HTTP 200 captures with zero overflow, console errors/warnings, uncaught exceptions, or failed requests (two followed Cloudflare challenge redirects completed normally). Issue-specific browser checks found AUD-362 (Typography Lab tab activation can be lost before hydration) and AUD-363 (Compose exposes schema and inference jargon); both are recorded with screenshots and red regressions in `audit/runtime-audit.json` and `audit/RUNTIME_AUDIT.md`. Both local root-cause fixes passed their strengthened browser regressions on a clean Sites Worker (63 related tests passed with one configured skip; focused desktop/mobile tests passed 4/4). The 1,223-test unit suite passed with one configured skip, all 22 typechecks, targeted lint, and `pnpm audit:all`; Compose Axe reported zero WCAG 2.2 A/AA violations at desktop and mobile. Local after-state screenshots are under `quality/evidence/step-39/public-v45/interaction-readiness/after-local/`. Exact-head CI and deployed verification remain; v45 is still affected. This route sweep is not the full flagship/Axe/export release audit.

Latest Step 39 continuation (2026-10-26): the public v32 route sweep captured
31 paths at 1440×900 and 390×844 (62 HTTP 200 responses, no overflow, uncaught
errors, failed requests, unexpected statuses, or preview timeouts). All are
classified DEGRADED because of the repeated Sites-injected CSP error (AUD-342).
The mobile homepage still clips its third preset (AUD-351). The `/pages`
copy scan found AUD-353, an onboarding recipe that refers to interface
telemetry; its red-to-green composer test passes after correcting the shared
description, and the 733-page Astro production build plus local desktop/mobile
browser smoke passes. Deployed verification remains pending. Public v32 also verifies and
closes AUD-346. The corrected working tree passes `pnpm exec vitest run --maxWorkers=4`
(1,221 passed, one configured skip), `pnpm lint`, root `pnpm typecheck`, `pnpm build`,
and `pnpm audit:all`; the latter checks all 16 behavioral gates, 324 resource isolation
and provenance records, bundle budgets, security, and dependency advisories. E2E and
deployed verification for the copy fix remain pending. See `quality/STEP_39_EVIDENCE.md`,
`quality/STEP_45_EVIDENCE.md`, and `quality/evidence/step-45/public-v32/`.

Current continuation note (2026-10-21): AUD-262 documents the real 360px Inline AI Rewrite overflow (316–317px content in a 292px preview) and the responsive correction (292px for all tones). The standalone exporter’s embedded Gold source was regenerated and has a fidelity regression. The latest complete `pnpm test:e2e` run completed without failures: Astro preview had 263 passed and 99 skipped; Sites Worker had 160 passed and 32 skipped; the isolated preview app had 3 passed. The Sites run rendered all 324 catalogue resources and passed the Gold accessibility, responsive, security-isolation, resource-truthfulness, and network-stress checks on its applicable desktop/mobile projects. The latest Vitest suite passes 1,143 tests in 76 files; full typecheck passes, lint has zero errors and 33 warnings, changed-file ESLint and `git diff --check` pass, and the latest `pnpm audit:all` passes all 16 release-gate checks. The Sites Worker audit also caught and fixed AUD-267, a native onSelect callback collision that had corrupted focused preview text fields; public review verification remains pending for Step 45. Chrome DevTools trace-based Core Web Vitals remain paused at the owner’s request. See `quality/STEP_39_EVIDENCE.md` and AUD-262 in `audit/runtime-audit.json`.
- Current continuation note (2026-10-21): AUD-269 records a mobile homepage filter tap lost while its Astro island was waiting for `client:visible` hydration. The island now uses `client:load`; the Sites Worker regression verifies the first tap, list contents, ARIA state, and final selected colors. Focused desktop/mobile checks pass, and the full local E2E run after the runtime fix passed 433 tests with 134 configured skips. Public verification remains for Step 45.
- Current Step 37 security follow-up (2026-10-21): the 324-resource static security-isolation matrix is now repeatable as `pnpm audit:resource-isolation` and is included in `pnpm audit:all`; the latest matrix passed 324/324 with zero findings. The registry-gate filtered package test command was repaired and passes 70/70. The full Vitest suite, typecheck, lint and local release audit pass; unauthenticated Cloudflare namespace and published-site checks remain open for later release verification.
- Current Step 37 security follow-up (2026-10-21): SEC-37-106 closes a local preview-message replay amplification defect. The parent now validates the preview resource ID and answers `READY` once per iframe load. The failing browser regression received nine initialization replies before the fix; after the fix, replay and variant-reload checks pass in desktop and mobile Chromium, and the focused preview-CSP suite passes 18/18. See `quality/STEP_37_EVIDENCE.md` and `quality/evidence/step-37/preview-ready-replay-regression.json`; deployed review verification remains open.
- Current Step 37 supply-chain follow-up (2026-10-21): `pnpm audit` exposed two distinct moderate `@vitest/mocker` advisories through Vitest 4.1.11. The workspace now resolves Vitest 4.1.12; frozen install, 1,195 unit tests, 22-package typecheck, lint, 16-point `audit:all`, and the 18-case desktop/mobile preview-CSP suite pass, with no known dependency vulnerabilities. See SEC-37-107/108 in `quality/STEP_37_EVIDENCE.md` and `quality/evidence/step-37/vitest-advisories-fixed.json`.
- Current Step 37 registry-gate follow-up (2026-10-21): SEC-37-109 closes programmatic external-navigation paths in resource source. Dynamic/unresolved `location.assign`/`replace`, href writes and reflected navigation now fail closed; fragment-only changes and explicit external anchors remain allowed. The scanner regression was red before the fix; the 72-test registry-gate suite and 17-test CLI black-box suite pass, including a real `tess gate` process returning a rejected JSON report and nonzero status for an unresolved destination. The full 1,198-test suite, all 22 typechecks, changed-file ESLint, 18 desktop/mobile preview-CSP tests, 324 source-isolation scans and `audit:all` pass. The new gate fix remains undeployed pending release-candidate re-audit.
- Current Step 37 registry popup follow-up (2026-10-21): SEC-37-110 closes a source-gate gap for scripted window.open destinations. Direct, computed, aliased, destructured, call/apply, and reflected access now fail closed for remote or unresolved destinations; fragment-only navigation remains allowed. Its regression failed before the fix, the real CLI rejects the resource, and the local preview CSP browser suite confirms no popup or external request at 1440x900 and 390x844. The finding is locally fixed but remains pending deployed release-candidate verification; the full 1,200-test suite, 22-package typecheck, targeted ESLint, 20-case desktop/mobile CSP browser suite, 324-resource source-isolation audit, and `audit:all` pass.
- Current Step 37 preview-isolation follow-up (2026-10-21): SEC-37-111 closes a deployed-runtime class of self-navigation gap: /preview now wraps the trusted React renderer in an opaque child sandbox, and top-level requests to the content route redirect to the wrapper. Only the child response omits same-origin frame-ancestor headers because its sandboxed parent has an opaque origin; response and iframe sandboxing remain enforced. The direct, popup, anchor, protocol, and egress browser probes pass 24/24 across desktop/mobile Chromium, and the Sites Worker suite passes 3/3. See quality/STEP_37_EVIDENCE.md and quality/evidence/step-37/preview-top-level-navigation.json; deployed verification remains pending.
- Current Step 37 registry-gate malformed-input follow-up (2026-10-21): SEC-37-112 fixes a TypeError in the AST isolation scanner when an anchor called setAttribute() without arguments. The regression was verified red before the guard and now returns a controlled security-isolation rejection; focused registry, Worker, and Sites proxy tests pass 80/80. Full unit/typecheck reruns are still in progress. See quality/STEP_37_EVIDENCE.md and quality/evidence/step-37/malformed-anchor-setter.json.
- [x] 40 Visual refinement — local visual review complete; preserve reference identity and product-wide coherence. The built Sites Worker capture covers 33 public routes at 1440×900 and 390×844 (66 captures), with zero route errors, failed requests, browser errors, or horizontal overflow. AUD-306 fixes the mobile homepage composer below the first viewport; AUD-307 patches the vulnerable transitive `body-parser@2.3.0`; AUD-308 fixes the docs index so it lists all 15 canonical guides; AUD-309 discloses the Activity Feed's static sample data. The full aggregate `pnpm test:e2e` rerun passes 509 with 144 configured skips and zero failures; the Activity Feed preview test runs only in the Sites Worker harness, preserving its opaque-origin CORS policy. Public review verification remains a release gate and is not claimed complete here. See `quality/STEP_40_EVIDENCE.md` and `quality/evidence/step-40/`.
- [x] 41 Cross-feature workflows — tested local manifest crossings between visible UI, CLI, MCP, source ingestion and export. See `quality/STEP_41_EVIDENCE.md` and `quality/evidence/step-41/`. This is local evidence only; repeat on the published review Site at Step 45. Code ingestion remains Beta and its test does not claim business-logic reconstruction.
- [x] 42 Fault injection — catalogue, API, storage, auth, malformed data and ZIP failures. The locally built Sites Worker fault matrix passed at desktop and mobile sizes; the full aggregate `pnpm test:e2e` passed Astro, Sites Worker desktop/mobile, and preview-app profiles with zero failures. AUD-314 fixed stale-project recovery offering an unrelated sample manifest; see `quality/STEP_42_EVIDENCE.md` and `quality/evidence/step-42/`. Public review verification remains a Step 45 release gate.
- [x] 43 Stress/scale — the Sites Worker desktop browser matrix passed 3/10/30/50 screens (183/610/1,830/3,050 nodes) with UI navigation, reload and manifest export. The visible Workbench soak passed 240 edits over 60.15 minutes, with 24 durable save checkpoints, 3 reloads, 6 mode cycles, stable 23.1 MB final heap and zero console/runtime/network errors. See `quality/STEP_43_EVIDENCE.md` and `quality/evidence/step-43/`.
- [x] 44 Clean-machine testing — sanitized source snapshot in a container with no repository node_modules, no credential files, isolated dependency caches, and a fresh 570-package frozen install. Catalogue (324 resources / 40 Gold), typecheck, lint, unit tests, audit:all (16/16 gates and 324 isolation checks), production build, and the final three-profile browser run pass. The initial browser pass exposed and repaired one mobile screenshot harness failure; the repeated Astro, Sites Worker, and isolated preview profiles pass 540 tests with 149 configured skips and zero failures. The source snapshot included uncommitted work, so this verifies a clean environment, not a clean Git checkout. The browser matrix also exposed and fixed AUD-315 (mobile CLI docs overflow) and AUD-316 (Workbench title hidden at 430px). A non-failing Workerd broken-pipe line during server shutdown is noted for follow-up. Evidence: quality/STEP_44_EVIDENCE.md and quality/evidence/step-44/.
- [x] 45 Public RC — `release/v1-utility-rc1`, zero open P0/P1, feature freeze. Public Sites v55 passed deployed re-audit on 2026-10-28; no new defects were found. 176 Medium and 8 Low findings remain explicitly pending deployed verification or host resolution. Evidence: `quality/STEP_45_EVIDENCE.md` and `quality/evidence/step-45/public-v55-reaudit-2026-10-28/`.
- [waived] 46 Human usability testing — the owner waived the external participant study on 2026-10-30. Zero sessions were run; this is not a pass and no human evidence is claimed. Browser and technical release gates remain in force. Scope and record: `quality/STEP_46_EVIDENCE.md` and D-064.
- [x] 47 Final coherence audit — canonical schemas, shared composition/compatibility/export paths, capability wording, hosting boundaries and release evidence reconciled. Findings and remaining limits: `quality/STEP_47_EVIDENCE.md`.
- [ ] 48 Release — all final owner acceptance conditions, green protected main, and the public RC evidence remain required. The PR must merge through repository protections; this item is not complete before that happens.

Earlier continuation note (2026-10-26, pre-publication Step 45 audit): at that
checkpoint the public review Site was v30. Sites v33 packages canonical source
`7d30a75b1770c79e5aa906b3e5e20f6801d306d3`, is saved but not deployed, and is
superseded by the AUD-351 mobile homepage fix. The release branch contains
`097862d3785038f50e64523e5e946afa8d71c1b5`; it wraps all five preset briefs at
phone widths. The regression failed before the fix at 390px (691px scroll
content in a 342px row) and passes at 360, 390, 430, 768, 1024 and 1440px in
desktop and mobile browser profiles. The exhaustive Sites Worker resource
matrix passes 324 resources / 972 variants with zero findings on rerun. Its
first combined run had one transient `faq-searchable` preview-load timeout;
that route passed independently and the full resource matrix passed on retry.
The complete local Astro run passed 324 tests / 112 configured skips; the
isolated preview suite passed 3/3. The Sites combined run's transient failure
still requires exact-head CI confirmation. `pnpm audit:all` passes 16/16
behavioral gates, 324/324 isolation, zero security violations, complete
licence/provenance checks, bundle budgets and production build (733 Astro
pages). Vite emits its known raw chunk-size warning while the gzip budgets
pass. AUD-342 remains the single open finding: Sites injects a per-response
inline script blocked by strict CSP. No security relaxation was made. D1/R2
remain unbound. Step 45 stays open until exact-head CI, a new saved version,
owner approval, and deployed re-audit; human usability testing remains Step 46.
Evidence: `quality/STEP_45_EVIDENCE.md` and `audit/evidence/step-45/`.

Latest Step 45 continuation (2026-10-26): the owner approved and Sites
successfully deployed v32 from canonical source
`4eca97890e2d8182bcd72edfe5659997d4317c21` (Sites mirror
`5533d1082b649ec4429bb356cdc91ab3e2f2daf5`) to the existing public review URL.
Exact-head CI and the component sandbox passed (runs 40257364776 and
40257364864); no D1/R2 bindings exist. Public Home and Compose smokes at
1440×900 and 390×844 reached HTTP 200 and Catalogue ready, with one catalogue
fetch per Compose load. The deployed Workbench saved-project restore and
Library failure/retry path close AUD-346. A fresh mobile capture still shows
AUD-351, and each response emits the blocked platform-injected CSP script
error tracked by AUD-342. The saved v35 candidate is not deployed or approved.
This targeted check is not the full route/flagship/axe/export re-audit; Step 45
remains incomplete. Evidence: `quality/STEP_45_EVIDENCE.md` and
`quality/evidence/step-45/public-v32/`.

## Baseline exit gate

Run the exact commands in a fresh checkout. `audit:all` includes bundle checks;
when the checkout has no build output, that command must build its prerequisites.
Do not begin step 03 while this gate is red.

```sh
pnpm install --frozen-lockfile
pnpm build:catalog
pnpm typecheck
pnpm lint
pnpm test
pnpm audit:all
pnpm build
pnpm test:e2e
```

## Evidence and capability policy

Core requires tests, applicable browser/mobile/accessibility/integration coverage,
clear errors, documentation and production error handling. Beta must be visibly
labelled with known limits and safe failure. Lab must be isolated from Core and
never silently mutate production projects. Initial nominations are not certification.
The bespoke model and native exporters must not determine Core reliability.

Create `quality/FEATURE_MATRIX.md` after the baseline, covering every feature and
all owner-specified input/state/persistence/browser/accessibility/network/security
dimensions. Allowed results: PASS, FAIL, DEGRADED, NOT APPLICABLE, LAB ONLY.
Unexecuted applicable checks are FAIL (missing evidence), never presumed PASS.

Steps 05–20 are complete within their stated local scopes and evidence files.
Step 19's visible-browser checks cover screen duplicate/add, node duplicate/sibling
move/confirmed delete, lock/unlock, Gold replacement, exact undo/redo, mobile action
reachability, manifest export, and the accessibility/performance Beta suggestion
apply flow. The audit regressions verify the finding clears and the corrected values
survive schema-valid manifest export. Operations without specified, distinct
semantics are isolated as Lab. Evidence is in `quality/STEP_19_EVIDENCE.md` and
`quality/evidence/step-19/`.

Step 20 covers the 20/50/70/95 Recompose and 20/60/90 Surprise Me divergence
levels, exact locked-subtree hashes, resource resolution, duplicate IDs, and
visible UI undo/redo at desktop and mobile sizes. The mobile check found and
fixed AUD-156, where successful action feedback was mounted only inside the
Command tab. `Rethink Structure` remains Lab-only pending a distinct operation
contract. Evidence is in `quality/STEP_20_EVIDENCE.md` and
`quality/evidence/step-20/`; public review verification remains scheduled for
Step 45.

Step 21 covers the 50-step history window through visible keyboard edits,
project reload, exact undo/redo manifest comparisons, and named checkpoint
restoration at desktop and mobile sizes. It found and locally fixed AUD-157,
where the manifest persisted but the undo/redo stacks were reset on reload, and
AUD-158, where Blend could overwrite its source project's history snapshots.
The browser regression also verifies that rapid edits finish persisting before
the local history state reports Saved and that Blend and source-project histories
remain independent. Evidence is in `quality/STEP_21_EVIDENCE.md` and
`quality/evidence/step-21/`; issue-specific published Site verification remains
scheduled for Step 45.

The feature matrix keeps every untested dimension at FAIL. Public review verification
remains scheduled for Step 45; local evidence does not close a deployed finding or
certify release readiness. The audit suggestions remain Beta: browser contrast,
measured runtime performance gain, and other suggestion rules still need separate
validation.

For P0/P1 keep issue, reproduction, screenshot/log, root cause, failing regression,
fix, passing regression, deployment verification and regression protection.
Local success alone does not close a deployed defect. P0/P1 must be zero at release;
P2/P3 require explicit tracking/rationale. Tests never replace semantic/visual review.

## Flagship acceptance

Use the owner's exact 500-person employee-experience brief, entirely through UI:
homepage → Compose → three real directions → C → Workbench → onboarding/settings
overrides → dashboard KPI lock → radical recompose → replacement → Surprise Me →
undo/redo → responsive → audit → save/reload → manifest → React ZIP → clean install
→ build → real browser. Desktop and mobile, no internal store manipulation.
Also cover developer observability, luxury travel, ecommerce, scientific research
and creator/productivity. Real human usability sessions cannot be fabricated by agents.

Current continuation note (2026-10-21, resource metadata): AUD-263 records the evidence-aware schema and truthful display/scoring policy for all 324 resources; AUD-264 records and fixes four clipped accessibility labels on `/r/success-state` at 390×844. Its Sites Worker red-to-green regression passes across 360, 390, 430, 640, 768, 1024, and 1440px in desktop and mobile Chromium; the complete resource-copy suite passes 22/22, the 98-test schema/catalogue/compatibility/search/CLI suite passes, full typecheck passes across 22 packages, targeted lint passes, and both Astro (717 pages) and Sites Worker builds succeed. Counts and evidence are updated in `audit/runtime-audit.json`, `audit/RUNTIME_AUDIT.md`, and `quality/STEP_39_EVIDENCE.md`. Public deployment verification remains pending; neither issue is closed. Trace-based Core Web Vitals remain paused pending DevTools MCP setup.

Current continuation note (2026-10-22, preview message contract): AUD-275 / SEC-37-113 records a real Sites Worker defect where `PreviewHost` rejected valid same-origin host messages because `MessageEvent.origin` was compared to the renderer's opaque origin. The fix restores prop and variant updates while requiring the direct parent and same-origin sender; child-to-host READY events still require the expected opaque origin. Before/after desktop and mobile captures and the failing test context are in `quality/evidence/step-37/`. Focused Sites Worker preview/state/accessibility checks pass 14/14, the 120-variant Gold Axe matrix passes, and the variant-change regression passes on desktop/mobile. Typecheck, lint, 1,204 unit tests, and `pnpm audit:all` pass. Runtime audit counts are 276 total (0 Critical, 61 High, 205 Medium, 10 Low); local success awaits release-candidate deployed verification. Trace-based Core Web Vitals remain paused pending DevTools MCP setup.

Current continuation note (2026-10-22, aggregate browser verification): `pnpm test:e2e` passes after correcting a stale test helper that queried the trusted `/preview/` wrapper instead of its opaque renderer iframe. The first run produced 14 harness failures (the same seven assertions at desktop and mobile); no product runtime defect was found. The post-fix full run passed 438 tests with 133 explicitly configured skips and zero failures: 262 Astro desktop/mobile, 173 Sites Worker desktop/mobile, and 3 isolated-preview-app tests. The Sites Worker run includes the 324-resource responsive browser matrix, Gold variants, CSP/isolation checks, preview interactions, and constrained-network/large-Workbench workloads. `pnpm typecheck` passes all 22 workspace packages and `pnpm lint` passes. Tracked evidence is in `quality/evidence/step-37/preview-frame-harness-before.md` and `quality/evidence/step-37/e2e-preview-frame-harness.json`. Trace-based Core Web Vitals remain paused at the owner's request pending DevTools MCP setup; deployed review verification and remaining Step 37 security checks are still open.

Current continuation note (2026-10-22, rate-limit bindings): Static checks confirm five uniquely named, well-formed 12-digit namespace IDs in each Worker config (ten distinct IDs total). A fresh `pnpm --filter @tessellate/api exec wrangler whoami` check returned 400 while fetching the auth token and `Not logged in`, so Cloudflare-side existence cannot be verified from this machine yet; no Cloudflare resource was changed. Evidence is in `quality/evidence/step-37/rate-limit-namespace-check.json`. Remote namespace existence is not applicable under owner-approved D-041: no remote Worker/API deployment or namespace provisioning is planned. Retain the failed auth probe as historical evidence; local rate-limit contract tests validate the active architecture.

Current continuation note (2026-10-22, local security gates): `pnpm audit:resource-isolation` scanned all 324 canonical resources with 324 passes, zero failures, and zero skipped symlinks. The filtered registry-gate suite passes 74/74, and the API rate-limit contract suite passes 9/9. These checks inspect source statically and do not execute community resources. The owner-approved D-041 local-only architecture makes remote Cloudflare namespace existence not applicable; deployed CSP/gateway and hostile-preview checks remain open. Results are in `quality/evidence/step-37/registry-gate-latest.json`; Step 37 remains open.

Current continuation note (2026-10-22, laptop backend lifecycle): The real Docker verifier passed 8/8 lifecycle checks. It confirmed features return 503 with the host stopped, queued work recovers after the host resumes, the queue survives an API container restart, host inference recovers after host restart, and the API becomes unreachable when its container stops. A post-run authenticated health check confirmed the API and host containers healthy and `hostOnline: true`. Evidence: `apps/laptop-backend/evidence/docker-runtime.json` and `quality/evidence/step-37/docker-lifecycle-postcheck-2026-10-22.json`. This validates the running laptop Docker setup, not OS boot recovery or public tunnel ingress; Step 37 remains open.



Current continuation note (2026-10-22, registry gate): AUD-276 / SEC-37-114 fixed nested Window and Document proxy fetch aliases; AUD-277 / SEC-37-115 fixed renamed destructured aliases; AUD-278 / SEC-37-116 fixed direct and destructuring assignments from Window proxies into mutable aliases before use; AUD-279 / SEC-37-117 closed network-capability transfer through callback parameters by rejecting resource fetch, WebSocket, XMLHttpRequest, EventSource, and sendBeacon member access. The staged regressions failed before their fixes. The 23-form matrix and complete contribution-gate checks reject these paths, including network references forwarded through callbacks. The latest full unit suite passes 1,208 tests across 77 files, typecheck passes all 22 workspace packages, changed-file lint passes, the 324-resource isolation scan passes, and `pnpm audit:all` passes. AUD-280 / SEC-37-118 additionally closes executable Worklet module loading through direct, reflected, destructured, reassigned and unresolved dynamic calls; desktop/mobile Sites Worker CSP regressions pass. Step 37 remains open for release-candidate deployed security verification; OS restart recovery passed on 2026-10-22, though pre-restart queued-job recovery was not directly sampled. Remote Cloudflare namespace verification and tunnel startup/external ingress are not applicable under owner-approved D-041. Chrome DevTools trace-based performance work remains paused at the owner's request.

Current continuation note (2026-10-22, Wrangler auth recheck and D-041 applicability): Wrangler 4.92.0 returns `400 Bad Request` while fetching the auth token and `Not logged in`; no Cloudflare resources were changed. D-041 keeps the API and inference host on the laptop and explicitly excludes remote Worker/API deployment or Cloudflare namespace provisioning, so remote namespace existence is not an active release gate. The local API rate-limit contract suite passes 9/9 and both binding shapes are validated. Preserve the failed login probe as historical evidence in `quality/evidence/step-37/rate-limit-namespace-auth-check.json`. Step 37 remains open for release-candidate deployed security verification; the 2026-10-22 OS restart recovered all containers and post-boot checks passed.

Current continuation note (2026-10-22, Worklet module source admission): AUD-280 / SEC-37-118 records the registry gate accepting executable Worklet module loads through AudioWorklet and CSS paint Worklet APIs, including a computed method reached through an alias. Red-to-green coverage now rejects direct, reflected, destructured, reassigned, and unresolved dynamic loader calls in both the isolation checker and complete contribution gate; the opaque-preview Sites Worker CSP regression passes at desktop and mobile. The focused file passes 4 tests, the registry-gate package passes 78, the full unit suite passes 1,208 tests across 77 files, `pnpm test:e2e` passes 438 tests with 133 configured skips and zero failures, `pnpm audit:all` passes all 16 behavioral gates, all 22 typechecks and targeted ESLint pass, and source isolation passes 324/324 with no skipped symlinks. Evidence is `quality/evidence/step-37/worklet-module-loading.json` and `quality/evidence/step-37/e2e-aggregate-2026-10-22.json`. Deployment verification is pending. Remote Cloudflare namespace verification is not applicable under D-041; OS restart recovery passed, with the pending-job limitation recorded in `quality/evidence/step-37/os-restart-recovery-2026-10-22.json`. DevTools trace work remains paused at the owner's request.

Current continuation note (2026-10-23, repeat OS restart verification): The owner approved a second laptop reboot. All eight pre-restart containers returned automatically under their existing restart policies, both Tessellate containers were healthy, and the laptop API `/health` returned 200. Evidence: `quality/evidence/step-37/os-restart-recovery-2026-10-23.json`. Queued inference-job recovery across OS reboot was not sampled.

Current continuation note (2026-10-23, Explore startup CLS): A delayed-catalogue browser regression exposed a 4,709 px desktop / 16,713 px mobile content expansion, followed by a transient “0 of 0” state that produced CLS 0.2298 at a 500 px desktop viewport. Fifty inert card placeholders now reserve the initial results area, and an explicit first-search-completed state prevents the misleading empty state before Orama returns. The red regressions now pass on desktop, narrow desktop, and mobile; Chrome DevTools cold traces report CLS 0.00 at 1440×900, 500×844 and 390×844. Detailed evidence is in `quality/STEP_38_EVIDENCE.md` and `quality/evidence/step-38/after/`.

Current continuation note (2026-10-23, browser regressions): the full E2E run exposed AUD-281, a serious Explore skeleton ARIA violation, and AUD-282, a false zero-results message while a replacement query was debounced. Explore now exposes a status role on the skeleton and keys completed search state to the exact query/filter signature; focused desktop/mobile Axe and Sites Worker route tests pass. A 100-run Section Planner repeat also reproduced AUD-283 once: server-rendered presets could receive taps before hydration. All planner controls now stay disabled with a visible loading status until handlers are ready; delayed-script and preset browser tests pass on desktop/mobile. The completed E2E rerun passed 489 tests with 144 project-scoped skips across the Astro, Sites Worker, and isolated preview projects; a subsequent resource metadata regression adds two passing desktop/mobile cases. Chrome DevTools MCP is now configured and local trace evidence is recorded in `quality/evidence/step-38/`; lab traces do not provide field INP or replace a published review audit. Findings and evidence are in `audit/runtime-audit.json`, `audit/RUNTIME_AUDIT.md`, `quality/STEP_38_EVIDENCE.md`, and `quality/STEP_39_EVIDENCE.md`.



Current continuation note (2026-10-23, latest Step 39 verification): Chrome DevTools MCP is configured and local performance traces are recorded under Step 38; no field INP claim is made. The Zod migration and bounded collection fixes pass `pnpm audit:all` (16/16 behavioral gates, 324/324 source-isolation checks, 718 Astro pages and Sites artifact, bundle budgets, 324 provenance/licence records, zero security violations, and no dependency advisories), full typecheck across 22 packages, lint with zero errors and 33 existing warnings, and the 1,212-test unit suite. `pnpm test:e2e` passes 274 application, 224 Sites Worker, and 3 isolated-preview checks (501 total) with 144 configured skips. The worker run renders/certifies 324 resources; the employee flagship flow and the new resource-copy cases pass. The audit contains 305 findings (0 Critical, 63 High, 229 Medium, 13 Low): 27 closed after deployed verification, 203 awaiting issue-specific deployed checks, 73 fixed and verified locally, 2 legacy fixed, and none open locally. AUD-301–304 still need the public review Site updated and checked. AUD-305 is locally verified; the entire Step 39 program remains open until broader public product and deployed verification.

Current continuation note (2026-10-24, Step 40 local route review): The mobile homepage regression failed in both Sites Chromium profiles before the change: its 1,306.78px hero exceeded the 759.6px 90%-viewport target, and the Compose action sat below the fold. It now measures 658.53px (78.0% of the 844px viewport), with Compose ending at y=665.53. The final built-Sites Worker capture covers 33 routes and 66 desktop/mobile screenshots; all returned HTTP 200 with no horizontal overflow, browser console errors or warnings, uncaught exceptions, failed requests, or HTTP errors. The route review is scoped to presentation and does not claim complete route interactions. AUD-308 was discovered because `/docs` rendered only its hard-coded Registry link; the corrected four-level Markdown glob lists all 15 canonical guides plus Registry. AUD-309 now labels static Activity Feed entries as sample activity and removes fabricated operational identifiers. The first aggregate E2E rerun exposed a harness-selection mismatch; the test is now excluded from plain Astro and passes in both Sites Worker browser profiles without changing CORS or sandbox policy. The final aggregate passes 509 tests with 144 configured skips and zero failures. The 1,213-test unit suite, typecheck across 22 packages, lint, frozen install, and `pnpm audit:all` pass. The runtime audit records 309 findings (0 Critical, 64 High, 232 Medium, 13 Low): 27 closed after deployed verification, 203 awaiting deployed verification, 77 locally verified, and 2 legacy fixed. The local visual fixes remain pending review-site verification. See `quality/STEP_40_EVIDENCE.md` and `quality/evidence/step-40/`.

Current continuation note (2026-10-25, deployed CSP allowlist): clean Chrome DevTools inspection of v26 at 1440×900 found localhost API and preview-server origins in the public response CSP (AUD-336). The homepage returned 200; 27 observed requests returned 200 and the clean context had no console messages. Repository runtime search found no public client dependency on those loopback origins; preview components use same-origin `/preview-content/`. The Sites Worker and static fallback CSPs now omit loopback endpoints, preserving configured production API/preview origins. `apps/sites/worker.test.ts` failed before the policy change and passes 4/4 afterward. Fix commit: `a302e1dd7072ecb5605282b3fa1ecdd35d658519`. Evidence is in `quality/evidence/step-37/deployed-v26-csp-allowlist.json`; v26 was subsequently replaced with the owner-approved v28, whose live CSP review now closes AUD-268 and AUD-336. Step 37 remains open for the release-candidate security audit.

Current continuation note (2026-10-25, approved v28 publication and verification): the Sites deployment record confirms public v28 from mirror commit `500dbfc17b13cff99388b5959124b47bf3c1e3cc` succeeded at the existing review URL. A clean 1440×900 Chrome DevTools load returned HTTP 200 with 26/26 successful requests and no console messages. The response CSP has no loopback origins, uses generated hashes for inline scripts and style elements, and exposes only the configured production API and preview origins; AUD-268 and AUD-336 are closed on v28. The flagship exact employee brief was composed through the visible UI; it inferred Employee Experience, planned seven domain-appropriate screens, and showed three navigation/layout grammars. Existing full workflow artifacts are in `audit/evidence/v28/flagship/`. The authorized 2026-10-25 Windows restart recovered both Tessellate containers without manual intervention; API and host checks passed, and `/health` returned 200. `quality/evidence/step-37/laptop-restart-recovery.json` records the result. The full local Playwright rerun passed 612 tests with 149 configured skips; 1,216 unit tests, typecheck, lint, catalogue build, production build, and `audit:all` also passed. AUD-337 remains fixed-awaiting-deployed-verification; the current approval covers v28 only. Trace/laptop and RC limitations remain recorded in the feature evidence.

Current continuation note (2026-10-25, Step 38 live Explore audit): public v28 at 1440×900 showed six blank visible resource preview wells about 1.2 seconds after Explore became available; the same previews rendered after five seconds. The route made 108 successful requests, with no console messages or horizontal overflow. AUD-340 records the before screenshot and the exact reproduction. `ResourceCard` now reports loading via an accessible status until its matching opaque-origin renderer sends `TESSELLATE_PREVIEW_READY`, and reports errors with a detail link after a bounded timeout. The Sites Worker desktop/mobile delayed-load and aborted-load regressions pass 4/4 and capture loading/loaded after screenshots. Chrome DevTools measured cold v28 LCP 187–569 ms and CLS 0 across Home, Explore, Compose and Workbench at 1440×900; the Compose constraints toggle recorded 18 ms lab INP. The 390×844 Workbench trace under 4× CPU and Slow 4G returned no navigation segment and remains inconclusive. AUD-340 remains fixed-awaiting-deployed-verification because the user-approved public Site is still v28. Step 37 security and Step 38 performance remain open for the release-candidate and deployed gates.

Current continuation note (2026-10-25, public v30 Step 38): Chrome DevTools traces cover Home, Explore, Compose and Workbench at desktop 1440×900 and mobile 390×844, plus the exact Compose keyboard-input INP and Direction C handoff. The Workbench mobile 4× CPU Fast 4G lab runs measured 2.559–2.809 s LCP with CLS 0; the 1× CPU run measured 1.296 s. AUD-338–341 are closed after issue-specific deployed checks. AUD-343 remains a medium lab-only watch because field CrUX is unavailable and the trace does not attribute a fixable source hotspot. AUD-342 remains the ChatGPT Sites injected bootstrap blocked by strict CSP; no CSP weakening was made. Evidence: `quality/evidence/step-38/deployed-v30-devtools-audit-2026-10-25.json`, `quality/evidence/step-38/deployed-v30-fade-up-reveal-motion.json`, and the v30 screenshots in `quality/evidence/step-38/`. Step 38 is checked complete for the documented local and deployed performance scope; the hardening programme is not complete.

Current continuation note (2026-10-25, Step 39 deployed v30 follow-up): the public review Site remains v30. AUD-300 is closed after desktop/mobile readiness and post-hydration selection evidence. AUD-344 fixes the deployed opaque-preview Compose handoff locally with a typed user-activated message and an explicit host confirmation; the iframe sandbox and CSP remain unchanged. AUD-345 fixes a three-line 390px visual-spectrum title after a red-to-green browser regression. The audit now contains 345 findings: 0 Critical, 66 High, 262 Medium, 17 Low; 40 deployed-verified closures, 212 awaiting issue-specific deployed checks, 89 locally verified, 2 legacy fixed, and 2 open (AUD-342, AUD-343). This targeted route sweep does not complete the full deployed route or employee flagship acceptance. The full local gates passed on 2026-10-26 (1,220 unit tests with one skipped, 22 typechecks, lint, `audit:all`, production build, and 628 E2E tests with 149 configured skips). Step 39 remains in progress until deployed verification and the rest of its scope are complete.

Current continuation note (2026-10-26, Workbench saved-project startup): a red-to-green Sites Worker regression confirmed that Workbench no longer waits for `/data/catalog.json` to restore a valid saved manifest. Desktop/mobile browser tests report 0 initial catalogue requests, 0 Axe violations and no runtime/network errors; opening Library requests the catalogue on demand. A 503/retry regression preserves the project and then recovers. Three local DevTools runs at 390×844, 4× CPU and Fast 4G measured LCP 2.126–2.176 s with CLS 0. AUD-343 is locally verified; new high-severity AUD-346 awaits deployed verification because the public Site remains v30. The update preserves the existing Astro/React, Gold renderer, and sandbox boundaries; it adds no infrastructure. See `quality/STEP_38_EVIDENCE.md`, `audit/runtime-audit.json`, and `quality/evidence/step-38/after/catalogue-lazy-load/`. The saved v31 candidate is superseded by this change and must not be published as the latest review.

The Workbench startup correction is committed as `ad735b37cdc81966ff1ce5fe6d727e4fd7cba959`. Typecheck, lint, 1,220 unit tests, `audit:all`, and the production build pass. The aggregate local E2E run exposed two stale project-recovery assertions that still expected removed copy; the regression now checks the current read-only recovery contract, and both Sites desktop/mobile cases pass when rerun. The separate preview-app suite passes 3/3. The complete aggregate E2E command has not yet been rerun on this commit; GitHub CI remains the final full-suite check.

Current continuation note (2026-10-26, Step 45 CI remediation): the exact-head PR E2E/Axe job for `d22d5c269c622161dc494420eaef4fee3c030ba8` failed in both Chromium profiles because the wrapped homepage preset row pushed its 390×844 hero to 814.0625px, beyond the 759.6px first-viewport limit. The earlier local pass reused a stale preview from the primary checkout and was not accepted as candidate evidence. The candidate was rebuilt and tested on an isolated preview port. Small-screen-only spacing was reduced without hiding presets; the hero now measures 647.53px, all five preset labels fit, and Compose ends at y=678.53. The focused homepage rhythm/preset regressions pass 4/4 locally and record screenshot/network/error evidence under `audit/evidence/step-45/`. Full exact-head GitHub CI and Component Quality Gate Sandbox passed on code candidate `5c2521bf75b72b86520ebfbfc4816aa50c6490a1` (runs 40300330018 and 40300330012). Sites v34 is saved from Site-source commit `eedfa4e58ba38f497f90960f09167283d0a57f7c`, with no deployment attempt; the public Site remains v30 and the connector supplied no hosted preview image. Owner approval, deployment, and deployed re-audit remain outstanding. The broader 48-step hardening programme is not complete.

Current continuation note (2026-10-28, Step 39): public Sites v52 serves canonical commit `00aee74806dacec62bc4a14986f51e284f083c46` from mirror commit `286fccc39903e6b945e1608ce791d5b6e58ac2a2`. The Footer Minimal copy regression passed in the deployed browser audit at desktop and mobile; its metadata is truthful, the default preview contains only the copyright notice, and both records show zero browser/runtime or network errors. AUD-029 is closed. CI and the component quality gate passed on the canonical fix commit. Step 39 and the broader product-hardening programme remain in progress.

Step 45 local revalidation (2026-10-26): fix `aa4d83ffdd1121c3dd9d80f253e42b7b32b3b9d9` passes frozen install, catalogue generation (324/40 Gold), all 22 typechecks, lint, 1,220 unit tests (one configured skip), and `pnpm audit:all`. The Astro E2E half passes 324 tests/112 configured skips. The first `pnpm test:e2e` shell run stopped at the Sites Worker listener because port 4323 belonged to a separate primary-checkout preview; that process was left untouched. The full Sites Worker desktop/mobile constituents were then run at free port 4333 (179 passed/2 skips desktop; 141 passed/40 profile skips mobile), including the 324-resource/7-width desktop certification, and the Preview app passed 3/3. The exact-head CI and component sandbox passed on `5c2521bf75b72b86520ebfbfc4816aa50c6490a1`. Sites v34 is saved but remains undeployed; public v30 is unchanged.

Current Step 45 continuation (2026-10-26): the release branch at the time of
capture, `7041e87641ee115e35c973a15d5d344ee2fb13db`, passed exact-head GitHub CI
(40308082017) and Component Quality Gate Sandbox (40308082125). The captured
saved candidate is Sites v35, source mirror commit
`23d73d008baf22c82a925770b5e2428abc42c030`, with no deployment attempt; the
public Site remains v30. A fresh local Sites Worker preview at
`http://127.0.0.1:4337/` returned HTTP 200 for Home and Compose at 1440×900 and
390×844. Compose reached `Catalogue ready` and made one catalogue request per
load. All four captures had matching viewport/document widths, with no console
errors or warnings, uncaught errors, failed requests, or HTTP errors. Screenshots
and machine-readable evidence are in
`quality/evidence/step-45/sites-v35-preview/`. This does not count as deployed
verification. AUD-352 and the other waiting findings remain fixed-awaiting
deployed verification for the exact approved review deployment and its
issue-specific re-audit; the 48-step
programme is not complete.

Current Step 45 continuation (2026-10-26; supersedes earlier v30/v35 status
notes): the owner-approved public v32 is the live Site at
https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/ and is built from
canonical source `4eca97890e2d8182bcd72edfe5659997d4317c21`. No D1/R2 bindings
are provisioned. The public v32 route sweep covers 31 routes at 1440×900 and
390×844 (62 captures). Every route returned HTTP 200 without overflow,
uncaught exceptions, failed requests, unexpected HTTP statuses, or preview
timeouts. All remain classified DEGRADED because the Sites host injects an
inline script that strict CSP blocks (AUD-342); no CSP relaxation was made.
The browser's `securitypolicyviolation` event confirms `blockedURI: inline`,
`effectiveDirective: script-src-elem`, and `disposition: enforce` on each
representative route; no blocked network request was created.

The visible v32 employee flagship journey completed at desktop and mobile:
all three directions; exact C handoff; DNA overrides and reload; locked KPI
preservation through recomposition and Surprise Me; Gold resource replacement;
exact undo/redo; manifest export; and standalone 33-file React ZIP clean
install/build/browser checks. No unresolved roles or resource placeholders,
uncaught application errors, failed requests, or HTTP errors were observed.
Each Playwright run records three blocked host-injected CSP console errors,
so the final zero-console gate fails. Live Axe scans cover Home, Explore,
Compose, resource detail, and the generated Direction C Workbench at both
viewports with zero automated violations; Axe incomplete/manual checks remain
and no blanket WCAG conformance claim is made. Actual full previews confirm
three distinct desktop structures: sidebar, top navigation, and rail with a
two-column workspace. See `quality/STEP_45_EVIDENCE.md` and
`quality/evidence/step-45/public-v32/`.

The v32 findings above are historical. The latest complete Step 45 audit
checkpoint follows.

Latest complete Step 45 audit checkpoint (2026-10-26, Sites v37): version
`appgprj_6acc036de8cc8191a823339566972d85~appgver_918118e36d4c819196088b063bfab113`
was the live deployment at the review URL when this checkpoint was recorded,
from Sites mirror commit
`c2cd798a3b253a80395febea1f61ab2dd71ca347`, serving app code captured from
canonical `e08c34021bcf13fbe603f86803cb4d7f7eb443b8`. The 31-route desktop and
mobile smoke (62 captures), exact flagship workflow, responsive homepage,
preview-to-Compose handoff, Workbench replacement dialog, Axe and hydration
checks all completed with zero app console errors or failed essential network
requests. Issue-specific v37 verification closes AUD-337, AUD-342–345, and
AUD-347–355. The homepage hero fits its 90svh mobile budget, all five presets
are visible, the response nonce rotates without `unsafe-inline` in
`script-src`, and no loopback origins appear in CSP. No D1/R2 bindings were
provisioned.

Chrome DevTools measured Home desktop LCP 270ms / TTFB 58ms / CLS 0. Four
Workbench mobile cold traces at 4× CPU / Fast 4G measured LCP between 1.739s
and 2.994s with CLS 0; three were under 2.5s, while the outlier had 1.184s
document TTFB. Lighthouse's only failed audit was external Sites/Cloudflare
challenge-script API deprecations (AUD-356). CrUX data is unavailable.
`quality/STEP_45_EVIDENCE.md`, `audit/RUNTIME_AUDIT.md`, and
`quality/evidence/step-45/public-v37/` contain the evidence.

This section records the tested v37 checkpoint; its version ID is not a claim
about which version is currently published.

Step 45 remains incomplete: 212 findings have local fixes but await their own
deployed checks (25 High, 180 Medium, 7 Low). The broader product-hardening
programme is not complete, and no release-complete claim is made.

## Public v40 finding and v41 verification — captured 2026-10-27

At this checkpoint, public Sites v40 was deployed as
`appgdep_6adfea17856c8191aa78ea3a95aca322` from Sites mirror
`f55a938f356f97c9a0070ab8e8aec097e2c52ba0`, serving application code captured
from canonical source `36b873ba9d40380196a78fcabe8977d7aa881e58`. This is a
historical checkpoint, not a claim about the live version after this evidence
was captured. The targeted documentation route returned HTTP 200 at 1440×900
and 390×844, with matching document and article widths, no overflowing prose,
zero console errors, zero failed requests, and zero HTTP errors. Screenshots
and machine-readable results are in
`quality/evidence/step-45/public-v40/`.

The shipped v40 document still described v39 as the current Site. The v41 page
removed that claim and was checked at both viewports, but the check exposed a
second stale sentence saying the issue remained open. This record documents
those two historical observations; the source now describes the v40 finding
and v41 verification without making a present-tense claim about the live Site.
The v41 deployment is `appgdep_6adff6025484819181d26804d7e5efdb`, from Sites
mirror `be04a342e179c5a58c1eaf106665fafe4a73dc9e`, with application code
captured from canonical source `80cd1231fae9a2fd36f5737ce1d0684e01c15251`.
At 1440×900, document/article widths were 1440/1440 and 896/896; at 390×844,
they were 390/390 and 358/358. Both checks returned HTTP 200, with zero text
overflow, console errors, failed requests, and HTTP errors. The homepage
performance trace is still the v39 baseline documented in
`quality/evidence/step-45/public-v39/homepage-performance.json`; v40 changed
documentation only and did not recertify performance.

This is not a full Step 45 re-audit: v37 remains the latest broad route,
flagship, Axe, and export checkpoint. The 210 locally fixed findings still
await issue-specific deployed checks (25 High, 178 Medium, 7 Low). Step 45 and
the product-hardening release gate remain open.

### 2026-10-27 continuation — public Sites v46 deployed verification

At capture time, Sites v46 was the public version at the existing review URL.
It served canonical commit
`351b6d7ac3467fe4c580d1c31533705c16c60490` from Sites source mirror
`520717ada321da3f23d46b000adc8da7d416c52e` (version
`appgprj_6acc036de8cc8191a823339566972d85~appgver_1941800398408191ad81be036cf3223c`,
deployment `appgdep_6ae0a80f9f308191bbae1562fc006161`). The exact-head push CI
run passed before this documentation update. The Sites build produced 324
catalogue resources, 40 Gold runtime resources, 733 Astro pages, and 731 CSP
records; D1 and R2 were not provisioned.

The live route capture classifies 32 unique routes at 1440×900 and 390×844:
64/64 PASS, with zero route HTTP failures, overflow, console warnings/errors,
uncaught exceptions, and failed requests. Two Cloudflare challenge-script 302
responses completed normally. The sweep records route content and screenshots,
but it does not individually operate every secondary route control. The live
Sections resource previews and all visible Explore previews were inspected
after their load states completed.

The exact 500-person employee-experience brief passed the visible Compose →
three populated directions → Direction C → Workbench → overrides → lock →
recompose → replacement → Surprise Me → Undo/Redo → preview → manifest and
standalone React ZIP flow at desktop and mobile. Project identity and Direction
C screens matched at handoff; no unresolved resource placeholders, console
errors, failed essential requests, or horizontal overflow were recorded. The
independent ZIP was extracted outside the repository, installed and built in a
clean temporary directory, then exercised in a browser at 1440×900 and
390×844. Full Axe WCAG 2.2 A/AA scans of the generated Workbench reported zero
violations at both sizes. Focused live Compose/Typography checks passed 4/4.
AUD-362 and AUD-363 are closed after these issue-specific v46 checks. Evidence
and 64 route screenshots are under `quality/evidence/step-39/public-v46/`.

Chrome DevTools measured a cold desktop Compose navigation at LCP 286 ms, CLS
0.00, and TTFB 55 ms. Its 642 ms maximum critical request path ends at the
catalogue response; the render-blocking stylesheet had zero estimated FCP/LCP
savings. These are single-run lab values; no field CrUX or INP data is
available. The broad product-hardening release gate remains open.

### 2026-10-27 continuation — public Sites v49 targeted re-audit

The current public review Site served v49 from canonical source
`be97d567bc32fac74abc4bc70921f5edb3739abf` (Sites mirror
`910328f4b5bf900fe82a4715458a81ce23ebb17f`; version
`appgprj_6acc036de8cc8191a823339566972d85~appgver_67a160bc9a108191968ea95b417f5a15`). The 39-check deployed re-audit passed and closed 25 issue-specific High findings. It also composed three UI directions for five benchmark briefs; each set had three distinct Design DNA values and screen-graph fingerprints. Evidence, screenshots, root-cause records, and the CSP instrumentation limitation are in `quality/evidence/step-45/public-v49/high-findings-reaudit/` and `audit/RUNTIME_AUDIT.md`.

Product-flow diagnostics were zero. The success-state preview had no serious/critical Axe violations at either viewport. Strict preview CSP blocked Axe's injected inline style and stylesheet probe in that isolated frame; the block was reported as harness instrumentation and no security policy was weakened. The flagship Workbench passed full WCAG 2.2 A/AA Axe checks at desktop and mobile with zero violations. No app source changed and no deployment was needed. The exact canonical employee-experience flagship flow passed at desktop and mobile, including an independent React ZIP build and browser run. At the time of this targeted checkpoint, the broad route sweep and Core Axe matrix remained on v46; the v49 continuation below records later verification.

### 2026-10-27 continuation — public v49 routes, accessibility, and local regression

The public v49 Site passed a 31-route smoke at desktop (1440×900) and mobile (390×844), 62/62 route captures, with zero HTTP failures, overflow, console errors/warnings, uncaught exceptions, failed requests, or timeouts. Axe scanned Home, Explore, Compose, and `/r/button/` at both viewports: 8/8 scans had zero violations, though 10 results were incomplete and require manual judgment. The Workbench generated from Direction C separately passed full Axe WCAG 2.2 A/AA at both sizes with zero violations. Axe temporary inline-style injection triggered CSP messages; these are documented as harness instrumentation, not product runtime errors, and no security policy was weakened.

That deployed Axe pass exposed AUD-370: homepage preset briefs and the manifest excerpt had accessible labels on generic elements that did not support naming. The fix adds named group semantics and a visible-label association. The pre-fix deployed-browser regression failed four accessible-role/name assertions; after the change, the Astro build and semantic-accessibility/home-agent regressions passed 10/10 locally. AUD-370 is fixed locally and awaits verification on the next public version.

Current audit ledger: 371 findings (0 Critical, 69 High, 281 Medium, 21 Low). 90 findings have issue-specific deployed verification plus 2 legacy closed records; 187 Medium/Low findings await deployed verification; 89 are locally verified; 2 retain legacy fixed status; and 1 is a documented Sites-host limitation. Of 69 High findings, 39 are deployed-verified and 30 are locally verified. See `audit/runtime-audit.json`, `audit/RUNTIME_AUDIT.md`, and `quality/STEP_45_EVIDENCE.md`. Step 45 and the product-hardening programme remain incomplete.

The local release-quality run for the next review candidate passed frozen
dependency install, catalogue generation (324 resources; 40 Gold), 22
typechecks, lint, 1,223 unit tests (one configured skip), and `pnpm audit:all`.
The build generated 733 Astro pages and 731 CSP records; security, provenance,
bundle budgets, and dependency audit passed. Playwright passed 345 root cases
(121 configured skips), Sites desktop 183/6 and mobile 149/40 on an isolated
port after another worktree occupied 4323, and the standalone export preview
3/3. The AUD-370/AUD-371 semantic regression passed 10/10. AUD-370 fix commit is
`38ad1f7891bdf1738875762035e961457266c970`; it remains open until the next
public review deployment passes the issue-specific browser checks. AUD-371 fix
commit `4833edc7a4c06b486574b16d10f4397ce79beb7a` also has a live v49 failing
reproduction and local after-fix pass; it remains open pending deployed
verification. This is not completion of the full hardening plan or release gate.

### 2026-10-27 continuation — public v50 re-audit

The current public review Site is v50, built from canonical commit
`d4b0fd88a722225c221d8264b89af70525cb1d7d` (Sites mirror
`11d7a1439caaf641a2d2f78eb2555c00cf30cc34`). Exact-head GitHub CI
[40585283183](https://github.com/danishgm-sketch/Tessellate/actions/runs/40585283183)
passed before deployment. The 31-route desktop/mobile matrix passed 62/62;
Core Axe passed 8/8 with zero violations and seven incomplete manual checks;
the semantic accessibility regressions passed 10/10. The full flagship
workflow passed at desktop and mobile, including clean independent React ZIP
installation/build/browser checks. Three UI-inspected directions were
structurally distinct, and all six previews settled without unresolved
resources or product runtime/network errors. D1 and R2 remain unbound.

The live run closed AUD-370 and AUD-371. It also exposed AUD-372: an old test
captured a visible Direction 01 card before lazy previews finished rendering.
The regression now waits for real content and no loading labels before
capturing; v50 settled-preview rechecks passed on desktop and mobile. The audit
now contains 372 findings (0 Critical, 69 High, 281 Medium, 22 Low): 93
deployed-verified closures, 185 local fixes awaiting issue-specific deployed
checks, 89 locally verified, 2 legacy fixed, 2 legacy closed, and 1 documented
Sites-host limitation. The Step 45 and broader product-hardening release gates
remain incomplete. See `quality/STEP_45_EVIDENCE.md` and
`audit/RUNTIME_AUDIT.md` for evidence and limits.
