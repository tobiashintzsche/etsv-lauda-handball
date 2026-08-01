import type { AboutBlock, Team } from "@payload-types";

import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { teamPath } from "@/lib/paths";
import { isPopulated } from "@/lib/utils";

type AboutProps = {
  block: AboutBlock;
  isFirst?: boolean;
};

/**
 * „Ueber den Verein“: Vorstellungstext auf maximal 768px Breite, darunter die
 * verlinkten Mannschaften als Pfeil-Liste.
 *
 * Die Liste laeuft zweispaltig (zeilenweise, also in DOM-Reihenfolge): der
 * Verein stellt neun Mannschaften, einspaltig waere das eine sehr lange Kette
 * unter einem kurzen Textblock. Unter 360px Viewport bleibt sie einspaltig —
 * dort passt kein Teamname mit Saison-Zusatz („gemischte E-Jugend (2025/26)“)
 * mehr in eine halbe Zeile. Sie teilt sich das 768px-Mass mit dem Fliesstext,
 * sonst stehen die beiden Spalten quer ueber die volle Containerbreite und
 * lesen sich wie zwei getrennte Listen.
 *
 * Die Relation kommt bereits aufgeloest aus dem Page-Loader (depth 2). Nicht
 * aufgeloeste Eintraege (nur die id) werden uebersprungen, statt eine kaputte
 * Adresse zu erzeugen.
 */
export function About({ block, isFirst = false }: AboutProps) {
  const teams = (block.teams ?? []).filter((team): team is Team => isPopulated<Team>(team));

  return (
    <SectionShell background={block.sectionBackground} anchorId={block.anchorId}>
      <SectionHeader headline={block.headline} subline={block.subline} as={isFirst ? "h1" : "h2"} />

      <p className="mt-5 max-w-[768px] text-[14px] leading-[1.5] whitespace-pre-line md:text-[16px]">
        {block.text}
      </p>

      {teams.length ? (
        <ul className="mt-5 grid max-w-[768px] grid-flow-row grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-8">
          {teams.map((team) => (
            <li key={team.id}>
              <ArrowLink href={teamPath(team.slug)} className="text-[18px] md:text-[20px]">
                {team.name}
              </ArrowLink>
            </li>
          ))}
        </ul>
      ) : null}
    </SectionShell>
  );
}
