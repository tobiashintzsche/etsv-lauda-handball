import type { Field, FieldHook } from "payload";

import { slugify } from "@/lib/slugify";

/**
 * Normalises the slug on write. A manually typed slug is respected (only
 * cleaned up); an empty one is derived from `fallbackField` on create.
 */
export const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === "string" && value.length > 0) {
      return slugify(value);
    }

    if (operation === "create" || !value) {
      const fallback = data?.[fallbackField];
      if (typeof fallback === "string" && fallback.length > 0) {
        return slugify(fallback);
      }
    }

    return value;
  };

/**
 * Shared slug field. `fallbackField` is the doc field the slug is generated
 * from — pages/news use `title`, teams/players/sponsors use `name`.
 *
 * Not localized: the site is German-only (see CLAUDE.md).
 */
export function makeSlugField(fallbackField: string = "title"): Field {
  return {
    name: "slug",
    type: "text",
    required: true,
    unique: true,
    index: true,
    label: "URL-Slug",
    admin: {
      position: "sidebar",
      description:
        "Der Teil der Adresse nach dem Domainnamen, z.B. „ueber-den-verein“. " +
        "Wird automatisch aus dem Titel erzeugt — nur aendern, wenn die Seite noch " +
        "nicht veroeffentlicht ist (alte Links brechen sonst).",
    },
    hooks: {
      beforeValidate: [formatSlug(fallbackField)],
    },
  };
}

export const slugField: Field = makeSlugField("title");
