import Link from "next/link";

import { getFooter, getSiteSettings } from "@/lib/globals";
import { externalLinkProps, resolveHref } from "@/lib/links";
import { CONTAINER, cn } from "@/lib/utils";

import { MemberBanner } from "./MemberBanner";

const LABELS = {
  footerNav: "Fußzeile",
} as const;

/**
 * Seitenfuss: Linkliste links, Mitglieder-Banner rechts.
 *
 * Die Linkliste steht bewusst AUCH auf dem Handy — im Figma fehlt sie dort,
 * das ist eine Luecke im Entwurf und kein Feature (Impressum muss von jedem
 * Geraet aus erreichbar sein).
 */
export async function Footer() {
  const [footer, settings] = await Promise.all([getFooter(), getSiteSettings()]);

  const links = (footer.links ?? [])
    .map((entry) => ({
      label: entry.label,
      href: resolveHref(entry.link),
      newTab: Boolean(entry.link?.newTab),
    }))
    .filter((entry): entry is { label: string; href: string; newTab: boolean } =>
      Boolean(entry.href),
    );

  return (
    <footer className="bg-primary">
      <div
        className={cn(
          CONTAINER,
          "flex flex-col gap-8 py-8 md:flex-row md:items-start md:justify-between md:gap-16 md:py-16",
        )}
      >
        {links.length > 0 ? (
          <nav aria-label={LABELS.footerNav}>
            <ul className="flex flex-col gap-4">
              {links.map((entry, index) => (
                <li key={`${entry.label}-${index}`}>
                  <Link
                    href={entry.href}
                    {...externalLinkProps(entry.href, entry.newTab)}
                    className="label-italic text-fg-primary hover:text-secondary text-[18px] transition-colors"
                  >
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <MemberBanner
          card={footer.memberCard}
          membershipUrl={settings.membershipUrl}
          className="md:shrink-0"
        />
      </div>
    </footer>
  );
}
