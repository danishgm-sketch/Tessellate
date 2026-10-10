---
trigger: glob
globs: "resources/**, packages/catalog/**, packages/registry/**, packages/compatibility/**"
description: "Rules for Tessellate resource catalogue, provenance, compatibility and registry work."
---

# Tessellate Resource Rules

Before changing catalogue/resource behaviour, read:

- `docs/DATA_CONTRACTS.md`
- `docs/COMPOSITION_ENGINE.md`
- `docs/QUALITY_SECURITY.md`
- `docs/LAUNCH_INVENTORY.md`

Rules:

1. Git is the canonical public resource catalogue.
2. `docs/LAUNCH_INVENTORY.md` is the authoritative public-beta inventory. Do not substitute a different 324-resource set to satisfy counts.
3. Every resource must validate against canonical `ResourceManifest`.
4. Every non-original resource requires clear provenance and redistribution-compatible licensing.
5. Ambiguous licensing blocks publication.
6. A verified resource requires overall quality score >=80.
7. Every verified resource is checked at 360px, 768px and 1440px.
8. Animated resources require reduced-motion behaviour.
9. Dependencies must be declared and imports should be checked against declarations.
10. Do not introduce remote runtime asset/network requirements without explicit manifest metadata and a justified reason.
11. Resource styles map to semantic project tokens so the Normalisation Engine can create cohesive compositions.
12. Preserve intrinsic visual identity only where it defines the resource; normalize ordinary typography, spacing, geometry, colour roles and motion timing.
13. Hard compatibility constraints execute before soft scoring and cannot be bypassed by AI.
14. The scoring model and weights in `COMPOSITION_ENGINE.md` are authoritative.
15. Do not inflate catalogue counts by treating variants as separate canonical resources.
16. Do not scale catalogue production before the end-to-end single-resource pipeline and validation tooling are stable.
17. Never mass-ingest scraped commercial component code.
