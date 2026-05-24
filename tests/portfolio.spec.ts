import { expect, test } from "@playwright/test";

const base = "/ahmed-yasser-portfolio";

test("home renders the motion portfolio shell", async ({ page }) => {
  await page.goto(`${base}/`);

  await expect(page.getByRole("heading", { name: /Messy problems, working systems/i })).toBeVisible();
  await expect(page.getByTestId("dragon-guide")).toBeVisible();
  await expect(page.locator("[data-dragon-target]:visible")).toHaveCount(7);
  await expect(page.locator(".noise-layer")).toBeVisible();
  await expect(page.locator("canvas.data-field")).toBeVisible();

  await page.locator("#work").scrollIntoViewIfNeeded();

  if ((page.viewportSize()?.width ?? 0) < 900) {
    await expect(page.locator(".work-mobile-preview").first()).toBeVisible();
  } else {
    const retailRow = page.locator('[data-project-slug="retail-data-pipeline"]');
    await expect(retailRow).toBeVisible();
    await page.waitForTimeout(400);
    await retailRow.hover({ position: { x: 140, y: 84 } });
    await expect(page.locator(".work-preview img")).toBeVisible();
  }
});

test("dragon guide navigates and powers homepage proof", async ({ page }) => {
  await page.goto(`${base}/`);

  await page.getByRole("button", { name: /Jump to Namek/i }).click();
  await page.waitForURL(/#about$/);
  await expect(page.locator("#about")).toBeInViewport();

  await page.getByRole("button", { name: /Activate Beerus/i }).click();
  await expect(page.getByTestId("dragon-proof-panel")).toBeVisible();

  await page.getByRole("button", { name: /Activate Yardrat/i }).click();
  await page.waitForURL(/#work$/);
  await expect(page.locator('[data-project-slug="ecommerce-cloud-data-platform"]')).toHaveClass(/dragon-boost/);

  await page.getByRole("button", { name: /Activate Supreme Kai/i }).click();
  await page.waitForURL(/#contact$/);
  await expect(page.locator("#contact")).toBeInViewport();
});

test("project routes render case studies", async ({ page }) => {
  await page.goto(`${base}/projects/retail-data-pipeline`);

  await expect(page.getByRole("heading", { name: /Retail Data Pipeline and KPI Dashboard/i })).toBeVisible();
  const proofItem = page.locator("li", { hasText: "Raw data is validated before it enters the warehouse." }).first();
  await proofItem.scrollIntoViewIfNeeded();
  await expect(proofItem).toBeVisible();
  await expect(page.getByRole("link", { name: /Repository/i })).toBeVisible();
});

test("project guide compatibility redirect works", async ({ page, browser }) => {
  await page.goto(`${base}/projects.html`, { waitUntil: "commit" });
  await page.waitForURL(/\/ahmed-yasser-portfolio\/?#work$/, { waitUntil: "domcontentloaded" });

  expect(page.url()).toMatch(/\/ahmed-yasser-portfolio\/?#work$/);
  await page.close();

  const target = await browser.newPage();
  await target.goto(`${base}/projects`, { waitUntil: "domcontentloaded" });
  await target.waitForURL(/\/ahmed-yasser-portfolio\/?#work$/);
  expect(target.url()).toMatch(/\/ahmed-yasser-portfolio\/?#work$/);
  await target.close();
});

test("reduced motion keeps content readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/`);

  await expect(page.getByRole("heading", { name: /Messy problems, working systems/i })).toBeVisible();
  await expect(page.locator("canvas.data-field")).toBeHidden();
});
