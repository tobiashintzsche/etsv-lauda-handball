import { cn } from "@/lib/utils";

import { ArrowLink } from "./ArrowLink";

type SectionHeaderProps = {
  headline: string;
  /** Gelbe Zeile unter (bzw. neben) der Ueberschrift. */
  subline?: string | null;
  /** Optionaler Pfeil-Link rechts, z.B. „Zu allen News“. */
  link?: { label: string; href: string } | null;
  /** h1 nur einmal pro Seite — den ersten Abschnitt entsprechend markieren. */
  as?: "h1" | "h2";
  className?: string;
};

/**
 * Abschnittskopf nach Design 3.4.
 *
 * Zwei Auspraegungen, gesteuert durch `link`:
 *   ohne Link → Ueberschrift, darunter die gelbe Subline
 *   mit Link  → eine Zeile: „NEWS / ZU ALLEN NEWS →“, der Schraegstrich gelb
 */
export function SectionHeader({
  headline,
  subline,
  link,
  as = "h2",
  className,
}: SectionHeaderProps) {
  const Heading = as;

  if (link) {
    return (
      <div className={cn("flex flex-wrap items-end gap-1", className)}>
        <Heading className="heading-italic text-[24px] md:text-[32px]">{headline}</Heading>
        <span
          aria-hidden="true"
          className="heading-italic text-secondary text-[24px] md:text-[32px]"
        >
          /
        </span>
        <ArrowLink href={link.href} size="lg" className="pb-0.5">
          {link.label}
        </ArrowLink>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <Heading className="heading-italic text-[24px] md:text-[32px]">{headline}</Heading>
      {subline ? (
        <p className="heading-italic text-secondary text-[18px] md:text-[20px]">{subline}</p>
      ) : null}
    </div>
  );
}
