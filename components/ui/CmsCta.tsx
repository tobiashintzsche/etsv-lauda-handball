import Link from "next/link";

import { ArrowLink } from "@/components/ui/ArrowLink";
import { type CmsLink, isExternalHref, resolveHref } from "@/lib/links";
import { cn } from "@/lib/utils";

type CmsCtaProps = {
  link: CmsLink;
  /** Klassen fuer die umschliessende Box (Abstaende). */
  className?: string;
};

/**
 * Handlungsaufruf aus einem CMS-Link-Feld — gelber Button oder Pfeil-Link.
 *
 * Renders nothing when the editor picked "Kein Link", left the target empty or
 * forgot the label. Href resolution stays in `lib/links.ts`; this component only
 * decides how the resolved link looks.
 */
export function CmsCta({ link, className }: CmsCtaProps) {
  const href = resolveHref(link);
  const label = link?.label;

  if (!href || !label) return null;

  const opensInNewTab = isExternalHref(href) || Boolean(link?.newTab);

  return (
    <div className={className}>
      {link?.appearance === "primary" ? (
        <Link
          href={href}
          {...(opensInNewTab && { target: "_blank", rel: "noopener noreferrer" })}
          className={cn(
            "label-italic bg-secondary text-fg-secondary inline-flex h-[44px] items-center px-6",
            "text-[16px] uppercase transition-opacity hover:opacity-90",
          )}
        >
          {label}
        </Link>
      ) : (
        <ArrowLink href={href} external={opensInNewTab}>
          {label}
        </ArrowLink>
      )}
    </div>
  );
}
