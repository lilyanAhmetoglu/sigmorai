/** Heading anchors and text, shared by the blog page and the lesson body. Pure, no IO. */

/**
 * Anchor id of a heading's plain text: `What prompt caching does` →
 * `what-prompt-caching-does`. The page and the rendered `<h2>` both use it,
 * so the "On this page" links always land.
 */
export function headingId(text: string): string {
  const id = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return id || 'section';
}

/** A Markdown heading's visible text: code spans, links, emphasis and escapes unwrapped. */
export function headingText(markdown: string): string {
  return markdown
    .replace(/<[^>]+>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`+([^`]*)`+/g, '$1')
    .replace(/(\*\*|__|\*|_|~~)(.+?)\1/g, '$2')
    .replace(/\\([\\`*_{}[\]()#+\-.!~|<>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
