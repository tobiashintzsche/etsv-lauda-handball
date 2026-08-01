import type { CollectionConfig } from "payload";

import { makeSlugField } from "@/fields/slug";
import { revalidateCollection, revalidateCollectionDelete } from "@/lib/payload-hooks/revalidate";

type CategoryDoc = { id: string | number; slug?: string | null };

/**
 * Rubriken der News — Spielbericht, Vereinsnachricht, Jugend, Termine, Events.
 * Dienen als Chip auf der Karte und als Filter auf der Uebersichtsseite.
 */
export const NewsCategories: CollectionConfig = {
  slug: "newsCategories",
  labels: { singular: "News-Kategorie", plural: "News-Kategorien" },
  defaultSort: "sortOrder",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "sortOrder"],
    group: "Inhalte",
    description: "Rubriken, nach denen sich News filtern lassen.",
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateCollection<CategoryDoc>("newsCategories", (d) => d.slug)],
    afterDelete: [revalidateCollectionDelete<CategoryDoc>("newsCategories", (d) => d.slug)],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Bezeichnung",
      admin: { description: "Wird auf der News-Karte und im Filter angezeigt." },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Reihenfolge",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Kleinere Zahlen stehen im Filter weiter vorne.",
      },
    },
    makeSlugField("name"),
  ],
};
