import type { Game } from "@payload-types";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { strings } from "@/lib/strings";
import { CONTAINER } from "@/lib/utils";

import { CourtBackdrop } from "./CourtBackdrop";
import { FixtureGroup } from "./FixtureGroup";

type NextGamesSectionProps = {
  headline: string;
  subline?: string | null;
  home: Game[];
  away: Game[];
  anchorId?: string | null;
};

/** Shown when neither group has a single fixture — June to September, every year. */
const SEASON_BREAK = "Saisonpause — aktuell keine angesetzten Spiele";

/**
 * „Naechste Spiele“ in the look of the Instagram matchday post
 * (Figma spieltagspost, screens 1–4).
 *
 * Web adaptation of the post:
 *   · Two columns from `md` up (spec §10), stacked below. At 1024px container
 *     width each group gets ~490px — that is roughly the mobile column, which
 *     is why the desktop type sizes sit close to the mobile ones instead of
 *     doubling them.
 *   · Type keeps the spec's ratios rather than its absolute sizes: kickoff 2×
 *     the fixture line, badge 2.25×. The kickoff stays flush right in its own
 *     column and remains the anchor of the row.
 *   · The section always carries the post surface (navy plus court lines), so
 *     it ignores the block's `sectionBackground` — white or light-texture would
 *     leave white fixture rows on a white band. Same exemption the hero slider
 *     already has from the „blocks never set their own background“ rule.
 *
 * Purely presentational — the fixtures are loaded in `Server.tsx`.
 */
export function NextGamesSection({
  headline,
  subline,
  home,
  away,
  anchorId,
}: NextGamesSectionProps) {
  const isEmpty = home.length === 0 && away.length === 0;

  return (
    <SectionShell
      background="primary"
      anchorId={anchorId}
      fullBleed
      className="relative isolate overflow-hidden"
    >
      <CourtBackdrop />

      <div className={CONTAINER}>
        <SectionHeader headline={headline} subline={subline} />

        {isEmpty ? (
          <p className="text-muted mt-6 text-[14px] leading-[1.5] md:text-[16px]">{SEASON_BREAK}</p>
        ) : (
          <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-2 md:gap-10">
            <FixtureGroup label={strings.games.home} games={home} empty={strings.games.emptyHome} />
            <FixtureGroup label={strings.games.away} games={away} empty={strings.games.emptyAway} />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
