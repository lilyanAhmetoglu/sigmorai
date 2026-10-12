import { readdirSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import {
  CASE_FILE,
  CHAPTER_STEPS,
  CONTENT_DIR,
  LESSON_FILE,
  MATH_AREA,
  MATH_FLOORS,
  MAX_CHAPTERS,
  MIN_CHAPTERS,
  OUTLINE_FILE,
  QUICK_CHECK_FILE,
  REALMS,
  SHARED_CHAPTERS_FILE,
  SIDE_STEPS,
  TRACKS,
  trackRealms,
} from '@/lib/constants';
import {
  CaseSchema,
  ExerciseIdSchema,
  MathOutlineSchema,
  outlineRealmIssues,
  SharedChaptersFileSchema,
  trackOutlineSchema,
} from '@/lib/types';
import {
  CORE_IDS,
  CREATOR_ORDER,
  fixtureOutline,
  realmOutline,
  SPECIALIST_REALMS,
} from './__fixtures__/realms';
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
  const load = async () => trackOutlineSchema(track).parse(await readOutline(track));

  test('parses, with one entry per realm the track has; core realms in order', async () => {
    const ids = (await load()).realms.map((r) => r.id);
    // Map order is the outline: a specialist realm may sit between core realms.
    expect([...ids].sort((a, b) => a - b)).toEqual(trackRealms(track).map((r) => r.id));
    expect(ids.filter((id) => (CORE_IDS as readonly number[]).includes(id))).toEqual(CORE_IDS);
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
    const { realms } = trackOutlineSchema(track).parse(await readOutline(track));
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

describe('a same group on every track is written once (shared-chapters.json)', () => {
  // The three copies must be equal once each member's own id prefix is masked.
  // Example: a typo fixed in strategist/…/c7/lesson.mdx only fails here until
  // the builder and creator copies get the same fix.
  test('its lesson, case and quick check are the same text apart from ids', async () => {
    const { groups } = SharedChaptersFileSchema.parse(
      await Bun.file(`${ROOT}/${CONTENT_DIR}/${SHARED_CHAPTERS_FILE}`).json(),
    );
    const everyTrack = groups.filter(
      (g) => g.kind === 'same' && TRACKS.every((t) => g.members.some((m) => m.startsWith(`${t}/`))),
    );
    expect(everyTrack.length).toBeGreaterThan(0);
    for (const group of everyTrack) {
      for (const file of [LESSON_FILE, CASE_FILE, QUICK_CHECK_FILE]) {
        const copies = await Promise.all(
          group.members.map(async (member) => {
            const [track, realm, chapter] = member.split('/');
            const folder = realmFolder(Number(realm.slice(1)));
            const text = await Bun.file(`${areaDir(track)}/${folder}/${chapter}/${file}`).text();
            return text.replaceAll(`${member}/`, '<member>/');
          }),
        );
        for (const copy of copies.slice(1)) {
          expect(copy, `group "${group.id}": ${file} copies differ`).toBe(copies[0]);
        }
      }
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
  const schema = trackOutlineSchema(TRACKS[0]);

  test('a track with a missing chapter', async () => {
    const outline = schema.parse(await readOutline(TRACKS[0]));
    // A realm at the minimum: dropping one leaves it short (r0 grew past 6).
    outline.realms.find((r) => r.chapters.length === MIN_CHAPTERS)!.chapters.pop();
    expect(schema.safeParse(outline).success).toBe(false);
  });

  test.each([MIN_CHAPTERS - 1, MAX_CHAPTERS + 1])('a realm with %i chapters', async (n) => {
    const outline = schema.parse(await readOutline(TRACKS[0]));
    outline.realms[0].chapters = Array.from({ length: n }, (_, i) => ({
      id: segment('chapter', i + 1),
      title: `Chapter ${i + 1}`,
    }));
    expect(schema.safeParse(outline).success).toBe(false);
  });

  test('a realm with 9 chapters passes (6 to 12 allowed)', async () => {
    const outline = schema.parse(await readOutline(TRACKS[0]));
    outline.realms[1].chapters = Array.from({ length: 9 }, (_, i) => ({
      id: segment('chapter', i + 1),
      title: `Chapter ${i + 1}`,
    }));
    expect(schema.safeParse(outline).success).toBe(true);
  });

  test('chapters out of order', async () => {
    const outline = schema.parse(await readOutline(TRACKS[0]));
    outline.realms[0].chapters.reverse();
    expect(schema.safeParse(outline).success).toBe(false);
  });

  test('a realm twice', async () => {
    const outline = schema.parse(await readOutline(TRACKS[0]));
    outline.realms.push(outline.realms[0]);
    expect(schema.safeParse(outline).success).toBe(false);
  });

  test('an unknown field', async () => {
    const outline = schema.parse(await readOutline(TRACKS[0]));
    expect(schema.safeParse({ ...outline, tier: 'advanced' }).success).toBe(false);
  });
});

describe('realm list rule (fixture table: r9 creator, r10 builder)', () => {
  const T = SPECIALIST_REALMS;
  const creator = trackOutlineSchema('creator', T);
  const ok = (ids: number[], track: 'creator' | 'builder' = 'creator') =>
    trackOutlineSchema(track, T).safeParse(fixtureOutline(ids)).success;

  test('core realms in order plus every owned specialist realm, anywhere, pass', () => {
    expect(ok(CREATOR_ORDER)).toBe(true);
    expect(ok([...CORE_IDS, 9])).toBe(true);
    expect(ok([9, ...CORE_IDS])).toBe(true);
    expect(ok([0, 10, 1, 2, 3, 4, 5, 6, 7, 8], 'builder')).toBe(true);
    // strategist owns no fixture realm: the core realms alone pass.
    expect(trackOutlineSchema('strategist', T).safeParse(fixtureOutline(CORE_IDS)).success).toBe(
      true,
    );
  });

  test('an owner outline that leaves out one of its specialist realms fails', () => {
    expect(ok(CORE_IDS)).toBe(false);
    expect(ok(CORE_IDS, 'builder')).toBe(false);
    expect(outlineRealmIssues(CORE_IDS, 'creator', T)).toEqual([
      'realm r9 is owned by creator but missing from its outline',
    ]);
  });

  test('a missing core realm fails', () => {
    expect(ok(CORE_IDS.filter((id) => id !== 4))).toBe(false);
    expect(ok([9])).toBe(false);
  });

  test('core realms out of order fail', () => {
    expect(ok([1, 0, 2, 3, 4, 5, 6, 7, 8])).toBe(false);
  });

  test('a specialist realm in another track’s outline fails (owner check)', () => {
    expect(ok([...CORE_IDS, 9], 'builder')).toBe(false);
    expect(ok([...CORE_IDS, 10])).toBe(false);
    expect(
      trackOutlineSchema('strategist', T).safeParse(fixtureOutline(CREATOR_ORDER)).success,
    ).toBe(false);
    expect(outlineRealmIssues([...CORE_IDS, 10, 9], 'builder', T)).toEqual([
      'realm r9 belongs to the creator path, not builder',
    ]);
  });

  test('a duplicate or unknown realm fails', () => {
    expect(ok([...CREATOR_ORDER, 9])).toBe(false);
    expect(ok([...CREATOR_ORDER, 11])).toBe(false);
    expect(outlineRealmIssues([...CREATOR_ORDER, 11], 'creator', T)).toEqual([
      'realm r11 has no REALMS row',
    ]);
  });

  test('a specialist realm with 9 chapters passes; 5 or 13 fail', () => {
    const outline = (n: number) => ({
      realms: [...CORE_IDS.map((id) => realmOutline(id)), realmOutline(9, n)],
    });
    expect(creator.safeParse(outline(9)).success).toBe(true);
    expect(creator.safeParse(outline(MIN_CHAPTERS - 1)).success).toBe(false);
    expect(creator.safeParse(outline(MAX_CHAPTERS + 1)).success).toBe(false);
  });

  test('with the real REALMS, each specialist realm is on its owner path only', () => {
    const specialists = REALMS.filter((r) => r.track !== null);
    expect(specialists.length).toBeGreaterThan(0);
    for (const track of TRACKS) {
      const schema = trackOutlineSchema(track);
      const owned = specialists.filter((r) => r.track === track).map((r) => r.id);
      expect(schema.safeParse(fixtureOutline([...CORE_IDS, ...owned])).success).toBe(true);
      for (const other of specialists.filter((r) => r.track !== track)) {
        expect(schema.safeParse(fixtureOutline([...CORE_IDS, ...owned, other.id])).success).toBe(
          false,
        );
      }
    }
  });
});
