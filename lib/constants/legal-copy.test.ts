import { describe, expect, test } from 'bun:test';
import { PRIVACY_META, PRIVACY_SECTIONS, PRIVACY_TEXT } from './legal-copy';

/** Every string the privacy page renders, links included. */
function allStrings(): string[] {
  const out: string[] = [...Object.values(PRIVACY_META), ...Object.values(PRIVACY_TEXT)];
  for (const s of PRIVACY_SECTIONS) {
    out.push(s.id, s.heading, ...(s.paragraphs ?? []));
    for (const item of s.items ?? []) {
      out.push(item.term, item.text);
      if (item.link) out.push(item.link.label, item.link.href);
    }
  }
  return out;
}

describe('privacy copy', () => {
  test('ships no maintainer placeholders', () => {
    for (const text of allStrings()) {
      expect(text.toLowerCase()).not.toContain('maintainer');
      expect(text).not.toContain('[');
    }
  });

  test('section ids are unique (they are anchors)', () => {
    const ids = PRIVACY_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('external links are https', () => {
    for (const s of PRIVACY_SECTIONS) {
      for (const item of s.items ?? []) {
        if (item.link) expect(item.link.href.startsWith('https://')).toBe(true);
      }
    }
  });
});
