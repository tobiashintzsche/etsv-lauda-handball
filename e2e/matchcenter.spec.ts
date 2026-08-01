import { type Locator, type Page, expect, test } from "@playwright/test";

import { ACCORDION_CONTENT, accordionHeaders, isAccordionOpen } from "./helpers";

/** Das Panel zur Accordion-Zeile — zugeklappte Panels bleiben im DOM. */
async function panelOf(page: Page, header: Locator): Promise<Locator> {
  const panelId = await header.getAttribute("aria-controls");
  return panelId ? page.locator(`[id="${panelId}"]`) : page.getByRole("main");
}

/**
 * Spieluebersicht (/spieluebersicht): Titel + Subline, darunter je Mannschaft
 * eine Accordion-Zeile (Teamname + gelbe Liga-Zeile + Chevron). Die erste
 * Mannschaft ist beim Laden aufgeklappt (figma-design-spec §2).
 */
test.describe("Spieluebersicht", () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto("/spieluebersicht");
    expect(response?.status()).toBe(200);
  });

  test("zeigt Titel und Subline", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/spiel(ü|ue)bersicht/i);
    await expect(page.getByText(/alle mannschaften/i).first()).toBeVisible();
  });

  test("zeigt je Mannschaft eine Accordion-Zeile", async ({ page }) => {
    const headers = accordionHeaders(page);
    await expect(headers.first()).toBeVisible();
    expect(
      await headers.count(),
      "Die Spieluebersicht listet alle Mannschaften",
    ).toBeGreaterThanOrEqual(2);
  });

  test("die erste Mannschaft ist beim Laden aufgeklappt", async ({ page }) => {
    const first = accordionHeaders(page).first();
    expect(await isAccordionOpen(first), "Erstes Accordion muss offen sein").toBe(true);

    const panel = await panelOf(page, first);
    await expect(panel.getByText(ACCORDION_CONTENT).first()).toBeVisible();
  });

  /**
   * Jede Spielkarte zeigt fuer beide Vereine ein Wappen. Woher es kommt, darf
   * der Test nicht wissen — handball.net liefert es live mit, fuer Spiele aus
   * der eigenen Collection springt die statische Gegner-Map ein, und ohne
   * beides steht dort die Initialen-Kachel (`bg-position`). Genau ein leeres
   * Kaestchen darf nicht mehr vorkommen.
   *
   * Bewusst auf die Spielkarte (`<article>`) eingegrenzt: die handball.net-
   * Wortmarke der Quellenangabe ist ebenfalls ein `img` und wuerde die
   * Pruefung sonst immer bestehen lassen.
   */
  test("Spielkarten zeigen beide Vereinswappen", async ({ page }) => {
    const first = accordionHeaders(page).first();
    const panel = await panelOf(page, first);
    const cards = panel.locator("article");

    // Ausserhalb der Saison kann eine Mannschaft gar keine Spiele haben —
    // dann muss statt der Karten der Empty-State stehen.
    if ((await cards.count()) === 0) {
      await expect(panel.getByText(/keine spiele/i).first()).toBeVisible();
      return;
    }

    const crests = cards.first().locator("img, .bg-position");
    await expect(crests.first()).toBeVisible();
    expect(
      await crests.count(),
      "Heim- und Auswaertsverein brauchen je ein Wappen",
    ).toBeGreaterThanOrEqual(2);
  });

  test("Klick auf die zweite Mannschaft klappt deren Inhalt auf", async ({ page }) => {
    const headers = accordionHeaders(page);
    const second = headers.nth(1);
    await expect(second).toBeVisible();

    expect(await isAccordionOpen(second)).toBe(false);
    await second.click();

    await expect
      .poll(() => isAccordionOpen(second), { message: "Zweites Accordion muss aufklappen" })
      .toBe(true);

    // Der aufgeklappte Bereich zeigt tatsaechlich Inhalt (Spielplan/Widget/Empty-State).
    const label = (await second.innerText()).trim();
    expect(label.length).toBeGreaterThan(0);

    // Zugeklappte Panels bleiben im DOM (versteckt), damit die Browsersuche sie
    // findet — deshalb gezielt im geoeffneten Panel suchen und nicht seitenweit.
    const panel = await panelOf(page, second);
    await expect(panel.getByText(ACCORDION_CONTENT).first()).toBeVisible();
  });
});
