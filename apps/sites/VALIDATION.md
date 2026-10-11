# Sites review validation — 2026-10-11

Source baseline: `50a2c7f11dcda22a8bfa61b83e3d687291b35905` on
`antigravity/v1-merge-gate`. The original workspace was on merge commit `d804fd3`,
whose tree is identical. Preparation uses an isolated managed worktree at the
expected commit. No source changes are pushed to the owner's GitHub branch.

## Results

| Check | Result |
| --- | --- |
| Frozen pnpm install | Passed, existing lockfile unchanged |
| Catalogue build | 324 manifests; exactly 40 Gold resources |
| Repository TypeScript | Passed across all 17 application/package checks |
| Adapter TypeScript and JavaScript lint | Passed |
| Repository ESLint | Passed, 34 existing warnings, zero errors |
| Licence/provenance audit | Passed: 324 resources, zero violations |
| Secret/security audit | Passed: zero findings from existing audit |
| Unit/integration tests | 361 passed in 37 files; includes actual standalone build/browser execution |
| Behavioural release gate | All 16 passed |
| Production build | Passed, all workspace builds, 668 Astro pages |
| Bundle budget audit | Passed; client 65.52 KiB, Explore 26.70 KiB, Workbench 64.93 KiB gzip; catalogue 109.56 KiB gzip |
| Existing Playwright/Axe suite | 31 passed, 3 intentional viewport-specific skips |
| Packaged-artifact Playwright smoke | 2 passed; employee-experience journey and all existing tools/routes |
| Desktop/mobile screenshots | Captured and inspected locally; canonical UI retained |
| Sites runtime | Pending explicit publication approval; no deployment performed |

The existing axe tests disable color-contrast and target-size. Passing that suite
does not establish a complete independent WCAG audit. Bundle figures are the
repository audit's individual matched chunks, not an aggregate initial-load claim.
The security audit checks sandbox presence but does not verify origin isolation;
the limitations below remain even though the script passes.

## Packaged runtime smoke

Homepage → Compose → exact acceptance brief:

> Build a professional but playful employee experience platform for a 500-person
> technology company. The marketing site should feel warm and energetic, while
> the application itself should feel professional, fast and trustworthy. Make
> the dashboard refined, make onboarding playful, keep settings conservative.

Generated three real direction previews → Direction C → Workbench → Recompose
→ Surprise Me → actual standalone ZIP download and archive inspection.
Captured all console errors and uncaught exceptions without filtering out 404s.
Result: zero browser errors, zero unresolved project resources, all project refs
resolve to the canonical Gold 40 allowlist, zero synthetic refs, and a valid ZIP
containing package.json, Vite config and component source.

The original flagship suite additionally covers DNA overrides, subtree-hash lock
preservation, resource replacement and an actual exported-project install/build
and standalone browser execution. The deployed test remains pending.

Artifact smoke also checks `/data/catalog.json`, `/explore`, `/r/button`,
`/showcases` and all ten actual tool routes:
`dna`, `backgrounds`, `motion`, `palette`, `typography`, `layout`,
`section-planner`, `dataviz`, `accessibility`, `icons`.

Re-run after publication with:

```sh
# Set SITES_SMOKE_URL to the exact returned production URL, then:
pnpm exec playwright test --config apps/sites/playwright.config.ts
```

Before saving, the original tracked generated artefacts were restored after the
catalogue validation, then all workspace packages/apps were rebuilt from that
source state. This avoids committing timestamp and platform-newline churn in
catalogues, registry source strings and generated exporter files. The adapter
copies the final canonical build into root dist and supplies its compiled CSS
at the existing stylesheet URL. Security headers are copied unchanged.

## Unmet deployment-objective requirements

- `/docs`, documentation subroutes, `/blueprints`, blueprint-detail routes and
  `/showcase` are absent from this commit's web application. Their source data
  and docs are preserved. `/showcases` is the real existing showcase route.
- Resource-detail iframe previews only register Button; other slugs display the
  existing Button fallback. This does not affect Gold project composition/rendering.
- Cloud/account functions and server AI proxy are not hosted by this static
  version. Canonical Hono/Better Auth/D1 code remains present in source. No fake
  endpoints, alternate database or auth bypass was added.
- The existing `/preview` iframe is same-origin with scripts and same-origin
  sandbox permissions, and its message listener lacks sender-origin checks.
  This is not adequate isolation for untrusted/community code on an authenticated
  origin. The review ships only the existing curated registry, without account
  backend credentials. No Sites constraint forced a security compromise.
- Actual Sites CSP/header enforcement, routing, visitor access and hosted browser
  behavior cannot be verified before publication. Do not treat local success as
  deployed success. The exact requested objective is therefore not fully passed.

## Hosting and cost

The Site is private and unpublished at version-save time. No D1 or R2 binding
was requested/provisioned; both are null in the manifest. No paid service,
provider API key, new database, always-on server or platform-funded AI was added.
Local project persistence and export remain browser-side. This preserves the
cost structure; Sites tools do not expose billing, so a guaranteed numeric
monthly Sites total cannot be verified here. The canonical £20 ceiling remains.

## Exact deployment changes

- `.openai/hosting.json`
- `apps/sites/README.md`
- `apps/sites/VALIDATION.md`
- `apps/sites/prepare-static.mjs`
- `apps/sites/astro.preview.config.mjs`
- `apps/sites/playwright.config.ts`
- `apps/sites/sites-smoke.spec.ts`
- `apps/sites/tsconfig.json`
- `docs/DECISIONS.md` (D-033)

No canonical application, package, resource, lockfile, dependency, style or route
source was modified. The root dist is ignored generated output. The pushed Sites
source commit and saved version number are returned by the native Sites workflow.
