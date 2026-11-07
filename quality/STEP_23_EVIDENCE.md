# Step 23 — React/Vite standalone export

Step 23 tested every direction in the 100-brief composition-quality benchmark.
For each of the 300 manifests, the runner validates the manifest, generates the
standalone source tree, checks for private Tessellate runtime dependencies,
round-trips the ZIP byte-for-byte, and extracts it into a fresh OS temporary
directory outside the repository. It installs dependencies from the exported
`package.json`, builds with `pnpm build`, starts `vite preview`, and opens the
app in Chromium at 1440 × 900 and 390 × 844. The browser switches through every
manifest screen, verifies the active screen ID and each resource node, checks
for unresolved-resource placeholders and mobile document overflow, and records
console and request failures.

All 300 clean installs and builds passed. All 300 desktop and mobile browser
runs passed. ZIP extraction preserved every generated file exactly, no export
declared an `@tessellate/*` dependency, and the run recorded zero console errors
or warnings, uncaught exceptions, failed requests, or HTTP errors. Per-project
results are in
[`benchmark-standalone-runtime.json`](evidence/step-23/benchmark-standalone-runtime.json);
the repeatable harness is `quality/export/benchmark-standalone-runtime.ts`.

The adversarial copy regression found one Core export defect. Header, KPI,
action, and status semantic roles inserted authored text directly into TSX.
Quotes broke generated JSX attributes, while `<` in visible copy broke JSX
parsing. The saved [before build log](evidence/step-23/before/user-authored-semantic-copy-clean-build.log)
records the failing clean build (`TS1003`, `TS1382`, and `TS1002`). The generator
now serializes user values as JavaScript string expressions in JSX attributes
and children, so React renders the content literally. A clean install/build and
visible browser regression verifies apostrophes, double quotes, angle brackets,
ampersands, and a non-injected script element at desktop and mobile sizes. See
the [runtime report](evidence/step-23/after/user-authored-semantic-copy-runtime.json),
[desktop screenshot](evidence/step-23/after/user-authored-semantic-copy-desktop-1440.png),
and [mobile screenshot](evidence/step-23/after/user-authored-semantic-copy-mobile-390.png).
This finding is AUD-165.

Repository validation passed after the fix:

- `pnpm test`: 917 tests passed across 63 files.
- `pnpm typecheck`: all 22 workspace packages passed.
- `pnpm lint`: zero errors; the existing 51-warning allowance was unchanged.
- `pnpm audit:all`: all 16 behavioral gates, production build of 717 Astro
  pages, bundle budgets, 324 provenance/licence checks, and zero security/secret
  violations passed.
- `pnpm test:e2e`: 203 main browser checks passed and 67 were explicitly
  skipped; 45 Sites Worker checks passed and 27 were explicitly skipped; all 3
  preview-app browser checks passed. The Sites Worker matrix exercised all 324
  resources.

The feature matrix marks only directly evidenced dimensions as PASS. Keyboard,
screen-reader, tablet, reduced-motion, high-contrast, offline, performance, and
other untested dimensions remain FAIL. Public review-site verification remains
pending for Step 45.
