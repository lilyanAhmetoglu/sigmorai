import { BLOG_TEXT } from '@/lib/constants';
import type { BlogHeading } from '@/lib/types';

/** "On this page": one link per `##` heading of the post, plus Sources. Styles: blog.css. */
export function PostToc({ headings }: { headings: readonly BlogHeading[] }) {
  return (
    <nav aria-labelledby="post-toc-title" className="post-toc">
      <p id="post-toc-title" className="post-toc-title">
        <span aria-hidden="true">{BLOG_TEXT.tocTitle}</span>
        <span className="sr-only">{BLOG_TEXT.tocLabel}</span>
      </p>
      <ul className="post-toc-list">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="post-toc-link">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
