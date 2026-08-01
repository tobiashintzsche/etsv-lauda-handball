/**
 * Erzeugt Spieltagspost-Vorschlaege aus dem Spielplan.
 *
 * Liest die Spiele der naechsten Tage (handball.net, sonst die eigene
 * `games`-Collection), gruppiert sie zu Spieltagen, trennt Heim und Auswaerts
 * und legt pro Post einen Vorschlag in der Collection `matchdayPosts` an.
 *
 * Idempotent: ein zweiter Lauf auf unveraenderten Daten legt nichts Neues an
 * und schreibt nichts. Freigegebene und verworfene Posts bleiben unangetastet.
 *
 * Usage:
 *   pnpm posts:generate
 *   pnpm posts:generate --days=90
 *   pnpm posts:generate --from=2026-09-01 --days=90
 *   pnpm posts:generate --from=2026-09-01 --to=2026-11-30
 *   pnpm posts:generate --offline     # handball.net ueberspringen
 *   pnpm posts:generate --dry-run     # nur zeigen, nichts schreiben
 *
 * Alternativ per Env: MATCHDAY_POSTS_DAYS, MATCHDAY_POSTS_FROM.
 */
import { generateDrafts } from "../lib/matchday-posts/generate";
import { DEFAULT_WINDOW_DAYS, resolveWindow, runMatchdayPipeline } from "../lib/matchday-posts/pipeline";
import { collectFixtures } from "../lib/matchday-posts/source";

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

const args = process.argv.slice(2);

/** `--days=90` / `--days 90` / `MATCHDAY_POSTS_DAYS=90`. */
function flag(name: string): string | undefined {
  const inline = args.find((a) => a.startsWith(`--${name}=`));
  if (inline) return inline.split("=").slice(1).join("=");
  const index = args.indexOf(`--${name}`);
  if (index >= 0 && args[index + 1] && !args[index + 1].startsWith("--")) return args[index + 1];
  return undefined;
}

function parseDate(value: string | undefined, label: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  if (Number.isNaN(date.getTime())) {
    console.error(`Ungueltiges Datum fuer ${label}: ${value}`);
    process.exit(1);
  }
  return date;
}

const OUTCOME_LABEL = {
  created: green("neu"),
  updated: yellow("aktualisiert"),
  unchanged: dim("unveraendert"),
  protected: dim("geschuetzt"),
} as const;

async function main() {
  // Dynamic import: Payload reads process.env at module load, so it must not
  // be hoisted above the env setup that `node --env-file` performs.
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const days = Number(flag("days") ?? process.env.MATCHDAY_POSTS_DAYS ?? DEFAULT_WINDOW_DAYS);
  const options = {
    from: parseDate(flag("from") ?? process.env.MATCHDAY_POSTS_FROM, "--from"),
    to: parseDate(flag("to"), "--to"),
    days: Number.isFinite(days) && days > 0 ? days : DEFAULT_WINDOW_DAYS,
    useLive: !args.includes("--offline"),
    // Kein Next.js-Request-Scope im Skript — siehe CLAUDE.md: nach einem Lauf
    // sieht ein laufender Dev-Server die neuen Posts erst nach einem Neustart.
    disableRevalidate: true,
  };

  const window = resolveWindow(options);
  console.log(
    `\n${bold("Spieltagsposts")} ${dim(
      `${window.from.slice(0, 10)} … ${window.to.slice(0, 10)} (${window.days} Tage)`,
    )}`,
  );

  if (args.includes("--dry-run")) {
    const { fixtures, tiers } = await collectFixtures(payload, {
      from: window.from,
      to: window.to,
      useLive: options.useLive,
    });
    const drafts = generateDrafts(fixtures);
    console.log(
      dim(`  ${fixtures.length} Spiele (live ${tiers.live}, Collection ${tiers.collection})`),
    );
    for (const draft of drafts) {
      console.log(`  ${dim("·")} ${draft.title} ${dim(`[${draft.postType}]`)}`);
      for (const game of draft.games) {
        console.log(dim(`      ${game.time}  ${game.homeTeam} — ${game.awayTeam}`));
      }
    }
    console.log(`\n${yellow("--dry-run")}: ${drafts.length} Vorschlaege, nichts geschrieben\n`);
    process.exit(0);
  }

  const result = await runMatchdayPipeline(payload, options);

  console.log(
    dim(
      `  ${result.fixtureCount} Spiele (live ${result.tiers.live}, ` +
        `Collection ${result.tiers.collection}) → ${result.entries.length} Posts\n`,
    ),
  );

  for (const entry of result.entries) {
    const label = OUTCOME_LABEL[entry.outcome];
    const suffix = entry.status ? dim(` (${entry.status})`) : "";
    console.log(
      `  ${label.padEnd(22)} ${entry.title} ` +
        dim(
          `[${entry.postType}, ${entry.gameCount} ${entry.gameCount === 1 ? "Spiel" : "Spiele"}, #${entry.id}]`,
        ) +
        suffix,
    );
  }

  console.log(
    `\n${green(`${result.created} neu`)}, ${yellow(`${result.updated} aktualisiert`)}, ` +
      `${dim(`${result.unchanged} unveraendert`)}, ${dim(`${result.protected} geschuetzt`)}\n`,
  );

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
