import type { Metadata } from "next";
import { Roboto, Roboto_Condensed, Ubuntu } from "next/font/google";
import { draftMode } from "next/headers";

import { JsonLd } from "@/components/JsonLd";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE_URL } from "@/lib/env";
import { anton } from "@/lib/fonts/anton";
import { getSiteSettings } from "@/lib/globals";
import { indexingAllowed } from "@/lib/seo";
import { strings } from "@/lib/strings";
import { sportsOrganization } from "@/lib/structured-data";
import { isMedia } from "@/lib/utils";

import "../globals.css";

/**
 * Roboto Condensed traegt alle Ueberschriften, Sublines, Nav-Eintraege und
 * Buttons — im Design durchgehend KURSIV. Roboto Condensed ist bereits die
 * wdth-75-Variante, deshalb genuegt hier `style: italic` zusaetzlich zu normal.
 */
const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-roboto-condensed",
});

/** Roboto (aufrecht) fuer Fliesstext, News-Titel und Tabellen. */
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-roboto",
});

/** Ubuntu ausschliesslich fuer die handball.net-Attribution. */
const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-ubuntu",
});

// Anton (Spieltagspost-Design) lives in lib/fonts/anton.ts — the matchday
// post render route loads it too, so the definition is shared.

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const favicon = isMedia(settings.logos?.favicon) ? settings.logos.favicon.url : null;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.siteName,
      // Routen liefern nur den nackten Titel — der Vereinsname haengt hier dran.
      template: `%s · ${settings.siteName}`,
    },
    description: settings.siteDescription ?? undefined,
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: settings.siteName,
      url: SITE_URL,
    },
    ...(favicon && { icons: { icon: favicon } }),
    // Die dritte Ebene des Sichtbarkeits-Schalters, neben robots.txt und
    // Sitemap: nur das Meta-Tag holt bereits indexierte Adressen wieder aus
    // Google raus. Routen erben es, solange sie kein eigenes `robots` setzen —
    // und die, die eines setzen, sperren ohnehin nur zusaetzlich.
    ...(!indexingAllowed(settings) && { robots: { index: false, follow: false } }),
  };
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, { isEnabled: isDraft }] = await Promise.all([getSiteSettings(), draftMode()]);

  return (
    <html
      lang="de"
      className={`${robotoCondensed.variable} ${roboto.variable} ${ubuntu.variable} ${anton.variable}`}
    >
      <body className="bg-primary text-fg-primary min-h-dvh antialiased">
        <JsonLd data={sportsOrganization(settings)} />

        <a
          href="#main"
          // z ueber dem klebenden Header (z-50), sonst verschwindet der
          // Sprunglink beim Fokussieren dahinter.
          className="focus:bg-secondary focus:text-fg-secondary sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:px-4 focus:py-2"
        >
          {strings.common.skipToContent}
        </a>

        <Header />

        <main id="main">{children}</main>

        <Footer />

        {isDraft ? <RefreshRouteOnSave /> : null}
      </body>
    </html>
  );
}
