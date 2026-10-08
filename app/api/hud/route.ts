import { getHudState } from '@/lib/data/hud';
import { dbErrorSummary } from '@/lib/utils';

/**
 * The header HUD on static pages (/, /blog, /privacy, sign-in): PublicHud
 * calls this after Clerk finds a session, so those pages stay prerendered.
 * The in-app pages read the same getHudState on the server (HudSlot).
 * Scoped to the session's user only (getHudState reads auth()); signed out
 * gets { status: 'signed-out' }. Read-only, no input.
 */
export async function GET() {
  try {
    const state = await getHudState();
    // Personal data: never kept by a browser or CDN cache.
    return Response.json(state, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err) {
    console.error('[hud]', dbErrorSummary(err));
    return Response.json({ error: 'HUD failed' }, { status: 500 });
  }
}
