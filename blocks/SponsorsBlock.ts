import type { Block } from "payload";

import { sectionFields } from "@/fields/section";

/**
 * Sponsorenabschnitt fuer beliebige Seiten. Die Daten kommen aus der
 * Collection `sponsors` — hier wird nur bestimmt, wie viele und in welcher
 * Darstellung.
 */
export const SponsorsBlock: Block = {
  slug: "sponsorsBlock",
  interfaceName: "SponsorsBlock",
  dbName: ({ tableName }) => `${tableName}_b_spons`,
  labels: { singular: "Sponsoren", plural: "Sponsoren" },
  fields: [
    {
      name: "headline",
      type: "text",
      required: true,
      label: "Ueberschrift",
      defaultValue: "Sponsoren",
      admin: { description: "Wird gross, kursiv und in Grossbuchstaben gesetzt." },
    },
    {
      name: "subline",
      type: "text",
      label: "Unterzeile",
      admin: { description: "Optional. Gelbe Zeile unter der Ueberschrift." },
    },
    {
      name: "variant",
      type: "select",
      label: "Darstellung",
      defaultValue: "logos",
      options: [
        { label: "Nur Logos (kompakt)", value: "logos" },
        { label: "Logo mit Beschreibung (abwechselnd)", value: "detailed" },
      ],
      admin: {
        description:
          "„Nur Logos“ passt als Streifen unter andere Abschnitte, " +
          "„Logo mit Beschreibung“ entspricht der Sponsorenseite.",
      },
    },
    {
      name: "limit",
      type: "number",
      label: "Anzahl Sponsoren",
      min: 1,
      max: 30,
      admin: {
        description: "Optional. Ohne Angabe werden alle Sponsoren angezeigt.",
      },
    },
    sectionFields("textureLight"),
  ],
};
