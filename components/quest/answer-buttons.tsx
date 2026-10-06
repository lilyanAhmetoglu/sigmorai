'use client';

import { PixelButton } from '@/components/pixel-button';
import { AUTH_ROUTES, HUD_TEXT, ONBOARDING_HREF, QUEST_TEXT } from '@/lib/constants';
import type { AnswerViewer, GradedKind } from '@/lib/types';
import { ResetNote } from './reset-note';

type Props = {
  kind: GradedKind;
  viewer: AnswerViewer;
  busy: boolean;
  /** Submitted and graded: the form is locked until Try again. */
  graded: boolean;
  passed: boolean;
  allAnswered: boolean;
  /** Case HP left today; null for a quick check. */
  hp: number | null;
  replay: boolean;
  /** NO_TRIES came back: the quick check's daily tries are used up. */
  noTries: boolean;
  /** Where Continue goes after a pass. */
  nextHref: string;
  /** "Read the lesson again" after a fail; null when there is no lesson. */
  lessonHref: string | null;
  onSubmit: () => void;
  onTryAgain: () => void;
};

/**
 * One button, Submit answers (quest-actions spec, amended 2026-10-05), then
 * Continue and/or Try again after a result, plus one note line per state.
 * Each button keeps a 44px target; the row wraps on a phone.
 */
export function AnswerButtons(props: Props) {
  const { kind, viewer, busy, graded, passed, allAnswered, hp, replay, noTries, nextHref } = props;
  const { lessonHref } = props;

  if (viewer.status !== 'ready') {
    return (
      <div className="quest-buttons">
        {viewer.status === 'onboarding' ? (
          <PixelButton href={ONBOARDING_HREF} variant="xp">
            {HUD_TEXT.setUp}
          </PixelButton>
        ) : (
          <PixelButton href={AUTH_ROUTES.signIn}>{QUEST_TEXT.signInToSubmit}</PixelButton>
        )}
      </div>
    );
  }

  const noHp = kind === 'case' && !replay && hp === 0;

  if (graded) {
    return (
      <div className="flex flex-col gap-2">
        <div className="quest-buttons">
          {passed && (
            <PixelButton href={nextHref} variant="xp">
              {QUEST_TEXT.continue}
            </PixelButton>
          )}
          {!noHp && (
            <PixelButton variant={passed ? 'secondary' : 'primary'} onClick={props.onTryAgain}>
              {QUEST_TEXT.tryAgain}
            </PixelButton>
          )}
          {!passed && lessonHref && (
            <PixelButton href={lessonHref} variant="secondary">
              {QUEST_TEXT.rereadLesson}
            </PixelButton>
          )}
        </div>
        {noHp && <ResetNote lead={QUEST_TEXT.noHp} resetsAt={viewer.hpResetsAt} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="quest-buttons">
        {/* While busy it stays focusable (aria-disabled; the hook ignores the press). */}
        <PixelButton
          variant="success"
          disabled={noHp || noTries || !allAnswered}
          aria-disabled={busy || undefined}
          onClick={props.onSubmit}
          icon={busy ? undefined : <span aria-hidden="true">{QUEST_TEXT.submitIcon}</span>}
        >
          {busy ? QUEST_TEXT.submitting : QUEST_TEXT.submitAnswers}
        </PixelButton>
      </div>
      <SubmitNote {...{ kind, replay, noHp, noTries, allAnswered, resetsAt: viewer.hpResetsAt }} />
    </div>
  );
}

function SubmitNote({
  kind,
  replay,
  noHp,
  noTries,
  allAnswered,
  resetsAt,
}: {
  kind: GradedKind;
  replay: boolean;
  noHp: boolean;
  noTries: boolean;
  allAnswered: boolean;
  resetsAt: string;
}) {
  if (noHp) return <ResetNote lead={QUEST_TEXT.noHp} resetsAt={resetsAt} />;
  if (noTries) return <ResetNote lead={QUEST_TEXT.noTries} resetsAt={resetsAt} />;
  const cost = replay
    ? QUEST_TEXT.replayNote
    : kind === 'case'
      ? QUEST_TEXT.caseNote
      : QUEST_TEXT.quickCheckNote;
  return <p className="quest-note">{allAnswered ? cost : `${QUEST_TEXT.answerAll} ${cost}`}</p>;
}
