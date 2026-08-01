import type { GlobalConfig } from "payload";

import { revalidateGlobal } from "@/lib/payload-hooks/revalidate";

/**
 * Stammdaten des Vereins. Alles, was an mehreren Stellen der Website auftaucht
 * — Name, Adresse, Kontakt, Social-Media — steht hier und nirgends fest im Code.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Vereinsdaten",
  admin: {
    group: "Einstellungen",
    description: "Name, Adresse, Kontakt und Logos — werden auf der ganzen Website verwendet.",
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal("site-settings")] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Allgemein",
          fields: [
            {
              name: "siteName",
              type: "text",
              required: true,
              defaultValue: "ETSV Lauda Handball",
              label: "Name der Website",
              admin: {
                description:
                  "Erscheint im Browser-Tab hinter dem Seitentitel und in Suchergebnissen.",
              },
            },
            {
              name: "siteDescription",
              type: "textarea",
              maxLength: 200,
              label: "Kurzbeschreibung",
              admin: {
                description:
                  "Ein bis zwei Saetze ueber den Verein. Wird von Suchmaschinen als " +
                  "Beschreibung genutzt, wenn eine Seite keine eigene hat.",
              },
            },
          ],
        },
        {
          label: "Kontakt",
          fields: [
            {
              name: "contact",
              type: "group",
              label: "Kontakt",
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "email",
                      type: "email",
                      label: "E-Mail",
                      admin: { width: "50%", description: "Allgemeine Adresse der Abteilung." },
                    },
                    {
                      name: "phone",
                      type: "text",
                      label: "Telefon",
                      admin: { width: "50%", description: "Optional." },
                    },
                  ],
                },
              ],
            },
            {
              name: "address",
              type: "group",
              label: "Anschrift",
              admin: { description: "Wird im Impressum und in den Suchmaschinen-Daten genutzt." },
              fields: [
                {
                  name: "street",
                  type: "text",
                  label: "Strasse und Hausnummer",
                  admin: { description: "z.B. „Im Ramstal 86a“." },
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "zip",
                      type: "text",
                      label: "PLZ",
                      admin: { width: "30%" },
                    },
                    {
                      name: "city",
                      type: "text",
                      label: "Ort",
                      admin: { width: "70%", description: "z.B. „Lauda-Königshofen“." },
                    },
                  ],
                },
              ],
            },
            {
              name: "socialLinks",
              type: "group",
              label: "Social Media",
              admin: { description: "Vollstaendige Adressen inkl. https://." },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "instagram",
                      type: "text",
                      label: "Instagram",
                      admin: { width: "50%" },
                    },
                    {
                      name: "facebook",
                      type: "text",
                      label: "Facebook",
                      admin: { width: "50%" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Verlinkungen",
          fields: [
            {
              name: "mainClubUrl",
              type: "text",
              label: "Zum Hauptverein",
              admin: {
                description: "Adresse der Vereins-Website. Wird im Menue und im Footer verlinkt.",
              },
            },
            {
              name: "membershipUrl",
              type: "text",
              label: "Mitglied werden",
              admin: {
                description: "Ziel des Mitglieder-Banners im Footer — Formular oder Infoseite.",
              },
            },
            {
              name: "handballNet",
              type: "group",
              label: "handball.net",
              fields: [
                {
                  name: "clubId",
                  type: "text",
                  defaultValue: "handball4all.baden.570",
                  label: "Vereins-ID",
                  admin: {
                    description:
                      "ID des Vereins auf handball.net. Wird fuer den vereinsweiten " +
                      "Spielplan benoetigt — normalerweise nicht zu aendern.",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Sichtbarkeit",
          fields: [
            {
              name: "isIndexable",
              type: "checkbox",
              defaultValue: true,
              label: "Website von Suchmaschinen finden lassen",
              admin: {
                description:
                  "Ausgeschaltet verschwindet die GANZE Website aus Google und Co.: die " +
                  "robots.txt sperrt alle Adressen, die Sitemap bleibt leer und jede Seite " +
                  "traegt den Vermerk „noindex“. Gedacht fuer die Zeit vor dem Start oder " +
                  "einen groesseren Umbau — danach wieder einschalten. Suchmaschinen " +
                  "brauchen in beide Richtungen einige Tage, bis sie die Aenderung " +
                  "uebernehmen. Der Schalter aendert nichts an der Erreichbarkeit: Besucher " +
                  "mit dem Link kommen weiterhin auf jede Seite.",
              },
            },
          ],
        },
        {
          label: "Logos",
          fields: [
            {
              name: "logos",
              type: "group",
              label: "Logos",
              admin: {
                description:
                  "Alle optional — ohne Angabe verwendet die Website die mitgelieferten " +
                  "Vereinslogos.",
              },
              fields: [
                {
                  name: "logo",
                  type: "upload",
                  relationTo: "media",
                  label: "Logo",
                  admin: { description: "Fuer helle Hintergruende." },
                },
                {
                  name: "logoInverted",
                  type: "upload",
                  relationTo: "media",
                  label: "Logo (invertiert)",
                  admin: { description: "Fuer dunkle Hintergruende — z.B. den Header." },
                },
                {
                  name: "favicon",
                  type: "upload",
                  relationTo: "media",
                  label: "Favicon",
                  admin: { description: "Kleines quadratisches Symbol fuer den Browser-Tab." },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
