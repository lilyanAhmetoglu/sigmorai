'use client';

import { useEffect, useId, useRef } from 'react';
import { HpMeter } from '@/components/hp-meter';
import { QUEST_TEXT } from '@/lib/constants';
import type { ChallengeViewer, PublicChallenge } from '@/lib/types';
import { ClearedPanel } from './cleared-panel';
import { QuestButtons } from './quest-buttons';
import { QuestToasts } from './quest-toasts';
import { TestList } from './test-list';
import { useChallenge, type Outcome } from './use-challenge';

type Props = {
  challenge: PublicChallenge;
  viewer: ChallengeViewer;
  /** Where Continue goes after a clear. */
  nextHref: string;
};

/** The one-line result, read out by the live region. */
function summarize(outcome: Outcome | null, hp: number, hpMax: number): string {
  if (!outcome) return '';
  if (outcome.kind === 'error') return outcome.message;
  const passed = outcome.tests.filter((t) => t.passed).length;
  const total = outcome.tests.length;
  if (outcome.kind === 'run') return QUEST_TEXT.runSummary(passed, total);
  if (outcome.passed) return outcome.replay ? QUEST_TEXT.replayPassed : QUEST_TEXT.submitPassed;
  const failed = QUEST_TEXT.submitFailed(passed, total);
  return outcome.replay ? failed : `${failed} ${QUEST_TEXT.hpFailNote(hp, hpMax)}`;
}

/**
 * The builder challenge panel (Sigmorai App.dc.html → isQuestTech, right
 * column): editor, Run + Submit, HP, tests, console, cleared panel, toasts.
 * A plain textarea for now (no Monaco dependency yet): Tab leaves the field,
 * so the keyboard is never trapped, and a hint says so.
 */
export function ChallengeWorkbench({ challenge, viewer, nextHref }: Props) {
  const quest = useChallenge({
    exerciseId: challenge.id,
    title: challenge.title,
    starter: challenge.starter,
    viewer,
  });
  const { outcome, busy, hp } = quest;
  const editorId = useId();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const hpMax = viewer.status === 'ready' ? viewer.hpMax : 0;

  // After each press, move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (outcome) resultHeading.current?.focus();
  }, [outcome]);

  const tests = outcome && outcome.kind !== 'error' ? outcome.tests : challenge.visibleTests;
  const output = outcome?.kind === 'run' ? outcome.output : null;
  const hiddenFailed =
    outcome?.kind === 'submit' && outcome.tests.some((t) => t.hidden && !t.passed);

  return (
    <section className="quest-workbench" aria-busy={busy !== null}>
      <div className="quest-editor-panel">
        <div className="quest-editor-bar">
          <span>
            {QUEST_TEXT.challengeTag} · {challenge.language}
          </span>
          {viewer.status === 'ready' && <HpMeter hp={{ value: hp, max: hpMax }} />}
        </div>
        <div className="quest-editor-label">
          <label htmlFor={editorId} className="text-field-label">
            {QUEST_TEXT.editorLabel}
          </label>
          <p id={`${editorId}-hint`} className="quest-note">
            {QUEST_TEXT.editorHint}
          </p>
        </div>
        {/* wrap="off": long lines scroll instead of soft-wrapping, which would hide Python indentation. */}
        <textarea
          id={editorId}
          className="quest-editor"
          aria-describedby={`${editorId}-hint`}
          wrap="off"
          value={quest.code}
          onChange={(e) => quest.setCode(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          readOnly={busy !== null}
        />
        <div className="px-3 pb-3">
          <QuestButtons
            viewer={viewer}
            busy={busy}
            hp={hp}
            replay={quest.replay}
            runBlock={quest.runBlock}
            submitBlock={quest.submitBlock}
            continueHref={quest.clearedNow ? nextHref : null}
            onRun={quest.run}
            onSubmit={quest.submit}
            reset={quest.reset}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 ref={resultHeading} tabIndex={-1} className="quest-heading">
          {QUEST_TEXT.testsHeading}
        </h2>
        {/* Always rendered (even empty): a live region must exist before its text changes. */}
        <p role="status" className="quest-summary">
          {outcome?.kind === 'error' && <span aria-hidden="true">✗ </span>}
          {summarize(outcome, hp, hpMax)}
        </p>
        {tests.length > 0 ? (
          <TestList tests={tests} running={busy !== null} />
        ) : (
          <p className="quest-note">{QUEST_TEXT.noVisibleTests}</p>
        )}
        {hiddenFailed && <p className="quest-note">{QUEST_TEXT.hiddenFailedNote}</p>}
      </div>

      <div className="quest-console">
        <h2 className="quest-console-title">{QUEST_TEXT.console}</h2>
        <pre className="quest-console-output">
          {output ??
            (outcome?.kind === 'submit' ? QUEST_TEXT.consoleSubmit : QUEST_TEXT.consoleEmpty)}
        </pre>
      </div>

      {quest.clearedNow && <ClearedPanel xp={quest.clearedNow.awarded} />}
      <QuestToasts items={quest.toasts} onDismiss={quest.dismissToast} />
    </section>
  );
}
