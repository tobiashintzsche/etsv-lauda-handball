type JsonLdProps = {
  /** Beliebiges schema.org-Objekt. Wird als <script type="application/ld+json"> ausgegeben. */
  data: Record<string, unknown>;
};

/**
 * Structured data for search engines.
 *
 * The payload comes from our own CMS, never from user input, so serialising it
 * into the script tag is safe. `</` is still escaped defensively — a stray
 * closing tag inside a string would otherwise end the script element early.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
