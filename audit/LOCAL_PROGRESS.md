# Remediation progress — not deployed acceptance

The first browser regression reproduced lost edits on the original deployed version: after Surprise and a manifest download, reload returned the initial project. A production build with the browser journal fix passes the same UI/download/reload comparison locally.

The header-search regression also passes locally: clicking Search opens an accessible dialog and Escape closes it. The palette now traps and restores focus.

Four additional regression tests originally failed: employee-domain inference, role-appropriate rendered content, valid replacement variants, and project-specific Compare/mode state. They now pass locally after domain and resource-contract changes. Full-suite testing identified three legacy tests that use fabricated resource variants or inspect only direct children; those fixtures will be corrected to test canonical resources and full trees, without removing coverage.

**All audit findings remain OPEN until the fixed Site is deployed and the same browser journey is repeated.** Local results do not imply acceptance. Route completion, responsive rendering, complete editing, independent final export, security headers, accessibility and deployed verification are still in progress.
