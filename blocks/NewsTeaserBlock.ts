import type { Block } from "payload";

import { sectionFields } from "@/fields/section";

/**
 * News-Teaser: Abschnittskopf „NEWS / ZU ALLEN NEWS →“ plus die vier neuesten
 * Beitraege. Die Daten holt `NewsTeaserServer.tsx` — der Block selbst braucht
 * fast keine Einstellungen.
 */
export const NewsTeaserBlock: Block = {
  slug: "newsTeaser",
  interfaceName: "NewsTeaserBlock",
  dbName: ({ tableName }) => `${tableName}_b_news`,
  labels: { singular: "News-Teaser", plural: "News-Teaser" },
  fields: [
    {
      name: "headline",
      type: "text",
      label: "Ueberschrift",
      defaultValue: "News",
      admin: { description: "Standard: „News“." },
    },
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      label: "Nur News dieser Mannschaft",
      admin: {
        description:
          "Optional. Leer lassen, um die neuesten Beitraege aller Mannschaften zu zeigen.",
      },
    },
    {
      name: "limit",
      type: "number",
      label: "Anzahl Beitraege",
      defaultValue: 4,
      min: 1,
      max: 8,
      admin: {
        description: "Wie viele News-Karten angezeigt werden. Das Design ist auf 4 ausgelegt.",
      },
    },
    {
      name: "showAllLink",
      type: "checkbox",
      label: "Link „Zu allen News“ anzeigen",
      defaultValue: true,
      admin: { description: "Fuehrt auf die Uebersichtsseite /news." },
    },
    sectionFields("primary"),
  ],
};
