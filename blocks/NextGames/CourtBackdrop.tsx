/**
 * Decorative backdrop of the matchday-post look (Figma spieltagspost, §2 of the
 * design spec): the tilted handball-court lines and the claw marks.
 *
 * Both layers are pure decoration — `aria-hidden`, no interaction, and they sit
 * behind the content via a negative z-index inside the section's own stacking
 * context (the section carries `isolate`, exactly like `.texture-section`).
 *
 * Deviations from the post, all deliberate for the web:
 *   · The post clips a 1080×1350 canvas. A web section is wide and short, so the
 *     court graphic is centred and sized by its height (≈1.4× the section)
 *     rather than by width — scaled to the viewport it would show one lonely
 *     line instead of a court. At 820px wide the strokes land at the same
 *     4–5px the post shows, so the texture keeps its weight.
 *   · The claw is anchored to the 1024px content column, not to the viewport
 *     edge, so it keeps sitting above the fixtures like it does in the post.
 *     It is dialled back to 70 % and hidden on mobile, where a 300px graphic
 *     would compete with the fixtures instead of backing them.
 */
export function CourtBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Court lines: white artwork at 5 % on navy — the #252C45 of the post. */}
      <div className="absolute top-1/2 left-1/2 h-[1000px] w-[627px] -translate-x-1/2 -translate-y-1/2 rotate-[-20.8deg] bg-[url('/brand/spieltagspost/court-lines-union.svg')] bg-contain bg-center bg-no-repeat opacity-5 md:h-[1310px] md:w-[820px]" />

      {/* Claw, top right of the content column, spilling over the section edge. */}
      <div className="absolute inset-x-0 top-0 mx-auto w-full max-w-[1024px] px-4">
        <div className="absolute -top-12 right-0 hidden h-[300px] w-[300px] rotate-[93.74deg] bg-[url('/brand/spieltagspost/kratzer-claw-olive-58540C.png')] bg-contain bg-no-repeat opacity-70 md:block" />
      </div>
    </div>
  );
}
