---
trigger: glob
globs: "apps/site/**, packages/ui/**, packages/workbench/**, apps/preview/**"
description: "Tessellate frontend, Workbench and visual-system implementation rules."
---

# Tessellate Frontend Rules

Before material visual work, read:

- `docs/DESIGN_SYSTEM.md`
- `design/REFERENCE_DIRECTIONS.md`
- `docs/WORKBENCH_SPEC.md` when Workbench-related.

Rules:

1. The public shell is warm off-white/editorial with deep cobalt interaction accent and sparse acid-lime micro-accent.
2. The Workbench is near-black, dense, precise and structurally divided.
3. Do not introduce generic purple/blue AI gradients, excessive glassmorphism, floating neon orbs, gratuitous glow or giant pill-everything styling.
4. The library/resource previews provide spectacle; platform chrome is deliberately restrained.
5. Public shell must remain responsive and WCAG 2.2 AA-targeted.
6. Reduced motion is mandatory.
7. Every core action is keyboard accessible and has visible focus.
8. Do not ship fake buttons, static screenshot substitutes for specified functional product UI or fake customer/proof content.
9. Use semantic Tessellate design tokens; do not scatter hard-coded brand values across components.
10. Astro remains the public shell; hydrate React only where interaction requires it.
11. Do not turn the public site into a full SPA for convenience.
12. Keep Workbench canonical project state separate from ephemeral hover/selection/panel state.
13. Avoid initial-loading heavy subsystems (semantic model, CodeMirror, 3D) before needed.
14. Catalogue grids do not mount every live animated preview simultaneously.
15. For major UI changes, inspect 1440px desktop and 390px mobile renderings before declaring completion.
