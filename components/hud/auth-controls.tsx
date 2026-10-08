import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { PixelButton } from '@/components/pixel-button';
import { AUTH_TEXT } from '@/lib/constants';

/** Sign in + Start free: the header's right side for a visitor. */
export function SignedOutActions() {
  return (
    <div className="flex items-center gap-3">
      <SignInButton>
        <PixelButton variant="secondary" size="sm">
          {AUTH_TEXT.signIn}
        </PixelButton>
      </SignInButton>
      <SignUpButton>
        <PixelButton size="sm">{AUTH_TEXT.startFree}</PixelButton>
      </SignUpButton>
    </div>
  );
}

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
