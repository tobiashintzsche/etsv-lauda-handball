import Image from "next/image";

import {
  OVERLAY_CLAW,
  OVERLAY_GRADIENT,
  OVERLAY_PHOTO_POSITION,
  OVERLAY_TIME_SHADOW,
  POST_ASSETS,
  POST_COLORS,
  POST_METRICS,
  POST_SIZE,
} from "@/lib/matchday-posts/design";
import type { MatchdayPostView, MatchdayRowColor } from "@/lib/matchday-posts/types";

/**
 * The post itself, at its native 1080 × 1350.
 *
 * Everything is inline px from `lib/matchday-posts/design.ts` — no Tailwind,
 * no responsive units, no site tokens. This is a canvas that has to come out of
 * the browser exactly as it came out of Figma; the surrounding page scales it
 * down for viewing, the export renders it at 1:1.
 *
 * Headings are `div`s on purpose: the global `h1…h4` base rules of the site set
 * Roboto Condensed italic and would silently overwrite the post's typography.
 */

const ROW_COLOR: Record<MatchdayRowColor, string> = {
  white: POST_COLORS.white,
  yellow: POST_COLORS.yellow,
};

/** Anton, with the fallback stack from the spec. */
const FONT_STACK = "var(--font-anton), 'Oswald', 'Roboto Condensed', 'Arial Narrow', sans-serif";

const text = {
  fontFamily: FONT_STACK,
  fontStyle: "normal" as const,
  fontWeight: 400,
  letterSpacing: 0,
};

function Badge({ children }: { children: string }) {
  return (
    <div
      className="matchday-badge"
      style={{
        ...text,
        alignSelf: "flex-start",
        backgroundColor: POST_COLORS.black,
        color: POST_COLORS.yellow,
        padding: `${POST_METRICS.badgePaddingY}px ${POST_METRICS.badgePaddingX}px`,
        fontSize: POST_METRICS.badgeFontSize,
        lineHeight: `${POST_METRICS.badgeLineHeight}px`,
      }}
    >
      {children}
    </div>
  );
}

function Row({ row }: { row: MatchdayPostView["groups"][number]["rows"][number] }) {
  return (
    <div
      className={`matchday-row matchday-row--${row.color}`}
      data-color={row.color}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: POST_METRICS.rowGap,
        color: ROW_COLOR[row.color],
      }}
    >
      <div
        style={{
          ...text,
          flex: "1 1 0",
          minWidth: 0,
          fontSize: POST_METRICS.rowFontSize,
          lineHeight: `${POST_METRICS.rowLineHeight}px`,
        }}
      >
        {/* Hard two-line break like in Figma — never rely on auto wrapping. */}
        <span style={{ display: "block" }}>{row.team} VS</span>
        <span style={{ display: "block" }}>{row.opponent}</span>
      </div>
      <div
        style={{
          ...text,
          fontSize: POST_METRICS.valueFontSize,
          lineHeight: `${POST_METRICS.valueLineHeight}px`,
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {row.value}
      </div>
    </div>
  );
}

function DayGroup({ group }: { group: MatchdayPostView["groups"][number] }) {
  return (
    <div
      className="matchday-group"
      style={{ display: "flex", flexDirection: "column", gap: POST_METRICS.gap }}
    >
      <div
        className="matchday-day"
        style={{
          ...text,
          alignSelf: "flex-start",
          color: POST_COLORS.yellow,
          fontSize: POST_METRICS.dayFontSize,
          lineHeight: `${POST_METRICS.dayLineHeight}px`,
          borderBottom: `${POST_METRICS.dayUnderlineWidth}px solid ${POST_COLORS.white}`,
          marginBottom: POST_METRICS.dayUnderlineOffset,
        }}
      >
        {group.label}
      </div>
      {group.rows.map((row, index) => (
        <Row key={`${row.team}-${row.opponent}-${index}`} row={row} />
      ))}
    </div>
  );
}

function StandardLayout({ view }: { view: MatchdayPostView }) {
  return (
    <>
      <Image
        src={POST_ASSETS.background}
        alt=""
        fill
        sizes={`${POST_SIZE.width}px`}
        priority
        style={{ objectFit: "cover" }}
      />
      <div
        style={{
          position: "relative",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: POST_METRICS.gap,
          padding: `${POST_METRICS.paddingTop}px ${POST_METRICS.paddingRight}px ${POST_METRICS.paddingBottom}px ${POST_METRICS.paddingLeft}px`,
        }}
      >
        <Badge>{view.badge}</Badge>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: POST_METRICS.gap,
            paddingLeft: POST_METRICS.contentIndent,
          }}
        >
          {view.groups.map((group) => (
            <DayGroup key={group.label} group={group} />
          ))}
        </div>
      </div>
    </>
  );
}

function OverlayLayout({ view }: { view: MatchdayPostView }) {
  const overlay = view.overlay;
  if (!overlay) return null;

  const contentWidth = POST_SIZE.width - POST_METRICS.paddingLeft - POST_METRICS.paddingRight;

  return (
    <>
      {overlay.imageUrl ? (
        <Image
          src={overlay.imageUrl}
          alt={overlay.alt}
          fill
          sizes={`${POST_SIZE.width}px`}
          priority
          style={{ objectFit: "cover", objectPosition: OVERLAY_PHOTO_POSITION }}
        />
      ) : null}

      {/* Frame fill in Figma — sits under every text, so nothing is dimmed. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: OVERLAY_GRADIENT }} />

      <div
        style={{
          position: "absolute",
          left: POST_METRICS.paddingLeft,
          top: POST_METRICS.paddingTop,
          width: contentWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: POST_METRICS.gap,
        }}
      >
        <Badge>{view.badge}</Badge>
        <div
          className="matchday-overlay-time"
          style={{
            ...text,
            color: POST_COLORS.yellow,
            fontSize: POST_METRICS.overlayTimeFontSize,
            lineHeight: `${POST_METRICS.badgeLineHeight}px`,
            textShadow: OVERLAY_TIME_SHADOW,
          }}
        >
          {overlay.time}
        </div>
      </div>

      {/* The claw sits ABOVE badge and time here — different from the plate. */}
      <Image
        src={POST_ASSETS.claw}
        alt=""
        width={OVERLAY_CLAW.size}
        height={OVERLAY_CLAW.size}
        style={{
          position: "absolute",
          left: OVERLAY_CLAW.left,
          top: OVERLAY_CLAW.top,
          transform: `rotate(${OVERLAY_CLAW.rotation}deg)`,
          opacity: OVERLAY_CLAW.opacity,
        }}
      />

      <div
        className="matchday-row matchday-row--white"
        data-color="white"
        style={{
          ...text,
          position: "absolute",
          left: POST_METRICS.overlayLineLeft,
          top: POST_METRICS.overlayLineTop,
          color: POST_COLORS.white,
          fontSize: POST_METRICS.rowFontSize,
          lineHeight: `${POST_METRICS.rowLineHeight}px`,
          whiteSpace: "nowrap",
        }}
      >
        {overlay.line}
      </div>
    </>
  );
}

export function MatchdayPostCanvas({ view }: { view: MatchdayPostView }) {
  return (
    <div
      data-testid="matchday-post"
      style={{
        position: "relative",
        width: POST_SIZE.width,
        height: POST_SIZE.height,
        overflow: "hidden",
        backgroundColor: POST_COLORS.navy,
        // Anton is loaded by the frontend layout; the variable resolves there.
        fontFamily: FONT_STACK,
      }}
    >
      {view.overlay ? <OverlayLayout view={view} /> : <StandardLayout view={view} />}
    </div>
  );
}
