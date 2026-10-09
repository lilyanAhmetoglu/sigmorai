import { PublicShell } from '@/components/hud/public-shell';

/**
 * Public pages (landing, blog, privacy): the same header and footer as the
 * app (PublicShell). The pages stay static: the header reads Clerk on the
 * client, and Clerk mounts only for a likely player (ClerkGate), so a visitor
 * downloads no Clerk at all. Each page brings its own <main>.
 */
export default function MarketingLayout({ children }: LayoutProps<'/'>) {
  return <PublicShell>{children}</PublicShell>;
}
