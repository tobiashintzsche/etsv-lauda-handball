import {
  OVERLAY_CLAW,
  OVERLAY_GRADIENT,
  OVERLAY_PHOTO_POSITION,
  OVERLAY_TIME_SHADOW,
  POST_COLORS,
  POST_METRICS,
  POST_SIZE,
} from "@/lib/matchday-posts/design";
import type { MatchdayPostView, MatchdayRowColor } from "@/lib/matchday-posts/types";

/**
 * The post as satori draws it.
 *
 * A second implementation of the same design on purpose: satori understands a
 * subset of CSS (flexbox only, no `<Image>`, no CSS variables, images as data
 * URIs). Sharing the JSX with the browser canvas would mean crippling both.
 * What IS shared are the numbers — every value comes from `design.ts`, so the
 * two renderings cannot drift apart.
 */

const ROW_COLOR: Record<MatchdayRowColor, string> = {
  white: POST_COLORS.white,
  yellow: POST_COLORS.yellow,
};

const CONTENT_WIDTH = POST_SIZE.width - POST_METRICS.paddingLeft - POST_METRICS.paddingRight;
const ROW_WIDTH = CONTENT_WIDTH - POST_METRICS.contentIndent;

export type TemplateAssets = {
  /** Data URI of the pre-composed background plate. */
  background: string;
  /** Data URI of the white claw (photo variant only). */
  claw: string;
  /** Data URI of the uploaded photo, or null. */
  photo: string | null;
};

const font = {
  fontFamily: "Anton",
  fontWeight: 400,
  letterSpacing: 0,
};

function badge(text: string) {
  return (
    <div
      style={{
        ...font,
        display: "flex",
        backgroundColor: POST_COLORS.black,
        color: POST_COLORS.yellow,
        padding: `${POST_METRICS.badgePaddingY}px ${POST_METRICS.badgePaddingX}px`,
        fontSize: POST_METRICS.badgeFontSize,
        lineHeight: `${POST_METRICS.badgeLineHeight}px`,
      }}
    >
      {text}
    </div>
  );
}

function row(item: MatchdayPostView["groups"][number]["rows"][number], key: string) {
  return (
    <div
      key={key}
      style={{
        display: "flex",
        width: ROW_WIDTH,
        alignItems: "center",
        justifyContent: "space-between",
        color: ROW_COLOR[item.color],
      }}
    >
      <div
        style={{
          ...font,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          fontSize: POST_METRICS.rowFontSize,
          lineHeight: `${POST_METRICS.rowLineHeight}px`,
        }}
      >
        <div style={{ display: "flex" }}>{item.team} VS</div>
        <div style={{ display: "flex" }}>{item.opponent}</div>
      </div>
      <div
        style={{
          ...font,
          display: "flex",
          marginLeft: POST_METRICS.rowGap,
          fontSize: POST_METRICS.valueFontSize,
          lineHeight: `${POST_METRICS.valueLineHeight}px`,
        }}
      >
        {item.value}
      </div>
    </div>
  );
}

function group(item: MatchdayPostView["groups"][number], index: number) {
  return (
    <div
      key={item.label}
      style={{
        display: "flex",
        flexDirection: "column",
        width: ROW_WIDTH,
        marginTop: index === 0 ? 0 : POST_METRICS.gap,
      }}
    >
      <div style={{ display: "flex", marginBottom: POST_METRICS.dayUnderlineOffset }}>
        <div
          style={{
            ...font,
            display: "flex",
            color: POST_COLORS.yellow,
            fontSize: POST_METRICS.dayFontSize,
            lineHeight: `${POST_METRICS.dayLineHeight}px`,
            borderBottom: `${POST_METRICS.dayUnderlineWidth}px solid ${POST_COLORS.white}`,
          }}
        >
          {item.label}
        </div>
      </div>
      {item.rows.map((entry, rowIndex) => (
        <div
          key={`${entry.team}-${rowIndex}`}
          style={{ display: "flex", marginTop: POST_METRICS.gap }}
        >
          {row(entry, `${entry.team}-${rowIndex}`)}
        </div>
      ))}
    </div>
  );
}

function standard(view: MatchdayPostView, assets: TemplateAssets) {
  return (
    <div style={{ display: "flex", position: "relative", ...POST_SIZE }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- satori, kein DOM */}
      <img
        src={assets.background}
        alt=""
        width={POST_SIZE.width}
        height={POST_SIZE.height}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: POST_METRICS.paddingLeft,
          top: POST_METRICS.paddingTop,
          width: CONTENT_WIDTH,
        }}
      >
        <div style={{ display: "flex" }}>{badge(view.badge)}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: POST_METRICS.gap,
            marginLeft: POST_METRICS.contentIndent,
          }}
        >
          {view.groups.map(group)}
        </div>
      </div>
    </div>
  );
}

function overlay(view: MatchdayPostView, assets: TemplateAssets) {
  const data = view.overlay;
  if (!data) return standard(view, assets);

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        ...POST_SIZE,
        backgroundColor: POST_COLORS.navy,
      }}
    >
      {assets.photo ? (
        /* eslint-disable-next-line @next/next/no-img-element -- satori, kein DOM */
        <img
          src={assets.photo}
          alt=""
          width={POST_SIZE.width}
          height={POST_SIZE.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            objectFit: "cover",
            objectPosition: OVERLAY_PHOTO_POSITION,
          }}
        />
      ) : null}

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          ...POST_SIZE,
          backgroundImage: OVERLAY_GRADIENT,
        }}
      />

      <div
        style={{
          display: "flex",
          position: "absolute",
          left: POST_METRICS.paddingLeft,
          top: POST_METRICS.paddingTop,
          width: CONTENT_WIDTH,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {badge(view.badge)}
        <div
          style={{
            ...font,
            display: "flex",
            color: POST_COLORS.yellow,
            fontSize: POST_METRICS.overlayTimeFontSize,
            lineHeight: `${POST_METRICS.badgeLineHeight}px`,
            textShadow: OVERLAY_TIME_SHADOW,
          }}
        >
          {data.time}
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- satori, kein DOM */}
      <img
        src={assets.claw}
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
        style={{
          ...font,
          display: "flex",
          position: "absolute",
          left: POST_METRICS.overlayLineLeft,
          top: POST_METRICS.overlayLineTop,
          color: POST_COLORS.white,
          fontSize: POST_METRICS.rowFontSize,
          lineHeight: `${POST_METRICS.rowLineHeight}px`,
        }}
      >
        {data.line}
      </div>
    </div>
  );
}

/** The element `ImageResponse` renders. */
export function matchdayPostElement(view: MatchdayPostView, assets: TemplateAssets) {
  return view.overlay ? overlay(view, assets) : standard(view, assets);
}
