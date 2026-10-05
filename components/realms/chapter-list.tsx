import Link from 'next/link';
import {
  BOSS_NOT_OPEN_TEXT,
  LEVEL_GLYPHS,
  notOpenText,
  questHref,
  REALMS_TEXT,
  STEP_STATUS_TEXT,
  STEP_TEXT,
} from '@/lib/constants';
import type { ChapterView, StepView } from '@/lib/types';
import { StatusBadge } from './status-badge';

type Props = {
  chapters: ChapterView[];
  /** The step "Continue" opens; its row is marked as the current one. */
  nextId?: string;
};

/** Tile glyph: ✓ when done, · when shut, else the chapter number or B for the boss. */
function glyph(chapter: ChapterView): string {
  if (chapter.status === 'done') return LEVEL_GLYPHS.done!;
  if (chapter.status !== 'open') return LEVEL_GLYPHS.locked!;
  return chapter.chapter === null ? REALMS_TEXT.bossGlyph : String(chapter.chapter);
}

/** What opens a chapter-locked row: the same words the quest action returns. */
function unlockHint(chapter: ChapterView): string | null {
  if (chapter.status !== 'locked') return null;
  return chapter.chapter === null ? BOSS_NOT_OPEN_TEXT : notOpenText(chapter.chapter - 1);
}

/** A step is a link only when the quest page can play it: open, or done (replay). */
function StepRow({ step, current }: { step: StepView; current: boolean }) {
  const text = STEP_STATUS_TEXT[step.status];
  const label = current ? REALMS_TEXT.next : text.label;
  const body = (
    <>
      <span>{STEP_TEXT[step.step]}</span>
      <span className="chapter-step-state">
        <span aria-hidden="true">{text.icon}</span> {label}
      </span>
    </>
  );
  const playable = step.status === 'open' || step.status === 'done';
  return (
    <li>
      {playable ? (
        <Link
          href={questHref(step.exerciseId)}
          className="chapter-step"
          data-status={step.status}
          aria-current={current ? 'step' : undefined}
        >
          {body}
        </Link>
      ) : (
        <div className="chapter-step" data-status={step.status}>
          {body}
        </div>
      )}
    </li>
  );
}

/**
 * The realm's chapters and boss (design: isDetail → CHAPTERS). Native
 * <details>, so it needs no client JS; open chapters start expanded.
 * Styles: realms.css.
 */
export function ChapterList({ chapters, nextId }: Props) {
  return (
    <ol className="chapter-list">
      {chapters.map((chapter) => {
        const hint = unlockHint(chapter);
        return (
          <li key={chapter.chapter ?? 'boss'}>
            <details className="chapter" open={chapter.status === 'open'}>
              <summary className="chapter-summary">
                <span className="chapter-glyph" data-status={chapter.status} aria-hidden="true">
                  {glyph(chapter)}
                </span>
                <span className="chapter-name">
                  <span className="chapter-number">
                    {chapter.chapter === null
                      ? REALMS_TEXT.bossLabel
                      : REALMS_TEXT.chapterLabel(chapter.chapter)}
                  </span>
                  {chapter.title}
                </span>
                <StatusBadge text={STEP_STATUS_TEXT[chapter.status]} />
                <span className="chapter-chevron" data-when="closed" aria-hidden="true">
                  {REALMS_TEXT.chevronClosed}
                </span>
                <span className="chapter-chevron" data-when="open" aria-hidden="true">
                  {REALMS_TEXT.chevronOpen}
                </span>
                {hint && <span className="chapter-hint">{hint}</span>}
              </summary>
              <ul className="chapter-steps">
                {chapter.steps.map((step) => (
                  <StepRow key={step.exerciseId} step={step} current={step.exerciseId === nextId} />
                ))}
              </ul>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
