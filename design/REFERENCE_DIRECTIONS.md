# Tessellate Visual Reference Directions

These references exist to prevent aesthetic drift during autonomous implementation. They are not suggestions for unrelated alternatives. The implementation may refine details, but it must preserve the identity, hierarchy and contrast between the public shell and the Workbench.

Two primary reference directions are defined:

1. **Editorial Instrument** — public site / homepage / catalogue.
2. **Command Studio** — Workbench / composition environment.

The provided SVGs are structural visual boards:

- `design/reference-home.svg`
- `design/reference-workbench.svg`

They are intentionally self-contained vectors so any coding agent can open them without external assets.

## Direction A — Editorial Instrument

### Emotional target

A sophisticated creative-engineering publication crossed with a professional design tool.

It should feel:

- calm;
- highly intentional;
- contemporary;
- expensive without luxury clichés;
- technical without looking like a terminal theme;
- creative without visual chaos.

Think in terms of **editorial confidence plus product precision**, not “AI startup”.

### Composition

Large warm off-white field.

Sparse, beautifully aligned header.

Hero headline is enormous but not theatrical:

> Describe the product.  
> Get the interface.

The Product Composer is the visual anchor: one large, tactile white command surface with crisp border, subtle depth and carefully grouped controls.

Below it, three design-direction preview cards form the first evidence layer.

Then the page alternates between:

- large text statements;
- interface mosaics;
- clean comparison diagrams;
- a dark Workbench reveal;
- creator/resource proof.

### Avoid

- blue-to-purple background gradients;
- star/sparkle motifs;
- floating translucent orbs;
- giant gradient text;
- fake customer logos;
- excessive rounded pill controls;
- frosted-glass cards on every section;
- excessive centered copy.

### Signature details

1. Warm paper-like canvas instead of pure white.
2. Cobalt interaction accent.
3. Tiny acid-lime system signal used at most once or twice per viewport.
4. Hero composer shadow so subtle it is felt before noticed.
5. Resource previews contain the visual spectacle; the platform around them is restrained.
6. Hairline separators and precise typographic alignment.
7. Occasional diagram lines showing relationships between components/resources.

## Direction B — Command Studio

### Emotional target

A serious interface-design operating environment.

It should feel:

- powerful;
- technical;
- calm;
- high information density;
- direct-manipulation oriented;
- closer to a professional creative tool/IDE than a web dashboard.

### Composition

Near-black shell.

Top toolbar 56px.

Left semantic navigation/layer panel 280px.

Right inspector 340px.

Bottom command bar 64px.

Central canvas is spacious and slightly darker than side panels, with an almost invisible dot/grid field.

The generated product itself provides contrast inside a bright or custom-coloured frame.

### Signature details

1. Structural borders, not floating rounded panes everywhere.
2. Blue selection outline.
3. Muted inherited-value labels in inspector.
4. Rich but compact typography.
5. Tiny provenance/compatibility metadata.
6. Bottom AI command bar is treated as a native instrument surface, not a chat bubble.
7. Motion is fast and restrained.
8. No gratuitous glow.

## Reference board 1 — homepage

`reference-home.svg` defines:

- header hierarchy;
- hero headline scale;
- Product Composer proportions;
- three-direction card treatment;
- catalogue mosaic rhythm;
- light-to-dark transition into Workbench section.

The coding agent should open this SVG during first homepage implementation and again during final visual QA.

## Reference board 2 — Workbench

`reference-workbench.svg` defines:

- global Workbench density;
- panel proportions;
- central canvas treatment;
- generated interface framing;
- inspector hierarchy;
- command bar prominence;
- selected-node treatment.

## GPT Images / image-model reference generation briefs

When an image-generation tool is available, generate the following images and save the selected outputs under `design/generated/` with the filenames shown below. Do not use generated imagery as literal product screenshots if it contains impossible UI. Use it as art-direction reference, then implement functioning equivalents.

### Image 1 — Homepage art direction

Target filename:

`design/generated/homepage-editorial-instrument.webp`

Prompt:

> Ultra-premium web product design board for a platform called “Tessellate”, a free AI-assisted interface composition system for developers and design agents. Desktop website at 1440px wide. Warm off-white paper-like canvas (#F4F2ED), black editorial typography, precise Swiss-grid spacing, deep cobalt interaction accents and extremely sparse acid-lime micro accents. Header is minimal and professional with Tessellate geometric tile mark, Explore, Compose, Workbench, Tools, Agents, Creators, Docs. Hero headline reads “Describe the product. Get the interface.” in huge refined modern grotesk typography. Below headline is a sophisticated white product-composer command surface, not a chatbot: large brief textarea, compact controls for Feel, Visual Ambition, Structure, Stack, and a cobalt Compose button. Below that are three refined live UI direction preview cards with different product interface styles. Further down show a beautiful mosaic of varied UI component previews, followed by a dramatic but restrained dark Workbench reveal. Visual personality: editorial design publication + world-class developer tool + modern industrial design, calm, intelligent, high craft, no generic AI gradients, no glowing purple, no floating 3D blobs, no glassmorphism overload, no fake logos, no cyberpunk. Photorealistic web-design presentation, pixel-perfect spacing, realistic usable UI, 16:10 landscape composition.

Negative prompt / constraints:

> Avoid purple gradient AI startup aesthetic, excessive glass, neon glow, giant pills, random floating elements, illegible text, fake browser chrome, childish icons, sci-fi HUD, Dribbble fantasy UI that could not be built.

### Image 2 — Workbench art direction

Target filename:

`design/generated/workbench-command-studio.webp`

Prompt:

> High-fidelity desktop interface design for “Tessellate Workbench”, a professional AI-assisted UI composition studio, 1440x1000 viewport. Near-black application shell (#0B0D10), 56px precision top toolbar, 280px left semantic project/pages/layers/library panel, 340px right inspector, 64px bottom command bar, huge central canvas. The central canvas shows a sophisticated financial intelligence product being designed, with a bright interface frame. Blue 1px selection outline around a chart section. Right inspector shows Intent controls, Feel Mixer sliders (Professional, Technical, Premium), Visual Ambition, Structural Creativity, inherited-value indicators, Style and Motion tabs. Left panel shows semantic tree, not implementation divs. Bottom command bar reads “Tell Tess what to change…” with examples of structured AI editing. Tiny metadata, crisp dividers, compact typography, extremely polished. Aesthetic: Figma/Linear/modern IDE precision with original identity, powerful and calm, no gratuitous glow, no cyberpunk, no glass cards floating everywhere. Must look fully buildable as React web application, realistic spacing and controls, not concept art.

Negative prompt / constraints:

> Avoid sci-fi HUD, neon cyberpunk, fake holograms, excessive rounded panes, unreadably tiny labels, random graphs, overdecorated gradients, fantasy interactions that are not buildable.

### Image 3 — Stunning showcase composition

Target filename:

`design/generated/showcase-stunning-finance.webp`

Prompt:

> A stunning but production-buildable interface concept generated by Tessellate for a market intelligence platform. Dark charcoal and warm ivory palette, dense professional financial research workspace, asymmetric but highly legible composition, editorial typography, interactive world map, compact financial charts, entity intelligence rail, evidence cards, AI research command surface. Visual Ambition 78/100, Structural Creativity 62/100, Professional 95, Technical 90, Playful 8, Trust 96. Selective cinematic motion implied through layered transitions, no unnecessary 3D. It should feel like a next-generation institutional research terminal designed by an elite product team, not a crypto dashboard. 16:10 desktop UI screenshot, extremely high polish, realistic data density, WCAG-conscious contrast, buildable React interface.

### Image 4 — Professional + playful showcase

Target filename:

`design/generated/showcase-professional-playful.webp`

Prompt:

> Production-buildable SaaS application concept for a collaborative HR platform generated by Tessellate. Overall personality professional 82, playful 42, warm 68, premium 55. Bright warm canvas, confident black typography, cobalt primary actions, selective lime and coral accents, friendly but not childish illustration fragments, rounded geometry used selectively, expressive onboarding area but conservative payroll/settings surfaces. Show one desktop application screen with team pulse, onboarding checklist, people cards, compact analytics and an AI assistant. World-class modern product design, coherent design system, sophisticated microinteractions implied, realistic React/Tailwind implementation, not a Dribbble fantasy.

## Rules for generated-image usage

If an agent has image-generation capability:

1. Generate all four briefs.
2. Generate 2–4 candidates per brief if cost is user-provided/available and select the strongest buildable candidate.
3. Prefer buildability over spectacle.
4. Save only chosen finals to repository; do not commit dozens of discarded candidates.
5. Add a small `design/generated/README.md` documenting model/date/prompt source.
6. Do not copy impossible text from the generated image into implementation.
7. Use generated image as art-direction reference and compare screenshots of real implementation against it.
8. Never require these images for application runtime.

## Visual acceptance language

A correct implementation should be describable as:

> “The shell is quiet enough that the library feels vast, the Workbench is dense enough to feel powerful, and the generated products are expressive enough to prove Tessellate is not another component catalogue.”

If the implementation instead reads as:

> “another purple AI SaaS landing page”

it has failed the visual brief even if technically correct.
