import type { Block } from "payload";

import { anchorIdField } from "@/fields/section";

/**
 * „Naechste Spiele“ in zwei Spalten (Heim / Auswaerts). Die Spiele kommen aus
 * der Collection `games`; gezeigt werden immer die naechsten anstehenden.
 * Waehrend der Saisonpause laesst sich der Abschnitt ueber `active` abschalten,
 * ohne ihn loeschen zu muessen.
 */
export const NextGamesBlock: Block = {
  slug: "nextGames",
  interfaceName: "NextGamesBlock",
  dbName: ({ tableName }) => `${tableName}_b_games`,
  labels: { singular: "Naechste Spiele", plural: "Naechste Spiele" },
  fields: [
    {
      name: "headline",
      type: "text",
      required: true,
      label: "Ueberschrift",
      defaultValue: "Nächste Spiele",
      admin: { description: "Wird gross, kursiv und in Grossbuchstaben gesetzt." },
    },
    {
      name: "subline",
      type: "text",
      label: "Unterzeile",
      admin: { description: "Optional. Gelbe Zeile unter der Ueberschrift." },
    },
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      label: "Nur Spiele dieser Mannschaft",
      admin: {
        description: "Optional. Leer lassen, um die naechsten Spiele aller Mannschaften zu zeigen.",
      },
    },
    {
      name: "maxPerColumn",
      type: "number",
      label: "Spiele je Spalte",
      defaultValue: 3,
      min: 1,
      max: 6,
      admin: {
        description: "Wie viele Heim- bzw. Auswaertsspiele hoechstens angezeigt werden.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      label: "Abschnitt anzeigen",
      defaultValue: true,
      admin: {
        description:
          "In der Saisonpause abschalten — der Abschnitt verschwindet dann von der Seite, " +
          "die Einstellungen bleiben erhalten.",
      },
    },
    anchorIdField(),
  ],
};
