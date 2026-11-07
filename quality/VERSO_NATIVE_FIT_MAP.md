# Verso capability fit in Tessellate

**Status:** capability mapping; not a licence grant, resource certification, or claim of complete component parity.

**Scope:** translate the useful functional roles found during the owner-only Verso inventory into Tessellate's existing resource, manifest, editor, tool, and agent surfaces. Do not copy source, expressive design, component names, demo copy, or upstream brands into the public product.

## Eligibility and evidence boundary

The private source inventory contains 1,053 resource entries. Its package declares
`UNLICENSED` and `private`; the available lineage/provenance records do not grant
redistribution rights. Therefore **0 entries are currently cleared for inclusion**
in Tessellate's public catalogue, Gold runtime, Workbench registry, CLI/MCP
distribution, browser export, or Sites build. The local isolated preview is an
inspection aid only. Its 1,053/1,053 render result says nothing about licensing,
functional equivalence, accessibility certification, or export eligibility.

The integration path for ineligible material is to express general user needs
through Tessellate's own contracts and independently authored resources. The
Tessellate examples below are existing catalogue assets; they are **not** asserted
to be derivatives or one-to-one replacements for any private source item. Their
licence, provenance, and runtime status remain those in the canonical Tessellate
catalogue. A family-level fit is not proof that every behavior in that family is
already implemented.

## Functional-family fit

### Aggregate coverage of the supplied inventory

The owner-supplied Verso README lists 1,053 components. The following count
crosswalk accounts for those entries by broad functional role, while omitting
private component identifiers, names, descriptions, source, and visual
expression. These are source-inventory counts, not Tessellate resource counts
or per-item parity claims.

| Functional role in the supplied inventory | Entries | Tessellate destination | Current fit and gap |
| --- | ---: | --- | --- |
| Ambient backgrounds and spatial/depth visuals | 152 (103 + 49) | Backgrounds, Effects, Motion, Data, resource preview | Partial/Lab. Existing effects cover selected use cases; there is no certified general 3D scene authoring or runtime. |
| Kinetic typography | 35 | Typography and Motion catalogue; Typography Lab; Motion Studio | Partial. Selected text effects exist; each resource still needs its own accessibility, reduced-motion, responsiveness, performance, and export evidence. |
| Pointer-driven visual feedback | 23 | Motion catalogue and Workbench replacement | Partial. Only certified touch/keyboard-safe behavior is Core; the remaining pointer effects stay outside Core rendering. |
| Interactive objects and application/agent interfaces | 399 (99 + 300) | Components, Blocks, AI resources, `ResourceManifest`, Workbench | Strong for validated, composable UI patterns; partial for application-specific behavior. Tessellate does not import arbitrary event logic or agent workflows. |
| Marketing sections and complete page examples | 396 (378 + 18) | Sections, Pages, Blueprints, Showcases, `ProjectManifest` | Strong for product/page hierarchy; no one-to-one visual or behavioral parity is asserted. |
| Multi-part compositions with shared state | 24 | `ScreenGraph`, `ProjectManifest`, validated Workbench mutations | Strong for state represented by Tessellate contracts; no private state implementation is imported. |
| Authoring instruments | 24 | The existing ten `/tools` surfaces and Workbench | Partial. Existing tools cover selected jobs; they do not represent one-to-one equivalents for every instrument. |
| **Total component entries** | **1,053** |  | **All source entries are accounted for at this aggregate level; none are cleared for redistribution.** |

The separate 20-document Scribe kit is not included in the component total. Its
general authoring jobs map to Tessellate's existing public documentation, CLI,
and MCP contracts. No Scribe text or source-specific recipe is transferred.

The counts above were checked against the current owner-supplied source README.
They are useful for coverage accounting only: they do not prove that a given
source item maps to a particular Tessellate resource, that a behavior is
implemented, or that the item is licensed. The source package remains private
and `UNLICENSED`; public eligibility remains 0/1,053 until written rights cover
each implementation and its lineage.

| Functional family | Existing Tessellate home | Existing examples / status | Fit and remaining limit |
| --- | --- | --- | --- |
| Ambient visual layers and backgrounds | Backgrounds and Effects catalogue; Background Studio; resource preview | `subtle-grid-field` (Gold); other effects remain individually classified | Partial. Composition can select a certified background resource. A general shader authoring surface and every private visual effect are not part of Core. |
| Expressive or animated typography | Typography and Motion catalogue; Typography Lab; Motion Studio | `counter-typography`, `word-stagger-reveal` (catalogue resources; not Gold-certified) | Partial. Existing assets and controls cover selected treatments. Each resource still requires its own reduced-motion, keyboard, responsive, performance, and export evidence. |
| Pointer-driven visual feedback | Motion catalogue and Workbench resource replacement | `magnetic-button` (Gold); pointer-specific resources remain non-Gold | Partial. Pointer input must have a touch/keyboard-safe equivalent and reduced-motion path. Non-Gold implementations remain isolated from Core rendering. |
| Spatial, depth, and media treatments | Effects, Motion, and Data catalogue | `interactive-globe`, `integration-orbit`, `parallax-media` (non-Gold) | Lab/partial. Tessellate can describe and preview selected effects; it has no certified general-purpose 3D scene/editor or blanket export guarantee. |
| Interactive controls and objects | Components and Blocks; `ResourceManifest` slots/props; Workbench node tree | `button`, `input`, `select`, `dialog`, `badge`, `advanced-data-table`, `kanban-board`, `timeline`, `dashboard-kpi-grid` (Gold) | Strong functional fit for composable UI primitives and application patterns. A visual resource does not import arbitrary event logic; behavior must use the validated resource contract. |
| Marketing sections and page structures | Sections and Pages; Section Planner; Compose screen planning | `editorial-hero` and the certified Gold section set | Strong structural fit. The planner and `ProjectManifest` express page hierarchy; they do not claim a one-to-one match for every private section design. |
| Application and agent-facing interface patterns | Blocks and AI catalogue; Compose, Workbench, MCP | Gold application blocks and AI patterns; non-Gold resources remain preview-only | Partial. Tessellate models screens and visible interaction patterns. Resource previews do not execute an agent, external workflow, or arbitrary source code. |
| Complete product/page examples | Blueprints, Showcases, `ProjectManifest`, React/Vite export | Existing manifests and verified export path | Strong architectural fit: complete examples are projects with screens and resource references, not opaque page components. Fidelity is bounded by the certified resources and exporter evidence for each project. |
| Multi-part compositions with shared state | `ScreenGraph`, `ProjectManifest`, Workbench mutations, locks, history | Existing validated node/resource/variant contracts | Strong architectural fit. Express the composition as normal manifest nodes and validated operations so selection, locks, undo, audit, and export can reason about it. |
| Small authoring instruments | The ten existing `/tools` surfaces and Workbench | Accessibility, Background, Data Viz, Design DNA, Icons, Layout, Motion, Palette, Section Planner, Typography | Partial. Existing tools cover selected authoring jobs; they are not a promise of one dedicated tool per private instrument. Keep incomplete behaviors labelled Beta/Lab and disconnected from Core state unless their contract says otherwise. |
| Agent guidance and recipes | Public Docs, CLI, and MCP schemas/contracts | Existing documented manifest, search, compose, validate, audit, and export operations | Partial. Agents should use the same public contracts as the GUI. Private source instructions and source-specific recipe text are not copied or shipped. |

## Integration rules

1. Keep the public vocabulary canonical: categories, schemas, slugs, source files,
   provenance, and license claims come from Tessellate's own catalogue.
2. Compose through `ProjectManifest` and validated resource references. Do not
   paste a monolithic source component into a manifest or add a second renderer.
3. Only Gold-certified resources execute in the Core Workbench renderer. A
   catalogue resource marked verified but not Gold stays in the isolated preview
   boundary until it passes the relevant certification.
4. Do not claim functional parity from names, visual similarity, a static AST
   inventory, or a successful isolated render. Validate the visible behavior,
   contract, breakpoints, accessibility, security, and export path separately.
5. If a family has no adequate existing Tessellate implementation, record it as
   a product gap. Do not disguise that gap with a placeholder or change the
   resource contract just to make a private component appear to fit.
6. Reconsider direct adoption only after documented rights cover the exact
   implementation and its lineage, required attribution is known, and each
   proposed item passes Tessellate's normal registry and Gold gates. No new
   infrastructure or D1/R2 bindings are required for this mapping.

## Completion assessment

The private source has a safe inspection boundary and all 1,053 component
entries now have an aggregate functional-role destination in Tessellate's
existing architecture. **This is not a claim that the entries have been
individually integrated, that every behavior is implemented, that the mapping
is one-to-one, or that any private entry is eligible for public redistribution.**
No private code, component identifier, description, or design expression is
added to the product by this document. The current next action is product
hardening of the existing Tessellate surfaces, in the ordered programme; new
resource work remains subject to its feature-freeze and release gates.

Evidence: `quality/PRIVATE_VERSO_LOCAL_PREVIEW.md`,
`quality/VERSO_LOCAL_INTEGRATION_EVIDENCE.md`, the source package's `UNLICENSED`
metadata, and the canonical catalogue/Gold registry. The inventory and source
projections stay outside the Tessellate repository.
