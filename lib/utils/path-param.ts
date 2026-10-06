import { ONBOARDING_HREF, PATH_PARAM, TRACKS } from '@/lib/constants';
import type { Track } from '@/lib/types';

/** `?path=` → a track. Missing, unknown or repeated (an array) → undefined. */
export function parsePathParam(value: unknown): Track | undefined {
  return typeof value === 'string' && (TRACKS as readonly string[]).includes(value)
    ? (value as Track)
    : undefined;
}

/**
 * The track inside a sign-up `redirect_url`, when it points at onboarding
 * (`/onboarding?path=creator`). Anything else → undefined. The caller builds its
 * own onboarding URL from the track, so the raw value is never redirected to.
 */
export function pathFromRedirect(value: unknown): Track | undefined {
  if (typeof value !== 'string') return undefined;
  let url: URL;
  try {
    // The base only resolves a relative value; the origin is never used.
    url = new URL(value, 'https://placeholder.invalid');
  } catch {
    return undefined;
  }
  if (url.pathname !== ONBOARDING_HREF) return undefined;
  return parsePathParam(url.searchParams.get(PATH_PARAM));
}
