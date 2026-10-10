# Tessellate Product Specification

## 1. Product definition

Tessellate is a free, open, agent-readable interface intelligence platform that converts product intent into a coherent interface system.

It combines:

- a curated resource commons;
- semantic resource search;
- product interpretation;
- Design DNA generation;
- screen/flow planning;
- compatibility-aware resource retrieval;
- design normalisation;
- a visual Workbench;
- deterministic UI composition;
- optional BYO-AI assistance;
- source/manifest export;
- registry, CLI and MCP distribution.

The product is deliberately broader than a component library and deliberately narrower than a general-purpose application builder. Tessellate's job is to solve **interface architecture and interface composition** exceptionally well, then hand the result to a coding agent or developer for product implementation.

## 2. Core promise

Primary message:

> Describe the product. Get the interface.

Secondary message:

> The open interface library for humans and agents.

Functional promise:

> Given a product idea, desired feel, visual ambition, structural freedom and constraints, Tessellate produces a coherent, editable, responsive, accessible interface plan and working front-end composition assembled from transparent resources.

## 3. Users

### 3.1 Founder / solo builder
Needs a polished product UI without hiring a design team.

### 3.2 Product designer
Needs fast design-direction exploration, compatible resource discovery and design-system acceleration.

### 3.3 Front-end engineer
Needs trustworthy, inspectable, high-quality resources and composable patterns.

### 3.4 Coding agent
Needs machine-readable interface intent, resources, manifests, relationships and deterministic APIs/tools.

### 3.5 Design-system team
Later: needs internal registry composition and rule compliance.

### 3.6 Creator
Needs a distribution surface, attribution and eventual hiring/bounty opportunity.

## 4. Product principles

1. Intent before components.
2. Cohesion before spectacle.
3. Free source before artificial scarcity.
4. Deterministic core before paid inference.
5. Local-first before server chatter.
6. Structured manifests before arbitrary code mutation.
7. Provenance before volume.
8. Accessibility and performance are design parameters, not cleanup tasks.
9. Progressive complexity: one prompt for novices, deep controls for experts.
10. Every public resource should be useful to both a human and an agent.

## 5. Launch catalogue

V1 public beta target:

### Canonical resources — 324

- Primitives & controls: 44
- Navigation & application shells: 36
- Marketing sections: 72
- Application blocks: 56
- Data display & visualisation: 24
- AI interaction patterns: 20
- Motion & microinteractions: 24
- Backgrounds & effects: 20
- Typography effects: 12
- Loading/empty/state patterns: 16

Each canonical resource ships with three curated configurations:

1. Quiet
2. Expressive
3. Nocturne

Total advertised honestly as:

> 324 resources · 972 curated configurations

### Supporting launch corpus

- 36 complete page compositions.
- 12 product blueprints.
- 30 Design DNA presets.
- 18 product archetypes.
- 40 layout grammars.
- 24 motion personalities.
- 20 semantic palette systems.
- 16 typography pairings.
- 12 navigation models.
- 10 client-side laboratories.
- 8 complete showcase projects.
- 6 responsive strategy presets.
- 5 accessibility strategy presets.
- 5 Visual Ambition levels.
- 5 Structural Creativity levels.

## 6. Product archetypes

V1 understands these as first-class archetypes:

- SaaS
- AI
- developer tools
- fintech
- ecommerce
- marketplace
- analytics
- intelligence/research
- CRM
- ERP/operations
- productivity
- education
- creator
- media
- travel
- real estate
- recruitment
- consumer applications

Archetypes can blend. They are semantic priors, not templates.

## 7. Core user journey

```text
LAND
↓
DESCRIBE PRODUCT
↓
DEFINE FEEL
↓
SET VISUAL AMBITION
↓
SET STRUCTURAL CREATIVITY
↓
OPTIONAL CONSTRAINTS
↓
PRODUCT MODEL
↓
SCREEN GRAPH
↓
DESIGN DNA
↓
THREE DIRECTIONS
↓
SELECT OR BLEND
↓
COMPOSE LIVE INTERFACE
↓
EDIT IN WORKBENCH
↓
AUDIT
↓
EXPORT
↓
HAND TO CODING AGENT / DEVELOPER
```

## 8. Homepage behaviour

The homepage is a working demonstration, not a marketing-only page.

### 8.1 Header

Persistent 64px desktop header.

Left:
- Tessellate mark.
- Explore.
- Compose.
- Workbench.
- Tools.
- Agents.
- Creators.
- Docs.

Right:
- global search trigger with `⌘K`/`Ctrl+K` hint;
- GitHub link;
- Sign in;
- primary CTA `Start building`.

### 8.2 Hero

Headline:

> Describe the product.  
> Get the interface.

Supporting copy:

> Tessellate turns product intent into cohesive interface systems using an open library of components, patterns, motion and design intelligence.

Primary object: Product Composer command surface.

Composer fields:

- freeform product description textarea;
- Feel control;
- Visual Ambition slider;
- Structural Creativity slider;
- Stack selector (V1 defaults to React + Tailwind);
- optional Advanced constraints drawer;
- Compose CTA.

Preset examples:

- AI research terminal.
- luxury travel marketplace.
- playful HR platform.
- developer observability tool.
- minimalist finance app.

### 8.3 Three directions

After composition, always show exactly three initial directions:

- Direction 01
- Direction 02
- Direction 03

Each direction has:
- name;
- philosophy sentence;
- five screen previews;
- DNA summary;
- `Choose`;
- `Blend`.

### 8.4 Homepage section order

1. Header.
2. Hero / composer.
3. Three-direction demonstration.
4. “Not a component library. A composition system.”
5. Live catalogue mosaic.
6. Essential → Experimental comparison.
7. Familiar → Experimental structural comparison.
8. Workbench demonstration.
9. Compatibility / normalisation explanation.
10. Agent-native distribution section.
11. Open/free commons section.
12. Creator ecosystem section.
13. Accessibility/performance proof.
14. Final composer.
15. Footer.

Do not add testimonials, fake logos, fake usage numbers or fabricated enterprise customers.

## 9. Explore / catalogue

Route: `/explore`

Desktop:
- 248px left filter rail;
- central responsive card grid;
- 56px top search/filter bar.

Search placeholder:

> Search by component, outcome, style or vibe…

Valid natural queries include:

- professional but playful login
- Bloomberg-style analytics
- cinematic product hero
- subtle background for fintech
- luxury checkout
- AI research sidebar
- mobile onboarding no illustrations

### 9.1 Filter groups

Resource:
- Primitive
- Component
- Section
- Block
- Page
- Flow
- Effect
- Background
- Typography
- Motion
- Data visualisation
- AI
- State

Purpose:
- Marketing
- Application
- Commerce
- Analytics
- Authentication
- Search
- Navigation
- Data entry
- Messaging
- Collaboration
- AI
- Reporting

Feel:
- Professional
- Playful
- Premium
- Technical
- Editorial
- Cinematic
- Minimal
- Warm
- Futuristic
- Institutional
- Experimental
- Luxury

Intensity:
- Quiet
- Balanced
- Expressive
- Dramatic

Motion:
- None
- Light
- Moderate
- Heavy

Density:
- Sparse
- Balanced
- Dense

Performance:
- Lightweight
- Moderate
- Heavy

Accessibility:
- Verified AA
- Keyboard verified
- Reduced-motion verified

Dependencies:
- Zero extra dependency
- Motion
- Radix
- Three.js
- D3
- other declared dependency tags

### 9.2 Resource card

Preview ratio: 16:10.

Footer:
- resource name;
- category;
- creator;
- compact quality/performance metadata.

Hover actions:
- Preview
- Save
- Use
- Copy

Do not show more than four high-priority actions on card hover.

## 10. Resource detail page

Route: `/r/[slug]`

Desktop split approximately 72/28.

Left:
- large live preview.

Right sticky inspector:
- Use in Workbench;
- Copy;
- Install;
- device selector;
- light/dark where available;
- reduced motion;
- density;
- accent;
- radius;
- visual intensity.

Tabs:
- Preview
- Code
- Anatomy
- Intent
- Variants
- Accessibility
- Performance
- Dependencies
- Versions

### Intent tab is mandatory

It states:
- what the resource is for;
- when it works;
- when it is inappropriate;
- ideal product archetypes;
- ideal visual personalities;
- compatible resources;
- conflicts;
- structural role;
- expected content requirements.

## 11. Compose

Route: `/compose`

This is a focused full-page version of homepage composer.

Input groups:

### Product
- description;
- archetype (auto + manual override);
- primary audience;
- primary objective;
- complexity;
- trust requirement;
- data density.

### Feel
Up to five pinned descriptors with weights 0–100.

### Visual Ambition
Five named stops mapped to 0–100:
- Essential
- Refined
- Striking
- Stunning
- Experimental

### Structural Creativity
Five named stops mapped to 0–100:
- Familiar
- Modern
- Inventive
- Radical
- Experimental

### Constraints
- target devices;
- accessibility floor;
- performance priority;
- allowed dependencies;
- prohibited visual patterns;
- required screens/sections;
- forbidden screens/sections.

### Mode
- Deterministic.
- AI-assisted.

Deterministic must always remain available.

## 12. Feel Mixer

Users may combine characteristics such as:

- professional;
- playful;
- premium;
- luxury;
- warm;
- technical;
- editorial;
- institutional;
- minimal;
- cinematic;
- futuristic;
- human;
- calm;
- energetic;
- bold;
- understated;
- scientific;
- artistic;
- brutalist;
- organic;
- youthful;
- mature;
- reassuring;
- adventurous.

The visible UI shows at most five pinned characteristics at once.

Arbitrary natural-language descriptors may be mapped into canonical Design DNA dimensions.

## 13. Intent inheritance

All projects use this hierarchy:

```text
PROJECT
  ↓
PAGE
  ↓
SECTION
  ↓
COMPONENT
  ↓
ELEMENT OVERRIDE
```

Child nodes inherit parent intent unless overridden.

Example:

```text
PROJECT
Professional 80
Technical 70
Motion 35

MARKETING PAGE
Premium 75
Motion 60

HERO
Cinematic 95
Motion 88

PRICING
Professional 100
Clarity 100
Motion 5

APPLICATION
Technical 90
Density 85
Motion 20
```

The UI must make inherited values visually distinguishable from explicit overrides.

## 14. Visual Ambition semantics

Visual Ambition controls expressive surface design, not quality.

### Essential
- familiar composition;
- restrained typography;
- low animation;
- nearly zero decorative effect budget;
- clarity and speed prioritised.

### Refined
- sophisticated spacing/typography;
- subtle motion;
- stronger visual hierarchy;
- restrained distinctive details.

### Striking
- expressive layout;
- stronger type treatment;
- richer motion;
- controlled special effects.

### Stunning
- substantial art direction;
- advanced transitions;
- selective 3D/video/shaders;
- richer narrative composition.

### Experimental
- high novelty;
- nonstandard spatial ideas;
- aggressive but purposeful motion/effects;
- still bound by accessibility/performance floors.

## 15. Structural Creativity semantics

Controls information architecture and composition.

### Familiar
Recognisable, conventional product structures.

### Modern
Current polished patterns with mild rethinking.

### Inventive
Noticeably different composition without harming comprehension.

### Radical
Reconceptualise layouts/workflows while preserving product jobs.

### Experimental
Permission to explore unconventional information architecture and spatial models while respecting explicit constraints.

## 16. Workbench capabilities

Workbench must support:

- screen tree;
- layer tree;
- live canvas;
- selection;
- project/page/section/component intent;
- Design DNA controls;
- style controls;
- motion controls;
- device preview;
- resource replacement;
- lock/unlock;
- mutation history;
- undo/redo;
- compare;
- present;
- audit;
- export;
- AI command surface when configured.

Detailed behaviour is in `WORKBENCH_SPEC.md`.

## 17. Deterministic mode

Without AI, the user chooses/enters enough structured intent for Tessellate to:

1. infer ProductModel using rules/keyword mapping;
2. select relevant screen grammar;
3. create ScreenGraph;
4. generate DesignDNA from controls/presets;
5. rank compatible resources;
6. compose sections/screens;
7. normalise resource tokens;
8. render live;
9. audit;
10. export.

No paid inference is necessary.

## 18. AI-assisted mode

AI may add:

- nuanced ProductModel extraction;
- screen suggestions;
- user-flow reasoning;
- arbitrary adjective mapping;
- content generation;
- design-direction naming/rationale;
- natural-language mutations;
- critique;
- alternative strategy generation.

AI output must be converted into typed, validated structures. AI may not directly bypass schema/constraint checks.

## 19. BYO provider model

Initial provider adapters:

- OpenAI.
- Anthropic.
- Gemini.
- OpenRouter-compatible endpoint.

Credentials:
- memory-only by default;
- never persisted server-side in V1;
- never logged;
- proxy only when browser-direct calls are unsuitable;
- all proxy responses disable caching.

## 20. Search

Primary search is browser-side hybrid search.

Ranking combines:

- keyword relevance;
- semantic similarity when local embeddings are available;
- intent compatibility;
- active filters;
- quality score;
- project-context compatibility.

Inside Workbench, project context changes ranking.

A request for `navbar` in a luxury ecommerce project should rank differently than the same request inside an enterprise analytics project.

## 21. Ten launch tools

### Design DNA Lab
Interactively manipulate canonical DNA dimensions and see a reference composition change.

### Background Studio
Generate gradients, meshes, grids, noise, patterns and CSS visual fields.

### Motion Studio
Edit easing, duration, spring, stagger, reveal and scroll behaviours.

### Palette Studio
Generate semantic, accessible palette tokens.

### Typography Lab
Explore type scale, pairing, density, headings and numerical/data typography.

### Layout Composer
Create/test grid/container structures.

### Section Planner
Given page objective + constraints, produce an ordered section grammar.

### Data Visualisation Styler
Apply project DNA to chart recipes.

### Accessibility Lab
Contrast, focus, reduced-motion and keyboard heuristics.

### SVG/Icon Lab
Search, recolour, size and export permissively licensed icon resources.

## 22. Audit

Deterministic project audit score:

- Cohesion: 20
- Accessibility: 20
- Performance: 15
- Responsive behaviour: 15
- Hierarchy: 10
- Density consistency: 5
- Motion consistency: 5
- Design-system compliance: 5
- Interaction consistency: 5

Total: 100.

AI critique may supplement but never replace deterministic scoring.

## 23. Projects and persistence

Guests:
- full browsing;
- search;
- composition;
- Workbench;
- IndexedDB local projects;
- export.

Signed-in users:
- cloud project sync;
- favourites;
- collections;
- creator identity;
- publishing/remixing;
- contribution identity.

No account is required for the core experience.

## 24. Project publishing

Read-only public project pages include:

- interactive preview;
- project description;
- Design DNA summary;
- screen list;
- resource credits;
- Remix button.

Remix creates an independent local project copy.

## 25. Creator profiles

Show:

- avatar;
- bio;
- specialty tags;
- resources;
- collections;
- aggregate usage;
- quality metrics;
- links;
- optional `Available for work` state.

Do not prioritise follower counts.

## 26. Contribution workflow

V1 is Git-based.

Contributor flow:

1. fork repo;
2. run `tess create-resource`;
3. complete manifest wizard;
4. implement resource;
5. run local validation;
6. open PR;
7. CI validates schema, licences, code, responsive behaviour and accessibility;
8. visual review;
9. merge/publish.

AI-assisted contributions are allowed but must be marked as such in metadata.

## 27. No comments in V1

V1 intentionally omits native public comments to avoid moderation/notification/spam infrastructure.

Use:
- save;
- remix;
- report;
- GitHub Discussions where community discussion is required.

## 28. Distribution

V1 distribution includes:

- copy source;
- ZIP export;
- `.tess.json` project manifest;
- shadcn-compatible registry endpoints;
- CLI;
- MCP;
- agent handoff package.

## 29. Agent handoff package

Exported package:

```text
/project
  project.tess.json
  DESIGN.md
  PRODUCT.md
  IMPLEMENTATION.md
  COMPONENTS.md
  dependencies.json
  AGENT_PROMPT.md
```

This is designed to be handed directly to Codex/Antigravity/another coding agent.

## 30. Showcase projects

Launch with eight polished examples:

1. Financial intelligence terminal.
2. AI developer platform.
3. Luxury hospitality marketplace.
4. Playful collaborative HR application.
5. High-end ecommerce brand.
6. Scientific research environment.
7. Creator analytics product.
8. Minimal personal productivity application.

Each must occupy a visibly different Design DNA region.

## 31. Commercial surfaces reserved in architecture

Without affecting free resource access, data models/UI affordances may reserve support for:

- sponsored collections;
- category sponsorship;
- creator hiring;
- jobs;
- bounties;
- campaign collections;
- commercial high-volume agent API usage.

V1 does not require payment processing.

## 32. Explicitly excluded from V1

- native payment system;
- real-time collaborative editing;
- public comment system;
- hosted arbitrary code execution;
- private enterprise registries;
- framework exporters beyond the canonical React target;
- remote URL screenshot crawling;
- built-in paid AI credits;
- platform-funded image generation;
- native mobile code exporters;
- Git hosting/repository management.

## 33. Future architecture compatibility

V1 schemas should not block eventual support for:

- Vue;
- Svelte;
- Web Components;
- React Native;
- Flutter;
- SwiftUI;
- Jetpack Compose;
- universal interface IR;
- team Taste Profiles;
- internal enterprise registries;
- design regression CI;
- UI linting;
- screenshot/brand ingestion;
- branches and merge;
- collaborative workbench;
- benchmark suite.

Do not prematurely implement these.

## 34. Public launch acceptance

Public beta is not considered complete until:

- required catalogue volume exists;
- core resources pass validation;
- deterministic composition works;
- AI-assisted composition works with BYO provider;
- Design DNA inheritance works;
- lock/replace/restructure/restyle works;
- Workbench is functional;
- search works without server search infrastructure;
- ZIP/manifest export works;
- registry works;
- CLI works;
- MCP works;
- ten tools exist;
- GitHub auth/cloud projects/favourites work;
- public docs are complete;
- platform shell/Workbench meet accessibility target;
- cost architecture remains inside defined ceiling.
