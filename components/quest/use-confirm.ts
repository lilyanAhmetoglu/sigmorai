'use client';

import { useEffect, useState } from 'react';
import { RESET_CONFIRM_MS } from '@/lib/constants';

/**
 * A two-press action with no browser dialog: the first press arms it, a
 * second press within RESET_CONFIRM_MS runs it, and it disarms by itself.
 */
export function useConfirm(action: () => void) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), RESET_CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  function press() {
    if (!armed) return setArmed(true);
    setArmed(false);
    action();
  }

  return { armed, press };
}
