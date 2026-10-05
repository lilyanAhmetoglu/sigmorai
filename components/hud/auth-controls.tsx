import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { PixelButton } from '@/components/pixel-button';
import { AUTH_TEXT } from '@/lib/constants';

/** Sign in / sign up when signed out, the account button when signed in. Lives in the HUD. */
export function AuthControls() {
  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out">
        <SignInButton>
          <PixelButton variant="secondary" size="sm">
            {AUTH_TEXT.signIn}
          </PixelButton>
        </SignInButton>
        <SignUpButton>
          <PixelButton size="sm">{AUTH_TEXT.startFree}</PixelButton>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        {/* Clerk's trigger is ~28px; grow it to the 44px tap target. */}
        <UserButton
          appearance={{
            elements: { userButtonTrigger: 'min-h-11 min-w-11', userButtonAvatarBox: 'size-9' },
          }}
        />
      </Show>
    </div>
  );
}
