import Image from "next/image";

import type { Team } from "@payload-types";

import { SectionShell } from "@/components/ui/SectionShell";
import { strings } from "@/lib/strings";
import { isMedia } from "@/lib/utils";

import { TeamContacts } from "./TeamContacts";
import { TrainingTimes } from "./TrainingTimes";

type TeamHeroProps = {
  team: Team;
};

/**
 * Head of a team page (design 2.2): name and introduction on the left, squad
 * photo on the right, training times and contacts below.
 *
 * Mobile and desktop need a different reading order — on the phone the photo
 * comes right after the headline, on the desktop it sits beside it. The DOM
 * follows the mobile order and the desktop grid re-places the cells, so there
 * is exactly one copy of every element.
 */
export function TeamHero({ team }: TeamHeroProps) {
  const image = isMedia(team.teamImage) ? team.teamImage : null;
  const trainingTimes = team.trainingTimes ?? [];
  const contacts = team.contacts ?? [];
  const hasInformation = trainingTimes.length > 0 || contacts.length > 0;

  return (
    <SectionShell
      background="texture"
      innerClassName="grid gap-y-6 md:grid-cols-[304px_1fr] md:gap-x-9 md:gap-y-8"
    >
      <header className="flex flex-col md:col-start-1 md:row-start-1">
        <h1 className="heading-italic text-[32px] md:text-[40px]">{team.name}</h1>
        {team.liga ? (
          <p className="heading-italic text-secondary text-[18px] md:text-[24px]">{team.liga}</p>
        ) : null}
      </header>

      {image?.url ? (
        <figure className="flex flex-col gap-1 md:col-start-2 md:row-span-2 md:row-start-1">
          <div className="relative aspect-[276/133] w-full overflow-hidden">
            <Image
              src={image.url}
              alt={image.alt ?? team.name}
              fill
              sizes="(max-width: 768px) 100vw, 651px"
              priority
              className="object-cover"
            />
          </div>
          {team.teamImageCaption ? (
            <figcaption className="text-[12px] leading-[1.3] md:text-[10px]">
              {team.teamImageCaption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      {hasInformation ? (
        <h2 className="heading-italic text-secondary text-[20px] md:col-span-2 md:col-start-1 md:row-start-3">
          {strings.teams.informationHeadline}
        </h2>
      ) : null}

      {team.introductionText ? (
        <p className="text-[14px] leading-[1.5] md:col-start-1 md:row-start-2 md:text-[16px]">
          {team.introductionText}
        </p>
      ) : null}

      {hasInformation ? (
        <div className="grid gap-y-8 md:col-span-2 md:col-start-1 md:row-start-4 md:grid-cols-2 md:gap-x-32">
          <TrainingTimes entries={trainingTimes} />
          <TeamContacts entries={contacts} />
        </div>
      ) : null}
    </SectionShell>
  );
}
