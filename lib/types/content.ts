/**
 * Content file schemas (content/CLAUDE.md). The full shapes hold correct
 * options and explanations: they stay on the server (lib/content/load.ts). Client components only get the branded
 * `Public*` shapes, built by lib/content/public.ts.
 */
import { z } from 'zod';
import {
  CASE_OPTIONS,
  CASE_QUESTIONS,
  LESSON_SOURCE_KINDS,
  QUESTION_OPTIONS,
  QUICK_CHECK_QUESTIONS,
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
  })
  .strict();
export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>;

/** A loaded lesson: validated frontmatter + the raw MDX body. */
export type Lesson = { frontmatter: LessonFrontmatter; body: string };

// ── Blog post ─────────────────────────────────────────────────────────────

/**
 * Frontmatter of content/blog/<YYYY-MM-DD>-<slug>.mdx. The date and slug come
 * from the file name. `lesson` is the post's level: its sources are the
 * post's sources, and the page links to it.
 */
export const BlogFrontmatterSchema = z
  .object({
    title: Text,
    description: Text,
    lesson: idForStep('lesson'),
  })
  .strict();
export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;

/** A loaded post: validated frontmatter, the raw MDX body, and the file name's date + slug. */
export type BlogPost = {
  frontmatter: BlogFrontmatter;
  body: string;
  /** `YYYY-MM-DD`, a real calendar date. */
  date: string;
  /** The URL segment: `/blog/<slug>`. */
  slug: string;
};

// ── Case + quick check ────────────────────────────────────────────────────

/** `correct` defaults to false, so authors mark only the right one. */
const OptionSchema = z
  .object({ text: Text, explanation: Text, correct: z.boolean().default(false) })
  .strict();

/** A question with `options.min`–`options.max` options, exactly one correct. */
const questionSchema = (options: { min: number; max: number }) =>
  z
    .object({
      prompt: Text,
      options: z.array(OptionSchema).min(options.min).max(options.max),
    })
    .strict()
    .refine((q) => q.options.filter((o) => o.correct).length === 1, {
      message: 'exactly one option must be correct',
      path: ['options'],
    });

/**
 * case.json: the graded `challenge` step (chapter and boss) on every track.
 * 3–5 questions of exactly 4 options. `exhibit` is shown read-only in
 * monospace: a trace, a tool schema, a prompt, a config.
 */
export const CaseSchema = z
  .object({
    id: idForStep('challenge'),
    title: Text,
    scenario: Text,
    // Not trimmed: leading spaces in a trace or config are meaningful.
    exhibit: z
      .string()
      .refine((v) => v.trim().length > 0, 'exhibit must not be blank')
      .optional(),
    questions: z
      .array(questionSchema(CASE_OPTIONS))
      .min(CASE_QUESTIONS.min)
      .max(CASE_QUESTIONS.max),
  })
  .strict();
export type Case = z.infer<typeof CaseSchema>;

/** quick-check.json: the case question shape (2–6 options), a fixed number of questions. */
export const QuickCheckSchema = z
  .object({
    id: idForStep('quick-check'),
    questions: z.array(questionSchema(QUESTION_OPTIONS)).length(QUICK_CHECK_QUESTIONS),
  })
  .strict();
export type QuickCheck = z.infer<typeof QuickCheckSchema>;

/** One full question (correct flags + explanations): server-only. */
export type Question = Case['questions'][number];

// ── Public views (safe for client components) ─────────────────────────────
// Plain z.object strips unknown keys, so parsing a full object through these
// keeps only the listed fields. The brand stops a full object from type-checking
// where a public one is expected: only lib/content/public.ts makes them.

const PublicQuestionSchema = z.object({
  prompt: z.string(),
  options: z.array(z.object({ text: z.string() })),
});

export const PublicCaseSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    scenario: z.string(),
    exhibit: z.string().optional(),
    questions: z.array(PublicQuestionSchema),
  })
  .brand<'PublicCase'>();
export type PublicCase = z.output<typeof PublicCaseSchema>;

export const PublicQuickCheckSchema = z
  .object({ id: z.string(), questions: z.array(PublicQuestionSchema) })
  .brand<'PublicQuickCheck'>();
export type PublicQuickCheck = z.output<typeof PublicQuickCheckSchema>;
