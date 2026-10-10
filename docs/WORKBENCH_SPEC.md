# Tessellate Workbench Specification

## 1. Purpose

The Workbench is the primary environment for turning a generated interface direction into a controlled, editable product UI system.

It is not a generic Figma replacement and not a freeform vector editor. It is a structured UI composition environment driven by semantic project nodes, Design DNA, resources and validated mutations.

## 2. Desktop shell

Viewport-filling application.

```text
┌───────────────────────────────────────────────────────────────┐
│ TOP TOOLBAR — 56px                                           │
├──────────────┬───────────────────────────────┬────────────────┤
│ LEFT PANEL   │                               │ RIGHT PANEL    │
│ 280px        │          CANVAS               │ 340px          │
│              │                               │                │
│ Brief        │                               │ Intent         │
│ Pages        │                               │ Style          │
│ Layers       │                               │ Motion         │
│ Library      │                               │ Constraints    │
│              │                               │ Selection      │
├──────────────┴───────────────────────────────┴────────────────┤
│ COMMAND BAR — 64px                                           │
└───────────────────────────────────────────────────────────────┘
```

Minimum comfortable width: 1280px.

Below 1024px, side panels become toggleable drawers. Mobile uses inspection/editing mode rather than a fake miniature desktop editor.

## 3. Top toolbar

Left cluster:
- Tessellate mark;
- project name (inline editable);
- save/cloud/local indicator.

Centre mode switch:
- Compose
- Structure
- Style
- Motion
- Content
- Audit

Right cluster:
- Undo
- Redo
- device
- zoom
- Preview
- Present
- Export

Zoom values:
- Fit
- 25%
- 50%
- 75%
- 100%
- 125%
- 150%
- 200%

Device presets:
- Responsive
- 1440
- 1280
- 1024
- 768
- 430
- 390
- 360

## 4. Left panel

Four primary tabs.

### 4.1 Brief
Shows ProductModel summary:
- product description;
- archetype;
- audience;
- objective;
- trust requirement;
- data density;
- constraints;
- prohibited patterns;
- required screens.

Allows editing inputs and reinterpreting the project while respecting locked screens/nodes.

### 4.2 Pages
Tree of screens/pages grouped by domain.

Capabilities:
- select;
- rename;
- add;
- duplicate;
- delete;
- reorder;
- nest;
- group;
- set route slug;
- mark required/optional;
- set responsive availability.

### 4.3 Layers
Semantic tree for selected screen.

Example:

```text
Dashboard
├── AppShell
│   ├── Sidebar
│   └── Topbar
└── Main
    ├── OverviewHeader
    ├── KPIGroup
    ├── RevenueChart
    ├── ActivityPanel
    └── InsightRail
```

Capabilities:
- select;
- expand/collapse;
- drag reorder within allowed grammar;
- lock;
- hide in preview;
- duplicate where allowed;
- delete;
- replace.

Do not expose meaningless implementation wrappers. Tree nodes represent semantic interface concepts.

### 4.4 Library
Shows resources ranked against current selection and project context.

Sections:
- Recommended
- Compatible alternatives
- Same family
- Lower-cost
- Higher-ambition
- Saved
- Search results

Dragging a resource onto canvas must convert into a typed `INSERT_NODE` or `REPLACE_NODE` mutation.

## 5. Canvas

The canvas renders the actual structured project.

Capabilities:
- zoom;
- pan;
- fit;
- selection;
- hover target;
- drag reorder when structurally allowed;
- direct-resize only where resource schema exposes adjustable sizing;
- device simulation;
- responsive viewport resizing.

The canvas must not allow arbitrary absolute positioning unless a specific layout resource supports it.

## 6. Selection model

Exactly one primary selection, optionally multiple selection later only for bulk actions.

Selection hierarchy:
- screen;
- section;
- component/block;
- exposed element/slot.

Breadcrumb appears above/right inspector:

`Dashboard / Main / Revenue chart`

Escape moves selection up one level before clearing entirely.

## 7. Right inspector

Context-sensitive tabs:

- Intent
- Style
- Motion
- Content
- Layout
- Constraints
- Resource

Do not show tabs that have no applicable controls.

### 7.1 Intent

Shows inherited + explicit intent dimensions.

Core controls:
- Feel Mixer;
- Visual Ambition;
- Structural Creativity when screen/section selected;
- density;
- trust;
- conversion emphasis;
- data density;
- accessibility priority;
- performance priority.

Every control visibly indicates one of:
- inherited;
- overridden;
- locked.

Reset returns to inheritance.

### 7.2 Style

Controls depend on resource exposure but may include:
- palette role;
- surface;
- border strength;
- radius family;
- depth;
- typography family/scale;
- spacing density;
- imagery treatment;
- local accent override.

Global arbitrary CSS text editing is not part of V1 primary workflow.

### 7.3 Motion

Controls:
- motion enabled;
- intensity;
- entrance type;
- hover type;
- transition duration;
- easing/personality;
- stagger;
- scroll behaviour;
- reduced-motion fallback preview.

### 7.4 Content

Exposes named content slots from ResourceManifest.

Examples:
- heading;
- body;
- label;
- CTA text;
- image/video source;
- list items;
- table data fixture;
- chart fixture.

### 7.5 Layout

Controls only valid semantic/layout properties:
- alignment;
- max width;
- columns;
- gap;
- stack order;
- split ratio;
- sticky/pinned mode where supported;
- content order;
- responsive strategy.

### 7.6 Constraints

Per-node constraints:
- must remain;
- may be replaced;
- allowed dependencies;
- performance ceiling;
- accessibility floor;
- mobile behaviour;
- forbidden resource families.

### 7.7 Resource

Shows:
- source resource;
- version;
- creator;
- license;
- dependencies;
- quality score;
- performance score;
- compatibility explanation;
- open resource detail;
- replace action.

## 8. Feel Mixer

Visible maximum: five pinned traits.

Each trait:
- canonical/ad-hoc name;
- numeric 0–100;
- inheritance state;
- remove pin.

Adding an arbitrary phrase triggers deterministic mapping if known; otherwise AI-assisted mapping when available; otherwise user chooses closest canonical traits.

Examples:

- `professional but playful` → professionalism high, playfulness moderate, curvature/motion warmth slightly increased.
- `institutional but contemporary` → trust/professionalism high, curvature moderate-low, typography expression restrained, structure modern.
- `luxury without being flashy` → luxury high, colourfulness low, motion smooth/low-frequency, whitespace high, typography expression high.

## 9. Command bar

Persistent bottom command surface on desktop.

Placeholder:

> Tell Tess what to change…

Selection-aware.

Example commands:
- Keep the chart and rethink everything else.
- Make this section more professional but still playful.
- Reduce motion by half.
- Give me a radically different navigation model.
- Make this feel more institutional.
- Replace the hero with something cinematic but lightweight.
- Make mobile simpler than desktop.

Without AI provider configured, supported deterministic command patterns map to known mutations. Unsupported free text shows a clear prompt to connect a provider or use inspector controls.

## 10. Context action menu

Right click / action button on selection:

- Replace
- Alternative
- Duplicate
- Move
- Lock
- Hide
- Delete
- Improve
- Simplify
- Intensify
- Match project DNA
- Improve accessibility
- Improve performance
- Rethink structure
- Surprise me

Unavailable actions are disabled with reason.

## 11. Locking

Lock types:
- node;
- layout;
- content;
- style;
- motion;
- media;
- responsive behaviour;
- Design DNA override.

A node may have multiple lock flags.

UI supports:
- `Lock node`;
- `Lock structure only`;
- `Lock style only`;
- `Lock content only`;
- `Unlock all`.

Recomposition must preserve locked dimensions.

## 12. Replace flow

Selecting `Replace` opens library drawer filtered to:
- same semantic role;
- current technical constraints;
- current accessibility floor;
- current performance ceiling;
- current project DNA.

Each candidate displays:
- compatibility score;
- why it fits;
- performance delta;
- visual ambition delta.

Previewing a candidate is temporary until Apply.

## 13. Rethink Structure

Available at screen and section level.

It preserves:
- required product job;
- locked descendants;
- explicit content constraints;
- accessibility/performance constraints.

It may change:
- layout grammar;
- navigation model;
- grouping;
- ordering;
- section decomposition;
- visual hierarchy.

Before applying, show at least two structural alternatives in compare view when computation is cheap. If AI is unavailable, generate deterministic grammar alternatives.

## 14. Surprise Me

Raises controlled divergence while respecting hard constraints.

Must never randomly discard:
- locked nodes;
- required screens;
- data requirements;
- accessibility floor;
- performance ceiling.

Result receives a short explanation of what changed.

## 15. Three initial design directions

Initial generation returns exactly three.

Each stores:
- `directionId`;
- name;
- rationale;
- DesignDNA;
- ScreenGraph reference;
- navigation model;
- layout grammar family;
- representative resource choices.

User may:
- choose;
- preview;
- compare;
- blend.

## 16. Blend mode

Blend UI has source columns A/B/C and target categories:

- Structure
- Typography
- Colour
- Motion
- Density
- Geometry
- Navigation
- Imagery
- Components

User may select source per category.

Advanced blend can weight DNA dimensions numerically.

Blend always produces a new direction rather than destructively altering originals.

## 17. History

Use local mutation log.

Each entry stores:
- id;
- timestamp;
- actor (`user`, `deterministic-engine`, `ai`);
- semantic summary;
- mutations;
- inverse mutations;
- affected node IDs.

UI groups rapid low-level mutations into semantic operations.

Examples:
- “Changed dashboard density to Dense.”
- “Replaced sidebar with Context Rail.”
- “Recomposed Analytics screen.”

Undo/redo operates on semantic operations.

## 18. Checkpoints

Automatic local checkpoints:
- after initial generation;
- before structural recomposition;
- before AI bulk mutation;
- before applying a direction blend;
- before import/migration.

Users can name checkpoints.

## 19. Compare mode

Supports:
- side-by-side;
- swipe/overlay for same-structure visual comparisons where feasible;
- synced scrolling;
- synced device size;
- difference summary.

Common comparisons:
- Direction A vs B;
- Essential vs Stunning;
- Before vs after restructure;
- Desktop vs mobile strategy;
- current vs checkpoint.

## 20. Preview mode

Hides editor chrome and shows product at selected viewport.

Toggle:
- interactions enabled;
- keyboard navigation test;
- reduced motion;
- simulated slow device mode (approximate effect reduction, not fake network).

## 21. Present mode

Presentation-focused shell:
- no editing chrome;
- page/screen navigation;
- optional Design DNA overview;
- fullscreen;
- clean project title.

Useful for stakeholder/client review.

## 22. Audit mode

Shows deterministic 100-point audit.

Top summary:
- overall score;
- nine category scores;
- high/medium/low issues.

Clicking an issue selects affected node.

Issue examples:
- inherited radius mismatch;
- insufficient contrast;
- too many motion personalities;
- mobile overflow;
- excessive dependency/performance cost;
- unreachable keyboard action;
- inconsistent spacing family.

AI critique, when configured, appears separately under `AI review` and cannot overwrite deterministic findings.

## 23. Mobile Workbench

Mobile tab bar:
- Preview
- Pages
- Selection
- Command
- Audit

Selection inspector uses bottom sheet/full-height sheet.

Supported:
- select node from tree;
- change intent;
- change style preset;
- replace;
- lock;
- command mutation;
- page selection;
- save;
- export.

Unsupported or constrained:
- complex drag layout manipulation;
- multi-pane compare.

Do not hide core project access behind a desktop-only block.

## 24. Keyboard shortcuts

```text
Cmd/Ctrl+K   Global command/search
Cmd/Ctrl+Z   Undo
Shift+Cmd/Ctrl+Z Redo
Cmd/Ctrl+S   Save/checkpoint
F            Fit canvas
1            Desktop preset
2            Tablet preset
3            Mobile preset
L            Lock selected node
Shift+L      Unlock selected node
R            Replace selected
A            Alternative
/            Focus command bar
Esc          Move selection up / clear
```

Shortcuts must not fire while typing into input/contenteditable except explicitly scoped ones.

## 25. Saving

Guest:
- IndexedDB auto-save.

Authenticated:
- IndexedDB immediate persistence;
- cloud checkpoint after meaningful idle period;
- explicit Save creates durable checkpoint;
- Publish creates a public immutable revision pointer.

Do not write to D1 on every slider movement.

## 26. Project recovery

If manifest fails validation on load:

1. preserve raw record;
2. attempt known migrations;
3. if still invalid, open Recovery mode;
4. show validation problems;
5. allow raw manifest export;
6. never silently delete project.

## 27. Export

Export sheet:

- Source ZIP
- Tess manifest
- Agent handoff package
- Registry commands
- CLI commands
- Copy project brief

Export performs validation before completion and lists unresolved issues.

Warnings may be bypassed; schema-invalid export may not.

## 28. Workbench acceptance criteria

Workbench V1 is not complete until a user can:

1. open a generated project;
2. browse pages;
3. select semantic nodes;
4. change Project DNA;
5. override DNA at page/section/component levels;
6. distinguish inherited vs explicit values;
7. replace a resource;
8. lock a node;
9. recompose around locked nodes;
10. undo/redo;
11. compare versions;
12. preview desktop/tablet/mobile;
13. run audit;
14. save locally;
15. export a valid `.tess.json` and source package.
