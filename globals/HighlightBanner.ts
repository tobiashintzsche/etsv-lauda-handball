import type { GlobalConfig } from "payload";

import { revalidateGlobal } from "@/lib/payload-hooks/revalidate";

/**
 * Die weisse Leiste direkt unter dem Header auf der Startseite. Zeigt entweder
 * ein Spiel (mit Ergebnis, sobald eingetragen) oder einen freien Termin.
 */
export const HighlightBanner: GlobalConfig = {
  slug: "highlight-banner",
  label: "Matchday-Leiste",
  admin: {
    group: "Einstellungen",
    description: "Die helle Leiste unter dem Header auf der Startseite.",
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal("highlight-banner")] },
  fields: [
    {
      name: "active",
      type: "checkbox",
      label: "Leiste anzeigen",
      defaultValue: false,
      admin: {
        description:
          "Solange nicht aktiviert, erscheint die Leiste nicht — z.B. in der Saisonpause.",
      },
    },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "game",
      label: "Inhalt",
      options: [
        { label: "Spiel", value: "game" },
        { label: "Termin", value: "event" },
      ],
      admin: {
        description: "Bestimmt, welche Felder darunter ausgefuellt werden muessen.",
        condition: (data) => Boolean(data?.active),
      },
    },
    {
      name: "game",
      type: "relationship",
      relationTo: "games",
      label: "Spiel",
      admin: {
        description:
          "Das anzuzeigende Spiel. Ist beim Spiel ein Ergebnis eingetragen, zeigt die " +
          "Leiste den Endstand, sonst Datum und Anwurfzeit.",
        condition: (data) => Boolean(data?.active) && data?.type === "game",
      },
      validate: (value: unknown, { data }: { data: Record<string, unknown> }) => {
        if (data?.active && data?.type === "game" && !value) {
          return "Bitte ein Spiel auswaehlen.";
        }
        return true;
      },
    },
    {
      name: "event",
      type: "group",
      label: "Termin",
      admin: {
        condition: (data) => Boolean(data?.active) && data?.type === "event",
      },
      fields: [
        {
          name: "preHeadline",
          type: "text",
          label: "Kleinzeile",
          admin: { description: "Kurze Einordnung, z.B. „Vereinsfest“." },
        },
        {
          name: "headline",
          type: "text",
          label: "Ueberschrift",
          admin: { description: "Der Termin in wenigen Worten." },
        },
        {
          type: "row",
          fields: [
            {
              name: "date",
              type: "date",
              label: "Datum",
              admin: {
                width: "50%",
                date: { pickerAppearance: "dayAndTime" },
              },
            },
            {
              name: "location",
              type: "text",
              label: "Ort",
              admin: { width: "50%", description: "z.B. „Sporthalle Lauda“." },
            },
          ],
        },
      ],
    },
  ],
};
