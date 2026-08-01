import type { CollectionConfig } from "payload";

import { revalidateCollection, revalidateCollectionDelete } from "@/lib/payload-hooks/revalidate";

/**
 * Sponsoren und Partner des Vereins. Erscheinen auf /sponsoren und optional
 * als Baustein auf anderen Seiten.
 */
export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  labels: { singular: "Sponsor", plural: "Sponsoren" },
  defaultSort: "sortOrder",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "website", "sortOrder"],
    group: "Verein",
    description: "Partner und Foerderer des Vereins.",
    listSearchableFields: ["name"],
  },
  access: { read: () => true },
  hooks: {
    afterChange: [revalidateCollection("sponsors")],
    afterDelete: [revalidateCollectionDelete("sponsors")],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Name",
      admin: { description: "Firmenname, z.B. „Distelhäuser Brauerei“." },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Logo",
      admin: {
        description:
          "Am besten als PNG mit transparentem Hintergrund. Wird auf hellem Grund gezeigt.",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Beschreibung",
      admin: {
        description: "Ein bis zwei Saetze zum Unternehmen und zur Partnerschaft.",
      },
    },
    {
      name: "website",
      type: "text",
      label: "Website",
      admin: {
        description: "Vollstaendige Adresse inkl. https:// — das Logo wird darauf verlinkt.",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Reihenfolge",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Kleinere Zahlen stehen weiter oben.",
      },
    },
  ],
};
