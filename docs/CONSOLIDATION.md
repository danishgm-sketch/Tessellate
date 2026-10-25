# Source reconciliation

Started 2026-10-16 from main `aaef85cbdbdb13451a503469c49cfa424a5cf7ee`.
The sole integration candidate is `consolidation/product-hardening`.

| Source                 | Treatment and reason                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current main aaef85c   | Base. Retain existing packages and secondary exporters; expansion is frozen.                                                                                                                                                                                                                                                                                                  |
| Audit 7c42424 / PR #3  | Apply source/resource/fixture corrections and regression tests through a three-way patch. Reconcile overlapping Compose, Workbench, source preview and export changes explicitly. Do not copy 9,165 old evidence files or stale generated output. Historical evidence remains addressable on its original SHA.                                                                |
| Laptop 3a93956 / PR #4 | Port durable authenticated queue, shared IntentCommand schema, Docker setup and truthful offline command behavior. Reuse existing Sites adapter. No DNS/tunnel/hosted database is provisioned.                                                                                                                                                                                |
| Sites 87b2ee8          | Preserve isolated payload asset routing, enforced headers and iframe message isolation through the laptop branch's existing adapter.                                                                                                                                                                                                                                          |
| Later Claude fa663bf   | Reviewed as a separate unmerged 1,087-file line including new queue/model architectures and resource contract v2. Do not import wholesale: it would replace the baseline/contracts before certification and violate the freeze. Its brand/content and resource-contract fixes remain candidate evidence for the relevant ordered gates. No new model architecture is adopted. |

The React exporter uses audited structured props, local overrides and layout code.
Existing Next.js/native/token dispatch remains available for later tier evaluation;
the baseline does not advertise its fidelity as proven. Keep 324 resource discovery
from current main while incorporating compiler-derived prop metadata from the audit.
Regenerate all distributed source and catalogue artifacts from this combined tree.

Mobile keeps the audited editor, export and inspector flows with the shared laptop
command/status implementation. Deterministic commands take precedence over model
classification. Historical model execution evidence proves transport, not intent quality.

ADR collision: original release verification remains D-032; historical expansion
is D-040. Audit decisions are D-033 through D-039; laptop infrastructure is D-041;
the owner's current operating programme is D-042. Historical claims are not current
release certification. Existing public Site remains a separate deployed revision
until the RC gate authorizes publication.

Main protection is enabled, including administrators: strict required `validate`
CI, PR workflow, resolved conversations, no force pushes/deletion. It requires no
additional approving reviewer because this is an owner-operated repository; a PR
and passing checks are still mandatory. No branch was merged by consolidation.

## Baseline status

The latest exact-head CI baseline is GREEN at
`37654e58e6483a718240aa1b520c669b15cdbdad`, with successful push CI, required PR
CI, and the 16-point quality/security workflow on the same SHA. All eight
baseline commands and the complete browser suite passed on fresh hosted
checkouts using the pinned Ubuntu runner and Node 24. See
[`quality/evidence/step-02-current-head-2026-10-25.md`](../quality/evidence/step-02-current-head-2026-10-25.md)
for exact counts, budgets, known non-blocking runner notes, and run URLs. The
earlier local fresh-checkout baseline at `2ba70b6f9a493951f0cb0e9c097204c7903e1248`
is retained in
[`quality/evidence/step-02-fresh-checkout-2026-10-24.md`](../quality/evidence/step-02-fresh-checkout-2026-10-24.md).
The consolidation and baseline gates are complete; hardening continues in
the ordered steps in `docs/PRODUCT_HARDENING.md`.
