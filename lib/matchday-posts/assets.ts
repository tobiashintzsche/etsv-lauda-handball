import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { SITE_URL } from "@/lib/env";

/**
 * Binary assets for the PNG export.
 *
 * `next/og` (satori + resvg) needs real bytes: a font as an ArrayBuffer and
 * every image as a data URI — it does not run a browser and cannot resolve a
 * relative `/brand/...` path on its own.
 *
 * Two ways in, in this order:
 *   1. the file system — works locally and in the Vercel bundle
 *   2. an HTTP fetch against our own origin — the safety net for uploads that
 *      live in Vercel Blob rather than in the repo
 *
 * Everything is memoised per process: the plate is 106 kB and the font 130 kB,
 * and neither ever changes between requests.
 */

const cache = new Map<string, Promise<Buffer>>();

async function loadFromDisk(publicPath: string): Promise<Buffer> {
  return readFile(join(process.cwd(), "public", publicPath.replace(/^\//, "")));
}

async function loadFromHttp(url: string): Promise<Buffer> {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Asset ${url} → HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

/** Bytes of a file below `public/`, e.g. `/fonts/Anton-Regular.ttf`. */
export function loadPublicAsset(publicPath: string): Promise<Buffer> {
  const hit = cache.get(publicPath);
  if (hit) return hit;

  const pending = loadFromDisk(publicPath).catch(() =>
    loadFromHttp(new URL(publicPath, SITE_URL).toString()),
  );
  cache.set(publicPath, pending);
  return pending;
}

/**
 * Bytes of an uploaded image. Absolute URLs (Vercel Blob) go over the network,
 * relative ones through the public path first.
 */
export async function loadUploadAsset(url: string): Promise<Buffer> {
  if (/^https?:\/\//.test(url)) return loadFromHttp(url);
  try {
    return await loadPublicAsset(url);
  } catch {
    return loadFromHttp(new URL(url, SITE_URL).toString());
  }
}

const MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

function mimeOf(path: string): string {
  const extension = path.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[extension] ?? "image/png";
}

/** `data:` URI of a public asset — what satori accepts as an image source. */
export async function publicDataUri(publicPath: string): Promise<string> {
  const bytes = await loadPublicAsset(publicPath);
  return `data:${mimeOf(publicPath)};base64,${bytes.toString("base64")}`;
}

/** `data:` URI of an uploaded image, or null when it cannot be fetched. */
export async function uploadDataUri(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const bytes = await loadUploadAsset(url);
    return `data:${mimeOf(url)};base64,${bytes.toString("base64")}`;
  } catch {
    // A missing photo must not fail the whole export — the post renders
    // without it and the editor sees that something is wrong.
    return null;
  }
}
