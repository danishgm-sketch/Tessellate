# Tessellate copy regression list

Use these as review prompts for real routes, resource details, generated examples, CLI/MCP output, and documentation. This is a short product-specific checklist, not an automated generic AI-language detector.

- Do not name a model, provider, credential mode, or hosted service unless the user can actually select and use it in that surface.
- Do not present an action as available when it has no handler. Disable it and explain the missing connection, or implement the existing intended behavior.
- Avoid universal output guarantees such as “generate the entire interface system” unless the product demonstrably delivers that result.
- Remove domain examples that do not fit the resource or the surrounding product context; in particular, do not leak trading/finance language into unrelated examples.
- Describe persistence and network behavior precisely. Do not imply prompts are private, saved, or local beyond what the implementation guarantees.
- Treat numeric quality, usage, and verification claims as evidence-bearing metadata; distinguish declarations from measured certification.
- Mark fixed AI examples as examples. Do not imply provider access, source retrieval, confidence scoring, or tool execution unless that behavior is connected and verified.
- Treat displayed timestamps, token counts, latencies, citations, and result states as sample data unless they come from measured runtime state.
- Avoid guarantees such as “zero hallucinations,” “fully accessible,” “compatible with every system,” or “no CSS conflicts”; say what the current contract and checks actually establish.
- Reject unsupported absolute outcomes such as “zero cognitive strain” and accessibility markers such as “Status Indicator AA” unless the scope and verification are real.
- Do not call calculated type-scale values “measured metrics”; distinguish maximum token sizes from viewport-rendered sizes.
- Keep typography examples domain-neutral, disclose fabricated values as samples, and never frame them as live finance or telemetry data.
- Describe each tool and preset by the controls and output that exist today; do not claim audit, compliance, performance, Design DNA, or responsive testing work that the surface does not perform.
- Mark illustrative charts, preview cards, motion sequences, and code examples as samples. Remove invented status, score, security, and latency results.
- Call a schematic a preview; explain when it does not run or test a generated page. Disable sample actions that have no behavior.
- A reset label must match the state it restores, including the selected preset and the displayed values.
- Do not generate contributor, license, provenance, responsive, accessibility, or quality certification metadata for an unreviewed draft. Preserve unknowns and block registry submission until review.
- A locally generated draft is not a published registry resource; do not include install commands or public registry URLs before submission.
- Agent-facing tool descriptions must state the actual ranking or matching method and its limitations.
- Distinguish manifest scoring from browser verification. A metadata rubric does not certify accessibility, responsive behavior, or production readiness.
- Treat security, privacy, accessibility, and compliance patterns as prompts or templates unless the component actually verifies the claims; never render unverified claims with a passed checkmark.
- Do not prefill completion panels with generated file counts, production-readiness claims, or live artifact actions unless they come from connected state.
- A sample command list may filter locally, but must not look runnable when it has no action handler. Prompt suggestions without a handler must be disabled and explained.
- Do not promise automatic responsive substitutions unless the renderer performs that substitution for the named resource and preserves the manifest contract.
- Every visible AI-pattern control must work by keyboard as well as pointer, or be disabled with an explanation that names the missing connection.
- Use product language users can understand. Keep schema, pipeline, registry, and architecture terms in advanced or developer-facing context.
