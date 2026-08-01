import type { SVGProps } from "react";

/**
 * Icon set, traced from the Figma export in `public/brand/`.
 *
 * All paths use `currentColor` so an icon takes the colour of its surrounding
 * text — call sites decide with `text-secondary`, `text-fg-primary`, … rather
 * than baking a hex value in.
 *
 * NOTE: the Figma export shipped `icon-search.svg` and `icon-instagram.svg`
 * swapped, and the file labelled "search" contains an unusable path fragment.
 * `SearchIcon` below is traced from the (correct) magnifier path; `InstagramIcon`
 * is a clean standard glyph. The raw SVGs remain in `public/brand/` untouched.
 */

type IconProps = SVGProps<SVGSVGElement>;

/** Gelber Pfeil nach rechts — Section-Header-Link und Team-Liste. 12×12. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M11.707 5.293L7 0.586L5.586 2L8.586 5H0V7H8.586L5.586 10L7 11.414L11.707 6.707C11.8945 6.51947 11.9998 6.26516 11.9998 6C11.9998 5.73484 11.8945 5.48053 11.707 5.293Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Chevron nach rechts — Menue-Eintraege mit Untermenue. 14×14. */
export function ChevronRightIcon(props: IconProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M4.54928 12.5151C4.40286 12.6616 4.16546 12.6616 4.01903 12.5151C3.87261 12.3687 3.87261 12.1313 4.01903 11.9849L8.2968 7.70711C8.68732 7.31659 8.68732 6.68342 8.2968 6.2929L4.01903 2.01513C3.87261 1.86871 3.87261 1.63131 4.01903 1.48488C4.16546 1.33846 4.40286 1.33846 4.54928 1.48488L9.79928 6.73488C9.94591 6.88151 9.94591 7.11851 9.79928 7.26513L4.54928 12.5151Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Chevron nach links — „Zurueck“ im Untermenue. 12×12. */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M8.35892 0.484882C8.50535 0.338458 8.74275 0.338458 8.88917 0.484882C9.0356 0.631307 9.0356 0.868707 8.88917 1.01513L4.6114 5.2929C4.22088 5.68342 4.22088 6.31659 4.6114 6.70711L8.88917 10.9849C9.0356 11.1313 9.0356 11.3687 8.88917 11.5151C8.74275 11.6616 8.50535 11.6616 8.35892 11.5151L3.10892 6.26513C2.9623 6.11851 2.9623 5.88151 3.10892 5.73488L8.35892 0.484882Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Grosser Pfeil — Pagination. 20×20. Mit `rotate-180` fuer „zurueck“. */
export function PaginationArrowIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M6.06688 19.1919C5.82283 19.4359 5.42717 19.4359 5.18312 19.1919C4.93908 18.9478 4.93908 18.5522 5.18313 18.3081L12.7841 10.7071C13.1747 10.3166 13.1747 9.68342 12.7841 9.29289L5.18313 1.69187C4.93908 1.44783 4.93908 1.05216 5.18313 0.808124C5.42717 0.564083 5.82283 0.564083 6.06687 0.808124L14.8169 9.55812C15.0612 9.8025 15.0612 10.1975 14.8169 10.4419L6.06688 19.1919Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Schliessen-Kreuz — Navigations-Overlay. 24×24. */
export function CloseIcon(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M22 6L6 22M6 6L22 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Kasten mit Pfeil — externe Ziele, z.B. Mitglieder-Banner. 16×16. */
export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M8 0V2H12.586L7.293 7.293L8.707 8.707L14 3.414V8H16V1C16 0.448 15.552 0 15 0H8Z"
        fill="currentColor"
      />
      <path d="M16 16H1C0.448 16 0 15.552 0 15V0H2V14H16V16Z" fill="currentColor" />
    </svg>
  );
}

/** Lupe — Header und Navigations-Overlay. 20×20. */
export function SearchIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 20.125"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M15.875 14.125C17 12.625 17.625 10.875 17.625 8.875C17.625 4 13.75 0 8.875 0C4 0 0 4 0 8.875C0 13.75 4 17.75 8.875 17.75C10.875 17.75 12.75 17.125 14.125 16L17.875 19.75C18.125 20 18.5 20.125 18.75 20.125C19 20.125 19.375 20 19.625 19.75C20.125 19.25 20.125 18.5 19.625 18L15.875 14.125ZM8.875 15.125C5.375 15.125 2.5 12.375 2.5 8.875C2.5 5.375 5.375 2.5 8.875 2.5C12.375 2.5 15.25 5.375 15.25 8.875C15.25 12.375 12.375 15.125 8.875 15.125Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Instagram-Glyphe — Header und Navigations-Overlay. 20×20. */
export function InstagramIcon(props: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.66-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Z"
        fill="currentColor"
      />
      <path
        d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
        fill="currentColor"
      />
      <circle cx="18.41" cy="5.59" r="1.44" fill="currentColor" />
    </svg>
  );
}

/**
 * handball.net-Signet (gelbes „H“). Behaelt bewusst seine Originalfarben —
 * die Auflage verlangt, dass das Logo unveraendert erkennbar bleibt.
 */
export function HandballNetIcon(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M21.353 0H2.64704C1.18512 0 0 1.18512 0 2.64704V21.353C0 22.8149 1.18512 24 2.64704 24H21.353C22.8149 24 24 22.8149 24 21.353V2.64704C24 1.18512 22.8149 0 21.353 0Z"
        fill="#FDC52C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.32416 4.14048V9.9352H14.08V4.14048H18.9917V4.85296H18.9706C17.6061 4.85296 16.5 5.95904 16.5 7.32352C16.5 8.688 17.6061 9.79408 18.9706 9.79408L18.9917 9.79392V19.923H13.9216V14.2299H9.32416V19.923H7.86864C5.93888 19.923 4.37088 18.3742 4.33968 16.452L4.3392 16.3936V4.14048H9.32416ZM18.9706 5.55888C19.9453 5.55888 20.7354 6.34896 20.7354 7.32368C20.7354 8.29808 19.9453 9.08816 18.9706 9.08816C17.996 9.08816 17.2058 8.29808 17.2058 7.32352C17.2058 6.34896 17.996 5.55888 18.9706 5.55888Z"
        fill="white"
      />
    </svg>
  );
}
