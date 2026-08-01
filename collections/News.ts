import type { CollectionConfig } from "payload";
import type { Where } from "payload";

import { UploadFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

import { link } from "@/fields/link";
import { makeSlugField } from "@/fields/slug";
import { calculateReadingTime } from "@/lib/payload-hooks/calculateReadingTime";
import { revalidateCollection, revalidateCollectionDelete } from "@/lib/payload-hooks/revalidate";
import { livePreviewUrl } from "@/lib/preview";

type NewsDoc = { id: string | number; slug?: string | null };

/**
 * Nachrichten des Vereins: Spielberichte, Vereinsnachrichten, Termine.
 *
 * Sichtbarkeit ist doppelt bedingt — das Dokument muss veroeffentlicht sein
 * UND das Veroeffentlichungsdatum darf nicht in der Zukunft liegen. So lassen
 * sich Beitraege vorbereiten und terminieren.
 */
export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "News-Beitrag", plural: "News" },
  defaultSort: "-publishedAt",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    group: "Inhalte",
    description: "Spielberichte, Vereinsnachrichten und Termine.",
    listSearchableFields: ["title", "excerpt", "slug"],
    livePreview: {
      url: ({ data }) => livePreviewUrl(`/news/${data?.slug ?? ""}`),
    },
  },
  versions: {
    drafts: { autosave: false, schedulePublish: true },
    maxPerDoc: 25,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      const where: Where = {
        and: [
          { _status: { equals: "published" } },
          { publishedAt: { less_than_equal: new Date().toISOString() } },
        ],
      };
      return where;
    },
  },
  hooks: {
    beforeChange: [calculateReadingTime],
    afterChange: [revalidateCollection<NewsDoc>("news", (d) => d.slug)],
    afterDelete: [revalidateCollectionDelete<NewsDoc>("news", (d) => d.slug)],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      index: true,
      label: "Titel",
      admin: { description: "Ueberschrift des Beitrags — erscheint auch auf der News-Karte." },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 300,
      label: "Teaser",
      admin: {
        description:
          "Ein bis zwei Saetze Anreisser. Erscheint auf der News-Karte und als " +
          "Beschreibung in Suchmaschinen und beim Teilen.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Titelbild",
      admin: {
        description: "Querformat (etwa 16:9). Wird auf der Karte und ueber dem Artikel gezeigt.",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "newsCategories",
      required: true,
      index: true,
      label: "Kategorie",
      admin: { description: "Bestimmt den Chip auf der Karte und den Filter in der Uebersicht." },
    },
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      index: true,
      label: "Mannschaft",
      admin: {
        description:
          "Optional. Bei Spielberichten die betreffende Mannschaft waehlen — der " +
          "Beitrag erscheint dann auch auf deren Mannschaftsseite.",
      },
    },
    {
      name: "tags",
      type: "array",
      label: "Schlagworte",
      labels: { singular: "Schlagwort", plural: "Schlagworte" },
      admin: {
        initCollapsed: true,
        description: "Optional. Freie Stichworte, z.B. „Derby“ oder „Heimspiel“.",
      },
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
          label: "Schlagwort",
        },
      ],
    },
    {
      name: "author",
      type: "group",
      label: "Autor",
      admin: { description: "Wer den Beitrag geschrieben hat. Erscheint unter dem Artikel." },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "name",
              type: "text",
              label: "Name",
              admin: { width: "50%", description: "z.B. „Michael Weber“." },
            },
            {
              name: "role",
              type: "text",
              label: "Funktion",
              admin: { width: "50%", description: "z.B. „Abteilungsleiter“ oder „Pressewart“." },
            },
          ],
        },
        {
          name: "avatar",
          type: "upload",
          relationTo: "media",
          label: "Foto",
          admin: { description: "Optional. Kleines rundes Portraitfoto." },
        },
      ],
    },
    {
      name: "body",
      type: "richText",
      required: true,
      label: "Artikeltext",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: "caption",
                    type: "text",
                    label: "Bildunterschrift",
                    admin: {
                      description: "Optional. Erscheint klein unter dem Bild im Artikel.",
                    },
                  },
                ],
              },
            },
          }),
        ],
      }),
      admin: {
        description:
          "Der eigentliche Beitrag. Bilder lassen sich direkt im Text einfuegen und " +
          "mit einer Bildunterschrift versehen.",
      },
    },
    {
      name: "relatedCta",
      type: "group",
      label: "Handlungsaufruf",
      admin: {
        description: "Optionaler Link am Ende des Artikels, z.B. auf die Mannschaftsseite.",
      },
      fields: [link({ required: false, appearances: ["primary", "arrow"] })],
    },

    // ─── Sidebar ──────────────────────────────────────────────────────────────
    {
      name: "publishedAt",
      type: "date",
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      label: "Veroeffentlicht am",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description:
          "Datum und Uhrzeit der Veroeffentlichung. Liegt der Zeitpunkt in der Zukunft, " +
          "ist der Beitrag bis dahin nicht oeffentlich sichtbar.",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Hervorheben",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Hervorgehobene Beitraege werden in Teasern bevorzugt angezeigt.",
      },
    },
    {
      name: "readingTime",
      type: "number",
      label: "Lesezeit (Minuten)",
      admin: {
        position: "sidebar",
        description:
          "Wird beim Speichern automatisch berechnet. Zum manuellen Setzen die " +
          "Option darunter aktivieren.",
      },
    },
    {
      name: "manualReadingTime",
      type: "checkbox",
      label: "Lesezeit manuell festlegen",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Verhindert, dass die Lesezeit beim Speichern ueberschrieben wird.",
      },
    },
    makeSlugField("title"),
  ],
};
