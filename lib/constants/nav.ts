import type { LeaderboardRange, NavItem, Track } from '@/lib/types';
import { RANGE_PARAM } from './leaderboard';

/** Onboarding: a signed-in player with no users row picks a track and a hero name here. */
export const ONBOARDING_HREF = '/onboarding';
export const PROFILE_HREF = '/profile';
export const DASHBOARD_HREF = '/dashboard';
export const REALMS_HREF = '/realms';
/** The search param that picks which track a realm page shows (`?track=builder`). */
export const TRACK_PARAM = 'track';
/** A realm page: `/realms/<slug>`, plus `?track=` when a track is given. */
export const realmHref = (slug: string, track?: Track) =>
  `${REALMS_HREF}/${slug}${track ? `?${TRACK_PARAM}=${track}` : ''}`;
/** The realms catalog for one track. */
export const realmsHref = (track: Track) => `${REALMS_HREF}?${TRACK_PARAM}=${track}`;
/** The world map: `/map` sends the player to the realm they are in. */
export const MAP_HREF = '/map';
/** One realm's level map: `/map/<slug>`, plus `?track=` when a track is given. */
export const mapHref = (slug: string, track?: Track) =>
  `${MAP_HREF}/${slug}${track ? `?${TRACK_PARAM}=${track}` : ''}`;
/** The quest page: `/quest/<exercise id>` (a catch-all, since ids contain `/`). */
export const QUEST_HREF = '/quest';
export const questHref = (exerciseId: string) => `${QUEST_HREF}/${exerciseId}`;
/** The quest page's fallback back link (a realm quest goes back to its realm: questBackHref). */
export const QUEST_BACK_HREF = REALMS_HREF;
/** The public leaderboard: `/leaderboard`, plus `?range=` (lib/constants/leaderboard.ts). */
export const LEADERBOARD_HREF = '/leaderboard';
export const leaderboardHref = (range: LeaderboardRange) =>
  `${LEADERBOARD_HREF}?${RANGE_PARAM}=${range}`;
/** Where onboarding sends the player. */
export const AFTER_ONBOARDING_HREF = DASHBOARD_HREF;

/**
 * The in-app nav, in the design's order (Sigmorai App.dc.html → navItems).
 * `live: false` until the route exists. Only live items show, so there are
 * no dead links and no rows of "soon" text. Flip it to true in the PR that
 * adds the page.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', href: DASHBOARD_HREF, live: true },
  { label: 'Realms', href: REALMS_HREF, live: true },
  { label: 'World map', href: MAP_HREF, live: true },
  { label: 'Leaderboard', href: LEADERBOARD_HREF, live: true },
  { label: 'Math Tower', href: '/math', live: false },
  { label: 'Profile', href: PROFILE_HREF, live: true },
];

/** The items the nav shows. Empty until the first page ships. */
export const LIVE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.live);

/** id of the <main> the skip link jumps to. */
export const MAIN_CONTENT_ID = 'main';
