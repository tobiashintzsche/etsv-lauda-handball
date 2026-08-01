import type { Payload } from "payload";

import type { TeamMap } from "./content-teams";
import { log } from "./log";
import { Tally, WRITE_OPTS, findFirst } from "./payload-helpers";

/**
 * The fixture list.
 *
 * `PAST_GAMES` are the real 2025/26 championship games of the men's team,
 * taken from the handball.net export (handball-data.json). Kick-off times are
 * the UTC timestamps the API returns. The 16th game of that season — a walkover
 * scored 0:0 without a real throw-off — is deliberately left out.
 *
 * `UPCOMING_GAMES` are invented fixtures for the 2026/27 season. Opponents are
 * real clubs from the region, dates and times are plausible but not official.
 */

const HOME_VENUE = "Sporthalle Lauda";

type GameSeed = {
  team: string;
  opponent: string;
  date: string;
  homeAway: "home" | "away";
  venue: string;
  result?: { scoreFor: number; scoreAgainst: number };
};

export const PAST_GAMES: GameSeed[] = [
  {
    team: "maenner",
    opponent: "SG Gundelsheim",
    date: "2025-11-01T17:30:00.000Z",
    homeAway: "home",
    venue: HOME_VENUE,
    result: { scoreFor: 28, scoreAgainst: 16 },
  },
  {
    team: "maenner",
    opponent: "HSG Staufer Bad Wimpfen/Biberach 2",
    date: "2025-11-15T17:30:00.000Z",
    homeAway: "home",
    venue: HOME_VENUE,
    result: { scoreFor: 33, scoreAgainst: 25 },
  },
  {
    team: "maenner",
    opponent: "SG Degmarn-Oedheim 2",
    date: "2025-11-23T12:30:00.000Z",
    homeAway: "away",
    venue: "Sporthalle Oedheim",
    result: { scoreFor: 24, scoreAgainst: 25 },
  },
  {
    team: "maenner",
    opponent: "SG Heuchelberg 3",
    date: "2025-12-07T14:15:00.000Z",
    homeAway: "away",
    venue: "Sporthalle Nordheim",
    result: { scoreFor: 30, scoreAgainst: 21 },
  },
  {
    team: "maenner",
    opponent: "HSG Hohenlohe 3",
    date: "2025-12-13T17:30:00.000Z",
    homeAway: "home",
    venue: HOME_VENUE,
    result: { scoreFor: 37, scoreAgainst: 26 },
  },
  {
    team: "maenner",
    opponent: "TSV Crailsheim",
    date: "2026-01-17T17:30:00.000Z",
    homeAway: "home",
    venue: HOME_VENUE,
    result: { scoreFor: 39, scoreAgainst: 32 },
  },
  {
    team: "maenner",
    opponent: "SG Bad Mergentheim",
    date: "2026-01-31T17:30:00.000Z",
    homeAway: "home",
    venue: HOME_VENUE,
    result: { scoreFor: 35, scoreAgainst: 17 },
  },
  {
    team: "maenner",
    opponent: "SG Gundelsheim",
    date: "2026-02-08T16:00:00.000Z",
    homeAway: "away",
    venue: "Sporthalle Gundelsheim",
    result: { scoreFor: 32, scoreAgainst: 25 },
  },
  {
    team: "maenner",
    opponent: "SG Bad Mergentheim",
    date: "2026-03-08T16:30:00.000Z",
    homeAway: "away",
    venue: "Sporthalle Kopernikus-Realschule, Bad Mergentheim",
    result: { scoreFor: 35, scoreAgainst: 23 },
  },
  {
    team: "maenner",
    opponent: "HSG Staufer Bad Wimpfen/Biberach 2",
    date: "2026-03-14T16:00:00.000Z",
    homeAway: "away",
    venue: "Stauferhalle Bad Wimpfen",
    result: { scoreFor: 29, scoreAgainst: 23 },
  },
  {
    team: "maenner",
    opponent: "SG Degmarn-Oedheim 2",
    date: "2026-03-21T17:30:00.000Z",
    homeAway: "home",
    venue: HOME_VENUE,
    result: { scoreFor: 35, scoreAgainst: 27 },
  },
  {
    team: "maenner",
    opponent: "HSG Kochertürn/Stein 2",
    date: "2026-03-29T14:00:00.000Z",
    homeAway: "away",
    venue: "Helmbundhalle 1, Neuenstadt",
    result: { scoreFor: 29, scoreAgainst: 24 },
  },
  {
    team: "maenner",
    opponent: "SG Heuchelberg 3",
    date: "2026-04-11T16:30:00.000Z",
    homeAway: "home",
    venue: HOME_VENUE,
    result: { scoreFor: 29, scoreAgainst: 14 },
  },
  {
    team: "maenner",
    opponent: "HSG Hohenlohe 3",
    date: "2026-04-18T12:00:00.000Z",
    homeAway: "away",
    venue: "Creutzfelder Sporthalle, Pfedelbach",
    result: { scoreFor: 35, scoreAgainst: 28 },
  },
  {
    team: "maenner",
    opponent: "TSV Crailsheim",
    date: "2026-04-26T15:00:00.000Z",
    homeAway: "away",
    venue: "Karlsberg-Sporthalle Crailsheim",
    result: { scoreFor: 36, scoreAgainst: 28 },
  },
];

export const UPCOMING_GAMES: GameSeed[] = [
  {
    team: "maenner",
    opponent: "TV Hardheim 1895",
    date: "2026-09-19T19:30:00+02:00",
    homeAway: "home",
    venue: HOME_VENUE,
  },
  {
    team: "maenner",
    opponent: "TSV 1863 Buchen",
    date: "2026-09-27T17:00:00+02:00",
    homeAway: "away",
    venue: "Sporthalle Buchen",
  },
  {
    team: "maennl-b-jugend",
    opponent: "JSG Tauberfranken",
    date: "2026-10-03T16:00:00+02:00",
    homeAway: "home",
    venue: HOME_VENUE,
  },
  {
    team: "weibl-a-jugend",
    opponent: "HB Ludwigsburg",
    date: "2026-10-10T18:00:00+02:00",
    homeAway: "away",
    venue: "Sporthalle Ludwigsburg",
  },
  {
    team: "maenner",
    opponent: "SpG Walldürn",
    date: "2026-10-17T19:30:00+02:00",
    homeAway: "home",
    venue: HOME_VENUE,
  },
  {
    team: "gemischte-d-jugend",
    opponent: "TV Mosbach",
    date: "2026-10-24T11:00:00+02:00",
    homeAway: "home",
    venue: HOME_VENUE,
  },
  {
    team: "maennl-c-jugend",
    opponent: "TV Bad Rappenau",
    date: "2026-11-07T14:30:00+01:00",
    homeAway: "away",
    venue: "Mühltalhalle Bad Rappenau",
  },
  {
    team: "maenner",
    opponent: "SC Züttlingen",
    date: "2026-11-14T19:30:00+01:00",
    homeAway: "home",
    venue: HOME_VENUE,
  },
];

/** Kick-off of the last home game with a result — used by the matchday bar. */
export const BANNER_GAME = {
  team: "maenner",
  date: "2026-04-11T16:30:00.000Z",
  opponent: "SG Heuchelberg 3",
} as const;

export async function seedGames(payload: Payload, teams: TeamMap): Promise<number> {
  const all = [...PAST_GAMES, ...UPCOMING_GAMES];
  log.step(`Spiele (${PAST_GAMES.length} gespielt, ${UPCOMING_GAMES.length} anstehend)`);
  const tally = new Tally();

  for (const game of all) {
    const teamId = teams.get(game.team);
    if (!teamId) {
      log.warn(`Mannschaft "${game.team}" nicht gefunden — Spiel übersprungen`);
      continue;
    }

    const date = new Date(game.date).toISOString();
    const data = {
      team: teamId,
      opponent: game.opponent,
      date,
      homeAway: game.homeAway,
      venue: game.venue,
      result: game.result ?? { scoreFor: null, scoreAgainst: null },
    };

    const existing = await findFirst(payload, "games", {
      and: [
        { team: { equals: teamId } },
        { date: { equals: date } },
        { opponent: { equals: game.opponent } },
      ],
    });

    if (existing) {
      await payload.update({ collection: "games", id: existing.id, data, ...WRITE_OPTS });
      tally.add(false);
    } else {
      await payload.create({ collection: "games", data, ...WRITE_OPTS });
      tally.add(true);
    }
  }

  log.info(tally.summary);
  return all.length;
}

/** Resolves the id of the game the matchday bar points at. */
export async function findBannerGame(
  payload: Payload,
  teams: TeamMap,
): Promise<number | undefined> {
  const teamId = teams.get(BANNER_GAME.team);
  if (!teamId) return undefined;

  const doc = await findFirst(payload, "games", {
    and: [
      { team: { equals: teamId } },
      { date: { equals: new Date(BANNER_GAME.date).toISOString() } },
      { opponent: { equals: BANNER_GAME.opponent } },
    ],
  });
  return doc?.id;
}
