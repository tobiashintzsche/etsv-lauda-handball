import type { Field } from "payload";

/**
 * Section background vocabulary.
 *
 * The site rhythm is carried by alternating three surfaces — the standard
 * navy, a darker navy, and the concrete texture (dark or light overlay).
 * `white` exists for the rare bright band (e.g. an embedded matchday strip).
 *
 * Keep this list in sync with `sectionBackgroundClasses` in
 * `lib/section-backgrounds.ts` — the runtime mapping lives there so blocks
 * never spell out colour classes themselves.
 */
export const SECTION_BACKGROUND_VALUES = [
  "primary",
  "backgroundDark",
  "texture",
  "textureLight",
  "white",
] as const;

export type SectionBackground = (typeof SECTION_BACKGROUND_VALUES)[number];

const BACKGROUND_OPTIONS: { label: string; value: SectionBackground }[] = [
  { label: "Standard (dunkelblau)", value: "primary" },
  { label: "Abgesetzt (dunkler)", value: "backgroundDark" },
  { label: "Beton-Textur (dunkel)", value: "texture" },
  { label: "Beton-Textur (hell, schwarzer Text)", value: "textureLight" },
  { label: "Weiss (schwarzer Text)", value: "white" },
];

/**
 * Optional anchor id, so any section can be linked to directly.
 *
 * Lives on its own because not every block offers a background choice — the
 * hero slider is always a full-width image band and still wants an anchor.
 */
export function anchorIdField(width?: string): Field {
  return {
    name: "anchorId",
    type: "text",
    label: "Anker-ID",
    admin: {
      ...(width ? { width } : {}),
      description:
        "Optional. Erlaubt Sprunglinks auf diesen Abschnitt, z.B. „kontakt“ fuer " +
        "die Adresse /kontakt#kontakt. Nur Kleinbuchstaben, Zahlen und Bindestriche.",
    },
    validate: (value: unknown) => {
      if (!value) return true;
      if (typeof value !== "string" || !/^[a-z0-9-]+$/.test(value)) {
        return "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.";
      }
      return true;
    },
  };
}

/**
 * Trailing field row every block config ends with: background surface plus an
 * optional anchor id for in-page links.
 */
export function sectionFields(defaultBackground: SectionBackground = "primary"): Field {
  return {
    type: "row",
    fields: [
      {
        name: "sectionBackground",
        type: "select",
        label: "Hintergrund",
        defaultValue: defaultBackground,
        options: BACKGROUND_OPTIONS,
        admin: {
          width: "50%",
          description:
            "Bestimmt die Flaeche hinter diesem Abschnitt. Am besten abwechseln, " +
            "damit sich die Abschnitte voneinander absetzen.",
        },
      },
      anchorIdField("50%"),
    ],
  };
}
