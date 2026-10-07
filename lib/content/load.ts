import 'server-only';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import {
  BLOG_AREA,
  CASE_FILE,
  CONTENT_DIR,
  MATH_AREA,
  KB_SOURCES_NAME,
  LESSON_FILE,
  OUTLINE_FILE,
  QUICK_CHECK_FILE,
  SHARED_CHAPTERS_FILE,
} from '@/lib/constants';
import {
  BlogFrontmatterSchema,
  CaseSchema,
  KbSourcesFileSchema,
  LessonFrontmatterSchema,
  MathOutlineSchema,
  QuickCheckSchema,
  SharedChaptersFileSchema,
  TrackOutlineSchema,
  type BlogPost,
  type Case,
  type KbSource,
  type Lesson,
  type MathOutline,
  type QuickCheck,
  type SharedChaptersFile,
  type Track,
  type TrackOutline,
} from '@/lib/types';
import { parseBlogFileName, parseExerciseId } from './ids';
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
export const contentPath = (root: string, rel: string) =>
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

/**
 * Splits an MDX file into its parsed frontmatter YAML (not yet validated) and
 * its body. One parser for lessons and blog posts.
 */
export function parseMdx(text: string, file: string): { raw: unknown; body: string } {
  const match = FRONTMATTER.exec(text);
  if (!match) throw new ContentError('invalid', file, 'missing --- frontmatter block');
  try {
    return { raw: parseYaml(match[1]), body: text.slice(match[0].length) };
  } catch (err) {
    throw new ContentError('invalid', file, `invalid frontmatter YAML (${(err as Error).message})`);
  }
}

export async function loadLesson(id: string, root = CONTENT_DIR): Promise<Lesson> {
  const at = locate(id, LESSON_FILE, root);
  const { raw, body } = parseMdx(await readText(at), at.file);
  const frontmatter = validate(LessonFrontmatterSchema, raw, id, at.file);
  return { frontmatter, body };
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

/** A graded case: the `challenge` step (chapter or boss) on any track. */
export const loadCase = (id: string, root = CONTENT_DIR): Promise<Case> =>
  loadJson(id, CaseSchema, CASE_FILE, root);

export const loadQuickCheck = (id: string, root = CONTENT_DIR): Promise<QuickCheck> =>
  loadJson(id, QuickCheckSchema, QUICK_CHECK_FILE, root);

/** content/sources.yaml, validated. The one loader for it (seed + content check). */
export async function loadKbSources(root = CONTENT_DIR): Promise<KbSource[]> {
  const abs = contentPath(root, KB_SOURCES_NAME);
  const at = { abs, file: path.relative(process.cwd(), abs) };
  const text = await readText(at);
  let raw: unknown;
  try {
    raw = parseYaml(text);
  } catch (err) {
    throw new ContentError('invalid', at.file, `invalid YAML (${(err as Error).message})`);
  }
  const result = KbSourcesFileSchema.safeParse(raw);
  if (!result.success) throw new ContentError('invalid', at.file, z.prettifyError(result.error));
  return result.data.sources;
}

/** A JSON file at `rel` under the content root, parsed with its schema. Throws ContentError. */
async function loadContentJson<S extends z.ZodType>(
  rel: string,
  schema: S,
  root: string,
): Promise<z.output<S>> {
  const abs = contentPath(root, rel);
  const at = { abs, file: path.relative(process.cwd(), abs) };
  const text = await readText(at);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new ContentError('invalid', at.file, `invalid JSON (${(err as Error).message})`);
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw new ContentError('invalid', at.file, z.prettifyError(result.error));
  return result.data;
}

/** Reads an outline.json under the content root and parses it with its schema. */
const loadOutline = <S extends z.ZodType>(folder: string, schema: S, root: string) =>
  loadContentJson(`${folder}/${OUTLINE_FILE}`, schema, root);

/** content/<track>/outline.json, validated: topic, lore and chapter titles per realm. */
export const loadTrackOutline = (track: Track, root = CONTENT_DIR): Promise<TrackOutline> =>
  loadOutline(track, TrackOutlineSchema, root);

/** content/math/outline.json, validated: what each floor covers and its formulas. */
export const loadMathOutline = (root = CONTENT_DIR): Promise<MathOutline> =>
  loadOutline(MATH_AREA, MathOutlineSchema, root);

/** content/shared-chapters.json, validated: chapter groups that credit each other across tracks. */
export const loadSharedChapters = (root = CONTENT_DIR): Promise<SharedChaptersFile> =>
  loadContentJson(SHARED_CHAPTERS_FILE, SharedChaptersFileSchema, root);

// ── Blog posts: content/blog/<YYYY-MM-DD>-<slug>.mdx ─────────────────────

/** File names in content/blog/ that follow the post grammar, newest first. */
async function blogFileNames(root: string): Promise<string[]> {
  let names: string[];
  try {
    names = await readdir(contentPath(root, BLOG_AREA));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  // `YYYY-MM-DD-` sorts by date as text. Same date: reverse slug order, stable.
  return names.filter((name) => parseBlogFileName(name) !== null).sort((a, b) => (a < b ? 1 : -1));
}

/**
 * One post by its file name (`2026-10-06-be-specific.mdx`). The validator uses
 * it per file; pages use loadBlogPost / listBlogPosts.
 */
export async function loadBlogFile(name: string, root = CONTENT_DIR): Promise<BlogPost> {
  const abs = contentPath(root, `${BLOG_AREA}/${name}`);
  const at = { abs, file: path.relative(process.cwd(), abs) };
  const parsed = parseBlogFileName(name);
  if (!parsed) {
    throw new ContentError('invalid', at.file, 'a post is named <YYYY-MM-DD>-<slug>.mdx');
  }
  const { raw, body } = parseMdx(await readText(at), at.file);
  const result = BlogFrontmatterSchema.safeParse(raw);
  if (!result.success) throw new ContentError('invalid', at.file, z.prettifyError(result.error));
  return { frontmatter: result.data, body, ...parsed };
}

/** The post at `/blog/<slug>`. `missing` when no file has that slug. */
export async function loadBlogPost(slug: string, root = CONTENT_DIR): Promise<BlogPost> {
  const name = (await blogFileNames(root)).find((n) => parseBlogFileName(n)?.slug === slug);
  if (!name) throw new ContentError('missing', `${BLOG_AREA}/${slug}`, 'no post has this slug');
  return loadBlogFile(name, root);
}

/** Every post, newest first. A bad post throws, so a broken file fails the build. */
export async function listBlogPosts(root = CONTENT_DIR): Promise<BlogPost[]> {
  const names = await blogFileNames(root);
  return Promise.all(names.map((name) => loadBlogFile(name, root)));
}
