# Tessellate

Tessellate composes editable product interfaces from a brief, a shared resource catalogue and Design DNA. Projects are represented by a versioned ProjectManifest, edited through validated mutations, and exported as source code.

## Current status: product hardening

Product expansion is frozen. The owner-directed [hardening programme](docs/PRODUCT_HARDENING.md) governs work in order, beginning with source consolidation and a green baseline. The integration candidate is `consolidation/product-hardening`; `main` is protected and changes require a PR and passing CI. Previous build-order checkmarks are historical records, not current production certification.

[Source reconciliation](docs/CONSOLIDATION.md) explains which fixes are retained from main, the deployed audit and the laptop backend. No broad branch merge or new architecture is implied. The feature inventory, certification matrix and capability tiers follow after the baseline passes.

## What exists

- Astro public application with React islands for catalogue discovery, Compose, tools and Workbench.
- A declared corpus of 324 resources, including 40 resources nominated for Gold runtime use; three named variants per resource. Gold certification must be re-established through browser evidence.
- Deterministic product interpretation, screen planning, three-direction composition and compatibility constraints.
- React/Zustand Workbench with Design DNA, selection, locking, replacement, recomposition, history, local persistence and preview.
- Browser-side manifest/source ZIP and agent handoff export; the primary export is React/Vite.
- Existing Next.js, token, Expo and SwiftUI generators, linter, ingestion/patch emitter and registry gate. Source generation alone does not establish production fidelity; these require separate capability evaluation.
- Registry, CLI and MCP packages using shared project/resource contracts.
- An optional Hono API and owner-operated Docker CPU inference host. Running a model does not establish correct interpretation. Core deterministic workflows must work without AI, accounts or the laptop backend.

Authentication, cloud sync and publishing require separately configured API storage and genuine GitHub OAuth credentials. They are not available merely because their source routes exist. The current laptop-to-Site connection has no configured permanent hostname/tunnel in this repository.

## Local prerequisites

Use Node.js 24.20.0 (`.node-version`) and pnpm 11.20.0 (`packageManager`). Docker Desktop is required only for the optional laptop API/model runtime.

```sh
pnpm install --frozen-lockfile
pnpm build:catalog
pnpm dev
```

For a built public application: `pnpm build`, then `pnpm --filter @tessellate/site preview --port 4321`.

Install the local main-commit guard in a fresh clone:

```sh
git config core.hooksPath .githooks
```

Repository protection also enforces the PR/CI requirement remotely, including administrators. Do not bypass it.

## Required baseline

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

`audit:all` builds its prerequisites before measuring bundles; it must work without a pre-existing dist directory. Tests use bounded workers to avoid machine-dependent overload. Lint errors block work; accepted existing warnings are tracked in [lint debt](quality/LINT_DEBT.md), with no blanket rule disabling.

These checks establish a baseline, not semantic product certification. The hardening programme additionally requires real browser workflows, independent exported-app installs/builds, visual review, accessibility, fault injection and cross-browser evidence. Step 46 normally requires observed human usability sessions; the owner waived that study for the current release gate on 2026-10-30. No human-validation result is claimed. See `quality/STEP_46_EVIDENCE.md` and D-064.

## Runtime boundaries

Public resources are free, with no source paywall or download cap. Git is authoritative for catalogue source and provenance. The application uses Astro, React, Tailwind 4, Zod, Zustand, Hono and the existing Cloudflare-compatible adapters; core packages remain host-neutral.

Core projects are browser-local and guest-first. Optional account state uses the API/D1 architecture; R2 is only for genuinely needed assets. The owner-authorized laptop setup runs local D1/SQLite and a separate CPU worker in Docker. Follow [laptop instructions](apps/laptop-backend/README.md) to start/stop it. Secrets remain outside Git/images, and stopping the laptop or Docker makes dependent operations unavailable. A stale heartbeat can take up to 15 seconds to expire. No new tunnel, paid database or paid inference service is introduced by consolidation.

The existing isolated [Sites adapter](apps/sites/README.md) packages canonical Astro output and enforces response headers. Preview iframes retain their isolation. Publication is a later release-candidate gate, not an automatic consequence of a local build.

Infrastructure target: £0–£8/month, with an absolute pre-commercial £20/month ceiling. Cost projections are planning assumptions, not billing evidence. Provider keys must never enter stored projects, databases, logs or bundles.

## Working contracts

Read [AGENTS.md](AGENTS.md), then its mandatory specification sequence before implementation. The current programme takes precedence over the historical feature-build order. The principal specifications are [product](docs/PRODUCT_SPEC.md), [architecture](docs/ARCHITECTURE.md), [data contracts](docs/DATA_CONTRACTS.md), [composition](docs/COMPOSITION_ENGINE.md), [Workbench](docs/WORKBENCH_SPEC.md), [design](docs/DESIGN_SYSTEM.md), [quality/security](docs/QUALITY_SECURITY.md), [deployment/cost](docs/DEPLOYMENT_COST.md) and [decisions](docs/DECISIONS.md).

Preserve the calm editorial public shell and the dense design-instrument Workbench described in [reference directions](design/REFERENCE_DIRECTIONS.md). No new major features until the programme's final release gate passes.
