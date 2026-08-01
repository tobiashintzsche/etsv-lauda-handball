import type { CollectionConfig } from "payload";

import { revalidateCollection, revalidateCollectionDelete } from "@/lib/payload-hooks/revalidate";

/**
 * Spielerinnen und Spieler. Erscheinen als Karte im Abschnitt „Unsere Spieler“
 * auf der Seite ihrer Mannschaft.
 */
export const Players: CollectionConfig = {
  slug: "players",
  labels: { singular: "Spieler", plural: "Spieler" },
  defaultSort: "sortOrder",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "number", "position", "team", "sortOrder"],
    group: "Verein",
    description: "Kader der Mannschaften.",
    listSearchableFields: ["name"],
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateCollection("players")],
    afterDelete: [revalidateCollectionDelete("players")],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          label: "Name",
          admin: { width: "60%", description: "Vor- und Nachname." },
        },
        {
          name: "number",
          type: "number",
          label: "Rueckennummer",
          admin: {
            width: "40%",
            description: "Erscheint gross auf der gelben Leiste der Spielerkarte.",
          },
        },
      ],
    },
    {
      name: "position",
      type: "select",
      label: "Position",
      options: [
        { label: "Torwart", value: "torwart" },
        { label: "Linksaussen", value: "linksaussen" },
        { label: "Rueckraum links", value: "rueckraum-links" },
        { label: "Rueckraum Mitte", value: "rueckraum-mitte" },
        { label: "Rueckraum rechts", value: "rueckraum-rechts" },
        { label: "Rechtsaussen", value: "rechtsaussen" },
        { label: "Kreislaeufer", value: "kreislaeufer" },
      ],
      admin: { description: "Optional. Steht klein unter dem Namen auf der Spielerkarte." },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Foto",
      admin: {
        description:
          "Am besten ein Freisteller im Hochformat vor neutralem Hintergrund. " +
          "Dasselbe Bild dient vergroessert und abgedunkelt als Kartenhintergrund.",
      },
    },
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      required: true,
      index: true,
      label: "Mannschaft",
      admin: { description: "Auf deren Seite erscheint die Spielerkarte." },
    },
    {
      name: "stats",
      type: "group",
      label: "Saisonstatistik",
      admin: { description: "Optional. Zahlen der laufenden Saison." },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "gamesPlayed",
              type: "number",
              label: "Spiele",
              min: 0,
              admin: { width: "34%", description: "Anzahl absolvierter Spiele." },
            },
            {
              name: "goals",
              type: "number",
              label: "Tore",
              min: 0,
              admin: { width: "33%", description: "Erzielte Tore." },
            },
            {
              name: "twoMinutes",
              type: "number",
              label: "Zeitstrafen",
              min: 0,
              admin: { width: "33%", description: "Anzahl der Zwei-Minuten-Strafen." },
            },
          ],
        },
      ],
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Reihenfolge",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Kleinere Zahlen stehen im Kader weiter vorne.",
      },
    },
  ],
};
