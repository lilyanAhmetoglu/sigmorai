import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ONBOARDING_HREF } from '@/lib/constants';

export const metadata: Metadata = { title: 'Sign in · Sigmorai' };

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="font-hud text-hud tracking-hud">
        ← Back to Sigmorai
      </Link>
      {/* Sign-up started from this page also lands on the track picker. */}
      <SignIn signUpForceRedirectUrl={ONBOARDING_HREF} />
    </main>
  );
}
