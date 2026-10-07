import 'server-only';
import { cache } from 'react';
import { loadSharedChapters } from '@/lib/content/load';
import type { SharedChapterGroup } from '@/lib/types';

/**
 * The shared-chapters groups (content/shared-chapters.json). Content ships
 * with the deploy, so production reads the file once per server; in dev it
 * changes while the server runs, so it is read once per request. Same split
 * as liveIds (lib/data/realms.ts).
 */
async function readGroups(): Promise<SharedChapterGroup[]> {
  return (await loadSharedChapters()).groups;
}

let memo: Promise<SharedChapterGroup[]> | null = null;
const perRequest = cache(readGroups);

export function sharedGroups(): Promise<SharedChapterGroup[]> {
  if (process.env.NODE_ENV !== 'production') return perRequest();
  if (!memo) {
    memo = readGroups();
    memo.catch(() => {
      memo = null;
    });
  }
  return memo;
}
