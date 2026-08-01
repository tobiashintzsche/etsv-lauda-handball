import type { Block } from "payload";

import { anchorIdField } from "@/fields/section";

/**
 * Hero-Slider: grossformatiges Bildband ganz oben auf der Startseite.
 *
 * Der Baustein hat bewusst fast keine Einstellungen. Welche Beitraege laufen,
 * entscheidet die Redaktion ueber den Haken „Top-Beitrag“ an der News selbst —
 * `HeroSlider/Server.tsx` stellt die markierten Beitraege nach vorn und fuellt
 * mit den neuesten auf. Hintergrund und Breite sind fest: der Hero ist immer
 * das breite Bildband und traegt deshalb kein `sectionBackground`.
 */
export const HeroSliderBlock: Block = {
  slug: "heroSlider",
  interfaceName: "HeroSliderBlock",
  dbName: ({ tableName }) => `${tableName}_b_hero`,
  labels: { singular: "Hero-Slider", plural: "Hero-Slider" },
  fields: [
    {
      name: "itemCount",
      type: "select",
      label: "Anzahl Beitraege",
      defaultValue: "3",
      options: [
        { label: "3 Beitraege", value: "3" },
        { label: "4 Beitraege", value: "4" },
        { label: "5 Beitraege", value: "5" },
      ],
      admin: {
        description:
          "Wie viele Beitraege der Slider durchblaettert. Die Auswahl passiert " +
          "automatisch: zuerst die News mit dem Haken „Top-Beitrag“, danach die " +
          "neuesten. Mehr als fuenf wird unuebersichtlich.",
      },
    },
    anchorIdField(),
  ],
};
