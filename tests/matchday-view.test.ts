import { describe, expect, it } from "vitest";

import type { MatchdayPostGame } from "@/lib/matchday-posts/types";
import { type MatchdayPostSource, buildPostView } from "@/lib/matchday-posts/view-model";

/**
 * Die Farb-Alternanz ist Render-Logik, nicht Daten (Spec §5.2): Zeile 1 jeder
 * Tages-Gruppe ist weiss, danach wechselt es — und der Wechsel startet in
 * jeder Gruppe neu.
 */

function game(date: string, overrides: Partial<MatchdayPostGame> = {}): MatchdayPostGame {
  return {
    time: overrides.time ?? "16:00",
    date,
    homeTeam: overrides.homeTeam ?? "Männer",
    awayTeam: overrides.awayTeam ?? "TV Hardheim 1895",
    isOwnHome: overrides.isOwnHome ?? true,
    venue: null,
    league: null,
    sourceGameId: overrides.sourceGameId ?? null,
  };
}

function post(overrides: Partial<MatchdayPostSource> = {}): MatchdayPostSource {
  return { postType: "heim", variant: "standard", games: [], ...overrides };
}

describe("buildPostView — Tages-Gruppen", () => {
  it("gruppiert nach Wochentag und beschriftet versal", () => {
    const view = buildPostView(
      post({
        games: [
          game("2026-09-19T16:00:00+02:00"),
          game("2026-09-20T11:00:00+02:00"),
          game("2026-09-20T13:00:00+02:00"),
        ],
      }),
    );

    expect(view.groups.map((g) => g.label)).toEqual(["SAMSTAG", "SONNTAG"]);
    expect(view.groups[1].rows).toHaveLength(2);
  });

  it("sortiert die Zeilen nach Anwurfzeit aufsteigend", () => {
    const view = buildPostView(
      post({
        games: [
          game("2026-09-19T18:00:00+02:00", { time: "18:00" }),
          game("2026-09-19T10:00:00+02:00", { time: "10:00" }),
        ],
      }),
    );

    expect(view.groups[0].rows.map((r) => r.value)).toEqual(["10:00", "18:00"]);
  });

  it("startet die Farb-Alternanz in jeder Gruppe neu bei Weiss", () => {
    const view = buildPostView(
      post({
        games: [
          game("2026-09-19T16:00:00+02:00"),
          game("2026-09-20T11:00:00+02:00"),
          game("2026-09-20T13:00:00+02:00"),
        ],
      }),
    );

    expect(view.groups[0].rows.map((r) => r.color)).toEqual(["white"]);
    // Global durchlaufend waere die erste Sonntagszeile gelb — ist sie nicht.
    expect(view.groups[1].rows.map((r) => r.color)).toEqual(["white", "yellow"]);
  });

  it("alterniert ueber fuenf Zeilen weiss/gelb/weiss/gelb/weiss", () => {
    const view = buildPostView(
      post({
        games: [0, 1, 2, 3, 4].map((i) => game(`2026-09-19T1${i}:00:00+02:00`)),
      }),
    );

    expect(view.groups[0].rows.map((r) => r.color)).toEqual([
      "white",
      "yellow",
      "white",
      "yellow",
      "white",
    ]);
  });
});

describe("buildPostView — Zeileninhalt", () => {
  it("nennt im Heimspiel uns zuerst", () => {
    const [row] = buildPostView(post({ games: [game("2026-09-19T16:00:00+02:00")] })).groups[0]
      .rows;
    expect(row.team).toBe("MÄNNER");
    expect(row.opponent).toBe("TV HARDHEIM 1895");
  });

  it("nennt im Auswaertsspiel ebenfalls uns zuerst", () => {
    const view = buildPostView(
      post({
        postType: "auswaerts",
        games: [
          game("2026-09-19T16:00:00+02:00", {
            isOwnHome: false,
            homeTeam: "TSV 1863 Buchen",
            awayTeam: "Männer",
          }),
        ],
      }),
    );

    expect(view.groups[0].rows[0].team).toBe("MÄNNER");
    expect(view.groups[0].rows[0].opponent).toBe("TSV 1863 BUCHEN");
  });
});

describe("buildPostView — Badge", () => {
  it("leitet den Badge-Text aus Art und Anzahl ab", () => {
    expect(buildPostView(post({ games: [game("2026-09-19T16:00:00+02:00")] })).badge).toBe(
      "HEIMSPIEL",
    );
    expect(
      buildPostView(
        post({
          games: [game("2026-09-19T16:00:00+02:00"), game("2026-09-19T18:00:00+02:00")],
        }),
      ).badge,
    ).toBe("HEIMSPIELE");
    expect(buildPostView(post({ postType: "auswaerts" })).badge).toBe("AUSWÄRTSSPIEL");
  });

  it("laesst sich von der Redaktion ueberschreiben", () => {
    expect(buildPostView(post({ badgeText: "Ergebnisse" })).badge).toBe("ERGEBNISSE");
  });
});

describe("buildPostView — gemischter Post", () => {
  it("gruppiert nach Heim und Auswaerts statt nach Tag", () => {
    const view = buildPostView(
      post({
        postType: "gemischt",
        games: [
          game("2026-09-19T16:00:00+02:00"),
          game("2026-09-19T18:00:00+02:00", {
            isOwnHome: false,
            homeTeam: "TSV 1863 Buchen",
            awayTeam: "Männer",
          }),
        ],
      }),
    );

    expect(view.groups.map((g) => g.label)).toEqual(["HEIM", "AUSWÄRTS"]);
    expect(view.groups[0].rows[0].color).toBe("white");
    expect(view.groups[1].rows[0].color).toBe("white");
  });
});

describe("buildPostView — Bild-Overlay", () => {
  it("nimmt Uhrzeit und Zeile aus dem ersten Spiel", () => {
    const view = buildPostView(
      post({
        variant: "bildOverlay",
        overlayImageUrl: "/media/team.jpg",
        games: [game("2026-09-19T18:30:00+02:00", { time: "18:30", awayTeam: "SG Heuchelberg 3" })],
      }),
    );

    expect(view.groups).toHaveLength(0);
    expect(view.overlay).toEqual({
      imageUrl: "/media/team.jpg",
      alt: "",
      time: "18:30",
      line: "MÄNNER VS SG HEUCHELBERG 3",
    });
  });

  it("laesst die Zeile ueberschreiben", () => {
    const view = buildPostView(
      post({
        variant: "bildOverlay",
        overlayTitle: "Herren vs SG Heuchelberg 3",
        games: [game("2026-09-19T18:30:00+02:00", { time: "18:30" })],
      }),
    );

    expect(view.overlay?.line).toBe("HERREN VS SG HEUCHELBERG 3");
  });
});

describe("buildPostView — Randfaelle", () => {
  it("kommt mit einem leeren Dokument klar", () => {
    const view = buildPostView({ postType: "heim" });
    expect(view.groups).toEqual([]);
    expect(view.overlay).toBeNull();
  });
});
