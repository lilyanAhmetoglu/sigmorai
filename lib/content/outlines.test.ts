import { readdirSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import {
  CASE_FILE,
  CHAPTER_STEPS,
  CONTENT_DIR,
  MATH_AREA,
  MATH_FLOORS,
  OUTLINE_FILE,
  REALMS,
  SIDE_STEPS,
  TRACKS,
} from '@/lib/constants';
import { CaseSchema, ExerciseIdSchema, MathOutlineSchema, TrackOutlineSchema } from '@/lib/types';
import { realmFolder } from './curriculum';
import { buildExerciseId, segment } from './ids';

// Reads the outlines from disk, the way the content loader will.
const ROOT = `${import.meta.dir}/../..`;
const areaDir = (area: string) => `${ROOT}/${CONTENT_DIR}/${area}`;
const readOutline = (area: string): Promise<unknown> =>
  Bun.file(`${areaDir(area)}/${OUTLINE_FILE}`).json();

/** Sub-folders of a directory; none when it doesn't exist yet. */
function subfolders(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

describe.each([...TRACKS])('%s outline', (track) => {
  const load = async () => TrackOutlineSchema.parse(await readOutline(track));

  test('parses, with one entry per REALMS row', async () => {
    const { realms } = await load();
    expect(realms.map((r) => r.id)).toEqual(REALMS.map((r) => r.id));
  });

  test('every exercise id it implies is valid', async () => {
    const { realms } = await load();
    const ids = realms.flatMap((realm) => [
      ...realm.chapters.flatMap((chapter) =>
        CHAPTER_STEPS.map((step) =>
          [track, segment('realm', realm.id), chapter.id, step].join('/'),
        ),
      ),
      buildExerciseId({ area: 'boss', track, realm: realm.id }),
    ]);
    for (const id of ids) expect(ExerciseIdSchema.safeParse(id).success).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every chapter folder on disk is in the outline', async () => {
    const { realms } = await load();
    const known = new Map(realms.map((r) => [realmFolder(r.id), r]));
    for (const folder of subfolders(areaDir(track))) {
      const realm = known.get(folder);
      expect(realm, `unknown realm folder ${track}/${folder}`).toBeDefined();
      // `boss` is the realm's boss case folder, not a chapter.
      const chapterIds = [...realm!.chapters.map((c) => c.id), 'boss'];
      for (const chapter of subfolders(`${areaDir(track)}/${folder}`)) {
        expect(chapterIds, `unknown chapter folder ${track}/${folder}/${chapter}`).toContain(
          chapter,
        );
      }
    }
  });
});

describe.each([...TRACKS])('%s boss cases', (track) => {
  test('a boss case title is its realm outline boss.task, verbatim', async () => {
    const { realms } = TrackOutlineSchema.parse(await readOutline(track));
    for (const realm of realms) {
      const file = Bun.file(`${areaDir(track)}/${realmFolder(realm.id)}/boss/${CASE_FILE}`);
      if (!(await file.exists())) continue;
      const { title } = CaseSchema.parse(await file.json());
      const label = `${track} realm ${realm.id}`;
      expect(realm.boss.task, `${label}: a boss case needs an outline boss.task`).toBeDefined();
      expect(title, `${label} boss title`).toBe(realm.boss.task!);
    }
  });
});

describe('math outline', () => {
  test('parses, with one entry per MATH_FLOORS row, and valid ids', async () => {
    const { floors } = MathOutlineSchema.parse(await readOutline(MATH_AREA));
    expect(floors.map((f) => f.n)).toEqual(MATH_FLOORS.map((f) => f.n));
    for (const { n } of floors) {
      for (const step of SIDE_STEPS) {
        expect(() => buildExerciseId({ area: MATH_AREA, floor: n, step })).not.toThrow();
      }
    }
  });
});

describe('broken outlines fail', () => {
  test('a track with a missing chapter', async () => {
    const outline = TrackOutlineSchema.parse(await readOutline(TRACKS[0]));
    outline.realms[0].chapters.pop();
    expect(TrackOutlineSchema.safeParse(outline).success).toBe(false);
  });

  test('chapters out of order', async () => {
    const outline = TrackOutlineSchema.parse(await readOutline(TRACKS[0]));
    outline.realms[0].chapters.reverse();
    expect(TrackOutlineSchema.safeParse(outline).success).toBe(false);
  });

  test('a realm too many', async () => {
    const outline = TrackOutlineSchema.parse(await readOutline(TRACKS[0]));
    outline.realms.push(outline.realms[0]);
    expect(TrackOutlineSchema.safeParse(outline).success).toBe(false);
  });

  test('an unknown field', async () => {
    const outline = TrackOutlineSchema.parse(await readOutline(TRACKS[0]));
    expect(TrackOutlineSchema.safeParse({ ...outline, tier: 'advanced' }).success).toBe(false);
  });
});
