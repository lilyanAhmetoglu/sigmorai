'use client';

import { useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};
const canCopy = () => typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText;

/**
 * Whether this browser can write to the clipboard. False on the server and
 * during hydration, so a Copy button renders only after hydration and only
 * when it can work (progressive). Used by ShareButtons and the certificate's
 * CopyField.
 */
export const useCanCopy = () => useSyncExternalStore(noSubscribe, canCopy, () => false);
