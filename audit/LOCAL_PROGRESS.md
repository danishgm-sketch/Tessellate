# Remediation progress — not deployed acceptance

The first browser regression reproduced lost edits on the original deployed version: after Surprise and a manifest download, reload returned the initial project. A production build with the browser journal fix passes the same UI/download/reload comparison locally.

The header-search regression also passes locally: clicking Search opens an accessible dialog and Escape closes it. The palette now traps and restores focus.

Four additional regression tests originally failed: employee-domain inference, role-appropriate rendered content, valid replacement variants, and project-specific Compare/mode state. They now pass locally after domain and resource-contract changes. Full-suite testing identified three legacy tests that use fabricated resource variants or inspect only direct children; those fixtures will be corrected to test canonical resources and full trees, without removing coverage.

**All audit findings remain OPEN until the fixed Site is deployed and the same browser journey is repeated.** Local results do not imply acceptance. Route completion, responsive rendering, complete editing, independent final export, security headers, accessibility and deployed verification are still in progress.


## Continuation on 2026-10-12

The audit branch remains `codex/e2e-production-audit` in the attached managed
worktree. The owner checkout is untouched. Current source includes domain/role
resolution, real nested-content export, inherited tokens and lock freezing,
responsive container layouts, real replacement/library/Compare/Blend controls,
unique duplicate-node identity, palette persistence, actual navigation topology,
checkpoint journaling, public route restoration and an isolated security Worker.

Latest completed frozen install and full production build passed. Latest completed
unit/integration suite: **370 tests in 39 files passed**, including independent
npm export installation/build and browser execution. The latest completed source
lint has zero errors (legacy test warnings remain). Licence/provenance and secret
checks pass. The release gate's replacement check did not pass an explicit
catalogue after removal of synthetic fallbacks; its call now supplies the validated
catalogue, and the full gate must be rerun. Bundle budgets pass for that build.

Local browser regressions: **5/5 passed** (reload fidelity, keyboard header search,
readable dark inspector, enforced headers with opaque actual-chart preview, and
actual palette colour plus reload). The current ten-tool desktop/mobile Axe scan
has no violations. Three real employee directions have no Axe violations. These
are local observations, not final product acceptance. Complete editing/export and
responsive interaction audit is actively being run by `flagship-browser-audit.mjs`.
A selector case mismatch in its first run was corrected; it was an audit harness
problem and was not recorded as a product finding.

Original deployed route, workflow and additional tool evidence is retained in
`audit/evidence/before`. Newly exposed preview contract/CSS problems are recorded
as local remediation findings. All findings remain OPEN pending native fixed
review deployment and the same deployed browser re-audit. No fixed version has
been saved or deployed; no PR has been opened or branch pushed yet.

## Resumed validation and source commits

Latest full quality suite: frozen install, all workspace typechecks, 372 tests across 39 files, 16 release gates, 324 licence/provenance audits, secret/isolation audit and bundle audits pass. Latest real UI flagship run in `local-iteration-5` completes lock/recompose/replace/Surprise/Undo/Redo/preview/ZIP and seven shell widths with zero errors, failed requests or Axe violations. Its independent ZIP installs/builds and renders desktop/mobile with zero Axe violations after waiting for colour transitions to settle.

The expanded 324-resource browser scan exposed forwarded React export rejection and mobile messaging overflow, recorded as AUD-080 and AUD-081. A failing actual Button preview regression was captured before rebuilding the fix. The original E2E suite contained duplicate-header selectors, outdated showcase text, synthetic incompatible replacements and a root lock preventing recomposition; those checks now target actual UI behavior. All 81 findings remain OPEN until deployment verification.

Source commits are grouped into composition/export, Workbench, public site, and isolated Worker adapter. Prior Sites source history differed only in the original deployment commit: its tree exactly matched `7bbc8f7`. A merge preserving the current canonical tree reconciles that history for safe Sites publication. No existing source was discarded. Deployment and PR are still pending.

## Deployed version 2 and native security correction

Draft PR: https://github.com/danishgm-sketch/Tessellate/pull/3. Version 2 was saved/deployed publicly from `27c59b2e7471c0bee4860999c6ae3029e0ac07d3`. The real flagship journey passes on the deployed Site with zero exceptions/failed requests; all 324 resources pass at desktop/mobile; public route and ten-tool Axe scans pass. Ten tools were actually changed and their copy/export outputs captured. All three full direction dialogs were exercised across all nine employee screens without domain contamination.

The deployed re-audit exposed the native asset bypass of Worker security headers (AUD-083). Prefix/binary HTML packaging now forces public requests through the security Worker and passes failing-before/passing-after proxy tests plus the local flagship. Further real UI findings: misleading palette sample action (AUD-084), Blend URL identity loss on reload (AUD-085), nested and undersized Pages controls (AUD-086/087), and discarded Explore relevance order (AUD-088). Repairs are applied with failing real browser regressions. Native version 3 is not saved or deployed yet. All 88 findings remain OPEN.

Latest full browser suite before the search repair: 37 passed, five viewport/panel-specific skips. Unit/integration suite: 374 passed across 40 files. The CI export harness startup matcher was incompatible with ANSI-coloured output; readiness now uses actual HTTP 200. CI for the new push is pending. Supplemental local checks confirm real Library replacement, unique screen duplication, actual employee Compare/Blend, Blend reload identity, rendered Playfulness radius 21px to 35px, and checkpoint persistence/restoration (only updatedAt changes intentionally). Showcase handoff harness selector was corrected to its specific showcase link.
