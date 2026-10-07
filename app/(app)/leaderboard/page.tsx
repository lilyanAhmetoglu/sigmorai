import type { Metadata } from 'next';
import { BoardRow } from '@/components/leaderboard/board-row';
import { RangeSwitch } from '@/components/leaderboard/range-switch';
import { ViewerRank } from '@/components/leaderboard/viewer-rank';
import { Panel } from '@/components/panel';
import { ShareButtons } from '@/components/share-buttons';
import {
  LEADERBOARD_HREF,
  LEADERBOARD_TEXT,
  leaderboardHref,
  RANGE_PARAM,
  SHARE_RANGE_TEXT,
  SHARE_TEXT,
  SITE_NAME,
} from '@/lib/constants';
import { getLeaderboard } from '@/lib/data/leaderboard';
import { socialMetadata } from '@/lib/og/metadata';
import { parseLeaderboardRange } from '@/lib/xp/leaderboard';

// Relative URLs resolve against metadataBase (app/layout.tsx).
export const metadata: Metadata = {
  title: `${LEADERBOARD_TEXT.title} · ${SITE_NAME}`,
  description: LEADERBOARD_TEXT.description,
  alternates: { canonical: LEADERBOARD_HREF },
  ...socialMetadata({
    title: `${LEADERBOARD_TEXT.title} · ${SITE_NAME}`,
    description: LEADERBOARD_TEXT.description,
    url: LEADERBOARD_HREF,
  }),
};

/**
 * The public leaderboard (Sigmorai App.dc.html → isBoard, SIG-20). Top 25 for
 * the range in `?range=` (week | month | all; anything else = all), plus the
 * signed-in viewer's own rank. Ranks are read on the server; the page only
 * gets hero names, tracks, levels and XP.
 */
export default async function LeaderboardPage({ searchParams }: PageProps<'/leaderboard'>) {
  const params = await searchParams;
  const range = parseLeaderboardRange(params[RANGE_PARAM]);
  const { rows, viewer } = await getLeaderboard(range);
  const rangeLabel = LEADERBOARD_TEXT.ranges[range];
  // A ranked viewer shares their own place in this range; everyone else shares the board.
  const ownRank =
    viewer.status === 'ranked' ? viewer.row.rank : rows.find((row) => row.isViewer)?.rank;
  const share = ownRank
    ? { url: leaderboardHref(range), text: SHARE_TEXT.rank(ownRank, SHARE_RANGE_TEXT[range]) }
    : { url: LEADERBOARD_HREF, text: SHARE_TEXT.leaderboard };

  return (
    <div className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="page-eyebrow">{LEADERBOARD_TEXT.eyebrow}</p>
          <h1 className="page-title">{LEADERBOARD_TEXT.title}</h1>
        </div>
        <RangeSwitch current={range} />
      </header>
      <div className="flex flex-col gap-1">
        <p className="page-intro">{LEADERBOARD_TEXT.intro}</p>
        <p className="text-small leading-body text-text-3 m-0">
          {LEADERBOARD_TEXT.windowNote[range]}
        </p>
      </div>

      {rows.length === 0 ? (
        <Panel tone="sunken" className="flex flex-col gap-1">
          <p className="text-body leading-body m-0">{LEADERBOARD_TEXT.empty[range]}</p>
          <p className="text-small leading-body text-text-2 m-0">{LEADERBOARD_TEXT.emptyHint}</p>
        </Panel>
      ) : (
        <ol className="board-list" aria-label={LEADERBOARD_TEXT.listLabel(rangeLabel)}>
          {rows.map((row) => (
            <BoardRow key={row.rank} row={row} />
          ))}
        </ol>
      )}

      {/* An empty board already says "no XP", so skip the viewer's own no-XP line. */}
      {!(rows.length === 0 && viewer.status === 'no-xp') && (
        <ViewerRank viewer={viewer} range={range} />
      )}

      <ShareButtons target={share} />
    </div>
  );
}
