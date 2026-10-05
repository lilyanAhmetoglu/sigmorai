/**
 * Content file names and limits (content/CLAUDE.md). Loaded and validated by
 * lib/content/load.ts; schemas in lib/types/content.ts.
 */
import type { KB_SOURCE_KINDS } from './kb';

/** One file per step inside an exercise folder. */
export const LESSON_FILE = 'lesson.mdx';
/** A builder challenge (code + tests). Strategist challenges use CASE_FILE. */
export const CHALLENGE_FILE = 'challenge.json';
export const CASE_FILE = 'case.json';
export const QUICK_CHECK_FILE = 'quick-check.json';

/** What a lesson may cite (a subset of the knowledge-base kinds). */
export const LESSON_SOURCE_KINDS = [
  'docs',
  'repo',
] as const satisfies readonly (typeof KB_SOURCE_KINDS)[number][];

/** Languages the sandbox runner grades. The design's quest editor is Python. */
export const CHALLENGE_LANGUAGES = ['python'] as const;

/** A quick check has exactly this many questions (curriculum-design-plan.md). */
export const QUICK_CHECK_QUESTIONS = 3;

/** Options per case / quick-check question. */
export const QUESTION_OPTIONS = { min: 2, max: 6 } as const;

/** `sourceHash` in lesson frontmatter: a lowercase hex SHA-256 of the cited pages. */
export const SOURCE_HASH_PATTERN = /^[a-f0-9]{64}$/;
