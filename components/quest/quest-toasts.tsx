'use client';

import { useEffect, useState } from 'react';
import { Toast } from '@/components/toast';
import { QUEST_TEXT, TOAST_DURATION_MS } from '@/lib/constants';
import type { Accent } from '@/lib/types';

export type ToastItem = { id: number; accent: Accent; title: string; text?: string };

type Props = {
  items: readonly ToastItem[];
  /** Must be stable (useCallback): each toast's timer depends on it. */
  onDismiss: (id: number) => void;
};

/**
 * The toast host for the quest page: one persistent polite live region (so
 * a new toast is read out), toasts inside it, each closing by itself after
 * TOAST_DURATION_MS (paused on hover or focus) or on Dismiss. No slide-in, so reduced motion needs
 * nothing extra. Placement: quest.css.
 */
export function QuestToasts({ items, onDismiss }: Props) {
  return (
    <div className="quest-toasts" role="status" aria-label={QUEST_TEXT.notifications}>
      {items.map((item) => (
        <TimedToast key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/** Closes after TOAST_DURATION_MS, but not while the pointer or focus is on it (the timer restarts after). */
function TimedToast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const { id, accent, title, text } = item;
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onDismiss(id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [id, onDismiss, paused]);
  return (
    <Toast
      accent={accent}
      title={title}
      onDismiss={() => onDismiss(id)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {text}
    </Toast>
  );
}
