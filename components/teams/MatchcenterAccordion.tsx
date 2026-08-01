"use client";

import { useId, useState } from "react";

import { ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type MatchcenterAccordionItem = {
  /** Stable key — the team slug. */
  id: string;
  name: string;
  liga?: string | null;
  /** Server-rendered panel. Arrives as an RSC payload, no client fetching. */
  content: React.ReactNode;
};

type MatchcenterAccordionProps = {
  items: MatchcenterAccordionItem[];
};

/**
 * Team-by-team accordion of the matchcenter (design 2.6).
 *
 * The only client component on this route. One section is open at a time and
 * the first team starts expanded, so the page never looks empty on arrival.
 *
 * Collapsed panels stay in the DOM (hidden) rather than being unmounted: the
 * fixtures are already rendered on the server, and keeping them lets the
 * browser find them via in-page search.
 */
export function MatchcenterAccordion({ items }: MatchcenterAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const isOpen = item.id === openId;
        const panelId = `${baseId}-${item.id}`;

        return (
          <section key={item.id} className="border-fg-primary/20 border-b py-6 first:pt-0">
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="group flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="flex flex-col">
                  <span className="heading-italic group-hover:text-secondary text-[24px] transition-colors">
                    {item.name}
                  </span>
                  {item.liga ? (
                    <span className="heading-italic text-secondary text-[18px]">{item.liga}</span>
                  ) : null}
                </span>

                <ChevronRightIcon
                  className={cn(
                    "h-6 w-6 shrink-0 transition-transform",
                    isOpen ? "-rotate-90" : "rotate-90",
                  )}
                />
              </button>
            </h2>

            <div id={panelId} hidden={!isOpen} className="mt-6">
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}
