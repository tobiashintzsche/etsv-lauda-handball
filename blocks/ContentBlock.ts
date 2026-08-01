import type { Block } from "payload";

import { link } from "@/fields/link";
import { sectionFields } from "@/fields/section";

/**
 * Freier Textabschnitt mit optionalem Handlungsaufruf. Das Arbeitspferd fuer
 * Impressum, Kontakt, Vereinsgeschichte und aehnliche Seiten.
 */
export const ContentBlock: Block = {
  slug: "content",
  interfaceName: "ContentBlock",
  // dbName als Funktion: der Block darf in mehreren Collections auftauchen,
  // ohne dass sich die Tabellen gegenseitig ueberschreiben.
  dbName: ({ tableName }) => `${tableName}_b_content`,
  labels: { singular: "Textabschnitt", plural: "Textabschnitte" },
  fields: [
    {
      name: "headline",
      type: "text",
      label: "Ueberschrift",
      admin: {
        description: "Optional. Wird gross und kursiv ueber dem Text gesetzt.",
      },
    },
    {
      name: "subline",
      type: "text",
      label: "Unterzeile",
      admin: {
        description: "Optional. Gelbe Zeile unter der Ueberschrift.",
      },
    },
    {
      name: "richText",
      type: "richText",
      required: true,
      label: "Text",
      admin: {
        description: "Fliesstext mit Absaetzen, Listen und Links.",
      },
    },
    link({
      required: false,
      appearances: ["primary", "arrow"],
      overrides: {
        admin: {
          description: "Optionaler Button oder Pfeil-Link am Ende des Abschnitts.",
        },
      },
    }),
    sectionFields("primary"),
  ],
};
