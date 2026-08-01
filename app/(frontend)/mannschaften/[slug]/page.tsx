import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LeagueTableServer } from "@/blocks/LeagueTable/Server";
import { NextGamesServer } from "@/blocks/NextGames/Server";
import { JsonLd } from "@/components/JsonLd";
import { TeamHero } from "@/components/teams/TeamHero";
import { TeamNews } from "@/components/teams/TeamNews";
import { TeamPlayers } from "@/components/teams/TeamPlayers";
import { getNewsList } from "@/lib/news";
import { strings } from "@/lib/strings";
import { sportsTeam } from "@/lib/structured-data";
import { getPlayersByTeam, getTeamBySlug, getTeamSlugs } from "@/lib/teams";

type Params = { params: Promise<{ slug: string }> };

const TEAM_NEWS_LIMIT = 4;

export async function generateStaticParams() {
  const slugs = await getTeamSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) return {};

  return {
    title: team.meta?.title || team.name,
    description: team.meta?.description || team.introductionText || undefined,
    alternates: { canonical: `/mannschaften/${slug}` },
    ...(team.meta?.noindex && { robots: { index: false, follow: true } }),
  };
}

/**
 * Team page. Fixed composition, no page builder: hero, squad, fixtures, league
 * table and the team's own news.
 *
 * The fixture and table sections reuse the page blocks of the same name. They
 * take a block-shaped object rather than a second set of props, so a change to
 * the block renders identically here and on any CMS page that embeds it.
 */
export default async function TeamDetailPage({ params }: Params) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);

  if (!team) notFound();

  const [players, news] = await Promise.all([
    getPlayersByTeam(team.id),
    getNewsList({ teamId: team.id, limit: TEAM_NEWS_LIMIT }),
  ]);

  return (
    <>
      <JsonLd data={sportsTeam(team)} />

      <TeamHero team={team} />

      <TeamPlayers players={players} />

      {team.showNextGames === false ? null : (
        <NextGamesServer
          block={{
            blockType: "nextGames",
            headline: strings.games.headline,
            team,
            maxPerColumn: 3,
          }}
        />
      )}

      {team.showTable === false ? null : (
        <LeagueTableServer
          block={{
            blockType: "leagueTable",
            team,
            sectionBackground: "backgroundDark",
          }}
        />
      )}

      <TeamNews news={news.docs} />
    </>
  );
}
