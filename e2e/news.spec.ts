import { type Page, expect, test } from "@playwright/test";

import { GERMAN_DATE } from "./helpers";

/**
 * News-Uebersicht (/news) und News-Detail (/news/[slug]).
 * Design: Titel „ALLE NEWS“, Filterleiste (Suche/Zeitraum/Kategorie), Grid,
 * Pagination. Detail: Container 690px, H1, gelbe Subline, rechtsbuendige Meta.
 */

/** Das Kategorie-Feld der Filterleiste — nativ `<select>` oder eigenes Dropdown. */
function categoryFilter(page: Page) {
  return page
    .getByRole("combobox", { name: /kategorie/i })
    .or(page.getByLabel(/kategorie/i))
    .or(page.getByRole("button", { name: /kategorie/i }))
    .first();
}

test.describe("News-Uebersicht", () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto("/news");
    expect(response?.status()).toBe(200);
  });

  test("zeigt Titel und ein Grid mit Karten", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: /alle news/i })).toBeVisible();

    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(4);

    // Jede Karte: Meta-Zeile (Datum / Kategorie) und ein verlinkter Titel.
    await expect(cards.first().getByText(GERMAN_DATE)).toBeVisible();
    await expect(cards.first().locator('a[href^="/news/"]').first()).toBeVisible();
  });

  test("Kategorie-Filter aendert URL und Ergebnisliste", async ({ page }) => {
    const filter = categoryFilter(page);
    await expect(filter, "Die Filterleiste braucht ein Kategorie-Feld").toBeVisible();

    const titlesBefore = await page.locator("article h2, article h3").allInnerTexts();

    const tag = await filter.evaluate((el) => el.tagName);
    if (tag === "SELECT") {
      const options = await filter.locator("option").count();
      expect(options, "Kategorie-Select braucht Optionen").toBeGreaterThan(1);
      await filter.selectOption({ index: 1 });
    } else {
      await filter.click();
      const option = page.getByRole("option").or(page.getByRole("menuitem")).first();
      await expect(option).toBeVisible();
      await option.click();
    }

    // Der Filter ist im URL-Zustand verankert (teilbare Links, Back-Button).
    await expect(page).toHaveURL(/\?.*(kategorie|category)=/i);

    const titlesAfter = await page.locator("article h2, article h3").allInnerTexts();
    expect(
      titlesAfter.length !== titlesBefore.length ||
        titlesAfter.join("|") !== titlesBefore.join("|") ||
        titlesAfter.length === 0,
      "Die gefilterte Liste muss sich von der ungefilterten unterscheiden",
    ).toBe(true);

    // Auch gefiltert bleibt die Seite intakt.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("News-Detail", () => {
  test("Klick auf die erste Karte fuehrt zum Artikel", async ({ page }) => {
    await page.goto("/news");

    const firstCard = page.locator("article").first();
    const cardTitle = (await firstCard.getByRole("heading").first().innerText()).trim();
    await firstCard.locator('a[href^="/news/"]').first().click();

    await expect(page).toHaveURL(/\/news\/[^/]+$/);

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    expect(
      (await heading.innerText()).trim(),
      "Die H1 des Artikels muss dem Kartentitel entsprechen",
    ).toContain(cardTitle);

    // Meta-Zeile mit Datum (und Kategorie).
    await expect(page.getByText(GERMAN_DATE).first()).toBeVisible();

    // Artikeltext ist vorhanden, nicht nur die Ueberschrift.
    const article = page.locator("article").first();
    expect((await article.innerText()).length).toBeGreaterThan(100);
  });

  test("zeigt verwandte News unter dem Artikel", async ({ page }) => {
    await page.goto("/news");
    await page.locator('article a[href^="/news/"]').first().click();
    await expect(page).toHaveURL(/\/news\/[^/]+$/);

    const currentUrl = new URL(page.url()).pathname;
    const relatedLinks = page.locator(`a[href^="/news/"]:not([href="${currentUrl}"])`);
    await expect(relatedLinks.first()).toBeVisible();

    const relatedHeading = page
      .getByRole("heading", { name: /news/i })
      .or(page.getByRole("link", { name: /allen news/i }));
    await expect(relatedHeading.first()).toBeVisible();
  });
});
