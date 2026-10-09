import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { CLERK_REDIRECT_PARAM, MAIN_CONTENT_ID, onboardingHref } from '@/lib/constants';
import { pathFromRedirect } from '@/lib/utils';

export const metadata: Metadata = { title: 'Sign in · Sigmorai' };

export default async function SignInPage({ searchParams }: PageProps<'/sign-in/[[...sign-in]]'>) {
  const query = await searchParams;
  // A landing card's track survives a switch from sign-up to sign-in and back.
  const track = pathFromRedirect(query[CLERK_REDIRECT_PARAM]);

  return (
    // The way back home is the header logo ((auth) layout).
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center gap-6 p-4"
    >
      {/* Sign-up started from this page also lands on the track picker. */}
      <SignIn signUpForceRedirectUrl={onboardingHref(track)} />
    </main>
  );
}
