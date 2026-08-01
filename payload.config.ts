import { buildConfig } from "payload";
import sharp from "sharp";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { FixedToolbarFeature, LinkFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import { Games } from "./collections/Games";
import { Media } from "./collections/Media";
import { News } from "./collections/News";
import { NewsCategories } from "./collections/NewsCategories";
import { Pages } from "./collections/Pages";
import { Players } from "./collections/Players";
import { Sponsors } from "./collections/Sponsors";
import { Teams } from "./collections/Teams";
import { Users } from "./collections/Users";
import { Footer } from "./globals/Footer";
import { HighlightBanner } from "./globals/HighlightBanner";
import { Navigation } from "./globals/Navigation";
import { SiteSettings } from "./globals/SiteSettings";
import { BLOB_TOKEN, DATABASE_URL, PAYLOAD_SECRET } from "./lib/env";
import { livePreviewUrl } from "./lib/preview";

export default buildConfig({
  sharp,

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " · ETSV Lauda Handball",
    },
    livePreview: {
      url: livePreviewUrl("/"),
      collections: ["pages", "news"],
      breakpoints: [
        { name: "mobile", label: "Handy", width: 375, height: 667 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
    },
  },

  // Bewusst KEINE `localization` — die Website ist einsprachig deutsch.
  // Mehrsprachigkeit liesse sich spaeter per Migration nachruesten.

  collections: [Pages, News, NewsCategories, Teams, Players, Games, Sponsors, Media, Users],
  globals: [SiteSettings, Navigation, Footer, HighlightBanner],

  db: postgresAdapter({
    pool: { connectionString: DATABASE_URL },
    // Kein automatisches Drizzle-Push: Schema-Aenderungen laufen lokal wie in
    // Produktion ausschliesslich ueber Migrations (`pnpm migrate:create`).
    push: false,
    migrationDir: "./migrations",
  }),

  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      LinkFeature({
        enabledCollections: ["pages", "news", "teams"],
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: "appearance",
            type: "select",
            defaultValue: "inline",
            label: "Darstellung",
            options: [
              { label: "Text-Link", value: "inline" },
              { label: "Button (gelb)", value: "primary" },
              { label: "Link mit Pfeil", value: "arrow" },
            ],
          },
        ],
      }),
    ],
  }),

  plugins: [
    seoPlugin({
      collections: ["pages", "news", "teams"],
      uploadsCollection: "media",
      tabbedUI: true,
      // Nur den nackten Dokumenttitel zurueckgeben — das `title.template` im
      // Root-Layout haengt den Vereinsnamen an. Sonst stuende er doppelt drin.
      generateTitle: ({ doc }) => {
        const d = doc as Record<string, string>;
        return d.title || d.name || "";
      },
      generateDescription: ({ doc }) => {
        const d = doc as Record<string, string>;
        return d.excerpt || d.introductionText || d.title || d.name || "";
      },
      generateURL: ({ doc, collectionSlug }) => {
        const d = doc as Record<string, string>;
        const prefix = collectionSlug === "pages" ? "" : `/${collectionSlug}`;
        return `${prefix}/${d.slug ?? ""}`;
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: "noindex",
          type: "checkbox",
          label: "Suchmaschinen ausschliessen (noindex)",
          defaultValue: false,
          admin: {
            description:
              "Die Seite bleibt erreichbar und verlinkbar, faellt aber aus der Sitemap " +
              "und wird von Suchmaschinen nicht aufgenommen.",
          },
        },
      ],
    }),

    redirectsPlugin({
      collections: ["pages", "news"],
      overrides: {
        admin: { group: "Einstellungen" },
      },
    }),

    vercelBlobStorage({
      // Ohne Token schreibt Payload lokal nach ./media.
      enabled: Boolean(BLOB_TOKEN),
      token: BLOB_TOKEN,
      collections: { media: true },
    }),
  ],

  secret: PAYLOAD_SECRET,

  typescript: {
    outputFile: "payload-types.ts",
  },
});
