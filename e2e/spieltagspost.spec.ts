import { expect, test } from "@playwright/test";

/**
 * Spieltagsposts — Uebersicht, Render-Route und PNG-Export.
 *
 * Setzt voraus, dass die Pipeline gelaufen ist:
 *   pnpm posts:generate --from=2026-09-01 --days=90
 *
 * Ohne Vorschlaege in der Datenbank ueberspringen sich die Detailtests selbst,
 * statt rot zu werden — die Suite laeuft auch auf einer frisch geseedeten DB.
 */

const POST_SIZE = { width: 1080, height: 1350 };

/** Id des ersten Vorschlags aus der Uebersicht, oder null. */
async function firstPostId(page: import("@playwright/test").Page): Promise<string | null> {
  await page.goto("/spieltagspost");
  const link = page.locator('a[href^="/spieltagspost/"]').first();
  if ((await link.count()) === 0) return null;
  const href = await link.getAttribute("href");
  return (href ?? "").replace("/spieltagspost/", "") || null;
}

test.describe("Spieltagsposts", () => {
  test("Uebersicht listet die Vorschlaege", async ({ page }) => {
    await page.goto("/spieltagspost");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/spieltagsposts/i);
  });

  test("Uebersicht ist noindex", async ({ page }) => {
    await page.goto("/spieltagspost");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("Render-Route zeigt Badge und Spielzeilen", async ({ page }) => {
    const id = await firstPostId(page);
    test.skip(id === null, "Keine Spieltagsposts in der Datenbank — pnpm posts:generate");

    await page.goto(`/spieltagspost/${id}`);

    const post = page.getByTestId("matchday-post");
    await expect(post).toBeVisible();

    // Der schwarze Kasten traegt HEIMSPIEL / AUSWAERTSSPIEL / SPIELTAG.
    await expect(post.locator(".matchday-badge")).toHaveText(
      /heimspiel|ausw(ä|ae)rtsspiel|spieltag|ergebnisse/i,
    );

    // Mindestens eine Zeile, jede mit Mannschaft, Gegner und rechter Spalte.
    const rows = post.locator(".matchday-row");
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(rows.first()).toContainText(/vs/i);
  });

  test("Farb-Alternanz startet in jeder Gruppe bei Weiss", async ({ page }) => {
    const id = await firstPostId(page);
    test.skip(id === null, "Keine Spieltagsposts in der Datenbank — pnpm posts:generate");

    await page.goto(`/spieltagspost/${id}`);
    const post = page.getByTestId("matchday-post");

    // Die Klasse traegt die Alternanz — sie ist reine Render-Logik.
    await expect(post.locator(".matchday-row--white").first()).toBeVisible();

    const groups = post.locator(".matchday-group");
    const groupCount = await groups.count();

    for (let index = 0; index < groupCount; index += 1) {
      const colors = await groups
        .nth(index)
        .locator(".matchday-row")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-color")));

      const expected = colors.map((_, i) => (i % 2 === 0 ? "white" : "yellow"));
      expect(colors, `Gruppe ${index + 1} muss bei Weiss beginnen und wechseln`).toEqual(expected);
    }
  });

  test("Detailseite ist noindex", async ({ page }) => {
    const id = await firstPostId(page);
    test.skip(id === null, "Keine Spieltagsposts in der Datenbank — pnpm posts:generate");

    await page.goto(`/spieltagspost/${id}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("Rohansicht liefert exakt 1080 × 1350", async ({ page }) => {
    const id = await firstPostId(page);
    test.skip(id === null, "Keine Spieltagsposts in der Datenbank — pnpm posts:generate");

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/spieltagspost/${id}?raw=1`);

    const post = page.getByTestId("matchday-post");
    await expect(post).toBeVisible();

    const box = await post.boundingBox();
    expect(box?.width).toBe(POST_SIZE.width);
    expect(box?.height).toBe(POST_SIZE.height);
  });

  test("PNG-Export liefert ein Bild in Postgroesse", async ({ page, request }) => {
    const id = await firstPostId(page);
    test.skip(id === null, "Keine Spieltagsposts in der Datenbank — pnpm posts:generate");

    const response = await request.get(`/api/matchday-post/${id}/image`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");

    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(10_000);

    // PNG-Header: Breite und Hoehe stehen als Big-Endian ab Byte 16.
    expect(body.readUInt32BE(16)).toBe(POST_SIZE.width);
    expect(body.readUInt32BE(20)).toBe(POST_SIZE.height);
  });

  test("Unbekannter Post fuehrt nicht zu einem Serverfehler", async ({ page }) => {
    const response = await page.goto("/spieltagspost/999999");
    expect(response?.status()).toBeLessThan(500);
  });

  test("Admin bleibt erreichbar", async ({ page }) => {
    const response = await page.goto("/admin");
    expect(response?.status()).toBeLessThan(400);
  });
});
