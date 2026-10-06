'use client';

import { useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { Choice } from '@/components/choice';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { deleteAccount } from '@/lib/actions/account';
import {
  ACCOUNT_EXPORT_FILENAME,
  ACCOUNT_EXPORT_HREF,
  DELETE_CONFIRM_FIELD,
  DELETE_CONFIRM_VALUE,
  HOME_HREF,
  PRIVACY_HREF,
  PROFILE_TEXT,
} from '@/lib/constants';
import type { DeleteAccountFormState } from '@/lib/types';

type DeleteError = NonNullable<NonNullable<DeleteAccountFormState>['error']>;

const FORM_ERROR: Record<DeleteError, string> = {
  not_confirmed: PROFILE_TEXT.deleteNotConfirmed,
  unauthorized: PROFILE_TEXT.deleteUnauthorized,
  server_error: PROFILE_TEXT.deleteServerError,
  clerk_error: PROFILE_TEXT.deleteClerkError,
};

const subHeading = 'font-hud text-hud tracking-hud m-0';

/**
 * "Your data" on /profile: download everything we store (GET route, JSON
 * file) and delete the account (deleteAccount Server Action). The server
 * re-checks the confirm box; `required` here only saves a round trip.
 * After a delete, the browser signs out and goes home.
 */
export function DataPanel() {
  const [state, formAction, pending] = useActionState(deleteAccount, null);
  const { signOut } = useClerk();
  const done = state?.done === true;
  const busy = pending || done;
  const formError = state?.error ? FORM_ERROR[state.error] : undefined;

  useEffect(() => {
    if (!done) return;
    // The Clerk user is already deleted, so ending its session can fail.
    // Either way the browser leaves the app.
    signOut({ redirectUrl: HOME_HREF }).catch(() => window.location.assign(HOME_HREF));
  }, [done, signOut]);

  return (
    <Panel
      title={PROFILE_TEXT.dataPanel}
      titleAs="h2"
      accent="danger"
      className="flex flex-col gap-6 pt-8"
    >
      <p className="text-body leading-body text-text-2 max-w-reading m-0">
        {PROFILE_TEXT.dataIntro} <Link href={PRIVACY_HREF}>{PROFILE_TEXT.privacyLink}</Link>.
      </p>

      <div className="flex flex-col items-start gap-2">
        <h3 className={`${subHeading} text-text-2`}>{PROFILE_TEXT.downloadHeading}</h3>
        {/* `download` makes next/link skip client navigation; no prefetch of an API route. */}
        <PixelButton
          href={ACCOUNT_EXPORT_HREF}
          download={ACCOUNT_EXPORT_FILENAME}
          prefetch={false}
          variant="secondary"
        >
          {PROFILE_TEXT.download}
        </PixelButton>
        <p className="text-small leading-body text-text-3 m-0">{PROFILE_TEXT.downloadNote}</p>
      </div>

      <form
        action={formAction}
        // aria-disabled keeps focus on the button while busy; this blocks the double submit.
        onSubmit={(e) => {
          if (busy) e.preventDefault();
        }}
        className="flex flex-col gap-4"
      >
        <h3 className={`${subHeading} text-danger`}>{PROFILE_TEXT.deleteHeading}</h3>
        <p className="text-small leading-body text-text-2 max-w-reading m-0">
          {PROFILE_TEXT.deleteBody}
        </p>
        <Choice
          type="checkbox"
          name={DELETE_CONFIRM_FIELD}
          value={DELETE_CONFIRM_VALUE}
          required
          label={PROFILE_TEXT.deleteConfirm}
        />
        {formError && (
          <p role="alert" className="text-small text-danger m-0">
            {formError}
          </p>
        )}
        <div>
          <PixelButton type="submit" variant="danger" aria-disabled={busy}>
            {busy ? PROFILE_TEXT.deleting : PROFILE_TEXT.deleteSubmit}
          </PixelButton>
        </div>
      </form>
    </Panel>
  );
}
