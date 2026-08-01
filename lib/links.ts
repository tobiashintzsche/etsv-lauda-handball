import { newsPath, pagePath, teamPath } from "@/lib/paths";

/**
 * Structural mirror of the `link` field factory (fields/link.ts).
 *
 * Payload generates a separate inline type per usage, so a shared structural
 * type is the only way to write one resolver for navigation, footer, member
 * card, block CTAs and the news article CTA. Every one of those inline types is
 * assignable to this one — there must not be a second implementation anywhere.
 */
export type CmsLink =
  | {
      type?: ("none" | "reference" | "custom") | null;
      newTab?: boolean | null;
      reference?: {
        relationTo: "pages" | "news" | "teams";
        value: number | { slug?: string | null };
      } | null;
      url?: string | null;
      /** Visible link text — only present where the field keeps its label. */
      label?: string | null;
      /** Rendering variant — only present where the field offers appearances. */
      appearance?: ("primary" | "arrow" | "inline") | null;
    }
  | null
  | undefined;

/**
 * Link group → href. Returns null when the editor picked "Kein Link", left the
 * target empty or the relationship came back unpopulated (depth 0) — call sites
 * render plain text instead of a dead link.
 */
export function resolveHref(link: CmsLink): string | null {
  if (!link || link.type === "none") return null;

  if (link.type === "custom") {
    return link.url?.trim() || null;
  }

  const reference = link.reference;
  if (!reference || typeof reference.value === "number") {
    return link.url?.trim() || null;
  }

  const slug = reference.value.slug;
  if (!slug) return null;

  switch (reference.relationTo) {
    case "news":
      return newsPath(slug);
    case "teams":
      return teamPath(slug);
    default:
      return pagePath(slug);
  }
}

/** True for absolute targets (Hauptverein, Instagram, handball.net). */
export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

/** target/rel for a link that leaves the site — spread onto <Link> or <a>. */
export function externalLinkProps(href: string, newTab?: boolean) {
  return isExternalHref(href) || newTab
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : {};
}
