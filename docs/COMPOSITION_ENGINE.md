# Tessellate Composition Engine

## 1. Purpose

The Composition Engine turns product intent into a coherent interface system without requiring an LLM. AI may enrich interpretation and mutation, but the deterministic engine remains the authority for constraints, compatibility, scoring, normalisation, rendering and export validity.

## 2. Pipeline

```text
Input brief
↓
Product Interpreter
↓
ProductModel
↓
Screen Planner
↓
ScreenGraph
↓
Design DNA Builder
↓
DesignDNA
↓
Direction Generator
↓
Composition Grammar
↓
Candidate Retrieval
↓
Hard Constraints
↓
Compatibility Scoring
↓
Resource Selection
↓
Normalisation
↓
ProjectManifest
↓
Renderer
↓
Audit
```

AI-assisted mode may intervene only at explicitly defined structured stages.

## 3. Product Interpreter

Inputs:
- natural-language description;
- selected archetype override;
- audience;
- objective;
- desired feel;
- required screens/sections;
- forbidden screens/sections;
- performance/accessibility/device constraints;
- product complexity;
- trust requirement;
- data density.

Outputs `ProductModel` containing at minimum:

- productArchetypes[] with weights;
- primaryAudience;
- userSophistication;
- primaryObjective;
- secondaryObjectives[];
- jobsToBeDone[];
- entities[];
- workflows[];
- trustRequirement 0–100;
- informationComplexity 0–100;
- dataDensity 0–100;
- collaborationLevel 0–100;
- transactionCriticality 0–100;
- likelyScreens[];
- navigationComplexity 0–100;
- mobileImportance 0–100;
- requiredCapabilities[];
- forbiddenPatterns[];
- explicitConstraints.

### Deterministic interpretation

Use:
- archetype dictionaries;
- keyword and phrase mappings;
- explicit form inputs;
- simple weighted rules;
- known domain/entity vocabulary;
- user overrides.

Never pretend deterministic interpretation has model-level semantic depth. Show the user inferred assumptions where ambiguity matters.

Archetype selection gives high-information domain phrases more weight than broad
cues such as “workspace”, “stream” or “order”. Supporting keywords can refine a
match, but a secondary archetype is emitted only when it has corroborating
weight (at least 28 points and 45% of the leading score). Hyphenated phrases
are normalized before matching. The 0–100 weights are relative deterministic
ranking signals, not calibrated probabilities.

ProductModel metric priors and forbidden-pattern defaults come from the
selected archetype definition. A matching blueprint may still shape downstream
composition, but a generic SaaS blueprint fallback must not overwrite the
archetype’s trust, collaboration, navigation or mobile assumptions. Fiscal
transaction elevation is limited to explicit payment, checkout or money
transfer language; operational work orders and procurement requests are not
treated as financial transactions.

### AI interpretation

If provider configured, send compact structured prompt and require JSON matching `ProductModel` schema.

Then:
1. parse JSON;
2. validate Zod schema;
3. clamp numeric values;
4. discard unknown fields;
5. run hard constraint reconciliation;
6. expose material assumptions in UI.

AI output never becomes trusted configuration until validated.

## 4. Screen Planner

The planner uses product archetype + workflows + complexity to select and adapt screen grammars.

Screen classes:

- marketing;
- authentication;
- onboarding;
- dashboard;
- index/list;
- detail/entity;
- search/explore;
- workspace/editor;
- analytics/reporting;
- messages/collaboration;
- settings;
- billing/account;
- checkout/transaction;
- admin;
- documentation;
- support.

Each screen node contains:
- semantic purpose;
- route suggestion;
- required jobs;
- expected data/content;
- importance;
- parent group;
- minimum required sections;
- optional sections;
- navigation visibility;
- device relevance.

The planner preserves the interpreter's recommended screen names, types, purposes, jobs, and required flags. It derives route suggestions from screen semantics and the ProductModel's entities, validates route uniqueness, groups by screen grammar, and connects the public entry to application destinations. It does not append a generic dashboard, sign-in, settings, documentation, or entity-detail screen when the ProductModel did not recommend one. If an explicit required-screen constraint cannot be matched to a recommendation or supported screen class, planning fails with an actionable error.

### Example

For research/intelligence:

```text
Marketing
├── Home
├── Product
├── Use cases
├── Pricing (optional)
└── Docs

App
├── Overview
├── Search
├── Entities
│   └── Entity detail
├── Research workspace
├── Reports
├── Watchlists
└── Settings
```

The planner should not automatically create pricing/billing for products that do not imply commerce. In particular, SaaS classification alone is not evidence of paid plans; billing screens and workflows require explicit monetization intent. Payment and checkout screens remain separate transaction flows.

When mobile is a target and the inferred mobile importance or navigation complexity is high, no more than five destinations remain in primary navigation. Lower-priority routes remain in secondary navigation, and the planned screen graph retains their device relevance and routes.

## 5. Design DNA

Canonical numeric 0–100 dimensions:

- professionalism
- playfulness
- luxury
- warmth
- technicality
- editorial
- futurism
- visualAmbition
- structuralCreativity
- density
- whitespace
- contrast
- colourfulness
- curvature
- depth
- motion
- motionPlayfulness
- typographicExpression
- imageryIntensity
- videoIntensity
- threeDIntensity
- dataDensity
- interactionDensity
- asymmetry
- conversionIntensity
- trust
- accessibilityPriority
- performancePriority

Canonical categorical fields:

- primaryArchetype
- visualMode: light | dark | adaptive
- geometryFamily
- navigationModel
- responsivePhilosophy
- contentTone
- primaryStack
- motionPersonality
- typographyPersonality
- surfacePersonality

### DNA inheritance

Effective DNA for a node is:

```text
Project DNA
+ Page overrides
+ Section overrides
+ Component overrides
+ Element overrides
```

An override stores only changed values, not a duplicated full object.

## 6. Feel mapping

Canonical adjective mapping examples:

### professional
Raises:
- professionalism;
- trust;
- hierarchy discipline.

Lowers slightly:
- motionPlayfulness;
- asymmetry at high weights.

### playful
Raises:
- playfulness;
- curvature;
- colourfulness;
- motionPlayfulness.

### premium
Raises:
- whitespace;
- typographicExpression;
- depth moderately;
- visualAmbition moderately;
- trust.

### luxury
Raises:
- luxury;
- whitespace;
- typography expression;
- imagery quality expectation.

Usually lowers:
- colourfulness;
- interaction density;
- motion frequency.

### technical
Raises:
- technicality;
- data density;
- interaction density;
- precision;
- mono/data typography probability.

### cinematic
Raises:
- imageryIntensity;
- videoIntensity;
- motion;
- visualAmbition;
- depth;
- typographicExpression.

### institutional
Raises:
- professionalism;
- trust;
- density moderate-high;
- structure familiarity.

Lowers:
- playfulness;
- curvature;
- experimental effects.

Mappings are data, not scattered conditional logic. Store them in a versioned preset package.

## 7. Direction Generator

Initial project generation creates exactly three directions.

Direction generation is deterministic by default using controlled divergence.

### Direction A — conservative fit
- closest to inferred DNA;
- structural creativity slightly reduced;
- performance/accessibility weighted strongly.

### Direction B — expressive fit
- visual ambition increased within constraint ceiling;
- typography/motion/image expression increased;
- same product jobs.

### Direction C — structural alternative
- structural creativity meaningfully increased;
- different navigation/layout grammar family;
- maintain content/jobs/constraints.

Names are selected from a controlled vocabulary by archetype/personality combination. AI may propose better names and rationale but does not alter structural facts unless validated.

## 8. Composition grammar

A grammar is not a fixed template. It defines:

- required semantic roles;
- allowed role ordering;
- optional role groups;
- exclusivity rules;
- layout families;
- responsive strategies;
- candidate resource categories.

### Marketing homepage baseline

```text
Navigation
→ Hero
→ Trust/Proof (optional for low-trust products)
→ Value proposition
→ Product proof/demo
→ Capability group(s)
→ Secondary proof
→ Conversion section
→ Footer
```

### Developer platform variation

```text
Navigation
→ Hero + code/terminal proof
→ quick integration proof
→ architecture/capabilities
→ code examples
→ benchmark/proof
→ docs/community CTA
→ footer
```

### Dense analytical application

```text
Application shell
→ context/header
→ primary KPI/status layer
→ dominant analytical workspace
→ secondary evidence/activity
→ contextual side rail or bottom detail
```

Grammar selection uses ProductModel, DesignDNA and screen purpose.

## 9. Candidate retrieval

Retrieve resources by:

- semantic role;
- category;
- purpose tags;
- archetype fit;
- DNA neighbourhood;
- technical stack;
- required slots;
- responsive capabilities;
- declared relationships.

Search index may help discovery, but the composition engine operates on canonical structured catalogue data.

## 10. Hard constraints

Reject resource before scoring if any fails:

- incompatible framework;
- incompatible styling strategy for export target;
- prohibited dependency;
- missing required semantic slot;
- license incompatible with requested output;
- accessibility capability below required floor;
- performance class above explicit hard ceiling;
- missing required mobile strategy;
- resource explicitly `AVOID_FOR` target archetype/context;
- known conflict with locked/required surrounding resource;
- resource version invalid/deprecated.

Hard constraints cannot be overridden by AI.

## 11. Compatibility scoring

After hard filtering, compute score 0–100.

Weights:

- 24% intent fit
- 18% Design DNA fit
- 12% structural fit
- 10% technical fit
- 8% accessibility
- 8% performance
- 6% responsive fit
- 5% composition synergy
- 4% reviewed quality score (neutral score when assessment is unassessed)
- 3% novelty preference
- 2% diversity adjustment

Implement scoring as explicit pure functions with tests.

### DNA distance

Use normalized weighted distance across relevant DNA dimensions. Not every dimension applies equally to every role.

Example:
- motion matters heavily for animated hero;
- data density matters heavily for analytical table;
- luxury may matter weakly for a hidden settings toggle.

ResourceManifest provides dimension relevance weights where necessary.

## 12. Composition synergy

Relationship graph contributes to pair/group score.

Relationship types:

- WORKS_WITH
- CONTRASTS_WITH
- ALTERNATIVE_TO
- REPLACES
- EXTENDS
- REQUIRES
- BELONGS_TO
- GOOD_FOR
- AVOID_FOR
- SAME_FAMILY
- MOBILE_ALTERNATIVE
- LOW_COST_ALTERNATIVE
- HIGH_AMBITION_ALTERNATIVE

Do not use graph relationship as an absolute truth except explicit REQUIRES/AVOID hard rules.

## 13. Diversity

Composition should not select every visible section from the same resource family unless that family is a deliberate coherent system.

Diversity adjustment considers:
- creator repetition;
- visual-family repetition;
- layout repetition;
- motion repetition;
- card-pattern repetition.

Goal: coherent variety, not forced novelty.

## 14. Normalisation Engine

Selected resources pass through semantic token mapping.

Normalize:
- colour roles;
- typography roles;
- radius family;
- spacing scale;
- surface/depth;
- motion durations/easing;
- icon sizing;
- focus treatment.

Preserve:
- intrinsic artwork;
- intentional shader/media identity;
- semantic layout behaviour;
- resource-specific interaction that defines the pattern.

### Normalisation precedence

1. accessibility constraints;
2. explicit node overrides;
3. project Design DNA;
4. resource semantic defaults;
5. source resource fallback values.

## 15. Performance budget model

Each resource declares estimated classes:

- `jsCost`: none | tiny | low | medium | high
- `gpuCost`: none | low | medium | high
- `mediaCost`: none | low | medium | high
- `runtimeComplexity`: low | medium | high

Composition uses weighted aggregate.

If Performance Priority >= 80:
- strongly penalize high GPU/media resources;
- require lazy strategies;
- prefer CSS/native transitions;
- cap number of concurrent heavy effects.

## 16. Accessibility model

Resource capabilities include:
- keyboardVerified;
- screenReaderSemantics;
- reducedMotionVerified;
- contrastTokenCompatible;
- focusVisible;
- dragKeyboardAlternative where applicable.

Project floor can require verified fields for relevant resources.

## 17. Responsive model

Each resource declares strategies per breakpoint/context:

- compress
- stack
- collapse
- transform
- substitute
- omit-nonessential

`substitute` may reference a `MOBILE_ALTERNATIVE` resource.

Composition must create explicit responsive decisions, not assume CSS wrapping solves everything.

## 18. Structural recomposition

Inputs:
- target screen/section;
- current ProductModel;
- effective DesignDNA;
- locked descendants;
- required content/data jobs;
- current constraints;
- divergence level.

Algorithm:
1. identify semantic jobs;
2. freeze locks;
3. select alternative grammar family;
4. place frozen nodes into compatible slots;
5. retrieve missing semantic roles;
6. score candidates;
7. normalize;
8. audit;
9. reject alternatives with severe audit failures;
10. return best alternatives.

## 19. Surprise Me

Surprise Me is controlled divergence, not random shuffle.

Increase:
- novelty preference;
- structural creativity within cap;
- layout-family exploration;
- underused high-quality resources;
- creator diversity.

Do not alter:
- ProductModel jobs;
- locks;
- required content/data;
- hard constraints;
- accessibility floor;
- explicit dependency bans.

## 20. Mutation model

AI/user actions ultimately become validated operations.

Canonical operation types:

- SET_DESIGN_TOKEN
- SET_INTENT
- SET_PROP
- SET_CONTENT
- INSERT_NODE
- DELETE_NODE
- MOVE_NODE
- REPLACE_NODE
- CHANGE_RESOURCE
- CHANGE_VARIANT
- CHANGE_LAYOUT
- LOCK_NODE
- UNLOCK_NODE
- ADD_SCREEN
- DELETE_SCREEN
- MOVE_SCREEN
- SET_NAVIGATION
- SET_MOTION
- SET_MEDIA

Each mutation includes:
- operation ID;
- target ID;
- payload;
- actor;
- timestamp;
- precondition version;
- inverse mutation when possible.

## 21. AI mutation flow

Natural-language command:

> Keep the chart and navigation, rethink everything else.

AI output must be an `IntentCommand` structure, not direct source code.

Then deterministic planner converts to mutations:

```text
LOCK_NODE navigation
LOCK_NODE chart
RECOMPOSE dashboard EXCLUDING locked nodes
```

Validate all targets and locks before applying.

## 22. AI prompt boundaries

Provider prompts should include only necessary context:

- compact ProductModel;
- relevant effective DNA;
- selected node subtree summary;
- available operation schema;
- constraints;
- user request.

Do not send entire resource source repository for simple mutations.

## 23. AI failure behaviour

If provider fails:
- no project state changes;
- show clear failure;
- preserve prompt for retry;
- offer deterministic alternatives where possible.

If AI returns schema-invalid output:
- attempt one constrained repair request if configured;
- otherwise reject output;
- never partially apply unvalidated mutations.

## 24. Auditing before application

Bulk structural mutations must run lightweight audit before being committed.

Reject automatically if:
- required nodes lost;
- schema invalid;
- hard accessibility constraint violated;
- prohibited dependency introduced;
- project becomes unrenderable.

Warnings may be presented for user confirmation later, but V1 can choose best passing alternative automatically for deterministic generation.

## 25. Determinism and seeds

Composition functions accept a seed.

Given:
- catalogue version;
- ProductModel;
- DesignDNA;
- constraints;
- seed;

the deterministic engine should produce reproducible output.

Store seed in ProjectManifest.

This is essential for testing and debugging.

## 26. Testing

Unit-test:
- adjective mappings;
- ProductModel rules;
- hard constraints;
- score calculations;
- inheritance;
- normalization precedence;
- grammar selection;
- responsive substitution;
- lock preservation;
- mutation inverse generation;
- deterministic seed behaviour.

Golden-fixture test at least these briefs:

1. financial intelligence terminal;
2. playful HR platform;
3. luxury travel marketplace;
4. developer observability platform;
5. minimalist personal finance tool;
6. scientific research environment.

Each fixture asserts structural qualities rather than brittle exact resource IDs unless a fixture intentionally tests ranking.
