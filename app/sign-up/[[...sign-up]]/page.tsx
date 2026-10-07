import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CLERK_REDIRECT_PARAM, onboardingHref } from '@/lib/constants';
import { pathFromRedirect } from '@/lib/utils';

export const metadata: Metadata = { title: 'Start free · Sigmorai' };

/**
 * A new account has no users row yet: always go to the track picker. A landing
 * card sends `?redirect_url=/onboarding?path=<track>` (signUpHref); Clerk keeps
 * that param through its steps, so the picker opens with that track chosen.
 */
export default async function SignUpPage({ searchParams }: PageProps<'/sign-up/[[...sign-up]]'>) {
  const query = await searchParams;
  const track = pathFromRedirect(query[CLERK_REDIRECT_PARAM]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="font-hud text-hud tracking-hud">
        ← Back to Sigmorai
      </Link>
      <SignUp forceRedirectUrl={onboardingHref(track)} />
    </main>
  );
}
