# Step 11 — Design DNA observability

Status: **local scope complete; public deployed verification remains at Step 45**.
Design DNA now has a written effect contract, shared numeric slider mapping,
renderer token coverage for supported visual dimensions, and browser evidence at
desktop and mobile sizes. The evidence distinguishes effects on the current
canvas from effects on compatibility, planning or future recomposition.

## Defects reproduced and remediated

### P2 — Compose and Workbench used different numeric slider semantics

**Evidence:** `packages/dna/src/__tests__/dna.test.ts` first failed for a numeric
Visual Ambition value inside a named stop: companion dimensions stayed fixed.
After interpolation was added, a new boundary regression failed at 0 because the
displayed value snapped to the `essential` anchor (10). The corresponding 100
endpoint also snapped to the final stop anchor (95). The failure was reproduced
before the endpoint fix. `packages/composer/src/__tests__/interpreter-dna.test.ts`
now proves Compose uses the shared mapping. The Workbench browser journey verifies
the actual slider and exported manifest.

**Root cause:** Compose had a separate threshold implementation; Workbench only
changed the named score and left related dimensions unchanged. Numeric mapping
also returned the first or last stop without extrapolating companion dimensions.

**Remediation:** both entry points use the shared DNA helpers; companion
dimensions interpolate continuously between stop anchors and extend to 0/100,
while the user-selected numeric score remains exact. Structural Creativity maps
asymmetry in the same way. The Workbench explains that Structural Creativity
guides composition/replacement and does not rearrange an already-open screen.

### P2 — several DNA values were stored but had no independent rendered effect

**Evidence:** renderer tests establish independent token changes for
typographic expression, motion playfulness and supported surface personality;
tests also verify that changing one direct token family does not alter unrelated
families. The before/after Workbench screenshots show the changed heading token
and the updated DNA stop labels. The browser run checks that `.tess.json` preserves
the exact selected score and interpolated dimensions.

**Root cause:** the token normalizer did not consume typographic expression,
motion playfulness or surface personality, and the root heading rule did not use
the heading tracking token.

**Remediation:** typographic expression now adjusts heading tracking and exposes
the type-scale ratio; motion playfulness changes easing while respecting the
reduced-motion override; supported surface personalities change elevation,
borders and glass surface tokens. Playfulness already adjusts radii and now has
independent token regression coverage.

### P2 — resource DNA understated spatial and playful motion characteristics

**Evidence:** manifest regression tests showed that the perspective orbital field
and card-tilt effect both declared `threeDIntensity: 0`; the celebration
animation's spring easing was rated as non-playful motion.

**Root cause:** resource metadata did not describe the implementation in its
source files, so compatibility scoring could not rank these resources for those
visual intents.

**Remediation:** orbital field is rated at 25, card tilt at 80, and the spring
celebration's `motionPlayfulness` at 65. The orbital field is a restrained static
perspective treatment; it is not represented as a fully interactive 3D scene.

## Observable effect contract

| Dimension(s) | Observable effect today | Scope / limitation |
| --- | --- | --- |
| professionalism, luxury, warmth, technicality, editorial, futurism, colourfulness, imageryIntensity, videoIntensity, threeDIntensity, dataDensity, interactionDensity, conversionIntensity, trust, performancePriority | Numeric resource-fit score; selected resources can therefore change during composition or replacement | Do not promise an immediate canvas change from editing one of these values in an already-composed project. Resource coverage and score spread differ by dimension. |
| playfulness | Compatibility fit and radius tokens | Also influences the employee-experience screen overrides. |
| visualAmbition | Compatibility fit; the slider maps into typography, motion, imagery, video, 3D and depth companion values | Those companion effects remain subject to available resource support. |
| structuralCreativity | Direction generation/recomposition and compatibility fit; the slider maps asymmetry | Does not reorder the current manifest by itself. |
| density, whitespace | Spacing tokens through their shared `(whitespace - density)` multiplier | These dimensions intentionally interact. |
| contrast | Resource fit and semantic border width | High-contrast colors remain governed by palette and accessibility tokens. |
| curvature | Radius tokens | The global radius family is selected by defined score bands. |
| depth | Shadow/elevation tokens | Surface personality can override this result. |
| motion | Motion duration tokens | Reduced motion or a zero motion score takes precedence. |
| motionPlayfulness | Motion easing tokens | Reduced motion takes precedence. |
| typographicExpression | Heading letter-spacing and emitted type-scale ratio; also mapped from Visual Ambition | Scale ratio is available as a token; current shared heading CSS consumes tracking. |
| asymmetry | Resource fit and direction-generation structure | Also mapped from Structural Creativity. |
| accessibilityPriority | Focus-ring width/color and high-accessibility text contrast | Accessibility floors may impose a minimum independently. |
| visualMode | Palette selection and resource compatibility | `adaptive` resolves to the active/default light mode unless the caller supplies a mode. |
| geometryFamily | Resource compatibility | All 324 resources currently declare `rounded`, so catalog selection cannot distinguish it yet. |
| navigationModel | Direction navigation and composed navigation structure | Effects are structural and do not map to a CSS token. |
| primaryArchetype | Product planning/context and resource fit | Product/domain context, not a visual token. |
| responsivePhilosophy | Planner/audit intent | It does not currently alter the renderer's CSS by itself. |
| primaryStack | Compatibility hard constraint | V1 schema only permits `react-tailwind`. |
| motionPersonality | Motion preset selection | Unknown strings fall back to the default motion preset. Resource manifests currently do not declare this field. |
| typographyPersonality | Typography pairing selection for supported pairing IDs | Unknown strings fall back to Geist. All DNA presets use supported IDs. |
| surfacePersonality | Supported `paper-flat` and `subtle-contrast` token treatments | Other free-form labels fall back to depth-derived tokens. |
| contentTone | Stored composition metadata and Feel-mapping output | No current deterministic consumer changes generated prose when this field alone changes; treat it as metadata-only until integrated. |

## Catalog evidence and remaining limits

The current source catalog contains 324 manifests. All 28 canonical numeric
fields are present in all 324 `visualDNA` objects. Numeric values are not equally
expressive: `videoIntensity` has one value (0) across all resources; other fields
have between 2 and 8 distinct values. `threeDIntensity` now has three distinct
values (0, 25 and 80).

Among categorical DNA fields, all resources declare `visualMode: adaptive`,
`geometryFamily: rounded` and `primaryStack: react-tailwind`. No current resource
declares `primaryArchetype`, `navigationModel`, `responsivePhilosophy`,
`contentTone`, `motionPersonality`, `typographyPersonality` or
`surfacePersonality`. This limits categorical resource matching; resolving it
requires resource-by-resource truthful metadata work in the relevant resource
certification phase. It must not be papered over with synthetic values.

Showcase fixtures also contain free-form typography/surface labels outside the
canonical preset IDs. Those values currently resolve to the normalizer fallback.
This is recorded as a showcase/metadata fidelity limitation for the later
showcase phase rather than claiming these labels produce bespoke tokens now.

## Verification

- Focused DNA, composition, compatibility and renderer tests: **92 passed**.
- Full unit/integration suite: **787 passed across 61 files**.
- Full repository TypeScript check: **passed**.
- Lint: **0 errors, 51 warnings** (at the configured `--max-warnings=51`
  limit); the warnings are existing repository lint debt.
- Production build: **passed** (717 Astro routes generated; existing Vite chunk-size advisory remains).
- `pnpm audit:all`: **passed** (release gates, bundle budgets, license/provenance and security/secret checks).
- Playwright evidence journey: **passed** in Chromium at desktop; the test also captures a mobile viewport. Keyboard slider interaction, manifest download and browser network/console assertions passed.
- Screenshots: `quality/evidence/design-dna/{before,after}-{1440x900,390x844}.png`.
- Browser console/network capture: `quality/evidence/design-dna/runtime.json` (no console messages, uncaught errors, failed requests or HTTP errors).
- Axe was not run as part of this dimension-focused step; global accessibility verification remains scheduled for Step 35.

Local browser evidence does not close public Site verification. The programme
defers that check until its public RC deployment gate.
