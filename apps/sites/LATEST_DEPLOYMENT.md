# Latest main review publication

Upstream application revision: `22f2961d10c76e9f4ff263965c9bd894f8ea3a9c`
(2026-10-13). The deployment branch carries that main tree with the existing
Sites asset/security adapter and regenerated build artefacts.

Verified before publication:

- Frozen dependency installation completed.
- 324 catalogue resources validated; 40 Gold resources retained.
- Production monorepo build passed, producing 676 Astro pages and a Sites Worker.
- All workspace typechecks passed.
- 365 tests across 39 files passed, including independent exported-project build.
- ESLint passed with zero errors and 43 existing warnings in upstream code.
- Licence/provenance and secret/security audits passed.
- 16/16 behavioural release gates and bundle budget checks passed.
- Production Worker browser smoke passed: homepage, sandboxed resource preview,
  catalogue readiness, three directions, Direction C handoff, recomposition,
  Surprise Me, deterministic command fallback, ZIP download, desktop/mobile
  screenshots, and zero page/console errors in that smoke journey.

Compatibility-only source differences: one compiled stylesheet, opaque resource
iframe sandbox, parent/source/origin validation for preview messages, and the
isolated `apps/sites` adapter. No D1/R2, authentication secrets, paid service or
host inference daemon is provisioned. The actual offline inference health
response selects the existing deterministic fallback. Host queue/control
endpoints remain unavailable rather than exposing the development shared secret
or in-memory queue on a public deployment.

This new main revision is not certified by the earlier V7 end-to-end audit.
The current checks are publication smoke tests, not a full product re-audit.
