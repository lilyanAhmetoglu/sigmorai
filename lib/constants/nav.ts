import type { LeaderboardRange, NavItem, Track } from '@/lib/types';
import { RANGE_PARAM } from './leaderboard';
import { AUTH_ROUTES, CLERK_REDIRECT_PARAM } from './site';

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
/** The signed-in player's HUD values as JSON (app/api/hud), for the header on static pages. */
export const HUD_API_HREF = '/api/hud';
/** The delete-account form's confirm checkbox: its name, and the value it sends when ticked. */
export const DELETE_CONFIRM_FIELD = 'confirm';
export const DELETE_CONFIRM_VALUE = 'yes';

/** Onboarding: a signed-in player with no users row picks a track and a hero name here. */
export const ONBOARDING_HREF = '/onboarding';
/** The search param that preselects a track in onboarding (`?path=creator`), set by the landing cards. */
export const PATH_PARAM = 'path';
/** Onboarding, plus `?path=` when a track is given. */
export const onboardingHref = (track?: Track) =>
  `${ONBOARDING_HREF}${track ? `?${PATH_PARAM}=${track}` : ''}`;
/**
 * Sign-up that ends in onboarding with `track` preselected. Clerk keeps
 * `redirect_url` through its own steps (email code, OAuth); the sign-up page
 * reads it back and accepts only an onboarding URL (lib/utils/path-param.ts).
 */
export const signUpHref = (track: Track) =>
  `${AUTH_ROUTES.signUp}?${CLERK_REDIRECT_PARAM}=${encodeURIComponent(onboardingHref(track))}`;
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
/** The Frontier: the side realm of dated chapters on new docs (app/(app)/frontier). */
export const FRONTIER_HREF = '/frontier';
/** The world map (app/(app)/map/(world)): every realm of a path as a land on one map. */
export const MAP_HREF = '/map';
/** The world map, plus `?track=` when a track is given. */
export const worldMapHref = (track?: Track) =>
  `${MAP_HREF}${track ? `?${TRACK_PARAM}=${track}` : ''}`;
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
 * The in-app nav, in the design's order (Sigmorai App.dc.html → navItems),
 * except Blog takes the design's MATH TOWER slot (maintainer, 2026-10-07):
 * the tower is a dashboard shortcut now. The design export still says MATH
 * TOWER until the next Claude Design pass.
 * `live: false` until the route exists. Only live items show, so there are
 * no dead links and no rows of "soon" text. Flip it to true in the PR that
 * adds the page.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', href: DASHBOARD_HREF, live: true },
  { label: 'Realms', href: REALMS_HREF, live: true },
  { label: 'World map', href: MAP_HREF, live: true },
  { label: 'Leaderboard', href: LEADERBOARD_HREF, live: true },
  { label: 'Blog', href: BLOG_HREF, live: true },
  { label: 'Profile', href: PROFILE_HREF, live: true },
];

/** The items the nav shows. Empty until the first page ships. */
export const LIVE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.live);

/** id of the <main> the skip link jumps to. */
export const MAIN_CONTENT_ID = 'main';
/** The sitemap (app/sitemap.ts), linked from robots.txt and llms.txt. */
export const SITEMAP_HREF = '/sitemap.xml';
