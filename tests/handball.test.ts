import { beforeEach, describe, expect, it, vi } from "vitest";

import { findFixtureTable } from "@/lib/handball/fixtures";
import { resolveLogoUrl } from "@/lib/handball/logo";
import { getLeagueTable } from "@/lib/handball/table";
import type { HandballTableRow } from "@/lib/handball/types";
import { handballScheduleUrl, handballTableUrl } from "@/lib/handball/urls";

/**
 * Der Netzwerk-Client wird gemockt — die Tests pruefen die Aufbereitung, nicht
 * handball.net. Die Alias-Schreibweise loest auf dieselbe Datei auf wie das
 * relative `./client` in `table.ts`.
 */
vi.mock("@/lib/handball/client", () => ({
  getTable: vi.fn(),
  getTeamTable: vi.fn(),
  getTeamSchedule: vi.fn(),
}));

const { getTable, getTeamTable } = await import("@/lib/handball/client");
const getTableMock = vi.mocked(getTable);
const getTeamTableMock = vi.mocked(getTeamTable);

/** Echte Antwortform der API — `points` ist ein STRING ("30:2"), keine Zahl. */
function apiRow(overrides: Partial<HandballTableRow> = {}): HandballTableRow {
  return {
    rank: 1,
    team: {
      id: "handball4all.baden-wuerttemberg.1326126",
      name: "ETSV Lauda",
      logo: "handball-net:files/migration/V20210907/H4A_26005_Baden_Lauda.svg",
    },
    points: "30:2",
    games: 16,
    wins: 15,
    draws: 0,
    losses: 1,
    goals: 486,
    goalsAgainst: 354,
    goalDifference: 132,
    ...overrides,
  };
}

beforeEach(() => {
  getTableMock.mockReset();
  getTeamTableMock.mockReset();
  getTableMock.mockResolvedValue(null);
  getTeamTableMock.mockResolvedValue(null);
});

describe("resolveLogoUrl", () => {
  it("turns the handball-net pseudo URI into an absolute URL", () => {
    expect(resolveLogoUrl("handball-net:files/migration/x.svg")).toBe(
      "https://www.handball.net/files/migration/x.svg",
    );
  });

  it("appends the upstream resize parameter when a width is given", () => {
    expect(resolveLogoUrl("handball-net:files/x.svg", 48)).toBe(
      "https://www.handball.net/files/x.svg?d=48x",
    );
  });

  it("passes absolute URLs through", () => {
    expect(resolveLogoUrl("https://cdn.example.com/logo.png")).toBe(
      "https://cdn.example.com/logo.png",
    );
  });

  it("returns null for missing or empty logos", () => {
    expect(resolveLogoUrl(null)).toBeNull();
    expect(resolveLogoUrl(undefined)).toBeNull();
    expect(resolveLogoUrl("")).toBeNull();
    expect(resolveLogoUrl("handball-net:")).toBeNull();
  });
});

describe("handballTableUrl / handballScheduleUrl", () => {
  it("prefers the team page", () => {
    expect(handballTableUrl("team-1", "turnier-1", "verein-1")).toBe(
      "https://www.handball.net/mannschaften/team-1/tabelle",
    );
    expect(handballScheduleUrl("team-1", "verein-1")).toBe(
      "https://www.handball.net/mannschaften/team-1/spielplan",
    );
  });

  it("falls back to league, then club, then the home page", () => {
    expect(handballTableUrl(null, "turnier-1", "verein-1")).toBe(
      "https://www.handball.net/ligen/turnier-1/tabelle",
    );
    expect(handballTableUrl(null, null, "verein-1")).toBe(
      "https://www.handball.net/vereine/verein-1",
    );
    expect(handballTableUrl()).toBe("https://www.handball.net");
    expect(handballScheduleUrl(null, "verein-1")).toBe("https://www.handball.net/vereine/verein-1");
    expect(handballScheduleUrl()).toBe("https://www.handball.net");
  });
});

describe("findFixtureTable", () => {
  it("resolves a 2025/26 tournament id", () => {
    const table = findFixtureTable("handball4all.baden-wuerttemberg.m-2bk-1-nf_nf");
    expect(table?.season).toBe("2025/26");
    expect(table?.rows.length).toBeGreaterThan(0);
  });

  it("resolves the successor id of the 2026/27 season through the aliases", () => {
    const table = findFixtureTable("handball4all.baden-wuerttemberg.m-bk-1-nf_nf");
    expect(table?.tournamentId).toBe("handball4all.baden-wuerttemberg.m-2bk-1-nf_nf");
  });

  it("tries the ids in order and skips empty ones", () => {
    const table = findFixtureTable(null, undefined, "handball4all.baden-wuerttemberg.1326126");
    expect(table?.season).toBe("2025/26");
  });

  it("returns null for unknown ids", () => {
    expect(findFixtureTable("gibt-es-nicht")).toBeNull();
    expect(findFixtureTable()).toBeNull();
    expect(findFixtureTable(null, undefined, "")).toBeNull();
  });

  it("keeps `points` as a string in every archived row", () => {
    const table = findFixtureTable("handball4all.baden-wuerttemberg.m-2bk-1-nf_nf");
    for (const row of table!.rows) {
      expect(typeof row.points).toBe("string");
      expect(row.points).toMatch(/^\d+:\d+$/);
    }
  });
});

describe("getLeagueTable", () => {
  it("maps a live table and keeps the points string untouched", async () => {
    getTableMock.mockResolvedValue({
      rows: [apiRow(), apiRow({ rank: 2, team: { id: "t2", name: "SG Degmarn-Oedheim 2" } })],
      tournamentName: "Neckar-Franken - Männer Bezirksklasse Gruppe 1",
    });

    const table = await getLeagueTable({ tournamentId: "turnier-1" });

    expect(table.source).toBe("live");
    expect(table.label).toBeNull();
    expect(table.tournamentName).toBe("Neckar-Franken - Männer Bezirksklasse Gruppe 1");
    expect(table.rows).toHaveLength(2);

    expect(table.rows[0]).toMatchObject({
      rank: 1,
      teamName: "ETSV Lauda",
      points: "30:2",
      goals: "486:354",
      games: 16,
      isOwnClub: true,
    });
    expect(table.rows[0]!.logoUrl).toBe(
      "https://www.handball.net/files/migration/V20210907/H4A_26005_Baden_Lauda.svg?d=48x",
    );
    expect(table.rows[1]!.isOwnClub).toBe(false);
    // Ohne Logo in der Antwort greift die statische Vereins-Map.
    expect(table.rows[1]!.logoUrl).toBe(
      "https://www.handball.net/files/clubs/logos/b70b524b-884b-41d6-872f-82c535d0a1ab.png?d=48x",
    );
  });

  it("asks the team endpoint when the tournament has no rows", async () => {
    getTableMock.mockResolvedValue({ rows: [], tournamentName: null });
    getTeamTableMock.mockResolvedValue({ rows: [apiRow()], tournamentName: "Bezirksklasse" });

    const table = await getLeagueTable({ tournamentId: "turnier-1", teamId: "team-1" });

    expect(getTableMock).toHaveBeenCalledWith("turnier-1");
    expect(getTeamTableMock).toHaveBeenCalledWith("team-1");
    expect(table.source).toBe("live");
    expect(table.rows).toHaveLength(1);
  });

  it("falls back to the archived table when the new season is still empty", async () => {
    const table = await getLeagueTable({
      tournamentId: "handball4all.baden-wuerttemberg.m-bk-1-nf_nf",
    });

    expect(table.source).toBe("fixture");
    expect(table.label).toBe("Abschlusstabelle 2025/26");
    expect(table.rows.length).toBeGreaterThan(0);
    expect(table.rows[0]!.points).toMatch(/^\d+:\d+$/);
    expect(table.rows[0]!.goals).toMatch(/^\d+:\d+$/);
    expect(table.rows.some((row) => row.isOwnClub)).toBe(true);
  });

  it("returns the empty state instead of throwing when nothing matches", async () => {
    const table = await getLeagueTable({ tournamentId: "unbekannt", teamId: "auch-nicht" });

    expect(table).toEqual({ source: "empty", rows: [], tournamentName: null, label: null });
  });

  it("survives a completely absent query", async () => {
    const table = await getLeagueTable({});
    expect(table.source).toBe("empty");
    expect(getTableMock).not.toHaveBeenCalled();
    expect(getTeamTableMock).not.toHaveBeenCalled();
  });

  it("tolerates rows without a team object", async () => {
    getTableMock.mockResolvedValue({
      rows: [apiRow({ team: undefined as unknown as HandballTableRow["team"] })],
      tournamentName: null,
    });

    const table = await getLeagueTable({ tournamentId: "turnier-1" });
    expect(table.rows[0]).toMatchObject({ teamName: "", isOwnClub: false, logoUrl: null });
  });
});
