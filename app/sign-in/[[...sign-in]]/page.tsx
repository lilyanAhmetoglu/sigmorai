import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CLERK_REDIRECT_PARAM, onboardingHref } from '@/lib/constants';
import { pathFromRedirect } from '@/lib/utils';

export const metadata: Metadata = { title: 'Sign in · Sigmorai' };

export default async function SignInPage({ searchParams }: PageProps<'/sign-in/[[...sign-in]]'>) {
  const query = await searchParams;
  // A landing card's track survives a switch from sign-up to sign-in and back.
  const track = pathFromRedirect(query[CLERK_REDIRECT_PARAM]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="font-hud text-hud tracking-hud">
        ← Back to Sigmorai
      </Link>
      {/* Sign-up started from this page also lands on the track picker. */}
      <SignIn signUpForceRedirectUrl={onboardingHref(track)} />
    </main>
  );
}
