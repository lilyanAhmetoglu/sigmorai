/**
 * Exercise id grammar (content/CLAUDE.md). The track lives in the id, so
 * shared Math Tower and Frontier content grants XP once per user.
 *
 *   builder/r0/c1/lesson | challenge | quick-check
 *   strategist/r3/boss/challenge
 *   math/f1/lesson | quick-check
 *   frontier/2026-10-05-some-slug/lesson | quick-check
 *
 * Pure: no IO. Ids are stored in progress, submissions and xp_events forever.
 */
import {
  BOSS_SEGMENT,
  BOSS_STEP,
  CHAPTER_COUNT,
  CHAPTER_STEPS,
  FRONTIER_AREA,
  MATH_AREA,
  MATH_FLOOR_COUNT,
  QUEST_BACK_HREF,
  REALM_COUNT,
  REALMS,
  realmHref,
  SEGMENT_PREFIX,
  SIDE_STEPS,
  TRACKS,
} from '@/lib/constants';
import type { ChapterStep, ExerciseRef, RealmId, SideStep, Track } from '@/lib/types';

const alt = (xs: readonly (string | number)[]) => `(?:${xs.join('|')})`;
const range = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i);

/** A numbered segment: `segment('chapter', 1)` → `c1`. */
export const segment = (kind: keyof typeof SEGMENT_PREFIX, n: number | string) =>
  `${SEGMENT_PREFIX[kind]}${n}`;

const TRACK = alt(TRACKS);
const REALM = segment('realm', alt(range(0, REALM_COUNT)));
const CHAPTER = segment('chapter', alt(range(1, CHAPTER_COUNT)));
const FLOOR = segment('floor', alt(range(1, MATH_FLOOR_COUNT)));
const DATE = String.raw`\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])`;
const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
/** Length of `YYYY-MM-DD` at the start of a Frontier segment. */
const DATE_LENGTH = 10;

/** Structure only; parseExerciseId also rejects impossible dates (2026-02-30). */
export const EXERCISE_ID_PATTERN = new RegExp(
  `^${alt([
    `${TRACK}/${REALM}/${CHAPTER}/${alt(CHAPTER_STEPS)}`,
    `${TRACK}/${REALM}/${BOSS_SEGMENT}/${BOSS_STEP}`,
    `${MATH_AREA}/${FLOOR}/${alt(SIDE_STEPS)}`,
    `${FRONTIER_AREA}/${DATE}-${SLUG}/${alt(SIDE_STEPS)}`,
  ])}$`,
);

function isCalendarDate(date: string): boolean {
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(date);
}

/** The number after a one-letter prefix: `r3` → 3. */
const indexOf = (segment: string) => Number(segment.slice(1));

export function parseExerciseId(id: string): ExerciseRef | null {
  if (!EXERCISE_ID_PATTERN.test(id)) return null;
  // The pattern above already proved each segment's shape, so the casts are safe.
  const [head, second, third, fourth] = id.split('/');

  if (head === MATH_AREA) {
    return { area: MATH_AREA, floor: indexOf(second), step: third as SideStep };
  }
  if (head === FRONTIER_AREA) {
    const date = second.slice(0, DATE_LENGTH);
    if (!isCalendarDate(date)) return null;
    return {
      area: FRONTIER_AREA,
      date,
      slug: second.slice(DATE_LENGTH + 1),
      step: third as SideStep,
    };
  }
  const track = head as Track;
  const realm = indexOf(second);
  if (third === BOSS_SEGMENT) return { area: 'boss', track, realm };
  return { area: 'chapter', track, realm, chapter: indexOf(third), step: fourth as ChapterStep };
}

export const isExerciseId = (id: string): boolean => parseExerciseId(id) !== null;

function format(ref: ExerciseRef): string {
  switch (ref.area) {
    case 'chapter':
      return [
        ref.track,
        segment('realm', ref.realm),
        segment('chapter', ref.chapter),
        ref.step,
      ].join('/');
    case 'boss':
      return [ref.track, segment('realm', ref.realm), BOSS_SEGMENT, BOSS_STEP].join('/');
    case MATH_AREA:
      return [MATH_AREA, segment('floor', ref.floor), ref.step].join('/');
    case FRONTIER_AREA:
      return `${FRONTIER_AREA}/${ref.date}-${ref.slug}/${ref.step}`;
  }
}

/** Throws on an out-of-range ref, so a bad id can never be written. */
export function buildExerciseId(ref: ExerciseRef): string {
  const id = format(ref);
  if (!isExerciseId(id)) throw new RangeError(`Invalid exercise ref: ${JSON.stringify(ref)}`);
  return id;
}

/** Every exercise id of one realm on one track: each chapter step, then the boss. */
export function realmExerciseIds(track: Track, realm: number): string[] {
  const ids: string[] = [];
  for (let chapter = 1; chapter <= CHAPTER_COUNT; chapter++) {
    for (const step of CHAPTER_STEPS) {
      ids.push(buildExerciseId({ area: 'chapter', track, realm, chapter, step }));
    }
  }
  ids.push(buildExerciseId({ area: 'boss', track, realm }));
  return ids;
}

/** Every realm exercise id of one track, realm by realm in map order. */
export function trackExerciseIds(track: Track): string[] {
  return Array.from({ length: REALM_COUNT }, (_, realm) => realmExerciseIds(track, realm)).flat();
}

/** Where a quest's back link goes: its realm page on its track, else the catalog. */
export function questBackHref(exerciseId: string): string {
  const ref = parseExerciseId(exerciseId);
  if (ref?.area !== 'chapter' && ref?.area !== 'boss') return QUEST_BACK_HREF;
  return realmHref(REALMS[ref.realm as RealmId].slug, ref.track);
}
