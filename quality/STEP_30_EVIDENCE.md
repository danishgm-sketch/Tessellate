# Step 30 — Registry contribution gate

Captured 2026-10-19 on `consolidation/product-hardening`. The registry gate is
named an **8-Check Static Contribution Gate** in the CLI and Markdown report.
It remains Beta: a clean static report means “ready for human review,” not
runtime approval or proof that a resource is safe to execute.

## Changes

- Reports derive the check count from the executed checks and name the actual
  eight checks. Success copy says static checks passed and requires human review
  and runtime certification.
- Source review recursively scans nested TypeScript, JavaScript, JSX, TSX and
  CSS files. It excludes only recognized support-file suffixes/directories;
  names such as `contest.tsx` remain in the review. Symlinks, unreadable paths,
  non-directory roots, and sources over the bounded scan limits fail review.
- Security patterns cover dynamic code execution, raw HTML sinks, inline or
  remote scripts, outbound requests and remote assets, unsafe iframe privileges,
  host environment/cookie access, credential-like browser storage and likely
  hardcoded secrets. This is a pattern scan; the preview host still owns runtime
  isolation.
- Bundle review considers both imported and manifest-declared dependencies,
  checks the runtime-dependency cap, and accounts for skipped oversized source
  when enforcing the 50 KB source budget.
- CSS and utility-class motion are checked for reduced-motion fallbacks.
  Accessibility pattern failures are blocking, while the report says that
  static checks do not replace Axe, keyboard or screen-reader testing.
- License/provenance checks compare approved SPDX identifiers to display names,
  require declared redistribution verification and source details for derivative
  or open-source resources, and reject blank creator metadata. These declarations
  remain self-attested; the gate does not verify ownership or source URLs.

## Adversarial regressions

`packages/registry-gate/src/__tests__/registry-gate.test.ts` now has 18 focused
cases. The fixtures cover the existing valid Button resource; nested outbound
requests hidden in a test-named file; misleading runtime filenames; unsafe
iframes and credential reads; inline script and DOM HTML injection; eval and
`dangerouslySetInnerHTML`; clickable non-semantic controls; missing and
contradictory license metadata; imported/declared heavy packages; the runtime
dependency boundary; the 50 KB source boundary; unhandled CSS motion; rigid
widths; malformed manifests; a non-directory input; and oversized source.
The new regression cases were run before their fixes and failed for the direct
HTML sink, `contest.tsx` exclusion, and non-directory crash; they pass after the
fixes.

## Catalogue results

The complete static audit examined all 324 canonical resources. It accepted 104
and rejected or sent 220 for review. The check results were:

- schema: 324 pass;
- token hygiene: 6 pass, 232 warn, 86 fail;
- accessibility patterns: 192 pass, 132 fail;
- responsive signals: 298 pass, 25 warn, 1 fail;
- reduced motion: 234 pass, 90 fail;
- source safety, dependency/source budget, and declared license/provenance: 324
  pass each.

For the 40 Gold runtime resources, it accepted 13 and rejected or sent 27 for
review. Token hygiene reported 1 pass, 27 warnings and 12 failures;
accessibility reported 24 pass and 16 failures; responsive signals reported 39
pass and 1 warning; reduced motion reported 28 pass and 12 failures. Schema,
source safety, bundle budget, and declared license/provenance passed for all 40.

These counts overlap by resource. They expose existing catalogue work, not
runtime certification. The Gold audit found concrete accessibility, token and
reduced-motion items that must be resolved in their ordered resource and
accessibility gates; “Gold” metadata alone is not an approval. Machine-readable
details are in [`canonical-resource-gate.json`](evidence/step-30/canonical-resource-gate.json)
and [`gold-resource-gate.json`](evidence/step-30/gold-resource-gate.json).

## Verification and limits

The focused registry-gate suite passes 18/18 tests. The full suite passes
989/989 across 67 files; workspace typecheck passes; ESLint passes with 33
existing warnings under its limit of 51; targeted Prettier passes. `pnpm
audit:all` passes, including the 16/16 behavioral release gate, 717-page Astro
build, Sites Worker build, bundle budgets, 324-resource licence/provenance audit
and security/secrets audit. Machine-readable results are in
[`verification.json`](evidence/step-30/verification.json).

The gate does not build or execute submitted resources, run Axe, verify actual
browser behavior, or independently validate legal ownership. Regex checks can
miss obfuscated behavior and can flag benign examples. Resource acceptance
therefore remains a static screening result followed by human and runtime review.
