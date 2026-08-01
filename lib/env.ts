/**
 * Fail-fast environment validation.
 *
 * Importing this module throws at boot when a required variable is missing —
 * far better than a `undefined` connection string surfacing as a cryptic
 * Drizzle error three layers deep.
 */

const databaseUrl = process.env.DATABASE_URL;
const payloadSecret = process.env.PAYLOAD_SECRET;

if (!databaseUrl) throw new Error("DATABASE_URL is not set");
if (!payloadSecret) throw new Error("PAYLOAD_SECRET is not set");

export const DATABASE_URL = databaseUrl;
export const PAYLOAD_SECRET = payloadSecret;

/**
 * Public base URL of the site. Used for metadataBase, canonicals, the sitemap
 * and the live-preview redirect target.
 *
 * Server-side only — this module must never reach the client bundle (the
 * guards above throw in the browser). Client components read
 * `process.env.NEXT_PUBLIC_SERVER_URL` directly.
 *
 * `NEXT_PUBLIC_SERVER_URL` is inlined at build time, so it has to be set for
 * every Vercel environment. The Vercel fallbacks keep preview deployments
 * pointing at themselves instead of at localhost when it is missing.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL;
  // Stable production domain of the Vercel project — preferred for canonicals.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  // Deployment-specific URL (preview builds).
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/** Vercel Blob is only wired up when a token exists — otherwise local disk. */
export const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN ?? "";
