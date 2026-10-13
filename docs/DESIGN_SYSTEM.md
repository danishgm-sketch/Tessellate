# Tessellate Design System

This document defines the authoritative visual system for the platform shell and Workbench. Resource previews may be expressive; the surrounding product shell remains controlled, editorial, technical and calm.

## 1. Design thesis

Tessellate should look like a serious creative instrument rather than a trend-chasing AI landing page.

The shell should communicate:

- precision;
- editorial confidence;
- technical credibility;
- large-scale creative possibility;
- speed;
- calm control.

The resource library itself supplies visual spectacle. Therefore the platform chrome must **not** compete with its own content.

Avoid:

- omnipresent purple/blue gradients;
- glowing glass cards everywhere;
- neon particle fields in the product shell;
- oversized pill buttons by default;
- every card having a large radius;
- fake terminal motifs used decoratively;
- generic AI-star/sparkle iconography as primary brand language;
- gratuitous 3D in navigation or settings.

## 2. Brand identity

Working name: **Tessellate**

Short form: **Tess**

Primary tagline:

> Describe the product. Get the interface.

Secondary tagline:

> The open interface library for humans and agents.

### 2.1 Mark

Initial mark concept: four offset quadrilateral tiles creating an incomplete tessellation. It should read as:

- composition;
- modularity;
- transformation;
- systems;
- assembly.

The mark must work at 16px without interior micro-detail.

Until a final vector is approved, use a simple geometric CSS/SVG mark built from four rhombi/squares. Do not invent a mascot.

## 3. Colour system

### 3.1 Light shell

```css
--tess-canvas: #F4F2ED;
--tess-canvas-strong: #ECE9E2;
--tess-surface: #FAF9F6;
--tess-surface-raised: #FFFFFF;
--tess-ink: #111217;
--tess-ink-secondary: #62666F;
--tess-ink-muted: #62666F;
--tess-hairline: #D9D6CF;
--tess-hairline-strong: #C7C3BA;
--tess-cobalt: #2547E8;
--tess-cobalt-hover: #1E3CCD;
--tess-cobalt-soft: #E7EBFF;
--tess-lime: #C9FF57;
--tess-danger: #C83D48;
--tess-success: #177B55;
--tess-warning: #A66A15;
```

### 3.2 Dark Workbench shell

```css
--tess-dark-canvas: #0B0D10;
--tess-dark-panel: #111419;
--tess-dark-raised: #171B21;
--tess-dark-hover: #1C2128;
--tess-dark-border: #272C34;
--tess-dark-border-strong: #353C46;
--tess-dark-text: #F5F7FA;
--tess-dark-text-secondary: #A8AFBA;
--tess-dark-text-muted: #707986;
--tess-dark-accent: #6782FF;
--tess-dark-accent-soft: #1C2752;
```

The Workbench is dark by default because it acts as a neutral frame around varied generated canvases. The public marketing/catalogue shell is light by default.

### 3.3 Accent discipline

Cobalt is interactive/system emphasis.

Lime is a scarce signal used for:

- a tiny “new/active” detail;
- a selected experimental mode marker;
- one memorable brand accent inside visual references.

Never use lime as a broad background or paragraph text.

## 4. Typography

Self-host **Geist Sans** and **Geist Mono**.

Fallbacks:

```css
font-family: "Geist", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-family: "Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

### 4.1 Desktop type scale

- Hero XL: 68px / 0.96 / -0.045em / 600
- Display: 52px / 1.00 / -0.035em / 600
- H1: 44px / 1.05 / -0.03em / 600
- H2: 36px / 1.10 / -0.025em / 600
- H3: 25px / 1.15 / -0.018em / 600
- H4: 19px / 1.25 / -0.012em / 600
- Body XL: 20px / 1.50 / -0.008em / 450
- Body L: 18px / 1.55 / -0.006em / 450
- Body: 15px / 1.55 / -0.003em / 450
- Small: 13px / 1.45 / 0 / 450
- UI Label: 12px / 1.30 / 0.01em / 550
- Micro: 11px / 1.30 / 0.025em / 550
- Code: 13px / 1.55 / 0 / 450

### 4.2 Mobile scale

- Hero: 44px / 0.98 / -0.038em / 600
- H1: 36px / 1.02
- H2: 30px / 1.08
- H3: 23px / 1.15
- Body L: 17px / 1.5
- Body: 15px / 1.5

### 4.3 Rules

- No all-uppercase large marketing headlines.
- Uppercase is acceptable for micro labels and metadata only.
- Maximum marketing paragraph line length: ~68 characters.
- Dense Workbench labels may be shorter and tighter.
- Numeric/tabular data should use tabular number features.

## 5. Spacing

Base unit: 4px.

Canonical sequence:

```text
4 8 12 16 20 24 32 40 48 64 80 96 128 160
```

Public-page vertical section spacing:

- desktop compact: 80px
- desktop normal: 112px
- desktop major: 144px
- mobile compact: 56px
- mobile normal: 72px
- mobile major: 96px

## 6. Geometry

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-xl: 28px;
--radius-full: 999px;
```

Usage:

- inputs/buttons: 8px;
- ordinary cards: 14px;
- major canvas/preview shells: 20px;
- hero composer: 20px;
- tags/chips: full only when semantically chip-like;
- Workbench panels: 0–10px depending location; do not make docked panels floating pills.

## 7. Borders and shadows

Default border: 1px.

Light:

```css
--border-subtle: 1px solid #D9D6CF;
--shadow-1: 0 1px 2px rgba(17,18,23,.05);
--shadow-2: 0 8px 24px rgba(17,18,23,.07);
--shadow-3: 0 20px 60px rgba(17,18,23,.10);
```

Dark:

```css
--dark-border: 1px solid #272C34;
--dark-shadow: 0 16px 50px rgba(0,0,0,.30);
```

Do not stack strong border + heavy shadow + glass blur together without a specific visual reason.

## 8. Layout grid

Maximum marketing width: **1480px**.

Main content width: **1280px**.

Text content width: **760px**.

Page gutters:

- ≥1600px: 48px
- 1200–1599px: 32px
- 768–1199px: 24px
- <768px: 16px

Desktop marketing grid: 12 columns.

Catalogue grid:

- ≥1440px: 4 columns
- 1024–1439px: 3 columns
- 720–1023px: 2 columns
- <720px: 1 column

Grid gap:

- desktop: 20px
- mobile: 16px

## 9. Header

Desktop:

- height: 64px;
- sticky top 0;
- initially uses canvas background;
- after 24px scroll, background becomes `rgba(244,242,237,.88)` with backdrop blur 14px and bottom hairline;
- content constrained to 1480px.

Navigation gap: 24px.

Primary CTA height: 36px.

Mobile:

- height 56px;
- logo left;
- search and menu right;
- menu opens full-width sheet, not tiny dropdown.

## 10. Homepage hero

Desktop target visible hero height: 720–780px depending viewport.

Hero top spacing from header: 82px.

Headline width: ~900px.

Supporting copy width: ~680px.

Product Composer:

- desktop width: 860px;
- min-height: 184px;
- margin-top: 40px;
- background: surface-raised;
- border: hairline;
- radius: 20px;
- shadow: shadow-2;
- text input region min-height: 96px;
- bottom tool row min-height: 56px.

Composer should look like a serious instrument, not a chatbot bubble.

Primary Compose button:

- cobalt background;
- 42px height;
- 8px radius;
- icon arrow on right;
- subtle press state;
- no glow.

## 11. Direction cards

Three cards in one row at wide desktop.

Each:

- 420–460px ideal width;
- 16:10 preview area;
- small index label;
- direction name;
- one-sentence philosophy;
- small DNA bar/chips;
- Choose and Blend actions.

One may be visually featured with slightly stronger border, not a giant size difference.

## 12. Resource cards

Card background follows public shell.

Preview area:
- 16:10;
- 14px radius at top;
- overflow hidden;
- internal canvas may be dark/light independent of shell.

Metadata footer:
- 52–64px;
- resource title 13–14px medium;
- metadata 11–12px;
- compact indicators.

Hover:
- preview lifts visually by at most 2px;
- overlay actions fade/translate 4px;
- no dramatic scale animation.

## 13. Workbench layout

Desktop application shell fills viewport.

Top toolbar: 56px.

Left rail/panel: 280px.

Right inspector: 340px.

Bottom command bar: 64px.

Canvas occupies remaining area.

Panel borders are structural, not decorative.

Workbench chrome should feel closer to Figma/Linear/IDE precision than a marketing website.

## 14. Canvas

Canvas background:

`#0B0D10` with extremely subtle 24px grid/dot field at 2–3% opacity.

Generated page frame:

- default width corresponds to selected viewport;
- white/light or product-defined background;
- no artificial device frame in Responsive/Desktop modes;
- optional device chrome only in explicit Device Preview mode.

Selection:

- cobalt 1px outline;
- 4px corner handles only when direct geometry edit is relevant;
- node label appears above selection in compact dark chip.

Hover target:

- faint blue outline at 40% opacity.

Locked target:

- small lock badge in selection label; no visual clutter when not selected.

## 15. Inspector

Inspector section pattern:

- 40px section header;
- label left;
- reset/inheritance indicator right;
- 12–16px panel padding;
- 1px divider.

Controls use:

- 32px text fields/selects;
- 28px compact segmented controls;
- 4px track sliders;
- 13px labels;
- 11px inherited-value notation.

Explicit override: bright text.

Inherited value: muted text + subtle linked/inheritance indicator.

## 16. Feel Mixer

Each pinned trait is a compact row:

```text
Professional       80
[──────────────●───]
```

Maximum five expanded rows.

Additional traits appear as small chips below.

Do not render twenty sliders at once.

## 17. Visual Ambition control

Use a horizontal segmented/continuous hybrid with five named stops:

- Essential
- Refined
- Striking
- Stunning
- Experimental

Numeric value may appear in advanced mode only.

The control should visibly change a small live sample when dragged.

## 18. Structural Creativity control

Same interaction model as Visual Ambition, with:

- Familiar
- Modern
- Inventive
- Radical
- Experimental

Use a distinct icon/metaphor from Visual Ambition. Do not imply one is “better”.

## 19. Buttons

Primary:
- cobalt fill;
- white text;
- 8px radius;
- heights 32/36/42 depending context.

Secondary:
- transparent/surface;
- hairline border;
- ink text.

Tertiary:
- no border;
- text + optional icon.

Destructive:
- danger text or controlled danger fill only on confirmation.

Focus:
- 2px cobalt ring with 2px offset.

Disabled:
- lower contrast but text remains readable;
- cursor does not imply action.

## 20. Inputs

Height:
- standard 38px;
- compact Workbench 32px.

Textarea:
- normal radius 10px;
- resize behaviour explicit;
- no browser-outline removal without replacement focus ring.

Placeholders must remain distinguishable but readable.

## 21. Chips

Chips are reserved for:

- tags;
- active filters;
- traits;
- status;
- compact metadata.

Do not make all buttons pill-shaped.

## 22. Icons

Platform chrome uses Lucide.

Sizes:
- micro: 12px
- compact: 14px
- standard: 16px
- emphasized: 18px
- marketing illustrative icon: max 22–24px unless custom diagram.

Stroke width generally 1.75–2.

## 23. Motion system

Platform chrome motion should be restrained.

Durations:

```text
instant: 80ms
fast: 140ms
standard: 220ms
slow: 360ms
scene: 600–900ms only for demonstrations
```

Easing:

- standard: cubic-bezier(.2,.8,.2,1)
- enter: cubic-bezier(.16,1,.3,1)
- exit: cubic-bezier(.4,0,1,1)

Use spring motion for direct manipulation, not every page entrance.

### Reduced motion

At `prefers-reduced-motion: reduce`:

- no parallax;
- no scroll-linked transformation required for comprehension;
- no automatic continuous decorative motion;
- replace complex transitions with opacity or immediate state change;
- video autoplay may be replaced with poster/static treatment where feasible.

## 24. Public-page section rhythm

The page alternates between:

- editorial explanation;
- live interactive proof;
- resource mosaic;
- structured diagrams.

Avoid twelve consecutive card grids.

At least every second major section should change information mode.

## 25. Responsive breakpoints

Author against behaviour, but canonical reference breakpoints are:

```text
sm  640px
md  768px
lg  1024px
xl  1280px
2xl 1536px
```

### Responsive rule

Generated UI resources declare strategy:

- compress;
- stack;
- collapse;
- transform;
- substitute;
- omit-nonessential.

The Workbench preview must expose which strategy applies.

## 26. Mobile public shell

Mobile homepage:

- hero consumes ~80–90svh at most, not 150vh;
- composer becomes vertical;
- advanced controls collapse into a sheet;
- three directions become horizontally scrollable snap cards or vertical stack;
- live catalogue uses one/two-column depending width;
- dense diagrams become horizontally scrollable only when a native reflow would destroy meaning.

## 27. Mobile Workbench

Do not pretend full desktop spatial editing works on 390px.

Mobile Workbench mode supports:

- page browsing;
- node selection;
- intent/style editing;
- replace;
- lock;
- prompt mutations;
- preview;
- audit;
- save/export.

Full freeform canvas/layer manipulation may display a “best on desktop” affordance while still keeping essential editing available.

## 28. Empty/loading/error states

Every data-dependent surface defines all three.

### Loading
Prefer skeleton/layout-preserving loading.

### Empty
Explain what belongs here and provide one next action.

### Error
State:
- what failed;
- whether work is safe;
- retry/action;
- diagnostic ID only when useful.

Never use vague “Something went wrong” as the only error content.

## 29. Accessibility

- WCAG 2.2 AA target.
- keyboard navigation across all primary workflows.
- visible focus rings.
- 44×44 touch target goal where practical on mobile.
- labels for icon-only controls.
- no colour-only state indication.
- accessible dialog/sheet focus trapping.
- proper heading structure.
- live regions only where necessary.
- drag-and-drop operations must have keyboard alternatives.

## 30. Visual quality gate

Before a new product page or major Workbench feature is accepted:

1. capture desktop screenshot at 1440×1000 or taller;
2. capture mobile screenshot at 390×844;
3. inspect spacing, hierarchy and overflow;
4. compare to this system and reference directions;
5. verify dark/light contrast;
6. verify keyboard/focus;
7. verify reduced motion.

The goal is not pixel-copying the reference SVGs. The goal is preserving the identity and hierarchy they define.
