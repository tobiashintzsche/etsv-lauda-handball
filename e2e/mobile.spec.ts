import { type Locator, expect, test } from "@playwright/test";

import { closeNav, expectNavClosed, heroDots, heroSlider, navPanel, openNav } from "./helpers";

/**
 * Mobile-Verhalten im Design-Breakpoint 390×844 (Projekt „mobile“ in
 * playwright.config.ts).
 *
 * Kernpunkt aus figma-design-spec §2/§6: News-Teaser, „Mehr als Handball“,
 * Spielerkarten und Ligatabelle sind horizontale Scroll-Tracks — der Anschnitt
 * ist Absicht und darf nicht zu gestapelten Grids „korrigiert“ werden.
 */
const MOBILE_WIDTH = 390;

async function scrollsHorizontally(track: Locator): Promise<boolean> {
  return track.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
}

test.describe("Mobile (390px)", () => {
  test("Startseite rendert ohne horizontales Ueberlaufen der Seite", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    // Die Seite selbst scrollt nie seitwaerts — nur die Tracks in ihr.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "Die Seite darf auf 390px nicht horizontal scrollen").toBeLessThanOrEqual(1);
  });

  test("Hero-Slider laeuft randlos ueber die volle Breite", async ({ page }) => {
    await page.goto("/");

    const hero = heroSlider(page);
    await expect(hero).toBeVisible();

    const box = await hero.boundingBox();
    expect(box, "Hero muss sichtbar sein").not.toBeNull();
    expect(box!.width, "Auf Mobile laeuft das Bildband randlos").toBeGreaterThanOrEqual(
      MOBILE_WIDTH - 1,
    );
    expect(box!.height, "Der Hero traegt nur mit ordentlicher Hoehe").toBeGreaterThanOrEqual(360);

    expect(await heroDots(page).count()).toBeGreaterThanOrEqual(3);
    await expect(heroDots(page).first()).toBeVisible();
  });

  test("„Mehr als Handball“ ist ein horizontaler Scroll-Track", async ({ page }) => {
    await page.goto("/");

    const tracks = page.locator(".scroll-track");
    await expect(tracks.first(), "Utility .scroll-track fehlt (siehe CLAUDE.md)").toBeVisible();

    const first = tracks.first();
    expect(
      await scrollsHorizontally(first),
      "Der Track muss breiter sein als der Viewport (Anschnitt ist Absicht)",
    ).toBe(true);

    // Und er laesst sich tatsaechlich verschieben.
    await first.evaluate((el) => el.scrollBy(200, 0));
    expect(await first.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });

  test("Mobile-Navigation nimmt die volle Breite ein", async ({ page }) => {
    await page.goto("/");
    await openNav(page);

    const box = await navPanel(page).boundingBox();
    expect(box, "Nav-Panel muss sichtbar sein").not.toBeNull();
    expect(box!.width, "Mobile-Nav ist full-width").toBeGreaterThanOrEqual(MOBILE_WIDTH - 8);

    await closeNav(page);
    await expectNavClosed(page);
  });

  test("News-Uebersicht stapelt einspaltig", async ({ page }) => {
    await page.goto("/news");

    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();

    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    // Einspaltig heisst: die zweite Karte liegt unter der ersten, nicht daneben.
    expect(second!.y).toBeGreaterThan(first!.y);
  });

  test("Ligatabelle bleibt auf Mobile scrollbar statt zu ueberlaufen", async ({ page }) => {
    await page.goto("/mannschaften/maenner");

    const tracks = page.locator(".scroll-track");
    if ((await tracks.count()) === 0) test.skip(true, "Keine Scroll-Tracks auf dieser Seite");

    for (let i = 0; i < (await tracks.count()); i += 1) {
      const box = await tracks.nth(i).boundingBox();
      if (!box) continue;
      expect(box.width, "Track darf nicht breiter als der Viewport sein").toBeLessThanOrEqual(
        MOBILE_WIDTH + 1,
      );
    }
  });
});
