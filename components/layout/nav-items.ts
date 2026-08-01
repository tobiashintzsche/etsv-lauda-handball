import type { Navigation } from "@payload-types";

import { type CmsLink, resolveHref } from "@/lib/links";

/** One row in the overlay — level 1 as well as level 2. */
export type NavEntry = {
  label: string;
  href: string | null;
  newTab: boolean;
};

export type NavItem = NavEntry & {
  /** Non-empty → the row opens the light flyout instead of navigating. */
  children: NavEntry[];
};

function toEntry(entry: { label: string; link?: CmsLink }): NavEntry {
  return {
    label: entry.label,
    href: resolveHref(entry.link),
    newTab: Boolean(entry.link?.newTab),
  };
}

/**
 * Global `navigation` → plain data for the client overlay. Everything that
 * needs Payload types stays on the server; the client component only ever sees
 * labels and hrefs.
 */
export function toNavItems(items: Navigation["items"]): NavItem[] {
  return (items ?? []).map((item) => ({
    ...toEntry(item),
    children: (item.children ?? []).map(toEntry),
  }));
}
