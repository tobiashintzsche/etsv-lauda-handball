import { ClubCrest } from "@/components/teams/ClubCrest";
import { HandballPanelHead } from "@/components/teams/HandballPanelHead";
import { HandballAttribution } from "@/components/ui/HandballAttribution";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import type { SectionBackground } from "@/fields/section";
import type { LeagueTable } from "@/lib/handball/types";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

type LeagueTableSectionProps = {
  headline: string;
  subline?: string | null;
  clubName: string;
  table: LeagueTable;
  /** handball.net page the attribution button links to. */
  attributionHref: string;
  background?: SectionBackground | string | null;
  anchorId?: string | null;
};

const COLUMN_LABELS = {
  rank: strings.table.rank,
  club: strings.table.club,
  games: "Spiele",
  goals: strings.table.goals,
  points: strings.table.points,
};

/**
 * League table in the club's own design (design 3.7).
 *
 * The columns are fixed-width so ranks, goals and points line up across every
 * table on the site. On mobile the whole table sits in a horizontal scroll
 * track — squeezing six columns into 358px would be unreadable.
 */
export function LeagueTableSection({
  headline,
  subline,
  clubName,
  table,
  attributionHref,
  background,
  anchorId,
}: LeagueTableSectionProps) {
  return (
    <SectionShell background={background} anchorId={anchorId}>
      <SectionHeader headline={headline} subline={subline} />

      <div className="mt-6">
        <HandballPanelHead clubName={clubName} />

        {table.rows.length === 0 ? (
          <p className="text-muted mt-6 text-[14px] leading-[1.5] md:text-[16px]">
            {strings.table.empty}
          </p>
        ) : (
          <>
            {table.label ? (
              <p className="label-italic text-secondary mt-4 text-[14px] uppercase">
                {table.label}
              </p>
            ) : null}

            <div className="scroll-track mt-6">
              {/* Wrapper carries the track width; a <table> as a direct flex
                  item sizes unpredictably across browsers. */}
              <div className="w-full min-w-[435px]">
                <table className="w-full table-fixed border-collapse text-left">
                  <caption className="sr-only">
                    {table.tournamentName ?? strings.table.headline}
                  </caption>
                  <colgroup>
                    <col className="w-9" />
                    <col className="w-6" />
                    <col />
                    <col className="w-[39px]" />
                    <col className="w-[76px]" />
                    <col className="w-[58px]" />
                  </colgroup>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">{COLUMN_LABELS.rank}</th>
                      <th scope="col">Wappen</th>
                      <th scope="col">{COLUMN_LABELS.club}</th>
                      <th scope="col">{COLUMN_LABELS.games}</th>
                      <th scope="col">{COLUMN_LABELS.goals}</th>
                      <th scope="col">{COLUMN_LABELS.points}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, index) => (
                      <tr
                        key={`${row.teamId}-${index}`}
                        className={cn(
                          "border-fg-primary h-[54px] border-b text-[16px] leading-[28px]",
                          row.isOwnClub && "font-bold",
                        )}
                      >
                        <td className="pr-1 text-right font-bold">{row.rank ?? "–"}</td>
                        <td>
                          <ClubCrest name={row.teamName} logoUrl={row.logoUrl} />
                        </td>
                        <td className="truncate pl-[9px]">{row.teamName}</td>
                        <td className="text-center font-bold">{row.games}</td>
                        <td className="text-center font-bold">{row.goals}</td>
                        <td className="text-center font-bold">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <HandballAttribution href={attributionHref} className="mt-6 items-start" />
      </div>
    </SectionShell>
  );
}
