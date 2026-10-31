# Laptop backend validation — 2026-10-13

This validates the laptop hosting extension. It does not certify the complete
production employee-experience audit or the published Site connection.

- Frozen dependency installation passed.
- Catalogue: 324 resources / 40 Gold, no provenance/licence failures.
- TypeScript passed across the workspace.
- ESLint: zero errors; 34 existing warnings.
- Vitest: 377 tests passed with four workers. An initial parallel run timed out
  on an unchanged tool test; its isolated rerun and full bounded rerun passed.
- Security/secret audit and all 16 behavioural release gates passed.
- Production Astro and Sites adapter build passed; bundle budgets passed.
- Export fidelity tests installed and built an independent project and exercised
  it in Playwright.
- Docker images built with frozen dependencies. Four Python model tests passed.
- Six real Docker checks passed, including trained CPU model completion,
  authorization, durable queue restart, stale heartbeat rejection, task recovery
  and API shutdown. See `evidence/docker-runtime.json`.

Browser checks use the production Site adapter locally against the actual Docker
API, not mocked responses. Desktop 1440×900 and mobile 390×844 cover visible model
completion, host outage messages and recovery. Their results and screenshots are
stored in `evidence/local-site-runtime.json` and `evidence/workbench-*.png`.

Browser testing identified two hosting-related workflow defects: the model could
misclassify an already-supported command such as “reduce motion”, and mobile had
no queue prompt/health interface. Recognized commands now always use the existing
deterministic contract; mobile shares the command bar. Other model prompts remain
dependent on the existing model's intent accuracy, which this deployment task
does not claim to certify.

## OS restart recovery — 2026-10-30

After the owner-authorized Windows restart, Docker Desktop became available about
4 minutes after Windows boot. No Docker Desktop UI launch, `docker start`, or
`docker compose up` was issued. All eight running MGI/Tessellate containers
returned under their existing restart policies; the Tessellate API and host
reported healthy, and `GET http://127.0.0.1:8788/health` returned HTTP 200. The
real backend lifecycle verifier then passed 8/8 checks, including persisted
queue recovery across API-container restart, safe host-offline behavior, host
resume, authorization, and API unavailability when stopped. Evidence:
`quality/evidence/step-37/os-restart-recovery-2026-10-30.json` and
`evidence/docker-runtime.json`.

No inference ticket was held across the full Windows shutdown, so recovery of a
pre-restart queued job across an OS restart remains unverified. Docker startup
was delayed; host-dependent features must remain unavailable until the API and
worker health checks pass.

## Pending live connection

No backend tunnel, DNS record or Site environment credential has been provisioned.
A permanent HTTPS backend hostname or registered Sites private tunnel ID is still
required from the owner. The existing public Site remains on version 8. GitHub
OAuth is not configured. No hosted D1 or R2 is introduced. The latest complete
public product re-audit is recorded in `quality/STEP_45_EVIDENCE.md`; query Sites
metadata for the current public version. Live connection and deployed outage
verification remain pending until the transport is configured.
