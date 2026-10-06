'use client';

import { startTransition, useActionState, useId, useState } from 'react';
import { Choice, ChoiceGroup } from '@/components/choice';
import { PixelAvatar } from '@/components/pixel-avatar';
import { PixelButton } from '@/components/pixel-button';
import { TextField } from '@/components/text-field';
import { createHero } from '@/lib/actions/create-hero';
import { HERO_NAME_MAX, ONBOARDING_TEXT, TRACK_ACCENTS, TRACK_TEXT, TRACKS } from '@/lib/constants';
import type { OnboardingFormState, Track } from '@/lib/types';

const FORM_ERROR: Partial<Record<NonNullable<OnboardingFormState>['error'], string>> = {
  unauthorized: ONBOARDING_TEXT.unauthorized,
  server_error: ONBOARDING_TEXT.serverError,
};

/**
 * The track picker: hero name (live sprite preview) + builder or strategist.
 * Controlled inputs. The submit is dispatched by hand: React's automatic form
 * reset after an action would uncheck the DOM radio while React state still
 * holds the pick (seen after a failed submit). `action` stays for a submit
 * before hydration. The server re-validates everything (createHero).
 */
export function HeroForm() {
  const [state, formAction, pending] = useActionState(createHero, null);
  const trackHintId = useId();
  const [heroName, setHeroName] = useState('');
  const [track, setTrack] = useState<Track | null>(null);

  const badFields = state?.fields ?? [];
  const formError = state ? FORM_ERROR[state.error] : undefined;
  const seed = heroName.trim();

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // preventDefault also stops React's own dispatch + form reset.
        e.preventDefault();
        if (pending) return;
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex items-center gap-4">
        <PixelAvatar seed={seed || undefined} size="md" className="flex-none" />
        <div className="flex flex-col gap-1.5">
          <span className="font-hud text-hud tracking-hud text-text-2">
            {ONBOARDING_TEXT.sprite}
          </span>
          <span className="text-small leading-body text-text-3">{ONBOARDING_TEXT.spriteHint}</span>
        </div>
      </div>

      <TextField
        label={ONBOARDING_TEXT.heroName}
        name="heroName"
        value={heroName}
        onChange={(e) => setHeroName(e.target.value)}
        autoComplete="nickname"
        required
        maxLength={HERO_NAME_MAX}
        hint={ONBOARDING_TEXT.heroNameHint}
        error={
          state?.error === 'name_taken'
            ? ONBOARDING_TEXT.heroNameTaken
            : badFields.includes('heroName')
              ? ONBOARDING_TEXT.heroNameError
              : undefined
        }
      />

      <ChoiceGroup label={ONBOARDING_TEXT.path} aria-describedby={trackHintId}>
        <p id={trackHintId} className="text-small leading-body text-text-2 m-0">
          {ONBOARDING_TEXT.beginnerHint}
        </p>
        {TRACKS.map((t) => (
          <Choice
            key={t}
            name="track"
            value={t}
            required
            checked={track === t}
            onChange={() => setTrack(t)}
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
        {badFields.includes('track') && (
          <p role="alert" className="text-small text-danger m-0">
            {ONBOARDING_TEXT.trackError}
          </p>
        )}
      </ChoiceGroup>

      {formError && (
        <p role="alert" className="text-small text-danger m-0">
          {formError}
        </p>
      )}

      <p className="text-small leading-body text-text-2 m-0">{ONBOARDING_TEXT.submitNote}</p>
      <PixelButton type="submit" full disabled={pending} aria-disabled={pending}>
        {pending ? ONBOARDING_TEXT.submitting : ONBOARDING_TEXT.submit}
      </PixelButton>
    </form>
  );
}
