# Step 29 — Existing-code ingestion and patch safety

## Status and capability boundary

Existing-code ingestion and source patching remain **Beta**. This pass replaces
regex-based route guessing and arbitrary text replacement with bounded TypeScript
AST analysis and fail-closed patch operations. Step 29 is accepted at this Beta
boundary; it does not claim full source or business-logic reconstruction. Pinned
upstream Vite and Next.js starter projects pass build and browser checks. The
Vite round trip applies two independent exact class edits, builds, and verifies
both visual changes plus the existing keyboard interaction. The shadcn v4 fixture now passes
isolated installation and official registry generation, and its production app
builds with Webpack after raising Node's heap to 6 GB. Its normal Turbopack build
still fails to resolve a generated workspace CSS export, and the local runtime
smoke records Vercel Analytics 404s. These fixtures do not certify arbitrary
React applications or prove that imported business behavior and layout
composition are reconstructed. The saved manifest and CLI preserve this
limitation so downstream Workbench or export use cannot imply layout fidelity.

Ingestion reads source files and emits a partial `ProjectManifest`; it does not
write to the source tree. Product intent remains unknown, navigation remains
unspecified, and the CLI labels the output as partial. Only supported Vite
entrypoints and conventional Next.js `app`, `pages`, and `routes` files are
recognized. Imported product intent and navigation are unknown unless source
evidence directly supports a declared DNA field; remaining required DNA values
are disclosed as schema defaults. Patch emission is limited to one uniquely
addressed static JSX `className` string whose expected value still matches and
whose edited TSX parses successfully.

## Findings and remediations

| Finding                                                                              | Evidence and reproduction                                                                                                                                                                    | Root cause                                                                                                                      | Remediation                                                                                                                                                                                                                                                                           | Status                                                                                                             |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ING-29-01: every TSX file could be presented as a screen                             | Put a reusable `Page` component beside a route, or pass only component files. The former created false screens; the latter could yield an empty-looking imported product.                    | Filename and source-string heuristics treated files as product screens without locating route entrypoints.                      | Parse source with the TypeScript AST; recognize supported Vite and Next route patterns, preserve route paths, exclude reusable component directories, record layouts separately, and fail when no supported route exists. Anonymous default route components are covered.             | Fixed for supported route patterns; other router configurations remain unsupported.                                |
| ING-29-02: imported projects received invented product meaning                       | Ingest a non-finance app whose source contains words such as `card`, `metric`, or `stat`; the old parser inferred SaaS screens, dashboard roles, and navigation from incidental strings.     | Raw-source regexes were used as product-intent and screen-role evidence.                                                        | Keep archetype `unknown`, navigation `unspecified-imported`, inferred screen jobs/data empty, and expose scope warnings. Structural roles come from JSX tags only.                                                                                                                    | Fixed locally; generic schema-required import metadata remains clearly identified as scaffolding.                  |
| ING-29-03: malformed TSX could produce a plausible manifest                          | Supply malformed route TSX. The old analysis could continue and return guessed nodes.                                                                                                        | Parsing did not validate a syntax tree before mapping.                                                                          | Report TypeScript parser diagnostics and reject the input before producing a manifest.                                                                                                                                                                                                | Fixed; regression passes.                                                                                          |
| ING-29-04: broad text or regex patching could change unrelated source                | Request a regex/string replacement or target a dynamic, stale, or ambiguous JSX value. The previous implementation could replace arbitrary source text or throw on a non-RegExp target.      | A text replacement API was described as AST-aware source mutation.                                                              | Introduce `SAFE`, `REVIEW_REQUIRED`, and `UNSUPPORTED` results. Only a unique, exact static `className` edit can be `SAFE`; uncertain targets preserve the original source, and malformed input or broad text/regex requests are `UNSUPPORTED`.                                       | Fixed locally; regression passes.                                                                                  |
| ING-29-05: generated patch paths and hunks were unsafe or unusable                   | Supply a parent/absolute path or apply a generated diff containing a source edit. The old diff output accepted unsafe paths and could not be applied by Git.                                 | Diff headers were assembled without validating workspace paths or hunk line counts/context.                                     | Reject absolute, parent-traversal, and control-character paths; emit a single-hunk unified diff with correct insert/delete counts and final-newline markers. Tests run `git apply --check` and apply the patch for replacements, insertions, deletions, empty files, and EOF changes. | Fixed locally; regression passes.                                                                                  |
| ING-29-06: static DNA inference read comments and overstated certainty               | Put Tailwind class examples only in comments, or use CSS Modules/dynamic class values. The old scanner treated examples as live styles and assigned a default-looking palette/mode.          | Raw source text and fallback defaults were treated as style evidence.                                                           | Read only static JSX class attributes from the AST; return `unknown` and confidence 0 where the source contains no supported evidence.                                                                                                                                                | Fixed within the declared static scope; unsupported styles remain disclosed.                                       |
| ING-29-07: CLI output could overwrite an input source file                           | Set `--output` to a source file path or a symlink resolving to a source file.                                                                                                                | Output paths were not checked against discovered source paths.                                                                  | Resolve absolute and real paths before writing and refuse source-file collisions.                                                                                                                                                                                                     | Fixed; CLI regression passes.                                                                                      |
| ING-29-08: a helper component could be mistaken for a Next page                      | Put `HelperCard()` with JSX in `app/page.tsx` but omit the page's default export. The previous candidate fallback accepted the helper as the route.                                          | Route classification checked the file path but allowed any JSX component declaration to satisfy the page contract.              | Require a default component export for conventional `app`, `pages`, and `routes` files. Keep the named-component fallback only for Vite-style entrypoints.                                                                                                                            | Fixed locally; regression failed before the fix and passes after it.                                               |
| ING-29-09: palette-only source evidence overstated Design DNA confidence             | Ingest source containing only `bg-emerald-900`. Palette detection succeeded even though no Design DNA color field could be inferred.                                                         | Confidence counted palette evidence as if it populated a Design DNA field.                                                      | Count confidence only for supported Design DNA fields and disclose inferred fields separately from required schema defaults.                                                                                                                                                          | Fixed locally; regression and official Vite/Next fixtures pass.                                                    |
| ING-29-10: Next catch-all route paths were malformed                                 | Ingest the shadcn v4 route files and inspect `/blocks/[...categories]` and `/docs/[[...slug]]`; previous output contained malformed `:...` parameters.                                       | Generic parameter normalization incorrectly rewrote bracketed catch-all syntax.                                                 | Preserve Next catch-all and optional catch-all route segments while continuing to normalize simple `[type]` parameters.                                                                                                                                                               | Fixed locally; route regression and 19-route upstream mapping pass.                                                |
| ING-29-11: a root Next page was labelled with its generic function name              | Ingest the official Next `app/page.tsx` starter; the imported screen was named `Page` even though it represents `/`.                                                                         | Root screen naming reused the implementation component name instead of the route's user-facing meaning.                         | Label the root route `Home` consistently in the manifest and screen graph.                                                                                                                                                                                                            | Fixed locally; regression failed before the fix and the external Next fixture passes.                              |
| ING-29-12: a `dark:` override was reported as the default visual mode                | Ingest a page with only `dark:bg-slate-950`; the importer reported dark despite no base-theme evidence.                                                                                      | Mode detection stripped variant prefixes and treated theme overrides as base classes.                                           | Ignore variant-prefixed class tokens when inferring the base visual mode; keep the result unknown when unprefixed evidence is absent.                                                                                                                                                 | Fixed locally; regression failed before the fix and passes after it.                                               |
| ING-29-13: CLI black-box tests timed out on cold subprocess startup                  | Run the CLI black-box suite on the Windows workspace while Vitest runs other files. Fresh `tsx` processes exceeded the generic five-second test timeout despite the command's 30-second cap. | The per-test harness timeout was shorter than the documented subprocess timeout and cold-start cost.                            | Set a 15-second timeout for the CLI black-box test file, which exercises fresh subprocess launches.                                                                                                                                                                                   | Fixed; 13 black-box tests pass.                                                                                    |
| ING-29-14: responsive Tailwind classes polluted base palette and curvature inference | Ingest a page whose only palette and rounding utilities are `dark:bg-emerald-950`, `hover:text-rose-600`, and `sm:rounded-none`; the importer reported emerald and non-default curvature.    | Palette and curvature regexes counted variant-prefixed utility classes even though visual-mode inference already excluded them. | Infer palette and curvature from unprefixed static utility tokens only; variant classes remain unsupported evidence.                                                                                                                                                                  | Fixed locally; regression failed before the fix and passes after it.                                               |
| ING-29-15: Next.js layout files were not associated with individual routes           | Ingest `app/layout.tsx`, `app/(workspace)/layout.tsx`, and `app/(workspace)/settings/page.tsx`; the global layout list did not tell callers which wrappers applied to each screen.           | Layout discovery collected file paths without matching directory ancestry to route entrypoints.                                 | Report applicable layout paths per `IngestedScreen`, ordered from outermost to innermost and preserving route-group directories; continue warning that the ProjectManifest tree does not compose them.                                                                                | Fixed locally; regression failed before the change and passes for root, nested, route-group, and unrelated routes. |
| ING-29-16: an isolated capitalized component was presented as an imported route      | Ingest only `src/Button.tsx` with a named `Button` export; the manifest contained a `/button` screen despite no supported router entrypoint.                                                 | A generic root-file fallback treated any capitalized TSX filename as a route, beyond the documented Vite and Next conventions.  | Restrict route recognition to supported Vite `App` and conventional Next.js route files; reject isolated helper/component files.                                                                                                                                                      | Fixed locally; regression failed before the change and passes after it.                                            |
| ING-29-17: the saved manifest lost the Next.js layout omission warning               | Ingest an App Router project with `app/layout.tsx`; CLI output warned about wrappers, but the saved manifest description omitted that caveat.                                                | Layout omission was recorded only in transient ingestion warnings and not in the persisted ProjectManifest.                     | Include the missing-layout caveat in the manifest description whenever Next.js layouts are found; verify the serialized CLI output.                                                                                                                                                   | Fixed locally; regression failed before the change and passes after it.                                            |

## Verification evidence

- `pnpm install --frozen-lockfile` passed in the Step 29 baseline run. No
  dependency was added for these importer corrections or fixture checks.
- Focused ingestion and CLI coverage now totals 53 tests across four files,
  including the packaged CLI, safe patch emission, route mapping, default DNA
  disclosure, dynamic routes, and output path protection.
- `pnpm test`: 977 tests passed across 67 files on the clean isolated rerun.
- `pnpm typecheck`: passed across all workspace applications and packages.
- `pnpm lint`: passed with zero errors and 43 existing warnings, all outside the
  ingestion package.
- `pnpm audit:all`: all 16 release gates passed. It rebuilt the 324-resource
  catalogue and 717 Astro pages, passed bundle budgets and licence/provenance
  checks, and reported zero security/secret violations. Vite emitted its raw
  chunk-size advisory; measured gzip bundles stayed within the enforced budgets.
- `pnpm test:e2e`: 253 passed, 94 skipped, zero failed. Breakdown: main Chromium
  205/67, Sites Worker Chromium 45/27, and standalone preview app 3/0. The Worker
  test rendered all 324 resources at every configured certified width. Playwright
  emitted a non-fatal `NO_COLOR`/`FORCE_COLOR` environment warning.
- The E2E run predates the final `packages/ingest` variant-aware DNA inference
  correction. This Beta package is not shipped in the public Site or Workbench
  browser bundles; after this importer-only change, the full unit suite, typecheck,
  lint, and `audit:all` were rerun. E2E does not exercise CLI ingestion.

### External fixture runs

Machine-readable versions, commits, route assertions, browser results, and
screenshots are recorded in `quality/evidence/step-29/upstream-fixtures.json`.

- **Vite:** `vitejs/vite` commit
  `467f7ac3b8c7cca0b33290e7fd86f3fc79ce92cb`, official
  `create-vite/template-react-ts`. The packaged CLI ingested the untouched
  starter, and only inferred the root route; product archetype remained unknown,
  navigation unspecified, and required DNA defaults were disclosed. The harness
  added a test CSS rule, then changed one exact static JSX `className` through the
  safe patch path and applied its Git-checked diff. A clean offline install,
  production build, 1440×900 and 390×844 Chromium checks, keyboard counter action,
  visual before/after comparison, and zero-error/network checks passed. Vite
  resolved to 8.3.4 and React 19.3.1. Evidence: `quality/scripts/step-29-upstream-vite-roundtrip.ts`
  and `quality/evidence/step-29/upstream-vite/`.
- **Next.js:** `vercel/next.js` commit
  `3b1cc0b0d9cb1a4836b69caf6b0b59ed2c668852`, official App Router
  `examples/hello-world`. Ingestion left the route source unchanged and emitted
  `/` as `Home`, unknown product intent, unspecified navigation, and a DNA-default
  disclosure. The AST result associates `app/layout.tsx` with the root route. An
  isolated install, production build, real 1440×900/390×844 Chromium smoke,
  heading assertion, and zero-error/network checks passed. The
  fixture resolved Next 16.4.2 and React 18.3.1. Evidence:
  `quality/scripts/step-29-upstream-next-roundtrip.ts` and
  `quality/evidence/step-29/upstream-next/`.
- **shadcn:** `shadcn-ui/ui` commit
  `ba1503c64472b82256d9de95e2e62c5901a38e8b`, `apps/v4`. The mapper processed
  3,504 source files and found 19 routes, including `/charts/:type`,
  `/blocks/[...categories]`, and `/docs/[[...slug]]`. It retained unknown product
  intent, unspecified navigation, and disclosed DNA defaults. It associated all
  11 discovered layout files with applicable routes, including grouped
  `/examples/dashboard` and nested `/preview/typeset/:name`; those wrappers remain
  outside the persisted manifest tree. A frozen install
  of 1,673 packages and the upstream registry generator completed. The default
  Turbopack build failed to resolve `shadcn/tailwind.css` even though its declared
  `dist/tailwind.css` target existed. A Webpack build succeeded after setting a
  6 GB Node heap and generated 812 static pages, with dependency-analysis
  warnings. Chromium loaded `/`, `/examples/dashboard`, and
  `/view/new-york-v4/dashboard-01` at 1440×900; the root also rendered at
  390×844 without document-level overflow or uncaught exceptions. The local
  runtime made three recorded 404 requests to Vercel's host-provided
  `/_vercel/insights/script.js`; no other requests failed. The mobile hero demo
  strip is 546px wide and cropped by its 390px overflow-hidden container. These
  host/build and source-layout observations are recorded separately from
  Tessellate importer defects. Mapping evidence is in
  `quality/scripts/step-29-upstream-shadcn-map.ts` and
  `quality/evidence/step-29/upstream-shadcn/mapping.json`; browser evidence is in
  `quality/scripts/step-29-upstream-shadcn-smoke.ts` and
  `quality/evidence/step-29/upstream-shadcn/`.

### External fixture observations, not Tessellate defects

- **SHADCN-RUNTIME-01:** the pinned V4 app's default Turbopack build cannot
  resolve its generated `shadcn/tailwind.css` workspace export, despite the
  package target existing. Webpack compiles it with a 6 GB Node heap, but the
  repository's default build path is still degraded in this Windows environment.
- **SHADCN-RUNTIME-02:** local `next start` returns 404 for Vercel's injected
  Analytics script on each inspected route. Every failure is captured in
  `browser.json`; there were zero other failed requests. A Vercel-hosted run is
  needed to verify that deployment-provided integration.
- **SHADCN-VISUAL-01:** at 390px, the home-page demo strip has 546px of content
  inside an `overflow-hidden` 390px container. The document does not overflow,
  but the preview is visibly cropped. This behavior belongs to the upstream
  fixture and was not changed in Tessellate.

The upstream browser runs validate the bounded importer and one safe visual
patch. They do not prove that all imported props, CSS, layouts, bindings, or
business logic can be reconstructed and round-tripped.

## Remaining work before Step 29 can close

- Decide and validate how route layout wrappers enter a persisted project.
  Layout paths are associated per route in `IngestionResult`; the manifest still
  does not compose those wrappers, so downstream composition/export must not
  imply that it has preserved their behavior.
- Define and test how route source, props, data bindings, CSS modules, inline and
  dynamic styles are represented. The importer must preserve the distinction
  between structural evidence and un-inferred behavior.
- Expand end-to-end patch verification beyond static `className`: import and
  closure boundaries, hook/context usage, conditional rendering, and server/client
  boundaries must remain intact in clean external fixtures. Existing syntax-level
  preservation tests are not a substitute for full project round trips.
- Keep unsupported routers and arbitrary source edits explicitly unsupported;
  do not claim general ingestion or patch fidelity until the fixture corpus proves
  it.
- After those cases pass, refresh this evidence and the machine-readable record,
  rerun the required checks, and then mark Step 29 complete.
