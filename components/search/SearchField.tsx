"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SearchIcon } from "@/components/icons";
import { ROUTES } from "@/lib/paths";
import { SEARCH_PARAM, searchHref } from "@/lib/search-query";

/** Wartezeit nach dem letzten Tastendruck, bevor die URL aktualisiert wird. */
const SEARCH_DEBOUNCE_MS = 350;

const LABELS = {
  input: "Suchbegriff",
  placeholder: "News, Mannschaften, Seiten …",
  submit: "Suche starten",
};

type SearchFieldProps = {
  /** Term aus der URL — nur der Startwert, danach fuehrt das Feld selbst. */
  initialQuery: string;
  className?: string;
};

/**
 * Das grosse Suchfeld der Suchseite. Optik wie die Filterleiste der
 * News-Uebersicht (Design 3.13: 1px-Linie unten, Lupe rechts), nur groesser —
 * hier ist es das Hauptbedienelement der Seite.
 *
 * Die einzige Client-Komponente der Route: sie haelt den Tippzustand und
 * schreibt ihn entprellt als `?q=` zurueck. Gesucht wird auf dem Server, damit
 * jedes Ergebnis eine teilbare Adresse hat.
 */
export function SearchField({ initialQuery, className }: SearchFieldProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wer die Suche oeffnet, will tippen — der Fokus spart einen Klick.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => () => clearTimeout(debounce.current ?? undefined), []);

  function navigate(value: string) {
    // `replace` statt `push`: die Zwischenstaende beim Tippen gehoeren nicht in
    // den Verlauf, sonst braucht der Zurueck-Knopf einen Tastendruck pro Wort.
    router.replace(searchHref(value), { scroll: false });
  }

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(debounce.current ?? undefined);
    debounce.current = setTimeout(() => navigate(value), SEARCH_DEBOUNCE_MS);
  }

  return (
    <form
      role="search"
      // Ziel und Methode stehen ausgeschrieben da, damit die Suche auch ohne
      // JavaScript funktioniert: dann laedt `/suche?q=…` eben klassisch neu.
      action={ROUTES.search}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        clearTimeout(debounce.current ?? undefined);
        navigate(query);
      }}
      className={className}
    >
      <div className="border-line focus-within:border-secondary flex h-[44px] items-center justify-between gap-3 border-b transition-colors md:h-[56px]">
        <input
          ref={inputRef}
          type="search"
          name={SEARCH_PARAM}
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          aria-label={LABELS.input}
          placeholder={LABELS.placeholder}
          autoComplete="off"
          className="label-italic placeholder:text-placeholder w-full min-w-0 bg-transparent text-[20px] focus:outline-none md:text-[24px]"
        />
        <button
          type="submit"
          aria-label={LABELS.submit}
          className="hover:text-secondary shrink-0 cursor-pointer transition-colors"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
