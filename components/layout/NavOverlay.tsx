"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ChevronRightIcon, CloseIcon } from "@/components/icons";
import { externalLinkProps } from "@/lib/links";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

import { NavFlyout } from "./NavFlyout";
import { keepFocusInside } from "./focus-trap";
import type { NavItem } from "./nav-items";

const LABELS = {
  mainMenu: "Hauptmenü",
} as const;

type NavOverlayProps = {
  items: NavItem[];
  /** Instagram/Lupe — im Overlay dieselben Icons wie im Header. */
  actions: React.ReactNode;
};

const ITEM_CLASS =
  "label-italic text-fg-primary hover:text-secondary flex w-full items-center justify-between gap-4 py-2 text-left text-[14px] transition-colors";

/**
 * Burger-Knopf plus das Overlay dahinter (Ebene 1). Die einzige
 * Client-Komponente im Seitenrahmen: sie haelt den Offen-Zustand und weiss,
 * welcher Menuepunkt sein Untermenue zeigt.
 *
 * Verhalten: Escape schliesst erst das Untermenue, dann das Overlay; ein Klick
 * neben das Panel schliesst alles; solange offen, ist der Seiten-Scroll
 * gesperrt und der Tab-Fokus bleibt im Overlay.
 */
export function NavOverlay({ items, actions }: NavOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  // Scroll-Sperre: die Seite darf hinter dem Overlay nicht wegrutschen.
  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Fokus beim Oeffnen ins Overlay holen.
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (openIndex !== null) setOpenIndex(null);
        else close();
        return;
      }
      if (event.key === "Tab") keepFocusInside(overlayRef.current, event);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, openIndex, close]);

  const activeItem = openIndex === null ? null : (items[openIndex] ?? null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={strings.common.openMenu}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group -m-2 flex shrink-0 flex-col gap-[7px] p-2"
      >
        <span aria-hidden="true" className="bg-fg-primary group-hover:bg-secondary h-[2px] w-6" />
        <span aria-hidden="true" className="bg-fg-primary group-hover:bg-secondary h-[2px] w-3" />
        <span aria-hidden="true" className="bg-fg-primary group-hover:bg-secondary h-[2px] w-6" />
      </button>

      {isOpen ? (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={LABELS.mainMenu}
          className="fixed inset-0 z-[60]"
        >
          {/*
            Klickfaenger hinter dem Panel. Bewusst `aria-hidden`: der echte
            Schliessen-Knopf steht im Panel, ein zweites Element mit demselben
            Namen wuerde die Bedienung mit Screenreader nur verdoppeln. Auf
            Mobile liegt das Panel ohnehin darueber.
          */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 cursor-default"
          />

          <div
            id={panelId}
            className={cn(
              "bg-background-dark absolute inset-y-0 left-0 flex w-full flex-col overflow-y-auto md:w-[260px]",
              activeItem && "max-md:blur-[1px]",
            )}
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-4 md:h-[94px]">
              <div className="flex items-center gap-3">
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label={strings.common.closeMenu}
                  className="text-fg-primary hover:text-secondary -m-2 p-2 transition-colors"
                >
                  <CloseIcon />
                </button>
                <Image
                  src="/brand/logo-bear-head-mobile.svg"
                  alt=""
                  width={39}
                  height={32}
                  unoptimized
                  className="h-8 w-auto md:hidden"
                />
              </div>
              {/*
                Die Icons kommen als fertiges Element aus dem Header und
                koennen `close` nicht selbst aufrufen — die Lupe fuehrt aber
                auf /suche, und ein offenes Overlay ueber der Zielseite (samt
                gesperrtem Scroll) waere eine Sackgasse. Der Klick eines Links
                darin blubbert hierher, auch bei Bedienung per Tastatur: Enter
                auf einem Link loest ein Click-Ereignis aus.
              */}
              <div onClick={close} className="flex items-center">
                {actions}
              </div>
            </div>

            <nav aria-label={LABELS.mainMenu} className="px-4 py-8">
              <ul className="flex flex-col gap-2">
                {items.map((item, index) => (
                  <li key={`${item.label}-${index}`} className="border-line border-b">
                    {item.children.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setOpenIndex(index)}
                        aria-expanded={openIndex === index}
                        className={ITEM_CLASS}
                      >
                        <span>{item.label}</span>
                        <ChevronRightIcon className="shrink-0" />
                      </button>
                    ) : item.href ? (
                      <Link
                        href={item.href}
                        onClick={close}
                        {...externalLinkProps(item.href, item.newTab)}
                        className={ITEM_CLASS}
                      >
                        <span>{item.label}</span>
                        <ChevronRightIcon className="shrink-0" />
                      </Link>
                    ) : (
                      <span className={cn(ITEM_CLASS, "text-muted")}>{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {activeItem ? (
            <NavFlyout item={activeItem} onBack={() => setOpenIndex(null)} onNavigate={close} />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
