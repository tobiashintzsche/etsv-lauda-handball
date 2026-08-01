import { describe, expect, it } from "vitest";

import { matchdayKey } from "@/lib/matchday-posts/datetime";
import {
  buildCaption,
  buildSourceKey,
  buildTitle,
  clusterFixtures,
  fitsOnScreen,
  generateDrafts,
  splitIntoScreens,
  splitMatchday,
} from "@/lib/matchday-posts/generate";
import type { SourceFixture } from "@/lib/matchday-posts/types";

/**
 * Der Generator ist die einzige Stelle, die entscheidet, welche Posts es gibt.
 * Alle Zeiten hier sind Berliner Ortszeit mit explizitem Offset — genau so
 * kommen sie aus handball.net und aus der games-Collection.
 */

let counter = 0;

function fixture(kickoff: string, options: Partial<SourceFixture> = {}): SourceFixture {
  counter += 1;
  return {
    sourceGameId: options.sourceGameId ?? `g${counter}`,
    kickoff,
    homeTeam: options.homeTeam ?? "Männer",
    awayTeam: options.awayTeam ?? "TV Hardheim 1895",
    isOwnHome: options.isOwnHome ?? true,
    venue: options.venue ?? null,
    league: options.league ?? null,
  };
}

/** Auswaertsspiel: wir stehen rechts. */
function away(kickoff: string, options: Partial<SourceFixture> = {}): SourceFixture {
  return fixture(kickoff, {
    isOwnHome: false,
    homeTeam: "TSV 1863 Buchen",
    awayTeam: "Männer",
    ...options,
  });
}

const FRIDAY = "2026-09-18T19:30:00+02:00";
const SATURDAY = "2026-09-19T16:00:00+02:00";
const SATURDAY_LATE = "2026-09-19T19:30:00+02:00";
const SUNDAY = "2026-09-20T11:00:00+02:00";
const WEDNESDAY = "2026-09-23T19:30:00+02:00";
const NEXT_SATURDAY = "2026-09-26T16:00:00+02:00";

describe("matchdayKey", () => {
  it("faltet Freitag bis Sonntag auf denselben Spieltag", () => {
    expect(matchdayKey(FRIDAY)).toBe("2026-09-18");
    expect(matchdayKey(SATURDAY)).toBe("2026-09-18");
    expect(matchdayKey(SUNDAY)).toBe("2026-09-18");
  });

  it("laesst Wochentage fuer sich stehen", () => {
    expect(matchdayKey(WEDNESDAY)).toBe("2026-09-23");
  });

  it("rechnet in Berliner Zeit, nicht in UTC", () => {
    // 00:30 Ortszeit am Samstag ist in UTC noch Freitag 22:30 — trotzdem
    // gehoert das Spiel zum Samstag und damit zu diesem Wochenende.
    expect(matchdayKey("2026-09-19T00:30:00+02:00")).toBe("2026-09-18");
  });
});

describe("clusterFixtures", () => {
  it("gruppiert nach Spieltag und sortiert chronologisch", () => {
    const clusters = clusterFixtures([
      fixture(NEXT_SATURDAY),
      fixture(SUNDAY),
      fixture(WEDNESDAY),
      fixture(SATURDAY),
    ]);

    expect(clusters.map((c) => c.key)).toEqual(["2026-09-18", "2026-09-23", "2026-09-25"]);
    expect(clusters[0].fixtures.map((f) => f.kickoff)).toEqual([SATURDAY, SUNDAY]);
  });

  it("sortiert innerhalb eines Spieltags nach Anwurfzeit aufsteigend", () => {
    const [cluster] = clusterFixtures([
      fixture(SATURDAY_LATE),
      fixture(SUNDAY),
      fixture(SATURDAY),
      fixture(FRIDAY),
    ]);

    expect(cluster.fixtures.map((f) => f.kickoff)).toEqual([
      FRIDAY,
      SATURDAY,
      SATURDAY_LATE,
      SUNDAY,
    ]);
  });
});

describe("Zeilen-Maxima", () => {
  it("laesst fuenf Zeilen bei einer Tages-Gruppe zu, sechs nicht", () => {
    const five = [0, 1, 2, 3, 4].map((i) => fixture(`2026-09-19T1${i}:00:00+02:00`));
    expect(fitsOnScreen("heim", five)).toBe(true);
    expect(fitsOnScreen("heim", [...five, fixture("2026-09-19T18:00:00+02:00")])).toBe(false);
  });

  it("laesst bei zwei Tages-Gruppen nur vier Zeilen zu", () => {
    const four = [
      fixture(SATURDAY),
      fixture(SATURDAY_LATE),
      fixture(SUNDAY),
      fixture("2026-09-20T14:00:00+02:00"),
    ];
    expect(fitsOnScreen("heim", four)).toBe(true);
    expect(fitsOnScreen("heim", [...four, fixture("2026-09-20T16:00:00+02:00")])).toBe(false);
  });
});

describe("splitIntoScreens", () => {
  it("teilt sechs Spiele eines Tages in 5 + 1", () => {
    const six = [0, 1, 2, 3, 4, 5].map((i) => fixture(`2026-09-19T1${i}:00:00+02:00`));
    const screens = splitIntoScreens("heim", six);
    expect(screens.map((s) => s.length)).toEqual([5, 1]);
  });

  it("beruecksichtigt beim Teilen die Anzahl der Tages-Gruppen", () => {
    // Sobald der zweite Tag dazukommt, sind nur noch vier Zeilen erlaubt.
    const games = [
      fixture("2026-09-19T10:00:00+02:00"),
      fixture("2026-09-19T12:00:00+02:00"),
      fixture("2026-09-19T14:00:00+02:00"),
      fixture("2026-09-20T10:00:00+02:00"),
      fixture("2026-09-20T12:00:00+02:00"),
    ];
    expect(splitIntoScreens("heim", games).map((s) => s.length)).toEqual([4, 1]);
  });

  it("teilt in Anwurfreihenfolge", () => {
    const six = [5, 4, 3, 2, 1, 0].map((i) => fixture(`2026-09-19T1${i}:00:00+02:00`));
    const [first] = splitIntoScreens("heim", six);
    expect(first[0].kickoff).toBe("2026-09-19T10:00:00+02:00");
  });
});

describe("splitMatchday", () => {
  it("trennt Heim und Auswaerts in zwei Posts", () => {
    const games = [
      fixture("2026-09-19T10:00:00+02:00"),
      fixture("2026-09-19T12:00:00+02:00"),
      away("2026-09-19T14:00:00+02:00"),
      fixture("2026-09-19T16:00:00+02:00"),
      away("2026-09-19T18:00:00+02:00"),
    ];

    const posts = splitMatchday(games);
    expect(posts.map((p) => p.postType)).toEqual(["heim", "auswaerts"]);
    expect(posts[0].fixtures).toHaveLength(3);
    expect(posts[1].fixtures).toHaveLength(2);
  });

  it("fasst zu einem gemischten Post zusammen, wenn alles auf einen Screen passt", () => {
    const games = [
      fixture("2026-09-19T10:00:00+02:00"),
      away("2026-09-19T12:00:00+02:00"),
      fixture("2026-09-20T14:00:00+02:00"),
      away("2026-09-20T16:00:00+02:00"),
    ];

    const posts = splitMatchday(games);
    expect(posts).toHaveLength(1);
    expect(posts[0].postType).toBe("gemischt");
    expect(posts[0].fixtures).toHaveLength(4);
  });

  it("trennt wieder, sobald die Ein-Screen-Ausnahme kippt", () => {
    const games = [
      fixture("2026-09-19T10:00:00+02:00"),
      away("2026-09-19T12:00:00+02:00"),
      fixture("2026-09-19T14:00:00+02:00"),
      away("2026-09-19T16:00:00+02:00"),
      fixture("2026-09-19T18:00:00+02:00"),
    ];

    expect(splitMatchday(games).map((p) => p.postType)).toEqual(["heim", "auswaerts"]);
  });

  it("erzeugt keinen gemischten Post, wenn es nur eine Sorte gibt", () => {
    const posts = splitMatchday([fixture(SATURDAY), fixture(SUNDAY)]);
    expect(posts).toHaveLength(1);
    expect(posts[0].postType).toBe("heim");
  });
});

describe("buildSourceKey", () => {
  it("ist unabhaengig von der Reihenfolge der Spiele", () => {
    const a = buildSourceKey("heim", "2026-09-18", ["g2", "g1", "g3"]);
    const b = buildSourceKey("heim", "2026-09-18", ["g1", "g3", "g2"]);
    expect(a).toBe(b);
  });

  it("unterscheidet Post-Art, Spieltag und Spielauswahl", () => {
    const base = buildSourceKey("heim", "2026-09-18", ["g1"]);
    expect(buildSourceKey("auswaerts", "2026-09-18", ["g1"])).not.toBe(base);
    expect(buildSourceKey("heim", "2026-09-25", ["g1"])).not.toBe(base);
    expect(buildSourceKey("heim", "2026-09-18", ["g1", "g2"])).not.toBe(base);
  });

  it("bleibt ueber Laeufe hinweg stabil", () => {
    expect(buildSourceKey("heim", "2026-09-18", ["game:16"])).toBe(
      buildSourceKey("heim", "2026-09-18", ["game:16"]),
    );
  });
});

describe("Titel und Caption", () => {
  it("benennt einen Ein-Spiel-Post im Singular", () => {
    expect(buildTitle("heim", [fixture(SATURDAY)])).toBe("Heimspiel · Sa, 19.09.2026");
  });

  it("nennt bei mehreren Tagen Anfang und Ende", () => {
    expect(buildTitle("auswaerts", [away(SATURDAY), away(SUNDAY)])).toBe(
      "Auswärtsspiele · Sa, 19.09.2026 – So, 20.09.2026",
    );
  });

  it("listet die Spiele in der Caption mit Uhrzeit und Gegner", () => {
    const caption = buildCaption("heim", [fixture(SATURDAY), fixture(SATURDAY_LATE)]);
    expect(caption).toContain("Unsere Heimspiele am Samstag, 19.09.2026");
    expect(caption).toContain("• 16:00 Uhr · Männer vs. TV Hardheim 1895");
    expect(caption).toContain("#etsvlauda");
  });

  it("nennt uns auch im Auswaertsspiel zuerst", () => {
    expect(buildCaption("auswaerts", [away(SATURDAY)])).toContain(
      "• 16:00 Uhr · Männer vs. TSV 1863 Buchen",
    );
  });
});

describe("generateDrafts", () => {
  it("erzeugt pro Spieltag die erwarteten Vorschlaege", () => {
    const drafts = generateDrafts([
      fixture(SATURDAY, { sourceGameId: "game:1" }),
      away(NEXT_SATURDAY, { sourceGameId: "game:2" }),
    ]);

    expect(drafts).toHaveLength(2);
    expect(drafts[0].postType).toBe("heim");
    expect(drafts[0].games).toHaveLength(1);
    expect(drafts[0].games[0].time).toBe("16:00");
    expect(drafts[0].dateFrom).toBe(SATURDAY);
    expect(drafts[1].postType).toBe("auswaerts");
  });

  it("ist deterministisch — zweiter Lauf, gleiche Schluessel", () => {
    const input = [
      fixture(SATURDAY, { sourceGameId: "game:1" }),
      away(SUNDAY, { sourceGameId: "game:2" }),
      fixture(WEDNESDAY, { sourceGameId: "game:3" }),
    ];

    const first = generateDrafts(input).map((d) => d.sourceKey);
    const second = generateDrafts([...input].reverse()).map((d) => d.sourceKey);
    expect(second).toEqual(first);
  });

  it("uebernimmt die Anwurfzeit als rechte Spalte", () => {
    const [draft] = generateDrafts([fixture("2026-09-19T09:30:00+02:00")]);
    expect(draft.games[0].time).toBe("09:30");
  });
});
