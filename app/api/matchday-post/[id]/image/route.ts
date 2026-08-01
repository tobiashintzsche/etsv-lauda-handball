import { ImageResponse } from "next/og";

import { loadPublicAsset, publicDataUri, uploadDataUri } from "@/lib/matchday-posts/assets";
import { POST_ASSETS, POST_SIZE } from "@/lib/matchday-posts/design";
import { toPostSource } from "@/lib/matchday-posts/document";
import { getMatchdayPost } from "@/lib/matchday-posts/load";
import { buildPostView } from "@/lib/matchday-posts/view-model";

import { matchdayPostElement } from "./template";

/**
 * Der Spieltagspost als PNG in Instagram-Groesse (1080 × 1350).
 *
 * Gerendert mit `next/og` (satori + resvg), nicht per Screenshot: das laeuft
 * ohne Browser, also auch serverlos, und liefert bei identischer Eingabe
 * identische Pixel. Anton kommt als TTF aus `public/fonts/`, der Hintergrund
 * als fertige Platte — beides als Bytes, satori kann keine Pfade aufloesen.
 */

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getMatchdayPost(id);
  if (!post) return new Response("Spieltagspost nicht gefunden", { status: 404 });

  const source = toPostSource(post);
  const view = buildPostView(source);

  const [font, background, claw, photo] = await Promise.all([
    loadPublicAsset(POST_ASSETS.font),
    publicDataUri(POST_ASSETS.background),
    publicDataUri(POST_ASSETS.claw),
    uploadDataUri(source.overlayImageUrl),
  ]);

  return new ImageResponse(matchdayPostElement(view, { background, claw, photo }), {
    ...POST_SIZE,
    // Der Buffer geht ungeschnitten rein: `buffer.buffer` waere der geteilte
    // Node-Pool und enthielte fremde Bytes vor dem Offset.
    fonts: [{ name: "Anton", data: font, weight: 400, style: "normal" }],
    headers: {
      // Der Post aendert sich nur, wenn die Redaktion ihn aendert — der
      // Browser darf ihn kurz halten, ein CDN nicht.
      "Cache-Control": "private, max-age=60",
      "Content-Disposition": `inline; filename="spieltagspost-${id}.png"`,
    },
  });
}
