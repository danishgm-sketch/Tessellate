# Public v83 route and content sweep

- Site: https://tessellate-v1-review.ismayildanish-gm.chatgpt.site
- Sites version: 83
- Canonical source: 484a00b25cbb00e9fe54ce48804153041f6f073d
- Sites mirror: e8adb0a10e9ab0e57cd48a3b8f12894fd8f90536
- Scope: 31 public routes at 1440x900 and 390x844; route shell, visible text, controls, console/network, overflow, and screenshot capture. Not a claim that every interaction on every route was exercised.
- Runtime totals: 62 captures; zero HTTP errors, console errors/warnings, uncaught exceptions, failed requests, or horizontal overflow.
- Classification limits: PASS means this route shell and visible content sample rendered coherently with clean telemetry and no overflow; it does not certify every interaction or every string.

| Route | 1440×900 | 390×844 | Visible heading |
|---|---:|---:|---|
| `/` | undefined | undefined | Describe the product. / Get the interface. |
| `/explore` | undefined | undefined | Explore Resource Library |
| `/components` | undefined | undefined | Components |
| `/sections` | undefined | undefined | Sections |
| `/blocks` | undefined | undefined | Application blocks |
| `/pages` | undefined | undefined | Page architectures |
| `/effects` | undefined | undefined | Effects |
| `/motion` | undefined | undefined | Motion |
| `/backgrounds` | undefined | undefined | Backgrounds |
| `/ai` | undefined | undefined | AI patterns |
| `/data` | undefined | undefined | Data visualisation |
| `/compose` | undefined | undefined | Product Composer |
| `/workbench` | undefined | undefined | Workbench: Example employee workspace |
| `/blueprints` | undefined | undefined | Product blueprints |
| `/collections` | undefined | undefined | Your resource collection |
| `/creators` | undefined | undefined | Resource creators |
| `/showcase` | undefined | undefined | Showcase projects |
| `/trends` | undefined | undefined | Catalogue signals |
| `/tools` | undefined | undefined | Ten Interface Tools. |
| `/agents` | undefined | undefined | Tessellate for agents |
| `/docs` | undefined | undefined | Documentation |
| `/sponsor` | undefined | undefined | Support the open commons |
| `/about` | undefined | undefined | About Tessellate |
| `/license` | undefined | undefined | Licences and provenance |
| `/privacy` | undefined | undefined | Privacy in this review |
| `/terms` | undefined | undefined | Review terms |
| `/r/editorial-hero` | undefined | undefined | Editorial Hero |
| `/showcase/showcase-playful-hr` | undefined | undefined | Kudos Employee Experience |
| `/blueprints/b2b-saas` | undefined | undefined | B2B SaaS |
| `/tools/palette` | undefined | undefined | Palette Studio |
| `/docs/cli` | undefined | undefined | Tessellate CLI (`tess`) |

## Supplemental resource-detail route

| Route | Viewport | Classification | Finding |
|---|---|---|---|
| `/r/api-key-management` | 1440×900 | MISLEADING | AUD-513: credential-like sample rows and inert actions |

The one degraded route class is /blocks; the exact detail page is classified MISLEADING in the supplemental check. Before evidence and local remediation captures are under audit/evidence/step-39/public-v83-api-key-management/.

The route-text risk scan returned no suspicious pattern hits. Manual screenshot review found AUD-513, which the heuristic missed; this documents that heuristic copy scans do not replace screenshot and interaction review. This route matrix is a shell/content/responsive audit, not a click-through of every control.
