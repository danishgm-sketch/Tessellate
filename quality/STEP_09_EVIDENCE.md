# Step 09 — Product interpretation

## Scope and method

`PRODUCT_INTERPRETATION_BENCHMARK.json` contains 100 manually reviewed briefs
spanning all 18 shipped archetypes. Every case calls `interpretProductBrief`
with its description only: no archetype override, audience, or objective is
passed. The set includes the exact 500-person employee-experience acceptance
brief. Expected primary and permissible secondary archetypes are recorded per
case. Semantic profiles check audience, objective, entities, workflows, and
screens; metric profiles check trust, data density, and transaction criticality;
forbidden phrases catch selected cross-domain contamination.

## Baseline findings

The first benchmark run passed 45 of 100 briefs and failed 55. The original
classifier had 27 primary-archetype mismatches. Forty-five cases also emitted
at least one unsupported secondary archetype. The dependent audience,
objective, entity, workflow, and screen checks failed when the wrong archetype
template was selected. Several metrics inherited generic SaaS blueprint values
instead of the selected archetype values. Operational “work order” and
procurement “purchase request” language could also trigger the fiscal
transaction heuristic.

The machine-readable before/after totals and check counts are in
`PRODUCT_INTERPRETATION_BENCHMARK_RESULTS.json`.

## Root causes and corrections

| Finding                                                                    | Root cause                                                                                                                                                       | Correction                                                                                                                                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specific product briefs classified as SaaS or another broad archetype      | Every keyword had roughly equal weight, so broad cues such as “workspace” could tie or outrank category-specific evidence; ties followed object insertion order. | Added high-information domain phrases for the existing 18 archetypes, retained broad terms as lower-weight support, and normalized hyphenated phrases before matching.        |
| Incidental terms appeared as secondary archetypes                          | Every detected match was returned among the top three and clamped to a minimum weight of 20.                                                                     | Emit a secondary only when it reaches 28 points and 45% of the leading score. The benchmark asserts the full allowed tag set per brief.                                       |
| Trust, collaboration, navigation, and mobile priors drifted to SaaS values | The interpreter read those ProductModel fields from a fallback SaaS blueprint even when the archetype had no dedicated blueprint.                                | Source metric priors and forbidden-pattern defaults from the selected archetype definition, using the blueprint only when the definition is absent.                           |
| Work orders/procurement were treated as financial transactions             | A bare “order”, “transaction”, or “purchase” substring raised fiscal criticality.                                                                                | Limit this heuristic to explicit checkout, payment, or money-transfer language. Archetype priors still express domain transaction criticality.                                |
| The flagship employee-experience brief failed its objective signal         | The people-operations specialization described the workflows but omitted the benchmark’s explicit “employee experience” objective term.                          | Make the specialized objective state the employee-experience outcome directly; the benchmark checks the specialized audience, objective, entities, workflows, and screen set. |

Affected implementation: `packages/composer/src/archetypes.ts`,
`packages/composer/src/interpreter.ts`, and
`packages/composer/src/domain-context.ts`. Regression coverage is in
`packages/composer/src/__tests__/product-interpretation-benchmark.test.ts`.

## Verification

- Before fixes, the 100-case suite failed 55 briefs.
- After fixes, all 101 tests pass: one benchmark-integrity test and 100
  no-override semantic cases.
- The entire Composer package test directory passes: 125 tests across four
  files.
- `pnpm --filter @tessellate/composer typecheck` passes.
- The full monorepo checks pass: `pnpm typecheck`, `pnpm lint` (0 errors, 51
  existing warnings), `pnpm test` (731 tests / 58 files), `pnpm audit:all`, and
  `pnpm build` (717 Astro pages).
- `pnpm test:e2e` passes: 104 desktop/mobile tests, 28 Sites Worker tests
  including the 324-resource and Gold-variant certification suites, and 3
  preview-app tests. Fifty-six tests are explicitly skipped by the current
  Playwright configuration; there are no failures.
- The exact employee-experience brief resolves through the existing
  recruitment/people-operations specialization and produces employee, team,
  and policy entities; onboarding, engagement, and policy workflows; and
  employee-focused screens. The profile’s forbidden finance, trading, market
  data, and telemetry terms are absent.

## Limits and remaining verification

The weights are deterministic ranking signals, not calibrated probabilities,
and the interpreter does not claim model-level semantic understanding. The
benchmark tests the authored domain cases and observable ProductModel output;
it is not a substitute for user research or broad natural-language fuzzing.
The code changes are locally verified. The deployed review Site is still v20,
so Compose browser verification must be repeated against the release candidate
before any deployed finding is closed.
