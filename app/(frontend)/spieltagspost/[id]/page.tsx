import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { toPostSource } from "@/lib/matchday-posts/document";
import { getMatchdayPost } from "@/lib/matchday-posts/load";
import { matchdayStrings } from "@/lib/matchday-posts/strings";
import type { MatchdayPostStatus, MatchdayPostType } from "@/lib/matchday-posts/types";
import { buildPostView } from "@/lib/matchday-posts/view-model";

import { MatchdayPostCanvas } from "../_components/MatchdayPostCanvas";
import { PostViewer } from "../_components/PostViewer";

/**
 * Ansicht eines Spieltagsposts in Originalgroesse.
 *
 * `?raw=1` rendert nur die Flaeche, ohne Rahmen und ohne Skalierung — dafuer
 * gibt es den Screenshot-Weg und die Kontrolle gegen die Figma-Vorlage.
 *
 * Die Seite ist bewusst `noindex`: sie ist ein Redaktionswerkzeug, kein Inhalt.
 */

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ raw?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getMatchdayPost(id);

  return {
    title: post?.title ?? matchdayStrings.detail.notFound,
    robots: { index: false, follow: false },
  };
}

export default async function MatchdayPostPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const post = await getMatchdayPost(id);
  if (!post) notFound();

  const view = buildPostView(toPostSource(post));

  // Der klebende Header liegt auf z-50 und wuerde sonst ueber dem Post liegen —
  // in der Rohansicht muss die Flaeche unverdeckt bleiben (Screenshot, Export).
  if (query.raw === "1")
    return (
      <div className="relative z-[60] w-fit">
        <MatchdayPostCanvas view={view} />
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 py-8 md:py-12">
      <p className="mb-2">
        <Link href="/spieltagspost" className="text-secondary underline">
          {matchdayStrings.detail.back}
        </Link>
      </p>

      <h1 className="text-2xl md:text-3xl">{post.title}</h1>

      <p className="text-muted mt-1 mb-6 text-sm">
        {matchdayStrings.status[post.status as MatchdayPostStatus]} ·{" "}
        {matchdayStrings.postType[post.postType as MatchdayPostType]} ·{" "}
        {matchdayStrings.overview.games(post.games?.length ?? 0)}
      </p>

      <PostViewer>
        <MatchdayPostCanvas view={view} />
      </PostViewer>

      <p className="mt-6">
        <a
          href={`/api/matchday-post/${post.id}/image`}
          download={`spieltagspost-${post.id}.png`}
          className="bg-secondary text-fg-secondary font-condensed inline-block px-4 py-2 font-bold uppercase italic"
        >
          {matchdayStrings.detail.download}
        </a>
      </p>

      {post.caption ? (
        <section className="mt-8">
          <h2 className="text-xl">{matchdayStrings.detail.caption}</h2>
          <pre className="text-muted mt-2 font-sans text-sm whitespace-pre-wrap">
            {post.caption}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
