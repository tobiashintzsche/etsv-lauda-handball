import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Payload } from "payload";

import { log } from "./log";
import { WRITE_OPTS, findFirst } from "./payload-helpers";

/**
 * Curated image set for the demo content.
 *
 * Photos come from Unsplash (free licence) and are cached in `tmp/` on first
 * run, so a second seed works offline and produces byte-identical uploads.
 * Club crest and the two real sponsor logos are repo assets; the two invented
 * sponsors get a generated SVG wordmark.
 *
 * Every JPEG is resized to at least 2400px on its long edge — strictly larger
 * than the biggest configured `imageSize` (hero 1920×1080). A source smaller
 * than a size makes Payload reuse the original file name for that size, which
 * collides once uploads move to Vercel Blob.
 */

const CACHE_DIR = path.resolve("tmp/seed-demo-images");
const LANDSCAPE = { w: 2400, h: 1500 } as const;
const PORTRAIT = { w: 2400, h: 3000 } as const;

type ImageEntry = {
  /** Stable key referenced by the content modules. */
  key: string;
  alt: string;
  /** Unsplash photo id (the part after `photo-`). */
  id?: string;
  /** Repo-relative path — used instead of a download. */
  file?: string;
  /** Inline SVG source — rendered to PNG via sharp. */
  svg?: string;
  /** Portrait crops are framed on faces and stay tall. */
  orientation?: "landscape" | "portrait";
};

/** Wordmark placeholder for the two invented sponsors. */
function wordmark(top: string, bottom: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200">
  <rect x="0" y="470" width="220" height="140" fill="#1A213B"/>
  <text x="300" y="560" font-family="Helvetica, Arial, sans-serif" font-size="180"
        font-weight="700" fill="#1A213B">${top}</text>
  <text x="300" y="740" font-family="Helvetica, Arial, sans-serif" font-size="130"
        fill="#FDC52C">${bottom}</text>
</svg>`;
}

export const IMAGES = [
  // ── Repo assets & generated logos ───────────────────────────────────────
  {
    key: "crest",
    file: "scripts/seed-assets/club-crest-etsv-lauda.png",
    alt: "Vereinswappen des ETSV Lauda",
  },
  {
    key: "sponsorDistelhaeuser",
    file: "scripts/seed-assets/sponsor-distelhaeuser.png",
    alt: "Logo der Distelhäuser Brauerei",
  },
  { key: "sponsorBsafe", file: "scripts/seed-assets/sponsor-bsafe.png", alt: "Logo von b.safe" },
  {
    key: "sponsorAutohaus",
    svg: wordmark("Autohaus", "Main-Tauber"),
    alt: "Logo des Autohaus Main-Tauber",
  },
  {
    key: "sponsorElektro",
    svg: wordmark("Elektro Rebholz", "Lauda-Königshofen"),
    alt: "Logo von Elektro Rebholz",
  },

  // ── Mannschaftsfotos ────────────────────────────────────────────────────
  {
    key: "teamMaenner",
    id: "1577471488278-16eec37ffcc2",
    alt: "Spielszene in einer gut gefüllten Sporthalle",
  },
  { key: "teamMB", id: "1543326727-cf6c39e8f84c", alt: "Zwei jugendliche Spieler im Zweikampf" },
  {
    key: "teamMC",
    id: "1526232761682-d26e03ac148e",
    alt: "Jugendmannschaft mit ihrem Trainer vor dem Training",
  },
  { key: "teamWA", id: "1547347298-4074fc3086f0", alt: "Spielerin beim Sprungwurf in der Halle" },
  { key: "teamWC", id: "1518611012118-696072aa579a", alt: "Mannschaft beim gemeinsamen Aufwärmen" },
  {
    key: "teamGD",
    id: "1571008592377-e362723e8998",
    alt: "Kinder einer Jugendmannschaft mit ihren Medaillen",
  },
  {
    key: "teamWB",
    id: "1533560904424-a0c61dc306fc",
    alt: "Zwei Spielerinnen beim Athletiktraining",
  },
  { key: "teamWD", id: "1548690312-e3b507d8c110", alt: "Spielerin beim Training mit dem Seil" },
  { key: "teamGE", id: "1502904550040-7534597429ae", alt: "Kinder beim Lauftraining" },

  // ── Spielerporträts ─────────────────────────────────────────────────────
  {
    key: "playerM1",
    id: "1507003211169-0a1dd7228f2d",
    alt: "Porträt von Tim Berger",
    orientation: "portrait",
  },
  {
    key: "playerM2",
    id: "1506794778202-cad84cf45f1d",
    alt: "Porträt von Jonas Weiler",
    orientation: "portrait",
  },
  {
    key: "playerM3",
    id: "1607346256330-dee7af15f7c5",
    alt: "Porträt von Lukas Vogt",
    orientation: "portrait",
  },
  {
    key: "playerM4",
    id: "1568602471122-7832951cc4c5",
    alt: "Porträt von Marcel Schäfer",
    orientation: "portrait",
  },
  {
    key: "playerM5",
    id: "1599566150163-29194dcaad36",
    alt: "Porträt von Fabian Krug",
    orientation: "portrait",
  },
  {
    key: "playerM6",
    id: "1600486913747-55e5470d6f40",
    alt: "Porträt von Philipp Hauck",
    orientation: "portrait",
  },
  {
    key: "playerM7",
    id: "1615109398623-88346a601842",
    alt: "Porträt von Daniel Rützel",
    orientation: "portrait",
  },
  {
    key: "playerM8",
    id: "1633332755192-727a05c4013d",
    alt: "Porträt von Sebastian Kern",
    orientation: "portrait",
  },
  {
    key: "playerB1",
    id: "1610216705422-caa3fcb6d158",
    alt: "Porträt von Nico Baumann",
    orientation: "portrait",
  },
  {
    key: "playerB2",
    id: "1595152452543-e5fc28ebc2b8",
    alt: "Porträt von Elias Röder",
    orientation: "portrait",
  },
  {
    key: "playerB3",
    id: "1564564321837-a57b7070ac4f",
    alt: "Porträt von Jannik Häfner",
    orientation: "portrait",
  },
  {
    key: "playerB4",
    id: "1500648767791-00dcc994a43e",
    alt: "Porträt von Moritz Sauer",
    orientation: "portrait",
  },
  {
    key: "playerB5",
    id: "1531891437562-4301cf35b7e4",
    alt: "Porträt von Leon Dürr",
    orientation: "portrait",
  },
  {
    key: "playerA1",
    id: "1494790108377-be9c29b29330",
    alt: "Porträt von Hannah Zeller",
    orientation: "portrait",
  },
  {
    key: "playerA2",
    id: "1544005313-94ddf0286df2",
    alt: "Porträt von Lea Böhm",
    orientation: "portrait",
  },
  {
    key: "playerA3",
    id: "1438761681033-6461ffad8d80",
    alt: "Porträt von Marie Endres",
    orientation: "portrait",
  },
  {
    key: "playerA4",
    id: "1529626455594-4ff0802cfb7e",
    alt: "Porträt von Sophie Braun",
    orientation: "portrait",
  },
  {
    key: "playerA5",
    id: "1531123897727-8f129e1688ce",
    alt: "Porträt von Emilia Fuchs",
    orientation: "portrait",
  },
  {
    key: "playerC1",
    id: "1517841905240-472988babdf9",
    alt: "Porträt von Mia Reinhardt",
    orientation: "portrait",
  },
  {
    key: "playerC2",
    id: "1573497019940-1c28c88b4f3e",
    alt: "Porträt von Johanna Kraus",
    orientation: "portrait",
  },
  {
    key: "playerC3",
    id: "1580489944761-15a19d654956",
    alt: "Porträt von Lena Schmitt",
    orientation: "portrait",
  },
  {
    key: "playerC4",
    id: "1524504388940-b1c1722653e1",
    alt: "Porträt von Amelie Gerber",
    orientation: "portrait",
  },

  // ── Autorenbilder ───────────────────────────────────────────────────────
  {
    key: "authorGruen",
    id: "1472099645785-5658abf4ff4e",
    alt: "Porträt von Michael Grün",
    orientation: "portrait",
  },
  {
    key: "authorHartmann",
    id: "1618077360395-f3068be8e001",
    alt: "Porträt von Stefan Hartmann",
    orientation: "portrait",
  },
  {
    key: "authorMoebus",
    id: "1534528741775-53994a69daeb",
    alt: "Porträt von Katrin Möbus",
    orientation: "portrait",
  },

  // ── News-Titelbilder ────────────────────────────────────────────────────
  { key: "newsMeister", id: "1518091043644-c1d4457512c6", alt: "Pokal auf dem Spielfeld" },
  {
    key: "newsCrailsheim",
    id: "1544620347-c4fd4a3d5957",
    alt: "Mannschaftsbus bei der Auswärtsfahrt",
  },
  {
    key: "newsHeuchelberg",
    id: "1546519638-68e109498ffc",
    alt: "Blick auf Korb und Zuschauerränge in der Halle",
  },
  {
    key: "newsMergentheim",
    id: "1608245449230-4ac19066d2d0",
    alt: "Angriffsszene in der abgedunkelten Halle",
  },
  { key: "newsOedheim", id: "1593341646782-e0b495cff86d", alt: "Wurfbewegung im Gegenlicht" },
  { key: "newsMbDerby", id: "1626248801379-51a0748a5f96", alt: "Zweikampf zweier Jugendspieler" },
  {
    key: "newsGdWinter",
    id: "1571019614242-c5c5dee9f50b",
    alt: "Trainer bespricht sich mit einem Spieler",
  },
  { key: "newsWaHeimsieg", id: "1541534741688-6078c6bfb5c5", alt: "Spielerin beim Krafttraining" },
  { key: "newsMinis", id: "1519861531473-9200262188bf", alt: "Ball auf dem Hallenboden" },
  {
    key: "newsVorschau",
    id: "1509027572446-af8401acfdc3",
    alt: "Spielfeld aus der Vogelperspektive",
  },
  {
    key: "newsSommerfest",
    id: "1516450360452-9312f5e86fc7",
    alt: "Feiernde Menschenmenge am Abend",
  },
  {
    key: "newsSaisonstart",
    id: "1461896836934-ffe607ba8211",
    alt: "Startposition auf der Laufbahn",
  },

  // ── Bilder im Artikeltext ───────────────────────────────────────────────
  { key: "inlineHalle", id: "1593079831268-3381b0db4a77", alt: "Leere Sporthalle vor dem Anwurf" },
  {
    key: "inlineKraftraum",
    id: "1517838277536-f5f99be501cd",
    alt: "Hände an der Langhantel im Kraftraum",
  },
  { key: "inlineNachtlauf", id: "1552674605-db6ffd4facb5", alt: "Läufergruppe bei Dunkelheit" },
  {
    key: "inlineAufwaermen",
    id: "1571019613576-2b22c76fd955",
    alt: "Aufwärmprogramm auf der Matte",
  },
  { key: "inlineTorwart", id: "1517927033932-b3d18e61fb3a", alt: "Torhüter im Sprung" },
  {
    key: "inlineAthletik",
    id: "1571019613454-1cb2f99b2d8b",
    alt: "Rumpfstabilisation im Athletiktraining",
  },
  { key: "inlineBank", id: "1580087433295-ab2600c1030e", alt: "Auswechselbank am Spielfeldrand" },
  {
    key: "inlineBaelle",
    id: "1574623452334-1e0ac2b3ccb4",
    alt: "Bälle liegen für das Training bereit",
  },

  // ── Bilderraster „Mehr als Handball" ────────────────────────────────────
  { key: "gridTraining", id: "1547941126-3d5322b218b0", alt: "Laufschuhe auf der Tartanbahn" },
  { key: "gridFans", id: "1607627000458-210e8d2bdb1d", alt: "Zuschauerränge unter Flutlicht" },
  {
    key: "gridJugend",
    id: "1626224583764-f87db24ac4ea",
    alt: "Junger Spieler im Sprung in der Halle",
  },
  { key: "gridHalle", id: "1540496905036-5937c10647cc", alt: "Blick in die Sporthalle" },
] as const satisfies readonly ImageEntry[];

export type ImageKey = (typeof IMAGES)[number]["key"];
export type MediaMap = Map<ImageKey, number>;

type Entry = (typeof IMAGES)[number];

function isPng(entry: Entry): boolean {
  return "file" in entry || "svg" in entry;
}

function targetSize(entry: Entry): { w: number; h: number } {
  return "orientation" in entry && entry.orientation === "portrait" ? PORTRAIT : LANDSCAPE;
}

/** Unsplash delivery URL — pre-cropped, faces framed for portraits. */
function unsplashUrl(entry: Entry & { id: string }): string {
  const { w, h } = targetSize(entry);
  const crop = "orientation" in entry && entry.orientation === "portrait" ? "&crop=faces" : "";
  return `https://images.unsplash.com/photo-${entry.id}?w=${w}&h=${h}&fit=crop${crop}&q=80&fm=jpg`;
}

/** Download once, then serve from `tmp/` (gitignored) on every later run. */
async function fetchPhoto(entry: Entry & { id: string }): Promise<Buffer> {
  const cachePath = path.join(CACHE_DIR, `${entry.key}.jpg`);
  if (existsSync(cachePath)) return readFileSync(cachePath);

  const response = await fetch(unsplashUrl(entry));
  if (!response.ok) {
    throw new Error(`Download fehlgeschlagen für "${entry.key}": HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 20_000) {
    throw new Error(`Download für "${entry.key}" verdächtig klein (${buffer.length} Bytes)`);
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, buffer);
  return buffer;
}

/** Produces the exact bytes that get handed to Payload. */
async function buildBuffer(entry: Entry): Promise<Buffer> {
  const { default: sharp } = await import("sharp");

  if ("svg" in entry) {
    return sharp(Buffer.from(entry.svg)).png().toBuffer();
  }
  if ("file" in entry) {
    // Logos and the crest keep their alpha channel and their pixel size —
    // resizing a wordmark only makes it blurry.
    return readFileSync(path.resolve(entry.file));
  }

  const { w, h } = targetSize(entry);
  return sharp(await fetchPhoto(entry))
    .resize(w, h, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();
}

/**
 * Uploads every manifest entry that is not in the database yet and returns the
 * key → media-id map the content modules resolve their images through.
 */
export async function seedMedia(payload: Payload): Promise<MediaMap> {
  log.step(`Medien (${IMAGES.length} Bilder, Cache: tmp/seed-demo-images)`);

  const map: MediaMap = new Map();
  let created = 0;
  let reused = 0;

  for (const entry of IMAGES) {
    const filename = `seed-${entry.key}.${isPng(entry) ? "png" : "jpg"}`;
    const existing = await findFirst(payload, "media", { filename: { equals: filename } });
    if (existing) {
      map.set(entry.key, existing.id);
      reused++;
      continue;
    }

    const buffer = await buildBuffer(entry);
    const doc = await payload.create({
      collection: "media",
      data: { alt: entry.alt },
      file: {
        data: buffer,
        mimetype: isPng(entry) ? "image/png" : "image/jpeg",
        name: filename,
        size: buffer.length,
      },
      ...WRITE_OPTS,
    });
    map.set(entry.key, doc.id);
    created++;
    log.ok(`${filename} (${Math.round(buffer.length / 1024)} kB)`);
  }

  log.info(`${created} hochgeladen, ${reused} bereits vorhanden`);
  return map;
}
