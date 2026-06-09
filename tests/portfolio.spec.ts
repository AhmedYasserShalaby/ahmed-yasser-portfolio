import { expect, test } from "@playwright/test";

const base = "/ahmed-yasser-portfolio";

test("home renders the motion portfolio shell", async ({ page }) => {
  await page.goto(`${base}/`);

  await expect(page.getByRole("heading", { name: /Messy problems, working systems/i })).toBeVisible();
  await expect(page.getByTestId("goku-companion")).toBeVisible();
  await expect(page.locator(".orbit-system")).toBeVisible();
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

test("goku companion reacts to clicks", async ({ page }) => {
  await page.goto(`${base}/`);

  const goku = page.getByTestId("goku-companion");
  const speech = page.locator(".goku-speech.is-visible");
  const isMobile = (page.viewportSize()?.width ?? 0) < 900;
  await expect(goku).toBeVisible();

  // Speech bubble should appear with section commentary
  if (isMobile) {
    await expect(speech).toBeAttached();
  } else {
    await expect(speech).toBeVisible();
  }

  // Click Goku to trigger super saiyan
  await page.getByRole("button", { name: /Interact with Goku/i }).click();
  await expect(goku).toHaveClass(/is-super-saiyan/);

  // Click again for funny quote
  await page.getByRole("button", { name: /Interact with Goku/i }).click();
  if (isMobile) {
    await expect(speech).toBeAttached();
  } else {
    await expect(speech).toBeVisible();
  }
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
