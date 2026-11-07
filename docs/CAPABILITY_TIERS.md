# Capability tiers

Captured for hardening step 04 on 2026-10-16. The complete 158-row assignment
is in [`CURRENT_PRODUCT_INVENTORY.md`](CURRENT_PRODUCT_INVENTORY.md).

## Meaning

- **Core** is the intended production support boundary and the deterministic,
  guest-first product promise. A Core assignment is not release certification;
  every assigned feature must still pass the applicable checks in
  [`quality/FEATURE_MATRIX.md`](../quality/FEATURE_MATRIX.md) and its ordered
  hardening gate.
- **Beta** is a usable secondary capability with known limitations. The
  interface labels it Beta, explains the limitation, and leaves Core project
  state unchanged when the capability is unavailable or fails.
- **Lab** is experimental and isolated from Core. It is off by default, has an
  explicit Lab label, and cannot change a Core project without an explicit
  user action after its output is reviewed.

The tier answers “what support boundary is intended?” The inventory's status,
known-defect and test-matrix fields answer “what evidence exists today?” No
feature is promoted by source presence or a tier label.

## Assignment summary

The 158 inventory rows are assigned as follows:

| Tier | Rows | Boundary |
| --- | ---: | --- |
| Core | 86 | Public catalogue and discovery; deterministic composition; Design DNA; Workbench core editing, local persistence and preview; validated manifest and React/Vite export; static registry; core CLI and local MCP resource/manifest tools. |
| Beta | 63 | Secondary public surfaces, ten client tools, account/cloud/API paths, BYO AI, optional laptop service, advanced mutations and agent integrations, and secondary web/token exporter library APIs. |
| Lab | 9 | Local semantic search adapter, bespoke laptop model, Expo/React Native and SwiftUI exporter library APIs, R2-dependent behavior not enabled here, and Workbench operations not surfaced as separate supported actions. |

The full assignment is deliberately explicit rather than implied by route
presence. For example, an Astro route can be Core while a server-backed action
on that route is Beta; a Lab implementation may exist in source without being
available in the product UI.

## Isolation and labels

- The `/tools` directory and every tool route display a Beta notice. These
  browser tools are exploratory; their output is not a product audit or a
  saved-project mutation.
- Beta public routes show their tier and a plain-language limitation. The
  Workbench command bar identifies the laptop model as Lab and reports whether
  the laptop backend and Docker are available.
- Deterministic command patterns remain the default. An unrecognized prompt
  cannot silently fall through to the bespoke model. The model path requires an
  explicit opt-in; its proposed mutations are held for review and are applied
  only after the user chooses **Apply proposal**. Discard leaves the manifest
  unchanged. The switch is unavailable while the laptop host is offline.
- Local semantic search is not wired into Explore or Compose. Its adapter
  reports unavailable until a real embedding model exists; full-text search is
  the only active search path.
- Secondary Next.js, agent-handoff, W3C-token, Expo and SwiftUI generators are
  package APIs only; none is selectable from the Workbench or current CLI
  export command. Their generated output is not certified. Native target
  output remains Lab.
- Rethink Structure and Hide node are not exposed as product actions. The
  deterministic “rethink” alias is not advertised as a distinct structural
  operation. Their inventory rows remain Lab until a separate usable behavior
  is demonstrated.
- The resource detail “Core” tab badge was removed: tab importance is not a
  capability tier. Resource quality and runtime eligibility remain separate
  metadata and are not treated as certification by this assignment.

## Promotion rules

Promote a Beta or Lab item only after it passes the same feature-specific
matrix dimensions as the corresponding Core surface, has clear errors, docs,
responsive and accessibility coverage where applicable, and does not weaken
security or cost limits. Demote a Core row when its gate fails. Preserve an
explicit reason and evidence link in the inventory; never change tiers just to
make the feature count look complete.
