import Link from 'next/link';
import type { ReactNode } from 'react';
import { LockGlyph } from '@/components/lock-glyph';
import { unlockHint } from '@/components/realms/chapter-list';
import { RealmScene } from '@/components/realms/realm-scene';
import { StatusBadge } from '@/components/realms/status-badge';
import {
  LEVEL_GLYPHS,
  MAP_TEXT,
  QUEST_STOP_TEXT,
  questHref,
  REALMS_TEXT,
  STEP_STATUS_TEXT,
  STEP_TEXT,
  TRACK_TEXT,
} from '@/lib/constants';
import {
  chapterXp,
  playableStep,
  realmChapterCount,
  realmIsSoon,
  stopStatus,
} from '@/lib/grading/track-map';
import type { ChapterGoal, ChapterView, LevelStatus, RealmView } from '@/lib/types';
import { ScrollToCurrent } from './scroll-to-current';

type Props = {
  realm: RealmView;
  /** The exercise id of the player's next step in this realm, if any. */
  nextId?: string;
  /** Each card's one-line goal, in `realm.chapters` order (getChapterGoals). */
  goals: readonly (ChapterGoal | null)[];
};

type StopStatus = LevelStatus | 'soon';

const HEADING_ID = 'level-map-heading';
/**
 * The card holding the next step, when it is not the first card: brought
 * into view on load only if it starts below the fold (ScrollToCurrent), so
 * a realm with no progress never moves.
 */
const CURRENT_SELECTOR = '.quest-stop[data-status="current"]:not(:first-child)';

/** The node on the trail: ✓ when done, a padlock when shut, else the number (B for the boss). */
function nodeGlyph(chapter: ChapterView, status: StopStatus): ReactNode {
  if (status === 'done') return LEVEL_GLYPHS.done;
  if (status === 'locked') return <LockGlyph />;
  return chapter.chapter ?? REALMS_TEXT.bossGlyph;
}

/** One stop on the quest path: a node on the trail and the chapter's card. */
function QuestStop({
  chapter,
  status,
  goal,
  chapterCount,
  started,
}: {
  chapter: ChapterView;
  status: StopStatus;
  goal: ChapterGoal | null;
  chapterCount: number;
  /** The realm has a cleared step: the current card says CONTINUE, else START (like the header). */
  started: boolean;
}) {
  const text = QUEST_STOP_TEXT[status === 'current' && !started ? 'start' : status];
  const step = playableStep(chapter);
  const hint = unlockHint(chapter, chapterCount);
  const hintId = `quest-stop-hint-${chapter.chapter ?? 'boss'}`;
  // A card shut as a whole: its steps need no LOCKED word each (the badge says it).
  const allLocked = chapter.steps.every((s) => s.status === 'locked');
  // The status word is also read with the title: a link list says it too.
  const title = (
    <>
      {chapter.title}
      <span className="sr-only">, {text.label.toLowerCase()}</span>
    </>
  );
  return (
    <li
      className="quest-stop"
      data-status={status}
      data-boss={chapter.chapter === null || undefined}
    >
      <span className="quest-stop-node" aria-hidden="true">
        {nodeGlyph(chapter, status)}
      </span>
      <article className="quest-stop-card">
        <div className="quest-stop-head">
          <p className="quest-stop-tag">
            {chapter.chapter === null ? MAP_TEXT.bossTag : MAP_TEXT.chapterTag(chapter.chapter)}
          </p>
          <StatusBadge text={text} />
        </div>
        <h3 className="quest-stop-title">
          {step ? (
            <Link
              href={questHref(step.exerciseId)}
              className="quest-stop-link"
              aria-current={status === 'current' ? 'step' : undefined}
            >
              {title}
            </Link>
          ) : (
            // Nothing to play: a focusable, aria-disabled button, so the lock is announced.
            <button
              type="button"
              className="quest-stop-link"
              aria-disabled="true"
              aria-describedby={hint ? hintId : undefined}
            >
              {title}
            </button>
          )}
        </h3>
        {goal && (
          <p className="quest-stop-goal">
            {goal.kind === 'case' ? MAP_TEXT.caseGoal(goal.text) : goal.text}
          </p>
        )}
        <ul className="quest-stop-steps" aria-label={MAP_TEXT.steps}>
          {chapter.steps.map((s) => {
            const state = STEP_STATUS_TEXT[s.status];
            return (
              <li key={s.exerciseId} className="quest-stop-step" data-status={s.status}>
                <span aria-hidden="true">{state.icon}</span>
                {STEP_TEXT[s.step]}
                {!allLocked && <span className="quest-stop-step-state">{state.label}</span>}
              </li>
            );
          })}
        </ul>
        <div className="quest-stop-foot">
          <span className="quest-stop-xp">{MAP_TEXT.xp(chapterXp(chapter))}</span>
          {hint && (
            <span id={hintId} className="quest-stop-hint">
              {hint}
            </span>
          )}
          {chapter.creditedFrom && (
            <span className="quest-stop-hint">
              {REALMS_TEXT.creditedFrom(TRACK_TEXT[chapter.creditedFrom].label)}
            </span>
          )}
        </div>
      </article>
    </li>
  );
}

/**
 * One realm's level map (clear-maps amendment, level-art spec): the realm's
 * art as a short banner (a flat banner with the name when it has no art
 * yet), then a quest path: one card per chapter and the boss, in one column
 * joined by a trail. Each card has its tag, title, goal, steps (state as
 * icon + word), XP and status (icon + word). The title links to the first
 * open step (a done card: replay); a shut card is an aria-disabled button
 * with an unlock hint. The current card is marked and brought into view.
 * The same layout on every screen; nothing scrolls sideways. Styles:
 * level-map.css.
 */
export function LevelMap({ realm, nextId, goals }: Props) {
  const chapterCount = realmChapterCount(realm);
  const nothingLive = realmIsSoon(realm.chapters);
  const started = realm.status !== 'open';
  return (
    <section aria-labelledby={HEADING_ID} className="quest-map">
      <h2 id={HEADING_ID} className="sr-only">
        {MAP_TEXT.levels}
      </h2>
      <LevelMapBanner realm={realm} />
      {nothingLive && <p className="quest-map-note">{REALMS_TEXT.nothingLive}</p>}
      <ol className="quest-path">
        {realm.chapters.map((chapter, i) => (
          <QuestStop
            key={chapter.chapter ?? 'boss'}
            chapter={chapter}
            status={stopStatus(
              chapter,
              chapter.steps.some((s) => s.exerciseId === nextId),
            )}
            goal={goals[i] ?? null}
            chapterCount={chapterCount}
            started={started}
          />
        ))}
      </ol>
      {/* Keyed on the next step: a new current card re-runs it. */}
      <ScrollToCurrent key={nextId ?? 'none'} selector={CURRENT_SELECTOR} />
    </section>
  );
}

/**
 * The banner: the four art layers at exactly 2× (whole-number scale),
 * cropped to the ground line. Decoration (RealmScene is aria-hidden); a
 * realm with no art gets a flat banner with its name, never an empty box.
 */
function LevelMapBanner({ realm }: { realm?: Pick<RealmView, 'id' | 'name' | 'scene'> }) {
  if (!realm) return <div className="quest-map-banner" />;
  if (!realm.scene) {
    return (
      <div className="quest-map-banner" data-flat="">
        <p className="quest-map-banner-name" aria-hidden="true">
          {realm.name}
        </p>
      </div>
    );
  }
  return (
    <div className="quest-map-banner">
      <RealmScene realm={realm.id} sizes="2048px" preload className="quest-map-scene" />
    </div>
  );
}

/** The banner and three card placeholders at their final size, for loading.tsx. */
export function LevelMapSkeleton() {
  return (
    <div className="quest-map">
      <LevelMapBanner />
      <div className="quest-path">
        {[0, 1, 2].map((i) => (
          <div key={i} className="quest-stop">
            <span className="quest-stop-node" />
            <div className="quest-stop-card min-h-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
