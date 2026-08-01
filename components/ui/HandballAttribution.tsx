import Image from "next/image";

import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

type HandballAttributionProps = {
  /** Ziel des Buttons — die handball.net-Seite der Mannschaft bzw. Liga. */
  href: string;
  /** Abweichende Beschriftung, z.B. „Zum Spielplan“. */
  label?: string;
  className?: string;
};

/**
 * Quellenangabe unter jeder Tabelle und jedem Spielplan.
 *
 * PFLICHT, nicht optional: die Nutzungsbedingungen von handball.net verlangen,
 * dass die Herkunft der Daten sichtbar bleibt. Nicht entfernen und nicht
 * ueberdecken — auch nicht "nur auf Mobile".
 *
 * Als einzige Stelle der Website in Ubuntu gesetzt (Vorgabe der Wortmarke).
 */
export function HandballAttribution({ href, label, className }: HandballAttributionProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "font-attribution flex h-[33px] w-[214px] items-center justify-center",
          "bg-secondary rounded-[3.5px] text-[14px] font-bold text-white uppercase",
          "transition-opacity hover:opacity-90",
        )}
      >
        {label ?? strings.handball.attributionButton}
      </a>

      <p className="font-attribution text-fg-primary flex items-center gap-1.5 text-[12.8px]">
        <span>{strings.handball.poweredBy}</span>
        <Image
          src="/brand/logo-handballnet-wordmark.svg"
          alt={strings.handball.sourceName}
          width={122}
          height={13}
          className="h-[13px] w-auto"
          // The Next image optimizer refuses SVG sources (400) — serve as-is.
          unoptimized
        />
      </p>
    </div>
  );
}
