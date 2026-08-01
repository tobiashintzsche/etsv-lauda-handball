import type { Metadata } from "next";
import Link from "next/link";

import { getMatchdayPosts } from "@/lib/matchday-posts/load";
import { matchdayStrings } from "@/lib/matchday-posts/strings";
import type { MatchdayPostStatus, MatchdayPostType } from "@/lib/matchday-posts/types";

/**
 * Uebersicht der Spieltagsposts — der Einstieg fuer die Redaktion und der
 * einzige Ort, an dem die Ansichtsseiten verlinkt sind. `noindex` wie die
 * Detailseiten: Redaktionswerkzeug, kein Website-Inhalt.
 */

export const metadata: Metadata = {
  title: matchdayStrings.overview.title,
  robots: { index: false, follow: false },
};

export default async function MatchdayPostsPage() {
  const posts = await getMatchdayPosts();

  return (
    <div className="mx-auto w-full max-w-[1024px] px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl">{matchdayStrings.overview.title}</h1>
      <p className="text-muted mt-2 mb-8">{matchdayStrings.overview.intro}</p>

      {posts.length === 0 ? (
        <p>{matchdayStrings.overview.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id} className="border-line border-b pb-3">
              <Link href={`/spieltagspost/${post.id}`} className="text-secondary underline">
                {post.title}
              </Link>
              <span className="text-muted block text-sm">
                {matchdayStrings.status[post.status as MatchdayPostStatus]} ·{" "}
                {matchdayStrings.postType[post.postType as MatchdayPostType]} ·{" "}
                {matchdayStrings.overview.games(post.games?.length ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
