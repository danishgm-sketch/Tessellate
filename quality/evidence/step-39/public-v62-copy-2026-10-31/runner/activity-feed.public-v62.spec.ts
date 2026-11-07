import { expect, test } from "@playwright/test";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

test("activity feed discloses its built-in entries are samples", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const failedRequests: string[] = [];
  const http: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); if (message.type() === "warning") warnings.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  page.on("response", (response) => { if (response.status() >= 400) http.push(String(response.status()) + " " + response.url()); });

  const response = await page.goto("/r/activity-feed/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  const preview = page.frameLocator('iframe[title$=" live preview"]');
  await expect(preview.getByRole("heading", { level: 2, name: "Workspace Activity Feed" })).toBeVisible();
  await expect(preview.getByText("Sample activity", { exact: true })).toBeVisible();
  await expect(preview.getByText(/validated 72|pull request #142|Elena R\\.|Marcus V\\./i)).toHaveCount(0);

  const dir = path.resolve("quality/evidence/step-39/public-v62-copy-2026-10-31/activity-feed");
  await mkdir(dir, { recursive: true });
  const name = testInfo.project.name;
  await page.screenshot({ path: path.join(dir, name + ".png"), fullPage: true });
  await writeFile(path.join(dir, name + ".json"), JSON.stringify({ route: page.url(), viewport: page.viewportSize(), errors, warnings, failedRequests, http }, null, 2));
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(http).toEqual([]);
});