const LOGO_HOST = "https://www.handball.net";
const PSEUDO_SCHEME = /^handball-net:/;

/**
 * handball.net ships club crests as the pseudo URI `handball-net:files/…`.
 * Turn it into something `next/image` can load.
 *
 * `width` uses the upstream resize parameter (`?d=48x`), which keeps the
 * transfer small — the crests render at 24px, the source files are up to 1MB.
 */
export function resolveLogoUrl(logo?: string | null, width?: number): string | null {
  if (!logo) return null;

  const path = logo.replace(PSEUDO_SCHEME, "").replace(/^\/+/, "");
  if (!path) return null;

  const url = /^https?:\/\//.test(path) ? path : `${LOGO_HOST}/${path}`;
  return width ? `${url}?d=${width}x` : url;
}
