import 'server-only';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { CASE_FILE, CONTENT_DIR, LESSON_FILE, QUICK_CHECK_FILE } from '@/lib/constants';
import {
  CaseSchema,
  LessonFrontmatterSchema,
  QuickCheckSchema,
  type Case,
  type Lesson,
  type QuickCheck,
} from '@/lib/types';
import { parseExerciseId } from './ids';
import { exerciseFile } from './paths';

/**
 * Server-only content loaders. They return the FULL objects (correct options,
 * explanations). Hand a client component only the
 * result of lib/content/public.ts.
 *
 * `root` defaults to content/ under the project; tests pass a fixtures folder.
 */

/** `missing`: no file (the chapter is not live; a page can 404). `invalid`: bad data. */
export type ContentErrorCode = 'missing' | 'invalid';

/** Every message starts with the file path, so a bad file is easy to find. */
export class ContentError extends Error {
  constructor(
    readonly code: ContentErrorCode,
    readonly file: string,
    detail: string,
  ) {
    super(`${file}: ${detail}`);
    this.name = 'ContentError';
  }
}

/** `---\n<yaml>\n---\n<body>` at the very start of an MDX file. */
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

type Located = { abs: string; file: string };

/**
 * Absolute path of a file under the content root.
 * The `turbopackIgnore` comment silences the `next build` warning "Dynamic
 * filesystem access causes tracing of the whole project" (Turbopack suggests
 * this exact comment for path.resolve in that warning; without it, every
 * server route would ship the whole repo). content/** is still shipped with
 * every server route by outputFileTracingIncludes in next.config.ts.
 */
const contentPath = (root: string, rel: string) =>
  path.resolve(/*turbopackIgnore: true*/ process.cwd(), root, rel);

/** Resolves an id to its file and checks it is the kind of file this loader reads. */
function locate(id: string, expected: string, root: string): Located {
  const ref = parseExerciseId(id);
  if (!ref) throw new ContentError('invalid', id, 'not a valid exercise id');
  const rel = exerciseFile(ref);
  const abs = contentPath(root, rel);
  const file = path.relative(process.cwd(), abs);
  if (path.basename(rel) !== expected) {
    throw new ContentError(
      'invalid',
      file,
      `${id} is read from ${path.basename(rel)}, not ${expected}`,
    );
  }
  return { abs, file };
}

async function readText({ abs, file }: Located): Promise<string> {
  try {
    return await readFile(abs, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new ContentError('missing', file, 'file not found');
    }
    throw err;
  }
}

/** Parses raw data with a schema, and checks the file's own id matches the path. */
function validate<S extends z.ZodType<{ id: string }>>(
  schema: S,
  raw: unknown,
  id: string,
  file: string,
): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) throw new ContentError('invalid', file, z.prettifyError(result.error));
  if (result.data.id !== id) {
    throw new ContentError('invalid', file, `id is "${result.data.id}", expected "${id}"`);
  }
  return result.data;
}

async function loadJson<S extends z.ZodType<{ id: string }>>(
  id: string,
  schema: S,
  expected: string,
  root: string,
): Promise<z.output<S>> {
  const at = locate(id, expected, root);
  const text = await readText(at);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new ContentError('invalid', at.file, `invalid JSON (${(err as Error).message})`);
  }
  return validate(schema, raw, id, at.file);
}

export async function loadLesson(id: string, root = CONTENT_DIR): Promise<Lesson> {
  const at = locate(id, LESSON_FILE, root);
  const text = await readText(at);
  const match = FRONTMATTER.exec(text);
  if (!match) throw new ContentError('invalid', at.file, 'missing --- frontmatter block');
  let raw: unknown;
  try {
    raw = parseYaml(match[1]);
  } catch (err) {
    throw new ContentError(
      'invalid',
      at.file,
      `invalid frontmatter YAML (${(err as Error).message})`,
    );
  }
  const frontmatter = validate(LessonFrontmatterSchema, raw, id, at.file);
  return { frontmatter, body: text.slice(match[0].length) };
}

/** Whether an exercise has a content file. A stub chapter (outline only) has none. */
export async function hasContent(id: string, root = CONTENT_DIR): Promise<boolean> {
  const ref = parseExerciseId(id);
  if (!ref) return false;
  try {
    await access(contentPath(root, exerciseFile(ref)));
    return true;
  } catch {
    return false;
  }
}

/** A graded case: the `challenge` step (chapter or boss) on either track. */
export const loadCase = (id: string, root = CONTENT_DIR): Promise<Case> =>
  loadJson(id, CaseSchema, CASE_FILE, root);

export const loadQuickCheck = (id: string, root = CONTENT_DIR): Promise<QuickCheck> =>
  loadJson(id, QuickCheckSchema, QUICK_CHECK_FILE, root);
