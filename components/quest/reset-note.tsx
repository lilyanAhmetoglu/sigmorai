'use client';

import { useSyncExternalStore } from 'react';
import { QUEST_TEXT } from '@/lib/constants';

const noSubscribe = () => () => {};

type Props = {
  /** The sentence before the time, e.g. "No HP left for this case. HP refills at". */
  lead: string;
  /** UTC ISO instant from the server. */
  resetsAt: string;
};

/**
 * "… refills at 02:00 (your time)." The server sends a UTC instant; only the
 * browser knows the learner's time zone, so the time renders after hydration
 * (the server HTML has the sentence without a time, so nothing mismatches).
 */
export function ResetNote({ lead, resetsAt }: Props) {
  const isClient = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const time = isClient
    ? new Date(resetsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  return (
    <p className="quest-note">
      {lead} <time dateTime={resetsAt}>{time}</time> {QUEST_TEXT.localTimeSuffix}
    </p>
  );
}
