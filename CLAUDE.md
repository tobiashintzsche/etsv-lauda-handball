# ETSV Lauda Handball — Website

Payload CMS 3 + Next.js 16 (App Router) + Tailwind v4 + Postgres. Einsprachig deutsch.

## Stack

| Baustein  | Wahl                                                            |
| --------- | --------------------------------------------------------------- |
| Runtime   | Node 22 (`.nvmrc`), pnpm, ESM (`"type": "module"`)              |
| Framework | Next 16.2 (App Router, Turbopack, React Compiler), React 19.2   |
| CMS       | Payload 3.87, Postgres via `@payloadcms/db-postgres`            |
| Styling   | Tailwind v4 CSS-first (`app/globals.css`, KEIN tailwind.config) |
| Uploads   | Vercel Blob in Produktion, lokales Dateisystem ohne Token       |
| SEO       | `@payloadcms/plugin-seo` + `@payloadcms/plugin-redirects`       |

**Kein i18n.** Kein `next-intl`, kein `[locale]`-Segment, kein `localized: true`.
UI-Strings liegen typisiert in `lib/strings.ts`. Mehrsprachigkeit waere spaeter
per Migration nachruestbar — bis dahin nicht vorbereiten.

## Befehle

```bash
pnpm dev                      # Entwicklungsserver (http://localhost:3000)
pnpm build                    # Produktions-Build
pnpm ci                       # migrate + build (= Vercel buildCommand)
pnpm lint                     # ESLint
pnpm typecheck                # tsc --noEmit
pnpm format                   # Prettier
pnpm test                     # Vitest (Unit)
pnpm test:e2e                 # Playwright (braucht Build + Seed, siehe tests/README.md)

pnpm payload generate:types      # NACH JEDER Schema-Aenderung
pnpm payload generate:importmap  # nach neuen Admin-Komponenten
pnpm migrate:create <name>       # Migration aus dem Schema-Diff erzeugen
pnpm migrate                     # Migrationen anwenden

pnpm seed:admin               # ersten Admin-Account anlegen
pnpm seed:baseline            # Startseite, News-Kategorien, 6 Mannschaften
pnpm seed:demo                # redaktionelle Demo-Inhalte (News, Spieler, Spiele,
                              # Sponsoren, Seiten, Globals) — setzt seed:baseline voraus
                              # Flags: --media-only, --skip-media
```

> Die Seed-Skripte schreiben mit `context: { disableRevalidate: true }` und
> purgen deshalb keine Cache-Tags. Nach einem Seed-Lauf zeigt ein laufender
> Dev-Server noch die alten (leeren) Loader-Ergebnisse — `.next` loeschen und
> neu starten, sonst sucht man den Fehler im Loader statt im Cache.

### Datenbank lokal

`docker compose up -d` startet Postgres 17 auf Port **5502**.

Auf dieser Maschine ist Docker nicht installiert — die `.env` zeigt deshalb auf
ein per Homebrew laufendes Postgres 17 auf **5432** (`etsv_lauda`, Rolle
`postgres`/`postgres`). Beim Wechsel auf Docker nur die `DATABASE_URL` anpassen.

## Struktur (Root-flach, KEIN src/)

```
app/(frontend)/     Website — layout.tsx, page.tsx (home), [slug], news, mannschaften, …
app/(payload)/      Admin + API (von Payload generiert, nicht per Hand aendern)
app/globals.css     Einzige globale CSS-Datei (Design-Tokens, Texturen, Utilities)
blocks/             NameBlock.ts (Config) + Name.tsx (Komponente) nebeneinander
collections/        Payload-Collections
globals/            Payload-Globals
fields/             Feld-Factories (link, slug, section)
components/ui/      Geteilte Primitives (SectionHeader, ArrowLink, SectionShell, …)
components/cards/   Karten (NewsCard)
components/icons/   SVG-Icons als React-Komponenten
components/layout/  Header, Footer, Navigation (Phase B1)
lib/                Loader, Formatierung, Hilfsfunktionen
lib/payload-hooks/  Wiederverwendbare Payload-Hooks
migrations/         Wird committed
scripts/            Seed-Skripte
```

Pfad-Aliase: `@/*`, `@payload-types`, `@payload-config`.
Routenspezifische Komponenten mit `_`-Prefix kolokalisieren (`_components/`).

## Konventionen

### Code

- Ein File, eine Verantwortung. Eine exportierte Komponente pro Datei. Ziel < 200 Zeilen.
- **Code und Kommentare auf Englisch. CMS-Labels und `admin.description` auf Deutsch.**
  Jedes Payload-Feld bekommt eine `admin.description`, die einem Vereinsmitglied
  ohne Technikhintergrund erklaert, wofuer das Feld da ist.
- Naming: `PascalCase.tsx` Komponenten, `use-kebab.ts` Hooks, `kebab-case.ts` Utils,
  `UPPER_SNAKE` Konstanten.
- Server Components per Default. `"use client"` nur bei State, Events oder Browser-APIs.
  Kein Daten-Fetching in `useEffect`.
- Kein `any` (ESLint: error). Kein `next/image` umgehen. WCAG AA einhalten.
- Keine hartkodierten Farben oder Texte in JSX — Farben ueber Tailwind-Tokens,
  Texte ueber `lib/strings.ts` bzw. das CMS.
- **Vereinsdaten (Name, Adresse, Social Links, Vereins-IDs) IMMER aus dem Global
  `site-settings`**, nie fest im JSX.

### Daten

- **Niemals `payload.find` direkt in einer Page.** Immer ueber einen Loader in
  `lib/` mit `unstable_cache`.
- Cache-Tags: `<collection>` und `<collection>-<slug>`. Die
  `revalidateCollection`-Hooks purgen sie beim Speichern.
- Draft-Modus umgeht den Cache komplett (Live-Preview muss frisch sein).
- News-Sichtbarkeit ist doppelt bedingt: `_status === "published"` UND
  `publishedAt <= now`. Die Bedingung steht in `publishedNewsWhere()` — nicht
  neu ausformulieren.
- Payload-Hooks: `beforeChange` transformiert, `afterChange` macht Seiteneffekte,
  `afterDelete` raeumt auf.

### Payload-Schema

- `push: false`. Schema-Aenderungen laufen lokal wie in Produktion ausschliesslich
  ueber Migrations.
- Nach jeder Schema-Aenderung `pnpm payload generate:types`.
- **`dbName` bei Blocks als Funktion**: `dbName: ({ tableName }) => \`${tableName}_b_x\``.
  Sonst teilen sich Blocks aus verschiedenen Collections eine Tabelle.
- Der `defaultValue` eines Selects MUSS in den `options` stehen — Postgres legt
  daraus ein Enum an und lehnt fremde Werte ab.
- Bei Feldern mit `admin.condition` statt `required: true` lieber `validate`
  benutzen: ein ausgeblendetes Pflichtfeld blockiert sonst das Speichern.
- `admin.group`: „Inhalte" (Pages, News, NewsCategories), „Verein" (Teams, Players,
  Games, Sponsors), „System" (Users, Media), „Einstellungen" (Globals, Redirects).

### Sichtbarkeit

Der Schalter „Website von Suchmaschinen finden lassen" (Vereinsdaten →
Sichtbarkeit, Feld `isIndexable`) nimmt die **ganze** Seite aus dem Index. Er
wirkt an drei Stellen, weil keine allein genuegt — wer eine davon anfasst, muss
die anderen mitdenken:

| Ebene      | Datei                             | Verhalten bei „aus"                |
| ---------- | --------------------------------- | ---------------------------------- |
| robots.txt | `app/robots.ts` (`force-dynamic`) | `Disallow: /`, sofort              |
| Sitemap    | `app/sitemap.ts`                  | leer, mit bis zu 1 h Verzug        |
| Meta-Tag   | `app/(frontend)/layout.tsx`       | `robots: noindex,nofollow`, sofort |

Ausgewertet wird der Schalter ausschliesslich ueber `lib/seo.ts`. Nur ein
explizites `false` sperrt — ein fehlender Wert gilt als indexierbar, damit eine
Live-Seite nie versehentlich aus Google faellt.

Davon unabhaengig: `meta.noindex` pro Dokument (SEO-Plugin) nimmt eine einzelne
Seite aus Sitemap und Suche, und `app/robots.ts` sperrt Preview-Deployments
ohnehin komplett (`VERCEL_ENV !== "production"`).

### Bausteine

Registriert in `blocks/index.ts` (`pageBlocks`), in genau dieser Reihenfolge:
`heroSlider` · `content` · `newsTeaser` · `about` · `imageGrid` · `nextGames` ·
`leagueTable` · `sponsorsBlock`. Config liegt als `blocks/NameBlock.ts`, die
Komponenten unter `blocks/Name/` (`Server.tsx` fuer datengetriebene Bausteine).

**H1-Regel:** Genau eine h1 pro Seite — die E2E-Suite erzwingt das. Den
Abschnittskopf mit `as={isFirst ? "h1" : "h2"}` traegt der erste Baustein, der
ueberhaupt eine Ueberschrift rendern kann. Bausteine ohne Abschnittskopf stehen
in `BLOCKS_WITHOUT_HEADING` (`blocks/RenderBlocks.tsx`) und ueberspringen den
Index — der Hero-Slider zeigt einen wechselnden News-Titel und darf ihn deshalb
weder als h1 rendern noch die h1 des naechsten Bausteins verbrauchen.

### Design

Tokens stehen in `app/globals.css` unter `@theme inline` — Quelle ist die
Figma-Spezifikation, nicht der Augenmaß-Abgleich am Screenshot.

- Farben: `primary` #1A213B · `secondary` #FDC52C · `background-dark` #14192E ·
  `fg-primary` #fff · `fg-secondary` #000 · `muted` #D6D6D6 · `line` #ADADAD ·
  `placeholder` #8D8D8D · `position` #323850
- Schriften: `font-condensed` (Roboto Condensed, **immer kursiv**) fuer alle
  Ueberschriften, Sublines, Nav und Buttons · `font-sans` (Roboto) fuer Fliesstext,
  News-Titel und Tabellen · `font-ubuntu` **nur** fuer die handball.net-Attribution.
- Container hart 1024px (`CONTAINER`), Artikel 690px (`CONTAINER_ARTICLE`).
- Sektions-Abstand `py-8 md:py-16` (`SECTION_PADDING`).
- Radien fast ueberall 0. Ausnahmen: handball.net-Button 3.5px, Score-Badge 4px.
- Kein Dark-Mode-Schalter — die Seite IST dunkel. Die Abwechslung entsteht ueber
  `sectionBackground` (siehe `fields/section.ts` + `lib/section-backgrounds.ts`).
- Blocks setzen **nie selbst** `bg-*` oder `text-white`. Hintergrund und Textfarbe
  kommen immer als Paar aus `backgroundClass()`. Einzige Ausnahme: der
  Hero-Slider — er hat kein `sectionBackground`, weil er immer das Bildband ist.
- Der Hero-Slider ist der einzige Abschnitt, der **breiter** als 1024px laeuft:
  Bildrahmen `max-w-[1440px]` mit `md:px-6`, mobil randlos. Chip, Titelkasten,
  Dots und „Alle News“ liegen trotzdem im 1024er-Raster — sie stehen als
  absolute Ebene direkt im `<section>`, nicht im Bildrahmen. Wer sie in den
  Rahmen schiebt, verschiebt sie gegenueber allen Abschnitten darunter.
- Mobile Scroll-Tracks (News-Teaser, „Mehr als Handball", Spielerkarten,
  Ligatabelle) NICHT zu gestapelten Grids „korrigieren" — der Anschnitt ist Absicht.
  Utility: `.scroll-track`.

### Rechtliches

- Unter **jeder** handball.net-Tabelle und jedem Spielplan steht
  `<HandballAttribution />`. Das ist eine Auflage der Datenquelle, keine Option.
- Die Datenschutzerklaerung braucht einen Hinweis, dass handball.net
  anonymisierte Besucherstatistiken erhebt (Speicherung max. 3 Monate).

## Phase B — offene Arbeiten

Die Dateihoheit ist zwischen den Phase-B-Agenten aufgeteilt. **Keine fremden
Dateien anfassen.** `app/globals.css`, `collections/`, `globals/`, `fields/` und
`payload.config.ts` gehoeren Phase A — bei einem echten Blocker minimal aendern
und im Abschlussreport dokumentieren.

### B1 — Chrome (`components/layout/**`)

- `Header.tsx` (Burger, Wortmarke, Instagram/Suche; Desktop 94px, Mobile 64px,
  `border-b` 1px weiss + `drop-shadow(0 4px 4px rgba(255,255,255,.4))`)
- `NavOverlay.tsx` (Client): Panel 260px Desktop / full-width Mobile, `#14192E`,
  Flyout-Ebene 263px `#F9F9F9`
- `Footer.tsx`, `MemberBanner.tsx`, `MatchdayBar.tsx`
- Platzhalter in `app/(frontend)/layout.tsx` ersetzen (mit `TODO Phase B1` markiert)

### B2 — News + Sponsoren

- `app/(frontend)/news/**`: Filterleiste (Client), Pagination, Detail-Teile
- `app/(frontend)/sponsoren/**`: alternierendes 3-Spalten-Raster
- `components/news/**`, RichText-Converter-Factory fuer den Artikeltext

### B3 — Teams + handball.net

- `app/(frontend)/mannschaften/**`, `app/(frontend)/spieluebersicht/**`
- `components/teams/**` (TeamHero, PlayerCard, TrainingInfo)
- `blocks/NextGames*.tsx`, `blocks/LeagueTable*.tsx`
- `lib/handball/**`: `getTable(tournamentId)` gegen die handball.net-JSON-Route
  (Pfad live verifizieren), `next: { revalidate: 300 }`, bei Fehler oder leerem
  Ergebnis ein gestylter Empty-State — **kein Crash**.
  Fallback: offizielles Widget-Embed (`_hb`-Queue, Loader genau einmal pro Seite).

### B4 — Home + Pages

- `blocks/RenderBlocks.tsx` (Dispatcher: switch ueber `blockType`, `{...block}`-Spread,
  `isFirst` fuer die H1-Regel), `blocks/Content*.tsx`, `About*`, `ImageGrid*`,
  `NewsTeaser*`, `Sponsors*`, `HeroSlider*`
- `app/(frontend)/page.tsx` und `[slug]/page.tsx` mit `RenderBlocks` fuellen
- `loading.tsx` / `error.tsx` je Routen-Ebene
- `sitemap.ts` verfeinern: `lastModified` aus `updatedAt`, `noindex`-Dokumente
  ausfiltern (aktuell noch als TODO markiert)

### Uebergreifend offen

- Seed-Skript fuer **redaktionelle** Inhalte. Die Struktur steht bereits
  (`pnpm seed:baseline`: Startseite, 5 News-Kategorien, 6 Mannschaften inkl.
  handball.net-IDs). Offen: Demo-News, Sponsoren (Logos in
  `scripts/seed-assets/`), Spielerkader, Spiele, Impressum/Datenschutz als
  Platzhalterseiten, Globals (`site-settings`, `navigation`, `footer`).
- Redaktionelle Fotos fehlen (Team, Spieler, News) — via Unsplash seeden.
  Beim Seeding auf 2400×1500 skalieren: strikt groesser als die groesste
  `imageSize`, sonst Duplicate-Blob-Crash. PNGs mit Alpha roh durchreichen.
- `opengraph-image.tsx` (next/og) fuer News und Mannschaften.

## Bekannte offene Punkte

Todo-Liste aus Code-Review und Phase D — nichts davon blockiert den Betrieb.

- `redirectsPlugin` liefert nur das Schema: kein `middleware.ts` wertet es aus.
- N+1 auf `/spieluebersicht`: ~27 Queries fuer 9 Teams, 8 Panels bleiben zu.
- Datumsformatierung 3× (`lib/format.ts`, `blocks/NextGames`, `MatchcenterCard`).
- News-Teaser-Abschnitt 3× nachgebaut, bereits auseinandergedriftet.
- `readingTime` toter Pfad: berechnet und gepflegt, nirgends gerendert.
- `imageSizes` werden erzeugt und bezahlt, aber nur vom Hero-Slider ausgeliefert
  (`coverImage.sizes.hero.url`) — alle anderen Stellen nehmen weiter `media.url`.
- Terminierte News gehen bis zu 60 min zu spaet live (Cache friert `now` ein).
- Soft-404: `notFound()` liefert unter Next 16.2.12 Status 200 statt 404.
- Keine Datenschutz-Seite, keine `opengraph-image`-Routen.
- Die globale Suche (`/suche`, `lib/search.ts`) laeuft ungecacht und ohne
  Paginierung: 10 Treffer je Gruppe (News, Mannschaften, Seiten, Sponsoren).
- A11y-Rest: gelbe Hover-Farben auf hellem Grund (~1.4:1) in `MatchdayGame`,
  `ArrowLink`, `HandballAttribution`. Fokus-Outline ist gefixt.
