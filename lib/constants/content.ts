/**
 * Content file names and limits (content/CLAUDE.md). Loaded and validated by
 * lib/content/load.ts; schemas in lib/types/content.ts.
 */
import type { KB_SOURCE_KINDS } from './kb';

/** One file per step inside an exercise folder. */
export const LESSON_FILE = 'lesson.mdx';
/** The graded `challenge` step (chapter and boss) on both tracks is a case. */
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

/** A quick check has exactly this many questions (curriculum-design-plan.md). */
export const QUICK_CHECK_QUESTIONS = 3;

/** Options per case / quick-check question. */
export const QUESTION_OPTIONS = { min: 2, max: 6 } as const;

/** `sourceHash` in lesson frontmatter: a lowercase hex SHA-256 of the cited pages. */
export const SOURCE_HASH_PATTERN = /^[a-f0-9]{64}$/;
