/**
 * Content file names and limits (content/CLAUDE.md). Loaded and validated by
 * lib/content/load.ts; schemas in lib/types/content.ts.
 */
import type { Accent } from '@/lib/types';
import type { KB_SOURCE_KINDS } from './kb';

/** One file per step inside an exercise folder. */
export const LESSON_FILE = 'lesson.mdx';
/** The graded `challenge` step (chapter and boss) on every track is a case. */
export const CASE_FILE = 'case.json';
export const QUICK_CHECK_FILE = 'quick-check.json';

/**
 * What a lesson may cite (a subset of the knowledge-base kinds). `blog` means
 * an official vendor engineering post only (e.g. anthropic.com/engineering,
 * openai.com/index), never a personal or third-party blog.
 */
export const LESSON_SOURCE_KINDS = [
  'docs',
  'repo',
  'blog',
] as const satisfies readonly (typeof KB_SOURCE_KINDS)[number][];

/** The SOURCES tab's chip colour per kind. The chip also shows the kind as text. */
export const LESSON_SOURCE_ACCENT = {
  docs: 'success',
  repo: 'info',
  blog: 'accent',
} as const satisfies Record<(typeof LESSON_SOURCE_KINDS)[number], Accent>;

/** A quick check has exactly this many questions (curriculum-design-plan.md). */
export const QUICK_CHECK_QUESTIONS = 3;

/** Options per quick-check question. */
export const QUESTION_OPTIONS = { min: 2, max: 6 } as const;

/** A case has 3–5 questions (quest-actions spec, amended 2026-10-05). */
export const CASE_QUESTIONS = { min: 3, max: 5 } as const;
/** Each case question has exactly 4 options, one correct (exam style). */
export const CASE_OPTIONS = { min: 4, max: 4 } as const;

/**
 * Dated blog posts: content/blog/<YYYY-MM-DD>-<slug>.mdx. Frontmatter is
 * BlogFrontmatterSchema (lib/types/content.ts); loaded by lib/content/load.ts
 * and checked by `content:check` like a lesson.
 */
export const BLOG_AREA = 'blog';
/** A blog post's file extension. */
export const BLOG_POST_EXT = '.mdx';
/** Authoring notes inside content/; not content, skipped by the validator. */
export const CONTENT_NOTES_FILE = 'CLAUDE.md';

/**
 * Length giveaway guard (`bun run content:check`): the right option fails when
 * it is the single longest AND longer than the runner-up by more than this
 * share AND by at least this many characters.
 */
export const ANSWER_LENGTH_MAX_RATIO = 0.15;
export const ANSWER_LENGTH_MIN_GAP = 8;
