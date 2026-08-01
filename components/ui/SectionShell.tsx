import type { SectionBackground } from "@/fields/section";
import { backgroundClass } from "@/lib/section-backgrounds";
import { CONTAINER, SECTION_PADDING, cn } from "@/lib/utils";

type SectionShellProps = {
  /** Wert des `sectionBackground`-Feldes. Unbekannte Werte fallen auf „primary“ zurueck. */
  background?: SectionBackground | string | null;
  /** Wert des `anchorId`-Feldes — wird zur id des <section>-Elements. */
  anchorId?: string | null;
  children: React.ReactNode;
  /** Zusatzklassen fuer das <section> (Hintergrund, Abstand). */
  className?: string;
  /** Zusatzklassen fuer den inneren Container (Breite, Ausrichtung). */
  innerClassName?: string;
  /** Volle Breite ohne Container — fuer randlose Bildbaender. */
  fullBleed?: boolean;
};

/**
 * Rahmen jedes Seitenabschnitts: setzt Hintergrund und vertikalen Abstand auf
 * das <section>, den 1024px-Container auf ein inneres <div>.
 *
 * Blocks setzen NIE selbst `bg-*` oder `text-white` — die Farbpaarung kommt
 * ausschliesslich aus `backgroundClass`, sonst bricht die helle Variante.
 */
export function SectionShell({
  background,
  anchorId,
  children,
  className,
  innerClassName,
  fullBleed = false,
}: SectionShellProps) {
  return (
    <section
      {...(anchorId && { id: anchorId })}
      className={cn(backgroundClass(background), SECTION_PADDING, className)}
    >
      <div className={cn(fullBleed ? "w-full" : CONTAINER, innerClassName)}>{children}</div>
    </section>
  );
}
