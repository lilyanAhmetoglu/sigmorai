'use client';

import { RouteError } from '@/components/route-error';
import { LEADERBOARD_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function LeaderboardError({ error, retry }: Props) {
  return (
    <RouteError
      message={LEADERBOARD_TEXT.error}
      retryLabel={LEADERBOARD_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
