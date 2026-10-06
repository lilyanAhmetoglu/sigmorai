import Link from 'next/link';
import { AUTH_ROUTES, REALMS_TEXT } from '@/lib/constants';

/** For signed-out visitors on the public realm pages: progress needs an account. */
export function SignInNote() {
  return (
    <p className="text-small leading-body text-text-2 m-0">
      {REALMS_TEXT.signInNote}{' '}
      <Link href={AUTH_ROUTES.signIn} className="inline-flex min-h-11 items-center">
        {REALMS_TEXT.signIn}
      </Link>
    </p>
  );
}
