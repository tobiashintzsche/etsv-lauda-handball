import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type ArrowLinkProps = {
  href: string;
  children: React.ReactNode;
  /** lg = 20px (Team-Liste, Desktop), md = 18px (mobil, dichte Listen). */
  size?: "lg" | "md";
  /** Externe Ziele bekommen target/rel automatisch. */
  external?: boolean;
  className?: string;
};

/**
 * Text plus gelber Pfeil — die Standard-Verlinkung im Design (Team-Liste,
 * Section-Header, „Zu allen News“).
 *
 * Der Pfeil erbt seine Farbe NICHT vom Text: er ist immer gelb, auch wenn der
 * Text weiss ist. Beim Hover wandert er ein Stueck nach rechts.
 *
 * Die Beschriftung steht laut Design immer in Grossbuchstaben — das macht die
 * Komponente selbst, Aufrufer brauchen kein eigenes `uppercase`.
 */
export function ArrowLink({
  href,
  children,
  size = "lg",
  external = false,
  className,
}: ArrowLinkProps) {
  const isExternal = external || href.startsWith("http");

  return (
    <Link
      href={href}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      className={cn(
        "label-italic group text-fg-primary inline-flex items-center gap-1 uppercase transition-colors",
        "hover:text-secondary",
        size === "lg" ? "text-[20px]" : "text-[18px]",
        className,
      )}
    >
      <span>{children}</span>
      <ArrowRightIcon className="text-secondary shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
