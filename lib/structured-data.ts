import type { News, SiteSetting, Team } from "@payload-types";

import { SITE_URL } from "./env";
import { newsPath, teamPath } from "./paths";
import { isMedia } from "./utils";

/**
 * schema.org builders. Kept in one place so every route emits the same shape
 * and the club's identity (`@id`) stays stable across page types.
 */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function sportsOrganization(settings: SiteSetting): Record<string, unknown> {
  const logo = isMedia(settings.logos?.logo) ? settings.logos.logo.url : null;

  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "@id": ORGANIZATION_ID,
    name: settings.siteName,
    sport: "Handball",
    url: SITE_URL,
    ...(settings.siteDescription && { description: settings.siteDescription }),
    ...(logo && { logo: new URL(logo, SITE_URL).toString() }),
    ...(settings.contact?.email && { email: settings.contact.email }),
    ...(settings.contact?.phone && { telephone: settings.contact.phone }),
    ...(settings.address?.street && {
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address.street,
        postalCode: settings.address.zip ?? undefined,
        addressLocality: settings.address.city ?? undefined,
        addressCountry: "DE",
      },
    }),
    sameAs: [settings.socialLinks?.instagram, settings.socialLinks?.facebook].filter(Boolean),
  };
}

export function sportsTeam(team: Team): Record<string, unknown> {
  const image = isMedia(team.teamImage) ? team.teamImage.url : null;

  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "Handball",
    url: new URL(teamPath(team.slug), SITE_URL).toString(),
    ...(image && { image: new URL(image, SITE_URL).toString() }),
    ...(team.introductionText && { description: team.introductionText }),
    memberOf: { "@id": ORGANIZATION_ID },
  };
}

export function newsArticle(news: News, siteName: string): Record<string, unknown> {
  const cover = isMedia(news.coverImage) ? news.coverImage.url : null;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.excerpt,
    url: new URL(newsPath(news.slug), SITE_URL).toString(),
    datePublished: news.publishedAt,
    dateModified: news.updatedAt,
    ...(cover && { image: new URL(cover, SITE_URL).toString() }),
    ...(news.author?.name && {
      author: { "@type": "Person", name: news.author.name },
    }),
    publisher: { "@id": ORGANIZATION_ID, name: siteName },
  };
}
