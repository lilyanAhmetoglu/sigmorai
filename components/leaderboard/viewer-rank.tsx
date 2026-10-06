import Link from 'next/link';
import { Panel } from '@/components/panel';
import { AUTH_ROUTES, LEADERBOARD_TEXT, ONBOARDING_HREF } from '@/lib/constants';
import type { LeaderboardRange, LeaderboardViewer } from '@/lib/types';
import { BoardRow } from './board-row';

type Props = { viewer: LeaderboardViewer; range: LeaderboardRange };

/**
 * The viewer's place under the top list: their own row when they rank below
 * it, a "no XP in this range" line, or a sign-in / create-hero link. Nothing
 * when their row is already marked in the list.
 */
export function ViewerRank({ viewer, range }: Props) {
  switch (viewer.status) {
    case 'in-top':
      return null;
    case 'ranked':
      return (
        <section aria-labelledby="your-rank" className="flex flex-col gap-2">
          <h2 id="your-rank" className="page-eyebrow">
            {LEADERBOARD_TEXT.yourRank}
          </h2>
          <ul className="board-list">
            <BoardRow row={viewer.row} />
          </ul>
        </section>
      );
    case 'no-xp':
      return (
        <Panel tone="sunken" padding="sm" className="flex flex-col gap-1">
          <p className="text-body leading-body m-0">{LEADERBOARD_TEXT.noXp[range]}</p>
          <p className="text-small leading-body text-text-2 m-0">{LEADERBOARD_TEXT.noXpHint}</p>
        </Panel>
      );
    case 'onboarding':
      return (
        <Note
          text={LEADERBOARD_TEXT.onboardingNote}
          href={ONBOARDING_HREF}
          link={LEADERBOARD_TEXT.onboarding}
        />
      );
    case 'signed-out':
      return (
        <Note
          text={LEADERBOARD_TEXT.signInNote}
          href={AUTH_ROUTES.signIn}
          link={LEADERBOARD_TEXT.signIn}
        />
      );
  }
}

function Note({ text, href, link }: { text: string; href: string; link: string }) {
  return (
    <p className="text-small leading-body text-text-2 m-0">
      {text}{' '}
      <Link href={href} className="inline-flex min-h-11 items-center">
        {link}
      </Link>
    </p>
  );
}
