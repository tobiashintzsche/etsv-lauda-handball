import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { RenderBlocks } from "@/blocks/RenderBlocks";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/env";
import { getPageBySlug, getPageSlugs } from "@/lib/pages";
import { isMedia } from "@/lib/utils";

import { PageHeader } from "./_components/PageHeader";

type Params = { params: Promise<{ slug: string }> };

const HOME_SLUG = "home";

/**
 * Alle redaktionell gepflegten Seiten (Impressum, Kontakt, Ueber den Verein …).
 * Die Startseite ist ausgenommen — sie liegt unter „/“ und hat eine eigene Route.
 */
export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return slugs.filter((slug) => slug !== HOME_SLUG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};

  const title = page.meta?.title || page.title;
  const description = page.meta?.description || undefined;
  const image = isMedia(page.meta?.image) ? page.meta.image.url : null;

  return {
    title,
    // Nur setzen, wenn gepflegt — sonst erbt die Seite die Beschreibung aus
    // `site-settings`. Ein explizites `undefined` wuerde sie stattdessen loeschen.
    ...(description && { description }),
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title,
      ...(description && { description }),
      url: `/${slug}`,
      ...(image && { images: [{ url: image }] }),
    },
    ...(page.meta?.noindex && { robots: { index: false, follow: true } }),
  };
}

/**
 * Zweistufiger Breadcrumb (Startseite → diese Seite). Mehr Ebenen gibt es
 * nicht: redaktionelle Seiten haengen alle direkt an der Wurzel.
 */
function breadcrumbList(title: string, slug: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: new URL(`/${slug}`, SITE_URL).toString(),
      },
    ],
  };
}

export default async function DynamicPage({ params }: Params) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const page = await getPageBySlug(slug, isDraft);

  if (!page || slug === HOME_SLUG) notFound();

  return (
    <>
      <JsonLd data={breadcrumbList(page.title, slug)} />
      <PageHeader title={page.title} />
      {/* Die Seite bringt ihre h1 schon mit — der erste Baustein bleibt bei h2. */}
      <RenderBlocks blocks={page.layout} pageHasHeading />
    </>
  );
}
