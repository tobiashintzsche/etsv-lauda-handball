import Image from "next/image";
import Link from "next/link";

import { getNavigation, getSiteSettings } from "@/lib/globals";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";

import { HeaderActions } from "./HeaderActions";
import { NavOverlay } from "./NavOverlay";
import { toNavItems } from "./nav-items";

/**
 * Seitenkopf: Burger links, Wortmarke mittig (ab md), Instagram und Lupe
 * rechts. Klebt oben, damit das Menue auf langen Seiten erreichbar bleibt.
 *
 * Die weisse Unterkante mit dem Schein darunter (`border-b` + `shadow-header`)
 * ist Teil des Designs und trennt den Kopf von der hellen Matchday-Leiste.
 */
export async function Header() {
  const [navigation, settings] = await Promise.all([getNavigation(), getSiteSettings()]);

  const items = toNavItems(navigation.items);
  const actions = <HeaderActions instagramUrl={settings.socialLinks?.instagram} />;
  // Solange die Vereinsdaten noch nicht gespeichert sind, traegt der Logo-Link
  // wenigstens ein sprechendes Ziel statt eines leeren Namens.
  const homeLabel = settings.siteName ?? strings.nav.home;

  return (
    <header className="bg-primary border-fg-primary shadow-header sticky top-0 z-50 border-b">
      <div className="flex h-16 items-center justify-between px-4 md:h-[94px]">
        <div className="flex flex-1 items-center gap-3">
          <NavOverlay items={items} actions={actions} />

          <Link href={ROUTES.home} aria-label={homeLabel} className="md:hidden">
            <Image
              src="/brand/logo-bear-head-mobile.svg"
              alt=""
              width={39}
              height={32}
              unoptimized
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <Link href={ROUTES.home} className="hidden shrink-0 md:block">
          <Image
            src="/brand/logo-wordmark-full.svg"
            alt={homeLabel}
            width={222}
            height={62}
            unoptimized
            priority
            className="h-[62px] w-auto"
          />
        </Link>

        <div className="flex flex-1 justify-end">{actions}</div>
      </div>
    </header>
  );
}
