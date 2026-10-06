'use client';

// Client: it holds the chosen topic. The cards are server-rendered and
// arrive as ReactNode, so their art and links need no client code.
import { useState, type ReactNode } from 'react';
import { BLOG_TEXT, BLOG_TOPIC_LABELS, BLOG_TOPICS } from '@/lib/constants';
import { matchesFilter } from '@/lib/content/blog';
import type { BlogFilter, BlogTopic } from '@/lib/types';

type Props = {
  /** The section heading (Latest posts), shown in one row with the chips. */
  heading: ReactNode;
  /** That heading's id: the list is named by it. */
  headingId: string;
  /** One server-rendered card per post, with its topic (null: shows under ALL only). */
  items: readonly { key: string; topic: BlogTopic | null; card: ReactNode }[];
};

const FILTERS: readonly BlogFilter[] = ['all', ...BLOG_TOPICS];

/**
 * Topic chips + the post grid (Sigmorai Blog.dc.html → filters, posts).
 * Toggle buttons (aria-pressed), not tabs: they filter one list, they do not
 * switch panels. Without JavaScript every post shows. Styles: blog.css.
 */
export function PostFilters({ heading, headingId, items }: Props) {
  const [filter, setFilter] = useState<BlogFilter>('all');
  const shown = items.filter((it) => matchesFilter(it.topic, filter));

  return (
    <>
      <div className="post-list-head">
        {heading}
        <div role="group" aria-label={BLOG_TEXT.filtersLabel} className="post-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className="post-filter"
              aria-pressed={f === filter}
              onClick={() => setFilter(f)}
            >
              {BLOG_TOPIC_LABELS[f]}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p role="status" className="post-filters-empty">
          {BLOG_TEXT.filterEmpty}
        </p>
      ) : (
        <ul className="post-grid" aria-labelledby={headingId}>
          {shown.map((it) => (
            <li key={it.key}>{it.card}</li>
          ))}
        </ul>
      )}
    </>
  );
}
