# Tessellate Decision Register

This file records major decisions so autonomous agents do not repeatedly reopen them.

> Current operating authority: D-042 governs the product-hardening programme and expansion freeze; D-043 onward records scoped decisions that refine it. Historical release statements below do not certify current code or deployed infrastructure.

## Locked decisions

### D-001 — Product category

**Decision:** Tessellate is an interface-intelligence/composition platform, not merely a component library and not a general-purpose no-code application backend builder.

**Status:** LOCKED.

### D-002 — Free public resource code

**Decision:** Public resource source code remains free. No Pro component source gate, daily download limit or source subscription.

**Status:** LOCKED.

### D-003 — Core works without AI

**Decision:** Browsing, deterministic composition, Design DNA, Workbench editing, audit and export must work without an LLM.

**Status:** LOCKED.

### D-004 — AI economic model

**Decision:** V1 uses BYO provider credentials for variable-cost AI-assisted operations. Tessellate does not subsidize unlimited public inference.

**Status:** LOCKED.

### D-005 — Primary V1 resource stack

**Decision:** React + TypeScript + Tailwind CSS 4.

**Status:** LOCKED for V1.

### D-006 — Public shell

**Decision:** Astro with React islands rather than a full-site Next.js SPA/SSR architecture.

**Status:** LOCKED.

### D-007 — Workbench

**Decision:** React-based structured composition application.

**Status:** LOCKED.

### D-008 — Runtime API

**Decision:** Hono on Cloudflare Workers.

**Status:** LOCKED.

### D-009 — Shared database

**Decision:** Cloudflare D1 for small authenticated/shared application state.

**Status:** LOCKED for launch architecture.

### D-010 — Object storage

**Decision:** Cloudflare R2 only where object storage is necessary.

**Status:** LOCKED for launch architecture.

### D-011 — Catalogue ownership

**Decision:** Git repository is canonical source for public resource code/manifests. D1 is not the catalogue CMS/source of truth.

**Status:** LOCKED.

### D-012 — Search

**Decision:** Orama browser-side full-text/hybrid search. Optional semantic query embeddings run locally via Transformers.js with capability fallback.

**Status:** LOCKED for V1.

### D-013 — Authentication

**Decision:** Better Auth + GitHub OAuth only in V1. Guest-first core experience.

Account endpoints fail closed unless D1, a strong auth secret, an HTTPS base
URL and GitHub OAuth credentials are configured. V1 disables implicit account
linking; a matching email from a different GitHub identity does not silently
attach that identity to an existing user. No test identity or fallback provider
credential is present in runtime configuration.

**Status:** LOCKED.

### D-014 — Editing model

**Decision:** ProjectManifest + typed semantic mutations. AI does not directly rewrite arbitrary application source as the Workbench state model.

**Status:** LOCKED.

### D-015 — Design architecture

**Decision:** Design DNA is hierarchical: Project → Page → Section → Component → Element override.

**Status:** LOCKED.

### D-016 — Primary creativity controls

**Decision:** Visual Ambition and Structural Creativity are independent controls.

**Status:** LOCKED.

### D-017 — Initial design alternatives

**Decision:** Initial composition generates exactly three directions. User may choose or blend.

**Status:** LOCKED.

### D-018 — Normalisation

**Decision:** Independently sourced resources are normalized through semantic project tokens before composition.

**Status:** LOCKED.

### D-019 — Public shell visual identity

**Decision:** Warm off-white editorial public shell, deep cobalt interaction accent, sparse acid-lime micro-accent. Avoid generic purple AI/glass aesthetic.

**Status:** LOCKED unless owner changes brand identity.

### D-020 — Workbench visual identity

**Decision:** Near-black dense professional tool shell with structural borders, cobalt selection and restrained motion.

**Status:** LOCKED.

### D-021 — Hosting cost

**Decision:** Normal target £0–£8/month. Absolute pre-commercial infrastructure ceiling £20/month.

**Status:** LOCKED.

### D-022 — Launch deployment

**Decision:** Cloudflare static/edge-first. Do not begin with an always-on VPS.

**Status:** LOCKED for initial launch; VPS remains portability escape hatch.

### D-023 — Preview isolation

**Decision:** Untrusted/community resource previews execute on an isolated origin without authenticated main-origin privileges.

**Status:** LOCKED.

### D-024 — Launch catalogue target

**Decision:** 324 canonical resources and 972 curated configurations, plus the supporting inventory defined in Product Spec.

**Status:** LOCKED public-beta target.

### D-025 — Resource count honesty

**Decision:** Variants/configurations are not advertised as unique canonical components.

**Status:** LOCKED.

### D-026 — Comments

**Decision:** No native public comment system in V1.

**Status:** LOCKED for V1.

### D-027 — Payment system

**Decision:** No native payment processing required for V1.

**Status:** LOCKED for V1.

### D-028 — Agent distribution

**Decision:** V1 includes registry, CLI and MCP—not merely a website.

**Status:** LOCKED.

### D-029 — Agent handoff

**Decision:** Export includes `.tess.json` plus product/design/implementation/component documentation and an agent prompt file.

**Status:** LOCKED.

### D-030 — Accessibility

**Decision:** Platform shell/Workbench target WCAG 2.2 AA and reduced-motion support.

**Status:** LOCKED.

### D-031 — Production Deployment Architecture & Monthly Cost Projection

**Date:** 2026-10-11
**Context:** Phase 21 requirement to record production deployment architecture, security isolation, and expected monthly infrastructure costs.
**Decision:** Deploy Tessellate using Cloudflare serverless edge architecture:

- Static public site (`apps/site`) and untrusted preview frame (`apps/preview`) deployed via Cloudflare Pages with separate subdomains and origin isolation.
- API runtime (`apps/api`) deployed as Hono Cloudflare Worker backed by Cloudflare D1 for authenticated user project revisions.
- Zero paid runtime dependencies (no paid hosted search, no paid auth, no paid vector DB).
- BYO provider credentials for AI assistance; guest-first browser composition.
- Expected monthly expenditure:
  - Cloudflare Pages (Site + Previews): £0.00
  - Cloudflare Worker (API): £0.00
  - Cloudflare D1 (Database): £0.00
  - Cloudflare Web Analytics & Turnstile: £0.00
  - Domain amortized: ~£1.00/month
  - **Total Projected Monthly Infrastructure Cost:** ~£1.00/month (well below £0–£8 normal target and strict £20 pre-commercial ceiling).
    **Alternatives rejected:** Hosted Supabase/Firebase, dedicated VPS fleet, Algolia, Clerk.
    **Cost impact:** ~£1.00/month.
    **Security impact:** Hard origin isolation between main shell (`tessellate.design`) and untrusted previews (`preview.tessellate.design`); D1 authenticated ownership verification on all mutations; zero persisted AI secrets.
    **Status:** LOCKED.

### D-032 — Public Beta Release Gate Verification

**Date:** 2026-10-11
**Context:** Phase 22 requirement to formally verify all 16 release gate criteria before declaring public beta launch readiness.
**Decision:** Formally close Phase 22 after 100% verified compliance across all 16 gating criteria:

- 324 canonical resources verified in catalog with 0 schema violations.
- 972 curated configurations verified across Quiet, Expressive, and Nocturne variants.
- 36 full-page compositions verified across all application categories.
- 12 product blueprints verified with multi-screen navigation graphs.
- 30 10-dimensional Design DNA presets verified.
- 8 distinct showcase projects verified occupying non-overlapping DNA coordinates.
- 10 interactive studio tools verified and route-tested.
- Deterministic composition verified via `@tessellate/composer`.
- BYO-AI client routing and secret hygiene verified.
- Workbench state, locking, overrides, and undo/redo stacks verified.
- Local-first Vite + React + Tailwind source tree generation verified without lock-in.
- Cloud D1 migrations, session auth guards, and publication verified.
- Registry /r/ endpoints, @tessellate/cli bin, and stdio MCP server verified.
- Automated axe WCAG 2.2 AA and bundle budget audits verified.
- Infrastructure cost projection verified at ~£1.00/month (< £20 hard ceiling).
- Comprehensive autonomous documentation verified in `AGENTS.md` and repository specs.
  **Cost impact:** £0 additional.
  **Security impact:** Audited 0 hardcoded secrets, verified CSP and origin isolation.
  **Status:** LOCKED.

## Open implementation decisions

Agents may decide these locally if consistent with contracts and cost/security rules:

- exact internal helper/function names;
- specific directory subdivision inside approved packages;
- exact IndexedDB wrapper approach;
- exact deterministic PRNG implementation;
- exact schema version string convention, provided migrations are stable;
- exact implementation of static preview thumbnail generation if it remains free/portable;
- exact GitHub Actions job split;
- exact test fixture organization;
- exact CSS mechanism for tiny background grid/dot canvas.

Record a new decision below when one materially affects architecture/product behaviour.

---

### D-040 — Historical interface expansion and host inference

**Date:** 2026-10-15
**Context:** Transforming Tessellate from a web composition engine into an industry-standard universal interface operating system serving autonomous agent swarms, mobile and design-token ecosystems, enterprise CI/CD linting, and community registries without cloud LLM inference fees.
**Decision:** Implement 6 specialized architecture pillars:

1. `@tessellate/mcp`: Headless interface engine for AI agent swarms over stdio and SSE transport.
2. `@tessellate/exporter`: Universal multi-platform exporter generating Expo React Native, Swift 6 SwiftUI, and W3C Design Tokens Studio artifacts.
3. `@tessellate/linter`: Design DNA linter with automated AST fixes and SARIF output for GitHub Code Scanning.
4. `@tessellate/ingest`: Bidirectional AST ingestion mapping React/Tailwind codebases into canonical ProjectManifests while preserving developer state and business logic via targeted unified diffs.
5. `apps/host-daemon`: Bespoke Tree-GNN + Bi-GRU DL model running strictly on owner hardware with an asynchronous token queue number system (`/api/inference/queue`), live Workbench status badges, and fail-closed deterministic fallback.
6. `@tessellate/registry-gate`: 16-point automated sandbox gate and GitHub Actions PR audit workflow for decentralized community contributions.
   **Alternatives rejected:** Hosted cloud vector databases, paid third-party AI APIs (OpenAI/Anthropic/Gemini) required from end users, dynamic source code eval in product runtime.
   **Cost impact:** £0/month incremental cost (runs on owner/host hardware + Cloudflare Workers free tier).
   **Security impact:** Hard origin isolation enforced; community submissions validated in sandboxed runner; zero credentials or secret tokens persisted.
   **Status:** LOCKED.

### D-033 — Sites save-only review of the canonical static application

**Date:** 2026-10-11
**Context:** Owner requested a Sites staging port of `50a2c7f`, preserving architecture,
with a saved version and explicit approval before any publication. This request
overrides autonomous continuation through unrelated build-order feature work.
**Decision:** Keep Astro and every shared runtime package. Package its static export
through `apps/sites/prepare-static.mjs` into root `dist`; provide the already compiled
CSS at the existing detail-page stylesheet URL. Save an archive-backed Sites version
without deploying. Do not add databases, OAuth credentials, API mocks or paid services.
Record missing `/docs` and `/blueprints` web routes and Button-only detail preview
coverage as base-commit acceptance gaps, even though the existing merge gate passes.
Use `/showcases`, the actual existing route. See `apps/sites/README.md` and validation
results for exact supported scope and post-approval runtime checks.
**Alternatives rejected:** Wholesale rewrite, Vinext substitution, copied composition
logic, fabricated routes/previews, publishing before approval.
**Cost impact:** No added paid dependency, inference, D1/R2, or always-on runtime;
Sites billing must be confirmed separately because tools expose no tariff.
**Security impact:** Existing CSP/header artifact preserved. Existing same-origin
preview sandbox and missing sender-origin checks are disclosed; this review must
not be extended to authenticated/untrusted previews without proper origin isolation.
Actual hosted header enforcement remains unverified until approved publication.
**Status:** PROVISIONAL review deployment only; canonical architecture unchanged.

### D-034 — Runtime audit fixes use canonical data and resource contracts

**Date:** 2026-10-12
**Context:** The deployed employee journey inferred analytics, selected unrelated
shells for content roles, lost edits on reload and exported an invalid variant.
An independent installed export also discarded nested content props. The existing
technical gate did not establish runtime acceptance.
**Decision:** Keep Astro, React, the existing 18 archetypes and Gold 40 registry.
Specialise the people-operations archetype for employee briefs; match whole words
and domain phrases. Preserve domain screen intents and provide labelled example
content through the existing resource APIs. Match semantic roles explicitly,
fail closed and use canonical variant IDs. Generate export prop metadata with the
TypeScript compiler at build time and serialise structured props into standalone
source. Journal edits in the existing browser stores, await IndexedDB transaction
completion and retain invalid records in recoverable read-only mode. Compare uses
the opened project's checkpoint. All issues remain open until deployed re-audit.
**Alternatives rejected:** LLM dependency, synthetic catalogue fallbacks, suppressing
export errors, retaining demo finance content, rewriting the application.
**Cost impact:** None; no paid service, D1, R2 or provider inference added.
**Security impact:** No credentials added or persisted. Export metadata generation
uses the compiler only at build time; no dynamic source evaluation in product runtime.
Existing runtime header enforcement remains an open deployment finding.
**Status:** Runtime remediation in progress; deployment acceptance pending.

Agents may decide these locally if consistent with contracts and cost/security rules:

- exact internal helper/function names;
- specific directory subdivision inside approved packages;
- exact IndexedDB wrapper approach;
- exact deterministic PRNG implementation;
- exact schema version string convention, provided migrations are stable;
- exact implementation of static preview thumbnail generation if it remains free/portable;
- exact GitHub Actions job split;
- exact test fixture organization;
- exact CSS mechanism for tiny background grid/dot canvas.

Record a new decision below when one materially affects architecture/product behaviour.

---

### D-035 — Enforce Sites security with an isolated Astro asset Worker

**Date:** 2026-10-12
**Context:** The original public Sites deployment ignored `_headers`. Real previews
also used a same-origin sandbox and concealed unresolved slugs with Button.
**Decision:** Preserve the Astro output and add only an isolated `apps/sites`
asset Worker using the supported Cloudflare Vite build. It streams the canonical
ASSETS response with enforced security headers. No API or storage architecture
moves into the adapter. Vetted catalogue code imports into opaque script-only
preview frames. Wildcard CORS applies only to public compiled assets. Preview CSP
keeps `connect-src 'none'`; disabling CSS splitting removes fetch-based stylesheet
preloading. Dynamic module imports select compiled resource implementations, never
raw source evaluation. Validate preview messages against the parent window, its
referrer origin and the canonical protocol. The pinned official starter runtime
uses compatibility date 2026-05-15; a newer date exceeds its local emulation range.
**References:** https://developers.cloudflare.com/workers/vite-plugin/reference/static-assets/
and https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
**Alternatives rejected:** Framework rewrite, silently missing CSP, allowing
same-origin preview access, expanding preview network permissions, provisioning
D1/R2 for static hosting.
**Cost impact:** No paid service, new database, inference or always-on server.
Sites tariff remains unavailable from connector metadata.
**Security impact:** Response policy enforced and preview isolation strengthened;
no provider secret is persisted. Native deployed enforcement is still pending.
**Status:** PROVISIONAL until fixed deployed smoke and re-audit complete.

### D-036 — Public pages expose canonical data and truthful guest capability boundaries

**Date:** 2026-10-12
**Context:** The runtime audit found missing public routes, fake library controls,
ignored resource/showcase handoffs, fabricated references and empty preview props.
**Decision:** Public category routes use the real catalogue and search. Blueprint
and page recipe routes expose existing contracts and open Compose with a real
starting brief. Documentation renders repository Markdown. Creator counts reflect
actual files, not invented usage. Collections store actual bookmark slugs locally.
Showcase briefs use the same canonical resolver and publish inspectable manifests;
Workbench loads a validated independent local copy of the requested example or
Gold resource. Static preview fixtures declare the required input props and their
local demonstration handlers; they do not imply a connected backend. Guest review
pages disclose server capabilities that need the canonical Hono deployment.
Metadata scores and WCAG targets are labelled as such, not certification.
**Alternatives rejected:** Dummy 200 pages, Button fallback, synthetic catalogue
refs, fake customer numbers, paid infrastructure and broad stack changes.
**Cost impact:** No new paid infrastructure or database.
**Security impact:** Browser data only, sandboxed previews and static provenance
preserved. Editing still uses validated manifest mutations.
**Status:** Runtime remediation; deployed verification pending.

### D-037 — Project playfulness into resource geometry without changing platform tokens

**Date:** 2026-10-12
**Context:** A real onboarding edit changed the stored playfulness value but no
rendered resource token. The existing normalizer ignored that dimension.
**Decision:** At playfulness 50, preserve canonical curvature tier radii exactly.
Reserved/playful extremes apply a bounded 0.75–1.25 modifier to resource radii,
rounded to half pixels. Sharp zero-radius geometry remains sharp. Platform chrome
uses its existing design tokens. Both runtime rendering and standalone export
use this normalizer. Full DNA/token snapshots on locked nodes preserve appearance.
**Alternatives rejected:** Fake state-only controls, a replacement design system,
arbitrary screen-specific CSS and silently switching visual mode or palette.
**Cost impact:** None.
**Security impact:** None.
**Status:** Local regression passes; deployed appearance verification pending.

### D-038 — Sites asset routing compatibility correction

Deployed version 2 demonstrated that Sites serves matching assets before the Worker despite `run_worker_first`. This removed security headers from real page responses. The isolated adapter now stores canonical assets under an internal payload prefix, with HTML payloads using binary file extensions. Public URL requests miss the native asset route and pass through the Worker, which maps them to payloads and attaches the existing CSP/security headers. Binary direct payload responses cannot be executed as HTML. Astro, source packages, composition and public URLs remain canonical. D1/R2 stay unused and no paid infrastructure is introduced. Native deployment verification is mandatory; local header tests alone did not prove the original routing assumption.

### D-039 — Preserve canonical HTML against hosting edge injection

Deployed version 3 retained CSP correctly but Cloudflare injected JavaScript Detections into HTML. Its connection violated the opaque preview connect-src none policy and added an unrelated iframe. HTML responses now declare Cache-Control no-transform, as documented at https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/#if-your-origin-sends-a-no-transform-header. No CSP permission is expanded and no platform bot setting is changed. Native re-audit must verify that the origin directive is honored.

### D-041 — Owner-operated laptop backend

**Date:** 2026-10-16
**Decision:** Retain the owner-authorized existing Docker Hono/local D1 and CPU daemon implementation. It is optional infrastructure, never a dependency of deterministic composition, editing or export. Local service secrets remain outside Git. No new hosting topology, hosted D1/R2, DNS or tunnel is provisioned by consolidation. Permanent Site connectivity and real OAuth credentials remain unconfigured. Model operation is not evidence of intent accuracy.
**Verification update (2026-10-19):** The local Docker API and host passed the six checks in `apps/laptop-backend/evidence/docker-runtime.json`, including real model completion, host-control authentication, D1 queue survival across API restart, host-offline 503, task recovery, and API unavailability when stopped. The API uses compatibility date `2026-05-22` because the pinned Wrangler 4.92 local runtime rejects later dates. The evaluated model remains Lab: 62.5% validation and 68.75% held-out action accuracy, 0/6 node selection, 0/24 DNA directions, and 16/16 adversarial false positives. Cloud tunnel/D1 and OAuth are still unverified.
**Status:** Existing optional infrastructure; local Docker path verified, production Site connection unverified. Supersedes the conflicting D-034 label on the laptop branch; D-034 above identifies the earlier runtime audit.
**Hardening-plan resolution (2026-10-22):** The general Step 37 request for tunnel-startup/ingress tests conflicts with this owner-approved local-only decision. Do not provision a tunnel, DNS, hosted D1/R2, or another topology. Treat tunnel startup and external ingress as not applicable. At the release-candidate gate, verify direct browser-to-loopback behavior from the owner's laptop and verify that host-dependent controls fail clearly when the local Docker service is stopped. A full OS-restart test remains separate and unverified.

### D-042 — Product hardening programme and expansion freeze

**Date:** 2026-10-16
**Context:** Owner supplied the Product Hardening Master Plan and its exact execution order.
**Decision:** consolidation/product-hardening is the sole integration candidate, starting from aaef85c and intentionally reconciling source fixes. No major features, new export targets, models, labs, catalogue categories or hosting architectures. Baseline must be green before inventory or further hardening. Subsequent capability certification follows docs/PRODUCT_HARDENING.md. Historical Phase 20–22 checkmarks and D-032 release claims are not current evidence. D-040 records already-existing expansion, not permission for more. External human testing cannot be claimed from automation. Main requires PRs and passing validate CI, including administrators.
**Cost/security:** Existing £20 ceiling, secret policy and preview isolation remain mandatory. No new paid service.
**Status:** OWNER DIRECTED; active until the final release gate passes.

### D-043 — Local semantic search is not currently available

**Date:** 2026-10-16
**Context:** The inventory found that `LocalSemanticAdapter` reported ready from
browser capability checks while returning a zero vector, and no product route
used it. This could imply semantic ranking without performing semantic search.
**Decision:** Keep semantic search isolated as Lab and return an explicit
unavailable result until an actual local embedding model, relevance evaluation,
and route integration pass their ordered hardening gates. Full-text search and
metadata filters remain the active Core search behavior. D-012 describes the
approved possible implementation, not a shipped capability.
**Cost/security:** No model download, external inference, credential or new
service is introduced. Core discovery remains available without semantic search.
**Status:** Applied in adapter; catalogue/search audit remains pending at step 08.

### D-044 — Limit opaque preview connections to compiled assets

**Date:** 2026-10-18
**Context:** The deployed v18 Explore audit found CSP errors when the browser
fetched the compiled Astro stylesheet from within an opaque sandbox preview.
`style-src` permitted the stylesheet, but the browser's fetch-based preload also
requires `connect-src`; `connect-src 'none'` left some cards loading and emitted
console errors.
**Decision:** Permit `connect-src` only to the same-origin immutable `/_astro/`
asset path in preview frames. Keep API routes, other same-origin paths, external
hosts, credentials and nested frames unavailable. Preserve `sandbox="allow-scripts"`
without `allow-same-origin`.
**Security impact:** A preview can read public compiled assets only; it cannot
reach APIs or exfiltrate data to external origins. The exact exception is
documented and covered by header and browser tests.
**Status:** Implemented locally; public Site verification pending.

### D-045 — Keep the Design DNA linter heuristic and non-destructive

**Date:** 2026-10-19
**Context:** Step 28 found that the historical description of automated AST fixes and accessibility checking overstated the implementation. The current linter is a set of static pattern checks, not an AST transformation or rendered WCAG certification system.
**Decision:** Keep the linter Beta. Mask comments before scanning; evaluate reduced-motion classes per literal class attribute; calculate contrast only for explicit supported color pairs and report its limits; identify page landmarks from route-path/file-name heuristics. Color findings remain review-only. Spacing auto-fixes are allowed only for a one-pixel move to a non-zero 4px grid value. Do not advertise broader accessibility or design-system certification until representative external-codebase evaluation, dynamic styling, and rendered/browser checks support it. This supersedes the automated-AST-fix claim in D-040.
**Evidence:** The 1,095-file Tessellate app/resource source scan and 20-case adjudicated panel are in `quality/STEP_28_EVIDENCE.md`. The panel's 100% precision/recall applies only to its declared static cases and is not a general accuracy guarantee.
**Status:** Applied locally; capability remains Beta.

### D-046 — Keep existing-code ingestion partial and patch edits fail-closed

**Date:** 2026-10-19
**Context:** Step 29 found that the implementation described as “bidirectional AST ingestion” was regex-driven, treated every TSX/JSX file as a screen, invented SaaS/product roles and sidebar navigation, and allowed arbitrary string or regular-expression source replacement. Those claims exceeded what the implementation could preserve or infer.
**Decision:** Keep existing-code ingestion and patch emission Beta. Parse supported React route and JSX structure with the TypeScript AST; mark product intent as unknown, keep navigation unspecified, report that CSS Modules, dynamic styles, data bindings, layout composition, and business logic are not inferred, and never edit source during ingestion. Patch emission may return `SAFE` only for one uniquely addressed static `className` literal whose expected value still matches and whose syntax remains valid. Stale/dynamic or ambiguous targets are `REVIEW_REQUIRED`; malformed files and broad text/regex edits are `UNSUPPORTED`. Always preserve original code for non-SAFE results. This supersedes the bidirectional AST and targeted unified-diff claims in D-040; full project round-trip and framework fidelity are not certified.
**Evidence:** Step 29 regressions and remaining limitations are tracked in `quality/STEP_29_EVIDENCE.md`; one controlled Vite app also passes a clean offline install, build, Git-applied visual patch, and browser smoke.
**Status:** Beta; React route/JSX parsing and one static attribute mutation are covered locally. External Vite/Next/shadcn fidelity, CSS variations, and broader business-logic round-trip remain open.

### D-047 — Bound user-controlled public API collections

**Date:** 2026-10-20
**Context:** Step 37 found that public collection and creator-link routes used unbounded D1 reads, and their authenticated write paths allowed unlimited growth. This could produce oversized public responses and unbounded storage use.
**Decision:** Cap each account at 100 collections, each collection at 500 resource slugs, and each creator profile at 20 external links. Reject writes at the cap with a clear conflict response. Public reads fetch only one record beyond the cap and return an explicit service error for already-oversized legacy data instead of hiding items through truncation.
**Security and cost impact:** Limits public response size and recurring D1 storage/query growth without adding infrastructure. This is a bounded behavior for the existing account APIs; Core browser-local projects remain independent.
**Evidence:** `quality/STEP_37_EVIDENCE.md` and the Miniflare regressions in `apps/api/src/__tests__/cloud-sync-d1.test.ts`.
**Status:** Implemented locally; broader API load and quota behavior remains under Step 37 review.

### D-048 — Cap concurrent local MCP SSE sessions

**Date:** 2026-10-20
**Context:** The unauthenticated MCP SSE compatibility server was loopback-only and enforced browser-origin checks, but every local connection created another live server and transport without a concurrency limit.
**Decision:** Support at most eight concurrent local SSE sessions. Return a retryable 503 when full. Preserve the existing loopback-only bind policy and the SDK's 4 MiB request-body ceiling.
**Security and cost impact:** Bounds per-process resource use while preserving the current multi-client workflow for a small local group. This does not add a remote or authenticated MCP transport.
**Evidence:** A real MCP client test verifies eight concurrent connections and rejection of a ninth; a 5 MiB message test verifies the SDK transport body ceiling. See `quality/STEP_37_EVIDENCE.md`.
**Status:** Implemented locally; long-duration disconnect/reconnect churn remains in Step 37 review.

### D-049 — Bound account favorite storage and reads

**Date:** 2026-10-20
**Context:** Step 37 found that the authenticated favorites API could store an unlimited number of distinct slugs and returned them all in one response.
**Decision:** Allow at most 500 favorite slugs per account. Keep duplicate saves idempotent, reject new additions at capacity with a conflict response, and fail explicitly if legacy data exceeds the response ceiling.
**Security and cost impact:** Bounds user-controlled D1 rows and response size while preserving the local-first Core product and current favorites API shape.
**Evidence:** D1 regression covers a 501-row favorite list and a write attempted at capacity; see `quality/STEP_37_EVIDENCE.md`.
**Status:** Implemented locally; broader public API behavior remains under Step 37 review.

### D-050 — Preserve publication ownership when slugs collide

**Date:** 2026-10-20
**Context:** Step 37 found that publishing a different project under an already-used custom slug updated the existing public snapshot, allowing one owner to replace another owner's published content.
**Decision:** Validate custom slugs as lowercase URL-safe identifiers. On a slug conflict, update a public snapshot only when its stored project ID matches the publishing project; otherwise return HTTP 409 and leave both project and publication state unchanged. Apply the same ownership rule to the in-memory fallback.
**Security impact:** Prevents cross-project content replacement while preserving legitimate republishing by the owning project.
**Evidence:** D1 regression in `apps/api/src/__tests__/cloud-sync-d1.test.ts`; complete issue details in `quality/STEP_37_EVIDENCE.md`.
**Status:** Implemented locally; deployed API behavior remains unverified.

### D-051 — Bound cloud project and revision storage

**Date:** 2026-10-20
**Context:** Step 37 found that project and revision lists used unbounded reads and their write routes allowed unlimited records per account.
**Decision:** Cap an account at 100 cloud projects and a project at 500 revisions. Reads fetch at most one record over the cap and return an explicit service error for legacy overflow; writes reject at capacity. Keep browser-local projects outside these cloud-account ceilings.
**Cost and safety impact:** Bounds D1 storage and response work without adding a service or silently truncating a user's saved data.
**Evidence:** D1 regressions in `apps/api/src/__tests__/cloud-sync-d1.test.ts`; details in `quality/STEP_37_EVIDENCE.md`.
**Status:** Implemented locally; deployed D1 behavior remains unverified in Step 37.

### D-052 — Enforce cloud storage ceilings atomically

**Date:** 2026-10-20
**Context:** Step 37 concurrent D1 tests showed that count-then-insert checks for collections, collection items, favorites, and creator links allowed simultaneous requests to exceed their configured ceilings.
**Decision:** Put each quota predicate inside the corresponding D1 `INSERT ... SELECT ... WHERE count < limit` statement so capacity evaluation and insertion are atomic. Keep duplicate collection-item writes idempotent.
**Security and cost impact:** Prevents concurrent requests from bypassing storage and response-size limits without introducing another service or relying on process-local locks.
**Evidence:** The D1 regression launches eight simultaneous writes at each ceiling and verifies exactly one succeeds while the other seven receive HTTP 409; see `quality/STEP_37_EVIDENCE.md`.
**Status:** Implemented locally; deployed D1 behavior remains unverified.

### D-053 — Bound aggregate cloud project responses

**Date:** 2026-10-20
**Context:** Step 37 found that individually valid manifests could make the bounded project or revision lists produce very large responses when many near-maximum records were stored.
**Decision:** Cap the serialized UTF-8 size of project and revision list responses at 8 MiB. Preflight aggregate stored manifest bytes before loading D1 rows, then account for each normalized entry incrementally and return a controlled 503 if the response would exceed the cap; never truncate or omit saved records.
**Security and cost impact:** Bounds memory and network work per API request while preserving complete project history and the existing local-first storage model.
**Evidence:** A D1 regression with nine schema-valid 1 MB manifests verifies both list routes fail explicitly above the aggregate cap; see `quality/STEP_37_EVIDENCE.md`.
**Status:** Implemented locally; deployed API behavior remains unverified.

### D-054 — Apply the cloud project cap to authenticated remixes

**Date:** 2026-10-20
**Context:** Step 37 showed the authenticated public-project remix endpoint could create a 101st cloud project and wrote the project and first revision in separate operations.
**Decision:** Share the normal project limit with remix creation. Conditionally insert the project and create its first revision in one D1 batch; return 409 at capacity. Keep generated remix names within the project-name limit including the suffix.
**Security and cost impact:** Prevents a public API path from bypassing account storage limits and avoids partially persisted cloud remixes.
**Evidence:** The D1 test proves 100 projects blocks remix without adding project or revision records, then removes a slot and verifies a saved remix with readable revision history.
**Status:** Implemented locally; deployed D1 behavior remains unverified.

### D-055 — Keep Astro/React while patching the build toolchain

**Date:** 2026-10-20
**Context:** A live package advisory audit found 48 findings in the locked dependency tree, including a critical Astro AVIF optimization issue, critical test-runner dependencies, vulnerable Vite versions, and Windows development-server file-read exposure through Wrangler's bundled esbuild. The Astro 5 Markdown plugin configuration also stopped building once Astro 7 made the unified processor optional.
**Decision:** Preserve the approved Astro + React architecture. Upgrade to patched Astro 7.2.8, `@astrojs/react` 7.1.0, Vite 8.3.4, and Vitest 4.1.11; retain the Wrangler 4.92.0 local runtime and pin only affected transitive dependency versions through the workspace overrides. Keep the existing rehype behavior by configuring `unified()` from `@astrojs/markdown-remark`. Add `pnpm audit:dependencies` to the required audit gate so a future advisory cannot silently re-enter the baseline.
**Security and compatibility impact:** The vulnerable packages are removed without changing Tessellate's backend runtime or preview isolation. The revised Astro build still produces all 717 pages, and the Sites Worker CSP regression confirms build-generated script/style hashes remain valid. `pnpm audit` now reports zero known vulnerabilities.
**Evidence:** `quality/evidence/step-37/dependency-audit.json`, updated Sites CSP and resource browser certification, and the frozen-lockfile install.
**Status:** Implemented locally; full repository, browser, Docker, and deployed release-candidate verification remains part of the hardening gate.

### D-056 — Require evidence before resource scores count as assessments

**Date:** 2026-10-21
**Context:** Step 39 found that resource builders assigned high quality scores and accessibility verification flags by template. Only the Gold 40 have the retained browser accessibility evidence; treating every score and flag as measured distorted discovery, compatibility ranking, and detail-page confidence.
**Decision:** Add an explicit quality-assessment status with evidence references. Legacy and generated resource scores default to unassessed; unassessed scores are hidden in the UI and use a neutral compatibility weight. Search minimum-quality filters include only reviewed scores. Accessibility targets remain targets, and non-Gold resources do not inherit verification flags from builder templates. Detail pages identify Gold browser evidence separately from manifest claims.
**Security and product impact:** Removes fabricated quality and accessibility assurance without removing catalogue resources or changing the Gold runtime boundary. WCAG 2.2 AA remains the platform target.
**Evidence:** `quality/STEP_39_EVIDENCE.md`, `quality/evidence/step-39/`, and the schema, catalogue, compatibility, search, and browser regressions.
**Status:** Implemented locally; published review verification remains pending for Step 45.

### D-057 — Parse code-form resource manifests without executing them

**Date:** 2026-10-21
**Context:** Security review found the catalogue loader dynamically imported contributed `.ts` and `.js` manifests. A manifest could run filesystem or network code whenever the catalogue was built, before schema validation had a chance to reject it.
**Decision:** Keep static TypeScript/JavaScript manifest support, but parse it as an object-literal data format. Reject imports, calls, computed values, and executable statements; JSON remains the preferred canonical format.
**Security and compatibility impact:** Catalogue builds no longer execute contributed manifest code. Existing JSON resources are unaffected; static code-form manifests remain supported, while dynamic module behavior is intentionally unsupported.
**Evidence:** `quality/STEP_37_EVIDENCE.md` and `quality/evidence/step-37/executable-manifest-isolation.json`.
**Status:** Implemented locally; deployed release-candidate verification remains pending.

### D-058 — Generate runtime resources only from validated catalogue directories

**Date:** 2026-10-21
**Context:** Step 37 found that the Gold artifact generator independently walked `resources/` after catalogue validation, following symlinked category directories and including source folders omitted by the canonical catalogue.
**Decision:** Pass the catalogue builder's validated manifest-to-directory map into artifact generation. Direct invocation must first build and validate the catalogue; source roots/files must remain canonically contained, with generated-source byte limits.
**Security and compatibility impact:** Unvalidated folders and symlink escapes cannot enter runtime/export registries. The canonical resource vocabulary and existing build flow remain unchanged.
**Evidence:** `quality/STEP_37_EVIDENCE.md` and `quality/evidence/step-37/gold-artifact-resource-boundary.json`.
**Status:** Implemented locally; deployed release-candidate verification remains pending.

### D-059 — Serialize manifest metadata in generated TypeScript

**Date:** 2026-10-21
**Context:** A schema-valid resource ID containing a quote and expression was interpolated into generated renderer and preview registries, where it became executable TypeScript.
**Decision:** Serialize generated strings as JSON string literals and validate slugs and component identifiers before emitting TypeScript.
**Security and compatibility impact:** Valid resource IDs remain supported as keys while metadata cannot break out of generated string literals.
**Evidence:** `quality/STEP_37_EVIDENCE.md` and `quality/evidence/step-37/generated-metadata-escaping.json`.
**Status:** Implemented locally; deployed release-candidate verification remains pending.

### D-060 — Keep non-Gold resource implementations out of the main app renderer

**Date:** 2026-10-21
**Context:** Security review found that the validated catalogue generator statically imported all 324 resource implementations into the renderer used by the authenticated application, although only the Gold 40 are certified for Core runtime execution. Catalogue validation does not certify arbitrary component code as safe for that origin.
**Decision:** Generate main-origin renderer imports and accepted-prop metadata only for the exact Gold 40 slug set. Keep other resource implementations in the isolated preview app or opaque-origin sandboxed preview frame; if an unverified resource is referenced in a Workbench project, preserve its manifest data and render the existing recoverable missing-resource diagnostic.
**Security and product impact:** Unverified catalogue code no longer executes as part of the authenticated application's renderer bundle. Core composition remains unchanged because it already selects Gold resources; non-Gold previews remain isolated.
**Evidence:** `quality/STEP_37_EVIDENCE.md` and `quality/evidence/step-37/gold-runtime-boundary.json`.
**Status:** Implemented locally; deployed release-candidate verification remains pending.

### D-061 — Bound external collections and standardize on patched Zod 4

**Date:** 2026-10-23
**Context:** The dependency audit found a high-severity Zod array-validation advisory in the authentication dependency graph. Zod's upstream fix short-circuits declared collection bounds before parsing elements; unbounded arrays still need application-level limits. The canonical schema package also used Zod 3, which kept the audit finding present and could not provide that behavior for bounded input.
**Decision:** Use Zod 4.6.7 across workspace packages that directly depend on Zod, pin Better Auth's transitive 4.6.5 request to 4.6.7, and give every array/set/map contract an explicit upper bound. Keep the existing API body-size limits and preserve the approved Zod validation architecture. Maintain the bounded recursive ProjectNode depth limit.
**Security and compatibility impact:** Oversized collections are rejected before item validation and requests remain byte-bounded. Existing accepted manifests stay valid; product-scale limits allow up to 200 project screens and 200 children per node, with larger limits only for IDs, locks, edges, and evidence collections. Zod 3 type usage was migrated without changing the product's schema semantics.
**Evidence:** `quality/STEP_37_EVIDENCE.md`, `quality/STEP_39_EVIDENCE.md`, `quality/evidence/step-39/`, and the malformed 25,000-entry collection schema regressions.
**Status:** Implemented and locally verified; frozen install, dependency audit, unit tests, typecheck, lint, production build, behavioral release gate, and full Playwright suites pass. Public review verification remains pending.

### D-062 — Route preview links through a host confirmation

**Date:** 2026-10-25
**Context:** The public v30 audit found that a resource's `/compose` CTA navigated only the small opaque preview iframe. Compose then ran with a `null` origin and could not fetch `/data/catalog.json`, leaving the user inside a broken miniature application.
**Decision:** Keep both the iframe `sandbox="allow-scripts"` attribute and response-level CSP sandbox unchanged. The isolated renderer may send a bounded, typed navigation request only after a trusted anchor click. The app accepts it only from the expected iframe with its opaque `null` origin, validates the destination as HTTP(S), and displays an accessible confirmation link in the trusted host. Same-origin routes open in the host tab; external destinations open a new tab with `noopener noreferrer`. No automatic navigation or parent access is granted.
**Security impact:** Preview origin, storage, API, network, and script isolation remain unchanged. Users explicitly approve each requested destination in the trusted host UI; the displayed destination is visible before following it.
**Evidence:** `quality/evidence/step-39/deployed-v30-interactions/cta-product-preview-handoff-1440x900.png`, the failed-before browser regression in `tests/e2e/preview-link-navigation.spec.ts`, and the post-fix confirmation/navigation regression.
**Status:** Implemented locally; public v30 remains affected until the next approved review deployment passes the same browser checks.

### D-063 — Restore saved Workbench projects before loading the catalogue

**Date:** 2026-10-26
**Context:** Chrome DevTools traces showed that saved-project startup waited on the full 324-resource catalogue request, and a failed catalogue request prevented an otherwise valid browser-local project from opening. The catalogue is not required to render an existing Gold-resource manifest.
**Decision:** Restore and render saved manifests independently of the catalogue. Load the validated catalogue only when Library, Resource details, Replace, first-run sample generation, or an imported showcase/resource requires it. Deduplicate concurrent catalogue requests, preserve a saved project when the request fails, and show truthful loading/error/retry states in catalogue-backed panels.
**Security and cost impact:** Keeps Gold-only main-origin rendering and the existing preview isolation. No D1/R2, paid service, or hosted runtime is added. The full catalogue remains schema-validated before use.
**Evidence:** `quality/STEP_38_EVIDENCE.md`, `quality/evidence/step-38/after/catalogue-lazy-load/`, and the red-to-green Workbench desktop/mobile Playwright regression.
**Status:** Implemented locally; public v30 remains affected until an approved newer Site passes the same issue-specific checks.

### D-064 — Waive external participant study for the V1 hardening release

**Date:** 2026-10-30
**Context:** The owner directed completion of the technical product-hardening goal with a human-validation waiver after the ordered programme's technical evidence and public RC re-audit had been assembled.
**Decision:** Waive only the 5–10 unfamiliar-participant recruitment and moderated-session requirement in Step 46 for this release gate. Record Step 46 as waived, not passed. Do not invent participants, sessions, observations, or usability findings. Keep all browser, accessibility, security, deployed-runtime, CI, cost, licensing, and protected-branch release requirements in force.
**Product impact:** Automated and expert-run browser evidence remains useful for technical acceptance but is not described as human validation. The separate usability study can be run later without blocking this owner-waived gate.
**Evidence:** `quality/STEP_46_EVIDENCE.md`; owner instruction received 2026-10-30.
**Status:** Applied to the current hardening release gate only.
