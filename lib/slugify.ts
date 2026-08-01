/**
 * Slug helpers shared between the Payload slug field hook and the seeding
 * scripts. Side-effect free so it can be imported from tests without dragging
 * the Payload runtime in.
 *
 * The transform mirrors what German editors expect:
 *   - lowercase
 *   - umlauts → ae/oe/ue, ß → ss
 *   - non-word characters collapse to a single dash
 *   - leading/trailing dashes trimmed
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/**
 * Slugify each name in order, appending `-2`, `-3`, … when a slug would
 * collide with one produced earlier in the same run. Used by seed scripts.
 */
export function slugifyWithDedupe(names: readonly string[]): string[] {
  const used = new Set<string>();
  const out: string[] = [];

  for (const name of names) {
    const base = slugify(name);
    let candidate = base;
    let n = 2;
    while (used.has(candidate)) {
      candidate = `${base}-${n++}`;
    }
    used.add(candidate);
    out.push(candidate);
  }

  return out;
}
