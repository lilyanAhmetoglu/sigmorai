import { Badge } from '@/components/badge';
import { REALMS_TEXT, TRACK_ACCENTS, TRACK_TEXT } from '@/lib/constants';
import type { Track } from '@/lib/types';

type Props = {
  /** The realm's owner: null = a core realm (no badge). */
  track: Track | null;
};

/**
 * "CREATOR ONLY" on a specialist realm, in its path's colour (the HUD track
 * badge's accent). The words carry the meaning, never the colour alone. One
 * check for the catalog card and the "Your path" row.
 */
export function PathRealmBadge({ track }: Props) {
  if (track === null) return null;
  return (
    <Badge accent={TRACK_ACCENTS[track]}>{REALMS_TEXT.pathRealm(TRACK_TEXT[track].label)}</Badge>
  );
}
