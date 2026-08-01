import type { Block } from "payload";

import { sectionFields } from "@/fields/section";

/**
 * „Ueber den Verein“: Ueberschrift, gelbe Unterzeile, ein Textblock (maximal
 * 768px breit) und rechts daneben die verlinkten Mannschaften als Pfeil-Liste.
 */
export const AboutBlock: Block = {
  slug: "about",
  interfaceName: "AboutBlock",
  dbName: ({ tableName }) => `${tableName}_b_about`,
  labels: { singular: "Ueber den Verein", plural: "Ueber den Verein" },
  fields: [
    {
      name: "headline",
      type: "text",
      required: true,
      label: "Ueberschrift",
      defaultValue: "Über den Verein",
      admin: { description: "Wird gross, kursiv und in Grossbuchstaben gesetzt." },
    },
    {
      name: "subline",
      type: "text",
      label: "Unterzeile",
      admin: { description: "Optional. Gelbe Zeile unter der Ueberschrift." },
    },
    {
      name: "text",
      type: "textarea",
      required: true,
      label: "Text",
      admin: {
        description:
          "Kurze Vorstellung des Vereins. Wird auf maximal 768px Breite umbrochen — " +
          "zwei bis drei Absaetze wirken am besten.",
      },
    },
    {
      name: "teams",
      type: "relationship",
      relationTo: "teams",
      hasMany: true,
      label: "Verlinkte Mannschaften",
      admin: {
        description:
          "Erscheinen als Liste mit gelbem Pfeil. Die Reihenfolge hier bestimmt die Anzeige.",
      },
    },
    sectionFields("backgroundDark"),
  ],
};
