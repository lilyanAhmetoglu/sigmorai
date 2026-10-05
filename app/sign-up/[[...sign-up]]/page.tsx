import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Start free · Sigmorai' };

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="font-hud text-hud tracking-hud">
        ← Back to Sigmorai
      </Link>
      <SignUp />
    </main>
  );
}
