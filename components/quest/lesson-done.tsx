'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { completeLesson } from '@/lib/actions/quest';
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
import type { LessonViewer, XpOutcome } from '@/lib/types';
import { ClearedPanel } from './cleared-panel';
import { QuestToasts, type ToastItem } from './quest-toasts';

type Props = {
  exerciseId: string;
  /** For the XP toast. */
  title: string;
  viewer: LessonViewer;
  /** Where Continue goes: this chapter's case, or the realm page. */
  nextHref: string;
};

/** The last press. The XP comes from the server's reply, never from here. */
type Outcome = { kind: 'done'; xp: XpOutcome } | { kind: 'error'; message: string };

/**
 * The "Lesson done" panel (quest-actions spec → SIG-11 block): one explicit
 * button → completeLesson. The browser sends the lesson id only; the server
 * checks the session, the open rule and awards XP_REWARDS.lesson once.
 * Sticky on desktop (lesson.css), so the button stays in view on a long lesson.
 */
export function LessonDone({ exerciseId, title, viewer, nextHref }: Props) {
  const [pending, startTransition] = useTransition();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const buttons = useRef<HTMLDivElement>(null);

  const dismissToast = useCallback(
    (id: number) => setToasts((all) => all.filter((t) => t.id !== id)),
    [],
  );
  const pushToast = (toast: Omit<ToastItem, 'id'>) =>
    setToasts((all) => [...all, { ...toast, id: (toastId.current += 1) }]);

  // The pressed button is replaced by Continue: move focus there, not to <body>.
  useEffect(() => {
    if (outcome?.kind === 'done') buttons.current?.querySelector<HTMLElement>('a')?.focus();
  }, [outcome]);

  function press() {
    if (pending) return;
    // Empty the live region, so the same message twice is still read out.
    setOutcome(null);
    startTransition(async () => {
      try {
        const result = await completeLesson({ exerciseId });
        if (!result.ok) return setOutcome({ kind: 'error', message: result.message });
        const { xp } = result;
        setOutcome({ kind: 'done', xp });
        if (xp.awarded > 0) {
          pushToast({
            accent: 'xp',
            title: QUEST_TEXT.xpToastTitle(xp.awarded),
            text: QUEST_TEXT.xpToastText(title),
          });
        }
        if (xp.levelAfter > xp.levelBefore) {
          pushToast({ accent: 'success', title: QUEST_TEXT.levelUpTitle(xp.levelAfter) });
        }
      } catch {
        setOutcome({ kind: 'error', message: QUEST_TEXT.lessonNoReply });
      }
    });
  }

  const done =
    outcome?.kind === 'done' || (viewer.status === 'ready' && viewer.cleared && !outcome);
  const awarded = outcome?.kind === 'done' ? outcome.xp.awarded : 0;

  return (
    // The id and tabIndex: the lesson stepper's Finish moves focus here (or to its first control).
    <section id={LESSON_DONE_ID} tabIndex={-1} className="lesson-done" aria-busy={pending}>
      <div className="quest-case">
        <div className="quest-case-bar">
          <span>{QUEST_TEXT.lessonPanel}</span>
        </div>
        <div className="quest-case-body">
          <div ref={buttons} className="quest-buttons">
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
function note(viewer: LessonViewer, outcome: Outcome | null, done: boolean): string {
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
