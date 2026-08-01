const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    // offsetParent is null for `display: none` — that is how the responsive
    // variants (md:hidden / hidden md:block) drop out of the tab order.
    (element) => element.tabIndex !== -1 && element.offsetParent !== null,
  );
}

/**
 * Light focus trap for the navigation overlay: Tab cycles inside `container`
 * instead of walking into the page behind it. Deliberately not a full trap —
 * no inert/aria-hidden bookkeeping on the rest of the document, which the
 * overlay does not need because it closes on Escape and on backdrop click.
 */
export function keepFocusInside(container: HTMLElement | null, event: KeyboardEvent): void {
  if (!container) return;

  const focusable = focusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
