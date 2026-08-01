import type { Block } from "payload";

import { sectionFields } from "@/fields/section";

/**
 * „Mehr als Handball“: vierspaltiges Bildraster auf Beton-Textur. Auf dem
 * Handy wird daraus eine horizontale Scroll-Leiste — der Anschnitt ist Absicht.
 */
export const ImageGridBlock: Block = {
  slug: "imageGrid",
  interfaceName: "ImageGridBlock",
  dbName: ({ tableName }) => `${tableName}_b_imggrid`,
  labels: { singular: "Bilderraster", plural: "Bilderraster" },
  fields: [
    {
      name: "headline",
      type: "text",
      required: true,
      label: "Ueberschrift",
      defaultValue: "Mehr als Handball",
      admin: { description: "Wird gross, kursiv und in Grossbuchstaben gesetzt." },
    },
    {
      name: "subline",
      type: "text",
      label: "Unterzeile",
      admin: { description: "Optional. Gelbe Zeile unter der Ueberschrift." },
    },
    {
      name: "images",
      type: "array",
      minRows: 1,
      maxRows: 12,
      label: "Bilder",
      labels: { singular: "Bild", plural: "Bilder" },
      admin: {
        initCollapsed: true,
        description: "Vier Bilder fuellen auf dem Desktop genau eine Reihe.",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
          label: "Bild",
          admin: { description: "Querformat empfohlen — die Kacheln sind gleich hoch." },
        },
        {
          name: "caption",
          type: "text",
          label: "Bildunterschrift",
          admin: { description: "Optional. Kleine Zeile unter dem Bild." },
        },
      ],
    },
    sectionFields("texture"),
  ],
};
