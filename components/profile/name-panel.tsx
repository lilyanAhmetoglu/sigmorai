'use client';

import { startTransition, useActionState, useState } from 'react';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { TextField } from '@/components/text-field';
import { renameHero } from '@/lib/actions/rename-hero';
import { HERO_NAME_MAX, PROFILE_TEXT } from '@/lib/constants';
import type { RenameHeroFormState } from '@/lib/types';
import { cn } from '@/lib/utils';

type RenameError = NonNullable<NonNullable<RenameHeroFormState>['error']>;

/** Errors about the name itself show under the field; the rest under the form. */
const FIELD_ERROR: Partial<Record<RenameError, string>> = {
  invalid_input: PROFILE_TEXT.nameInvalid,
  name_taken: PROFILE_TEXT.nameTaken,
};
const FORM_ERROR: Partial<Record<RenameError, string>> = {
  unauthorized: PROFILE_TEXT.nameUnauthorized,
  not_onboarded: PROFILE_TEXT.nameNotOnboarded,
  server_error: PROFILE_TEXT.nameServerError,
};

type NamePanelProps = {
  /** The player's hero name now (from the users row). */
  current: string;
};

/**
 * "Hero name" on /profile: rename the hero (renameHero Server Action). Same
 * rules as onboarding; the server re-checks everything. The sprite is drawn
 * from the name, so it follows the new name after the save.
 * The submit is dispatched by hand, like PathPanel: React's automatic form
 * reset after an action would put the DOM input back on the first-rendered
 * name while React state still holds the new one. `action` stays for a
 * submit before hydration.
 */
export function NamePanel({ current }: NamePanelProps) {
  const [state, formAction, pending] = useActionState(renameHero, null);
  const [name, setName] = useState(current);
  // Typing after a save or an error hides the old message.
  const [dirty, setDirty] = useState(false);

  const quiet = dirty || pending;
  const fieldError = state?.error && !quiet ? FIELD_ERROR[state.error] : undefined;
  const formError = state?.error && !quiet ? FORM_ERROR[state.error] : undefined;
  const saved = state?.done === true && !quiet;
  const unsaved = dirty && name.trim() !== current;

  return (
    <Panel title={PROFILE_TEXT.namePanel} titleAs="h2" className="flex flex-col gap-4 pt-8">
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
        noValidate
      >
        <p className="text-small leading-body text-text-2 max-w-reading m-0">
          {PROFILE_TEXT.nameNote}
        </p>

        <TextField
          label={PROFILE_TEXT.nameLabel}
          name="heroName"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setDirty(true);
          }}
          autoComplete="nickname"
          required
          maxLength={HERO_NAME_MAX}
          hint={PROFILE_TEXT.nameHint}
          error={fieldError}
          className="max-w-reading"
        />

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
          {saved ? PROFILE_TEXT.nameSaved : unsaved ? PROFILE_TEXT.nameUnsaved : null}
        </p>

        <div>
          <PixelButton type="submit" aria-disabled={pending}>
            {pending ? PROFILE_TEXT.nameSaving : PROFILE_TEXT.nameSave}
          </PixelButton>
        </div>
      </form>
    </Panel>
  );
}
