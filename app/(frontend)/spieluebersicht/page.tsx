import type { Metadata } from "next";

import { MatchcenterAccordion } from "@/components/teams/MatchcenterAccordion";
import { TeamSchedulePanel } from "@/components/teams/TeamSchedulePanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { getSiteSettings } from "@/lib/globals";
import { strings } from "@/lib/strings";
import { getTeams } from "@/lib/teams";
import { isMedia } from "@/lib/utils";

export const metadata: Metadata = {
  title: strings.schedule.title,
  description: "Spielplaene und Tabellen aller Mannschaften des ETSV Lauda Handball.",
  alternates: { canonical: "/spieluebersicht" },
};

const EMPTY_TEAMS = "Sobald die Mannschaften angelegt sind, stehen hier alle Spiele.";

/**
 * Matchcenter: one collapsible section per team with its results and fixtures.
 *
 * Every panel is rendered on the server and handed to the client accordion as
 * a prop — the interactivity is the open/close state and nothing else.
 */
export default async function SchedulePage() {
  const [teams, settings] = await Promise.all([getTeams(), getSiteSettings()]);

  const clubLogoUrl = isMedia(settings.logos?.logo) ? settings.logos.logo.url : null;

  const items = teams.map((team) => ({
    id: team.slug,
    name: team.name,
    liga: team.liga,
    content: (
      <TeamSchedulePanel
        team={team}
        clubName={settings.siteName}
        clubLogoUrl={clubLogoUrl}
        clubId={settings.handballNet?.clubId}
      />
    ),
  }));

  return (
    <>
      <SectionShell background="primary">
        <SectionHeader
          headline={strings.schedule.title}
          subline={strings.schedule.subline}
          as="h1"
        />
      </SectionShell>

      <SectionShell background="backgroundDark">
        {items.length === 0 ? (
          <p className="text-muted text-[14px] leading-[1.5] md:text-[16px]">{EMPTY_TEAMS}</p>
        ) : (
          <MatchcenterAccordion items={items} />
        )}
      </SectionShell>
    </>
  );
}
