import { HandballNetIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type HandballPanelHeadProps = {
  /** Club name from `site-settings` — never hard-code it here. */
  clubName: string;
  className?: string;
};

/**
 * Head of every handball.net panel (league table, match card): club name on
 * the left, the handball.net signet on the right, a 2px yellow rule below.
 *
 * Shared by the table block and the matchcenter card so both panels start on
 * the same line — see design 3.7 and 3.15.
 */
export function HandballPanelHead({ clubName, className }: HandballPanelHeadProps) {
  return (
    <div
      className={cn(
        "border-secondary flex items-center justify-between gap-4 border-b-2 pb-1.5",
        className,
      )}
    >
      <p className="label-italic text-[16px] uppercase md:text-[18px]">{clubName}</p>
      <HandballNetIcon className="shrink-0" />
    </div>
  );
}
