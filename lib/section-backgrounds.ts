import type { SectionBackground } from "@/fields/section";

/**
 * Runtime mapping for the `sectionBackground` select.
 *
 * Background and text colour are always set as a pair, so a block never has to
 * decide whether its own text should be white or black — it inherits.
 * The texture utilities themselves live in `app/globals.css`.
 */
export const sectionBackgroundClasses: Record<SectionBackground, string> = {
  primary: "bg-primary text-fg-primary",
  backgroundDark: "bg-background-dark text-fg-primary",
  texture: "texture-section text-fg-primary",
  textureLight: "texture-section-light text-fg-secondary",
  white: "bg-white text-fg-secondary",
};

/** Falls back to the standard navy for unknown/missing values. */
export function backgroundClass(value?: SectionBackground | string | null): string {
  if (value && value in sectionBackgroundClasses) {
    return sectionBackgroundClasses[value as SectionBackground];
  }
  return sectionBackgroundClasses.primary;
}
