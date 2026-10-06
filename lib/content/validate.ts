import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  BLOG_AREA,
  BOSS_SEGMENT,
  CASE_FILE,
  CHAPTER_COUNT,
  CONTENT_DIR,
  CONTENT_NOTES_FILE,
  FRONTIER_AREA,
  KB_SOURCES_NAME,
  LESSON_FILE,
  MATH_AREA,
  MATH_FLOORS,
  OUTLINE_FILE,
  QUICK_CHECK_FILE,
  SIDE_STEPS,
  TRACKS,
} from '@/lib/constants';
import { MathOutlineSchema, TrackOutlineSchema } from '@/lib/types';
import { buildExerciseId, parseBlogFileName, parseExerciseId, trackExerciseIds } from './ids';
import {
  ContentError,
  contentPath,
  hasContent,
  loadBlogFile,
  loadCase,
  loadKbSources,
  loadLesson,
  loadQuickCheck,
} from './load';
import { compileLesson, NO_COMPONENTS } from './mdx';
import { exerciseFile } from './paths';
import { isUnderBase } from './source-urls';

/**
 * The deterministic content check (`bun run content:check`, the content-check
 * hook, CI). Walks every file under the content root and validates it with the
 * same loaders and schemas the app uses, and compiles every lesson body with
 * the page's own MDX rules. It checks shape, not truth: facts are
 * the content-reviewer agent's job (.claude/skills/validate-content).
 */

/** One problem. `file` is relative to the content root. */
export type ContentIssue = { file: string; message: string };

const UNEXPECTED =
  `unexpected file. Allowed: ${LESSON_FILE}, ${CASE_FILE} or ${QUICK_CHECK_FILE} inside ` +
  `<track>/<NN-realm>/c1–c${CHAPTER_COUNT} or ${BOSS_SEGMENT}, ${MATH_AREA}/f1–f${MATH_FLOORS.length}, ` +
  `${FRONTIER_AREA}/<date>-<slug>, or ${BLOG_AREA}/<date>-<slug>.mdx. Move or rename it.`;

/** Every exercise file the id grammar allows, keyed by path → id. Frontier folders come from disk. */
function knownExerciseFiles(frontierFolders: string[]): Map<string, string> {
  const ids: string[] = TRACKS.flatMap(trackExerciseIds);
  for (const { n } of MATH_FLOORS) {
    for (const step of SIDE_STEPS) ids.push(buildExerciseId({ area: MATH_AREA, floor: n, step }));
  }
  for (const folder of frontierFolders) {
    for (const step of SIDE_STEPS) {
      const id = `${FRONTIER_AREA}/${folder}/${step}`;
      if (parseExerciseId(id)) ids.push(id);
    }
  }
  return new Map(ids.map((id) => [exerciseFile(parseExerciseId(id)!), id]));
}

/** The post's file name when `rel` is a well-named blog post (blog/<YYYY-MM-DD>-<slug>.mdx). */
const blogPostName = (rel: string): string | null => {
  const [area, name, ...rest] = rel.split('/');
  return area === BLOG_AREA && rest.length === 0 && name && parseBlogFileName(name) ? name : null;
};

/** All files under root, relative, `/`-separated. Dotfiles (.DS_Store) are skipped. */
async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => path.relative(root, path.join(e.parentPath, e.name)).split(path.sep).join('/'))
    .sort();
}

/** Keeps only the detail of a ContentError ("<path>: <detail>"); rethrows anything else. */
function detail(err: unknown): string {
  if (!(err instanceof ContentError)) throw err;
  return err.message.slice(err.file.length + 2);
}

/** Validates a JSON outline; pushes an issue on failure. */
async function checkOutline(abs: string, rel: string, schema: z.ZodType, issues: ContentIssue[]) {
  try {
    const result = schema.safeParse(JSON.parse(await readFile(path.join(abs, rel), 'utf8')));
    if (!result.success) issues.push({ file: rel, message: z.prettifyError(result.error) });
  } catch (err) {
    issues.push({ file: rel, message: `cannot parse (${(err as Error).message})` });
  }
}

/** Official base URLs from sources.yaml, or null (with an issue) when the registry is bad. */
async function officialBases(root: string, issues: ContentIssue[]): Promise<string[] | null> {
  try {
    const sources = await loadKbSources(root);
    return sources.filter((s) => s.trustTier === 'official').map((s) => s.url);
  } catch (err) {
    const missing = err instanceof ContentError && err.code === 'missing';
    issues.push({
      file: KB_SOURCES_NAME,
      message: missing ? 'registry file is missing' : detail(err),
    });
    return null;
  }
}

/**
 * A blog post: frontmatter schema, a body with no components (no NPC
 * DialogBox), a linked lesson that exists, and a slug no other post uses.
 */
async function checkBlogPost(
  abs: string,
  rel: string,
  name: string,
  slugs: Map<string, string>,
  issues: ContentIssue[],
) {
  const { slug } = parseBlogFileName(name)!;
  const first = slugs.get(slug);
  if (first) {
    issues.push({
      file: rel,
      message: `slug "${slug}" is already used by ${first}. Each post needs its own slug (/blog/<slug>).`,
    });
  } else slugs.set(slug, rel);
  try {
    const { frontmatter, body } = await loadBlogFile(name, abs);
    try {
      await compileLesson(body, { allowedComponents: NO_COMPONENTS });
    } catch (err) {
      issues.push({ file: rel, message: `MDX body: ${(err as Error).message}` });
    }
    if (!(await hasContent(frontmatter.lesson, abs))) {
      issues.push({
        file: rel,
        message: `lesson ${frontmatter.lesson} has no lesson file. A post links to a live lesson.`,
      });
    }
  } catch (err) {
    issues.push({ file: rel, message: detail(err) });
  }
}

export async function validateContent(root: string = CONTENT_DIR): Promise<ContentIssue[]> {
  const abs = contentPath(root, '.');
  const issues: ContentIssue[] = [];
  const files = await listFiles(abs);
  const official = await officialBases(abs, issues);

  const frontier = files
    .filter((f) => f.startsWith(`${FRONTIER_AREA}/`))
    .map((f) => f.split('/')[1]);
  const exercises = knownExerciseFiles([...new Set(frontier)]);

  /** slug → the first file that used it: two posts may not share a URL. */
  const blogSlugs = new Map<string, string>();

  for (const area of [...TRACKS, MATH_AREA]) {
    const rel = `${area}/${OUTLINE_FILE}`;
    if (!files.includes(rel)) {
      issues.push({ file: rel, message: `outline file is missing: add content/${rel}` });
    }
  }

  for (const rel of files) {
    if (rel === KB_SOURCES_NAME || rel.endsWith(CONTENT_NOTES_FILE)) continue;
    const post = blogPostName(rel);
    if (post) {
      await checkBlogPost(abs, rel, post, blogSlugs, issues);
      continue;
    }
    if (rel === `${MATH_AREA}/${OUTLINE_FILE}`) {
      await checkOutline(abs, rel, MathOutlineSchema, issues);
      continue;
    }
    if ((TRACKS as readonly string[]).some((t) => rel === `${t}/${OUTLINE_FILE}`)) {
      await checkOutline(abs, rel, TrackOutlineSchema, issues);
      continue;
    }
    const id = exercises.get(rel);
    if (!id) {
      issues.push({ file: rel, message: UNEXPECTED });
      continue;
    }
    try {
      if (rel.endsWith(LESSON_FILE)) {
        const { frontmatter, body } = await loadLesson(id, abs);
        try {
          await compileLesson(body);
        } catch (err) {
          issues.push({ file: rel, message: `MDX body: ${(err as Error).message}` });
        }
        for (const { url } of frontmatter.sources) {
          if (official && !isUnderBase(url, official)) {
            issues.push({
              file: rel,
              message: `source ${url} is not under a trustTier: official entry of ${KB_SOURCES_NAME}. Cite an official page, or add the site to ${KB_SOURCES_NAME} as official.`,
            });
          }
        }
      } else if (rel.endsWith(CASE_FILE)) await loadCase(id, abs);
      else await loadQuickCheck(id, abs);
    } catch (err) {
      issues.push({ file: rel, message: detail(err) });
    }
  }
  return issues;
}
