"use client";

import { useDocumentInfo } from "@payloadcms/ui";

/**
 * UI-Feld der Spieltagsposts: Vorschaubild, Link auf die Ansichtsseite und
 * Download des fertigen PNGs.
 *
 * Bewusst schlicht — die eigentliche Kontrolle passiert auf der Render-Route,
 * die den Post in Originalgroesse (1080×1350) zeigt.
 */

const LABELS = {
  heading: "Vorschau",
  unsaved: "Bitte zuerst speichern — danach erscheinen hier Vorschau und Download.",
  open: "Post in Originalgroesse ansehen",
  download: "PNG herunterladen (1080 × 1350)",
  alt: "Vorschau des Spieltagsposts",
};

const styles = {
  wrapper: { display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" as const },
  image: {
    width: "216px",
    height: "270px",
    objectFit: "cover" as const,
    border: "1px solid var(--theme-elevation-150)",
  },
  links: { display: "flex", flexDirection: "column" as const, gap: ".5rem" },
};

export function MatchdayPostLinks() {
  const { id } = useDocumentInfo();

  if (!id) {
    return (
      <div className="field-type">
        <div className="field-label">{LABELS.heading}</div>
        <p>{LABELS.unsaved}</p>
      </div>
    );
  }

  const pagePath = `/spieltagspost/${id}`;
  const imagePath = `/api/matchday-post/${id}/image`;

  return (
    <div className="field-type">
      <div className="field-label">{LABELS.heading}</div>
      <div style={styles.wrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Payload-Admin, kein next/image */}
        <img src={imagePath} alt={LABELS.alt} style={styles.image} />
        <div style={styles.links}>
          <a href={pagePath} target="_blank" rel="noreferrer">
            {LABELS.open}
          </a>
          <a href={imagePath} download={`spieltagspost-${id}.png`}>
            {LABELS.download}
          </a>
        </div>
      </div>
    </div>
  );
}
