import type { CollectionConfig } from "payload";

import { makeSlugField } from "@/fields/slug";
import { revalidateCollection, revalidateCollectionDelete } from "@/lib/payload-hooks/revalidate";
import { livePreviewUrl } from "@/lib/preview";

type TeamDoc = { id: string | number; slug?: string | null };

const WEEKDAYS = [
  { label: "Montag", value: "mo" },
  { label: "Dienstag", value: "di" },
  { label: "Mittwoch", value: "mi" },
  { label: "Donnerstag", value: "do" },
  { label: "Freitag", value: "fr" },
  { label: "Samstag", value: "sa" },
  { label: "Sonntag", value: "so" },
];

/**
 * Die Mannschaften des Vereins. Jede bekommt unter /mannschaften/<slug> eine
 * eigene Seite mit Foto, Trainingszeiten, Kader, Spielen und Ligatabelle —
 * diese Seite ist fest aufgebaut und nutzt keine Bausteine.
 */
export const Teams: CollectionConfig = {
  slug: "teams",
  labels: { singular: "Mannschaft", plural: "Mannschaften" },
  defaultSort: "sortOrder",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "liga", "sortOrder", "updatedAt"],
    group: "Verein",
    description: "Alle Mannschaften mit Trainingszeiten, Kontakt und handball.net-Anbindung.",
    listSearchableFields: ["name", "liga", "slug"],
    livePreview: {
      url: ({ data }) => livePreviewUrl(`/mannschaften/${data?.slug ?? ""}`),
    },
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateCollection<TeamDoc>("teams", (d) => d.slug)],
    afterDelete: [revalidateCollectionDelete<TeamDoc>("teams", (d) => d.slug)],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      index: true,
      label: "Name",
      admin: { description: "Kurzform wie „Herren“, „männl. B-Jugend“ oder „weibl. A-Jugend“." },
    },
    {
      name: "liga",
      type: "text",
      label: "Liga",
      admin: {
        description:
          "Ausgeschriebene Spielklasse, z.B. „Bezirksklasse Gruppe 1“. Erscheint als " +
          "gelbe Zeile unter dem Mannschaftsnamen.",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Vorstellung",
          fields: [
            {
              name: "teamImage",
              type: "upload",
              relationTo: "media",
              label: "Mannschaftsfoto",
              admin: { description: "Querformat. Steht rechts neben dem Vorstellungstext." },
            },
            {
              name: "teamImageCaption",
              type: "text",
              label: "Bildunterschrift",
              admin: {
                description: "Optional, z.B. „Mannschaftsfoto Saison 2026/27“.",
              },
            },
            {
              name: "introductionText",
              type: "textarea",
              label: "Vorstellungstext",
              admin: {
                description: "Kurze Vorstellung der Mannschaft — Ziele, Besetzung, Saisonverlauf.",
              },
            },
          ],
        },
        {
          label: "Informationen",
          fields: [
            {
              name: "trainingTimes",
              type: "array",
              label: "Trainingszeiten",
              labels: { singular: "Trainingszeit", plural: "Trainingszeiten" },
              admin: {
                initCollapsed: false,
                description: "Je Trainingstag einen Eintrag anlegen.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "day",
                      type: "select",
                      required: true,
                      label: "Wochentag",
                      options: WEEKDAYS,
                      admin: { width: "34%" },
                    },
                    {
                      name: "timeFrom",
                      type: "text",
                      required: true,
                      label: "von",
                      admin: { width: "33%", description: "Format HH:MM, z.B. 18:30." },
                    },
                    {
                      name: "timeTo",
                      type: "text",
                      required: true,
                      label: "bis",
                      admin: { width: "33%", description: "Format HH:MM, z.B. 20:00." },
                    },
                  ],
                },
                {
                  name: "location",
                  type: "text",
                  label: "Ort",
                  defaultValue: "Sporthalle Lauda",
                  admin: { description: "Halle oder Trainingsort." },
                },
              ],
            },
            {
              name: "contacts",
              type: "array",
              label: "Kontakt",
              labels: { singular: "Kontaktangabe", plural: "Kontaktangaben" },
              admin: {
                initCollapsed: false,
                description: "Ansprechpartner der Mannschaft — Trainer, Betreuer, Telefon.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "label",
                      type: "text",
                      required: true,
                      label: "Bezeichnung",
                      admin: { width: "40%", description: "z.B. „Trainer“ oder „Telefon“." },
                    },
                    {
                      name: "value",
                      type: "text",
                      required: true,
                      label: "Angabe",
                      admin: { width: "60%", description: "Name, Telefonnummer oder E-Mail." },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "handball.net",
          description:
            "Verbindung zur offiziellen Spielplan- und Tabellenquelle. Die IDs stehen " +
            "in der Adresszeile auf handball.net.",
          fields: [
            {
              name: "handballNet",
              type: "group",
              label: "handball.net",
              fields: [
                {
                  name: "teamId",
                  type: "text",
                  label: "Team-ID",
                  admin: {
                    description:
                      "z.B. handball4all.baden-wuerttemberg.1451711 — steht in der Adresse " +
                      "der Mannschaftsseite auf handball.net.",
                  },
                },
                {
                  name: "tournamentId",
                  type: "text",
                  label: "Liga-ID",
                  admin: {
                    description:
                      "z.B. handball4all.baden-wuerttemberg.m-bk-1-nf_nf — wird fuer die " +
                      "Ligatabelle benoetigt.",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "showNextGames",
                  type: "checkbox",
                  label: "Naechste Spiele anzeigen",
                  defaultValue: true,
                  admin: {
                    width: "50%",
                    description: "Blendet den Spiele-Abschnitt auf der Mannschaftsseite ein.",
                  },
                },
                {
                  name: "showTable",
                  type: "checkbox",
                  label: "Ligatabelle anzeigen",
                  defaultValue: true,
                  admin: {
                    width: "50%",
                    description: "Setzt eine hinterlegte Liga-ID voraus.",
                  },
                },
              ],
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
        description: "Kleinere Zahlen stehen in Listen und im Menue weiter oben.",
      },
    },
    makeSlugField("name"),
  ],
};
