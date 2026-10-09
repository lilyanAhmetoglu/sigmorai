import { PublicShell } from '@/components/hud/public-shell';

/**
 * Sign in and sign up: the public shell with Clerk always mounted, since the
 * forms are Clerk's. Same header and footer as every other page. Each page
 * brings its own <main>.
 */
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return <PublicShell clerk>{children}</PublicShell>;
}
