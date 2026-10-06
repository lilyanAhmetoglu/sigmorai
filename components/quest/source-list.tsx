import { Badge } from '@/components/badge';
import { LESSON_SOURCE_ACCENT, QUEST_TEXT } from '@/lib/constants';
import type { LessonFrontmatter } from '@/lib/types';

type Props = { sources: LessonFrontmatter['sources'] };

/**
 * The SOURCES tab (Sigmorai App.dc.html → tabSources): kind chip, title and
 * the site's host name. The whole row is one link, so the target is big.
 */
export function SourceList({ sources }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="quest-note">{QUEST_TEXT.sourcesIntro}</p>
      <ul className="lesson-sources">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="lesson-source"
            >
              <Badge accent={LESSON_SOURCE_ACCENT[source.kind]}>{source.kind}</Badge>
              <span className="lesson-source-title">{source.title}</span>
              <span className="lesson-source-host">{new URL(source.url).hostname}</span>
              <span className="sr-only">{QUEST_TEXT.newTab}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
