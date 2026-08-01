import type { Payload } from "payload";

import type { TeamMap } from "./content-teams";
import type { ImageKey, MediaMap } from "./images";
import { type LexNode, type LexicalDoc, body, heading, image, list, p, quote } from "./lexical";
import { log } from "./log";
import { Tally, WRITE_OPTS, daysAgo, findFirst } from "./payload-helpers";

/**
 * Twelve demo articles across all five categories.
 *
 * Match reports are anchored to the real 2025/26 results from handball.net, so
 * they carry an absolute `publishedAt`. Evergreen posts use `publishedDaysAgo`
 * and therefore stay fresh no matter when the seed runs.
 *
 * Everything else — quotes, names, scorer lists — is invented.
 */

type Author = { name: string; role: string; avatar: ImageKey };

const AUTHORS = {
  gruen: { name: "Michael Grün", role: "Pressewart", avatar: "authorGruen" },
  hartmann: { name: "Stefan Hartmann", role: "Abteilungsleiter", avatar: "authorHartmann" },
  moebus: { name: "Katrin Möbus", role: "Jugendkoordinatorin", avatar: "authorMoebus" },
} as const satisfies Record<string, Author>;

type NewsSeed = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  team?: string;
  cover: ImageKey;
  author: Author;
  tags: string[];
  /**
   * „Top-Beitrag“. Der Hero-Slider der Startseite zeigt diese Beitraege zuerst
   * — die Demo braucht deshalb mindestens drei davon, jeder mit einem Bild, das
   * grossformatig traegt.
   */
  featured?: boolean;
  /** Fixed publication date — used wherever the text refers to a real game. */
  publishedAt?: string;
  /** Relative alternative, so evergreen posts never look stale. */
  publishedDaysAgo?: number;
  /** Arrow link under the article, pointing at a team page. */
  ctaTeam?: { slug: string; label: string };
  body: (img: (key: ImageKey, caption?: string) => LexNode) => LexicalDoc;
};

export const NEWS_SEEDS: NewsSeed[] = [
  {
    slug: "meister-herren-kroenen-perfekte-saison",
    title: "Meister! Die Herren krönen eine perfekte Saison",
    excerpt:
      "15 Siege aus 16 Spielen, 30:2 Punkte und 486:354 Tore: Die Herren gewinnen die " +
      "2. Bezirksklasse Gruppe 1 und spielen 2026/27 eine Klasse höher.",
    category: "vereinsnachricht",
    team: "maenner",
    cover: "newsMeister",
    author: AUTHORS.hartmann,
    tags: ["Meisterschaft", "Aufstieg", "Herren"],
    featured: true,
    publishedAt: "2026-04-28T18:00:00+02:00",
    ctaTeam: { slug: "maenner", label: "Zur Mannschaftsseite der Herren" },
    body: (img) =>
      body(
        p(
          "Es ist geschafft: Mit dem 36:28 beim TSV Crailsheim am letzten Spieltag haben " +
            "unsere Herren die Saison 2025/26 als Meister der 2. Bezirksklasse Gruppe 1 " +
            "abgeschlossen. 15 Siege, eine Niederlage, 30:2 Punkte — souveräner geht eine " +
            "Runde kaum.",
        ),
        heading("h2", "Eine Saison ohne Wackler"),
        p(
          "Schon der Auftakt setzte den Ton: 28:16 gegen die SG Gundelsheim, eine Woche " +
            "später 33:25 gegen die zweite Mannschaft der HSG Staufer. Der einzige " +
            "Ausrutscher kam am 23. November in Oedheim, als ein einziges Tor zum 24:25 " +
            "fehlte. Danach gewann die Mannschaft jedes weitere Spiel.",
        ),
        list("bullet", [
          "16 Spiele, 15 Siege, 1 Niederlage — 30:2 Punkte",
          "486 erzielte Tore, 354 Gegentore, Tordifferenz +132",
          "Beste Offensive und zweitbeste Abwehr der Staffel",
          "Acht Heimspiele, acht Heimsiege",
        ]),
        img("inlineHalle", "Die Sporthalle Lauda vor dem letzten Heimspiel der Saison"),
        heading("h2", "Getragen von der eigenen Jugend"),
        p(
          "Bemerkenswert ist nicht nur die Bilanz, sondern der Kader dahinter: Bis auf zwei " +
            "Spieler haben alle ihre Jugendzeit beim ETSV verbracht. Genau das war das Ziel, " +
            "als die Abteilung vor Jahren beschlossen hat, konsequent auf eigene Talente zu " +
            "setzen.",
        ),
        quote(
          "Wir haben in dieser Runde nie über den Aufstieg gesprochen, sondern immer nur " +
            "über das nächste Spiel. Am Ende ist genau daraus eine Saison geworden, an die " +
            "sich hier alle noch lange erinnern werden.",
        ),
        heading("h2", "Wie es weitergeht"),
        p(
          "2026/27 spielt die Mannschaft in der Bezirksklasse Gruppe 1. Die Vorbereitung " +
            "beginnt Mitte August, das erste Heimspiel ist für den 19. September geplant. " +
            "Bis dahin gilt der Dank allen, die diese Saison möglich gemacht haben: den " +
            "Zuschauerinnen und Zuschauern in der Sporthalle, den Betreuern, den Sponsoren " +
            "und allen, die sonntags die Halle wieder aufgeräumt haben.",
        ),
      ),
  },
  {
    slug: "36-28-in-crailsheim-der-schlusspunkt",
    title: "36:28 in Crailsheim — der Schlusspunkt einer starken Saison",
    excerpt:
      "Zum Saisonabschluss gewinnen die Herren auch das letzte Auswärtsspiel beim " +
      "TSV Crailsheim deutlich und schließen die Runde mit 30:2 Punkten ab.",
    category: "spielbericht",
    team: "maenner",
    cover: "newsCrailsheim",
    author: AUTHORS.gruen,
    tags: ["Spielbericht", "Auswärtsspiel", "Herren"],
    publishedAt: "2026-04-27T09:30:00+02:00",
    body: (img) =>
      body(
        p(
          "Zwei Stunden Anfahrt, 15 Uhr Anwurf, und trotzdem war vom ersten Angriff an " +
            "klar, dass diese Mannschaft die Saison nicht auslaufen lassen würde. Nach " +
            "zwölf Minuten stand es 8:4, zur Pause führte Lauda mit 19:13.",
        ),
        heading("h2", "Zweite Halbzeit ohne Spannung"),
        p(
          "Der TSV Crailsheim kam nach dem Seitenwechsel noch einmal auf vier Tore heran, " +
            "doch eine kurze Auszeit und eine offensivere Abwehr genügten, um den Vorsprung " +
            "wieder auszubauen. In den Schlussminuten bekamen alle mitgereisten Spieler ihre " +
            "Einsatzzeit.",
        ),
        img("inlineBank", "Auswechselbank in Crailsheim: Am Ende kamen alle zum Einsatz"),
        list("bullet", [
          "Tore für Lauda: Weiler 9, Vogt 7, Hauck 6, Schäfer 5, Rützel 4, Krug 4, Berger 1",
          "Zeitstrafen: 3 Minuten Lauda, 8 Minuten Crailsheim",
          "Rund 40 mitgereiste Zuschauerinnen und Zuschauer",
        ]),
        quote(
          "Dass wir am letzten Spieltag auswärts noch einmal so auftreten, sagt mehr über " +
            "die Mannschaft aus als jede Tabelle.",
        ),
      ),
  },
  {
    slug: "29-14-die-abwehr-macht-den-unterschied",
    title: "29:14 gegen Heuchelberg — die Abwehr macht den Unterschied",
    excerpt:
      "Im letzten Heimspiel der Saison lässt die Deckung nur 14 Gegentore zu. Vor voller " +
      "Halle wird der 29:14-Erfolg zur Generalprobe für den Titel.",
    category: "spielbericht",
    team: "maenner",
    cover: "newsHeuchelberg",
    author: AUTHORS.gruen,
    tags: ["Spielbericht", "Heimspiel", "Herren"],
    publishedAt: "2026-04-12T11:00:00+02:00",
    ctaTeam: { slug: "maenner", label: "Alle Spiele der Herren" },
    body: (img) =>
      body(
        p(
          "14 Gegentore in 60 Minuten — das hat es in dieser Saison noch nicht gegeben. " +
            "Die SG Heuchelberg 3 fand in der Sporthalle Lauda kein Mittel gegen eine " +
            "Abwehr, die früh störte und fast jeden zweiten Angriff der Gäste im Ansatz " +
            "beendete.",
        ),
        img("inlineTorwart", "Zwei gehaltene Siebenmeter in der ersten Halbzeit"),
        heading("h2", "Torwartleistung als Fundament"),
        p(
          "Tim Berger hielt in der ersten Halbzeit zwei Siebenmeter und kam auf eine " +
            "Quote von über 40 Prozent. Vorne genügte ein einfaches, geduldiges Spiel: " +
            "Zur Pause stand es 15:7, am Ende 29:14.",
        ),
        heading("h2", "Stimmung wie im Pokalfinale"),
        p(
          "Rund 200 Zuschauerinnen und Zuschauer sorgten für eine Kulisse, die in dieser " +
            "Liga selten ist. Nach dem Schlusspfiff blieb die Mannschaft noch lange auf der " +
            "Platte — der Titel war zu diesem Zeitpunkt rechnerisch bereits sicher.",
        ),
      ),
  },
  {
    slug: "deutlicher-derbysieg-gegen-bad-mergentheim",
    title: "Deutlicher Derbysieg: 35:17 gegen Bad Mergentheim",
    excerpt:
      "Im Nachbarschaftsduell gegen die SG Bad Mergentheim lassen die Herren nichts " +
      "anbrennen und gewinnen mit 18 Toren Unterschied.",
    category: "spielbericht",
    team: "maenner",
    cover: "newsMergentheim",
    author: AUTHORS.gruen,
    tags: ["Spielbericht", "Derby", "Heimspiel"],
    featured: true,
    publishedAt: "2026-02-01T10:00:00+01:00",
    body: (img) =>
      body(
        p(
          "Derbys haben ihre eigenen Gesetze — dieses hier hielt sich nicht daran. Nach " +
            "zehn Minuten führte Lauda mit 7:2, zur Pause mit 18:8, und auch danach ließ " +
            "das Tempo nicht nach.",
        ),
        heading("h2", "Tempospiel über die Außen"),
        p(
          "Der Schlüssel lag im schnellen Umschalten: Fast ein Drittel der Tore fiel aus " +
            "der ersten oder zweiten Welle. Philipp Hauck und Marcel Schäfer kamen über die " +
            "Außenpositionen zusammen auf zwölf Treffer.",
        ),
        img("inlineBaelle", "Vor dem Anwurf in der Sporthalle Lauda"),
        list("number", [
          "Halbzeitstand 18:8",
          "Endstand 35:17 — höchster Heimsieg der Saison",
          "Sechs Torschützen mit mindestens vier Treffern",
        ]),
      ),
  },
  {
    slug: "24-25-in-oedheim-erste-saisonniederlage",
    title: "24:25 in Oedheim — erste Saisonniederlage",
    excerpt:
      "Ein Tor fehlt: Beim Tabellennachbarn SG Degmarn-Oedheim 2 verlieren die Herren " +
      "nach einer schwachen Anfangsphase knapp mit 24:25.",
    category: "spielbericht",
    team: "maenner",
    cover: "newsOedheim",
    author: AUTHORS.gruen,
    tags: ["Spielbericht", "Auswärtsspiel"],
    publishedAt: "2025-11-24T08:30:00+01:00",
    body: (img) =>
      body(
        p(
          "Es war das erwartet enge Spiel — und am Ende die erste Niederlage der Saison. " +
            "In Oedheim lag Lauda nach zwanzig Minuten mit fünf Toren zurück, kämpfte sich " +
            "zurück, glich in der Schlussminute zum 24:24 aus und kassierte zehn Sekunden " +
            "vor Schluss den Gegentreffer zum 24:25.",
        ),
        heading("h2", "Zu viele technische Fehler"),
        p(
          "Elf Ballverluste allein in der ersten Halbzeit waren zu viel gegen einen " +
            "Gegner dieser Qualität. Positiv: Die Mannschaft gab nach dem 8:13 nie auf und " +
            "hatte den Ausgleich am Ende sogar auf dem Arm.",
        ),
        img("inlineKraftraum", "Aufarbeitung im Kraftraum: Die Woche danach"),
        quote(
          "Wir nehmen die Niederlage an. Wenn wir daraus lernen, war es der billigste " +
            "Punktverlust der Saison.",
        ),
      ),
  },
  {
    slug: "mb-jugend-gewinnt-krimi-gegen-metter-enz",
    title: "Krimi in der Sporthalle: mB-Jugend gewinnt 39:38",
    excerpt:
      "Sekunden vor Schluss fällt das entscheidende Tor: Die männliche B-Jugend setzt " +
      "sich gegen den HC Metter-Enz 2 mit 39:38 durch.",
    category: "jugend",
    team: "maennl-b-jugend",
    cover: "newsMbDerby",
    author: AUTHORS.moebus,
    tags: ["Jugend", "Heimspiel", "B-Jugend"],
    publishedAt: "2025-11-30T14:00:00+01:00",
    ctaTeam: { slug: "maennl-b-jugend", label: "Zur männlichen B-Jugend" },
    body: (img) =>
      body(
        p(
          "77 Tore in 60 Minuten: Wer am Samstagnachmittag in die Sporthalle Lauda kam, " +
            "bekam ein Spiel zu sehen, in dem beide Abwehrreihen an ihre Grenzen kamen — " +
            "und ein Ende, das niemand vorhersagen konnte.",
        ),
        img("inlineAufwaermen", "Aufwärmen vor dem Anwurf"),
        heading("h2", "Vierzehn Führungswechsel"),
        p(
          "Keine Mannschaft lag jemals mit mehr als drei Toren vorne. Nach dem 37:38 aus " +
            "Laudaer Sicht blieben noch neunzig Sekunden — Elias Röder glich aus, dann " +
            "traf Jannik Häfner zwanzig Sekunden vor Schluss zum 39:38.",
        ),
        heading("h2", "Ein Jahrgang, der zusammenwächst"),
        p(
          "Für die B-Jugend war es der dritte Sieg im fünften Spiel. Am Ende der Runde " +
            "stand mit 18:6 Punkten der dritte Tabellenplatz — bei 388 erzielten Toren die " +
            "beste Offensive der Staffel.",
        ),
      ),
  },
  {
    slug: "gd-jugend-als-tabellenzweiter-in-die-winterpause",
    title: "gD-Jugend geht als Tabellenzweiter in die Winterpause",
    excerpt:
      "Sieben Siege aus acht Spielen: Die gemischte D-Jugend verabschiedet sich mit " +
      "einem 32:14 gegen die JSG Kochertal in die Pause.",
    category: "jugend",
    team: "gemischte-d-jugend",
    cover: "newsGdWinter",
    author: AUTHORS.moebus,
    tags: ["Jugend", "D-Jugend"],
    publishedAt: "2025-12-15T17:00:00+01:00",
    ctaTeam: { slug: "gemischte-d-jugend", label: "Zur gemischten D-Jugend" },
    body: (img) =>
      body(
        p(
          "Mit dem 32:14 gegen die JSG Kochertal hat die gemischte D-Jugend das letzte " +
            "Spiel des Jahres gewonnen und überwintert als Tabellenzweiter hinter der JSG " +
            "Tauberfranken.",
        ),
        list("bullet", [
          "28:4 in Kochertal zum Auftakt",
          "26:16 in Bad Mergentheim",
          "36:14 in Züttlingen",
          "29:14 gegen TV Bad Rappenau 2",
          "20:14 in Hardheim",
          "18:7 gegen SG Bad Mergentheim",
          "15:27 gegen JSG Tauberfranken — die einzige Niederlage",
          "32:14 gegen JSG Kochertal",
        ]),
        img("inlineAthletik", "Athletikeinheit im Anschluss an das Training"),
        heading("h2", "Breite statt Einzelkönner"),
        p(
          "Bemerkenswert ist die Verteilung: In acht Spielen haben vierzehn verschiedene " +
            "Kinder getroffen. Genau darum geht es in diesem Alter — jede und jeder soll " +
            "Verantwortung übernehmen dürfen, unabhängig von der Körpergröße.",
        ),
        p(
          "Weiter geht es am zweiten Januarwochenende. Bis dahin steht dienstags und " +
            "freitags das gewohnte Training auf dem Programm.",
        ),
      ),
  },
  {
    slug: "wa-jugend-zweiter-heimsieg-in-folge",
    title: "Zweiter Heimsieg in Folge: wA-Jugend schlägt Metter-Enz 23:22",
    excerpt:
      "Eine Woche nach dem Erfolg gegen Leudelsbach gewinnt die weibliche A-Jugend auch " +
      "das Spiel gegen den HC Metter-Enz — mit einem Tor Vorsprung.",
    category: "jugend",
    team: "weibl-a-jugend",
    cover: "newsWaHeimsieg",
    author: AUTHORS.moebus,
    tags: ["Jugend", "A-Jugend", "Heimspiel"],
    publishedAt: "2025-12-07T16:00:00+01:00",
    ctaTeam: { slug: "weibl-a-jugend", label: "Zur weiblichen A-Jugend" },
    body: (img) =>
      body(
        p(
          "Nach dem 21:17 gegen die HSG Leudelsbach hat die weibliche A-Jugend auch das " +
            "zweite Heimspiel binnen acht Tagen gewonnen. Gegen den HC Metter-Enz reichte " +
            "es zu einem 23:22 — dem knappsten Ergebnis der bisherigen Runde.",
        ),
        img("inlineHalle", "Heimspieltag in der Sporthalle Lauda"),
        heading("h2", "Junge Mannschaft, große Aufgabe"),
        p(
          "Die Hälfte des Kaders ist noch B-Jugend-Jahrgang. Dass gegen ältere Gegnerinnen " +
            "zwei Siege in Folge gelingen, ist deshalb mehr als ein Zwischenergebnis — es " +
            "ist der Beleg, dass die Arbeit der vergangenen zwei Jahre trägt.",
        ),
        quote(
          "Wir haben vor der Saison gesagt, dass wir uns über jeden Punkt freuen. Jetzt " +
            "sind es vier — und das Selbstvertrauen ist ein anderes.",
        ),
      ),
  },
  {
    slug: "turniertag-der-e-jugend-in-lauda",
    title: "Turniertag der E-Jugend: drei Siege aus sechs Spielen",
    excerpt:
      "Sechs kurze Partien an einem Vormittag: Beim Turniertag in Lauda holte die " +
      "gemischte E-Jugend drei Siege gegen Buchen, Hardheim und die Tauberfranken.",
    category: "jugend",
    team: "gemischte-e-jugend",
    cover: "newsMinis",
    author: AUTHORS.moebus,
    tags: ["Jugend", "E-Jugend", "Turnier"],
    publishedAt: "2025-11-09T12:00:00+01:00",
    body: (img) =>
      body(
        p(
          "In der E-Jugend wird nicht über 60 Minuten gespielt, sondern im Format 4+1 auf " +
            "verkürztem Feld — dafür gleich mehrfach an einem Vormittag. Sechs Spiele " +
            "standen für unsere Minis auf dem Programm, drei davon gingen an Lauda.",
        ),
        list("bullet", [
          "TV Hardheim 1895 2 – ETSV Lauda 0:2",
          "ETSV Lauda – TSV 1863 Buchen 2 2:0",
          "TSV 1863 Buchen 2 – ETSV Lauda 0:2",
          "ETSV Lauda – TSV 1863 Buchen 0:2",
          "JSG Tauberfranken – ETSV Lauda 2:0",
          "ETSV Lauda – JSG Tauberfranken 0:2",
        ]),
        p(
          "Gewertet wird in dieser Altersklasse nicht nach Toren, sondern in Spielpunkten " +
            "— deshalb stehen in der Ergebnisliste 2:0 und 0:2 statt Torzahlen.",
        ),
        img("inlineBaelle", "Beim Turniertag sind sechs Spiele an einem Vormittag normal"),
        heading("h2", "Mitmachen ist einfach"),
        p(
          "Die Minis trainieren mittwochs von 15:30 bis 16:45 Uhr in der Sporthalle Lauda. " +
            "Kinder ab sechs Jahren können jederzeit dazukommen; Hallenschuhe reichen aus, " +
            "alles andere stellt der Verein.",
        ),
      ),
  },
  {
    slug: "saisonvorschau-2026-27",
    title: "Bezirksklasse, wir kommen: der Blick auf 2026/27",
    excerpt:
      "Neun Mannschaften, eine neue Spielklasse für die Herren und ein Trainingsauftakt " +
      "Mitte August — was die Saison 2026/27 für die Handballabteilung bereithält.",
    category: "vereinsnachricht",
    team: "maenner",
    cover: "newsVorschau",
    author: AUTHORS.hartmann,
    tags: ["Saison 2026/27", "Vorschau"],
    publishedDaysAgo: 5,
    body: (img) =>
      body(
        p(
          "Die Sommerpause geht zu Ende. Ab Mitte August wird in der Sporthalle Lauda " +
            "wieder trainiert, im September rollt der Ball dann auch in den Ligen. Ein " +
            "Überblick über das, was ansteht.",
        ),
        heading("h2", "Sechs Mannschaften am Start"),
        p(
          "Für die Runde 2026/27 hat die Abteilung sechs Mannschaften gemeldet: die " +
            "Herren, die männliche B- und C-Jugend, die weibliche A- und C-Jugend sowie " +
            "eine gemischte D-Jugend. Dazu kommt der Minibereich, der ohne feste " +
            "Ligazugehörigkeit an Turniertagen teilnimmt.",
        ),
        img("inlineNachtlauf", "Die Vorbereitung beginnt Mitte August"),
        heading("h2", "Neue Liga für die Herren"),
        p(
          "Nach der Meisterschaft spielt die erste Mannschaft in der Bezirksklasse " +
            "Gruppe 1. Die Gegner sind ungewohnt, die Wege teilweise weiter — sportlich " +
            "erwartet uns eine deutlich ausgeglichenere Staffel als im Vorjahr.",
        ),
        heading("h2", "Termine zum Vormerken"),
        list("bullet", [
          "Mitte August: Trainingsauftakt aller Mannschaften",
          "12. September: Saisoneröffnung mit Tag der offenen Halle",
          "19. September: erstes Heimspiel der Herren gegen TV Hardheim 1895",
        ]),
        p(
          "Alle Spieltermine stehen sobald verfügbar in der Spielübersicht. Die " +
            "Tabellen und Spielpläne kommen direkt von handball.net und aktualisieren " +
            "sich automatisch.",
        ),
      ),
  },
  {
    slug: "sommerfest-der-handballabteilung",
    title: "Sommerfest der Handballabteilung am 29. August",
    excerpt:
      "Grillen, Mixed-Turnier und die Ehrung der Meistermannschaft: Am letzten " +
      "Augustwochenende feiert die Abteilung auf dem Gelände Im Ramstal.",
    category: "events",
    cover: "newsSommerfest",
    author: AUTHORS.moebus,
    tags: ["Sommerfest", "Verein"],
    featured: true,
    publishedDaysAgo: 20,
    body: (img) =>
      body(
        p(
          "Am Samstag, 29. August, lädt die Handballabteilung zum Sommerfest auf das " +
            "Vereinsgelände Im Ramstal ein. Los geht es um 14 Uhr, für Essen und Getränke " +
            "ist gesorgt.",
        ),
        heading("h2", "Programm"),
        list("number", [
          "14:00 Uhr — Mixed-Turnier für alle Jahrgänge ab der D-Jugend",
          "16:30 Uhr — Spiel- und Spaßstationen für die Minis",
          "18:00 Uhr — Ehrung der Meistermannschaft 2025/26",
          "19:00 Uhr — gemütlicher Ausklang mit Grillbuffet",
        ]),
        img("inlineAufwaermen", "Das Mixed-Turnier ist für alle Jahrgänge ab der D-Jugend offen"),
        p(
          "Wer beim Mixed-Turnier mitspielen möchte, meldet sich bis zum 22. August per " +
            "E-Mail an handball@etsv-lauda.de. Mannschaften werden vor Ort ausgelost — " +
            "gespielt wird bewusst gemischt über alle Altersklassen hinweg.",
        ),
        p(
          "Helferinnen und Helfer für Auf- und Abbau sind herzlich willkommen. Wer eine " +
            "Stunde Zeit hat, meldet sich einfach bei der Abteilungsleitung.",
        ),
      ),
  },
  {
    slug: "saisoneroeffnung-am-12-september",
    title: "Saisoneröffnung am 12. September — Tag der offenen Halle",
    excerpt:
      "Zum Auftakt der Runde 2026/27 öffnet die Sporthalle Lauda für alle: " +
      "Schnuppertraining, Mannschaftsvorstellung und der Spielplan im Überblick.",
    category: "termine",
    cover: "newsSaisonstart",
    author: AUTHORS.hartmann,
    tags: ["Termine", "Saison 2026/27"],
    publishedDaysAgo: 2,
    body: (img) =>
      body(
        p(
          "Am Samstag, 12. September, startet die Handballabteilung mit einem Tag der " +
            "offenen Halle in die Saison 2026/27. Von 10 bis 16 Uhr stellen sich alle " +
            "Mannschaften vor, dazwischen gibt es Schnuppertrainings für jede Altersklasse.",
        ),
        img("inlineHalle", "Die Sporthalle Lauda ist am 12. September für alle geöffnet"),
        heading("h2", "Für Einsteigerinnen und Einsteiger"),
        p(
          "Wer Handball noch nie ausprobiert hat, ist genau richtig: Für die Jahrgänge " +
            "2014 bis 2020 gibt es stündlich eine offene Einheit. Anmeldung ist nicht " +
            "nötig, Hallenschuhe genügen.",
        ),
        heading("h2", "Die ersten Spieltage"),
        list("bullet", [
          "19. September — Herren gegen TV Hardheim 1895 (Heimspiel)",
          "27. September — Herren beim TSV 1863 Buchen",
          "3. Oktober — männliche B-Jugend gegen JSG Tauberfranken",
          "10. Oktober — weibliche A-Jugend bei HB Ludwigsburg",
        ]),
        p(
          "Die vollständige Übersicht aller Mannschaften mit Spielplan und Tabelle steht " +
            "in der Spielübersicht bereit.",
        ),
      ),
  },
];

export async function seedNews(
  payload: Payload,
  media: MediaMap,
  teams: TeamMap,
  categories: Map<string, number>,
): Promise<number> {
  log.step(`News (${NEWS_SEEDS.length})`);
  const tally = new Tally();

  const img = (key: ImageKey, caption?: string): LexNode => {
    const id = media.get(key);
    if (id == null) throw new Error(`Bild "${key}" fehlt in der Medien-Zuordnung`);
    return image(id, caption);
  };

  for (const seed of NEWS_SEEDS) {
    const categoryId = categories.get(seed.category);
    if (!categoryId) {
      log.warn(`Kategorie "${seed.category}" nicht gefunden — "${seed.slug}" übersprungen`);
      continue;
    }
    const coverImage = media.get(seed.cover);
    if (!coverImage) throw new Error(`Titelbild "${seed.cover}" fehlt`);

    const ctaTeamId = seed.ctaTeam ? teams.get(seed.ctaTeam.slug) : undefined;

    const data = {
      title: seed.title,
      slug: seed.slug,
      excerpt: seed.excerpt,
      coverImage,
      category: categoryId,
      team: seed.team ? teams.get(seed.team) : undefined,
      tags: seed.tags.map((value) => ({ value })),
      author: {
        name: seed.author.name,
        role: seed.author.role,
        avatar: media.get(seed.author.avatar),
      },
      body: seed.body(img),
      relatedCta:
        seed.ctaTeam && ctaTeamId
          ? {
              link: {
                type: "reference" as const,
                reference: { relationTo: "teams" as const, value: ctaTeamId },
                label: seed.ctaTeam.label,
                appearance: "arrow" as const,
              },
            }
          : undefined,
      publishedAt: seed.publishedAt
        ? new Date(seed.publishedAt).toISOString()
        : daysAgo(seed.publishedDaysAgo ?? 0),
      featured: seed.featured ?? false,
      _status: "published" as const,
    };

    const existing = await findFirst(payload, "news", { slug: { equals: seed.slug } });

    if (existing) {
      await payload.update({ collection: "news", id: existing.id, data, ...WRITE_OPTS });
      tally.add(false);
    } else {
      await payload.create({ collection: "news", data, ...WRITE_OPTS });
      tally.add(true);
    }
    log.ok(`/news/${seed.slug}`);
  }

  log.info(tally.summary);
  return NEWS_SEEDS.length;
}
