/**
 * Content file schemas (content/CLAUDE.md). The full shapes hold hidden tests,
 * the reference solution, correct options and explanations: they stay on the
 * server (lib/content/load.ts). Client components only get the branded
 * `Public*` shapes, built by lib/content/public.ts.
 */
import { z } from 'zod';
import {
  CHALLENGE_LANGUAGES,
  LESSON_SOURCE_KINDS,
  QUESTION_OPTIONS,
  QUICK_CHECK_QUESTIONS,
  SOURCE_HASH_PATTERN,
} from '@/lib/constants';
import { ExerciseIdSchema } from './exercise';

const Text = z.string().trim().min(1);

/** An exercise id whose last segment is this step (`…/c1/lesson`). */
const idForStep = (step: string) =>
  ExerciseIdSchema.refine((id) => id.endsWith(`/${step}`), {
    message: `id must end in /${step}`,
  });

// ── Lesson ────────────────────────────────────────────────────────────────

const LessonSourceSchema = z
  .object({
    kind: z.enum(LESSON_SOURCE_KINDS),
    title: Text,
    url: z.url({ protocol: /^https$/ }),
  })
  .strict();

/** Frontmatter of a lesson MDX file. No `xp`: amounts live in lib/constants. */
export const LessonFrontmatterSchema = z
  .object({
    id: idForStep('lesson'),
    title: Text,
    minutes: z.number().int().positive(),
    sources: z.array(LessonSourceSchema).min(1, 'a lesson cites at least one source'),
    // Required once scripts/sync-sources.ts writes it (step 8).
    sourceHash: z
      .string()
      .regex(SOURCE_HASH_PATTERN, 'sourceHash must be a hex SHA-256')
      .optional(),
  })
  .strict();
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;

/** A loaded lesson: validated frontmatter + the raw MDX body. */
export type Lesson = { frontmatter: LessonFrontmatter; body: string };

// ── Builder challenge ─────────────────────────────────────────────────────

const ChallengeTestSchema = z.object({ name: Text, code: Text }).strict();

/** challenge.json. `solution` and `hiddenTests` never reach the browser. */
export const ChallengeSchema = z
  .object({
    id: idForStep('challenge'),
    title: Text,
    prompt: Text,
    language: z.enum(CHALLENGE_LANGUAGES),
    starter: Text,
    solution: Text,
    visibleTests: z.array(ChallengeTestSchema).min(1),
    hiddenTests: z.array(ChallengeTestSchema).min(1),
  })
  .strict()
  .refine(
    (c) => {
      const names = [...c.visibleTests, ...c.hiddenTests].map((t) => t.name);
      return new Set(names).size === names.length;
    },
    { message: 'test names must be unique', path: ['hiddenTests'] },
  );
export type Challenge = z.infer<typeof ChallengeSchema>;

// ── Case + quick check ────────────────────────────────────────────────────

/** `correct` defaults to false, so authors mark only the right one. */
const OptionSchema = z
  .object({ text: Text, explanation: Text, correct: z.boolean().default(false) })
  .strict();

const QuestionSchema = z
  .object({
    prompt: Text,
    options: z.array(OptionSchema).min(QUESTION_OPTIONS.min).max(QUESTION_OPTIONS.max),
  })
  .strict()
  .refine((q) => q.options.filter((o) => o.correct).length === 1, {
    message: 'exactly one option must be correct',
    path: ['options'],
  });

/** case.json: the strategist's challenge step. */
export const CaseSchema = z
  .object({
    id: idForStep('challenge'),
    title: Text,
    scenario: Text,
    questions: z.array(QuestionSchema).min(1),
  })
  .strict();
export type Case = z.infer<typeof CaseSchema>;

/** quick-check.json: the case question shape, a fixed number of questions. */
export const QuickCheckSchema = z
  .object({
    id: idForStep('quick-check'),
    questions: z.array(QuestionSchema).length(QUICK_CHECK_QUESTIONS),
  })
  .strict();
export type QuickCheck = z.infer<typeof QuickCheckSchema>;

// ── Public views (safe for client components) ─────────────────────────────
// Plain z.object strips unknown keys, so parsing a full object through these
// keeps only the listed fields. The brand stops a full object from type-checking
// where a public one is expected: only lib/content/public.ts makes them.

const PublicQuestionSchema = z.object({
  prompt: z.string(),
  options: z.array(z.object({ text: z.string() })),
});

export const PublicChallengeSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    prompt: z.string(),
    language: z.enum(CHALLENGE_LANGUAGES),
    starter: z.string(),
    visibleTests: z.array(z.object({ name: z.string(), code: z.string() })),
  })
  .brand<'PublicChallenge'>();
export type PublicChallenge = z.output<typeof PublicChallengeSchema>;

export const PublicCaseSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    scenario: z.string(),
    questions: z.array(PublicQuestionSchema),
  })
  .brand<'PublicCase'>();
export type PublicCase = z.output<typeof PublicCaseSchema>;

export const PublicQuickCheckSchema = z
  .object({ id: z.string(), questions: z.array(PublicQuestionSchema) })
  .brand<'PublicQuickCheck'>();
export type PublicQuickCheck = z.output<typeof PublicQuickCheckSchema>;
