import { SITE_URL } from "./env";

/**
 * Live-preview URL for Payload. Points at `/api/preview`, which enables the
 * Next.js draft mode (cookie based) and then redirects to the frontend path.
 *
 * Not `/path?preview=true`: reading `searchParams` in a page component forces
 * Next to render it dynamically for everyone. The draft cookie keeps the
 * public page statically prerendered — only editors carrying the cookie see
 * the unpublished version.
 */
export function livePreviewUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/api/preview?path=${encodeURIComponent(normalized)}`;
}
