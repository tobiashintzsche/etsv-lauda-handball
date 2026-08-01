import { SectionShell } from "@/components/ui/SectionShell";

type PageHeaderProps = {
  title: string;
  /** Optionale gelbe Zeile unter dem Titel. */
  subline?: string | null;
};

/**
 * Titelzeile redaktioneller Seiten.
 *
 * Payload-Seiten haben keinen eigenen Hero — ohne diesen Kopf begaenne die
 * Seite direkt mit einem Baustein und haette keine h1. Nach unten bleibt der
 * Abstand offen: den bringt der erste Baustein mit seinem eigenen
 * Sektions-Padding schon mit.
 */
export function PageHeader({ title, subline }: PageHeaderProps) {
  return (
    <SectionShell background="primary" className="pb-0 md:pb-0">
      <h1 className="text-[32px] md:text-[40px]">{title}</h1>
      {subline ? (
        <p className="heading-italic text-secondary text-[18px] md:text-[24px]">{subline}</p>
      ) : null}
    </SectionShell>
  );
}
