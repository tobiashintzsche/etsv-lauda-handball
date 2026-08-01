import { draftMode, headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";

import { getPayload } from "payload";

import config from "@payload-config";

/**
 * Enables Next.js draft mode, then redirects to the requested frontend path.
 * Used as the `livePreview.url` target of every collection (see lib/preview.ts).
 *
 * Only logged-in Payload users may switch it on — otherwise anyone holding the
 * URL could read unpublished content.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  // Internal, relative paths only — `//evil.com` would otherwise be an open
  // redirect that inherits the draft cookie. The second character matters just
  // as much: browsers normalise `/\evil.com` to `//evil.com` while parsing, so
  // a leading backslash is the same attack with a different spelling.
  if (!path || !path.startsWith("/") || /^\/[\\/]/.test(path)) {
    return new Response("Missing or invalid 'path' parameter", { status: 400 });
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await getHeaders() });

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  (await draftMode()).enable();
  redirect(path);
}
