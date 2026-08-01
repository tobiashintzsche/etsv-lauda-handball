import type { MatchdayPostStatus, MatchdayPostType } from "./types";

/**
 * UI-Texte der Spieltagspost-Routen.
 *
 * Bewusst hier statt in `lib/strings.ts`: die Routen gehoeren zum
 * Redaktionswerkzeug, nicht zur oeffentlichen Website — und `lib/strings.ts`
 * liegt in fremder Dateihoheit.
 */
export const matchdayStrings = {
  overview: {
    title: "Spieltagsposts",
    intro:
      "Vorschlaege aus dem Spielplan. Ein Klick oeffnet den Post in Originalgroesse — " +
      "das fertige Bild gibt es als PNG.",
    empty: "Noch keine Vorschlaege. Erzeuge welche mit „pnpm posts:generate“.",
    games: (count: number) => `${count} ${count === 1 ? "Spiel" : "Spiele"}`,
  },
  detail: {
    back: "Alle Spieltagsposts",
    download: "PNG herunterladen (1080 × 1350)",
    caption: "Instagram-Text",
    notFound: "Spieltagspost nicht gefunden",
  },
  status: {
    vorschlag: "Vorschlag",
    freigegeben: "Freigegeben",
    verworfen: "Verworfen",
  } satisfies Record<MatchdayPostStatus, string>,
  postType: {
    heim: "Heimspiele",
    auswaerts: "Auswaertsspiele",
    gemischt: "Gemischt",
  } satisfies Record<MatchdayPostType, string>,
} as const;
