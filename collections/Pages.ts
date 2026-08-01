import type { CollectionConfig } from "payload";

import { pageBlocks } from "@/blocks";
import { makeSlugField } from "@/fields/slug";
import { revalidateCollection, revalidateCollectionDelete } from "@/lib/payload-hooks/revalidate";
import { livePreviewUrl } from "@/lib/preview";

type PageDoc = { id: string | number; slug?: string | null };

/**
 * Frei zusammenstellbare Seiten (Startseite, Ueber den Verein, Kontakt,
 * Impressum …). Der Inhalt entsteht aus Bausteinen — siehe `blocks/`.
 *
 * Die Startseite ist die Seite mit dem Slug „home“; sie liegt unter „/“.
 */
export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Seite", plural: "Seiten" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    group: "Inhalte",
    description: "Seiten mit frei kombinierbaren Bausteinen.",
    listSearchableFields: ["title", "slug"],
    livePreview: {
      url: ({ data }) => {
        const slug = data?.slug === "home" ? "" : (data?.slug ?? "");
        return livePreviewUrl(`/${slug}`);
      },
    },
  },
  versions: {
    drafts: { autosave: true, schedulePublish: true },
    maxPerDoc: 20,
  },
  access: {
    // Gaeste sehen ausschliesslich veroeffentlichte Seiten.
    read: ({ req: { user } }) => {
      if (user) return true;
      return { _status: { equals: "published" } };
    },
  },
  hooks: {
    afterChange: [revalidateCollection<PageDoc>("pages", (d) => d.slug)],
    afterDelete: [revalidateCollectionDelete<PageDoc>("pages", (d) => d.slug)],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      index: true,
      label: "Seitentitel",
      admin: {
        description: "Interner und angezeigter Titel der Seite, z.B. „Ueber den Verein“.",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Inhalt",
          description: "Die Bausteine, aus denen die Seite besteht — von oben nach unten.",
          fields: [
            {
              name: "layout",
              type: "blocks",
              label: "Bausteine",
              blocks: pageBlocks,
              admin: {
                initCollapsed: true,
                description:
                  "Bausteine per Drag-and-drop sortieren. Jeder Baustein hat unten " +
                  "eine Einstellung fuer seinen Hintergrund.",
              },
            },
          ],
        },
      ],
    },
    makeSlugField("title"),
  ],
};
