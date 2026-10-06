import { type JsonLdObject, serializeJsonLd } from '@/lib/content/json-ld';

/**
 * Structured data for search engines (lib/content/json-ld.ts). A plain
 * <script>, not next/script: JSON-LD is data, not code (Next.js JSON-LD guide).
 * Renders nothing visible.
 */
export function JsonLd({ data }: { data: JsonLdObject }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
