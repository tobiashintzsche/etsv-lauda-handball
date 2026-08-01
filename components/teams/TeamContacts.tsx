import type { Team } from "@payload-types";

import { strings } from "@/lib/strings";

type TeamContactsProps = {
  entries: NonNullable<Team["contacts"]>;
};

/** Turns a phone number or address into something tappable. */
function contactHref(value: string): string | null {
  if (value.includes("@")) return `mailto:${value}`;
  if (/^[+\d][\d\s/()-]{5,}$/.test(value)) return `tel:${value.replace(/[\s/()-]/g, "")}`;
  return null;
}

/**
 * Contact rows of a team — label left, value flush right (design 2.2).
 *
 * Mail addresses and phone numbers become links automatically: editors type a
 * plain value, visitors on a phone get a tap target.
 */
export function TeamContacts({ entries }: TeamContactsProps) {
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="label-italic text-[14px] uppercase">{strings.teams.contactHeadline}</h3>

      <dl className="flex flex-col gap-1">
        {entries.map((entry) => {
          const href = contactHref(entry.value);

          return (
            <div key={entry.id ?? entry.label} className="flex justify-between gap-4">
              <dt className="text-[16px] leading-[1.4]">{entry.label}</dt>
              <dd className="text-right text-[16px] leading-[1.4] break-all">
                {href ? (
                  <a href={href} className="hover:text-secondary transition-colors">
                    {entry.value}
                  </a>
                ) : (
                  entry.value
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
