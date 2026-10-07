'use client';

import { useEffect, useRef } from 'react';
import { HpMeter } from '@/components/hp-meter';
import { QUEST_TEXT } from '@/lib/constants';
import type { AnswerSheet, AnswerViewer, HpValue, ShareTarget } from '@/lib/types';
import { AnswerButtons } from './answer-buttons';
import { AnswerQuestion } from './answer-question';
import { ClearedPanel } from './cleared-panel';
import { QuestToasts } from './quest-toasts';
import { useAnswers, type AnswerOutcome } from './use-answers';

type Props = {
  sheet: AnswerSheet;
  viewer: AnswerViewer;
  nextHref: string;
  /** "Read the lesson again" after a fail; null when there is no lesson. */
  lessonHref: string | null;
  /** What the cleared panel shares (the realm or tower page). */
  share?: ShareTarget;
};

/** The one-line result, read out by the live region. */
function summarize(outcome: AnswerOutcome | null, hp: HpValue | null): string {
  if (!outcome) return '';
  if (outcome.kind === 'error') return outcome.message;
  if (outcome.passed) return outcome.replay ? QUEST_TEXT.passedReplay : QUEST_TEXT.passed;
  const failed = QUEST_TEXT.failed(outcome.right, outcome.total);
  if (!hp || outcome.replay) return `${failed} ${QUEST_TEXT.failedRetry}`;
  const hpText = QUEST_TEXT.hpLeft(hp.value, hp.max);
  // At 0 HP there is no Try again button (AnswerButtons), so don't ask for one.
  return hp.value > 0 ? `${failed} ${hpText} ${QUEST_TEXT.failedRetry}` : `${failed} ${hpText}`;
}

/**
 * The case / quick-check panel (Sigmorai App.dc.html → isQuestBiz, right
 * column), every track: the bar with HP, the questions, Submit answers, the
 * result, the cleared panel and the toasts. The browser sends the seed and
 * the picked display indexes only; every grade comes from the server.
 */
export function AnswerForm({
  sheet: initialSheet,
  viewer: initialViewer,
  nextHref,
  lessonHref,
  share,
}: Props) {
  const quest = useAnswers({ sheet: initialSheet, viewer: initialViewer });
  const { sheet, viewer, outcome, graded, hp } = quest;
  const resultHeading = useRef<HTMLHeadingElement>(null);

  // After each press, move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (outcome) resultHeading.current?.focus();
  }, [outcome]);

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-busy={quest.busy || quest.awaitingSheet}>
      <div className="quest-case">
        <div className="quest-case-bar">
          <span>{sheet.kind === 'case' ? QUEST_TEXT.caseFile : QUEST_TEXT.quickCheckTag}</span>
          {viewer.status === 'ready' && hp && <HpMeter hp={hp} />}
        </div>
        <div className="quest-case-body">
          <h2 className="sr-only">{QUEST_TEXT.questionsLabel}</h2>
          {sheet.questions.map((question, i) => (
            <AnswerQuestion
              key={`${sheet.seed}-${i}`}
              number={i + 1}
              question={question}
              name={`${sheet.seed}-q${i}`}
              picked={quest.picks[i]}
              disabled={viewer.status !== 'ready' || quest.locked}
              onPick={(option) => quest.pick(i, option)}
              feedback={graded?.questions?.[i]}
            />
          ))}
          <div className="flex flex-col gap-2">
            <h2 ref={resultHeading} tabIndex={-1} className={outcome ? 'quest-heading' : 'sr-only'}>
              {QUEST_TEXT.resultHeading}
            </h2>
            {/* Always rendered (even empty): a live region must exist before its text changes. */}
            <p role="status" className="quest-summary">
              {outcome?.kind === 'error' && <span aria-hidden="true">✗ </span>}
              {summarize(outcome, hp)}
            </p>
          </div>
          <AnswerButtons
            kind={sheet.kind}
            viewer={viewer}
            busy={quest.busy || quest.awaitingSheet}
            graded={graded !== null}
            passed={graded?.passed ?? false}
            allAnswered={quest.allAnswered}
            hp={hp?.value ?? null}
            replay={quest.replay}
            noTries={quest.noTries}
            nextHref={nextHref}
            lessonHref={lessonHref}
            onSubmit={quest.submit}
            onTryAgain={quest.tryAgain}
          />
        </div>
      </div>
      {quest.clearedNow && <ClearedPanel xp={quest.clearedNow.awarded} share={share} />}
      <QuestToasts items={quest.toasts} onDismiss={quest.dismissToast} />
    </section>
  );
}
