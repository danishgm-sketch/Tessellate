# Step 28 — Design DNA linter hardening evidence

## Scope and capability boundary

The Design DNA linter remains **Beta**. It is a static review aid for a small
set of source patterns. It is not an AST-aware design-system analyzer, a WCAG
conformance checker, or a substitute for rendered browser and assistive
technology testing. The package does not certify an application as accessible.

## Findings and fixes

| Finding                                                                                                 | Evidence and reproduction                                                                                                                                                                    | Root cause                                                                                                          | Remediation                                                                                                                                                                                                                                                                     | Status                                                           |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| LINT-28-01: comments produced actionable-looking findings                                               | Put `bg-[#2547E8]`, `p-[17px]`, or `animate-spin` only in a line or block comment and lint the source. The old scanners treated documentation examples as product code.                      | Rules scanned raw source text without excluding comments.                                                           | Added an offset-preserving JavaScript/TypeScript comment masker before rule evaluation. UTF-16 offsets are preserved, including when a non-BMP character precedes a finding.                                                                                                    | Fixed; regression tests pass.                                    |
| LINT-28-02: reduced-motion support in one element hid missing support elsewhere                         | Put an animation on one element and `motion-reduce:animate-none` on a different element. The file-wide fallback check suppressed the warning.                                                | Fallback detection was scoped to the file instead of the animated element.                                          | Scan each supported literal `class`/`className` value independently. A same-element `motion-reduce:animate-none` fallback or a `motion-safe:` animation is accepted. Computed expressions and CSS remain outside the check.                                                     | Fixed; regression tests pass.                                    |
| LINT-28-03: contrast regex mixed mutually exclusive theme colors                                        | Add a light foreground/background pair and a dark-variant override. The old text-pattern checks could combine colors that are never active together and used an incorrect AAA claim.         | Contrast was inferred from broad token-name sequences rather than active variant state and calculated color values. | Calculate only explicit hex and a documented subset of Tailwind gray palette pairs, respecting supported dark/light and state variants. The rule states its partial scope and 4.5:1 normal-text threshold. Unknown, inherited, composited, or ambiguous values are not guessed. | Fixed within declared static scope; benchmark regression passes. |
| LINT-28-04: landmark rule missed route-directory files and treated reusable `Page` components as routes | Lint a page under `src/routes/` and a reusable `src/components/Page.tsx`. The filename-only rule missed the route and could flag a component that does not own a page landmark.              | Page classification relied on a narrow filename pattern.                                                            | Use route-like directory segments and explicit page/layout/screen filenames, while excluding component directories from the filename heuristic. Copy no longer claims that the pattern proves WCAG conformance.                                                                 | Fixed within declared heuristic scope; regression tests pass.    |
| LINT-28-05: color auto-fix guessed semantic roles                                                       | Run `tess lint --fix` on authored brand foreground, background, and border colors. The previous fixer rewrote them to generic surface/ink/hairline values without knowing the intended role. | A syntactic color utility was treated as enough context to infer product semantics.                                 | Color findings are review-only; no replacement is offered. The CLI black-box test verifies authored colors remain unchanged.                                                                                                                                                    | Fixed; regression tests pass.                                    |
| LINT-28-06: spacing auto-fix could erase small spacing or make large layout guesses                     | Lint `mb-[1px]` and `p-[17px]` with `--fix`. Rounding the first to the nearest four-pixel value produced zero; the old rule also offered larger guesses without knowing the layout.          | Nearest-grid rounding was treated as a safe semantic transformation.                                                | Offer a fix only when the nearest non-zero four-pixel value is at most one pixel away. `p-[17px]` can become `p-[16px]`; `mb-[1px]` and larger deviations require human review.                                                                                                 | Fixed; syntax and CLI regressions pass.                          |
| LINT-28-07: rule descriptions and empty reports implied certification                                   | Run a clean file and inspect rule descriptions and the summary. Previous copy claimed accessibility/design-system checks all passed, including checks the linter does not perform.           | Marketing-level claims exceeded the static implementation.                                                          | Describe each rule's supported scope and exclusions. Empty results now mean no finding from current heuristics, and explicitly retain the need for rendered contrast, keyboard and assistive-technology review. CLI help and docs label the linter Beta.                        | Fixed; copy and behavior regression tests pass.                  |

## Evaluation evidence

The declared, manually adjudicated fixture set is in
`quality/linter-benchmark-cases.json`. The machine report is
`quality/evidence/step-28/after/linter-benchmark-report.json` and can be
recreated with:

```powershell
pnpm exec tsx quality/scripts/evaluate-linter-benchmark.ts
```

The set contains 20 included static cases and three excluded cases for inline
CSS, opacity compositing, and computed class expressions. On the included
cases, the report records 10 true positives, 10 true negatives, zero false
positives, and zero false negatives. This small authored panel is not
representative of arbitrary external codebases and is not a general accuracy
claim.

The production source scan is recorded in
`quality/evidence/step-28/after/linter-corpus-report.json`. It scanned 1,095
files across the public site, preview, Workbench and canonical resources and
reported 3,677 warnings: 3,658 arbitrary-color-class reviews, 18
reduced-motion reviews, and one spacing review. It reported zero errors and
offered zero automatic fixes. The before snapshot is in
`quality/evidence/step-28/before/linter-corpus-report.json`; the warning count
is unchanged because the fixes target false-positive contexts, unsafe edits,
and overclaiming rather than suppressing authored color-review findings. A
human-selected sample of the source findings was inspected; this source scan
does not establish precision/recall for all 1,095 files.

The generated spacing fixture in
`quality/evidence/step-28/after/autofix-fixture.tsx` was syntax-checked with
TypeScript's `transpileModule` diagnostics in the linter regression and with:

```powershell
pnpm exec tsc --noEmit --jsx react-jsx --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck quality/evidence/step-28/after/autofix-fixture.tsx
```

## Verification

- Linter and CLI regression tests: 32 passed.
- Full unit suite: 67 test files, 953 tests passed.
- Workspace `pnpm typecheck`: passed.
- `pnpm lint`: passed with zero errors and 47 existing warnings in ingestion,
  registry-gate and flagship browser-test files; the linter checks themselves
  introduced no lint errors.
- `pnpm audit:all`: passed all 16 release-gate checks, generated the catalogue
  from 324 resources, built 717 Astro pages and the Sites/preview artifacts,
  and passed bundle budgets, provenance/licence and secret/security audits.
- The MCP documentation browser regression from Step 27 passed on desktop and
  mobile after its accessibility fix (2 projects); it reported no Axe,
  console, essential network, keyboard-focus or overflow failures.
- The exported TSX fixture passed TypeScript syntax/transpile diagnostics and a
  standalone `tsc --noEmit` check.
- `git diff --check` passed after the edits.
- The public review deployment has not been updated as part of this local
  linter step; deployment verification belongs to the later release-candidate
  phase.

## Remaining limitations

Computed class expressions, CSS modules, inline styles, CSS inheritance,
opacity/compositing, image backgrounds, font-size-aware thresholds, browser
rendering, keyboard behavior and assistive-technology output are not fully
modeled. Landmark detection remains a filename/path heuristic. The 3,658
arbitrary-color findings are review prompts and can be noisy; no color finding
should be auto-rewritten. Keep the linter Beta until it is evaluated on
representative external codebases and paired with rendered/browser checks.
