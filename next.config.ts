import type { NextConfig } from "next";

import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // React Compiler — memoisiert automatisch, kein manuelles useMemo/useCallback.
  reactCompiler: true,

  // Sharp hat native libvips-Bindings; Next darf die nicht bundlen,
  // sonst kaputte WebP-Resizes (lokal gruen, Vercel-Build rot).
  serverExternalPackages: ["sharp"],

  images: {
    // Next-Image liefert automatisch AVIF (~30% kleiner als WebP) wenn der
    // Browser es unterstuetzt, sonst WebP.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Payload-Uploads in Produktion (Vercel Blob).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Seed-/Demo-Bilder.
      { protocol: "https", hostname: "images.unsplash.com" },
      // handball.net: Vereinswappen der Gegner in Tabellen und Spielplaenen.
      { protocol: "https", hostname: "www.handball.net" },
      { protocol: "https", hostname: "handball.net" },
      { protocol: "https", hostname: "*.handball.net" },
      { protocol: "https", hostname: "*.handball4all.de" },
    ],
  },
};

export default withPayload(nextConfig);
