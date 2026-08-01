import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Game } from "@payload-types";

import { getTeamFixtures } from "@/lib/handball/schedule";
import type { HandballGameSummary } from "@/lib/handball/types";

/**
 * Geprueft wird die Kaskade live-API → games-Collection → Empty-State, nicht
 * handball.net und nicht Payload: beide Quellen sind gemockt.
 */
vi.mock("@/lib/handball/client", () => ({
  getTable: vi.fn(),
  getTeamTable: vi.fn(),
  getTeamSchedule: vi.fn(),
}));

vi.mock("@/lib/games", () => ({
  getRecentGames: vi.fn(),
  getNextGames: vi.fn(),
}));

const { getTeamSchedule } = await import("@/lib/handball/client");
const { getNextGames, getRecentGames } = await import("@/lib/games");

const scheduleMock = vi.mocked(getTeamSchedule);
const recentMock = vi.mocked(getRecentGames);
const nextMock = vi.mocked(getNextGames);

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const QUERY = {
  teamId: 7,
  handballTeamId: "handball4all.baden-wuerttemberg.1451711",
  league: "Bezirksklasse Gruppe 1",
  clubName: "ETSV Lauda Handball",
};

/** Antwortform von `/teams/{id}/schedule` — `startsAt` ist Unix-ms. */
function apiGame(overrides: Partial<HandballGameSummary> = {}): HandballGameSummary {
  return {
    id: "handball4all.baden-wuerttemberg.8587341",
    tournament: { id: "t", name: "Neckar-Franken - Männer Bezirksklasse Gruppe 1" },
    homeTeam: {
      id: "home",
      name: "ETSV Lauda",
      logo: "handball-net:files/migration/V20210907/H4A_26005_Baden_Lauda.svg",
    },
    awayTeam: { id: "away", name: "TSV Crailsheim", logo: null },
    startsAt: Date.now() + DAY,
    state: "Pre",
    homeGoals: null,
    awayGoals: null,
    ...overrides,
  };
}

function storedGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 1,
    team: 7,
    homeAway: "home",
    opponent: "SG Gundelsheim",
    opponentLogo: null,
    date: new Date(Date.now() + DAY).toISOString(),
    venue: "Sporthalle Lauda",
    updatedAt: "",
    createdAt: "",
    ...overrides,
  } as Game;
}

beforeEach(() => {
  scheduleMock.mockReset();
  recentMock.mockReset();
  nextMock.mockReset();
  scheduleMock.mockResolvedValue([]);
  recentMock.mockResolvedValue([]);
  nextMock.mockResolvedValue({ home: [], away: [] });
});

describe("getTeamFixtures — Stufe 1: live", () => {
  it("nimmt den Spielplan der API und teilt ihn nach Anwurf auf", async () => {
    scheduleMock.mockResolvedValue([
      apiGame({ id: "kommend", startsAt: Date.now() + 2 * DAY }),
      apiGame({
        id: "gespielt",
        startsAt: Date.now() - 2 * DAY,
        state: "Post",
        homeGoals: 28,
        awayGoals: 16,
      }),
      apiGame({ id: "naechstes", startsAt: Date.now() + DAY }),
    ]);

    const schedule = await getTeamFixtures(QUERY);

    expect(scheduleMock).toHaveBeenCalledWith(QUERY.handballTeamId, undefined);
    expect(schedule.source).toBe("live");
    expect(schedule.recent.map((f) => f.id)).toEqual(["gespielt"]);
    expect(schedule.upcoming.map((f) => f.id)).toEqual(["naechstes", "kommend"]);
    expect(recentMock).not.toHaveBeenCalled();
  });

  it("loest das Wappen aus der Antwort auf und faellt sonst auf die Map zurueck", async () => {
    scheduleMock.mockResolvedValue([apiGame()]);

    const [fixture] = (await getTeamFixtures(QUERY)).upcoming;

    expect(fixture!.home.logoUrl).toBe(
      "https://www.handball.net/files/migration/V20210907/H4A_26005_Baden_Lauda.svg?d=48x",
    );
    expect(fixture!.home.isOwnClub).toBe(true);
    // Kein Logo in der Antwort — die statische Gegner-Map springt ein.
    expect(fixture!.away.logoUrl).toBe(
      "https://www.handball.net/files/clubs/logos/99f86e6e-a337-4b41-8023-9fc8d6ceb6d0.png?d=48x",
    );
    expect(fixture!.away.isOwnClub).toBe(false);
  });

  it("zeigt ein Ergebnis erst, wenn das Spiel offiziell beendet ist", async () => {
    scheduleMock.mockResolvedValue([
      apiGame({ startsAt: Date.now() - HOUR, state: "Live", homeGoals: 12, awayGoals: 9 }),
    ]);

    const [fixture] = (await getTeamFixtures(QUERY)).recent;
    expect(fixture!.homeGoals).toBeNull();
    expect(fixture!.awayGoals).toBeNull();
  });

  it("uebergibt eine Phase-ID als tournamentSeason", async () => {
    scheduleMock.mockResolvedValue([apiGame()]);
    await getTeamFixtures({ ...QUERY, tournamentSeason: "handball4all.baden-wuerttemberg.145711" });
    expect(scheduleMock).toHaveBeenCalledWith(
      QUERY.handballTeamId,
      "handball4all.baden-wuerttemberg.145711",
    );
  });

  it("ueberspringt Spiele ohne brauchbaren Anwurf", async () => {
    scheduleMock.mockResolvedValue([apiGame({ startsAt: NaN })]);
    recentMock.mockResolvedValue([storedGame()]);

    const schedule = await getTeamFixtures(QUERY);
    expect(schedule.source).toBe("collection");
  });
});

describe("getTeamFixtures — Stufe 2: games-Collection", () => {
  it("greift, solange die API nichts liefert", async () => {
    recentMock.mockResolvedValue([
      storedGame({
        id: 2,
        date: new Date(Date.now() - DAY).toISOString(),
        result: { scoreFor: 31, scoreAgainst: 24 },
      }),
    ]);
    nextMock.mockResolvedValue({ home: [storedGame()], away: [] });

    const schedule = await getTeamFixtures(QUERY);

    expect(schedule.source).toBe("collection");
    expect(schedule.recent).toHaveLength(1);
    expect(schedule.upcoming).toHaveLength(1);
    expect(schedule.recent[0]).toMatchObject({ homeGoals: 31, awayGoals: 24 });
    expect(schedule.upcoming[0]!.league).toBe("Bezirksklasse Gruppe 1");
  });

  it("dreht Heim und Auswaerts samt Ergebnis", async () => {
    nextMock.mockResolvedValue({
      home: [],
      away: [storedGame({ homeAway: "away", result: { scoreFor: 20, scoreAgainst: 25 } })],
    });

    const [fixture] = (await getTeamFixtures(QUERY)).upcoming;

    expect(fixture!.home.name).toBe("SG Gundelsheim");
    expect(fixture!.away.name).toBe("ETSV Lauda Handball");
    expect(fixture!.away.isOwnClub).toBe(true);
    expect(fixture!.homeGoals).toBe(25);
    expect(fixture!.awayGoals).toBe(20);
  });

  it("zieht das Gegner-Wappen aus der statischen Map", async () => {
    nextMock.mockResolvedValue({ home: [storedGame()], away: [] });

    const [fixture] = (await getTeamFixtures(QUERY)).upcoming;
    expect(fixture!.away.logoUrl).toMatch(/^https:\/\/www\.handball\.net\/.+\?d=48x$/);
  });

  it("nimmt ein hochgeladenes Gegner-Logo vor der Map", async () => {
    nextMock.mockResolvedValue({
      home: [
        storedGame({ opponentLogo: { id: 1, url: "/media/gegner.png" } as Game["opponentLogo"] }),
      ],
      away: [],
    });

    const [fixture] = (await getTeamFixtures(QUERY)).upcoming;
    expect(fixture!.away.logoUrl).toBe("/media/gegner.png");
  });

  it("nutzt das mitgelieferte Vereinswappen, wenn die Einstellungen keines haben", async () => {
    nextMock.mockResolvedValue({ home: [storedGame()], away: [] });

    const withoutSetting = (await getTeamFixtures(QUERY)).upcoming[0];
    expect(withoutSetting!.home.logoUrl).toBe("/brand/club-crest-etsv-lauda-2.png");

    const withSetting = (await getTeamFixtures({ ...QUERY, clubLogoUrl: "/media/wappen.png" }))
      .upcoming[0];
    expect(withSetting!.home.logoUrl).toBe("/media/wappen.png");
  });

  it("springt direkt hierher, wenn die Mannschaft keine handball.net-ID hat", async () => {
    nextMock.mockResolvedValue({ home: [storedGame()], away: [] });

    const schedule = await getTeamFixtures({ ...QUERY, handballTeamId: null });

    expect(scheduleMock).not.toHaveBeenCalled();
    expect(schedule.source).toBe("collection");
  });
});

describe("getTeamFixtures — Stufe 3: leer", () => {
  it("liefert den Empty-State statt zu werfen", async () => {
    const schedule = await getTeamFixtures(QUERY);
    expect(schedule).toEqual({ source: "empty", recent: [], upcoming: [] });
  });
});
