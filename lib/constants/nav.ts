import type { NavItem } from '@/lib/types';

/**
 * The in-app nav, in the design's order (Sigmorai App.dc.html → navItems).
 * `live: false` until the route exists: the nav shows it as plain "soon" text,
 * never a link, so there are no dead links. Flip it to true in the PR that
 * adds the page.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', live: false },
  { label: 'Realms', href: '/realms', live: false },
  { label: 'World map', href: '/map', live: false },
  { label: 'Leaderboard', href: '/leaderboard', live: false },
  { label: 'Math Tower', href: '/math', live: false },
  { label: 'Profile', href: '/profile', live: false },
];

/** id of the <main> the skip link jumps to. */
export const MAIN_CONTENT_ID = 'main';
