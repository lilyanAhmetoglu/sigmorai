import { z } from 'zod';
import {
  MATH_FLOOR_COUNT,
  MAX_CHAPTERS,
  MIN_CHAPTERS,
  REALM_COUNT,
  type MATH_FLOORS,
  REALMS,
  type TIERS,
} from '@/lib/constants';
import { segment } from '@/lib/content/ids';
import type { HudState } from './hud';
import { KebabSlugSchema } from './kb';
import type { ChapterView, StepStatus, StepView } from './realms';

export type Tier = (typeof TIERS)[number];
export type Realm = (typeof REALMS)[number];
export type RealmId = Realm['id'];
export type MathFloor = (typeof MATH_FLOORS)[number];

const Text = z.string().trim().min(1);

/** A chapter's id is its folder name and the chapter segment of its exercise ids (`c1`). */
const ChapterOutlineSchema = z.object({ id: Text, title: Text }).strict();

/** A realm number from outside (route param, parsed id) → a known RealmId. */
export const RealmIdSchema = z.literal(REALMS.map((r) => r.id));

/** A realm slug from outside (the `/realms/[realm]` route param) → a known slug. */
export const RealmSlugSchema = z.literal(REALMS.map((r) => r.slug));

const RealmOutlineSchema = z
  .object({
    id: RealmIdSchema,
    topic: Text,
    lore: Text,
    chapters: z
      .array(ChapterOutlineSchema)
      .min(MIN_CHAPTERS)
      .max(MAX_CHAPTERS)
      .refine((cs) => cs.every((c, i) => c.id === segment('chapter', i + 1)), {
        message: 'chapter ids must run c1, c2, … in order',
      }),
    // The boss name is derived ("Boss · <Realm>"); only the task is authored.
    boss: z.object({ task: Text.optional() }).strict(),
  })
  .strict();

/** content/<track>/outline.json. Realm i has id i. */
export const TrackOutlineSchema = z
  .object({
    realms: z
      .array(RealmOutlineSchema)
      .length(REALM_COUNT)
      .refine((rs) => rs.every((r, i) => r.id === i), {
        message: 'realm ids must run 0, 1, … in order',
      }),
  })
  .strict();
export type TrackOutline = z.infer<typeof TrackOutlineSchema>;

/** A formula and its plain-words version for screen readers. */
const FormulaSchema = z.object({ math: Text, text: Text }).strict();

const FloorOutlineSchema = z
  .object({ n: z.number().int(), covers: Text, formulas: z.array(FormulaSchema).min(1) })
  .strict();

/** content/math/outline.json. Floor i has n = i + 1; the name is in MATH_FLOORS. */
export const MathOutlineSchema = z
  .object({
    floors: z
      .array(FloorOutlineSchema)
      .length(MATH_FLOOR_COUNT)
      .refine((fs) => fs.every((f, i) => f.n === i + 1), {
        message: 'floor numbers must run 1, 2, … in order',
      }),
  })
  .strict();
export type MathOutline = z.infer<typeof MathOutlineSchema>;

/**
 * A member of a shared-chapters group: a realm chapter without its step
 * (`builder/r1/c1`). `content:check` checks that it is a live realm chapter.
 */
const SharedMemberSchema = Text;

/** Same idea, same depth: a clear of any member credits every other member. */
const SameGroupSchema = z
  .object({
    id: KebabSlugSchema,
    kind: z.literal('same'),
    members: z.array(SharedMemberSchema).min(2),
  })
  .strict();

/** One member teaches all of the other and more: a clear of `deep` credits the light one, never back. */
const CoversGroupSchema = z
  .object({
    id: KebabSlugSchema,
    kind: z.literal('covers'),
    deep: SharedMemberSchema,
    members: z.array(SharedMemberSchema).length(2),
  })
  .strict()
  .refine((g) => g.members.includes(g.deep), {
    message: 'deep must be one of the two members',
    path: ['deep'],
  });

export const SharedChapterGroupSchema = z.discriminatedUnion('kind', [
  SameGroupSchema,
  CoversGroupSchema,
]);
export type SharedChapterGroup = z.infer<typeof SharedChapterGroupSchema>;

/** content/shared-chapters.json: concept groups whose chapters credit each other on read. */
export const SharedChaptersFileSchema = z
  .object({ groups: z.array(SharedChapterGroupSchema) })
  .strict();
export type SharedChaptersFile = z.infer<typeof SharedChaptersFileSchema>;

/** A Math Tower floor's state and steps (buildTowerMap). `chapter` is the floor number. */
export type FloorState = Omit<ChapterView, 'chapter'> & { chapter: number };

/** One floor card on /math: its state plus what it covers (content/math/outline.json). */
export type FloorView = FloorState & Pick<MathOutline['floors'][number], 'covers' | 'formulas'>;

/**
 * The dashboard's Math Tower panel and MATH FLOORS stat (towerSummary).
 * `open`: `next` is the first open floor and its playable step. `cleared`:
 * every live floor is done. `soon`: nothing is playable yet (the next floor
 * has no content). `cleared` / `live` count floors with content.
 */
export type TowerSummary = {
  state: 'open' | 'cleared' | 'soon';
  next: { floor: number; title: string; step: StepView } | null;
  cleared: number;
  live: number;
};

/** The /math page's read (lib/data/math.ts). A visitor has no progress. */
export type MathPage = { viewer: HudState['status']; floors: FloorView[] };

// ── The Frontier (side realm; curriculum plan, amendment 2026-10-07 SIG-29) ──

/**
 * One Frontier chapter on disk: `content/frontier/<YYYY-MM-DD>-<slug>/`
 * (listFrontierChapters). Title and minutes come from its lesson frontmatter.
 */
export type FrontierChapter = {
  /** The folder name: `2026-10-05-some-slug`. */
  folder: string;
  /** `YYYY-MM-DD`, a real calendar date. */
  date: string;
  slug: string;
  title: string;
  minutes: number;
  lessonId: string;
  quickCheckId: string;
};

/**
 * A Frontier chapter's state and steps (buildFrontierList): lesson, then
 * quick check; the quick check clears the chapter. Every chapter is open.
 */
export type FrontierChapterView = FrontierChapter & { status: StepStatus; steps: StepView[] };

/**
 * The dashboard's FRONTIER panel (frontierSummary). `open`: `next` is the
 * newest chapter not cleared yet, with its playable step. `cleared`: every
 * chapter is done. `empty`: no chapter yet.
 */
export type FrontierSummary = {
  state: 'open' | 'cleared' | 'empty';
  next: { title: string; date: string; step: StepView } | null;
};

/** The /frontier page's read (lib/data/frontier.ts), newest first. A visitor has no progress. */
export type FrontierPage = { viewer: HudState['status']; chapters: FrontierChapterView[] };
