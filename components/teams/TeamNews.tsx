import type { News } from "@payload-types";

import { NewsCard } from "@/components/cards/NewsCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";

type TeamNewsProps = {
  news: News[];
};

/**
 * News strip at the foot of a team page — the four most recent posts tagged
 * with this team.
 *
 * Renders nothing when the team has no posts yet: an empty „NEWS“ headline
 * would look like a broken section rather than an editorial decision.
 */
export function TeamNews({ news }: TeamNewsProps) {
  if (news.length === 0) return null;

  return (
    <SectionShell background="primary">
      <SectionHeader
        headline={strings.news.sectionHeadline}
        link={{ label: strings.news.allNews, href: ROUTES.news }}
      />

      <div className="scroll-track mt-6">
        {news.map((post) => (
          <NewsCard key={post.id} news={post} className="w-[258px]" />
        ))}
      </div>
    </SectionShell>
  );
}
