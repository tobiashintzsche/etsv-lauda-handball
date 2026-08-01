/**
 * Every user-facing string that is not editable in the CMS.
 *
 * The site is German-only, so this replaces an i18n library. Keep it a plain
 * typed object — no runtime lookup, no message catalogue, full autocomplete.
 *
 * Anything an editor should be able to change belongs in Payload instead
 * (site-settings, navigation, block fields), not here.
 */
export const strings = {
  common: {
    skipToContent: "Zum Inhalt springen",
    menu: "Menü",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    back: "Zurück",
    search: "Suche",
    loading: "Wird geladen …",
    more: "Mehr",
  },

  nav: {
    instagram: "Instagram",
    facebook: "Facebook",
    home: "Startseite",
  },

  hero: {
    /** Accessible name of the whole slider region. */
    label: "Aktuelle Beiträge",
    allNews: "Alle News",
    slide: (index: number, total: number) => `Beitrag ${index} von ${total}`,
  },

  news: {
    overviewTitle: "Alle News",
    sectionHeadline: "News",
    allNews: "Zu allen News",
    filterSearch: "Suche",
    filterPeriod: "Zeitraum",
    filterCategory: "Kategorie",
    filterReset: "Filter zurücksetzen",
    readingTime: (minutes: number) => `${minutes} Min. Lesezeit`,
    empty: "Für diese Auswahl gibt es noch keine Beiträge.",
    relatedHeadline: "Weitere News",
    previousPage: "Vorherige Seite",
    nextPage: "Nächste Seite",
  },

  teams: {
    informationHeadline: "Informationen",
    trainingHeadline: "Trainingszeiten",
    contactHeadline: "Kontakt",
    playersHeadline: "Unsere Spieler",
    noPlayers: "Der Kader wird gerade zusammengestellt.",
  },

  games: {
    headline: "Nächste Spiele",
    home: "Heimspiele",
    away: "Auswärtsspiele",
    empty: "Aktuell sind keine Spiele angesetzt.",
    emptyHome: "Zurzeit keine Heimspiele angesetzt.",
    emptyAway: "Zurzeit keine Auswärtsspiele angesetzt.",
  },

  schedule: {
    title: "Spielübersicht",
    subline: "Alle Mannschaften – alle Spiele",
  },

  table: {
    headline: "Ligatabelle",
    rank: "Platz",
    club: "Verein",
    points: "Punkte",
    goals: "Tore",
    balance: "Bilanz",
    empty: "Es liegen noch keine Tabellendaten vor — die Saison 2026/27 startet im September.",
  },

  handball: {
    attributionButton: "Zu den Tabellen",
    poweredBy: "powered by",
    sourceName: "handball.net",
  },

  sponsors: {
    title: "Sponsoren",
    visitWebsite: "Website besuchen",
    empty: "Unsere Partner werden hier in Kürze vorgestellt.",
  },

  footer: {
    memberPreHeadline: "ETSV Lauda",
    memberHeadline: "Jetzt Mitglied werden",
  },

  errors: {
    notFoundTitle: "Seite nicht gefunden",
    notFoundText:
      "Diese Seite gibt es nicht (mehr). Vielleicht hilft ein Blick auf die Startseite weiter.",
    notFoundCta: "Zur Startseite",
    genericTitle: "Da ist etwas schiefgelaufen",
    genericText: "Bitte versuche es später noch einmal.",
    retry: "Erneut versuchen",
  },
} as const;
