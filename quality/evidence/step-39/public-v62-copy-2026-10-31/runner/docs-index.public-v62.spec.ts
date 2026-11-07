import { expect, test } from "@playwright/test";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

test("documentation index links to canonical repository contracts", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const failed: string[] = [];
  const http: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); if (message.type() === "warning") warnings.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failed.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 400) http.push(String(response.status()) + " " + response.url()); });

  const response = await page.goto("/docs/");
  expect(response?.status()).toBe(200);
  const documentationLinks = page.getByRole("navigation", { name: "Documentation" }).getByRole("link");
  await expect(documentationLinks).toHaveCount(16);
  for (const slug of ["architecture", "composition-engine", "data-contracts", "design-system", "product-spec", "quality-security", "workbench-spec"]) {
    await expect(page.locator('a[href="/docs/' + slug + '/"]')).toBeVisible();
  }
  const indexDir = path.resolve("quality/evidence/step-39/public-v62-copy-2026-10-31/documentation");
  await mkdir(indexDir, { recursive: true });
  const indexScreenshot = testInfo.project.name + "-index.png";
  await page.screenshot({ path: path.join(indexDir, indexScreenshot), fullPage: true });
  await page.locator('a[href="/docs/product-spec/"]').click();
  await expect(page).toHaveURL(new RegExp("/docs/product-spec/?$"));
  await expect(page.getByRole("heading", { level: 1, name: "Tessellate Product Specification" })).toBeVisible();

  const dir = path.resolve("quality/evidence/step-39/public-v62-copy-2026-10-31/documentation");
  await mkdir(dir, { recursive: true });
  const name = testInfo.project.name;
  await page.screenshot({ path: path.join(dir, name + ".png"), fullPage: true });
  await writeFile(path.join(dir, name + ".json"), JSON.stringify({ route: page.url(), viewport: page.viewportSize(), links: await documentationLinks.count(), indexScreenshot, errors, warnings, failed, http }, null, 2));
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
  expect(failed).toEqual([]);
  expect(http).toEqual([]);
});