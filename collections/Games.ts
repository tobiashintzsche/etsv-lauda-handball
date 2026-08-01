import type { CollectionConfig } from "payload";

import { revalidateCollection, revalidateCollectionDelete } from "@/lib/payload-hooks/revalidate";

/**
 * Spiele der Mannschaften. Speisen den Abschnitt „Naechste Spiele“ und die
 * Matchday-Leiste auf der Startseite.
 *
 * Das Ergebnis ist bewusst optional — Spiele werden vorab angelegt und der
 * Endstand spaeter nachgetragen.
 */
export const Games: CollectionConfig = {
  slug: "games",
  labels: { singular: "Spiel", plural: "Spiele" },
  defaultSort: "-date",
  admin: {
    useAsTitle: "opponent",
    defaultColumns: ["opponent", "team", "date", "homeAway"],
    group: "Verein",
    description: "Spielplan aller Mannschaften.",
    listSearchableFields: ["opponent", "venue"],
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateCollection("games")],
    afterDelete: [revalidateCollectionDelete("games")],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "team",
          type: "relationship",
          relationTo: "teams",
          required: true,
          index: true,
          label: "Mannschaft",
          admin: { width: "50%", description: "Welche unserer Mannschaften spielt." },
        },
        {
          name: "homeAway",
          type: "radio",
          required: true,
          defaultValue: "home",
          label: "Heim oder Auswaerts",
          options: [
            { label: "Heimspiel", value: "home" },
            { label: "Auswaertsspiel", value: "away" },
          ],
          admin: {
            width: "50%",
            layout: "horizontal",
            description: "Bestimmt die Spalte im Abschnitt „Naechste Spiele“.",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "opponent",
          type: "text",
          required: true,
          label: "Gegner",
          admin: { width: "60%", description: "Name des gegnerischen Vereins." },
        },
        {
          name: "opponentLogo",
          type: "upload",
          relationTo: "media",
          label: "Logo des Gegners",
          admin: { width: "40%", description: "Optional. Erscheint in der Matchday-Leiste." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "date",
          type: "date",
          required: true,
          index: true,
          label: "Anwurf",
          admin: {
            width: "50%",
            date: { pickerAppearance: "dayAndTime" },
            description: "Datum und Uhrzeit des Spielbeginns.",
          },
        },
        {
          name: "venue",
          type: "text",
          label: "Spielort",
          defaultValue: "Sporthalle Lauda",
          admin: { width: "50%", description: "Name der Halle, z.B. „Sporthalle Lauda“." },
        },
      ],
    },
    {
      name: "result",
      type: "group",
      label: "Ergebnis",
      admin: {
        description:
          "Nach dem Spiel nachtragen. Solange leer, gilt das Spiel als noch nicht gespielt.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "scoreFor",
              type: "number",
              label: "Tore ETSV Lauda",
              min: 0,
              admin: { width: "50%" },
            },
            {
              name: "scoreAgainst",
              type: "number",
              label: "Tore Gegner",
              min: 0,
              admin: { width: "50%" },
            },
          ],
        },
      ],
    },
  ],
};
