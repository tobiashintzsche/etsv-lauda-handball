import { describe, expect, it } from "vitest";

import { slugify, slugifyWithDedupe } from "@/lib/slugify";

describe("slugify", () => {
  it("lowercases and joins words with dashes", () => {
    expect(slugify("Ueber den Verein")).toBe("ueber-den-verein");
  });

  it("transliterates German umlauts", () => {
    expect(slugify("Über den Verein")).toBe("ueber-den-verein");
    expect(slugify("Männer")).toBe("maenner");
    expect(slugify("Öffnungszeiten")).toBe("oeffnungszeiten");
    expect(slugify("Grüße")).toBe("gruesse");
  });

  it("transliterates uppercase umlauts too (lowercasing happens first)", () => {
    expect(slugify("ÄÖÜSS")).toBe("aeoeuess");
    expect(slugify("ÄNDERUNG")).toBe("aenderung");
  });

  it("turns ß into ss", () => {
    expect(slugify("Spaß am Handball")).toBe("spass-am-handball");
    expect(slugify("Straße")).toBe("strasse");
  });

  it("drops special characters", () => {
    expect(slugify("Sieg! 30:24 gegen TV Hardheim?")).toBe("sieg-3024-gegen-tv-hardheim");
    expect(slugify("Turnier & Fest")).toBe("turnier-fest");
    expect(slugify("ETSV Lauda – Spielbericht")).toBe("etsv-lauda-spielbericht");
  });

  it("collapses whitespace runs and trims the edges", () => {
    expect(slugify("   Hallo    Welt   ")).toBe("hallo-welt");
    expect(slugify("\tNeue\nSaison ")).toBe("neue-saison");
  });

  it("collapses repeated dashes and strips leading/trailing ones", () => {
    expect(slugify("--Kontakt--")).toBe("kontakt");
    expect(slugify("A -- B")).toBe("a-b");
    expect(slugify("Herren - Bezirksliga")).toBe("herren-bezirksliga");
  });

  it("keeps digits", () => {
    expect(slugify("Herren 2 Saison 2026/27")).toBe("herren-2-saison-202627");
  });

  it("is idempotent — running it on its own output changes nothing", () => {
    const once = slugify("Über den Verein & Spaß");
    expect(slugify(once)).toBe(once);
  });

  it("returns an empty string when nothing usable remains", () => {
    expect(slugify("")).toBe("");
    expect(slugify("!!!")).toBe("");
    expect(slugify("   ")).toBe("");
  });

  // Dokumentiertes Verhalten, kein Versehen: nicht-deutsche Diakritika haben
  // keine Transliterations-Regel und fallen deshalb ersatzlos weg.
  it("drops non-German diacritics instead of transliterating them", () => {
    expect(slugify("Café")).toBe("caf");
    expect(slugify("Genève")).toBe("genve");
  });

  // \w umfasst den Unterstrich — er ueberlebt die Bereinigung.
  it("keeps underscores", () => {
    expect(slugify("Team_Herren")).toBe("team_herren");
  });
});

describe("slugifyWithDedupe", () => {
  it("keeps unique names untouched", () => {
    expect(slugifyWithDedupe(["Herren", "Damen", "Jugend"])).toEqual(["herren", "damen", "jugend"]);
  });

  it("suffixes collisions with an incrementing counter", () => {
    expect(slugifyWithDedupe(["Herren", "Herren", "Herren"])).toEqual([
      "herren",
      "herren-2",
      "herren-3",
    ]);
  });

  it("treats names that slugify identically as collisions", () => {
    expect(slugifyWithDedupe(["Männliche A", "Maennliche A"])).toEqual([
      "maennliche-a",
      "maennliche-a-2",
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(slugifyWithDedupe([])).toEqual([]);
  });
});
