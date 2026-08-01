import { describe, expect, it } from "vitest";

import { isSearchable, parseSearchQuery, searchHref, searchTerms } from "@/lib/search-query";

describe("parseSearchQuery", () => {
  it("trimmt und normalisiert Leerraum", () => {
    expect(parseSearchQuery("  Meister   Herren \n")).toBe("Meister Herren");
  });

  it("nimmt bei mehrfachem Parameter den ersten Wert", () => {
    expect(parseSearchQuery(["Meister", "Herren"])).toBe("Meister");
  });

  it("liefert fuer fehlende oder leere Parameter einen leeren String", () => {
    expect(parseSearchQuery(undefined)).toBe("");
    expect(parseSearchQuery("   ")).toBe("");
    expect(parseSearchQuery([])).toBe("");
  });

  it("entfernt LIKE-Platzhalter, damit % nicht alles findet", () => {
    expect(parseSearchQuery("%")).toBe("");
    expect(parseSearchQuery("Mei%ster")).toBe("Mei ster");
    expect(parseSearchQuery("a_b\\c")).toBe("a b c");
  });

  it("kappt uebermaessig lange Eingaben", () => {
    expect(parseSearchQuery("x".repeat(200))).toHaveLength(80);
  });
});

describe("isSearchable", () => {
  it("verlangt mindestens zwei Zeichen", () => {
    expect(isSearchable("")).toBe(false);
    expect(isSearchable("a")).toBe(false);
    expect(isSearchable("ab")).toBe(true);
  });
});

describe("searchTerms", () => {
  it("zerlegt die Anfrage in kleingeschriebene Woerter", () => {
    expect(searchTerms("Perfekte Saison")).toEqual(["perfekte", "saison"]);
  });

  it("entfernt Satzzeichen an den Wortraendern", () => {
    expect(searchTerms("Meister!")).toEqual(["meister"]);
    expect(searchTerms("„Herren“,")).toEqual(["herren"]);
  });

  it("laesst Umlaute unangetastet — die Datenbank vergleicht sie eins zu eins", () => {
    expect(searchTerms("Männer")).toEqual(["männer"]);
  });

  it("entfernt Dubletten", () => {
    expect(searchTerms("Lauda lauda LAUDA")).toEqual(["lauda"]);
  });

  it("ignoriert Ein-Zeichen-Woerter", () => {
    expect(searchTerms("SG a Lauda")).toEqual(["sg", "lauda"]);
  });

  it("faellt auf die ganze Anfrage zurueck, wenn nur kurze Woerter uebrig blieben", () => {
    expect(searchTerms("a b")).toEqual(["a b"]);
  });

  it("begrenzt die Zahl der Woerter", () => {
    expect(searchTerms("eins zwei drei vier fuenf sechs sieben")).toHaveLength(5);
  });

  it("liefert fuer eine leere Anfrage nichts", () => {
    expect(searchTerms("")).toEqual([]);
  });
});

describe("searchHref", () => {
  it("haengt den Begriff als ?q= an", () => {
    expect(searchHref("Meister")).toBe("/suche?q=Meister");
  });

  it("kodiert Sonderzeichen", () => {
    expect(searchHref("Männer B")).toBe("/suche?q=M%C3%A4nner+B");
  });

  it("bleibt ohne Begriff auf der nackten Route", () => {
    expect(searchHref("")).toBe("/suche");
    expect(searchHref("   ")).toBe("/suche");
  });
});
