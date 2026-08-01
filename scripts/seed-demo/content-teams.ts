import type { Payload } from "payload";

import type { Player, Team } from "@payload-types";

import type { ImageKey, MediaMap } from "./images";
import { log } from "./log";
import { Tally, WRITE_OPTS, findFirst } from "./payload-helpers";

/**
 * Editorial content for the nine teams and their squads.
 *
 * The six 2026/27 teams already exist (`pnpm seed:baseline`) and are only
 * enriched here — name, slug, liga and the handball.net ids stay untouched.
 * The three teams below them played in 2025/26 only; they carry the season in
 * their liga text and have the handball.net widgets switched off, because
 * their league ids resolve to the (still empty) current season.
 */

type Weekday = NonNullable<NonNullable<Team["trainingTimes"]>[number]["day"]>;

type TeamSeed = {
  slug: string;
  /** Only set for the three teams this seed creates. */
  create?: { name: string; liga: string; sortOrder: number; teamId: string; tournamentId: string };
  image: ImageKey;
  imageCaption: string;
  introductionText: string;
  trainingTimes: { day: Weekday; timeFrom: string; timeTo: string }[];
  coach: string;
  /** Past-season teams show neither table nor fixtures. */
  archived?: boolean;
};

const HALL = "Sporthalle Lauda";
const CLUB_MAIL = "handball@etsv-lauda.de";
const HEAD_OF_DEPARTMENT = "Stefan Hartmann";

export const TEAM_SEEDS: TeamSeed[] = [
  {
    slug: "maenner",
    image: "teamMaenner",
    imageCaption: "Die Meistermannschaft der Saison 2025/26",
    introductionText:
      "Unsere erste Mannschaft hat die Saison 2025/26 mit 30:2 Punkten als Meister der " +
      "2. Bezirksklasse abgeschlossen und spielt 2026/27 in der Bezirksklasse Gruppe 1. " +
      "Der Kader besteht fast vollständig aus Spielern, die ihre Jugendzeit in Lauda " +
      "verbracht haben. Heimspiele sind samstagabends in der Sporthalle Lauda — " +
      "Eintritt frei, Stimmung inklusive.",
    trainingTimes: [
      { day: "di", timeFrom: "20:00", timeTo: "21:30" },
      { day: "fr", timeFrom: "20:00", timeTo: "21:30" },
    ],
    coach: "Andreas Vollmer",
  },
  {
    slug: "maennl-b-jugend",
    image: "teamMB",
    imageCaption: "Die männliche B-Jugend vor dem Heimspiel",
    introductionText:
      "Die männliche B-Jugend ist der direkte Unterbau der ersten Mannschaft. In der " +
      "vergangenen Runde sprang ein dritter Tabellenplatz mit 18:6 Punkten heraus, " +
      "getragen von der besten Offensive der Staffel. Zwei Spieler des Jahrgangs " +
      "trainieren bereits regelmäßig bei den Männern mit.",
    trainingTimes: [
      { day: "mo", timeFrom: "18:00", timeTo: "19:30" },
      { day: "mi", timeFrom: "18:00", timeTo: "19:30" },
    ],
    coach: "Kevin Stolz",
  },
  {
    slug: "maennl-c-jugend",
    image: "teamMC",
    imageCaption: "Die männliche C-Jugend beim Trainingsauftakt",
    introductionText:
      "In der männlichen C-Jugend wächst zusammen, was in den D-Jugend-Jahrgängen " +
      "begonnen hat. Nach zwei Qualifikationsrunden geht die Mannschaft 2026/27 in " +
      "der Bezirksliga an den Start. Im Mittelpunkt stehen saubere Grundlagen: " +
      "Stoßbewegung, Abwehrarbeit und ein Tempospiel, das Spaß macht.",
    trainingTimes: [
      { day: "di", timeFrom: "17:30", timeTo: "19:00" },
      { day: "do", timeFrom: "17:30", timeTo: "19:00" },
    ],
    coach: "Markus Dörr",
  },
  {
    slug: "weibl-a-jugend",
    image: "teamWA",
    imageCaption: "Die weibliche A-Jugend in der Sporthalle Lauda",
    introductionText:
      "Die weibliche A-Jugend ist die älteste Mädchenmannschaft der Abteilung und " +
      "damit die Brücke in den Erwachsenenbereich. Die Bezirksliga war in der " +
      "vergangenen Runde eine harte Schule — mit vier Punkten aus zehn Spielen und " +
      "einem Kader, der zur Hälfte noch B-Jugend-Jahrgang ist. Neuzugänge sind " +
      "jederzeit willkommen.",
    trainingTimes: [
      { day: "mo", timeFrom: "19:30", timeTo: "21:00" },
      { day: "do", timeFrom: "19:30", timeTo: "21:00" },
    ],
    coach: "Sabine Klein",
  },
  {
    slug: "weibl-c-jugend",
    image: "teamWC",
    imageCaption: "Aufwärmen vor dem Training",
    introductionText:
      "Die weibliche C-Jugend hat sich über die Qualifikationsrunde für die " +
      "Bezirksklasse Gruppe 2 empfohlen. Der Jahrgang trainiert zweimal pro Woche " +
      "und wird von zwei Übungsleiterinnen betreut. Wer Handball einmal ausprobieren " +
      "möchte, kommt einfach mittwochs vorbei — Hallenschuhe genügen.",
    trainingTimes: [
      { day: "mi", timeFrom: "16:30", timeTo: "18:00" },
      { day: "fr", timeFrom: "17:00", timeTo: "18:30" },
    ],
    coach: "Nadine Bauer",
  },
  {
    slug: "gemischte-d-jugend",
    image: "teamGD",
    imageCaption: "Die gemischte D-Jugend nach dem Heimspieltag",
    introductionText:
      "In der gemischten D-Jugend spielen Mädchen und Jungen gemeinsam. Die " +
      "Mannschaft beendete die Runde 2025/26 als Tabellenzweiter mit 20:4 Punkten " +
      "und 303 erzielten Toren. Trainiert wird zweimal pro Woche, dazu kommen " +
      "Turniertage in der Region.",
    trainingTimes: [
      { day: "di", timeFrom: "16:00", timeTo: "17:30" },
      { day: "fr", timeFrom: "15:30", timeTo: "17:00" },
    ],
    coach: "Tobias Lang",
  },

  // ── Mannschaften der Saison 2025/26 ─────────────────────────────────────
  {
    slug: "weibl-b-jugend",
    create: {
      name: "weibl. B-Jugend",
      liga: "Bezirksliga Gruppe 1 (Saison 2025/26)",
      sortOrder: 70,
      teamId: "handball4all.baden-wuerttemberg.1340256",
      tournamentId: "handball4all.baden-wuerttemberg.wb-bl-1-nf_nf",
    },
    image: "teamWB",
    imageCaption: "Die weibliche B-Jugend der Saison 2025/26",
    introductionText:
      "Die weibliche B-Jugend trat in der Saison 2025/26 in der Bezirksliga Gruppe 1 " +
      "an und schloss die Runde mit 12:12 Punkten auf Platz vier ab. Für 2026/27 ist " +
      "der Jahrgang in der A-Jugend gemeldet — die Mannschaftsseite bleibt als " +
      "Rückblick bestehen.",
    trainingTimes: [{ day: "mo", timeFrom: "17:30", timeTo: "19:00" }],
    coach: "Christian Ehrlich",
    archived: true,
  },
  {
    slug: "weibl-d-jugend",
    create: {
      name: "weibl. D-Jugend",
      liga: "Bezirksklasse Gruppe 1 (Saison 2025/26)",
      sortOrder: 80,
      teamId: "handball4all.baden-wuerttemberg.1340651",
      tournamentId: "handball4all.baden-wuerttemberg.wd-bk-1-nf_nf",
    },
    image: "teamWD",
    imageCaption: "Die weibliche D-Jugend der Saison 2025/26",
    introductionText:
      "Vierzehn Spiele, 212 eigene Tore und jede Menge Entwicklung: Die weibliche " +
      "D-Jugend hat die Saison 2025/26 in der Bezirksklasse Gruppe 1 auf Rang sechs " +
      "beendet. Der Großteil des Jahrgangs spielt 2026/27 in der weiblichen " +
      "C-Jugend weiter.",
    trainingTimes: [{ day: "do", timeFrom: "16:00", timeTo: "17:30" }],
    coach: "Melanie Roth",
    archived: true,
  },
  {
    slug: "gemischte-e-jugend",
    create: {
      name: "gemischte E-Jugend",
      liga: "Bezirksklasse Gruppe 2, 4+1 (Saison 2025/26)",
      sortOrder: 90,
      teamId: "handball4all.baden-wuerttemberg.1382111",
      tournamentId: "handball4all.baden-wuerttemberg.ge-bk-2-nf_nf",
    },
    image: "teamGE",
    imageCaption: "Die Minis beim Turniertag in Lauda",
    introductionText:
      "Die gemischte E-Jugend spielt im Format 4+1 auf verkürztem Feld: kurze Spiele, " +
      "viele Ballkontakte, an einem Vormittag gleich mehrere Begegnungen. 36 Partien " +
      "kamen in der Saison 2025/26 zusammen. Hier fängt bei uns alles an — " +
      "Einsteigerinnen und Einsteiger ab sechs Jahren sind jederzeit willkommen.",
    trainingTimes: [{ day: "mi", timeFrom: "15:30", timeTo: "16:45" }],
    coach: "Julia Seitz",
    archived: true,
  },
];

type PlayerSeed = {
  name: string;
  number: number;
  position: NonNullable<Player["position"]>;
  photo: ImageKey;
  gamesPlayed: number;
  goals: number;
  twoMinutes: number;
};

/** Squads per team slug. Names are invented, the statistics fit the season. */
export const PLAYER_SEEDS: Record<string, PlayerSeed[]> = {
  maenner: [
    {
      name: "Tim Berger",
      number: 1,
      position: "torwart",
      photo: "playerM1",
      gamesPlayed: 16,
      goals: 1,
      twoMinutes: 0,
    },
    {
      name: "Jonas Weiler",
      number: 3,
      position: "rueckraum-links",
      photo: "playerM2",
      gamesPlayed: 16,
      goals: 96,
      twoMinutes: 6,
    },
    {
      name: "Lukas Vogt",
      number: 7,
      position: "rueckraum-mitte",
      photo: "playerM3",
      gamesPlayed: 15,
      goals: 74,
      twoMinutes: 4,
    },
    {
      name: "Marcel Schäfer",
      number: 9,
      position: "rechtsaussen",
      photo: "playerM4",
      gamesPlayed: 16,
      goals: 63,
      twoMinutes: 2,
    },
    {
      name: "Fabian Krug",
      number: 11,
      position: "kreislaeufer",
      photo: "playerM5",
      gamesPlayed: 14,
      goals: 48,
      twoMinutes: 9,
    },
    {
      name: "Philipp Hauck",
      number: 14,
      position: "linksaussen",
      photo: "playerM6",
      gamesPlayed: 16,
      goals: 57,
      twoMinutes: 3,
    },
    {
      name: "Daniel Rützel",
      number: 17,
      position: "rueckraum-rechts",
      photo: "playerM7",
      gamesPlayed: 13,
      goals: 51,
      twoMinutes: 5,
    },
    {
      name: "Sebastian Kern",
      number: 21,
      position: "torwart",
      photo: "playerM8",
      gamesPlayed: 12,
      goals: 0,
      twoMinutes: 1,
    },
  ],
  "maennl-b-jugend": [
    {
      name: "Nico Baumann",
      number: 12,
      position: "torwart",
      photo: "playerB1",
      gamesPlayed: 12,
      goals: 0,
      twoMinutes: 0,
    },
    {
      name: "Elias Röder",
      number: 4,
      position: "rueckraum-mitte",
      photo: "playerB2",
      gamesPlayed: 12,
      goals: 61,
      twoMinutes: 3,
    },
    {
      name: "Jannik Häfner",
      number: 8,
      position: "linksaussen",
      photo: "playerB3",
      gamesPlayed: 11,
      goals: 44,
      twoMinutes: 2,
    },
    {
      name: "Moritz Sauer",
      number: 15,
      position: "kreislaeufer",
      photo: "playerB4",
      gamesPlayed: 12,
      goals: 38,
      twoMinutes: 6,
    },
    {
      name: "Leon Dürr",
      number: 23,
      position: "rechtsaussen",
      photo: "playerB5",
      gamesPlayed: 10,
      goals: 33,
      twoMinutes: 1,
    },
  ],
  "weibl-a-jugend": [
    {
      name: "Hannah Zeller",
      number: 1,
      position: "torwart",
      photo: "playerA1",
      gamesPlayed: 10,
      goals: 0,
      twoMinutes: 0,
    },
    {
      name: "Lea Böhm",
      number: 6,
      position: "rueckraum-links",
      photo: "playerA2",
      gamesPlayed: 10,
      goals: 42,
      twoMinutes: 3,
    },
    {
      name: "Marie Endres",
      number: 9,
      position: "rechtsaussen",
      photo: "playerA3",
      gamesPlayed: 9,
      goals: 29,
      twoMinutes: 1,
    },
    {
      name: "Sophie Braun",
      number: 13,
      position: "kreislaeufer",
      photo: "playerA4",
      gamesPlayed: 10,
      goals: 24,
      twoMinutes: 4,
    },
    {
      name: "Emilia Fuchs",
      number: 18,
      position: "rueckraum-mitte",
      photo: "playerA5",
      gamesPlayed: 8,
      goals: 31,
      twoMinutes: 2,
    },
  ],
  "weibl-c-jugend": [
    {
      name: "Mia Reinhardt",
      number: 2,
      position: "torwart",
      photo: "playerC1",
      gamesPlayed: 8,
      goals: 0,
      twoMinutes: 0,
    },
    {
      name: "Johanna Kraus",
      number: 5,
      position: "rueckraum-mitte",
      photo: "playerC2",
      gamesPlayed: 8,
      goals: 35,
      twoMinutes: 1,
    },
    {
      name: "Lena Schmitt",
      number: 10,
      position: "linksaussen",
      photo: "playerC3",
      gamesPlayed: 7,
      goals: 22,
      twoMinutes: 0,
    },
    {
      name: "Amelie Gerber",
      number: 16,
      position: "kreislaeufer",
      photo: "playerC4",
      gamesPlayed: 8,
      goals: 18,
      twoMinutes: 2,
    },
  ],
};

/** slug → id of every team the site knows about, filled by `seedTeams`. */
export type TeamMap = Map<string, number>;

export async function seedTeams(payload: Payload, media: MediaMap): Promise<TeamMap> {
  log.step(`Mannschaften (${TEAM_SEEDS.length})`);
  const tally = new Tally();
  const map: TeamMap = new Map();

  for (const seed of TEAM_SEEDS) {
    const shared = {
      teamImage: media.get(seed.image),
      teamImageCaption: seed.imageCaption,
      introductionText: seed.introductionText,
      trainingTimes: seed.trainingTimes.map((time) => ({ ...time, location: HALL })),
      contacts: [
        {
          label: seed.archived ? "Trainerin/Trainer 2025/26" : "Trainerin/Trainer",
          value: seed.coach,
        },
        { label: "Abteilungsleitung", value: HEAD_OF_DEPARTMENT },
        { label: "E-Mail", value: CLUB_MAIL },
      ],
    };

    const existing = await findFirst(payload, "teams", { slug: { equals: seed.slug } });

    if (existing) {
      const doc = await payload.update({
        collection: "teams",
        id: existing.id,
        data: shared,
        ...WRITE_OPTS,
      });
      map.set(seed.slug, doc.id);
      tally.add(false);
      log.skip(`${existing.name} angereichert`);
      continue;
    }

    if (!seed.create) {
      log.warn(`Mannschaft "${seed.slug}" fehlt und hat keine Anlagedaten — übersprungen`);
      continue;
    }

    const doc = await payload.create({
      collection: "teams",
      data: {
        ...shared,
        name: seed.create.name,
        slug: seed.slug,
        liga: seed.create.liga,
        sortOrder: seed.create.sortOrder,
        showNextGames: !seed.archived,
        showTable: !seed.archived,
        handballNet: { teamId: seed.create.teamId, tournamentId: seed.create.tournamentId },
      },
      ...WRITE_OPTS,
    });
    map.set(seed.slug, doc.id);
    tally.add(true);
    log.ok(`${seed.create.name} angelegt`);
  }

  log.info(tally.summary);
  return map;
}

export async function seedPlayers(
  payload: Payload,
  media: MediaMap,
  teams: TeamMap,
): Promise<number> {
  const total = Object.values(PLAYER_SEEDS).reduce((sum, squad) => sum + squad.length, 0);
  log.step(`Spieler (${total})`);
  const tally = new Tally();

  for (const [teamSlug, squad] of Object.entries(PLAYER_SEEDS)) {
    const teamId = teams.get(teamSlug);
    if (!teamId) {
      log.warn(`Mannschaft "${teamSlug}" nicht gefunden — Kader übersprungen`);
      continue;
    }

    for (const [index, player] of squad.entries()) {
      const data = {
        name: player.name,
        number: player.number,
        position: player.position,
        photo: media.get(player.photo),
        team: teamId,
        sortOrder: (index + 1) * 10,
        stats: {
          gamesPlayed: player.gamesPlayed,
          goals: player.goals,
          twoMinutes: player.twoMinutes,
        },
      };

      const existing = await findFirst(payload, "players", {
        and: [{ name: { equals: player.name } }, { team: { equals: teamId } }],
      });

      if (existing) {
        await payload.update({ collection: "players", id: existing.id, data, ...WRITE_OPTS });
        tally.add(false);
      } else {
        await payload.create({ collection: "players", data, ...WRITE_OPTS });
        tally.add(true);
      }
    }
    log.ok(`${teamSlug}: ${squad.length} Spieler`);
  }

  log.info(tally.summary);
  return total;
}
