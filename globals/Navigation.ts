import type { GlobalConfig } from "payload";

import { link } from "@/fields/link";
import { revalidateGlobal } from "@/lib/payload-hooks/revalidate";

/**
 * Das Hauptmenue (Overlay hinter dem Burger-Symbol). Eintraege mit
 * Unterpunkten oeffnen ein zweites Panel statt direkt zu verlinken.
 */
export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation",
  admin: {
    group: "Einstellungen",
    description: "Die Menuepunkte hinter dem Burger-Symbol, in der Reihenfolge der Anzeige.",
  },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal("navigation")] },
  fields: [
    {
      name: "items",
      type: "array",
      label: "Menuepunkte",
      labels: { singular: "Menuepunkt", plural: "Menuepunkte" },
      admin: {
        initCollapsed: true,
        description:
          "Ein Punkt mit Unterpunkten oeffnet ein Untermenue — sein eigener Link wird " +
          "dann nicht mehr aufgerufen.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Beschriftung",
          admin: { description: "Was im Menue steht, z.B. „Jugend“." },
        },
        link({ required: false, appearances: false, disableLabel: true }),
        {
          name: "children",
          type: "array",
          label: "Unterpunkte",
          labels: { singular: "Unterpunkt", plural: "Unterpunkte" },
          admin: {
            initCollapsed: true,
            description: "Optional. Erscheinen im hellen Untermenue rechts daneben.",
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              label: "Beschriftung",
            },
            link({ appearances: false, disableLabel: true }),
          ],
        },
      ],
    },
  ],
};
