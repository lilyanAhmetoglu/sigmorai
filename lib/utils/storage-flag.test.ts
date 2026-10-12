import { describe, expect, test } from 'bun:test';
import { type FlagStorage, readStorageFlag, writeStorageFlag } from './storage-flag';

function memoryStorage(): FlagStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

const throwing = (): FlagStorage => {
  throw new Error('SecurityError');
};

const failingWrites: FlagStorage = {
  getItem: () => null,
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('storage flag', () => {
  test('unset, then set after a write', () => {
    const storage = memoryStorage();
    expect(readStorageFlag(() => storage, 'k')).toBe(false);
    expect(writeStorageFlag(() => storage, 'k')).toBe(true);
    expect(readStorageFlag(() => storage, 'k')).toBe(true);
    expect(readStorageFlag(() => storage, 'other')).toBe(false);
  });

  test('blocked storage reads as unset and the write reports failure', () => {
    expect(readStorageFlag(throwing, 'k')).toBe(false);
    expect(writeStorageFlag(throwing, 'k')).toBe(false);
    expect(writeStorageFlag(() => failingWrites, 'k')).toBe(false);
  });
});
