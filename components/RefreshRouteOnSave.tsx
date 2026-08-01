"use client";

import { useRouter } from "next/navigation";

import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from "@payloadcms/live-preview-react";

/**
 * Listens for save events from the Payload admin iframe and refreshes the
 * route so the preview shows the new content.
 *
 * Render this only when `draftMode().isEnabled` — for public visitors it would
 * be a pointless client bundle and an open message listener.
 *
 * The server URL is read straight from `process.env.NEXT_PUBLIC_SERVER_URL`
 * (inlined at build time). Importing `@/lib/env` here would pull its
 * fail-fast `DATABASE_URL`/`PAYLOAD_SECRET` guard into the client bundle,
 * where both are always undefined — the guard would throw and kill the very
 * preview this component serves.
 */
export function RefreshRouteOnSave() {
  const router = useRouter();
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

  // Without a server URL the live-preview bridge cannot verify the message
  // origin — rendering nothing is safer than pointing it at the wrong host.
  if (!serverURL) return null;

  return <PayloadRefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />;
}
