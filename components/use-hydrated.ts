'use client';

import { useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/**
 * False on the server and during hydration, true after. For output only the
 * browser knows (local time, Clerk state on a static page): render the server
 * version first, so the HTML and the first client render match. Used by
 * ResetNote and useHideSignedOut (PublicHud, the Menu's Sign in, LandingCta).
 */
export const useHydrated = () =>
  useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
