import { type Page, expect, test } from "@playwright/test";

import { expectNavClosed, navPanel, openNav } from "./helpers";

/**
 * Globale Suche (/suche). Im Figma nicht gezeichnet — geprueft wird deshalb
 * das Verhalten, nicht die Optik: Lupe im Header fuehrt hin, der Begriff steht
 * in der URL, Treffer sind nach Inhaltsart gruppiert.
 *
 * Die Suchbegriffe kommen aus dem Demo-Seed: die News „Meister! Die Herren
 * kroenen eine perfekte Saison“ und die Mannschaft „Maenner“.
 */

const NEWS_QUERY = "Meister";
const TEAM_QUERY = "Männer";
const NONSENSE_QUERY = "qwertzuiop123";

/** Das Suchfeld der Seite — ein `type="search"`-Input hat die Rolle `searchbox`. */
function searchBox(page: Page) {
  return page.getByRole("searchbox").first();
}

/** Tippt einen Begriff und wartet, bis die entprellte URL nachgezogen hat. */
async function search(page: Page, query: string) {
  await searchBox(page).fill(query);
  await expect(page).toHaveURL(/[?&]q=/);
}

test.describe("Globale Suche", () => {
  test("Lupe im Header fuehrt zur Suchseite", async ({ page }) => {
    await page.goto("/");

    await page.locator("header").getByRole("link", { name: /suche/i }).first().click();

    await expect(page).toHaveURL(/\/suche$/);
    await expect(searchBox(page)).toBeVisible();
  });

  test("Lupe im Nav-Overlay fuehrt hin und schliesst das Overlay", async ({ page }) => {
    await page.goto("/");
    await openNav(page);

    await navPanel(page).getByRole("link", { name: /suche/i }).first().click();

    await expect(page).toHaveURL(/\/suche$/);
    await expectNavClosed(page);
    await expect(searchBox(page)).toBeVisible();
  });

  test("hat genau eine H1 und ohne Begriff einen Hinweis", async ({ page }) => {
    const response = await page.goto("/suche");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: /suche/i })).toBeVisible();

    // Leere Anfrage: Hinweistext statt Ergebnisliste oder Leerzustand.
    await expect(page.getByText(/suchbegriff/i).first()).toBeVisible();
    await expect(page.getByText(/keine treffer/i)).toHaveCount(0);
  });

  test("„Meister“ findet den News-Beitrag", async ({ page }) => {
    await page.goto("/suche");
    await search(page, NEWS_QUERY);

    const hit = page.getByRole("link", { name: /meister/i }).first();
    await expect(hit).toBeVisible();
    await expect(hit).toHaveAttribute("href", /^\/news\//);

    // Gruppenueberschrift der Treffer.
    await expect(page.getByRole("heading", { level: 2, name: /^news$/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("„Männer“ findet die Mannschaft", async ({ page }) => {
    await page.goto("/suche");
    await search(page, TEAM_QUERY);

    await expect(page.getByRole("heading", { level: 2, name: /mannschaften/i })).toBeVisible();
    await expect(page.locator('a[href^="/mannschaften/"]').first()).toBeVisible();
  });

  test("Deep-Link liefert die Treffer schon vom Server", async ({ page }) => {
    // Ohne Tippen: `?q=` allein muss die Ergebnisliste erzeugen.
    const response = await page.goto(`/suche?q=${encodeURIComponent(NEWS_QUERY)}`);
    expect(response?.status()).toBe(200);

    await expect(searchBox(page)).toHaveValue(NEWS_QUERY);
    await expect(page.locator('a[href^="/news/"]').first()).toBeVisible();
  });

  test("Unsinns-Anfrage zeigt den Leerzustand", async ({ page }) => {
    await page.goto(`/suche?q=${NONSENSE_QUERY}`);

    await expect(page.getByText(/keine treffer/i).first()).toBeVisible();
    await expect(page.locator('a[href^="/news/"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/mannschaften/"]')).toHaveCount(0);

    // Auch der Leerzustand bietet einen Weg weiter.
    await expect(page.getByRole("link", { name: /allen news/i }).first()).toBeVisible();
  });
});
