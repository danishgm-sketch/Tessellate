# Public Sites v87 route audit

Site: [Tessellate V1 Review](https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/) <br>
Canonical source: `73cca33c263d8c1f6ae93fb35347ad7e33b7e749`; Sites mirror: `20ebad8da9aa0ead9fff30581986f671be7d8a00`.

## Scope and result

The browser sweep captured all 31 requested public routes at 1440×900 and 390×844 (62 captures). All returned HTTP 200. There were zero navigation failures, console errors or warnings, uncaught exceptions, failed requests, HTTP errors, or horizontal-overflow captures. Each captured route had a visible H1 and at least 300 characters of main content.

PASS is limited to the visible route shell/content, runtime/network health, and horizontal overflow at those two widths. The content review examined the captured title, H1, and up to 5,000 characters of main content per capture. It does not assert that every button or secondary control on every page was activated. Six representative screenshots were visually inspected; the full 62-image set is retained under [screenshots](screenshots/).

| Route | Result | Main text characters (desktop / mobile) | Visible heading |
|---|---:|---:|---|
| `/` | PASS | 10700 / 10326 | Describe the product.
Get the interface. / Describe the product.
Get the interface. |
| `/explore` | PASS | 6711 / 6523 | Explore Resource Library / Explore Resource Library |
| `/components` | PASS | 5490 / 5407 | Components / Components |
| `/sections` | PASS | 6488 / 6474 | Sections / Sections |
| `/blocks` | PASS | 6305 / 6293 | Application blocks / Application blocks |
| `/pages` | PASS | 8598 / 8598 | Page architectures / Page architectures |
| `/effects` | PASS | 6567 / 6506 | Effects / Effects |
| `/motion` | PASS | 3190 / 3166 | Motion / Motion |
| `/backgrounds` | PASS | 2776 / 2748 | Backgrounds / Backgrounds |
| `/ai` | PASS | 2862 / 2834 | AI patterns / AI patterns |
| `/data` | PASS | 4769 / 4738 | Data visualisation / Data visualisation |
| `/compose` | PASS | 1209 / 1209 | Product Composer / Product Composer |
| `/workbench` | PASS | 1885 / 501 | Workbench: Example employee workspace / Workbench: Example employee workspace |
| `/blueprints` | PASS | 2109 / 2109 | Product blueprints / Product blueprints |
| `/collections` | PASS | 423 / 423 | Your resource collection / Your resource collection |
| `/creators` | PASS | 6019 / 6019 | Resource creators / Resource creators |
| `/showcase` | PASS | 1486 / 1486 | Showcase projects / Showcase projects |
| `/trends` | PASS | 12930 / 12930 | Catalogue signals / Catalogue signals |
| `/tools` | PASS | 1901 / 1901 | Ten Interface Tools. / Ten Interface Tools. |
| `/agents` | PASS | 1020 / 1020 | Tessellate for agents / Tessellate for agents |
| `/docs` | PASS | 409 / 409 | Documentation / Documentation |
| `/sponsor` | PASS | 664 / 664 | Support the open commons / Support the open commons |
| `/about` | PASS | 793 / 793 | About Tessellate / About Tessellate |
| `/license` | PASS | 740 / 740 | Licences and provenance / Licences and provenance |
| `/privacy` | PASS | 1059 / 1059 | Privacy in this review / Privacy in this review |
| `/terms` | PASS | 764 / 764 | Review terms / Review terms |
| `/r/editorial-hero` | PASS | 1185 / 1185 | Editorial Hero / Editorial Hero |
| `/showcase/showcase-playful-hr` | PASS | 1742 / 1664 | Kudos Employee Experience / Kudos Employee Experience |
| `/blueprints/b2b-saas` | PASS | 1070 / 1070 | B2B SaaS / B2B SaaS |
| `/tools/palette` | PASS | 1387 / 1387 | Palette Studio / Palette Studio |
| `/docs/cli` | PASS | 1817 / 1817 | Tessellate CLI (`tess`) / Tessellate CLI (`tess`) |

## Flagship and targeted interaction evidence

The exact employee-experience brief passed the public-UI acceptance journey at desktop and mobile. Direction C opened in Workbench. The dashboard KPI subtree stayed locked through Recompose, Replace, and Surprise Me; the replaced activity component became `notification-centre`; Undo/Redo restored the recorded manifests exactly. The independent React ZIP was clean-installed and built outside the repository, then browsed at 1440×900 and 390×844. The two viewport workflow records and exported ZIPs are beside this report.

The separate deployed Step 39 sample-claims/control suite passed 48 browser cases across desktop and mobile. It is targeted evidence, not a blanket statement that all route controls were tested.

## Limits

Axe was not rerun during this v87 continuation; see the v81 evidence linked from [Step 45 evidence](../../../../quality/STEP_45_EVIDENCE.md) for its scope and the incomplete contrast checks. The broader runtime ledger, Step 39 language review, and Step 45 release gate remain open.
