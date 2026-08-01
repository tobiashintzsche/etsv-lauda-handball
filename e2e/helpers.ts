import { type Locator, type Page, expect } from "@playwright/test";

/**
 * Gemeinsame Helfer der E2E-Specs.
 *
 * Grundsatz: keine `data-testid`s in Komponenten anderer Agenten. Gesucht wird
 * ueber Rollen und sichtbaren Text. Weil das Design Ueberschriften per CSS
 * (`text-transform: uppercase`) gross setzt, der DOM aber die Originalschreibung
 * enthaelt, sind alle Textmuster case-insensitive.
 */

/** Datumsformat der Seite: 27.07.2026 */
export const GERMAN_DATE = /\d{2}\.\d{2}\.\d{4}/;

/**
 * Der Hero-Slider der Startseite. Das <section> traegt ein `aria-label`
 * („Aktuelle Beitraege“) und damit die Rolle `region`.
 */
export function heroSlider(page: Page): Locator {
  return page.getByRole("region", { name: /aktuelle beitr(ä|ae)ge/i });
}

/** Die flachen Rechteck-Dots unter dem Hero-Bild. */
export function heroDots(page: Page): Locator {
  return heroSlider(page).getByRole("button", { name: /beitrag \d+ von \d+/i });
}

/** Der Burger-Button im Header. */
export function burgerButton(page: Page): Locator {
  return page.getByRole("button", { name: /men(ü|ue)|navigation/i }).first();
}

/**
 * Das Overlay-Panel — Dialog-Rolle bevorzugt, sonst die Nav mit den Menuepunkten.
 *
 * Die Fusszeile hat eine eigene `<nav>` mit denselben Zielen (Spieluebersicht,
 * News, Impressum). Sie ist ausgeschlossen, sonst haelt `expectNavClosed` sie
 * fuer das geoeffnete Overlay und die Pruefung geht nie fehl.
 */
export function navPanel(page: Page): Locator {
  return page
    .getByRole("dialog")
    .or(page.locator("nav:not(footer nav)").filter({ hasText: /spiel(ü|ue)bersicht/i }))
    .first();
}

/** Oeffnet das Navigations-Overlay ueber den Burger-Button. */
export async function openNav(page: Page): Promise<void> {
  const burger = burgerButton(page);
  await expect(burger).toBeVisible();
  await burger.click();
  await expect(navPanel(page)).toBeVisible();
}

/**
 * Prueft, dass das Overlay zu ist. Toleriert beide Umsetzungen: entweder ist
 * das Panel gar nicht gemountet/`hidden`, oder es steht (animiert) ausserhalb
 * des Viewports.
 */
export async function expectNavClosed(page: Page): Promise<void> {
  const panel = navPanel(page);
  if ((await panel.count()) === 0) return;
  if (await panel.isHidden()) return;

  const box = await panel.boundingBox();
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const offscreen = box === null || box.x + box.width <= 1 || box.x >= viewportWidth - 1;
  expect(offscreen, "Nav-Overlay muss geschlossen oder aus dem Viewport geschoben sein").toBe(true);
}

/** Schliesst das Overlay ueber den X-Button. */
export async function closeNav(page: Page): Promise<void> {
  const close = page.getByRole("button", { name: /schlie(ß|ss)en|close/i }).first();
  await expect(close).toBeVisible();
  await close.click();
}

/**
 * Slug des ersten Artikels der News-Uebersicht. Die E2E-Suite laeuft gegen
 * geseedete Daten, kennt aber keine konkreten Slugs — deshalb ueber die Liste.
 */
export async function firstNewsSlug(page: Page): Promise<string> {
  await page.goto("/news");
  const link = page.locator('a[href^="/news/"]').first();
  await expect(link, "Auf /news muss mindestens ein Artikel verlinkt sein").toBeVisible();
  const href = await link.getAttribute("href");
  return (href ?? "").replace("/news/", "");
}

/**
 * Inhaltsbereich der Seite — schliesst Header und Footer aus, damit z.B. das
 * Logo im Header nicht als Sponsorenlogo durchgeht. Faellt auf `body` zurueck,
 * falls die Route kein `<main>` rendert.
 */
export async function mainScope(page: Page): Promise<Locator> {
  const main = page.getByRole("main");
  return (await main.count()) > 0 ? main.first() : page.locator("body");
}

/**
 * Accordion-Kopfzeilen der Spieluebersicht. Deckt beide plausiblen Umsetzungen
 * ab: natives `<details>/<summary>` oder Buttons mit `aria-expanded`.
 *
 * Bewusst auf `main` eingegrenzt: der Burger im Header traegt zu Recht ebenfalls
 * `aria-expanded` und stuende sonst als erste „Accordion-Zeile“ im Ergebnis.
 */
export function accordionHeaders(page: Page): Locator {
  return page.locator("main summary, main button[aria-expanded]");
}

/** Ist die Accordion-Zeile aufgeklappt? */
export async function isAccordionOpen(header: Locator): Promise<boolean> {
  return header.evaluate((el) => {
    if (el.tagName === "SUMMARY") return (el.parentElement as HTMLDetailsElement)?.open === true;
    return el.getAttribute("aria-expanded") === "true";
  });
}

/**
 * Inhalte, die nur in einem aufgeklappten Accordion-Panel stehen koennen:
 * Spielplan-Daten, das handball.net-Widget bzw. dessen Attribution oder der
 * Empty-State ausserhalb der Saison.
 */
export const ACCORDION_CONTENT =
  /handball\.net|zu den tabellen|zum spielplan|spielplan|tabelle|keine|\d{2}\.\d{2}\.\d{4}/i;
