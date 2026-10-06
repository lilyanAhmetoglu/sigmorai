'use client';

import { startTransition, useActionState, useId, useState } from 'react';
import { Choice, ChoiceGroup } from '@/components/choice';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { switchTrack } from '@/lib/actions/switch-track';
import { PROFILE_TEXT, TRACK_ACCENTS, TRACK_TEXT, TRACKS } from '@/lib/constants';
import type { SwitchTrackFormState, Track } from '@/lib/types';
import { cn } from '@/lib/utils';

type SwitchError = NonNullable<NonNullable<SwitchTrackFormState>['error']>;

const FORM_ERROR: Record<SwitchError, string> = {
  invalid_input: PROFILE_TEXT.pathInvalid,
  unauthorized: PROFILE_TEXT.pathUnauthorized,
  not_onboarded: PROFILE_TEXT.pathNotOnboarded,
  server_error: PROFILE_TEXT.pathServerError,
};

type PathPanelProps = {
  /** The player's track now (from the users row). */
  current: Track;
};

/**
 * "Your path" on /profile: switch between builder and strategist
 * (switchTrack Server Action). Nothing is lost: progress is kept per path,
 * and XP, level and streak are shared, so there is no confirm box.
 * The submit is dispatched by hand: React's automatic form reset after an
 * action would put the DOM radio back on the first-rendered track while
 * React state still holds the new pick (seen at 360px, failed save).
 * `action` stays for a submit before hydration.
 */
export function PathPanel({ current }: PathPanelProps) {
  const [state, formAction, pending] = useActionState(switchTrack, null);
  const [track, setTrack] = useState<Track>(current);
  // A new pick after a save hides the old "saved" line.
  const [dirty, setDirty] = useState(false);
  const noteId = useId();

  // A new pick or a new submit hides the old error.
  const formError = state?.error && !dirty && !pending ? FORM_ERROR[state.error] : undefined;
  const saved = state?.done === true && !dirty && !pending;
  const unsaved = dirty && track !== current;

  return (
    <Panel title={PROFILE_TEXT.pathPanel} titleAs="h2" className="flex flex-col gap-4 pt-8">
      <form
        action={formAction}
        onSubmit={(e) => {
          // preventDefault also stops React's own dispatch + form reset.
          e.preventDefault();
          // aria-disabled keeps focus on the button while busy; this blocks the double submit.
          if (pending) return;
          setDirty(false);
          const data = new FormData(e.currentTarget);
          startTransition(() => formAction(data));
        }}
        className="flex flex-col gap-4"
      >
        <ChoiceGroup label={PROFILE_TEXT.pathLegend} aria-describedby={noteId}>
          <p id={noteId} className="text-small leading-body text-text-2 max-w-reading m-0">
            {PROFILE_TEXT.pathNote}
          </p>
          {TRACKS.map((t) => (
            <Choice
              key={t}
              name="track"
              value={t}
              required
              checked={track === t}
              hint={t === current ? PROFILE_TEXT.pathCurrent : undefined}
              onChange={() => {
                setTrack(t);
                setDirty(true);
              }}
              label={
                <span className="flex flex-col gap-1">
                  <span
                    className="font-hud text-hud tracking-hud text-(--tint)"
                    data-accent={TRACK_ACCENTS[t]}
                  >
                    {TRACK_TEXT[t].label}
                  </span>
                  <span className="text-small leading-body text-text-2">{TRACK_TEXT[t].short}</span>
                </span>
              }
            />
          ))}
        </ChoiceGroup>

        {formError && (
          <p role="alert" className="text-small text-danger m-0">
            {formError}
          </p>
        )}
        {/* Always mounted (live region); empty:hidden drops the gap when there is nothing to say. */}
        <p
          role="status"
          className={cn('text-small m-0 empty:hidden', saved ? 'text-success' : 'text-text-2')}
        >
          {saved ? PROFILE_TEXT.pathSaved : unsaved ? PROFILE_TEXT.pathUnsaved : null}
        </p>

        <div>
          <PixelButton type="submit" aria-disabled={pending}>
            {pending ? PROFILE_TEXT.pathSaving : PROFILE_TEXT.pathSave}
          </PixelButton>
        </div>
      </form>
    </Panel>
  );
}
