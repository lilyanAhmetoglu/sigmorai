'use client';

// Client: one "mark this lesson done" state for the whole lesson page, so the
// stepper's last button (Finish lesson) and the "Lesson done" panel share one
// press, one pending state and one result. No DOM of its own: the grid
// (.quest-layout) still sees the same children.
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { completeLesson } from '@/lib/actions/quest';
import { QUEST_TEXT } from '@/lib/constants';
import type { LessonViewer, XpOutcome } from '@/lib/types';
import type { ToastItem } from './quest-toasts';

/** The last press. The XP comes from the server's reply, never from here. */
export type LessonOutcome = { kind: 'done'; xp: XpOutcome } | { kind: 'error'; message: string };

type LessonFinishState = {
  viewer: LessonViewer;
  nextHref: string;
  pending: boolean;
  outcome: LessonOutcome | null;
  /** Cleared: pressed now, or cleared before (a replay) with no new press. */
  done: boolean;
  toasts: readonly ToastItem[];
  dismissToast: (id: number) => void;
  /** The "Lesson done" button: ask the server to mark it done. */
  press: () => void;
  /** The stepper's last button: mark it done, or (cleared / can't yet) show the panel. */
  finish: () => void;
  /** Goes up by one each time the panel should come into view with focus on its control. */
  reveal: number;
};

const LessonFinishContext = createContext<LessonFinishState | null>(null);

/** Null outside a lesson page (no provider): the stepper then shows no finish button. */
export function useLessonFinish() {
  return useContext(LessonFinishContext);
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll `box` into view, then focus `target` without a second jump. */
export function bringIntoView(box: HTMLElement, target: HTMLElement, block: ScrollLogicalPosition) {
  box.scrollIntoView({ block, behavior: reducedMotion() ? 'auto' : 'smooth' });
  target.focus({ preventScroll: true });
}

type Props = {
  exerciseId: string;
  /** For the XP toast. */
  title: string;
  viewer: LessonViewer;
  /** Where Continue goes: this chapter's case, or the realm page. */
  nextHref: string;
  children: ReactNode;
};

/**
 * Holds the lesson's completeLesson press (quest-actions spec → SIG-11 block).
 * The browser sends the lesson id only; the server checks the session, the
 * open rule and awards XP_REWARDS.lesson once. Key it by exerciseId.
 */
export function LessonFinishProvider({ exerciseId, title, viewer, nextHref, children }: Props) {
  const [pending, startTransition] = useTransition();
  const [outcome, setOutcome] = useState<LessonOutcome | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [reveal, setReveal] = useState(0);
  const toastId = useRef(0);

  const dismissToast = useCallback(
    (id: number) => setToasts((all) => all.filter((t) => t.id !== id)),
    [],
  );
  const pushToast = (toast: Omit<ToastItem, 'id'>) =>
    setToasts((all) => [...all, { ...toast, id: (toastId.current += 1) }]);
  const showPanel = () => setReveal((n) => n + 1);

  const done =
    outcome?.kind === 'done' || (viewer.status === 'ready' && viewer.cleared && !outcome);

  function press() {
    if (pending) return;
    // Empty the live region, so the same message twice is still read out.
    setOutcome(null);
    startTransition(async () => {
      try {
        const result = await completeLesson({ exerciseId });
        // Either way the panel holds the answer (Continue, or the error and a retry).
        showPanel();
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
        showPanel();
        setOutcome({ kind: 'error', message: QUEST_TEXT.lessonNoReply });
      }
    });
  }

  function finish() {
    // Ready and not cleared: the same press as "Lesson done". Otherwise (a
    // replay, or signed out / not set up) the panel already holds the next
    // step (Continue, Sign in, Set up): show it, never award again.
    if (viewer.status === 'ready' && !done) press();
    else showPanel();
  }

  return (
    <LessonFinishContext
      value={{
        viewer,
        nextHref,
        pending,
        outcome,
        done,
        toasts,
        dismissToast,
        press,
        finish,
        reveal,
      }}
    >
      {children}
    </LessonFinishContext>
  );
}
