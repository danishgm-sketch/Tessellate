# Step 32 — Backend and inference evidence

Recorded 2026-10-19 on `consolidation/product-hardening`. This gate covers the
existing laptop-hosted inference path; it does not certify a public tunnel,
Cloudflare D1 deployment, OAuth configuration, or the complete Step 38 fault
matrix. Docker evidence is local to the owner's laptop.

## P1 findings

### P1 — Inference routes accepted requests when the gateway secret was absent

**Evidence:** Before the fix, the API middleware guarded client queue routes only
when `TESSELLATE_GATEWAY_SECRET` was truthy, so a health request reached the
handler without a gateway. The regression test reproduced the prior 200 response
and now asserts 503 for both `/health` and `/queue` when no gateway is configured.
With a configured gateway, a missing or invalid header returns 401. The private
host protocol remains independently protected by `TESSELLATE_HOST_SECRET`.

**Reproduction:** Start the API with D1 and `TESSELLATE_HOST_SECRET` but omit
`TESSELLATE_GATEWAY_SECRET`; request `GET /api/inference/health` and
`POST /api/inference/queue`.

**Root cause:** The top-level gateway middleware intentionally skipped private
host-control routes but allowed the client routes through when the gateway
configuration was missing; the route-level fail-closed check was absent.

**Affected code:** `apps/api/src/index.ts`,
`apps/api/src/routes/inference.ts`.

**Remediation and regression:** Client routes now require a configured gateway
and a valid gateway header. `apps/api/src/__tests__/inference-queue.test.ts`
covers missing and wrong secrets; the Docker smoke confirms unauthenticated host
control is 401. Status: **closed**.

### P1 — Non-actionable prompts could enter a model queue with no abstention

**Evidence:** The local model proposes an action for all 16 adversarial benchmark
prompts, including questions, negated commands, and requests to preserve the
current design. The previous API accepted such prompts. The shared guard now
rejects these before queue insertion, and the deterministic command parser also
abstains. Seventeen shared prompt cases and API queue regressions pass.

**Reproduction:** Submit `Do not lock the header`,
`What does Surprise Me do?`, or `Leave the current design as it is` to the queue.

**Root cause:** Prompt interpretation had no shared test for whether a prompt
expressed an actionable mutation, while the experimental model always returned
a proposal.

**Affected code:** `packages/schemas/src/intent-language.ts`,
`packages/workbench/src/ai/ai-service.ts`,
`packages/workbench/src/ai/queue-client.ts`,
`apps/api/src/routes/inference.ts`.

**Remediation and regression:** A shared guard blocks negations, questions, and
keep-current-state requests in both the local parser and API boundary. Queue
tests confirm rejected prompts create no ticket. Status: **closed**. This guard
does not establish the model's semantic quality; the model remains Lab.

### P1 — Strict command validation rejected host output and left a lease processing

**Evidence:** The first live Docker request returned `400 InvalidRequest` because
the model emitted `confidence` and `divergenceLevel`, which are not fields in the
strict shared `IntentCommand` schema. The ticket remained leased until timeout.
The fixed Docker run records a real completion with `preserveLockedNodes: true`.
The API regression sends the same invalid fields, then verifies the host can
terminally fail that lease and a late completion is rejected.

**Reproduction:** Queue a real host task whose proposal includes the model-only
fields `confidence` or `divergenceLevel`; observe the old completion rejection
and processing lease. In the fixed build, run
`node scripts/verify-laptop-backend.mjs`.

**Root cause:** The Python adapter forwarded the experimental model's private
output shape directly to the strict canonical schema, and there was no host
failure endpoint for a rejected proposal.

**Affected code:** `apps/host-daemon/daemon.py`,
`apps/api/src/routes/inference.ts`, `apps/api/src/index.ts`.

**Remediation and regression:** The adapter projects only canonical command
fields, maps the model's `feel` value to `feelDescriptors`, forces locked-node
preservation, and reports invalid proposals through an authenticated `/fail`
endpoint. The ticket reaches a safe terminal failure instead of idling until
lease expiry. Python adapter tests, API lease tests, and a real Docker completion
pass. Status: **closed**.

### P1 — Host credential transport could follow redirects or use remote HTTP

**Evidence:** Before the fix, Python's default URL opener followed redirects and
attached `X-Host-Secret`; a remote HTTP API URL also had no transport restriction.
The local redirect-capture test now confirms the second origin receives no
request. URL validation rejects remote HTTP, embedded credentials, and path or
query fragments; HTTPS and local Docker/loopback origins remain supported.

**Reproduction:** Point the daemon at a redirecting local test server or set
`TESSELLATE_API_URL` to `http://api.example.test`.

**Root cause:** The daemon attached its host credential before delegating
redirect handling to a general-purpose urllib opener and accepted arbitrary
HTTP origins.

**Affected code:** `apps/host-daemon/daemon.py`.

**Remediation and regression:** Redirects are rejected, remote API origins must
use HTTPS, and request URLs are constrained to API paths. Host-daemon unit tests
exercise redirect capture and URL validation. Status: **closed**.

## P2 findings

### P2 — Client timeout could leave a ticket leased until recovery

**Evidence:** A client-side timeout previously stopped polling without cancelling
the API ticket. The client now sends a token-authenticated cancel request when
polling fails after ticket creation. API tests verify cancellation of queued and
leased tasks, invalid-token denial, and stale completion rejection; a fake-timer
client test verifies cancellation after the 45-second timeout.

**Root cause:** Client timeout handling ended locally but did not transition the
durable queue record.

**Affected code:** `packages/workbench/src/ai/queue-client.ts`,
`apps/api/src/routes/inference.ts`.

**Remediation and regression:** Added `/cancel/:ticketId`; the client invokes it
with the ticket token on failure and preserves terminal status. Status: **closed**.

### P2 — Host retries could create excessive requests during an outage

**Evidence:** A failed heartbeat previously remained immediately due, while
polling retried at a fixed one-second interval. The host now uses bounded
exponential poll backoff up to 30 seconds and advances its heartbeat timer even
when a request fails. Unit tests cover the retry schedule.

**Root cause:** Retry timing was not coupled to failure state and heartbeat due
time advanced only after a successful request.

**Affected code:** `apps/host-daemon/daemon.py`.

**Remediation and regression:** Added bounded retry delay and outage-safe
heartbeat scheduling. Status: **closed**. A long-duration network-loss soak is
still part of the later fault-injection gate.

## Validation

Focused results: 10 inference queue tests, 17 shared prompt tests, 2 deterministic
parser tests, 10 queue-client tests, 5 Sites backend tests, 10 Python host/model
tests, and API TypeScript typecheck passed. The Docker build also ran all 10
host/model tests.

The repository checks also passed: 22 workspace typechecks; lint with 0 errors
and 33 existing warnings; 71 Vitest files / 1,030 tests; and `pnpm audit:all`,
including all 16 release-gate checks, catalog/provenance/security audits, bundle
budgets, the 717-page Astro build, and the Sites Worker build. Playwright passed
205 main-browser tests (67 skipped by current project/spec configuration), 45
Sites Worker tests (27 skipped), and 3 preview-app tests, with zero failures.
The exhaustive Sites browser test rendered all 324 canonical resources at the
certified widths. Vite emitted its large-chunk advisory, while measured route
bundles remained within the configured gzip budgets.

`apps/laptop-backend/evidence/docker-runtime.json` records six successful live
checks: real CPU-model completion, host authentication, queue persistence across
API restart, 503 while the host is paused, recovery after resume, and API
unavailability after stopping its container. Containers were restored and
healthy after the verifier completed.

The benchmark in `quality/evidence/step-32/model-evaluation.json` compared the
prototype with the existing deterministic parser: 62.5% model action accuracy
on 8 validation prompts, 68.75% on 16 held-out prompts, 0/6 named-node choices,
0/24 requested DNA directions, and false-positive proposals on all 16
adversarial prompts. The deterministic parser scored 8/8 validation actions and
abstained on all 16 adversarial prompts. The model is therefore explicitly Lab
and is not a Core fallback.

The API compatibility date is pinned to `2026-05-22`, the latest date accepted
by the repository's Wrangler 4.92 local runtime. No paid service, hosted D1/R2,
public tunnel, credential, or new hosting architecture was added. Broader
network failure, API/host crash recovery, stale/duplicate tickets, and deployed
Site tunnel checks remain open for later hardening gates.
