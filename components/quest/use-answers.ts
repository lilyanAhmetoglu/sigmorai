'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, useTransition } from 'react';
import { submitCase, submitQuickCheck } from '@/lib/actions/quest';
import { QUEST_TEXT } from '@/lib/constants';
import type {
  AnswerSheet,
  AnswerViewer,
  QuestErrorCode,
  QuestionFeedback,
  XpOutcome,
} from '@/lib/types';
import type { ToastItem } from './quest-toasts';

/** The last press. The server decides every grade, HP and XP value here. */
export type AnswerOutcome =
  | {
      kind: 'graded';
      passed: boolean;
      replay: boolean;
      right: number;
      total: number;
      /** Null on a first-time fail: only "N of M correct" leaves the server. */
      questions: QuestionFeedback[] | null;
    }
  | { kind: 'error'; code?: QuestErrorCode; message: string };

type View = { sheet: AnswerSheet; viewer: AnswerViewer };

const noPicks = (sheet: AnswerSheet) => sheet.questions.map((): number | null => null);
const startHp = (viewer: AnswerViewer) => (viewer.status === 'ready' ? viewer.hp : null);

/**
 * State of the case / quick-check panel: picks, the press, HP, the outcome
 * and the toasts. The panel keeps the sheet it was shown with: a Submit
 * revalidates the page, which brings a NEW shuffle (new seed) in the props,
 * and the result must stay on the order the learner answered. "Try again"
 * adopts the newest sheet from the server (after a refresh if needed; if the
 * refresh brings none, the panel unlocks with a "no reply" message).
 */
export function useAnswers(props: View) {
  const router = useRouter();
  const [view, setView] = useState<View>(props);
  const [awaitingSheet, setAwaitingSheet] = useState(false);
  const [picks, setPicks] = useState(() => noPicks(props.sheet));
  const [busy, setBusy] = useState(false);
  const [hp, setHp] = useState(() => startHp(props.viewer));
  const [outcome, setOutcome] = useState<AnswerOutcome | null>(null);
  const [clearedNow, setClearedNow] = useState<XpOutcome | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const [refreshing, startRefresh] = useTransition();

  // Adopt a fresh server shuffle once it arrives (state from props, set during render).
  if (awaitingSheet && props.sheet.seed !== view.sheet.seed) {
    setView(props);
    setPicks(noPicks(props.sheet));
    setHp(startHp(props.viewer));
    setAwaitingSheet(false);
  } else if (awaitingSheet && !refreshing) {
    // The refresh finished without a new shuffle: unlock and say so, never hang.
    setAwaitingSheet(false);
    setOutcome({ kind: 'error', message: QUEST_TEXT.noReply });
  }

  const dismissToast = useCallback(
    (id: number) => setToasts((all) => all.filter((t) => t.id !== id)),
    [],
  );
  const pushToast = (toast: Omit<ToastItem, 'id'>) =>
    setToasts((all) => [...all, { ...toast, id: (toastId.current += 1) }]);

  const { sheet, viewer } = view;
  const graded = outcome?.kind === 'graded' ? outcome : null;
  const locked = busy || awaitingSheet || graded !== null;
  const allAnswered = picks.every((p) => p !== null);

  function pick(question: number, option: number) {
    if (locked) return;
    setPicks((all) => all.map((p, i) => (i === question ? option : p)));
  }

  async function submit() {
    if (locked || !allAnswered) return;
    setBusy(true);
    // Empty the live region, so the same message twice is still read out.
    setOutcome(null);
    try {
      const action = sheet.kind === 'case' ? submitCase : submitQuickCheck;
      const result = await action({
        exerciseId: sheet.exerciseId,
        seed: sheet.seed,
        answers: picks as number[],
      });
      if (!result.ok) {
        if (result.code === 'NO_HP' && hp) setHp({ ...hp, value: 0 });
        return setOutcome({ kind: 'error', code: result.code, message: result.message });
      }
      const { passed, replay, right, total, questions, xp } = result;
      if (hp && result.hpLeft !== null) setHp({ ...hp, value: result.hpLeft });
      setOutcome({ kind: 'graded', passed, replay, right, total, questions });
      if (passed && !replay && xp && xp.awarded > 0) {
        setClearedNow(xp);
        pushToast({
          accent: 'xp',
          title: QUEST_TEXT.xpToastTitle(xp.awarded),
          text: QUEST_TEXT.xpToastText(sheet.title),
        });
        if (xp.levelAfter > xp.levelBefore) {
          pushToast({ accent: 'success', title: QUEST_TEXT.levelUpTitle(xp.levelAfter) });
        }
      }
    } catch {
      // The action may have finished (and spent HP) before the reply was lost.
      setOutcome({ kind: 'error', message: QUEST_TEXT.noReply });
    } finally {
      setBusy(false);
    }
  }

  /** A new attempt on a new shuffle from the server. */
  function tryAgain() {
    if (busy) return;
    setOutcome(null);
    setClearedNow(null);
    setPicks(noPicks(sheet));
    setAwaitingSheet(true);
    // In a transition, so `refreshing` tells us when the refresh is done.
    startRefresh(() => router.refresh());
  }

  return {
    sheet,
    viewer,
    picks,
    pick,
    busy,
    /** Waiting for the new shuffle after Try again. */
    awaitingSheet,
    locked,
    allAnswered,
    hp,
    outcome,
    graded,
    /** The quick check's daily tries are used up: Submit stays off until the reset. */
    noTries:
      (outcome?.kind === 'error' && outcome.code === 'NO_TRIES') ||
      (viewer.status === 'ready' && !viewer.cleared && viewer.triesLeft === 0),
    clearedNow,
    /** Cleared before this attempt: Submit is practice. */
    replay: viewer.status === 'ready' && viewer.cleared,
    toasts,
    dismissToast,
    submit,
    tryAgain,
  };
}
