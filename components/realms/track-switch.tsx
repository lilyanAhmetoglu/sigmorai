import Link from 'next/link';
import { REALMS_TEXT, TRACK_ACCENTS, TRACK_TEXT, TRACKS } from '@/lib/constants';
import type { Track } from '@/lib/types';

type Props = {
  current: Track;
  /** The page URL for a track, e.g. realmsHref. */
  hrefFor: (track: Track) => string;
};

/**
 * Builder / strategist switch (design: trackTabs). Links, not tabs: each
 * track is its own URL, so it works with no client JS. Styles: realms.css.
 */
export function TrackSwitch({ current, hrefFor }: Props) {
  return (
    <nav aria-label={REALMS_TEXT.trackSwitch}>
      <ul className="track-switch">
        {TRACKS.map((track) => (
          <li key={track}>
            <Link
              href={hrefFor(track)}
              className="track-switch-link"
              data-accent={TRACK_ACCENTS[track]}
              aria-current={track === current ? 'page' : undefined}
            >
              {TRACK_TEXT[track].label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
