import Image from "next/image";

import { clubInitials } from "@/lib/handball/opponent-logos";
import { cn } from "@/lib/utils";

type ClubCrestProps = {
  /** Club name — used for the initials when there is no crest. */
  name: string;
  /** Absolute crest URL, or null/undefined. */
  logoUrl?: string | null;
  className?: string;
};

/**
 * The 24×24 crest slot of a fixture card and a table row (design 3.15).
 *
 * Clubs without a crest get a muted initials tile instead of an empty box:
 * every row keeps its rhythm, and "SG" reads as a club rather than as a
 * missing image. Decorative either way — the club name stands next to it, so
 * announcing it twice would only slow a screen reader down.
 */
export function ClubCrest({ name, logoUrl, className }: ClubCrestProps) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={24}
        height={24}
        // Third-party crests, many of them SVG: hand them to the browser
        // untouched instead of through our optimiser.
        unoptimized
        className={cn("h-6 w-6 shrink-0 object-contain", className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-position text-fg-primary flex h-6 w-6 shrink-0 items-center justify-center",
        "font-sans text-[10px] leading-none font-bold not-italic",
        className,
      )}
    >
      {clubInitials(name)}
    </span>
  );
}
