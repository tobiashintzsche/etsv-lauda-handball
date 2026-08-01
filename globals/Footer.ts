import type { GlobalConfig } from "payload";

import { link } from "@/fields/link";
import { revalidateGlobal } from "@/lib/payload-hooks/revalidate";

/**
 * Der Fussbereich: eine Linkliste und rechts daneben die Mitglieder-Karte.
 */
export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Footer",
  admin: {
    group: "Einstellungen",
    description: "Links und Mitglieder-Karte am Seitenende.",
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal("footer")] },
  fields: [
    {
      name: "links",
      type: "array",
      label: "Links",
      labels: { singular: "Link", plural: "Links" },
      admin: {
        initCollapsed: true,
        description: "z.B. Spieluebersicht, Zum Hauptverein, Impressum, Kontakt.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Beschriftung",
        },
        link({ appearances: false, disableLabel: true }),
      ],
    },
    {
      name: "memberCard",
      type: "group",
      label: "Mitglieder-Karte",
      admin: {
        description: "Der Kasten rechts im Footer, der zur Mitgliedschaft einlaedt.",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Hintergrundbild",
          admin: {
            description:
              "Optional. Ohne Angabe wird das Vereinswappen verwendet. Ueber dem Bild " +
              "liegt ein dunkler Verlauf, damit der Text lesbar bleibt.",
          },
        },
        {
          name: "preHeadline",
          type: "text",
          defaultValue: "ETSV Lauda",
          label: "Kleinzeile",
          admin: { description: "Kurze Zeile ueber der Ueberschrift, in Grossbuchstaben." },
        },
        {
          name: "headline",
          type: "text",
          defaultValue: "Jetzt Mitglied werden",
          label: "Ueberschrift",
          admin: { description: "Der Aufruf selbst." },
        },
        link({ required: false, appearances: false, disableLabel: true }),
      ],
    },
  ],
};
