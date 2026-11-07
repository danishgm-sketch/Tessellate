# Step 15 — Compose UX evidence

## Scope and result

Compose was audited through the built Astro production preview at 1440 × 900 and
390 × 844. The checks exercised catalogue loading and retry, empty and
whitespace-only input, valid sample selection, edits made after composition,
keyboard operation of ambition/creativity/device controls, last-device
protection, long briefs, repeated submission, and mobile overflow. The visible
page was captured before and after each relevant fix.

Five user-facing defects were reproduced and fixed locally:

| Finding                                                                             | Before                                                                                                                                                                                          | Fix                                                                                                                           |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| AUD-143 — whitespace-only briefs passed validation and generated directions.        | The browser treated whitespace as non-empty; the result could contain generic architecture for an empty brief. The red browser check found no alert and found direction cards after submission. | Trim and validate before composing, focus the description, announce the error, and associate it with the field.               |
| AUD-144 — edited briefs or design settings left old directions available.           | Changing the brief kept the previous architecture and direction cards visible, allowing the user to open a project that did not match the form.                                                 | Compare the composed input snapshot with current controls, hide stale directions, and explain that recomposition is required. |
| AUD-145 — selected ambition and creativity controls had no semantic selected state. | The active stop was shown by color only; keyboard and screen-reader users received no pressed state.                                                                                            | Put each set in a named group and expose the selected state with `aria-pressed`.                                              |
| AUD-146 — removing the last target device looked enabled but did nothing.           | The handler refused an empty device list without explaining why; the active styling made the no-op misleading.                                                                                  | Disable the final selected device and announce that at least one target must remain.                                          |
| AUD-147 — choosing a valid sample brief left an earlier validation error visible.   | After an empty submission, selecting “Playful HR Platform” updated the brief but left the old alert and invalid field state in place.                                                           | Clear the validation error when a valid sample brief is selected.                                                             |

The error path is deliberately visible and recoverable. A controlled test aborts
the first `/data/catalog.json` request: Compose shows the unavailable state,
keeps submission disabled, and loads the catalogue successfully after Retry.
The browser reports the deliberately aborted request as `net::ERR_FAILED`; this
is recorded as an injected fault, not counted as an unexpected runtime error.

## Browser evidence

The final production-preview run passed 16 browser tests across the 1440 × 900
desktop project and the 390 × 844 mobile project. Each report records the final
URL, viewport, console messages, uncaught exceptions, failed requests, HTTP
responses, and response statuses. There were 448 successful HTTP 200 responses,
zero HTTP errors, zero console warnings, and zero uncaught exceptions. The only
two failed requests and console errors were the deliberate catalogue aborts;
all other runs had zero console errors and zero failed requests. No horizontal
overflow was detected at 390px. The selected Visual Ambition and Structural
Creativity stops matched both their accessible pressed state and computed
selected styling after a sample brief loaded. The 9,920-character
repeated-submit case produced exactly three directions.

The earlier red run failed the visible assertions for whitespace rejection,
stale-result hiding after brief and Visual Ambition edits, selected-state
semantics, and disabling the last target. The sample-brief test was also run
red on the old behavior: its alert remained visible after selecting a valid
sample. All five findings pass after the fixes; the final suite covers eight
cases across desktop and mobile. Before/after captures are under
`quality/evidence/step-15/{before,after}/`; per-test runtime records and the
aggregate are under `quality/evidence/step-15/after/runtime/` and
`quality/evidence/step-15/after/runtime-summary.json`.

The before and after desktop captures were visually inspected for the invalid
brief and stale-direction cases. The mobile controls capture confirms that the
advanced device options wrap within the viewport and the explanatory state is
readable. Screenshots preserve the product's existing layout and styling; this
step makes control state and generated output truthful without changing the
design direction.

## Validation

- `pnpm exec playwright test tests/e2e/compose-ux-hardening.spec.ts`: 16 passed.
- `pnpm test`: 63 files, 909 tests passed.
- `pnpm typecheck`: all 22 workspace projects passed.
- `pnpm lint`: 0 errors; 51 pre-existing warnings. The changed source and test
  file pass targeted ESLint without warnings.
- `pnpm audit:all`: all 16 release gates passed; production build completed;
  public, catalogue, and Workbench bundle budgets passed; 324 resources passed
  licence/provenance checks; secret and isolation audits reported zero
  violations.
- `pnpm --filter @tessellate/site build`: 717 static pages built.

These results are local production-preview evidence. They do not claim that the
current public review Site has been re-deployed or verified. Findings remain
awaiting the deployed audit at Step 45.

The application fix and browser regressions are committed as
`37d9acacc343f71a51af68fa8728fc372c2f51c6`.
