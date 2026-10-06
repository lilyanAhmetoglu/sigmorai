import type { LeaderboardRange, NavItem, Track } from '@/lib/types';
import { RANGE_PARAM } from './leaderboard';

/** The public landing page. Where a deleted account lands. */
export const HOME_HREF = '/';
/** The privacy page (app/(marketing)/privacy), linked from the footer. */
export const PRIVACY_HREF = '/privacy';
/** The blog list (app/(marketing)/blog), linked from the footer. */
export const BLOG_HREF = '/blog';
/** One post: `/blog/<slug>` (the slug is the file name without its date). */
export const blogHref = (slug: string) => `${BLOG_HREF}/${slug}`;
/** The RSS 2.0 feed of every post (app/(marketing)/blog/feed.xml). */
export const BLOG_FEED_HREF = `${BLOG_HREF}/feed.xml`;
/** "Download your data": a JSON attachment (app/api/account/export). */
export const ACCOUNT_EXPORT_HREF = '/api/account/export';
/** The file name of that download. */
export const ACCOUNT_EXPORT_FILENAME = 'sigmorai-data.json';
/** The delete-account form's confirm checkbox: its name, and the value it sends when ticked. */
export const DELETE_CONFIRM_FIELD = 'confirm';
export const DELETE_CONFIRM_VALUE = 'yes';

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
/** The Math Tower: the side realm's 8 floors (app/(app)/math). */
export const MATH_HREF = '/math';
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
  { label: 'Math Tower', href: MATH_HREF, live: true },
  { label: 'Profile', href: PROFILE_HREF, live: true },
];

/** The items the nav shows. Empty until the first page ships. */
export const LIVE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.live);

/** id of the <main> the skip link jumps to. */
export const MAIN_CONTENT_ID = 'main';
