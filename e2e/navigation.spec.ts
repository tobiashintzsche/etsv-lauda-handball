import { expect, test } from "@playwright/test";

import { burgerButton, closeNav, expectNavClosed, navPanel, openNav } from "./helpers";

/**
 * Navigations-Overlay (figma-design-spec §3 „Navigation“).
 * Ebene 1: Panel mit Menuepunkten · Ebene 2: Flyout fuer Eintraege mit Kindern.
 */
test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Overlay ist zunaechst geschlossen", async ({ page }) => {
    await expect(burgerButton(page)).toBeVisible();
    await expectNavClosed(page);
  });

  test("Burger oeffnet das Overlay mit den Menuepunkten", async ({ page }) => {
    await openNav(page);

    const panel = navPanel(page);
    await expect(panel.getByText(/^herren$/i).first()).toBeVisible();
    await expect(panel.getByText(/^jugend$/i).first()).toBeVisible();
    await expect(panel.getByText(/spiel(ü|ue)bersicht/i).first()).toBeVisible();
    await expect(panel.getByText(/^news$/i).first()).toBeVisible();
  });

  test("„Jugend“ oeffnet das Flyout mit weiteren Eintraegen", async ({ page }) => {
    await openNav(page);
    const panel = navPanel(page);

    const before = await page.getByRole("link").count();
    await panel
      .getByText(/^jugend$/i)
      .first()
      .click();

    // Ebene 2 blendet zusaetzliche Links ein — Ebene 1 bleibt sichtbar.
    await expect
      .poll(async () => page.getByRole("link").count(), {
        message: "Flyout muss zusaetzliche Links einblenden",
      })
      .toBeGreaterThan(before);
    await expect(panel.getByText(/^jugend$/i).first()).toBeVisible();
  });

  test("Klick auf „News“ navigiert zur Uebersicht", async ({ page }) => {
    await openNav(page);
    await navPanel(page)
      .getByRole("link", { name: /^news$/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/news$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("X schliesst das Overlay wieder", async ({ page }) => {
    await openNav(page);
    await expect(
      navPanel(page)
        .getByText(/^herren$/i)
        .first(),
    ).toBeVisible();

    await closeNav(page);
    await expectNavClosed(page);
    await expect(burgerButton(page)).toBeVisible();
  });
});
