import Link from 'next/link';
import { StatusBadge } from '@/components/realms/status-badge';
import { FRONTIER_TEXT, questHref, STEP_STATUS_TEXT } from '@/lib/constants';
import { playableStep } from '@/lib/grading/track-map';
import type { FrontierChapterView } from '@/lib/types';

type Props = { chapter: FrontierChapterView };

/**
 * One Frontier chapter: date, state (icon + word), title and minutes. The
 * whole card is one link to its first open step (or the lesson again when
 * done); a chapter with nothing playable is a plain box. The Math Tower
 * floor card has covers and formulas, so this is its own small card; it
 * reuses the floor-card styles (realms.css). Server component.
 */
export function ChapterCard({ chapter }: Props) {
  const step = playableStep(chapter);
  const key = `frontier-${chapter.folder}`;
  const ids = { tag: `${key}-date`, name: `${key}-name`, state: `${key}-state` };
  const body = (
    <>
      <p className="floor-card-head">
        <time id={ids.tag} dateTime={chapter.date} className="floor-card-tag">
          {chapter.date}
        </time>
        <span id={ids.state}>
          <StatusBadge text={STEP_STATUS_TEXT[chapter.status]} />
        </span>
      </p>
      <h3 id={ids.name} className="floor-card-name">
        {chapter.title}
      </h3>
      <p className="frontier-card-meta">{FRONTIER_TEXT.minutes(chapter.minutes)}</p>
    </>
  );
  return step ? (
    <Link
      href={questHref(step.exerciseId)}
      className="floor-card"
      data-status={chapter.status}
      aria-labelledby={`${ids.name} ${ids.tag} ${ids.state}`}
    >
      {body}
    </Link>
  ) : (
    <div className="floor-card" data-status={chapter.status}>
      {body}
    </div>
  );
}
