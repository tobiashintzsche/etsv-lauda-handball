import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { ArticleBody } from "@/components/news/ArticleBody";
import { ArticleHeader } from "@/components/news/ArticleHeader";
import { NewsTeaserSection } from "@/components/news/NewsTeaserSection";
import { CmsCta } from "@/components/ui/CmsCta";
import { getSiteSettings } from "@/lib/globals";
import { getNewsBySlug, getNewsSlugs } from "@/lib/news";
import { newsPath } from "@/lib/paths";
import { newsArticle } from "@/lib/structured-data";
import { CONTAINER_ARTICLE, SECTION_PADDING, cn, isMedia } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return {};

  const cover = isMedia(news.coverImage) ? news.coverImage.url : null;

  return {
    title: news.meta?.title || news.title,
    description: news.meta?.description || news.excerpt,
    alternates: { canonical: newsPath(slug) },
    openGraph: {
      type: "article",
      title: news.title,
      description: news.excerpt,
      publishedTime: news.publishedAt ?? undefined,
      ...(cover && { images: [{ url: cover }] }),
    },
    ...(news.meta?.noindex && { robots: { index: false, follow: true } }),
  };
}

/**
 * Artikelseite. Der Text steht auf der Beton-Textur im schmalen 690px-Raster
 * (Design 2.4), darunter folgt der News-Teaser auf dem Standard-Blau.
 * Im Draft-Modus kommt der Beitrag ungecacht und ungefiltert aus Payload.
 */
export default async function NewsDetailPage({ params }: Params) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const [news, settings] = await Promise.all([getNewsBySlug(slug, isDraft), getSiteSettings()]);

  if (!news) notFound();

  const author = news.author?.name ? news.author : null;

  return (
    <>
      <JsonLd data={newsArticle(news, settings.siteName)} />

      <article className="texture-section-alt">
        <div className={cn(CONTAINER_ARTICLE, SECTION_PADDING)}>
          <ArticleHeader news={news} />

          <ArticleBody data={news.body} className="mt-8" />

          <CmsCta link={news.relatedCta?.link} className="mt-8" />

          {author ? (
            <p className="text-muted mt-8 text-[12px] leading-5 uppercase">
              {author.name}
              {author.role ? ` · ${author.role}` : ""}
            </p>
          ) : null}
        </div>
      </article>

      <NewsTeaserSection excludeId={news.id} />
    </>
  );
}
