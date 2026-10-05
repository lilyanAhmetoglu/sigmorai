import { z } from 'zod';
import {
  CHAPTER_COUNT,
  MATH_FLOOR_COUNT,
  REALM_COUNT,
  type MATH_FLOORS,
  REALMS,
  type TIERS,
} from '@/lib/constants';
import { segment } from '@/lib/content/ids';

export type Tier = (typeof TIERS)[number];
export type Realm = (typeof REALMS)[number];
export type RealmId = Realm['id'];
export type MathFloor = (typeof MATH_FLOORS)[number];

const Text = z.string().trim().min(1);

/** A chapter's id is its folder name and the chapter segment of its exercise ids (`c1`). */
const ChapterOutlineSchema = z.object({ id: Text, title: Text }).strict();

const RealmOutlineSchema = z
  .object({
    id: z.literal(REALMS.map((r) => r.id)),
    topic: Text,
    lore: Text,
    chapters: z
      .array(ChapterOutlineSchema)
      .length(CHAPTER_COUNT)
      .refine((cs) => cs.every((c, i) => c.id === segment('chapter', i + 1)), {
        message: 'chapter ids must run c1, c2, … in order',
      }),
    // The boss name is derived ("Boss · <Realm>"); only the task is authored.
    boss: z.object({ task: Text.optional() }).strict(),
  })
  .strict();

/** content/builder/outline.json and content/strategist/outline.json. Realm i has id i. */
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
