import Link from 'next/link';
import { LEADERBOARD_RANGES, LEADERBOARD_TEXT, leaderboardHref } from '@/lib/constants';
import type { LeaderboardRange } from '@/lib/types';

type Props = { current: LeaderboardRange };

/**
 * WEEK / MONTH / ALL TIME (design: boardTabs). Links, not client Tabs: each
 * range is its own URL, so it works with no client JS and can be shared.
 * Same idea as TrackSwitch, but that one is tied to tracks and their accent
 * colours, and the design draws these as notched tabs. Styles: leaderboard.css.
 */
export function RangeSwitch({ current }: Props) {
  return (
    <nav aria-label={LEADERBOARD_TEXT.rangeNav}>
      <ul className="range-switch">
        {LEADERBOARD_RANGES.map((range) => (
          <li key={range}>
            <Link
              href={leaderboardHref(range)}
              className="range-switch-link"
              aria-current={range === current ? 'page' : undefined}
            >
              {LEADERBOARD_TEXT.ranges[range]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
