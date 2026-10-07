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
  BLOG_POST_EXT,
  BOSS_SEGMENT,
  BOSS_STEP,
  CHAPTER_STEPS,
  FRONTIER_AREA,
  FRONTIER_HREF,
  MATH_AREA,
  MATH_FLOOR_COUNT,
  MATH_HREF,
  MAX_CHAPTERS,
  QUEST_BACK_HREF,
  REALMS,
  realmHref,
  realmRow,
  SEGMENT_PREFIX,
  SIDE_STEPS,
  TRACKS,
  trackRealms,
} from '@/lib/constants';
import type {
  ChapterStep,
  ExerciseRef,
  RealmTable,
  SideStep,
  Track,
  TrackOutline,
} from '@/lib/types';
import { utcMidnight } from '@/lib/utils';

const alt = (xs: readonly (string | number)[]) => `(?:${xs.join('|')})`;
const range = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i);

/** A numbered segment: `segment('chapter', 1)` → `c1`. */
export const segment = (kind: keyof typeof SEGMENT_PREFIX, n: number | string) =>
  `${SEGMENT_PREFIX[kind]}${n}`;

// Any chapter a realm may have. Whether this realm really has it is the
// outline's job (checkOpen), not the grammar's.
const CHAPTER = segment('chapter', alt(range(1, MAX_CHAPTERS)));
const FLOOR = segment('floor', alt(range(1, MATH_FLOOR_COUNT)));
const DATE = String.raw`\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])`;
/** A lowercase kebab-case slug (Frontier, blog, sources.yaml and concept ids). */
export const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
/** Length of `YYYY-MM-DD` at the start of a Frontier segment. */
const DATE_LENGTH = 10;

/**
 * The id pattern for a realm table. Built per track: a track's realms are
 * the core rows plus the rows it owns, so `creator/r9/...` parses only when
 * creator owns r9 (path-curriculum spec, amendments 2026-10-07). Anchored,
 * and every segment ends at `/`, so `r1` and `r10` can't clash.
 * Structure only; parseExerciseId also rejects impossible dates (2026-02-30).
 */
function exerciseIdPattern(table: RealmTable): RegExp {
  const realmPaths = TRACKS.flatMap((track) => {
    const realm = segment('realm', alt(trackRealms(track, table).map((r) => r.id)));
    return [
      `${track}/${realm}/${CHAPTER}/${alt(CHAPTER_STEPS)}`,
      `${track}/${realm}/${BOSS_SEGMENT}/${BOSS_STEP}`,
    ];
  });
  return new RegExp(
    `^${alt([
      ...realmPaths,
      `${MATH_AREA}/${FLOOR}/${alt(SIDE_STEPS)}`,
      `${FRONTIER_AREA}/${DATE}-${SLUG}/${alt(SIDE_STEPS)}`,
    ])}$`,
  );
}

/** The pattern for REALMS. Another table (a test fixture) gets its own, built once. */
export const EXERCISE_ID_PATTERN = exerciseIdPattern(REALMS);
const patterns = new WeakMap<RealmTable, RegExp>([[REALMS, EXERCISE_ID_PATTERN]]);
function patternFor(table: RealmTable): RegExp {
  let pattern = patterns.get(table);
  if (!pattern) {
    pattern = exerciseIdPattern(table);
    patterns.set(table, pattern);
  }
  return pattern;
}

function isCalendarDate(date: string): boolean {
  const d = utcMidnight(date);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(date);
}

/** The number after a one-letter prefix: `r3` → 3. */
const indexOf = (segment: string) => Number(segment.slice(1));

/** `table`: test seam: app code never passes `table` (a fixture with specialist rows). */
export function parseExerciseId(id: string, table: RealmTable = REALMS): ExerciseRef | null {
  if (!patternFor(table).test(id)) return null;
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

/**
 * A realm chapter without its step (`builder/r1/c1`, a shared-chapters member)
 * → its ref, or null for anything else (a boss, a Math floor, a bad shape).
 */
export function parseChapterId(
  id: string,
): { track: Track; realm: number; chapter: number } | null {
  const ref = parseExerciseId(`${id}/${CHAPTER_STEPS[0]}`);
  if (ref?.area !== 'chapter') return null;
  return { track: ref.track, realm: ref.realm, chapter: ref.chapter };
}

/** One argument on purpose: it is passed to `filter` and Zod's `refine`. */
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

/**
 * Throws on an out-of-range ref (or a realm the track doesn't have), so a
 * bad id can never be written. `table`: test seam: app code never passes `table`.
 */
export function buildExerciseId(ref: ExerciseRef, table: RealmTable = REALMS): string {
  const id = format(ref);
  if (!parseExerciseId(id, table)) {
    throw new RangeError(`Invalid exercise ref: ${JSON.stringify(ref)}`);
  }
  return id;
}

/** A blog post's file name: the Frontier `<YYYY-MM-DD>-<slug>` grammar + `.mdx`. */
const BLOG_FILE_PATTERN = new RegExp(`^(${DATE})-(${SLUG})${BLOG_POST_EXT.replace('.', '\\.')}$`);

/**
 * `2026-10-06-be-specific.mdx` → `{ date: '2026-10-06', slug: 'be-specific' }`.
 * Null for any other name, or an impossible date (2026-02-30).
 */
export function parseBlogFileName(name: string): { date: string; slug: string } | null {
  const match = BLOG_FILE_PATTERN.exec(name);
  if (!match || !isCalendarDate(match[1])) return null;
  return { date: match[1], slug: match[2] };
}

/**
 * Every exercise id of one realm on one track: each chapter step, then the
 * boss. `chapterCount` is the realm's chapter count in that track's outline.
 * `table`: test seam: app code never passes `table`.
 */
export function realmExerciseIds(
  track: Track,
  realm: number,
  chapterCount: number,
  table: RealmTable = REALMS,
): string[] {
  const ids: string[] = [];
  for (let chapter = 1; chapter <= chapterCount; chapter++) {
    for (const step of CHAPTER_STEPS) {
      ids.push(buildExerciseId({ area: 'chapter', track, realm, chapter, step }, table));
    }
  }
  ids.push(buildExerciseId({ area: 'boss', track, realm }, table));
  return ids;
}

/**
 * Every realm exercise id of one track, realm by realm in its outline's
 * order. `table`: test seam: app code never passes `table`.
 */
export function trackExerciseIds(
  track: Track,
  outline: TrackOutline,
  table: RealmTable = REALMS,
): string[] {
  return outline.realms.flatMap((realm) =>
    realmExerciseIds(track, realm.id, realm.chapters.length, table),
  );
}

/** Every Math Tower exercise id, floor by floor (lesson, then quick check). */
export function mathExerciseIds(): string[] {
  return Array.from({ length: MATH_FLOOR_COUNT }, (_, i) =>
    SIDE_STEPS.map((step) => buildExerciseId({ area: MATH_AREA, floor: i + 1, step })),
  ).flat();
}

/**
 * The Frontier exercise ids of these folders (`2026-10-05-some-slug`), folder
 * by folder (lesson, then quick check). A folder that breaks the grammar has none.
 */
export function frontierExerciseIds(folders: readonly string[]): string[] {
  return folders.flatMap((folder) =>
    SIDE_STEPS.map((step) => `${FRONTIER_AREA}/${folder}/${step}`).filter(isExerciseId),
  );
}

/**
 * Where a quest's back link goes: its realm page on its track, the tower
 * page, the Frontier page, else the catalog.
 */
export function questBackHref(exerciseId: string): string {
  const ref = parseExerciseId(exerciseId);
  if (ref?.area === MATH_AREA) return MATH_HREF;
  if (ref?.area === FRONTIER_AREA) return FRONTIER_HREF;
  if (ref?.area !== 'chapter' && ref?.area !== 'boss') return QUEST_BACK_HREF;
  // The grammar proved the realm is a REALMS row on this track.
  return realmHref(realmRow(ref.realm)!.slug, ref.track);
}
