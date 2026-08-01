import type { Payload } from "payload";

import type { Page } from "@payload-types";

import type { TeamMap } from "./content-teams";
import type { MediaMap } from "./images";
import { body, heading, list, p } from "./lexical";
import { log } from "./log";
import { WRITE_OPTS, findFirst } from "./payload-helpers";

/**
 * Pages and globals — everything that frames the content.
 *
 * The home page gets the full block sequence from the design (news teaser,
 * about, image grid, fixtures, league table). Impressum, Kontakt and Über den
 * Verein are text pages built from `content` blocks.
 */

const CLUB_MAIL = "handball@etsv-lauda.de";
const MAIN_CLUB_URL = "http://www.etsv-lauda.de";
const HALL_ADDRESS = "Sporthalle Lauda, Im Ramstal 86a, 97922 Lauda-Königshofen";

type Layout = NonNullable<Page["layout"]>;

const ABOUT_TEXT =
  "Handball wird beim ETSV Lauda seit der Saison 1928/29 gespielt. Aus einer " +
  "Betriebssportgruppe der Eisenbahner ist über die Jahrzehnte eine Abteilung " +
  "geworden, die heute neun Mannschaften stellt — von den Minis bis zu den Herren.\n\n" +
  "Der Schwerpunkt liegt seit jeher auf der eigenen Jugend: Fast alle Spielerinnen " +
  "und Spieler unserer Mannschaften haben in Lauda mit dem Handball angefangen. " +
  "Gemeinsam mit den Vereinen im Main-Tauber-Kreis sorgen wir dafür, dass Kinder " +
  "auch in kleineren Orten wohnortnah spielen können.\n\n" +
  "Trainiert wird an fünf Tagen pro Woche in der Sporthalle Lauda. Zuschauen, " +
  "mitmachen und mithelfen ist bei uns ausdrücklich erwünscht.";

function homeLayout(teams: TeamMap, media: MediaMap): Layout {
  const teamIds = [...teams.values()];
  const maenner = teams.get("maenner");

  const layout: Layout = [
    {
      // Bildband ganz oben. Waehlt seine Beitraege selbst aus (Top-Beitrag
      // zuerst, dann die neuesten) — deshalb nur die Anzahl.
      blockType: "heroSlider",
      itemCount: "3",
    },
    {
      blockType: "about",
      headline: "Über den Verein",
      subline: "Gemeinsam bärenstark",
      text: ABOUT_TEXT,
      teams: teamIds,
      sectionBackground: "backgroundDark",
      anchorId: "verein",
    },
    {
      blockType: "imageGrid",
      headline: "Mehr als Handball",
      subline: "Training, Fans, Jugend, Halle",
      images: [
        { image: media.get("gridTraining") ?? 0, caption: "Athletik am Dienstagabend" },
        { image: media.get("gridFans") ?? 0, caption: "Unsere Zuschauer bei Heimspielen" },
        { image: media.get("gridJugend") ?? 0, caption: "Über 90 Kinder und Jugendliche" },
        { image: media.get("gridHalle") ?? 0, caption: "Unsere Sporthalle Im Ramstal" },
      ],
      sectionBackground: "texture",
    },
    {
      blockType: "nextGames",
      headline: "Nächste Spiele",
      subline: "Saison 2026/27",
      maxPerColumn: 3,
      active: true,
      sectionBackground: "primary",
    },
  ];

  if (maenner) {
    layout.push({
      blockType: "leagueTable",
      team: maenner,
      headline: "Tabelle der Herren",
      sectionBackground: "primary",
    });
  }

  return layout;
}

function impressumLayout(): Layout {
  return [
    {
      blockType: "content",
      headline: "Impressum",
      subline: "Angaben gemäß § 5 TMG",
      richText: body(
        p("ETSV Lauda e.V. — Abteilung Handball\nIm Ramstal 86a\n97922 Lauda-Königshofen"),
        p(`E-Mail: ${CLUB_MAIL}\nWebsite des Hauptvereins: ${MAIN_CLUB_URL}`),
        heading("h2", "Vertretungsberechtigt"),
        p(
          "Vertreten durch den Vorstand des ETSV Lauda e.V. Verantwortlich für die " +
            "Inhalte der Abteilungsseiten nach § 18 Abs. 2 MStV ist die " +
            "Abteilungsleitung Handball unter der oben genannten Anschrift.",
        ),
        heading("h2", "Registereintrag"),
        p(
          "Eingetragen im Vereinsregister beim Amtsgericht Mannheim. Die " +
            "Registernummer ergänzt die Abteilungsleitung vor der Veröffentlichung.",
        ),
      ),
      sectionBackground: "primary",
    },
    {
      blockType: "content",
      headline: "Haftung und Urheberrecht",
      richText: body(
        p(
          "Die Inhalte dieser Seiten werden mit größter Sorgfalt erstellt. Für die " +
            "Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine " +
            "Gewähr übernommen werden.",
        ),
        p(
          "Für Inhalte externer Links ist ausschließlich deren Betreiber " +
            "verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße " +
            "erkennbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir " +
            "entsprechende Links umgehend.",
        ),
        p(
          "Spielpläne, Tabellen und Ergebnisse stammen von handball.net. Die Rechte " +
            "an diesen Daten liegen beim jeweiligen Verband.",
        ),
      ),
      sectionBackground: "backgroundDark",
    },
    {
      blockType: "content",
      headline: "Datenschutz",
      anchorId: "datenschutz",
      richText: body(
        p(
          "Diese Website erhebt personenbezogene Daten nur, soweit dies technisch " +
            "erforderlich ist. Eine Weitergabe an Dritte erfolgt nicht.",
        ),
        heading("h2", "Eingebundene Inhalte von handball.net"),
        p(
          "Spielpläne und Tabellen werden von handball.net bezogen. Dabei erhebt " +
            "handball.net anonymisierte Besucherstatistiken; diese werden maximal drei " +
            "Monate gespeichert. Weitere Informationen stellt handball.net in seiner " +
            "eigenen Datenschutzerklärung bereit.",
        ),
        heading("h2", "Ihre Rechte"),
        p(
          "Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und " +
            `Einschränkung der Verarbeitung Ihrer Daten. Wenden Sie sich dafür an ${CLUB_MAIL}.`,
        ),
      ),
      sectionBackground: "primary",
    },
  ];
}

function kontaktLayout(): Layout {
  return [
    {
      blockType: "content",
      headline: "Kontakt",
      subline: "Wir freuen uns über jede Nachricht",
      richText: body(
        p(
          "Ob Schnuppertraining, Mitgliedschaft, Sponsoring oder eine Frage zum " +
            "Spielplan — schreiben Sie uns einfach. Wir melden uns in der Regel " +
            "innerhalb weniger Tage zurück.",
        ),
        heading("h2", "Abteilung Handball"),
        p(`${HALL_ADDRESS}\nE-Mail: ${CLUB_MAIL}`),
        heading("h2", "Ansprechpartner"),
        list("bullet", [
          "Abteilungsleitung: Stefan Hartmann",
          "Jugendkoordination: Katrin Möbus",
          "Presse und Website: Michael Grün",
        ]),
      ),
      link: {
        type: "custom",
        url: `mailto:${CLUB_MAIL}`,
        label: "E-Mail schreiben",
        appearance: "primary",
      },
      sectionBackground: "primary",
      anchorId: "kontakt",
    },
    {
      blockType: "content",
      headline: "So finden Sie uns",
      richText: body(
        p(
          "Die Sporthalle liegt am Vereinsgelände Im Ramstal, rund zehn Gehminuten " +
            "vom Bahnhof Lauda entfernt. Parkplätze stehen direkt an der Halle zur " +
            "Verfügung.",
        ),
        p(
          "An Heimspieltagen ist die Halle eine Stunde vor Anwurf geöffnet. " +
            "Der Eintritt ist frei.",
        ),
      ),
      sectionBackground: "textureLight",
      anchorId: "halle",
    },
  ];
}

function ueberDenVereinLayout(teams: TeamMap): Layout {
  return [
    {
      blockType: "content",
      headline: "Über den Verein",
      subline: "Gemeinsam bärenstark",
      richText: body(
        p(
          "Die Handballabteilung des ETSV Lauda besteht seit der Saison 1928/29. " +
            "Was als Betriebssportgruppe der Eisenbahner begann, ist heute eine " +
            "Abteilung mit neun Mannschaften und über 200 Mitgliedern.",
        ),
        heading("h2", "Wofür wir stehen"),
        list("bullet", [
          "Handball für alle Altersklassen — von den Minis bis zu den Herren",
          "Ausbildung vor Ergebnis: Wer bei uns anfängt, soll bei uns bleiben können",
          "Ein Verein zum Mitmachen, nicht nur zum Zuschauen",
        ]),
        p(
          "Sportlich war die Saison 2025/26 die erfolgreichste der jüngeren " +
            "Vereinsgeschichte: Die Herren gewannen die 2. Bezirksklasse Gruppe 1 mit " +
            "30:2 Punkten und spielen seither eine Klasse höher.",
        ),
      ),
      sectionBackground: "primary",
    },
    {
      blockType: "content",
      headline: "Jugendarbeit im Main-Tauber-Kreis",
      richText: body(
        p(
          "Rund 90 Kinder und Jugendliche trainieren regelmäßig in der Sporthalle " +
            "Lauda. Damit auch in kleineren Jahrgängen gespielt werden kann, arbeiten " +
            "wir eng mit den Vereinen der Umgebung zusammen — in gemischten " +
            "Mannschaften ebenso wie in Spielgemeinschaften.",
        ),
        p(
          "Übungsleiterinnen und Übungsleiter bilden wir im Verein aus und " +
            "unterstützen sie bei den Lehrgängen des Badischen Handball-Verbands. Wer " +
            "Lust hat, eine Gruppe zu begleiten, meldet sich bei der Abteilungsleitung.",
        ),
      ),
      sectionBackground: "backgroundDark",
    },
    {
      blockType: "about",
      headline: "Unsere Mannschaften",
      subline: "Neun Teams, eine Halle",
      text:
        "Von der gemischten E-Jugend bis zu den Herren: Jede Mannschaft hat eine " +
        "eigene Seite mit Trainingszeiten, Kader, Spielplan und Tabelle.",
      teams: [...teams.values()],
      sectionBackground: "texture",
    },
    {
      blockType: "sponsorsBlock",
      headline: "Unsere Partner",
      subline: "Ohne sie ginge es nicht",
      variant: "logos",
      sectionBackground: "textureLight",
    },
  ];
}

type PageSeed = { slug: string; title: string; layout: Layout };

async function upsertPage(payload: Payload, seed: PageSeed): Promise<number> {
  const data = {
    title: seed.title,
    slug: seed.slug,
    layout: seed.layout,
    _status: "published" as const,
  };

  const existing = await findFirst(payload, "pages", { slug: { equals: seed.slug } });
  if (existing) {
    const doc = await payload.update({
      collection: "pages",
      id: existing.id,
      data,
      ...WRITE_OPTS,
    });
    log.skip(`/${seed.slug === "home" ? "" : seed.slug} aktualisiert`);
    return doc.id;
  }

  const doc = await payload.create({ collection: "pages", data, ...WRITE_OPTS });
  log.ok(`/${seed.slug === "home" ? "" : seed.slug} angelegt`);
  return doc.id;
}

/** slug → page id, needed by navigation and footer references. */
export type PageMap = Map<string, number>;

export async function seedPages(
  payload: Payload,
  media: MediaMap,
  teams: TeamMap,
): Promise<PageMap> {
  const seeds: PageSeed[] = [
    { slug: "home", title: "ETSV Lauda Handball", layout: homeLayout(teams, media) },
    { slug: "ueber-den-verein", title: "Über den Verein", layout: ueberDenVereinLayout(teams) },
    { slug: "kontakt", title: "Kontakt", layout: kontaktLayout() },
    { slug: "impressum", title: "Impressum", layout: impressumLayout() },
  ];

  log.step(`Seiten (${seeds.length})`);
  const map: PageMap = new Map();
  for (const seed of seeds) {
    map.set(seed.slug, await upsertPage(payload, seed));
  }
  return map;
}

/** Youth teams in menu order — everything except the men's team. */
const YOUTH_ORDER = [
  "maennl-b-jugend",
  "maennl-c-jugend",
  "weibl-a-jugend",
  "weibl-c-jugend",
  "gemischte-d-jugend",
  "weibl-b-jugend",
  "weibl-d-jugend",
  "gemischte-e-jugend",
];

const YOUTH_LABELS: Record<string, string> = {
  "maennl-b-jugend": "männl. B-Jugend",
  "maennl-c-jugend": "männl. C-Jugend",
  "weibl-a-jugend": "weibl. A-Jugend",
  "weibl-c-jugend": "weibl. C-Jugend",
  "gemischte-d-jugend": "gemischte D-Jugend",
  "weibl-b-jugend": "weibl. B-Jugend (2025/26)",
  "weibl-d-jugend": "weibl. D-Jugend (2025/26)",
  "gemischte-e-jugend": "gemischte E-Jugend (2025/26)",
};

export async function seedGlobals(
  payload: Payload,
  media: MediaMap,
  teams: TeamMap,
  pages: PageMap,
  bannerGameId?: number,
): Promise<void> {
  log.step("Globals");

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      siteName: "ETSV Lauda Handball",
      siteDescription:
        "Die Handballabteilung des ETSV Lauda: neun Mannschaften, Spielpläne, " +
        "Tabellen und Nachrichten aus dem Main-Tauber-Kreis.",
      contact: { email: CLUB_MAIL, phone: null },
      address: { street: "Im Ramstal 86a", zip: "97922", city: "Lauda-Königshofen" },
      socialLinks: {
        instagram: "https://www.instagram.com/etsvlauda.handball",
        facebook: "https://www.facebook.com/Lauda.Handball",
      },
      mainClubUrl: MAIN_CLUB_URL,
      membershipUrl: `${MAIN_CLUB_URL}/mitglied-werden`,
      handballNet: { clubId: "handball4all.baden.570" },
    },
    ...WRITE_OPTS,
  });
  log.ok("Vereinsdaten");

  const pageRef = (slug: string) => ({
    type: "reference" as const,
    reference: { relationTo: "pages" as const, value: pages.get(slug) ?? 0 },
  });

  await payload.updateGlobal({
    slug: "navigation",
    data: {
      items: [
        {
          label: "Herren",
          link: teams.get("maenner")
            ? {
                type: "reference" as const,
                reference: { relationTo: "teams" as const, value: teams.get("maenner") ?? 0 },
              }
            : { type: "custom" as const, url: "/mannschaften/maenner" },
        },
        {
          label: "Jugend",
          link: { type: "none" as const },
          children: YOUTH_ORDER.filter((slug) => teams.has(slug)).map((slug) => ({
            label: YOUTH_LABELS[slug] ?? slug,
            link: {
              type: "reference" as const,
              reference: { relationTo: "teams" as const, value: teams.get(slug) ?? 0 },
            },
          })),
        },
        { label: "Spielübersicht", link: { type: "custom" as const, url: "/spieluebersicht" } },
        { label: "News", link: { type: "custom" as const, url: "/news" } },
        { label: "Sponsoren", link: { type: "custom" as const, url: "/sponsoren" } },
        { label: "Über den Verein", link: pageRef("ueber-den-verein") },
        {
          label: "Zum Hauptverein",
          link: { type: "custom" as const, url: MAIN_CLUB_URL, newTab: true },
        },
        { label: "Kontakt", link: pageRef("kontakt") },
        { label: "Impressum", link: pageRef("impressum") },
      ],
    },
    ...WRITE_OPTS,
  });
  log.ok("Navigation");

  await payload.updateGlobal({
    slug: "footer",
    data: {
      links: [
        { label: "Spielübersicht", link: { type: "custom" as const, url: "/spieluebersicht" } },
        {
          label: "Zum Hauptverein",
          link: { type: "custom" as const, url: MAIN_CLUB_URL, newTab: true },
        },
        { label: "Impressum", link: pageRef("impressum") },
        { label: "AGBs", link: { type: "custom" as const, url: "/impressum" } },
        { label: "Kontakt", link: pageRef("kontakt") },
      ],
      memberCard: {
        image: media.get("crest"),
        preHeadline: "ETSV Lauda",
        headline: "Jetzt Mitglied werden",
        link: {
          type: "custom" as const,
          url: `${MAIN_CLUB_URL}/mitglied-werden`,
          newTab: true,
        },
      },
    },
    ...WRITE_OPTS,
  });
  log.ok("Footer");

  if (bannerGameId) {
    await payload.updateGlobal({
      slug: "highlight-banner",
      data: { active: true, type: "game", game: bannerGameId },
      ...WRITE_OPTS,
    });
    log.ok("Matchday-Leiste (letztes Heimspiel mit Ergebnis)");
  } else {
    log.warn("Matchday-Leiste: Spiel nicht gefunden — Leiste bleibt inaktiv");
  }
}
