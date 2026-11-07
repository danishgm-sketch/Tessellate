# Step 26 — CLI hardening evidence

The CLI is now a self-contained Node executable built from the existing shared
packages. Its build bundles the validated catalogue and workspace implementation;
the installed package has no `@tessellate/*` runtime dependencies. The package
remains private. No public package was published; the local tarball install
verifies runtime portability while distribution licensing and registry setup
remain unresolved.

## Defects reproduced before changes

| Finding | Reproduction and observed result | Root cause | Remediation |
| --- | --- | --- | --- |
| CLI-26-01: composed manifests were empty | Run `tess compose <brief> --output project.json`, then inspect `screens`; result had zero screens and no resource refs although the command logged a non-zero screen plan. | CLI assembled a manifest with `screens: []` and bypassed the shared composition engine. | `runCompose` now invokes `composeProjectPipeline`, selects the default direction, embeds real catalogue refs, and refuses unresolved required roles. |
| CLI-26-02: invalid commands exited successfully | `tess validate invalid.json` and `tess export missing.json` printed errors but returned status 0. | Commander actions discarded command result objects. | A shared action wrapper maps invalid/failed results and thrown errors to process status 1. |
| CLI-26-03: an unavailable catalogue looked empty | Run `tess search button` from a clean project with a closed registry endpoint; it reported “Found 0” and returned 0. | Catalogue retrieval silently substituted a synthetic empty artifact and trusted parsed JSON. | Catalogue metadata and every resource now validate against canonical schemas; failure is explicit and returns non-zero. Packaged search uses the embedded validated catalogue offline. |
| CLI-26-04: malformed configuration silently changed behavior | Put malformed JSON in `tessellate.json`, then run `tess doctor`; the CLI reported defaults as if config had loaded. | `loadConfig` swallowed parse errors and returned defaults. | Config parse/type errors now include the path and stop the command; a missing config still uses defaults. |
| CLI-26-05: empty ingestion generated a false project | Run `tess ingest <empty-dir> --output imported.json`; it wrote an empty manifest and reported success. | Empty React source results were warned about but still serialized. | Ingestion now fails before writing when no `.tsx`/`.jsx` files are present. |
| CLI-26-06: resource category traversal escaped its output root | Run `tess create-resource --slug safe-check --category ..`; output resolved outside `resources/<category>`. | The category option was joined into a filesystem path without validation. | Categories must be simple lowercase identifiers, target containment is checked, and output directories are created only after schema validation. |
| CLI-26-07: unusual scaffold text could break generated TSX | Create a resource named `123 O'Brien Resource` with a description containing `*/`; generated identifiers, JSX string syntax and the block comment could be invalid or escape the comment. | User text was interpolated directly into identifiers, JSX string syntax and a block comment. | Component names are normalized to identifiers, JSX text uses JSON string encoding, and comment delimiters are neutralized. |

## Verification

Automated process tests are `packages/cli/src/__tests__/black-box.test.ts` and
`installed-package.test.ts`; the original function suite remains in
`cli.test.ts`. The installed-package runner builds, packs, and installs the CLI
from a local npm tarball into a path containing spaces under the system temp
directory, with `npm install --offline` and no repository `node_modules`. It then
exercises `init`, `search`, `view`, `add`, `compose`, `export`, `validate`, `lint`,
`ingest`, `gate`, `doctor`, and `create-resource`, plus `--help` and `--version`.
Checks assert the employee brief produces populated screens and actual resource
refs, then validates and exports the manifest.

Source process tests prove stable screen output for repeated identical briefs,
explicit non-zero statuses for invalid input and failed operations, and safe
handling of offline registry failures. Successful installed commands return no
stderr. Beta commands are marked `[Beta]` in help. Results are recorded in
`quality/evidence/step-26/installed-package-report.json`.

Final validation passed: the CLI suite (12 function tests, 12 black-box tests,
and one clean-package installation test), full `pnpm test` (65 files, 941 tests),
`pnpm typecheck`, `pnpm lint` (0 errors, 48 existing warnings), and
`pnpm audit:all` (all 16 release gates, production build, bundle budgets,
licence/provenance, and secret/security audits). The release-gate CLI smoke was
updated to use `src/bin.ts` after the entrypoint split and passes. Public registry
publication is not part of this step; the package remains private, and broader
linter, ingestion, and gate-quality claims remain under Steps 28–30.
