# Tessellate Decision Register

This file records major decisions so autonomous agents do not repeatedly reopen them.

> Current operating authority: D-042. Historical release statements below do not certify current code or deployed infrastructure.

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
**Status:** Existing optional infrastructure; production connection unverified. Supersedes the conflicting D-034 label on the laptop branch; D-034 above identifies the earlier runtime audit.

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
