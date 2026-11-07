import { appendFile, readFile, writeFile } from 'node:fs/promises';

const routeReportPath = 'quality/evidence/step-45/public-v78-reaudit/ROUTE_AUDIT.md';
const routeAudit = await readFile(routeReportPath, 'utf8');
if (!routeAudit.includes('All 31 required routes are classified **PASS**')) throw new Error('v78 route report is incomplete');
const v78 = `

## Public v78 re-audit and AUD-471–AUD-491 closeout — 2026-11-06

Public Sites v78 serves canonical commit 3e889d0ca68345c5ccf5ef767c3c05ebc07716ca through Sites source mirror e6387f7ff8e1080a5a4c191cf00faef813719a3d (version appgprj_6acc036de8cc8191a823339566972d85~appgver_67206589708c81919ade92023cb90608; deployment appgdep_6aed6cf7cc288191a4ba98ee07ef81fc). The public URL is https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/.

- Route shell: 31 routes × 1440×900 and 390×844 (62 captures); all returned HTTP 200. The recorded route smoke had no overflow, blank shell, readiness timeout, uncaught exception, failed request, or HTTP error. Contact sheets and captures: [route audit](../quality/evidence/step-45/public-v78-reaudit/ROUTE_AUDIT.md).
- Resource detail and variants: all 324 unique catalogue resources were opened at both widths (648 detail-page viewport visits) and all three variants were rendered (1,944 renders). No route failure, runtime/network failure, empty preview, variant mismatch, or finance-contamination flag was recorded. Fourteen conservative copy-scanner hits across seven resources were manually checked and were intentional skeleton, empty-state, or replaceable sample-pricing copy.
- AUD-471–AUD-491: 21 medium findings now have issue-specific deployed verification. The same visible regressions passed 30/30 across desktop and mobile for sample-data truthfulness, unsupported operational claims, local-only actions, keyboard interaction, reduced motion, and metadata. Evidence and after screenshots: [runtime records](../quality/evidence/step-45/public-v78-reaudit/copy-sweep-runtime.jsonl), [test source](../quality/evidence/step-45/public-v78-reaudit/resource-claims-v78.spec.ts), and [captures](../quality/evidence/step-45/public-v78-reaudit/copy-after/).
- Accessibility and isolated preview: eight representative Axe scans covered resource-detail shells and actual isolated preview frames at both viewports; zero violations. The preview security boundary and CSP were retained. The corrected capture helper inspects the child iframe rather than querying the host document. Reports: [Axe results](../quality/evidence/step-45/public-v78-reaudit/axe-resource-results.json) and [preview reports](../quality/evidence/step-45/public-v78-reaudit/previews/).
- Runtime: no uncaught exceptions, failed requests, or HTTP errors in the route sweep, 30 targeted regressions, or 648-page resource corpus. One browser deprecation warning for window.styleMedia appeared once on the mobile globe-detail test; it did not recur in the 13-route repeat, corpus run, or preview capture. It remains recorded as a non-reproduced observation, not silently omitted.

The register contains 495 findings: 0 Critical, 87 High, 379 Medium, and 29 Low. Statuses are 270 closed-deployed-verified, 112 fixed-awaiting-deployed-verification, 98 locally verified, 9 historical closed, 2 closed-local, 2 legacy fixed, and 2 documented Sites-host limitations. The remaining unverified group includes 108 Medium and 4 Low findings. AUD-419 remains the sole nonclosed High finding; provider-forwarding cannot be certified while the optional laptop host/provider endpoint is unconfigured.

This is not a complete Step 39 copy review: all resource pages and variants were sampled/rendered, but manual language review across every visible string in the entire site, CLI, MCP, documentation, and all secondary workflows remains open. Step 48 release and the broader hardening sequence remain incomplete. Verso remains integrated only through its owner-local private inspection adapter; its 1,053 items remain excluded from public catalogue/runtime/export surfaces until redistribution rights and per-resource certification are established.
`;
await appendFile('audit/RUNTIME_AUDIT.md', v78, 'utf8');
await appendFile('quality/STEP_39_EVIDENCE.md', `

## Public v78 route, resource, and copy re-audit — 2026-11-06

Sites v78 serves canonical source 3e889d0ca68345c5ccf5ef767c3c05ebc07716ca via mirror e6387f7ff8e1080a5a4c191cf00faef813719a3d. The 31 requested product routes passed at 1440×900 and 390×844 (62 captures, HTTP 200); this is a route/content/responsive-shell smoke, not a claim that every secondary control was exercised. All 324 resource detail pages were visited at both sizes, all 1,944 Quiet/Expressive/Nocturne renders completed, and the 30 targeted issue assertions passed at both sizes. Eight representative detail-shell and isolated-preview Axe scans reported zero violations. All runtime/network failures were zero; one window.styleMedia deprecation warning appeared once and did not recur in the route, corpus, preview, or explicit warning rechecks.

AUD-471–AUD-491 are closed after deployed verification. Machine evidence and screenshots: [v78 route audit](evidence/step-45/public-v78-reaudit/ROUTE_AUDIT.md), [runtime ledger records](../audit/runtime-audit.json), [targeted Playwright log](evidence/step-45/public-v78-reaudit/copy-sweep-runtime.jsonl), [resource corpus](evidence/step-45/public-v78-reaudit/resource-copy-corpus/copy-corpus.json), and [Axe results](evidence/step-45/public-v78-reaudit/axe-resource-results.json).

This does not close Step 39. The scanner's 14 conservative hits across seven resources were manually reviewed as intentional skeleton, empty-state, or sample-price labels, but the required human review of every public string—including docs, CLI/MCP copy, and the complete set of secondary workflows—remains incomplete. The runtime ledger now has 495 findings: 0 Critical, 87 High, 379 Medium, 29 Low; 270 deployed-verified, 112 awaiting deployed verification, 98 locally verified, and the other documented historical/local/host-limitation statuses. AUD-419 remains the one nonclosed High finding.
`, 'utf8');

const hardeningPath = 'docs/PRODUCT_HARDENING.md';
let hardening = await readFile(hardeningPath, 'utf8');
hardening = hardening.replace('## Current release evidence (2026-11-03)', '## Historical release evidence (2026-11-03)');
const insertionPoint = 'Legacy branches are evidence/reference, never parallel sources of product truth.\n';
const current = `

## Current release evidence (2026-11-06)

Public Sites v78 is live at https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/. Version ID: appgprj_6acc036de8cc8191a823339566972d85~appgver_67206589708c81919ade92023cb90608; deployment ID: appgdep_6aed6cf7cc288191a4ba98ee07ef81fc. It serves canonical source 3e889d0ca68345c5ccf5ef767c3c05ebc07716ca through Sites mirror e6387f7ff8e1080a5a4c191cf00faef813719a3d. PR #10 is open and unmerged; exact-head CI succeeded on 8fdb115e70356fb03bc9e3eb2076a5794d44aa6a.

The deployed v78 review covers 31 routes at desktop and mobile (62 HTTP 200 captures), all 324 resource detail routes at both widths (648 page visits), all 1,944 resource variant renders, 30 targeted copy/action/keyboard regressions, 28 isolated-preview captures, and eight representative Axe scans with zero violations. AUD-471–AUD-491 are closed after issue-specific deployed verification. A single window.styleMedia deprecation warning appeared once and was not reproduced in follow-up route, corpus, and preview runs; it is documented in the machine evidence.

The 495-item runtime ledger has 0 Critical, 87 High, 379 Medium, and 29 Low findings. 270 have deployed closure, 112 await deployed verification, and 98 are locally verified; the remaining historical/local/host-limitation statuses are detailed in audit/RUNTIME_AUDIT.md. AUD-419 is the sole nonclosed High item: optional BYO-provider forwarding remains unverified without the laptop host and configured provider endpoint. Step 39 (language/copy) and Step 48 (release) remain open, as do the broader ordered hardening and human-validation gates.

Verso's local owner-only adapter has exercised 1,053/1,053 modules through the canonical schema and isolated preview runtime. The source declares UNLICENSED; all items remain outside public catalogue, Gold runtime, Workbench, registry, CLI/MCP and exports until rights and item-level certification are documented. Sites D1/R2 remain unprovisioned; no paid service or secret was added, and the £20/month cap, local-first behavior and strict preview CSP remain unchanged. See [v78 audit evidence](../quality/evidence/step-45/public-v78-reaudit/ROUTE_AUDIT.md) and [Verso local integration evidence](../quality/VERSO_LOCAL_INTEGRATION_EVIDENCE.md).
`;
if (!hardening.includes(insertionPoint)) throw new Error('Product hardening insertion point not found');
hardening = hardening.replace(insertionPoint, insertionPoint + current);
await writeFile(hardeningPath, hardening, 'utf8');

const goalPath = 'docs/GRAND_GOAL_PROGRESS.md';
let goal = await readFile(goalPath, 'utf8');
goal = goal.replace('## Current checkpoint — 2026-11-03', '## Historical checkpoint — 2026-11-03');
const guardrails = '- No silent merge, rights-restricted publication, paid infrastructure, or unapproved production Site change. Public review Site changes remain owner-\nauthorized and post-CI; it currently remains v72.\n';
const currentGoal = `

## Current checkpoint — 2026-11-06

- Active scoped branch: codex/surprise-net-change-audit at 8fdb115e70356fb03bc9e3eb2076a5794d44aa6a. PR #10 remains open and unmerged; exact-head CI is green. The public review Site is v78, serving canonical code 3e889d0ca68345c5ccf5ef767c3c05ebc07716ca through Sites mirror e6387f7ff8e1080a5a4c191cf00faef813719a3d.
- Verso's technically permissible integration is complete as a private, local-only inspection adapter over 1,053/1,053 inventoried modules. The modules are exercised using the canonical schema and isolated preview app; no Verso source or derivative is copied into the public catalogue, Gold registry, Workbench, registry endpoints, CLI/MCP, or exporters. Source license is UNLICENSED and redistribution rights are unresolved, so public inclusion and per-resource Core certification remain blocked.
- The v78 deployed audit visited 31 routes at desktop/mobile, opened all 324 resource detail pages at both sizes, rendered 1,944 variants, passed 30 targeted issue tests, and completed eight representative Axe scans with zero violations. AUD-471–AUD-491 are now issue-specifically closed after deployed checks. Evidence is in quality/evidence/step-45/public-v78-reaudit/.
- The audit register has 495 entries (0 Critical, 87 High, 379 Medium, 29 Low). 270 have deployed verification; 112 await their own deployed verification; 98 are locally verified; historical/local/host-limitation groups remain documented. AUD-419 is the sole nonclosed High finding; actual provider forwarding needs the optional laptop host and provider endpoint. One mobile window.styleMedia deprecation warning was observed once and not reproduced; it remains documented.
- Product hardening is not complete. Step 39's full copy review and Step 48's final release gate remain open. Next work continues Step 39 in order, then follows the remaining hardening programme; the detailed release conditions in PRODUCT_HARDENING.md remain authoritative. Human user sessions remain owner-waived, not passed. D1/R2 are unprovisioned and no paid infrastructure or secrets were added.
`;
if (!goal.includes(guardrails)) throw new Error('Grand goal guardrail insertion point not found');
goal = goal.replace(guardrails, guardrails + currentGoal);
await writeFile(goalPath, goal, 'utf8');
console.log('Updated runtime ledger, Step 39 evidence, product hardening current checkpoint, and grand-goal checkpoint.');
