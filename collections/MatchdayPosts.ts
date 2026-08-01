import type { CollectionConfig } from "payload";

import { runMatchdayPipeline } from "@/lib/matchday-posts/pipeline";
import { revalidateCollection, revalidateCollectionDelete } from "@/lib/payload-hooks/revalidate";

/**
 * Instagram-Spieltagsposts.
 *
 * Die Pipeline (`pnpm posts:generate`) schlaegt Posts vor, die Redaktion gibt
 * sie frei oder verwirft sie. Ein freigegebener oder verworfener Post wird von
 * der Pipeline nie wieder angefasst.
 *
 * Die Spiele liegen bewusst als SNAPSHOT im Dokument und nicht als Relationship:
 * ein Post ist ein Stueck Redaktion, das genau so bleiben soll, wie es
 * freigegeben wurde — auch wenn der Spielplan sich danach noch aendert.
 *
 * v2 (Instagram-Anbindung) kommt additiv: `status` bekommt `geplant`/`gepostet`,
 * dazu `scheduledFor` und eine Gruppe `instagram` — ohne Umbenennung von
 * irgendetwas, das hier schon steht.
 */
export const MatchdayPosts: CollectionConfig = {
  slug: "matchdayPosts",
  dbName: "matchday_posts",
  labels: { singular: "Spieltagspost", plural: "Spieltagsposts" },
  // Naechster Spieltag zuerst — so arbeitet die Redaktion die Liste ab.
  defaultSort: "matchday.dateFrom",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "postType", "updatedAt"],
    group: "Verein",
    description:
      "Vorgeschlagene Instagram-Posts zu den naechsten Spielen. Vorschlag pruefen, " +
      "Text anpassen, freigeben — das Bild gibt es als PNG zum Herunterladen.",
    listSearchableFields: ["title", "caption"],
  },

  // Keine oeffentliche Leseberechtigung: Vorschlaege sind Redaktionsstand.
  // Die Render-Route liest ueber die Local API und umgeht die Pruefung bewusst.
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },

  hooks: {
    // Zweiter Tag ist die id — die Render-Route cached pro Post.
    afterChange: [revalidateCollection("matchdayPosts", (doc) => String(doc.id))],
    afterDelete: [revalidateCollectionDelete("matchdayPosts", (doc) => String(doc.id))],
  },

  endpoints: [
    {
      // POST /api/matchdayPosts/generate?days=14 — der Trigger aus dem Admin.
      path: "/generate",
      method: "post",
      handler: async (req) => {
        if (!req.user) {
          return Response.json(
            { error: "Nur angemeldete Redakteurinnen und Redakteure duerfen Posts erzeugen." },
            { status: 401 },
          );
        }

        const days = Number(req.searchParams?.get("days"));
        const from = req.searchParams?.get("from");

        const result = await runMatchdayPipeline(req.payload, {
          ...(Number.isFinite(days) && days > 0 ? { days } : {}),
          ...(from ? { from: new Date(from) } : {}),
        });

        return Response.json(result);
      },
    },
  ],

  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      index: true,
      label: "Titel",
      admin: {
        description:
          "Nur zur Orientierung in dieser Liste, steht nicht im Bild. Die Pipeline " +
          "schlaegt z.B. „Heimspiele · Sa, 19.09.2026“ vor.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "vorschlag",
          index: true,
          label: "Status",
          options: [
            { label: "Vorschlag", value: "vorschlag" },
            { label: "Freigegeben", value: "freigegeben" },
            { label: "Verworfen", value: "verworfen" },
          ],
          admin: {
            width: "50%",
            description:
              "„Vorschlag“ darf die Pipeline aktualisieren. Sobald du freigibst oder " +
              "verwirfst, bleibt der Post unveraendert stehen.",
          },
        },
        {
          name: "postType",
          type: "select",
          required: true,
          defaultValue: "heim",
          index: true,
          label: "Art des Posts",
          options: [
            { label: "Heimspiele", value: "heim" },
            { label: "Auswaertsspiele", value: "auswaerts" },
            { label: "Gemischt", value: "gemischt" },
          ],
          admin: {
            width: "50%",
            description:
              "Heim und Auswaerts werden getrennt gepostet. „Gemischt“ nur, wenn alle " +
              "Spiele des Spieltags zusammen auf ein Bild passen.",
          },
        },
      ],
    },
    {
      name: "badgeText",
      type: "text",
      label: "Text im schwarzen Kasten",
      admin: {
        description:
          "Leer lassen — dann steht dort automatisch HEIMSPIEL, AUSWAERTSSPIELE oder " +
          "SPIELTAG. Fuer Sonderfaelle z.B. „ERGEBNISSE“ eintragen.",
      },
    },
    {
      name: "matchday",
      type: "group",
      label: "Spieltag",
      admin: {
        description:
          "Zeitfenster des Spieltags. Fuellt die Pipeline aus dem ersten und letzten Spiel.",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "dateFrom",
              type: "date",
              index: true,
              label: "Erstes Spiel",
              admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
            },
            {
              name: "dateTo",
              type: "date",
              label: "Letztes Spiel",
              admin: { width: "50%", date: { pickerAppearance: "dayAndTime" } },
            },
          ],
        },
      ],
    },
    {
      name: "variant",
      type: "select",
      required: true,
      defaultValue: "standard",
      label: "Bildvariante",
      options: [
        { label: "Standard (Grafik-Hintergrund)", value: "standard" },
        { label: "Foto mit Text darueber", value: "bildOverlay" },
      ],
      admin: {
        description:
          "„Standard“ ist die Liste auf dem dunklen Hintergrund. „Foto“ zeigt EIN Spiel " +
          "gross auf einem Mannschaftsfoto — gedacht fuer Herren-Heimspiele.",
      },
    },
    {
      name: "overlayImage",
      type: "upload",
      relationTo: "media",
      label: "Foto",
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "bildOverlay",
        description: "Hochformat oder Querformat. Wird formatfuellend beschnitten.",
      },
      // Kein `required`: das Feld ist ausgeblendet, solange die Variante
      // „Standard“ ist — ein Pflichtfeld wuerde dann das Speichern blockieren.
      validate: (value: unknown, { siblingData }: { siblingData?: { variant?: string } }) => {
        if (siblingData?.variant === "bildOverlay" && !value) return "Bitte ein Foto auswaehlen.";
        return true;
      },
    },
    {
      name: "overlayTitle",
      type: "text",
      label: "Zeile im Foto",
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "bildOverlay",
        description:
          "Leer lassen — dann steht dort automatisch „HERREN VS SG HEUCHELBERG 3“ aus " +
          "dem ersten Spiel. Die Uhrzeit kommt ebenfalls aus dem ersten Spiel.",
      },
    },
    {
      name: "games",
      type: "array",
      dbName: "matchday_post_games",
      label: "Spiele im Post",
      labels: { singular: "Spiel", plural: "Spiele" },
      minRows: 1,
      admin: {
        initCollapsed: true,
        description:
          "Eine Zeile pro Spiel, von oben nach unten nach Anwurfzeit. Fuenf Zeilen " +
          "passen auf ein Bild (vier, wenn zwei Ueberschriften noetig sind).",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "homeTeam",
              type: "text",
              required: true,
              label: "Heimmannschaft",
              admin: { width: "50%", description: "Bei Heimspielen unsere Mannschaft." },
            },
            {
              name: "awayTeam",
              type: "text",
              required: true,
              label: "Gastmannschaft",
              admin: { width: "50%", description: "Bei Auswaertsspielen unsere Mannschaft." },
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
              label: "Anwurf",
              admin: {
                width: "50%",
                date: { pickerAppearance: "dayAndTime" },
                description: "Bestimmt Reihenfolge und Tagesueberschrift (SAMSTAG, SONNTAG).",
              },
            },
            {
              name: "time",
              type: "text",
              required: true,
              label: "Text rechts",
              admin: {
                width: "50%",
                description:
                  "Steht gross rechts in der Zeile: „18:30“, ein Ergebnis „24:25“ oder ein Emoji.",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "venue",
              type: "text",
              label: "Spielort",
              admin: { width: "50%", description: "Nur zur Kontrolle — steht nicht im Bild." },
            },
            {
              name: "league",
              type: "text",
              label: "Liga",
              admin: { width: "50%", description: "Nur zur Kontrolle — steht nicht im Bild." },
            },
          ],
        },
        {
          name: "isOwnHome",
          type: "checkbox",
          defaultValue: true,
          label: "Wir spielen zu Hause",
          admin: {
            description:
              "Entscheidet, welche der beiden Mannschaften als unsere gilt — und in " +
              "einem gemischten Post, unter welcher Ueberschrift die Zeile steht.",
          },
        },
        {
          name: "sourceGameId",
          type: "text",
          admin: { hidden: true },
          label: "Herkunft",
        },
      ],
    },
    {
      name: "caption",
      type: "textarea",
      label: "Instagram-Text",
      admin: {
        rows: 10,
        description:
          "Vorschlag der Pipeline. Gerne umschreiben — dieser Text wird spaeter mit " +
          "dem Bild veroeffentlicht.",
      },
    },
    {
      name: "sourceKey",
      type: "text",
      unique: true,
      index: true,
      label: "Erkennungsschluessel",
      admin: {
        hidden: true,
        description:
          "Technisch: verhindert, dass die Pipeline denselben Post doppelt anlegt. " +
          "Nicht aendern.",
      },
    },
    {
      name: "preview",
      type: "ui",
      label: "Vorschau",
      admin: {
        components: {
          Field: "@/components/admin/MatchdayPostLinks#MatchdayPostLinks",
        },
      },
    },
  ],
};
