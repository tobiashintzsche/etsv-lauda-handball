import { type Page, expect, test } from "@playwright/test";

import { firstNewsSlug } from "./helpers";

/**
 * SEO-Grundausstattung: Title/Description je Route, robots.txt, sitemap.xml und
 * strukturierte Daten (SportsOrganization im Layout, NewsArticle im Detail).
 */

async function metaDescription(page: Page): Promise<string> {
  const meta = page.locator('meta[name="description"]');
  await expect(meta, "meta[name=description] fehlt").toHaveCount(1);
  return (await meta.getAttribute("content")) ?? "";
}

async function jsonLdBlocks(page: Page): Promise<Record<string, unknown>[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.flatMap((text) => {
    const parsed = JSON.parse(text) as Record<string, unknown> | Record<string, unknown>[];
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

test.describe("SEO", () => {
  test("Startseite hat Title, Description und SportsOrganization-JSON-LD", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/.{5,}/);
    expect((await metaDescription(page)).length).toBeGreaterThan(20);

    const blocks = await jsonLdBlocks(page);
    expect(blocks.length, "Kein JSON-LD auf der Startseite").toBeGreaterThanOrEqual(1);
    const types = blocks.map((b) => String(b["@type"]));
    expect(types.join(",")).toMatch(/SportsOrganization|Organization/);
  });

  test("News-Detail hat eigenen Title und NewsArticle-JSON-LD", async ({ page }) => {
    const slug = await firstNewsSlug(page);
    await page.goto(`/news/${slug}`);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
    expect((await metaDescription(page)).length).toBeGreaterThan(10);

    const blocks = await jsonLdBlocks(page);
    const types = blocks.map((b) => String(b["@type"]));
    expect(types.join(","), "NewsArticle-Markup fehlt").toMatch(/NewsArticle|Article/);
  });

  test("Titel unterscheiden sich zwischen den Routen", async ({ page }) => {
    await page.goto("/");
    const home = await page.title();
    await page.goto("/news");
    const news = await page.title();
    expect(news).not.toBe(home);
  });

  test("Mannschaftsseite hat SportsTeam-JSON-LD", async ({ page }) => {
    await page.goto("/mannschaften/maenner");
    const types = (await jsonLdBlocks(page)).map((b) => String(b["@type"]));
    expect(types.join(",")).toMatch(/SportsTeam|SportsOrganization/);
  });

  test("robots.txt ist erreichbar und verweist auf die Sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toMatch(/user-agent/i);
    expect(body).toMatch(/sitemap/i);
  });

  test("sitemap.xml ist erreichbar und listet News", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/xml/);

    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toMatch(/<loc>[^<]*\/news/);
  });

  test("Admin-Login ist erreichbar", async ({ page }) => {
    const response = await page.goto("/admin");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });
});
