import { expect, test } from "@playwright/test";

import { heroDots, heroSlider } from "./helpers";

/**
 * Startseite (/) — Aufbau:
 * Header · Matchday-Bar · Hero-Slider · Ueber den Verein ·
 * Mehr als Handball · Naechste Spiele · Ligatabelle · Footer.
 * Der Hero ersetzt den frueheren News-Teaser — News laufen dort.
 */
test.describe("Startseite", () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status(), "/ muss mit 200 antworten").toBe(200);
  });

  test("rendert mit genau einer H1", async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("zeigt den Hero-Slider mit Chip, Titelkasten und Dots", async ({ page }) => {
    const hero = heroSlider(page);
    await expect(hero).toBeVisible();

    // Mindestens drei Folien — der Baustein laesst 3, 4 oder 5 zu.
    const dots = heroDots(page);
    expect(await dots.count()).toBeGreaterThanOrEqual(3);
    await expect(dots.first()).toBeVisible();
    await expect(dots.first()).toHaveAttribute("aria-current", "true");

    // Gelber Kategorie-Chip ueber dem Titelkasten.
    const chip = hero.locator("p.bg-secondary").first();
    await expect(chip).toBeVisible();
    expect((await chip.innerText()).trim().length).toBeGreaterThan(2);

    // Der Titelkasten zeigt den Titel der ersten Folie.
    const firstTitle = await hero.locator('a[href^="/news/"]').first().getAttribute("aria-label");
    expect(firstTitle, "Die Folie muss den Beitrag verlinken").toBeTruthy();
    await expect(hero.getByText(firstTitle!, { exact: true })).toBeVisible();

    // „ALLE NEWS →“ rechts unter dem Bild.
    await expect(hero.locator('a[href="/news"]')).toBeVisible();
  });

  test("Klick auf den zweiten Dot wechselt die Folie", async ({ page }) => {
    const hero = heroSlider(page);
    const dots = heroDots(page);

    const secondTitle = await hero.locator('a[href^="/news/"]').nth(1).getAttribute("aria-label");
    expect(secondTitle).toBeTruthy();

    await dots.nth(1).click();

    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(dots.first()).toHaveAttribute("aria-current", "false");
    await expect(hero.getByText(secondTitle!, { exact: true })).toBeVisible();
  });

  test("Klick auf das Hero-Bild fuehrt zum Beitrag", async ({ page }) => {
    const slide = heroSlider(page).locator('a[href^="/news/"]').first();
    const href = await slide.getAttribute("href");

    await slide.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("zeigt „Ueber den Verein“ mit der Mannschaftsliste und den News-Link im Hero", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: /(ü|ue)ber den verein/i })).toBeVisible();

    // Die Teamliste verlinkt auf die Mannschaftsseiten.
    const teamLinks = page.locator('a[href^="/mannschaften/"]');
    expect(await teamLinks.count()).toBeGreaterThanOrEqual(6);

    // Der Weg zu allen News laeuft seit dem Hero ueber dessen Button.
    await expect(heroSlider(page).locator('a[href="/news"]')).toBeVisible();
  });

  test("zeigt die Sektion „Naechste Spiele“ mit Heim- und Auswaertsspalte", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /n(ä|ae)chste spiele/i })).toBeVisible();
    await expect(page.getByText(/^heimspiele$/i).first()).toBeVisible();
    await expect(page.getByText(/ausw(ä|ae)rtsspiele/i).first()).toBeVisible();
  });

  test("zeigt die Ligatabelle (oder ihren Empty-State) samt handball.net-Quellenangabe", async ({
    page,
  }) => {
    const table = page
      .getByRole("heading", { name: /ligatabelle/i })
      .or(page.getByText(/keine tabellendaten/i))
      .or(page.getByRole("link", { name: /zu den tabellen/i }));
    await expect(table.first()).toBeVisible();

    // Die Quellenangabe ist eine rechtliche Auflage, kein Nice-to-have.
    await expect(page.getByText(/powered by/i).first()).toBeVisible();
  });

  test("zeigt die Matchday-Bar mit Link zur Spieluebersicht", async ({ page }) => {
    const bar = page.locator('a[href="/spieluebersicht"]');
    await expect(bar.first()).toBeVisible();
  });

  test("hat Header und Footer", async ({ page }) => {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link").first()).toBeVisible();
  });
});
