# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: copy-quality-step-39.spec.ts >> Typography Lab keeps controls unavailable until its client is ready
- Location: tests\e2e\copy-quality-step-39.spec.ts:1223:1

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator:  getByRole('button', { name: 'Tabular Figure Sample', exact: true })
Expected: disabled
Received: enabled
Timeout:  5000ms

Call log:
  - Expect "toBeDisabled" getByRole('button', { name: 'Tabular Figure Sample', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Tabular Figure Sample', exact: true })
    14 × locator resolved to <button type="button" aria-pressed="false" class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-[#62666F]">Tabular Figure Sample</button>
       - unexpected value "enabled"

```

```yaml
- button "Tabular Figure Sample"
```

# Test source

```ts
  1153 |     path.join(evidenceDirectory, 'section-planner.json'),
  1154 |     `${JSON.stringify(evidence, null, 2)}\n`,
  1155 |     'utf8'
  1156 |   );
  1157 |   expect(runtime.consoleErrors).toEqual([]);
  1158 |   expect(runtime.uncaughtExceptions).toEqual([]);
  1159 |   expect(runtime.failedRequests).toEqual([]);
  1160 |   expect(runtime.httpErrors).toEqual([]);
  1161 | });
  1162 | 
  1163 | test('Section Planner does not expose inert controls before its client is ready', async ({
  1164 |   page,
  1165 | }, testInfo) => {
  1166 |   let releaseScripts!: () => void;
  1167 |   const scriptsMayLoad = new Promise<void>((resolve) => {
  1168 |     releaseScripts = resolve;
  1169 |   });
  1170 |   await page.route(/\.js(?:\?|$)/, async (route) => {
  1171 |     await scriptsMayLoad;
  1172 |     await route.continue();
  1173 |   });
  1174 | 
  1175 |   await page.goto('/tools/section-planner', { waitUntil: 'commit' });
  1176 |   const objectiveButton = page.getByRole('button', {
  1177 |     name: 'Developer Documentation Hub',
  1178 |     exact: true,
  1179 |   });
  1180 |   await expect(objectiveButton).toBeVisible();
  1181 |   const loadingStatus = page.getByRole('status');
  1182 |   await expect(loadingStatus).toContainText('Loading planner controls');
  1183 |   await expect(objectiveButton).toBeDisabled();
  1184 |   const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-39/after');
  1185 |   await mkdir(evidenceDirectory, { recursive: true });
  1186 |   const evidencePrefix = `section-planner-hydration-${testInfo.project.name}`;
  1187 |   const screenshots = {
  1188 |     loading: path.join(evidenceDirectory, `${evidencePrefix}-loading.png`),
  1189 |     ready: path.join(evidenceDirectory, `${evidencePrefix}-ready.png`),
  1190 |   };
  1191 |   await page.screenshot({ path: screenshots.loading });
  1192 | 
  1193 |   releaseScripts();
  1194 |   await page.waitForLoadState('load');
  1195 |   await expect(objectiveButton).toBeEnabled();
  1196 |   await expect(loadingStatus).toHaveCount(0);
  1197 |   await objectiveButton.click();
  1198 |   await expect(objectiveButton).toHaveAttribute('aria-pressed', 'true');
  1199 |   await expect(page.locator('pre')).toContainText('"pageObjective": "developer-platform"');
  1200 |   await page.screenshot({ path: screenshots.ready });
  1201 |   const evidence = {
  1202 |     route: page.url(),
  1203 |     viewport: page.viewportSize(),
  1204 |     scriptLoadHeld: true,
  1205 |     loading: {
  1206 |       status: 'Loading planner controls…',
  1207 |       objectiveControlDisabled: true,
  1208 |     },
  1209 |     ready: {
  1210 |       objectiveControlEnabled: true,
  1211 |       selectedObjective: 'developer-platform',
  1212 |     },
  1213 |     screenshots,
  1214 |   };
  1215 |   const evidencePath = path.join(evidenceDirectory, `${evidencePrefix}.json`);
  1216 |   await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  1217 |   await testInfo.attach('Section Planner hydration interaction evidence', {
  1218 |     body: Buffer.from(JSON.stringify(evidence, null, 2)),
  1219 |     contentType: 'application/json',
  1220 |   });
  1221 | });
  1222 | 
  1223 | test('Typography Lab keeps controls unavailable until its client is ready', async ({ page }, testInfo) => {
  1224 |   let releaseIsland: (() => void) | undefined;
  1225 |   let markIslandRequest: (() => void) | undefined;
  1226 |   const islandGate = new Promise<void>((resolve) => {
  1227 |     releaseIsland = resolve;
  1228 |   });
  1229 |   const islandRequest = new Promise<void>((resolve) => {
  1230 |     markIslandRequest = resolve;
  1231 |   });
  1232 | 
  1233 |   await page.route(/TypographyLab/i, async (route) => {
  1234 |     markIslandRequest?.();
  1235 |     await islandGate;
  1236 |     await route.continue();
  1237 |   });
  1238 |   await page.goto('/tools/typography', { waitUntil: 'domcontentloaded' });
  1239 | 
  1240 |   const sampleTab = page.getByRole('button', { name: 'Tabular Figure Sample', exact: true });
  1241 |   await expect(sampleTab).toBeVisible();
  1242 |   await islandRequest;
  1243 | 
  1244 |   const evidenceDirectory = path.resolve(
  1245 |     process.cwd(),
  1246 |     'quality/evidence/step-39/public-v45/interaction-readiness'
  1247 |   );
  1248 |   await mkdir(evidenceDirectory, { recursive: true });
  1249 |   const viewport = testInfo.project.name.includes('mobile') ? 'mobile-390x844' : 'desktop-1440x900';
  1250 |   await page.screenshot({ path: path.join(evidenceDirectory, `${viewport}-pre-hydration.png`) });
  1251 | 
  1252 |   try {
> 1253 |     await expect(sampleTab).toBeDisabled();
       |                             ^ Error: expect(locator).toBeDisabled() failed
  1254 |     await expect(page.getByText('Preparing typography controls…', { exact: true })).toBeVisible();
  1255 |   } finally {
  1256 |     releaseIsland?.();
  1257 |   }
  1258 | 
  1259 |   await expect(sampleTab).toBeEnabled();
  1260 |   await sampleTab.click();
  1261 |   await expect(sampleTab).toHaveAttribute('aria-pressed', 'true');
  1262 |   await expect(
  1263 |     page.getByText(
  1264 |       'Illustrative sample data for comparing numeral alignment; these values are not live metrics.',
  1265 |       { exact: true }
  1266 |     )
  1267 |   ).toBeVisible();
  1268 |   await page.screenshot({ path: path.join(evidenceDirectory, `${viewport}-hydrated.png`) });
  1269 | });
  1270 | 
  1271 | test('Typography Lab shows truthful, responsive type specimens', async ({ page }, testInfo) => {
  1272 |   await page.addInitScript(() => {
  1273 |     let copied = '';
  1274 |     Object.defineProperty(navigator, 'clipboard', {
  1275 |       configurable: true,
  1276 |       value: {
  1277 |         writeText: async (text: string) => {
  1278 |           copied = text;
  1279 |         },
  1280 |         readText: async () => copied,
  1281 |       },
  1282 |     });
  1283 |   });
  1284 |   const runtime = {
  1285 |     consoleErrors: [] as string[],
  1286 |     uncaughtExceptions: [] as string[],
  1287 |     failedRequests: [] as Array<{ url: string; error: string | null }>,
  1288 |     httpErrors: [] as Array<{ url: string; status: number }>,
  1289 |   };
  1290 |   page.on('console', (message) => {
  1291 |     if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  1292 |   });
  1293 |   page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  1294 |   page.on('requestfailed', (request) =>
  1295 |     runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  1296 |   );
  1297 |   page.on('response', (response) => {
  1298 |     if (response.status() >= 400)
  1299 |       runtime.httpErrors.push({ url: response.url(), status: response.status() });
  1300 |   });
  1301 | 
  1302 |   const response = await page.goto('/tools/typography');
  1303 |   await expect(page.getByRole('heading', { name: 'Typography Lab', level: 1 })).toBeVisible();
  1304 |   await expect(page.locator('meta[name="description"]')).toHaveAttribute(
  1305 |     'content',
  1306 |     /typographic scales, font-pairing previews, numeric samples, and OpenType feature settings/i
  1307 |   );
  1308 |   const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  1309 |   const evidenceDirectory = path.resolve(
  1310 |     process.cwd(),
  1311 |     `quality/evidence/step-39/after/${viewport}`
  1312 |   );
  1313 |   await mkdir(evidenceDirectory, { recursive: true });
  1314 |   const screenshots = {
  1315 |     hierarchy: path.join(evidenceDirectory, 'typography-lab.png'),
  1316 |     numbers: path.join(evidenceDirectory, 'typography-specimen.png'),
  1317 |     fluidScale: path.join(evidenceDirectory, 'typography-fluid-scale.png'),
  1318 |   };
  1319 |   await page.screenshot({ path: screenshots.hierarchy, fullPage: true });
  1320 | 
  1321 |   const main = page.locator('main');
  1322 |   await expect(main.getByText(/zero cognitive strain/i)).toHaveCount(0);
  1323 |   await expect(main.getByText('Status Indicator AA', { exact: false })).toHaveCount(0);
  1324 |   await expect(main.getByText('MEASURED METRIC', { exact: false })).toHaveCount(0);
  1325 |   await page.getByRole('button', { name: 'Tabular Figure Sample', exact: true }).click();
  1326 |   await expect(main.getByText(/Illustrative sample data.*not live metrics/i)).toBeVisible();
  1327 |   await expect(main.getByText(/asset id|settlement|latency|£1,420,890/i)).toHaveCount(0);
  1328 |   const sampleTable = page.getByRole('table', { name: 'Illustrative numeric sample records' });
  1329 |   const sampleCards = page.getByRole('list', { name: 'Illustrative numeric sample records' });
  1330 |   if (viewport === 'mobile') {
  1331 |     await expect(sampleCards).toBeVisible();
  1332 |     await expect(sampleCards.getByRole('listitem')).toHaveCount(4);
  1333 |     await expect(sampleTable).toBeHidden();
  1334 |   } else {
  1335 |     await expect(sampleTable).toBeVisible();
  1336 |     await expect(sampleCards).toBeHidden();
  1337 |   }
  1338 |   await page.screenshot({ path: screenshots.numbers, fullPage: true });
  1339 | 
  1340 |   await page.getByRole('button', { name: 'Hierarchical Scale Ladder', exact: true }).click();
  1341 |   await page.getByRole('button', { name: 'Golden Ratio' }).click();
  1342 |   const layout = await page.evaluate(() => {
  1343 |     const heading = [...document.querySelectorAll('main h1')].find((node) =>
  1344 |       node.textContent?.includes('A product, shaped by people.')
  1345 |     );
  1346 |     return {
  1347 |       viewportWidth: document.documentElement.clientWidth,
  1348 |       documentWidth: document.documentElement.scrollWidth,
  1349 |       headingFontSize: heading ? getComputedStyle(heading).fontSize : null,
  1350 |     };
  1351 |   });
  1352 |   expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  1353 |   await expect(main.getByText('110px max', { exact: true })).toBeVisible();
```