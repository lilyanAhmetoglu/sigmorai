import type { NavItem } from '@/lib/types';

/**
 * The in-app nav, in the design's order (Sigmorai App.dc.html → navItems).
 * `live: false` until the route exists. Only live items show, so there are
 * no dead links and no rows of "soon" text. Flip it to true in the PR that
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

/** The items the nav shows. Empty until the first page ships. */
export const LIVE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.live);

/** id of the <main> the skip link jumps to. */
export const MAIN_CONTENT_ID = 'main';
