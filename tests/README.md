# Tests

Zwei getrennte Ebenen:

| Ebene      | Runner     | Ort      | Braucht    |
| ---------- | ---------- | -------- | ---------- |
| Unit       | Vitest     | `tests/` | nichts     |
| End-to-End | Playwright | `e2e/`   | DB + Build |

## Unit-Tests (Vitest)

```bash
pnpm test          # einmal durchlaufen
pnpm test:watch    # Watch-Modus
```

Getestet werden ausschliesslich reine Funktionen und Payload-Hooks aus `lib/`
und `fields/` — keine React-Komponenten, kein Datenbankzugriff, kein Netzwerk:

- `slugify.test.ts` — deutsche Umlaute (ä→ae, ö→oe, ü→ue, ß→ss), Sonderzeichen,
  Dedupe fuer die Seeds
- `slug-field.test.ts` — `formatSlug`: manuelle Eingabe gewinnt, sonst aus
  `title`/`name` erzeugt
- `format.test.ts` — Datums- und Zeitformate, fest auf Europe/Berlin
- `paths.test.ts` — zentrale URL-Helfer
- `calculateReadingTime.test.ts` — Lesezeit aus Lexical-Inhalt (200 WPM)
- `handball.test.ts` — Aufbereitung der handball.net-Daten; der Netzwerk-Client
  ist gemockt, die Fixture-Tabellen kommen aus `lib/handball/fixtures/`

Die Umgebung setzt `vitest.setup.ts`: Dummy-Werte fuer `DATABASE_URL` und
`PAYLOAD_SECRET` (sonst wirft `lib/env.ts` beim Import) sowie `TZ`.

## E2E-Tests (Playwright)

Die Specs laufen gegen eine **geseedete Datenbank** und einen **Produktions-Build**.
Der Dev-Server kompiliert jede Route beim ersten Aufruf und laesst die Tests in
Timeouts laufen — deshalb `pnpm build` statt `pnpm dev`.

```bash
docker compose up -d          # Postgres (Port 5502)
pnpm migrate                  # Schema
pnpm seed:admin               # Admin-Account
pnpm seed:baseline            # Startseite, Kategorien, Mannschaften
# … plus die redaktionellen Seeds (News, Spieler, Spiele, Sponsoren, Globals)

pnpm build
pnpm test:e2e                 # startet `pnpm start` selbst (Port 3000)
```

Laeuft auf Port 3000 bereits ein Server, benutzt Playwright ihn
(`reuseExistingServer`) und startet keinen zweiten.

Nuetzliche Varianten:

```bash
pnpm test:e2e --project=chromium        # nur Desktop
pnpm test:e2e --project=mobile          # nur 390×844
pnpm test:e2e e2e/news.spec.ts          # eine Datei
pnpm test:e2e --headed --debug          # sichtbarer Browser
npx playwright show-trace test-results/…/trace.zip
```

Browser einmalig installieren: `npx playwright install chromium`
(mehr wird nicht gebraucht — die Konfiguration hat nur Chromium-Projekte).

### Was die Specs abdecken

| Datei                 | Inhalt                                                               |
| --------------------- | -------------------------------------------------------------------- |
| `home.spec.ts`        | H1, News-Teaser, Naechste Spiele, Ligatabelle, Matchday-Bar, Footer  |
| `navigation.spec.ts`  | Burger, Overlay, Jugend-Flyout, Navigation zu `/news`, Schliessen    |
| `news.spec.ts`        | Grid, Kategorie-Filter (URL + Ergebnis), Detailseite, verwandte News |
| `teams.spec.ts`       | `/mannschaften/herren`: Hero, Trainingszeiten, Spieler, Tabelle, 404 |
| `matchcenter.spec.ts` | `/spieluebersicht`: Accordion, erstes offen, zweites aufklappen      |
| `sponsors.spec.ts`    | `/sponsoren`: Titel, Sponsoren, externe Links                        |
| `mobile.spec.ts`      | 390px: kein Seiten-Overflow, Scroll-Tracks, Full-Width-Nav           |
| `seo.spec.ts`         | Titles, Descriptions, JSON-LD, robots.txt, sitemap.xml, `/admin`     |

### Konventionen

- **Keine `data-testid`s** in Komponenten. Gesucht wird ueber Rollen und
  sichtbaren Text — was der Test findet, findet auch ein Screenreader.
- Textmuster sind **case-insensitive**: das Design setzt Ueberschriften per CSS
  (`text-transform: uppercase`) gross, im DOM steht weiter „Alle News“.
- Umlaute in Mustern immer als Alternative schreiben (`/spiel(ü|ue)bersicht/i`),
  damit ein Wechsel der Schreibweise im CMS keinen Test kippt.
- Gemeinsame Helfer liegen in `e2e/helpers.ts` (wird vom Runner nicht als Spec
  eingesammelt).
