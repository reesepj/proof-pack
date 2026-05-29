import { expect, test } from "@playwright/test";

test("creates, saves, searches, and exports a proof packet", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Proof beats memory." })).toBeVisible();
  await page.getByLabel("Title").fill("Sandbox proof packet");
  await page.getByLabel("Client or project").fill("Acropolis Ops");
  await page.getByLabel("Evidence").fill("Local sandbox run\nBuild output");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("status")).toContainText("Packet saved");
  await page.getByLabel("Search proof").fill("Acropolis");
  await expect(page.getByRole("button", { name: /Sandbox proof packet/ })).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "MD" }).click();
  expect((await download).suggestedFilename()).toBe("sandbox-proof-packet.md");
});

test("handles malformed imports without crashing", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search proof").fill("");

  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import JSON" }).click();
  await (await chooser).setFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ packets: [{}, { title: { nested: true }, evidence: ["valid", 12] }] }))
  });

  await expect(page.getByRole("status")).toContainText("Imported 1 packet");
  await expect(page.getByText("Untitled proof packet")).toBeVisible();
});
