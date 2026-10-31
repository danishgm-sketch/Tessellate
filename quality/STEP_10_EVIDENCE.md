# Step 10 — Screen Planner evidence

Status: local benchmark and integration gate passed. Public Site verification is
still pending the public RC phase; this step changes deterministic graph output,
not browser UI.

## Defects established before the fix

- **P1 — interpreter recommendations were discarded.** The new no-override
  benchmark initially showed that 99 of 100 ProductModels lost at least one
  recommended screen. Reproduction: run the 100-brief interpreter benchmark,
  pass each ProductModel to `planScreenGraph`, then compare planned screen names
  with `likelyScreens`. The planner reconstructed a fixed dashboard, entity
  index, detail, settings, auth and optional docs outline; it only copied a few
  employee screens by name. This removed real product jobs such as prompt
  history, research dossiers, candidate profiles and reports.
- **P1 — billing was inferred from broad archetypes.** SaaS and fintech tags
  automatically caused billing screens, even when the brief described a free
  workspace or a financial analysis tool. The SaaS archetype's default billing
  workflow was also copied into every interpreted product.
- **P1 — graph routes and navigation did not represent the planned pages.** The
  old graph used a handful of hard-coded edges, leaving recommendation-driven
  pages unreachable. The manifest then put every instantiated screen in primary
  navigation, including secondary and hidden routes.
- **P2 — screen plans had no device relevance contract.** Target devices existed
  on ProductModel but were not carried to ScreenNode. Route uniqueness was not
  checked for generated graphs.
- **P1 — regenerated showcase builds exposed missing runtime role mappings.**
  The new domain-correct checkout screens reached `order-summary` and
  `payment-fields` roles that the composition adapter could not resolve, and
  the archetype labelled order confirmation as a support screen. The production
  build failed instead of producing a coherent showcase.
- **P2 — release-gate replacement selected an unreplaceable node.** Gate 11
  always chose the first resource node, which could have no compatible Gold
  alternative even though later nodes did. It reported replacement as broken
  without trying a replaceable node.

## Remediation

- `packages/composer/src/planner.ts` now creates screens from the ProductModel's
  recommendation records, preserving names, classes, purposes, jobs and required
  flags. It derives routes from screen/domain semantics, expected data from the
  matching ProductModel entities, groups through the declared screen grammar,
  validates unsupported grammars, and connects all visible routes from the
  public or application entry. Existing recommendation-free models receive a
  small objective/entity-led fallback.
- Monetization is conditional on explicit billing/subscription/pricing intent.
  The interpreter no longer injects its default SaaS billing workflow or billing
  recommendation into an unrelated product. Payment and checkout flows remain
  independent of product billing.
- Mobile-targeted products with high mobile importance or navigation complexity
  keep at most five primary destinations; other recommended routes remain
  available in secondary navigation. Each generated ScreenNode records the
  ProductModel target devices. The additive schema field is optional so older
  serialized graphs continue to parse.
- `composeProjectForDirection` now maps primary, secondary and hidden graph
  visibility to the matching manifest navigation lists.
- Legacy golden expectations that required generic pages were updated to assert
  the archetype-recommended screen IDs instead.
- The ecommerce order-confirmation archetype now uses the existing detail
  grammar. Existing Gold resources map to checkout roles: an example order
  summary table and a disabled payment field with a truthful provider-required
  explanation. No payment is collected or stored. The 324-resource catalogue
  and Gold 40 target are unchanged.
- Release-gate Gate 11 now inspects composed resource nodes and exercises the
  first node with a real compatible replacement; it still fails if no node in
  the project is replaceable.

## Regression evidence

`packages/composer/src/__tests__/screen-planning-benchmark.test.ts` exercises all
100 adjudicated briefs for recommendation coverage, exact semantic fields,
required flags, target devices, route uniqueness, graph reachability and
contamination. Additional cases cover mobile navigation, no-screen fallback,
unknown grammars, non-commercial billing and the flagship employee model.
`packages/compatibility/src/__tests__/compose-pipeline.test.ts` checks that
manifest navigation matches graph visibility. `packages/schemas/src/__tests__/schemas.test.ts`
checks duplicate-route rejection while retaining the old graph round-trip case.

The original benchmark run had 3 failing checks among 4 planner cases
(recommendation coverage, employee reachability, and false billing). The
corrected focused run passed **94 tests across five files**:

```text
pnpm exec vitest run packages/composer/src/__tests__/screen-planning-benchmark.test.ts packages/composer/src/__tests__/composer.test.ts packages/compatibility/src/__tests__/compose-pipeline.test.ts packages/renderer/src/__tests__/renderer.test.tsx packages/schemas/src/__tests__/schemas.test.ts
Test Files  5 passed (5)
Tests       94 passed (94)
```

Repository checks after the root-cause fixes: `pnpm typecheck` passed;
`pnpm lint` passed with zero errors and 51 existing warnings; and `pnpm test`
passed 744 tests across 59 files. The release-gate audit initially failed
because its replacement probe chose a one-candidate header node. After fixing
the probe, `pnpm audit:release-gate` passed all 16 criteria and replaced an
actual `activity-feed` resource with the compatible Gold `timeline` resource.
`pnpm test:e2e` passed: 104 main tests (56 explicitly skipped by configuration),
28 Sites Worker tests, and 3 standalone preview-app tests. The Sites Worker
suite included all 324 catalogue resources at seven certified widths, all Gold
variants, and preview isolation. `pnpm audit:all` passed all 16 release-gate
checks, rebuilt 717 Astro pages, and passed bundle budgets, provenance/licence
checks (324 resources), and secrets/security checks (zero violations).
`pnpm typecheck` and `pnpm lint` were rerun after the test-harness correction;
typecheck passed and lint had zero errors with 51 existing warnings. The full
`pnpm test` suite passed 744 tests across 59 files.

Step 10 is complete for local planner semantics and graph integration. The
100-brief benchmark does not certify visual composition, responsive rendering,
or deployed behavior; those remain open for the Compose UX and public RC gates.
No public Site verification was performed in this step; the current review Site
remains unchanged until the public RC phase. Build output still contains a Vite
advisory that the preview client chunk is 895.66 KB raw (189.67 KB gzip); the
configured bundle-budget audit passes its measured gzip targets.
