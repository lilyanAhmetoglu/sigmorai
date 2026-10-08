import { getHudState } from '@/lib/data/hud';
import { dbErrorSummary } from '@/lib/utils';

// Personal data: never kept by a browser or CDN cache. On the error too.
const HEADERS = { 'Cache-Control': 'private, no-store' };

/**
 * The header HUD on static pages (/, /blog, /privacy, sign-in): PublicHud
 * calls this after Clerk finds a session, so those pages stay prerendered.
 * The in-app pages read the same getHudState on the server (HudSlot).
 * Scoped to the session's user only (getHudState reads auth()); signed out
 * gets { status: 'signed-out' }. Read-only, no input.
 */
export async function GET() {
  try {
    return Response.json(await getHudState(), { headers: HEADERS });
  } catch (err) {
    // The name tells an auth() failure from a DB one; the DB summary has no values.
    console.error('[hud]', err instanceof Error ? err.name : 'unknown', dbErrorSummary(err));
    return Response.json({ error: 'HUD failed' }, { status: 500, headers: HEADERS });
  }
}
