import { Show, UserButton } from '@clerk/nextjs';
import { SignedOutActions } from './signed-out-actions';

/** Clerk's account button (it owns sign-out). Its trigger is ~28px; grown to the 44px tap target. */
export function AccountButton() {
  return (
    <UserButton
      appearance={{
        elements: { userButtonTrigger: 'min-h-11 min-w-11', userButtonAvatarBox: 'size-9' },
      }}
    />
  );
}

/**
 * Sign in / sign up when signed out, the account button when signed in, from
 * Clerk's own state. For places that don't know the HUD state (the HUD error
 * view). HudBar picks from its state instead.
 */
export function AuthControls() {
  return (
    <>
      <Show when="signed-out">
        <SignedOutActions />
      </Show>
      <Show when="signed-in">
        <AccountButton />
      </Show>
    </>
  );
}
