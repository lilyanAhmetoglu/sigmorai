'use client';

import { RouteError } from '@/components/route-error';
import { QUEST_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function QuestError({ error, retry }: Props) {
  return (
    <RouteError
      message={QUEST_TEXT.loadError}
      retryLabel={QUEST_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
