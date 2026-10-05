import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ONBOARDING_HREF } from '@/lib/constants';

export const metadata: Metadata = { title: 'Start free · Sigmorai' };

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="font-hud text-hud tracking-hud">
        ← Back to Sigmorai
      </Link>
      {/* A new account has no users row yet: go straight to the track picker. */}
      <SignUp forceRedirectUrl={ONBOARDING_HREF} />
    </main>
  );
}
