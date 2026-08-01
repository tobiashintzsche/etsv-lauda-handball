import type { Team } from "@payload-types";

import { formatWeekday } from "@/lib/format";
import { strings } from "@/lib/strings";

type TrainingTimesProps = {
  entries: NonNullable<Team["trainingTimes"]>;
};

/**
 * Training slots as a two-column list: weekday and venue on the left, the time
 * range flush right so the times stack into a readable column (design 2.2).
 */
export function TrainingTimes({ entries }: TrainingTimesProps) {
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="label-italic text-[14px] uppercase">{strings.teams.trainingHeadline}</h3>

      <dl className="flex flex-col gap-3">
        {entries.map((entry) => (
          <div
            key={entry.id ?? `${entry.day}-${entry.timeFrom}`}
            className="flex justify-between gap-4"
          >
            <dt className="flex flex-col">
              <span className="text-[16px] leading-[1.2]">{formatWeekday(entry.day)}</span>
              {entry.location ? (
                <span className="text-[12px] leading-[1.3]">{entry.location}</span>
              ) : null}
            </dt>
            <dd className="text-[16px] leading-[1.2] whitespace-nowrap">
              {entry.timeFrom} - {entry.timeTo}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
