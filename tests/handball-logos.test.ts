import { describe, expect, it } from "vitest";

import {
  clubInitials,
  findClubLogoUrl,
  isOwnClub,
  normalizeClubName,
} from "@/lib/handball/opponent-logos";

/**
 * Die Gegner-Logo-Map ist der Ersatz fuer die Wappen, die unsere eigene
 * `games`-Collection nicht kennt. Sie steht und faellt mit dem Namensabgleich:
 * die Seed-Gegner stammen aus denselben handball.net-Daten wie die Map, ein
 * Treffer muss also garantiert sein — auch wenn eine Redakteurin spaeter mit
 * anderer Gross-/Kleinschreibung oder Leerzeichen tippt.
 */

/** Die Gegner aus `scripts/seed-demo/content-games.ts`, woertlich. */
const SEED_OPPONENTS = [
  "SG Gundelsheim",
  "HSG Staufer Bad Wimpfen/Biberach 2",
  "SG Degmarn-Oedheim 2",
  "SG Heuchelberg 3",
  "HSG Hohenlohe 3",
  "TSV Crailsheim",
  "SG Bad Mergentheim",
  "HSG Kochertürn/Stein 2",
  "TV Hardheim 1895",
  "TSV 1863 Buchen",
  "JSG Tauberfranken",
  "HB Ludwigsburg",
  "SpG Walldürn",
  "TV Mosbach",
  "TV Bad Rappenau",
  "SC Züttlingen",
];

describe("normalizeClubName", () => {
  it("ignoriert Gross-/Kleinschreibung und Randleerzeichen", () => {
    expect(normalizeClubName("  TSV Crailsheim ")).toBe(normalizeClubName("tsv crailsheim"));
  });

  it("behandelt Satzzeichen wie Leerzeichen", () => {
    expect(normalizeClubName("HSG Kochertürn/Stein 2")).toBe("hsg kochertürn stein 2");
    expect(normalizeClubName("HSG Kochertürn / Stein 2")).toBe("hsg kochertürn stein 2");
    expect(normalizeClubName("SG Degmarn-Oedheim 2")).toBe("sg degmarn oedheim 2");
  });

  it("zieht mehrfache Leerzeichen zusammen", () => {
    expect(normalizeClubName("TV   Bad    Rappenau")).toBe("tv bad rappenau");
  });

  it("behaelt Umlaute — Quelle und Map stammen aus denselben Daten", () => {
    expect(normalizeClubName("SpG Walldürn")).toBe("spg walldürn");
  });

  it("liefert einen leeren String fuer fehlende Namen", () => {
    expect(normalizeClubName(null)).toBe("");
    expect(normalizeClubName(undefined)).toBe("");
    expect(normalizeClubName("   ")).toBe("");
    expect(normalizeClubName("---")).toBe("");
  });
});

describe("findClubLogoUrl", () => {
  it("findet jeden Gegner aus dem Seed", () => {
    const misses = SEED_OPPONENTS.filter((name) => findClubLogoUrl(name) === null);
    expect(misses, "Seed-Gegner ohne Wappen").toEqual([]);
  });

  it("loest die Pseudo-URI in eine CDN-URL mit Breitenparameter auf", () => {
    expect(findClubLogoUrl("TSV Crailsheim")).toBe(
      "https://www.handball.net/files/clubs/logos/99f86e6e-a337-4b41-8023-9fc8d6ceb6d0.png?d=48x",
    );
    expect(findClubLogoUrl("TSV Crailsheim", 24)).toMatch(/\?d=24x$/);
  });

  it("trifft unabhaengig von Schreibweise und Satzzeichen", () => {
    const expected = findClubLogoUrl("HSG Kochertürn/Stein 2");
    expect(expected).not.toBeNull();
    expect(findClubLogoUrl("  hsg kochertürn / stein 2  ")).toBe(expected);
  });

  it("faellt bei unbekannter Mannschaftsnummer auf den Verein zurueck", () => {
    // "TSV Crailsheim 2" steht nicht in der Map — dieselbe Vereinsfarbe zeigt
    // aber jede Mannschaft desselben Vereins.
    expect(findClubLogoUrl("TSV Crailsheim 2")).toBe(findClubLogoUrl("TSV Crailsheim"));
  });

  it("haelt eine Jahreszahl im Namen zusammen", () => {
    // "1895" ist das Gruendungsjahr, keine Mannschaftsnummer.
    expect(findClubLogoUrl("TV Hardheim 1895")).not.toBeNull();
    expect(findClubLogoUrl("TV Hardheim 1895 2")).toBe(findClubLogoUrl("TV Hardheim 1895"));
  });

  it("kennt das eigene Wappen", () => {
    expect(findClubLogoUrl("ETSV Lauda")).toBe(
      "https://www.handball.net/files/migration/V20210907/H4A_26005_Baden_Lauda.svg?d=48x",
    );
  });

  it("liefert null statt zu raten", () => {
    expect(findClubLogoUrl("TSV Gibtesnicht")).toBeNull();
    expect(findClubLogoUrl("")).toBeNull();
    expect(findClubLogoUrl(null)).toBeNull();
    expect(findClubLogoUrl(undefined)).toBeNull();
  });
});

describe("clubInitials", () => {
  it("nimmt die Anfangsbuchstaben der ersten beiden Woerter", () => {
    expect(clubInitials("SG Gundelsheim")).toBe("SG");
    expect(clubInitials("TV Hardheim 1895")).toBe("TH");
    expect(clubInitials("HSG Staufer Bad Wimpfen/Biberach 2")).toBe("HS");
  });

  it("ueberspringt fuehrende Zahlen", () => {
    expect(clubInitials("1. FC Musterstadt")).toBe("FM");
  });

  it("liefert einen leeren String, wenn nichts uebrig bleibt", () => {
    expect(clubInitials("")).toBe("");
    expect(clubInitials(null)).toBe("");
    expect(clubInitials("2. 3.")).toBe("");
  });
});

describe("isOwnClub", () => {
  it("erkennt jede Lauda-Mannschaft", () => {
    expect(isOwnClub("ETSV Lauda")).toBe(true);
    expect(isOwnClub("ETSV Lauda 2")).toBe(true);
    expect(isOwnClub("etsv lauda handball")).toBe(true);
  });

  it("erkennt Gegner nicht als eigenen Verein", () => {
    expect(isOwnClub("TSV Crailsheim")).toBe(false);
    expect(isOwnClub(null)).toBe(false);
    expect(isOwnClub(undefined)).toBe(false);
  });
});
