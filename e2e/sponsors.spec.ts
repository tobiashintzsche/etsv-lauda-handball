import { expect, test } from "@playwright/test";

import { mainScope } from "./helpers";

/**
 * Sponsorenseite (/sponsoren): helle Sektion (Beton-Textur + weisses Overlay,
 * schwarzer Text), Titel „SPONSOREN“, je Sponsor ein alternierendes
 * 3-Spalten-Raster aus Text und Logo.
 */
test.describe("Sponsoren", () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto("/sponsoren");
    expect(response?.status()).toBe(200);
  });

  test("zeigt Titel und Sponsoren", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/sponsoren/i);

    const emptyState = page.getByText(/partner werden hier in k(ü|ue)rze/i);
    if ((await emptyState.count()) > 0) {
      // Zulaessiger Zustand, aber gegen die geseedete DB ein Fehlschlag wert.
      throw new Error("Sponsoren-Seite zeigt den Empty-State — Seed unvollstaendig?");
    }

    // Je Sponsor: Name als Ueberschrift + Logo.
    const sponsorHeadings = page.getByRole("heading").filter({ hasNotText: /^sponsoren$/i });
    expect(await sponsorHeadings.count()).toBeGreaterThanOrEqual(1);

    const logos = (await mainScope(page)).locator("img");
    await expect(logos.first()).toBeVisible();
    expect(await logos.count()).toBeGreaterThanOrEqual(1);
  });

  test("verlinkt die Sponsoren-Websites extern", async ({ page }) => {
    const externalLinks = (await mainScope(page)).locator('a[href^="http"]');
    // Erst wartend pruefen, dann zaehlen: `count()` wiederholt nicht von selbst.
    await expect(externalLinks.first()).toBeVisible();
    expect(
      await externalLinks.count(),
      "Mindestens ein Sponsor sollte eine Website verlinken",
    ).toBeGreaterThanOrEqual(1);
  });
});
