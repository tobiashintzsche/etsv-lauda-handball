import type { CollectionConfig } from "payload";

import { revalidateTags, revalidateTagsDelete } from "@/lib/payload-hooks/revalidate";

/**
 * Media documents have no cache tag of their own — they are depth-populated
 * into the results of every loader below. Changing an image, its alt text or
 * its focal point therefore has to purge those consumers, otherwise the swap
 * stays invisible until `CACHE_TTL_SECONDS` (1 h) expires.
 *
 * Keep this in sync with the `relationTo: "media"` fields across
 * `collections/` and `globals/`.
 */
const MEDIA_CONSUMER_TAGS = [
  "pages", // ImageGrid block, SEO images
  "news", // Titelbild, Inhaltsbilder
  "teams", // Mannschaftsfoto, Hero
  "players", // Spielerfreisteller
  "games", // Gegnerwappen
  "sponsors", // Sponsorenlogos
  "site-settings", // Vereinswappen, Fallback-Bilder
  "footer", // Footer-Logos
] as const;

/**
 * Zentrale Bilddatenbank: Mannschaftsfotos, Spielerfreisteller, News-Bilder,
 * Sponsorenlogos, Vereinswappen.
 *
 * Die Resize-Varianten werden als WebP (Qualitaet 82) gespeichert — visuell
 * identisch zu JPEG bei rund 60% kleinerer Datei. Das Original bleibt
 * unveraendert liegen.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Bild", plural: "Medien" },
  admin: {
    group: "System",
    description: "Alle Bilder der Website — einmal hochladen, ueberall verwenden.",
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 82 } },
      },
      {
        name: "card",
        width: 768,
        height: 512,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 82 } },
      },
      {
        name: "hero",
        width: 1920,
        height: 1080,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 82 } },
      },
      {
        // Hochformat fuer Spielerfreisteller und Portraits.
        name: "portrait",
        width: 600,
        height: 800,
        position: "centre",
        formatOptions: { format: "webp", options: { quality: 82 } },
      },
    ],
    adminThumbnail: "thumbnail",
    focalPoint: true,
    crop: true,
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateTags(MEDIA_CONSUMER_TAGS)],
    afterDelete: [revalidateTagsDelete(MEDIA_CONSUMER_TAGS)],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt-Text",
      admin: {
        description:
          "Kurze Beschreibung des Bildinhalts. Wird von Screenreadern vorgelesen und " +
          "von Suchmaschinen ausgewertet — bitte immer ausfuellen.",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Bildunterschrift",
      admin: {
        description:
          "Optional. Wird unter dem Bild angezeigt, z.B. „Mannschaftsfoto Saison 2026/27“.",
      },
    },
  ],
};
