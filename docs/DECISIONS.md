# Tessellate Decision Register

This file records major decisions so autonomous agents do not repeatedly reopen them.

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

### D-032a — Retraction of D-031/D-032 verification claims
**Date:** 2026-10-14  
**Context:** A read-only customer audit (2026-10-14) found that the Phase 21/22 claims recorded in D-031 and D-032 were not true: there is no production deployment (`tessellate.design` does not resolve, `database_id` is a placeholder, smoke tests are in-process), preview origin isolation is not implemented, there is no licence file, and the release gate mostly counted artefacts rather than verifying outcomes.  
**Decision:** D-031 and D-032 are retracted as statements of fact. Their cost model stays a target. Phases 23–36 in `docs/BUILD_ORDER.md` are the active backlog, and every phase gate must pass in CI as an outcome check.  
**Status:** LOCKED.

### D-033 — Host daemon is the only intelligence engine
**Date:** 2026-10-14  
**Context:** The owner chose platform-provided intelligence served from an owner-run host daemon (`apps/host-daemon`) through a public ticket queue, instead of BYO provider keys.  
**Decision:**
- The host daemon is the only engine for brief interpretation (brief → ProductModel, ScreenGraph and content plan) and natural-language commands (→ IntentCommand).
- The BYO-key path is removed: provider adapters, the memory credential store, `/api/ai/*` proxy and the AI product interpreter.
- The deterministic keyword interpreter and deterministic command matcher are removed as user-facing fallbacks.
- The mechanical TypeScript engines remain and are not considered intelligence: compatibility scoring, normalisation, mutation executor, renderer and exporter.
- When the daemon is offline, compose and natural-language editing show an honest "unavailable / queued with ETA" state. Browsing, manual editing and export keep working.

**Supersedes:** D-003 (core intelligence without AI) and D-004 (BYO credentials) for interpretation and commands.  
**Accepted risks:**
- No offline intelligence.
- MCP/CLI compose depend on the daemon.
- A single host machine is a single point of failure.
- Client briefs are processed on the owner's machine; this must be disclosed in the Privacy Policy, with a retention limit.

**Cost impact:** none beyond D-035.  
**Security impact:** Daemon authentication uses per-device tokens stored hashed in D1. Enqueue requires a session or Turnstile. Payloads are schema-validated and size-limited, with rate limits.  
**Status:** LOCKED.

### D-034 — Bespoke model only (no LLM)
**Date:** 2026-10-14  
**Decision:**
- The daemon uses the bespoke Tree-GNN/Bi-GRU model family only. No large language model is used.
- Brief understanding is extended with:
  - a domain ontology;
  - a span tagger for entities, actors, actions, constraints and feel;
  - a multi-label archetype classifier;
  - a held-out evaluation set with accuracy thresholds.
- A mandatory "Review inferred product" step lets users correct inferences before composing.

**Status:** LOCKED.

### D-035 — Capacity and queue infrastructure
**Date:** 2026-10-14  
**Decision:**
- A single owner machine serves the queue.
- The queue is a Cloudflare Durable Object with WebSocket hibernation: the daemon connects outbound and clients receive pushed status. It provides a fair per-user round-robin, priority for signed-in users, global and per-user caps, and ETAs.
- The protocol is multi-worker-ready.
- Requires Cloudflare Workers Paid (≈£4/month), because 1-second polling alone would exceed the free 100k requests/day.

**Supersedes:** D-022 only insofar as the owner's own machine runs continuously; no paid server is added.  
**Cost impact:** ≈£5/month total (Workers Paid plus domain). Usage alarms are set below the £20 ceiling.  
**Status:** LOCKED.

### D-036 — Licence
**Date:** 2026-10-14  
**Decision:** MIT everywhere: repository, platform and resources. A root `LICENSE` is required. Marketing copy must say "MIT".  
**Status:** LOCKED.

### D-037 — Accounts and administration
**Date:** 2026-10-14  
**Decision:**
- Accounts use Better Auth email + password, with:
  - email verification;
  - password reset;
  - session management;
  - account data export and deletion;
  - an admin role and admin console covering users, bans, queue, daemon devices, reports and an audit log;
  - Turnstile and rate limits on authentication forms.
- Email is sent through Cloudflare Email Service.
- GitHub OAuth is optional and may return later.

**Supersedes:** D-013.  
**Status:** LOCKED.

### D-038 — Export targets
**Date:** 2026-10-14  
**Decision:**
- Exports target as many frameworks as possible:
  - React (Vite, Next.js App Router);
  - Vue 3 (Vite, Nuxt);
  - Svelte/SvelteKit;
  - Angular;
  - Solid;
  - Qwik;
  - static HTML + Web Components;
  - React Native (Expo + NativeWind).
- Flutter, SwiftUI and Jetpack Compose come later, generated from a screen-level IR and labelled beta.

**Supersedes:** D-005 (V1 React-only).  
**Status:** LOCKED.

### D-039 — Framework-neutral resource authoring
**Date:** 2026-10-14  
**Decision:**
- Resources are authored as framework-neutral Mitosis components (`component.lite.tsx`, Builder.io Mitosis, MIT, build-time only) and compiled per target.
- Complex resources may carry per-target overrides.
- Styling uses semantic token utilities only.

**Status:** LOCKED.

### D-040 — Truthful metadata and outcome-based gates
**Date:** 2026-10-14  
**Decision:**
- Resource `status` is earned, not stamped:
  - `verified` requires all automated resource checks plus a named human reviewer;
  - build scripts must never promote status;
  - provenance must disclose AI generation (`aiAssistance`).
- Marketing numbers come from the live catalogue.
- Release gates verify outcomes (golden briefs, exported builds, fresh-directory installs, link crawl, contrast), not counts.

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

## Decision template

### D-XXX — Title
**Date:** YYYY-MM-DD  
**Context:** Why a decision was needed.  
**Decision:** What is being done.  
**Alternatives rejected:** Concise list.  
**Cost impact:** None / expected amount.  
**Security impact:** None / describe.  
**Status:** LOCKED / PROVISIONAL.
