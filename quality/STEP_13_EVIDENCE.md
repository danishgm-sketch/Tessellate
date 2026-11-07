# Step 13 — Compatibility and candidate selection evidence

## Scope and result

Compatibility must be fail-closed before score ranking. A resource can be considered
for Core composition or replacement only when it belongs to the certified Gold 40
and declares all three variants used by directions A/B/C. The resolver now passes
the full ProductModel constraints to the evaluator, and the evaluator enforces
dependency allowlists, licence allowlists, accessibility, performance, mobile
strategy, archetype avoidance, and relationship conflicts.

## Defects and remediation

### COM-001 — Any catalog resource was treated as Core-runtime capable (P1)

- **Evidence:** the first regression expected `experimental-hero` to be rejected even
  when caller flags claimed runtime and export support. It failed because
  `isResourceCompositionCapable` returned `true` for every non-empty slug. A second
  check confirmed that `isResourceComposerEligible` admitted non-Gold catalog entries.
- **Reproduction:** call `isResourceComposerEligible` with a manifest cloned from a
  real resource, then change its slug to `experimental-hero` while retaining declared
  variants. Before the fix, the resource remained eligible for composition and Replace.
- **Root cause:** the capability helper was a stub and did not consult the Gold
  runtime registry allowlist.
- **Affected code:** `packages/compatibility/src/capabilities.ts`.
- **Fix:** require Gold membership; explicit `runtimeRenderable: false` or
  `browserExportable: false` hints also reject a candidate. This is the Core gate
  shared by composition and replacement.
- **Verification:** the candidate regression and Workbench replacement-candidate
  regression pass. The all-archetype composition invariant also verifies every
  composed reference is Core-eligible.

### COM-002 — Gold candidates could be missing a generated direction variant (P1)

- **Evidence:** eligibility previously required only a non-empty variant list, while
  the direction pipeline assigns `quiet`, `expressive`, and `nocturne` variants.
- **Reproduction:** keep a Gold slug but remove its Expressive and Nocturne variants;
  the previous eligibility check still accepted it.
- **Root cause:** candidate eligibility did not verify the variant contract used by
  the three-direction composer.
- **Affected code:** `packages/compatibility/src/capabilities.ts`.
- **Fix:** require all three generated direction variants before a Gold resource can
  be used by Core composition or replacement.
- **Verification:** every one of the 40 loaded Gold manifests is checked for all
  three variants; a quiet-only resource is rejected.

### COM-003 — Project dependency policy was skipped during composition (P1)

- **Evidence:** a browser-facing composition regression supplied an otherwise valid
  `editorial-hero` that declared `unapproved-ui-kit`. The interpreted project allowed
  only React, Tailwind and Lucide. Before the fix, the composed manifest still
  selected the hero.
- **Reproduction:** compose a marketing-site brief against a catalog containing the
  modified Gold hero and the real Gold top navigation, then inspect Direction A's
  resource references.
- **Root cause:** the resolver passed selected constraint fields individually and
  omitted `allowedDependencies` and `prohibitedDependencies`; the evaluator also did
  not enforce `allowedDependencies` when provided.
- **Affected code:** `packages/compatibility/src/compose-pipeline.ts`,
  `packages/compatibility/src/hard-constraints.ts`.
- **Fix:** pass the complete `ProductModel.constraints` object into hard-constraint
  evaluation and reject every declared dependency outside a configured allowlist.
  Prohibited-package comparisons now trim and normalize case.
- **Verification:** the regression fails before remediation and passes afterward;
  direct tests cover both explicit allowlists and the visible composition pipeline.

### COM-004 — A license allowlist accepted missing license metadata (P1)

- **Evidence:** an otherwise valid resource with its `license` field removed passed
  `licenseAllowlist: ['MIT']` before the fix.
- **Reproduction:** call `evaluateHardConstraints` with the incomplete manifest and a
  non-empty allowlist.
- **Root cause:** the allowlist check only ran when a resource SPDX value was
  truthy, so missing data bypassed the check.
- **Affected code:** `packages/compatibility/src/hard-constraints.ts`.
- **Fix:** missing SPDX metadata now fails closed whenever a non-empty allowlist is
  active; SPDX comparisons are trimmed and case-insensitive.
- **Verification:** the regression records the exact rejection reason and passes.

### COM-005 — High media cost passed the balanced ceiling (P2)

- **Evidence:** a resource with low JavaScript/GPU cost and high media cost passed
  the balanced performance ceiling.
- **Reproduction:** evaluate the resource against `performanceCeiling: 'balanced'`.
- **Root cause:** the balanced branch checked JavaScript and GPU cost but omitted
  media cost.
- **Affected code:** `packages/compatibility/src/hard-constraints.ts`.
- **Fix:** lightweight and balanced ceilings now evaluate JavaScript, GPU and media
  cost together; unknown cost values fail closed. Balanced permits through Medium.
- **Verification:** the media-only high-cost regression passes after the fix, and
  existing lightweight/high-cost cases remain green.

### COM-006 — An irrelevant breakpoint falsely satisfied mobile compatibility (P1)

- **Evidence:** a resource verified only at 768px and 1440px, with a 320px breakpoint,
  passed the mobile constraint even though that breakpoint does not apply to the
  supported 360px floor.
- **Reproduction:** evaluate the manifest with `targetDevices: ['mobile']` and inspect
  the hard-constraint result.
- **Root cause:** any non-empty breakpoint list was treated as mobile adaptation,
  regardless of whether its maximum width could apply at supported mobile sizes.
- **Affected code:** `packages/compatibility/src/hard-constraints.ts`.
- **Fix:** only a breakpoint at 360px or wider can satisfy the declared mobile
  strategy check; a verified width at or below 480px remains sufficient.
- **Verification:** the 320px breakpoint regression failed before the fix and passes
  afterward.

## Contract coverage

- Semantic role retrieval remains constrained by `ROLE_RESOURCES` where a role has
  an explicit resource contract; unknown roles use declared resource roles/tags.
- Core candidate selection and Workbench Replace share the same eligibility gate.
- Accessibility floors, lightweight/balanced performance, mobile behavior, archetype
  avoidance, forbidden relationships, DNA distance and contextual scoring retain
  their existing direct regression coverage.
- The replacement candidate regression verifies an unverified resource is not
  offered even when its declared role matches the selected node.

## Checks

- **Regression proof:** the Gold eligibility, missing-licence, balanced media-cost,
  dependency allowlist, mobile breakpoint and visible composition tests failed before
  their respective fixes. The 10 focused candidate regressions, 3 fail-closed hard
  constraint tests, 5 replacement tests and 5 composition pipeline tests now pass.
- **Unit/integration:** `pnpm test` — 798 passed across 62 files.
- **TypeScript:** `pnpm typecheck` — all 22 workspace projects passed after the
  regression fixture was corrected to preserve the schema's literal cost types.
- **Lint:** `pnpm lint` — 0 errors, 51 existing warnings.
- **Release gate and production build:** `pnpm audit:all` — all 16 behavioral gates
  passed; Astro built 717 pages; all bundle budgets, 324-resource licence/provenance,
  and security/secret audits passed. The separate preview bundle retains its existing
  Vite advisory for a minified chunk above 500 KB; the configured public, catalogue
  and Workbench budgets all passed.
- **Browser release suite:** `pnpm test:e2e` — desktop/mobile Chromium: 106 passed,
  58 explicitly skipped by the configured project matrix; local Sites Worker: 28
  passed, including all 324 resources across certified widths and the Gold variant,
  interaction, keyboard, reduced-motion and isolation checks; standalone preview: 3
  passed. The employee acceptance workflow and mobile Compose-to-Workbench journey
  passed. These browser tests exercise the locally built runtime; public review Site
  verification remains scheduled for Step 45.
- **Hosted CI:** both `validate` workflows and the 16-point quality/security workflow
  passed for `1d1951f347b403ade6b25aea085a317a54d81fc9`. See [validate run 39117954315](https://github.com/danishgm-sketch/Tessellate/actions/runs/39117954315), [validate run 39117951397](https://github.com/danishgm-sketch/Tessellate/actions/runs/39117951397), and [16-point audit 39117954323](https://github.com/danishgm-sketch/Tessellate/actions/runs/39117954323).

No public review-site re-verification is claimed in this step; it remains scheduled
for Step 45.
