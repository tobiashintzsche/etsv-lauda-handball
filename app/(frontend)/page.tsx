import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { RenderBlocks } from "@/blocks/RenderBlocks";
import { MatchdayBar } from "@/components/layout/MatchdayBar";
import { getPageBySlug } from "@/lib/pages";
import { isMedia } from "@/lib/utils";

const HOME_SLUG = "home";

/**
 * Startseite. Inhaltlich eine ganz normale Payload-Seite mit dem Slug „home“ —
 * so pflegt die Redaktion die Bausteine der Startseite genauso wie jede andere
 * Seite.
 *
 * Einzige Besonderheit: die Matchday-Bar aus dem Global `highlight-banner`
 * steht ueber den Bausteinen und erscheint nur hier.
 *
 * `RefreshRouteOnSave` haengt bereits im Layout am Draft-Cookie — hier nicht
 * noch einmal einhaengen, sonst laeuft pro Speichern ein doppelter Refresh.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(HOME_SLUG);
  if (!page) return {};

  const title = page.meta?.title || page.title;
  const description = page.meta?.description || undefined;
  const image = isMedia(page.meta?.image) ? page.meta.image.url : null;

  return {
    title,
    // Nur setzen, wenn die Redaktion etwas eingetragen hat: ein `description:
    // undefined` wuerde die Beschreibung aus `site-settings` (Layout) loeschen,
    // statt sie zu erben — die Seite haette dann gar keine Description.
    ...(description && { description }),
    alternates: { canonical: "/" },
    openGraph: {
      title,
      ...(description && { description }),
      url: "/",
      ...(image && { images: [{ url: image }] }),
    },
    ...(page.meta?.noindex && { robots: { index: false, follow: true } }),
  };
}

export default async function HomePage() {
  const { isEnabled: isDraft } = await draftMode();
  const page = await getPageBySlug(HOME_SLUG, isDraft);

  if (!page) notFound();

  return (
    <>
      <MatchdayBar />
      <RenderBlocks blocks={page.layout} />
    </>
  );
}
