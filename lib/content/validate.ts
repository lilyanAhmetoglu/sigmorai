import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  BLOG_AREA,
  BOSS_SEGMENT,
  CASE_FILE,
  CHAPTER_COUNT,
  CHAPTER_STEPS,
  CONTENT_DIR,
  CONTENT_NOTES_FILE,
  FRONTIER_AREA,
  KB_SOURCES_NAME,
  LESSON_FILE,
  MATH_AREA,
  MATH_FLOORS,
  OUTLINE_FILE,
  QUICK_CHECK_FILE,
  REALMS,
  SIDE_STEPS,
  TRACKS,
} from '@/lib/constants';
import { MathOutlineSchema, TrackOutlineSchema } from '@/lib/types';
import { buildExerciseId, parseExerciseId } from './ids';
import {
  ContentError,
  contentPath,
  loadCase,
  loadKbSources,
  loadLesson,
  loadQuickCheck,
} from './load';
import { exerciseFile } from './paths';
import { isUnderBase } from './source-urls';

/**
 * The deterministic content check (`bun run content:check`, the content-check
 * hook, CI). Walks every file under the content root and validates it with the
 * same loaders and schemas the app uses. It checks shape, not truth: facts are
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
  const ids: string[] = [];
  for (const track of TRACKS) {
    for (const { id: realm } of REALMS) {
      for (let chapter = 1; chapter <= CHAPTER_COUNT; chapter++) {
        for (const step of CHAPTER_STEPS) {
          ids.push(buildExerciseId({ area: 'chapter', track, realm, chapter, step }));
        }
      }
      ids.push(buildExerciseId({ area: 'boss', track, realm }));
    }
  }
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

/** A blog post is named like a Frontier folder: <YYYY-MM-DD>-<slug>.mdx. */
const isBlogPost = (rel: string) => {
  const [area, name, ...rest] = rel.split('/');
  if (area !== BLOG_AREA || rest.length > 0 || !name?.endsWith('.mdx')) return false;
  // Reuse the Frontier id grammar for the date + slug rule (calendar-checked).
  return parseExerciseId(`${FRONTIER_AREA}/${name.slice(0, -'.mdx'.length)}/lesson`) !== null;
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

export async function validateContent(root: string = CONTENT_DIR): Promise<ContentIssue[]> {
  const abs = contentPath(root, '.');
  const issues: ContentIssue[] = [];
  const files = await listFiles(abs);
  const official = await officialBases(abs, issues);

  const frontier = files
    .filter((f) => f.startsWith(`${FRONTIER_AREA}/`))
    .map((f) => f.split('/')[1]);
  const exercises = knownExerciseFiles([...new Set(frontier)]);

  for (const area of [...TRACKS, MATH_AREA]) {
    const rel = `${area}/${OUTLINE_FILE}`;
    if (!files.includes(rel)) {
      issues.push({ file: rel, message: `outline file is missing: add content/${rel}` });
    }
  }

  for (const rel of files) {
    if (rel === KB_SOURCES_NAME || rel.endsWith(CONTENT_NOTES_FILE) || isBlogPost(rel)) continue;
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
        const { frontmatter } = await loadLesson(id, abs);
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
