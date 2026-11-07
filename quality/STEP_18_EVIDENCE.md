# Step 18 — Intent inheritance

**Result:** locally verified at desktop and mobile browser sizes. The public
review Site has not been redeployed; deployed verification remains for Step 45.

The visible Direction C Workbench journey used the exact employee-experience
brief. At 1440 × 900 it changed the project value, edited the selected page and
its nested layout, changed and reset a resource node, navigated to another screen
and back, refreshed, and confirmed the saved value remained. It then locked the
resource's Design DNA, changed the parent while the child was locked, verified
that the child stayed frozen, unlocked it, and used **Reset to Inherited** to
pick up the new parent value.

The generated Direction C project was inspected before choosing test nodes. Its
deepest available chain in this run was `layout → layout → block`; it did not
contain a single path through section, component, and element nodes. The E2E
report records the selected node path rather than assuming one. A second journey
opened the public Playful HR showcase and followed its visible **Edit a local
copy in Workbench** link. That project supplied actual section, component, and
element nodes. Each was selected in the Layers UI, checked for inherited DNA,
overridden through the Feel Mixer, and reset through the visible control.

The audit found two defects. Project Scope falsely labelled all seven current
DNA values as inherited. The lock controls also omitted that frozen effective
values remain local after unlocking until reset. The UI now says **Project** at
the project source scope, **Inherited / Overridden / Locked** for node values,
and explains the lock snapshot and reset behavior in the Locks panel. The
reset tooltip names inheritance from the node's ancestors.

Before screenshots are in [`evidence/step-18/before/`](evidence/step-18/before/).
After screenshots and runtime reports are in
[`evidence/step-18/after/`](evidence/step-18/after/). The machine-readable audit
records these as AUD-150 and AUD-151. The visible regressions passed against the
locally built Astro production preview at 1440 × 900 and 390 × 844. The reports
record zero console errors or warnings, uncaught exceptions, failed requests,
and HTTP errors. The focused store lock-snapshot regression also passes. The
repository checks for this step passed: `pnpm typecheck`; `pnpm lint` with zero
errors and 51 existing configured warnings; `pnpm test` with 911 tests across
63 files; and the focused Playwright spec with four passing tests and four skips
for the opposite viewport-specific project. `pnpm audit:all` passed all 16
release gates, built 717 Astro pages, and passed bundle budgets, licence and
provenance, and security audits. The focused Playwright spec was rerun against
that production build. The configured Playwright process emitted a Node
`NO_COLOR`/`FORCE_COLOR` environment warning; captured page runtime reports
remain clean. Subsequent source changes were limited to tests and documentation.

The three-direction project still uses the resource kinds actually selected by
composition; the showcase journey supplies the additional node kinds without
altering the composed project or seeding internal Workbench state. No
authentication, API, database, storage binding, secret, or infrastructure
change was required.
