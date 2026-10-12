/** The parts of Web Storage a flag needs (localStorage in the browser, a stub in tests). */
export type FlagStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Whether `key` is set. Reading `window.localStorage` itself can throw
 * (blocked site data, some private windows), so the caller passes a getter
 * and any error reads as "not set".
 */
export function readStorageFlag(getStorage: () => FlagStorage, key: string): boolean {
  try {
    return getStorage().getItem(key) !== null;
  } catch {
    return false;
  }
}

/** Set `key`. Returns false when storage is blocked or full; the caller carries on. */
export function writeStorageFlag(getStorage: () => FlagStorage, key: string): boolean {
  try {
    getStorage().setItem(key, '1');
    return true;
  } catch {
    return false;
  }
}
