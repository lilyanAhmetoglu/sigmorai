import 'server-only';
import { cache } from 'react';
import { loadTrackOutline } from '@/lib/content/load';
import type { Track, TrackOutline } from '@/lib/types';

/**
 * A track's outline (content/<track>/outline.json), memoised: checkOpen reads
 * it on every graded action for the realm's chapter count. Content ships with
 * the deploy, so production reads each track once per server; in dev the file
 * changes while the server runs, so it is read once per request. Same split
 * as liveIds (lib/data/realms.ts) and sharedGroups (./credit.ts).
 */
const memo = new Map<Track, Promise<TrackOutline>>();
const perRequest = cache((track: Track) => loadTrackOutline(track));

export function trackOutline(track: Track): Promise<TrackOutline> {
  if (process.env.NODE_ENV !== 'production') return perRequest(track);
  let outline = memo.get(track);
  if (!outline) {
    outline = loadTrackOutline(track);
    memo.set(track, outline);
    outline.catch(() => memo.delete(track));
  }
  return outline;
}
