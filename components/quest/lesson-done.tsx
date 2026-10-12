'use client';

import { useEffect, useRef } from 'react';
import { PixelButton } from '@/components/pixel-button';
import {
  AUTH_ROUTES,
  AUTH_TEXT,
  HUD_TEXT,
  LESSON_DONE_ID,
  ONBOARDING_HREF,
  QUEST_ERROR_TEXT,
  QUEST_TEXT,
  XP_REWARDS,
} from '@/lib/constants';
import type { LessonViewer } from '@/lib/types';
import { ClearedPanel } from './cleared-panel';
import { bringIntoView, useLessonFinish, type LessonOutcome } from './lesson-finish';
import { QuestToasts } from './quest-toasts';

/** The panel's name (its LESSON bar). One panel per page, so a fixed id is safe. */
const TITLE_ID = `${LESSON_DONE_ID}-title`;

/**
 * The "Lesson done" panel (quest-actions spec → SIG-11 block): one explicit
 * button → completeLesson. The press, its pending state and its result live in
 * LessonFinishProvider, shared with the stepper's "Finish lesson" button, so
 * either button marks it done once and both show the same result here.
 * Sticky on desktop (lesson.css), so the button stays in view on a long lesson.
 * Must sit inside a LessonFinishProvider.
 */
export function LessonDone() {
  const state = useLessonFinish();
  const panel = useRef<HTMLElement>(null);
  const reveal = state?.reveal ?? 0;

  // After a press (from either button) or the stepper's Finish on a replay: the
  // panel to the middle of the screen, focus on its live control (Continue,
  // the retry button, Sign in or Set up), not on <body>.
  useEffect(() => {
    const box = panel.current;
    if (reveal === 0 || !box) return;
    const control = box.querySelector<HTMLElement>('a[href], button:not([disabled])') ?? box;
    bringIntoView(box, control, 'center');
  }, [reveal]);

  if (!state) return null;
  const { viewer, nextHref, pending, outcome, done, toasts, dismissToast, press } = state;
  const awarded = outcome?.kind === 'done' ? outcome.xp.awarded : 0;

  return (
    // tabIndex: the focus fallback when the panel has no live control.
    <section
      ref={panel}
      id={LESSON_DONE_ID}
      tabIndex={-1}
      aria-labelledby={TITLE_ID}
      className="lesson-done"
      aria-busy={pending}
    >
      <div className="quest-case">
        <div className="quest-case-bar">
          <span id={TITLE_ID}>{QUEST_TEXT.lessonPanel}</span>
        </div>
        <div className="quest-case-body">
          <div className="quest-buttons">
            <Button
              viewer={viewer}
              done={done}
              pending={pending}
              nextHref={nextHref}
              onPress={press}
            />
          </div>
          {/* Always rendered (even empty): a live region must exist before its text changes. */}
          <p role="status" className="quest-note">
            {outcome?.kind === 'error' && <span aria-hidden="true">✗ </span>}
            {note(viewer, outcome, done)}
          </p>
        </div>
      </div>
      {/* The live note above already says "Added to your total…": the panel shows the title only. */}
      {awarded > 0 && (
        <ClearedPanel xp={awarded} title={QUEST_TEXT.lessonCleared(awarded)} body={null} />
      )}
      <QuestToasts items={toasts} onDismiss={dismissToast} />
    </section>
  );
}

type ButtonProps = {
  viewer: LessonViewer;
  done: boolean;
  pending: boolean;
  nextHref: string;
  onPress: () => void;
};

/** One button per state; each keeps a 44px target. */
function Button({ viewer, done, pending, nextHref, onPress }: ButtonProps) {
  if (viewer.status === 'signed-out') {
    return <PixelButton href={AUTH_ROUTES.signIn}>{AUTH_TEXT.signIn}</PixelButton>;
  }
  if (viewer.status === 'onboarding') {
    return (
      <PixelButton href={ONBOARDING_HREF} variant="xp">
        {HUD_TEXT.setUp}
      </PixelButton>
    );
  }
  if (done) {
    return (
      <PixelButton href={nextHref} variant="xp">
        {QUEST_TEXT.continue}
      </PixelButton>
    );
  }
  return (
    <PixelButton
      variant="success"
      disabled={viewer.status !== 'ready'}
      // While saving it stays focusable (aria-disabled); press() ignores the click.
      aria-disabled={pending || undefined}
      onClick={onPress}
      icon={pending ? undefined : <span aria-hidden="true">{QUEST_TEXT.submitIcon}</span>}
    >
      {pending ? QUEST_TEXT.saving : QUEST_TEXT.lessonDone}
    </PixelButton>
  );
}

/** The line under the button: why it is off, what it gives, or what happened. */
function note(viewer: LessonViewer, outcome: LessonOutcome | null, done: boolean): string {
  if (outcome?.kind === 'error') return outcome.message;
  if (outcome?.kind === 'done') {
    return outcome.xp.awarded > 0 ? QUEST_TEXT.clearedBody : QUEST_TEXT.lessonDoneReplay;
  }
  if (done) return QUEST_TEXT.lessonDoneReplay;
  switch (viewer.status) {
    case 'signed-out':
      return QUEST_ERROR_TEXT.UNAUTHENTICATED;
    case 'onboarding':
      return QUEST_ERROR_TEXT.NOT_ONBOARDED;
    case 'not-open':
      return viewer.message;
    case 'ready':
      return QUEST_TEXT.lessonDoneNote(XP_REWARDS.lesson);
  }
}
