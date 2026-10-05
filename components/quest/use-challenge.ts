'use client';

import { useCallback, useRef, useState } from 'react';
import { submitChallenge } from '@/lib/actions/quest';
import { QUEST_ERROR_TEXT, QUEST_TEXT } from '@/lib/constants';
import {
  RunErrorBodySchema,
  RunResultSchema,
  type ChallengeViewer,
  type QuestBlock,
  type QuestErrorCode,
  type QuestTestRow,
  type SandboxKind,
  type XpOutcome,
} from '@/lib/types';
import type { ToastItem } from './quest-toasts';
import { useConfirm } from './use-confirm';

/** The last thing a press produced. The server decides every grade, HP and XP value here. */
export type Outcome =
  | { kind: 'run'; tests: QuestTestRow[]; output: string }
  | { kind: 'submit'; passed: boolean; replay: boolean; tests: QuestTestRow[] }
  | { kind: 'error'; message: string };

type Options = { exerciseId: string; title: string; starter: string; viewer: ChallengeViewer };

const RUN_URL = '/api/run';

/**
 * State of the challenge panel: the code, which press is running, HP, the
 * two cap blocks, the last outcome and the toasts. Run posts to /api/run
 * (free, visible tests); Submit calls the submitChallenge Server Action.
 */
export function useChallenge({ exerciseId, title, starter, viewer }: Options) {
  const ready = viewer.status === 'ready' ? viewer : null;
  const [code, setCode] = useState(starter);
  const [busy, setBusy] = useState<SandboxKind | null>(null);
  const [hp, setHp] = useState(ready?.hp ?? 0);
  const [runBlock, setRunBlock] = useState<QuestBlock | null>(ready?.runBlock ?? null);
  const [submitBlock, setSubmitBlock] = useState<QuestBlock | null>(ready?.submitBlock ?? null);
  const [clearedNow, setClearedNow] = useState<XpOutcome | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  // Reset throws the code away, so it needs a second press within RESET_CONFIRM_MS.
  const reset = useConfirm(() => setCode(starter));

  const dismissToast = useCallback(
    (id: number) => setToasts((all) => all.filter((t) => t.id !== id)),
    [],
  );
  const pushToast = (toast: Omit<ToastItem, 'id'>) =>
    setToasts((all) => [...all, { ...toast, id: (toastId.current += 1) }]);

  function refuse(kind: SandboxKind, code: QuestErrorCode, message: string, resetsAt?: string) {
    if (code === 'CAP_REACHED' && resetsAt) {
      (kind === 'run' ? setRunBlock : setSubmitBlock)({ message, resetsAt });
      // The reset note under the buttons has the full sentence + time; say it once.
      return setOutcome({ kind: 'error', message: QUEST_ERROR_TEXT.CAP_REACHED });
    }
    if (code === 'NO_HP') setHp(0);
    setOutcome({ kind: 'error', message });
  }

  /** Starts a press. Buttons stay focusable while busy (aria-disabled), so a second click lands here. */
  function begin(kind: SandboxKind): boolean {
    if (busy) return false;
    setBusy(kind);
    // Empty the live region, so the same result twice is still read out.
    setOutcome(null);
    return true;
  }

  async function run() {
    if (!begin('run')) return;
    try {
      const res = await fetch(RUN_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ exerciseId, code }),
      });
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const refused = RunErrorBodySchema.safeParse(body);
        if (refused.success) {
          const { code: errorCode, error, resetsAt } = refused.data;
          return refuse('run', errorCode, error, resetsAt);
        }
        return setOutcome({ kind: 'error', message: QUEST_ERROR_TEXT.RUNNER_FAILED });
      }
      const result = RunResultSchema.safeParse(body);
      if (!result.success || result.data.status !== 'completed') {
        return setOutcome({ kind: 'error', message: QUEST_ERROR_TEXT.RUNNER_FAILED });
      }
      const tests = result.data.tests.map((t) => ({ ...t, hidden: false }));
      setOutcome({ kind: 'run', tests, output: result.data.output });
    } catch {
      setOutcome({ kind: 'error', message: QUEST_TEXT.networkError });
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!begin('submit')) return;
    try {
      const result = await submitChallenge({ exerciseId, code });
      if (!result.ok) return refuse('submit', result.code, result.message, result.resetsAt);
      const { passed, replay, tests, xp } = result;
      setHp(result.hpLeft);
      setOutcome({ kind: 'submit', passed, replay, tests });
      if (passed && !replay && xp) {
        setClearedNow(xp);
        pushToast({
          accent: 'xp',
          title: QUEST_TEXT.xpToastTitle(xp.awarded),
          text: QUEST_TEXT.xpToastText(title),
        });
        if (xp.levelAfter > xp.levelBefore) {
          pushToast({ accent: 'success', title: QUEST_TEXT.levelUpTitle(xp.levelAfter) });
        }
      }
    } catch {
      // The action may have finished (and spent HP) before the reply was lost.
      setOutcome({ kind: 'error', message: QUEST_TEXT.submitNoReply });
    } finally {
      setBusy(null);
    }
  }

  return {
    code,
    setCode,
    reset,
    busy,
    hp,
    runBlock,
    submitBlock,
    clearedNow,
    /** Cleared before this visit: Submit is practice. */
    replay: Boolean(ready?.cleared) && !clearedNow,
    outcome,
    toasts,
    dismissToast,
    run,
    submit,
  };
}
