import Link from "next/link";

import { InstagramIcon, SearchIcon } from "@/components/icons";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

type HeaderActionsProps = {
  /** Aus `site-settings` — ohne Adresse entfaellt das Icon. */
  instagramUrl?: string | null;
  className?: string;
};

const ICON_CLASS = "text-fg-primary hover:text-secondary shrink-0 transition-colors";

/**
 * Instagram und Lupe rechts oben. Steht im Header UND in der Kopfzeile des
 * Navigations-Overlays — deshalb eine eigene Komponente statt zweimal derselbe
 * Block.
 *
 * Die Lupe fuehrt auf die globale Suche (`/suche`). Weil dieselbe Komponente
 * im Overlay steckt, schliesst `NavOverlay` beim Adresswechsel selbst — die
 * Icons kommen dort als fertiges Element an und kennen den Overlay-Zustand
 * nicht.
 */
export function HeaderActions({ instagramUrl, className }: HeaderActionsProps) {
  return (
    <div className={cn("flex items-center gap-2 md:gap-3", className)}>
      {instagramUrl ? (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={strings.nav.instagram}
          className={ICON_CLASS}
        >
          <InstagramIcon />
        </a>
      ) : null}

      <Link href={ROUTES.search} aria-label={strings.common.search} className={ICON_CLASS}>
        <SearchIcon />
      </Link>
    </div>
  );
}
