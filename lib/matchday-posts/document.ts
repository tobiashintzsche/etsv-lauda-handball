import type { MatchdayPost } from "@payload-types";

import { isMedia } from "@/lib/utils";

import type { MatchdayPostGame } from "./types";
import type { MatchdayPostSource } from "./view-model";

/**
 * Bridge from the stored document to the renderer input.
 *
 * Kept apart from `view-model.ts` on purpose: the view model must stay free of
 * Payload types so it can be unit-tested with plain objects.
 */
export function toPostSource(post: MatchdayPost): MatchdayPostSource {
  const overlayImage = isMedia(post.overlayImage) ? post.overlayImage : null;

  return {
    postType: post.postType,
    variant: post.variant,
    badgeText: post.badgeText,
    games: (post.games ?? []) as MatchdayPostGame[],
    overlayTitle: post.overlayTitle,
    overlayImageUrl: overlayImage?.url ?? null,
    overlayImageAlt: overlayImage?.alt ?? "",
  };
}
