import type { Block } from "payload";

import { sectionFields } from "@/fields/section";

/**
 * Ligatabelle. Mannschaftsname und Liga stehen am Team-Dokument, die Zahlen
 * kommen live von handball.net (siehe `lib/handball/`). Unter der Tabelle steht
 * verpflichtend die handball.net-Quellenangabe.
 */
export const LeagueTableBlock: Block = {
  slug: "leagueTable",
  interfaceName: "LeagueTableBlock",
  dbName: ({ tableName }) => `${tableName}_b_table`,
  labels: { singular: "Ligatabelle", plural: "Ligatabellen" },
  fields: [
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      required: true,
      label: "Mannschaft",
      admin: {
        description:
          "Die Tabelle der Liga dieser Mannschaft wird angezeigt. Voraussetzung: " +
          "am Team ist unter „handball.net“ die Liga-ID hinterlegt.",
      },
    },
    {
      name: "headline",
      type: "text",
      label: "Ueberschrift",
      admin: {
        description: "Optional. Ohne Angabe steht der Mannschaftsname ueber der Tabelle.",
      },
    },
    sectionFields("primary"),
  ],
};
