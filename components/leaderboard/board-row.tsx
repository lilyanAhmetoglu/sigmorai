import type { ComponentProps } from 'react';
import { Badge } from '@/components/badge';
import { PixelAvatar } from '@/components/pixel-avatar';
import { LEADERBOARD_TEXT, TRACK_ACCENTS, TRACK_TEXT } from '@/lib/constants';
import type { LeaderboardRow } from '@/lib/types';

type Props = ComponentProps<'li'> & { row: LeaderboardRow };

/** Places 1–3 get a medal colour; the number itself is always shown. */
const PODIUM = 3;

/**
 * One leaderboard row: rank, sprite (drawn from the hero name, never a
 * photo), name, "TRACK · LV n", XP. The viewer's row says "YOU" in text and
 * gets a ring, so the mark is not colour only. Styles: leaderboard.css.
 */
export function BoardRow({ row, ...rest }: Props) {
  return (
    <li
      {...rest}
      className="board-row"
      data-viewer={row.isViewer || undefined}
      aria-current={row.isViewer ? 'true' : undefined}
    >
      <span className="board-rank" data-place={row.rank <= PODIUM ? row.rank : undefined}>
        <span className="sr-only">{LEADERBOARD_TEXT.rank} </span>
        {row.rank}
      </span>
      <PixelAvatar
        seed={row.heroName}
        size="sm"
        accent={TRACK_ACCENTS[row.track]}
        className="flex-none"
      />
      <div className="board-who">
        <span className="board-name">
          <span className="min-w-0 break-words">{row.heroName}</span>
          {row.isViewer && <Badge accent="xp">{LEADERBOARD_TEXT.you}</Badge>}
        </span>
        <span className="board-sub">
          {LEADERBOARD_TEXT.subline(TRACK_TEXT[row.track].label, row.level)}
        </span>
      </div>
      <span className="board-xp">{LEADERBOARD_TEXT.xp(row.xp)}</span>
    </li>
  );
}
