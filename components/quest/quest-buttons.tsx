'use client';

import { PixelButton } from '@/components/pixel-button';
import { AUTH_ROUTES, HUD_TEXT, ONBOARDING_HREF, QUEST_TEXT } from '@/lib/constants';
import type { ChallengeViewer, QuestBlock, SandboxKind } from '@/lib/types';
import { ResetNote } from './reset-note';

type Props = {
  viewer: ChallengeViewer;
  busy: SandboxKind | null;
  hp: number;
  replay: boolean;
  runBlock: QuestBlock | null;
  submitBlock: QuestBlock | null;
  /** Set after a first-time pass: Submit becomes Continue. */
  continueHref: string | null;
  onRun: () => void;
  onSubmit: () => void;
  /** Two-press reset (useConfirm): the label asks for the second press. */
  reset: { armed: boolean; press: () => void };
};

/**
 * Run (free, secondary) + Submit (graded, primary) + Reset, and one note line
 * per state (quest-actions spec → States and transitions). Each button keeps a
 * 44px target; the row wraps on a phone.
 */
export function QuestButtons(props: Props) {
  const { viewer, busy, hp, replay, runBlock, submitBlock, continueHref } = props;

  if (viewer.status !== 'ready') {
    const onboarding = viewer.status === 'onboarding';
    return (
      <div className="quest-buttons">
        {onboarding ? (
          <PixelButton href={ONBOARDING_HREF} variant="xp">
            {HUD_TEXT.setUp}
          </PixelButton>
        ) : (
          <>
            <PixelButton href={AUTH_ROUTES.signIn} variant="secondary">
              {QUEST_TEXT.signInToRun}
            </PixelButton>
            <PixelButton href={AUTH_ROUTES.signIn}>{QUEST_TEXT.signInToSubmit}</PixelButton>
          </>
        )}
      </div>
    );
  }

  const noHp = !replay && hp === 0;
  // Real `disabled` only for the cap / HP blocks. While busy the buttons stay
  // focusable (aria-disabled; the hook ignores the press), so focus stays on
  // the pressed button and its "Running…" label is read.
  const busyAttr = busy !== null || undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="quest-buttons">
        <PixelButton
          variant="secondary"
          disabled={runBlock !== null}
          aria-disabled={busyAttr}
          onClick={props.onRun}
          icon={busy === 'run' ? undefined : <span aria-hidden="true">{QUEST_TEXT.runIcon}</span>}
        >
          {busy === 'run' ? QUEST_TEXT.running : QUEST_TEXT.run}
        </PixelButton>
        {continueHref ? (
          <PixelButton href={continueHref} variant="xp">
            {QUEST_TEXT.continue}
          </PixelButton>
        ) : (
          <PixelButton
            disabled={submitBlock !== null || noHp}
            aria-disabled={busyAttr}
            onClick={props.onSubmit}
          >
            {busy === 'submit' ? QUEST_TEXT.running : QUEST_TEXT.submit}
          </PixelButton>
        )}
        <PixelButton
          variant="ghost"
          aria-disabled={busyAttr}
          onClick={() => busy === null && props.reset.press()}
        >
          {props.reset.armed ? QUEST_TEXT.confirmReset : QUEST_TEXT.reset}
        </PixelButton>
      </div>
      {runBlock && (
        <ResetNote
          lead={`${runBlock.message} ${QUEST_TEXT.runCapResets}`}
          resetsAt={runBlock.resetsAt}
        />
      )}
      {!continueHref && <SubmitNote {...{ viewer, replay, noHp, submitBlock }} />}
    </div>
  );
}

function SubmitNote({
  viewer,
  replay,
  noHp,
  submitBlock,
}: {
  viewer: Extract<ChallengeViewer, { status: 'ready' }>;
  replay: boolean;
  noHp: boolean;
  submitBlock: QuestBlock | null;
}) {
  if (submitBlock) {
    return (
      <ResetNote
        lead={`${submitBlock.message} ${QUEST_TEXT.submitCapResets}`}
        resetsAt={submitBlock.resetsAt}
      />
    );
  }
  if (noHp) return <ResetNote lead={QUEST_TEXT.noHp} resetsAt={viewer.hpResetsAt} />;
  return <p className="quest-note">{replay ? QUEST_TEXT.replayNote : QUEST_TEXT.submitNote}</p>;
}
