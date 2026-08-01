"use client";

import Link from "next/link";

import { ChevronLeftIcon } from "@/components/icons";
import { externalLinkProps } from "@/lib/links";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

import type { NavItem } from "./nav-items";

type NavFlyoutProps = {
  item: NavItem;
  /** Nur mobil sichtbar — auf dem Desktop bleibt Ebene 1 daneben stehen. */
  onBack: () => void;
  /** Nach einem Klick auf einen Unterpunkt schliesst das ganze Overlay. */
  onNavigate: () => void;
};

const ITEM_CLASS =
  "label-italic block w-full py-2 text-[14px] font-medium transition-opacity hover:opacity-60";

/**
 * Ebene 2 der Navigation: helles Panel (263px) rechts neben dem dunklen Menue.
 * Mobil liegt es bei left-127px ueber Ebene 1, die dahinter leicht unscharf
 * stehen bleibt — so bleibt sichtbar, woher man kam.
 */
export function NavFlyout({ item, onBack, onNavigate }: NavFlyoutProps) {
  return (
    <div
      className={cn(
        "bg-surface-light text-fg-secondary shadow-flyout absolute inset-y-0 right-0 left-[127px] overflow-y-auto",
        "md:right-auto md:left-[260px] md:w-[263px]",
      )}
    >
      <div className="px-4">
        <button
          type="button"
          onClick={onBack}
          className="border-secondary label-italic flex w-full items-center gap-1 border-b pt-4 pb-2 text-[14px] md:hidden"
        >
          <ChevronLeftIcon className="shrink-0" />
          <span>{strings.common.back}</span>
        </button>

        {/* Setzt die Ueberschrift auf dem Desktop auf Header-Hoehe — Ebene 1
            beginnt darunter mit derselben Kante. */}
        <div aria-hidden="true" className="hidden md:block md:h-[94px]" />

        <p className="heading-italic pt-4 pb-2 text-[16px] md:pt-8">{item.label}</p>

        <ul>
          {item.children.map((child, index) => (
            <li key={`${child.label}-${index}`} className="border-fg-secondary border-b">
              {child.href ? (
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  {...externalLinkProps(child.href, child.newTab)}
                  className={ITEM_CLASS}
                >
                  {child.label}
                </Link>
              ) : (
                <span className={cn(ITEM_CLASS, "opacity-60")}>{child.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
