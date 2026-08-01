"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ChevronRightIcon, SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { type NewsFilters as Filters, type Period, newsHref } from "./filter-params";

/** Wartezeit nach dem letzten Tastendruck, bevor die URL aktualisiert wird. */
const SEARCH_DEBOUNCE_MS = 350;

const LABELS = {
  search: "Suche",
  searchPlaceholder: "Suchbegriff …",
  submit: "Suche starten",
  period: "Zeitraum",
  periodAny: "Beliebige Zeit",
  periodLast30: "Letzte 30 Tage",
  periodSeason: (season: string) => `Saison ${season}`,
  periodOlder: "Ältere Beiträge",
  category: "Kategorie",
  categoryAll: "Alle Kategorien",
};

export type CategoryOption = { value: string; label: string };

type NewsFiltersProps = {
  filters: Filters;
  categories: CategoryOption[];
  /** Vom Server berechnetes Saison-Kürzel ("26/27") — verhindert Hydration-Drift. */
  seasonLabel: string;
  className?: string;
};

/**
 * Filterleiste der News-Uebersicht (Design 3.13).
 *
 * Die einzige Client-Komponente dieser Route: sie haelt nur den Tippzustand
 * des Suchfeldes und schreibt jede Aenderung als `searchParams` zurueck —
 * gefiltert wird auf dem Server.
 */
export function NewsFilters({ filters, categories, seasonLabel, className }: NewsFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(debounce.current ?? undefined), []);

  function navigate(overrides: Partial<Filters>) {
    // Jede Filteraenderung springt zurueck auf Seite 1 — sonst zeigt die
    // Uebersicht eine Seite an, die es im neuen Ergebnis nicht mehr gibt.
    router.replace(newsHref(filters, { ...overrides, page: 1 }), { scroll: false });
  }

  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout(debounce.current ?? undefined);
    debounce.current = setTimeout(() => navigate({ search: value }), SEARCH_DEBOUNCE_MS);
  }

  const periodOptions: { value: Period; label: string }[] = [
    { value: "all", label: LABELS.periodAny },
    { value: "last30", label: LABELS.periodLast30 },
    { value: "season", label: LABELS.periodSeason(seasonLabel) },
    { value: "older", label: LABELS.periodOlder },
  ];

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        clearTimeout(debounce.current ?? undefined);
        navigate({ search });
      }}
      className={cn("flex flex-col gap-2 md:flex-row md:gap-8", className)}
    >
      <FilterField>
        <input
          type="search"
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
          aria-label={LABELS.search}
          placeholder={LABELS.searchPlaceholder}
          className="label-italic placeholder:text-placeholder w-full min-w-0 bg-transparent text-[14px] focus:outline-none"
        />
        <button type="submit" aria-label={LABELS.submit} className="shrink-0 cursor-pointer">
          <SearchIcon className="h-[14px] w-[14px]" />
        </button>
      </FilterField>

      <FilterSelect
        label={LABELS.period}
        value={filters.period}
        isPlaceholder={filters.period === "all"}
        onChange={(value) => navigate({ period: value as Period })}
        options={periodOptions}
      />

      <FilterSelect
        label={LABELS.category}
        value={filters.category}
        isPlaceholder={filters.category === ""}
        onChange={(value) => navigate({ category: value })}
        options={[{ value: "", label: LABELS.categoryAll }, ...categories]}
      />
    </form>
  );
}

/** Ein Feld der Leiste: 31px hoch, unten eine 1px-Linie, Icon rechts. */
function FilterField({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-line focus-within:border-secondary flex h-[31px] flex-1 items-center justify-between gap-2 border-b transition-colors">
      {children}
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  isPlaceholder: boolean;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, isPlaceholder, options, onChange }: FilterSelectProps) {
  return (
    <FilterField>
      <select
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "label-italic w-full min-w-0 cursor-pointer appearance-none bg-transparent text-[14px] focus:outline-none",
          isPlaceholder ? "text-placeholder" : "text-fg-primary",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-primary text-fg-primary">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronRightIcon className="pointer-events-none shrink-0" />
    </FilterField>
  );
}
