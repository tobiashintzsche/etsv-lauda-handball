import { draftMode } from "next/headers";

/**
 * Leaves draft mode (clears the bypass cookie). The browser then sees the
 * statically prerendered, published version again.
 */
export async function GET(): Promise<Response> {
  (await draftMode()).disable();
  return new Response("Vorschau beendet. Es wird wieder der veroeffentlichte Stand angezeigt.");
}
