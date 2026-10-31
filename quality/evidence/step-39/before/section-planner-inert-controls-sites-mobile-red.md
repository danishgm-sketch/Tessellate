# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: copy-quality-step-39.spec.ts >> Section Planner does not expose inert controls before its client is ready
- Location: tests\e2e\copy-quality-step-39.spec.ts:1042:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected substring: "Loading planner controls"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByRole('status') with timeout 5000ms
  - waiting for getByRole('status')

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- banner:
  - link "Tessellate":
    - /url: /
    - img
    - text: Tessellate
  - button "Search resources (Press Command-K)" [disabled]:
    - img
  - link "Start building":
    - /url: /workbench
    - text: Start building
    - img
  - button "Toggle menu" [disabled]:
    - img
- main:
  - complementary "Beta capability notice": Beta Client-side exploration only. Individual interactions and output quality are still being validated; this tool does not certify or modify a saved Workbench project.
  - text: Tool 07 · Page Structure Client-Side · Zero Login
  - heading "Section Planner" [level=1]
  - paragraph: Plan and edit example section structures for conversion pages, technical documentation, and editorial sites. The planner does not implement the described sections.
  - button "Copy Section Graph JSON":
    - img
    - text: Copy Section Graph JSON
  - paragraph: Template descriptions are planning prompts, not implementation or verified proof. Replace sample claims with sourced product details before publishing.
  - text: Page Objective Archetypes
  - button "B2B SaaS Conversion Landing" [pressed]
  - button "Developer Documentation Hub"
  - button "Fintech Analytics Cockpit"
  - button "Luxury Editorial Sanctuary"
  - button "Operational Triage & Admin Tool"
  - img
  - heading "Page Sections (8 active)" [level=2]
  - button "Reset Blueprint":
    - img
    - text: Reset Blueprint
  - text: 01 Hero Value Proposition hero State the product’s value and link to an implemented primary action.
  - button "Move Hero Value Proposition up" [disabled]:
    - img
  - button "Move Hero Value Proposition down":
    - img
  - button "Omit Hero Value Proposition" [pressed]: Active
  - button "Delete Hero Value Proposition":
    - img
  - text: 02 Evidence and Customer References proof Use certifications and customer references only when they are documented and approved.
  - button "Move Evidence and Customer References up":
    - img
  - button "Move Evidence and Customer References down":
    - img
  - button "Omit Evidence and Customer References" [pressed]: Active
  - button "Delete Evidence and Customer References":
    - img
  - text: 03 Interactive Feature Playground interactive Add a product demo; connect a working sandbox before presenting it as interactive.
  - button "Move Interactive Feature Playground up":
    - img
  - button "Move Interactive Feature Playground down":
    - img
  - button "Omit Interactive Feature Playground" [pressed]: Active
  - button "Delete Interactive Feature Playground":
    - img
  - text: 04 Architectural Difference Matrix feature Compare product capabilities using criteria that are specific and supported.
  - button "Move Architectural Difference Matrix up":
    - img
  - button "Move Architectural Difference Matrix down":
    - img
  - button "Omit Architectural Difference Matrix" [pressed]: Active
  - button "Delete Architectural Difference Matrix":
    - img
  - text: 05 Measured Performance Evidence proof Include measured benchmarks and their methodology, or omit this section.
  - button "Move Measured Performance Evidence up":
    - img
  - button "Move Measured Performance Evidence down":
    - img
  - button "Omit Measured Performance Evidence" [pressed]: Active
  - button "Delete Measured Performance Evidence":
    - img
  - text: 06 Pricing and Plan Details pricing List current plan names and terms supplied by the product owner.
  - button "Move Pricing and Plan Details up":
    - img
  - button "Move Pricing and Plan Details down":
    - img
  - button "Omit Pricing and Plan Details" [pressed]: Active
  - button "Delete Pricing and Plan Details":
    - img
  - text: 07 Technical Evaluation FAQ faq Answer security, hosting, and export questions from verified product documentation.
  - button "Move Technical Evaluation FAQ up":
    - img
  - button "Move Technical Evaluation FAQ down":
    - img
  - button "Omit Technical Evaluation FAQ" [pressed]: Active
  - button "Delete Technical Evaluation FAQ":
    - img
  - text: 08 Final Call to Action cta Use configured URLs or actions for web and CLI entry points.
  - button "Move Final Call to Action up":
    - img
  - button "Move Final Call to Action down" [disabled]:
    - img
  - button "Omit Final Call to Action" [pressed]: Active
  - button "Delete Final Call to Action":
    - img
  - textbox "Custom section title":
    - /placeholder: Add custom section title (e.g. Migration Guide)...
  - button "Add":
    - img
    - text: Add
  - img
  - heading "Section Mix Guide" [level=3]
  - text: WITHIN GUIDE Attention (Hero & Visual) 1 section (guide 1-2) Proof & Trust (Audit / Metrics) 2 sections (guide 1-3) Interaction (Playground / Sandbox) 1 section (guide 1-2) Information (Features / FAQ) 2 sections (guide 2-4) Action & Conversion (Pricing / CTA) 2 sections (guide 1-2)
  - paragraph: These reference ranges are prompts for review, not a quality score. Adjust the sequence to fit the product goal.
  - text: GRAMMAR MANIFEST
  - button "Copy"
  - text: "{ \"pageObjective\": \"saas-conversion\", \"totalSections\": 8, \"grammar\": [ { \"order\": 1, \"id\": \"sec-1\", \"name\": \"Hero Value Proposition\", \"semanticRole\": \"hero\", \"description\": \"State the product’s value and link to an implemented primary action.\" }, { \"order\": 2, \"id\": \"sec-2\", \"name\": \"Evidence and Customer References\", \"semanticRole\": \"proof\", \"description\": \"Use certifications and customer references only when they are documented and approved.\" }, { \"order\": 3, \"id\": \"sec-3\", \"name\": \"Interactive Feature Playground\", \"semanticRole\": \"interactive\", \"description\": \"Add a product demo; connect a working sandbox before presenting it as interactive.\" }, { \"order\": 4, \"id\": \"sec-4\", \"name\": \"Architectural Difference Matrix\", \"semanticRole\": \"feature\", \"description\": \"Compare product capabilities using criteria that are specific and supported.\" }, { \"order\": 5, \"id\": \"sec-5\", \"name\": \"Measured Performance Evidence\", \"semanticRole\": \"proof\", \"description\": \"Include measured benchmarks and their methodology, or omit this section.\" }, { \"order\": 6, \"id\": \"sec-6\", \"name\": \"Pricing and Plan Details\", \"semanticRole\": \"pricing\", \"description\": \"List current plan names and terms supplied by the product owner.\" }, { \"order\": 7, \"id\": \"sec-7\", \"name\": \"Technical Evaluation FAQ\", \"semanticRole\": \"faq\", \"description\": \"Answer security, hosting, and export questions from verified product documentation.\" }, { \"order\": 8, \"id\": \"sec-8\", \"name\": \"Final Call to Action\", \"semanticRole\": \"cta\", \"description\": \"Use configured URLs or actions for web and CLI entry points.\" } ] }"
- contentinfo: "Tessellate Interface Suite · Tool 07: Section Planner"
```

# Test source

```ts
  958  |   };
  959  |   page.on('console', (message) => {
  960  |     if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  961  |   });
  962  |   page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  963  |   page.on('requestfailed', (request) =>
  964  |     runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  965  |   );
  966  |   page.on('response', (response) => {
  967  |     if (response.status() >= 400)
  968  |       runtime.httpErrors.push({ url: response.url(), status: response.status() });
  969  |   });
  970  |
  971  |   await page.goto('/tools/section-planner');
  972  |   await expect(page.getByRole('heading', { name: 'Section Planner', level: 1 })).toBeVisible();
  973  |   await expect(
  974  |     page.getByText(/planning prompts, not implementation or verified proof/i)
  975  |   ).toBeVisible();
  976  |   await expect(page.getByText('Section Mix Guide', { exact: true })).toBeVisible();
  977  |   const copyButton = page.getByRole('button', { name: 'Copy Section Graph JSON' });
  978  |   await expect(copyButton).toBeVisible();
  979  |   await expect(page.getByRole('button', { name: 'Export Section Graph JSON' })).toHaveCount(0);
  980  |
  981  |   const objectives = [
  982  |     { name: 'B2B SaaS Conversion Landing', id: 'saas-conversion' },
  983  |     { name: 'Developer Documentation Hub', id: 'developer-platform' },
  984  |     { name: 'Fintech Analytics Cockpit', id: 'fintech-analytics' },
  985  |     { name: 'Luxury Editorial Sanctuary', id: 'luxury-marketplace' },
  986  |     { name: 'Operational Triage & Admin Tool', id: 'internal-tool' },
  987  |   ];
  988  |   const output: Array<{ objective: string; project: string; descriptions: string[] }> = [];
  989  |   for (const objective of objectives) {
  990  |     await page.getByRole('button', { name: objective.name, exact: true }).click();
  991  |     await expect(page.locator('pre')).toContainText(`"pageObjective": "${objective.id}"`);
  992  |     const manifestText = await page.locator('pre').innerText();
  993  |     const manifest = JSON.parse(manifestText) as {
  994  |       pageObjective: string;
  995  |       grammar: Array<{ description: string }>;
  996  |     };
  997  |     const descriptions = manifest.grammar.map((item) => item.description);
  998  |     const allText = await page.locator('main').innerText();
  999  |     expect(allText).not.toMatch(
  1000 |       /SOC\s*2|SOC2|ISO\s*27001|enterprise customer logos|verified audit benchmarks|100\s*ms interval|100-point deterministic security audit|signed audit PDF|free tier, Pro workspace|zero-friction|real-time output|single-command CLI launch|immutable chronological event log|every system|no CSS conflicts/i
  1001 |     );
  1002 |     expect(manifest.pageObjective).toBe(objective.id);
  1003 |     expect(descriptions.join('\n')).not.toMatch(
  1004 |       /SOC\s*2|SOC2|ISO\s*27001|verified audit benchmarks|100\s*ms interval|signed audit PDF|free tier, Pro workspace|zero-friction|real-time output|single-command CLI launch|immutable chronological event log/i
  1005 |     );
  1006 |     expect(allText).not.toContain('Grammar Balance Telemetry');
  1007 |     expect(allText).toContain('Section Mix Guide');
  1008 |     expect(allText).not.toMatch(/\b1 sections\b/);
  1009 |     output.push({ objective: objective.name, project: manifest.pageObjective, descriptions });
  1010 |   }
  1011 |
  1012 |   const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  1013 |   const evidenceDirectory = path.resolve(
  1014 |     process.cwd(),
  1015 |     `quality/evidence/step-39/after/${viewport}`
  1016 |   );
  1017 |   await mkdir(evidenceDirectory, { recursive: true });
  1018 |   const screenshot = path.join(evidenceDirectory, 'section-planner.png');
  1019 |   await page.screenshot({ path: screenshot, fullPage: true });
  1020 |   const evidence = {
  1021 |     route: page.url(),
  1022 |     viewport: page.viewportSize(),
  1023 |     disclaimer: await page
  1024 |       .getByText(/planning prompts, not implementation or verified proof/i)
  1025 |       .innerText(),
  1026 |     actionLabel: await copyButton.innerText(),
  1027 |     output,
  1028 |     runtime,
  1029 |     screenshot,
  1030 |   };
  1031 |   await writeFile(
  1032 |     path.join(evidenceDirectory, 'section-planner.json'),
  1033 |     `${JSON.stringify(evidence, null, 2)}\n`,
  1034 |     'utf8'
  1035 |   );
  1036 |   expect(runtime.consoleErrors).toEqual([]);
  1037 |   expect(runtime.uncaughtExceptions).toEqual([]);
  1038 |   expect(runtime.failedRequests).toEqual([]);
  1039 |   expect(runtime.httpErrors).toEqual([]);
  1040 | });
  1041 |
  1042 | test('Section Planner does not expose inert controls before its client is ready', async ({ page }) => {
  1043 |   let releaseScripts!: () => void;
  1044 |   const scriptsMayLoad = new Promise<void>((resolve) => {
  1045 |     releaseScripts = resolve;
  1046 |   });
  1047 |   await page.route(/\.js(?:\?|$)/, async (route) => {
  1048 |     await scriptsMayLoad;
  1049 |     await route.continue();
  1050 |   });
  1051 |
  1052 |   await page.goto('/tools/section-planner', { waitUntil: 'commit' });
  1053 |   const objectiveButton = page.getByRole('button', {
  1054 |     name: 'Developer Documentation Hub',
  1055 |     exact: true,
  1056 |   });
  1057 |   await expect(objectiveButton).toBeVisible();
> 1058 |   await expect(page.getByRole('status')).toContainText('Loading planner controls');
       |                                          ^ Error: expect(locator).toContainText(expected) failed
  1059 |   await expect(objectiveButton).toBeDisabled();
  1060 |
  1061 |   releaseScripts();
  1062 |   await page.waitForLoadState('load');
  1063 |   await expect(objectiveButton).toBeEnabled();
  1064 |   await objectiveButton.click();
  1065 |   await expect(objectiveButton).toHaveAttribute('aria-pressed', 'true');
  1066 |   await expect(page.locator('pre')).toContainText('"pageObjective": "developer-platform"');
  1067 | });
  1068 |
  1069 | test('Typography Lab shows truthful, responsive type specimens', async ({ page }, testInfo) => {
  1070 |   await page.addInitScript(() => {
  1071 |     let copied = '';
  1072 |     Object.defineProperty(navigator, 'clipboard', {
  1073 |       configurable: true,
  1074 |       value: {
  1075 |         writeText: async (text: string) => {
  1076 |           copied = text;
  1077 |         },
  1078 |         readText: async () => copied,
  1079 |       },
  1080 |     });
  1081 |   });
  1082 |   const runtime = {
  1083 |     consoleErrors: [] as string[],
  1084 |     uncaughtExceptions: [] as string[],
  1085 |     failedRequests: [] as Array<{ url: string; error: string | null }>,
  1086 |     httpErrors: [] as Array<{ url: string; status: number }>,
  1087 |   };
  1088 |   page.on('console', (message) => {
  1089 |     if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  1090 |   });
  1091 |   page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  1092 |   page.on('requestfailed', (request) =>
  1093 |     runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  1094 |   );
  1095 |   page.on('response', (response) => {
  1096 |     if (response.status() >= 400)
  1097 |       runtime.httpErrors.push({ url: response.url(), status: response.status() });
  1098 |   });
  1099 |
  1100 |   const response = await page.goto('/tools/typography');
  1101 |   await expect(page.getByRole('heading', { name: 'Typography Lab', level: 1 })).toBeVisible();
  1102 |   await expect(page.locator('meta[name="description"]')).toHaveAttribute(
  1103 |     'content',
  1104 |     /typographic scales, font-pairing previews, numeric samples, and OpenType feature settings/i
  1105 |   );
  1106 |   const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  1107 |   const evidenceDirectory = path.resolve(
  1108 |     process.cwd(),
  1109 |     `quality/evidence/step-39/after/${viewport}`
  1110 |   );
  1111 |   await mkdir(evidenceDirectory, { recursive: true });
  1112 |   const screenshots = {
  1113 |     hierarchy: path.join(evidenceDirectory, 'typography-lab.png'),
  1114 |     numbers: path.join(evidenceDirectory, 'typography-specimen.png'),
  1115 |     fluidScale: path.join(evidenceDirectory, 'typography-fluid-scale.png'),
  1116 |   };
  1117 |   await page.screenshot({ path: screenshots.hierarchy, fullPage: true });
  1118 |
  1119 |   const main = page.locator('main');
  1120 |   await expect(main.getByText(/zero cognitive strain/i)).toHaveCount(0);
  1121 |   await expect(main.getByText('Status Indicator AA', { exact: false })).toHaveCount(0);
  1122 |   await expect(main.getByText('MEASURED METRIC', { exact: false })).toHaveCount(0);
  1123 |   await page.getByRole('button', { name: 'Tabular Figure Sample', exact: true }).click();
  1124 |   await expect(main.getByText(/Illustrative sample data.*not live metrics/i)).toBeVisible();
  1125 |   await expect(main.getByText(/asset id|settlement|latency|£1,420,890/i)).toHaveCount(0);
  1126 |   const sampleTable = page.getByRole('table', { name: 'Illustrative numeric sample records' });
  1127 |   const sampleCards = page.getByRole('list', { name: 'Illustrative numeric sample records' });
  1128 |   if (viewport === 'mobile') {
  1129 |     await expect(sampleCards).toBeVisible();
  1130 |     await expect(sampleCards.getByRole('listitem')).toHaveCount(4);
  1131 |     await expect(sampleTable).toBeHidden();
  1132 |   } else {
  1133 |     await expect(sampleTable).toBeVisible();
  1134 |     await expect(sampleCards).toBeHidden();
  1135 |   }
  1136 |   await page.screenshot({ path: screenshots.numbers, fullPage: true });
  1137 |
  1138 |   await page.getByRole('button', { name: 'Hierarchical Scale Ladder', exact: true }).click();
  1139 |   await page.getByRole('button', { name: 'Golden Ratio' }).click();
  1140 |   const layout = await page.evaluate(() => {
  1141 |     const heading = [...document.querySelectorAll('main h1')].find((node) =>
  1142 |       node.textContent?.includes('A product, shaped by people.')
  1143 |     );
  1144 |     return {
  1145 |       viewportWidth: document.documentElement.clientWidth,
  1146 |       documentWidth: document.documentElement.scrollWidth,
  1147 |       headingFontSize: heading ? getComputedStyle(heading).fontSize : null,
  1148 |     };
  1149 |   });
  1150 |   expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  1151 |   await expect(main.getByText('110px max', { exact: true })).toBeVisible();
  1152 |   await page.getByRole('button', { name: 'Copy Scale CSS', exact: true }).click();
  1153 |   const copiedCss = await page.evaluate(() => navigator.clipboard.readText());
  1154 |   expect(copiedCss).toContain('--font-size-h1: clamp(36px, 7.64vw, 110px)');
  1155 |   await page.screenshot({ path: screenshots.fluidScale, fullPage: true });
  1156 |
  1157 |   page.removeAllListeners('console');
  1158 |   const accessibility = await new AxeBuilder({ page })
```
