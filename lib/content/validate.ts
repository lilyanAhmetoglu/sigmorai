import 'server-only';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  ANSWER_LENGTH_MAX_RATIO,
  ANSWER_LENGTH_MIN_GAP,
  BLOG_AREA,
  BOSS_SEGMENT,
  BOSS_STEP,
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
  SHARED_CHAPTERS_FILE,
  SIDE_STEPS,
  TRACKS,
} from '@/lib/constants';
import { MathOutlineSchema, TrackOutlineSchema, type SharedChaptersFile } from '@/lib/types';
import { headingProblems } from './blog';
import {
  buildExerciseId,
  frontierExerciseIds,
  parseBlogFileName,
  parseChapterId,
  parseExerciseId,
  trackExerciseIds,
} from './ids';
import {
  ContentError,
  contentPath,
  hasContent,
  listFrontierFolders,
  loadBlogFile,
  loadCase,
  loadKbSources,
  loadLesson,
  loadQuickCheck,
  loadSharedChapters,
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
  `${FRONTIER_AREA}/<date>-<slug>, ${BLOG_AREA}/<date>-<slug>.mdx, or ${SHARED_CHAPTERS_FILE} at the root. Move or rename it.`;

/** Every exercise file the id grammar allows, keyed by path → id. Frontier folders come from disk. */
function knownExerciseFiles(frontierFolders: string[]): Map<string, string> {
  const ids: string[] = TRACKS.flatMap(trackExerciseIds);
  for (const { n } of MATH_FLOORS) {
    for (const step of SIDE_STEPS) ids.push(buildExerciseId({ area: MATH_AREA, floor: n, step }));
  }
  ids.push(...frontierExerciseIds(frontierFolders));
  return new Map(ids.map((id) => [exerciseFile(parseExerciseId(id)!), id]));
}

const FRONTIER_FOLDER =
  `a Frontier chapter folder is named <YYYY-MM-DD>-<slug> (a real date, a lowercase ` +
  `kebab-case slug). Rename the folder.`;

/**
 * A Frontier chapter holds both its lesson and its quick check
 * (curriculum plan, amendment 2026-10-07 SIG-29). Extra files are already
 * "unexpected"; this names the missing one.
 */
function frontierMissingFiles(folders: string[], files: string[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  for (const id of frontierExerciseIds(folders)) {
    const rel = exerciseFile(parseExerciseId(id)!);
    if (!files.includes(rel)) {
      issues.push({
        file: rel,
        message: `a Frontier chapter needs both ${LESSON_FILE} and ${QUICK_CHECK_FILE}: add content/${rel}`,
      });
    }
  }
  return issues;
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

type QuestionLike = { options: { text: string; correct: boolean }[] };

/**
 * Questions whose right option gives itself away by length: it is the single
 * longest, more than ANSWER_LENGTH_MAX_RATIO longer than the next-longest
 * option and at least ANSWER_LENGTH_MIN_GAP characters longer. Ties pass.
 */
export function lengthGiveaways(questions: QuestionLike[], file: string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  questions.forEach((q, i) => {
    const right = q.options.find((o) => o.correct);
    if (!right) return;
    const next = Math.max(...q.options.filter((o) => !o.correct).map((o) => o.text.length));
    const gap = right.text.length - next;
    if (gap >= ANSWER_LENGTH_MIN_GAP && gap > next * ANSWER_LENGTH_MAX_RATIO) {
      issues.push({
        file,
        message: `question ${i + 1}: the correct option is the longest (${right.text.length} chars vs ${next} for the next). Make the options a similar length.`,
      });
    }
  });
  return issues;
}

const BARE_NUMBER = /^[\d.,\s%$+-]+$/;
const endsWithPeriod = (t: string) => t.trim().endsWith('.');
const hasTwoSentences = (t: string) => t.includes('. ');

/**
 * Questions whose right option gives itself away by sentence shape: only it
 * ends with a period, or only it holds two sentences (". "). Questions whose
 * options are all bare numbers are skipped.
 */
export function shapeGiveaways(questions: QuestionLike[], file: string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  questions.forEach((q, i) => {
    const right = q.options.find((o) => o.correct);
    if (!right) return;
    const wrong = q.options.filter((o) => !o.correct);
    if (q.options.every((o) => BARE_NUMBER.test(o.text.trim()))) return;
    const tells: [string, (t: string) => boolean][] = [
      ['ends with a period', endsWithPeriod],
      ['has two sentences', hasTwoSentences],
    ];
    for (const [label, has] of tells) {
      if (has(right.text) && !wrong.some((o) => has(o.text))) {
        issues.push({
          file,
          message: `question ${i + 1}: only the correct option ${label}. Give every option the same sentence shape.`,
        });
      }
    }
  });
  return issues;
}

/** The site's static folder, where a post's `cover` path points. */
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

/**
 * A blog post: frontmatter schema, a body with no components (no NPC
 * DialogBox), unique heading anchors (the "On this page" list), a linked
 * lesson that exists, a slug no other post uses, and (when set) a cover
 * file under public/ that no other post uses.
 */
async function checkBlogPost(
  abs: string,
  rel: string,
  name: string,
  slugs: Map<string, string>,
  covers: Map<string, string>,
  publicDir: string,
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
    for (const message of headingProblems(body)) issues.push({ file: rel, message });
    const { cover } = frontmatter;
    if (cover !== `/blog/covers/${slug}.webp`) {
      issues.push({
        file: rel,
        message: `cover must be /blog/covers/${slug}.webp (named after the slug), not ${cover}.`,
      });
    }
    const used = covers.get(cover);
    if (used) {
      issues.push({
        file: rel,
        message: `cover ${cover} is already used by ${used}. Each post needs its own cover.`,
      });
    } else covers.set(cover, rel);
    const isFile = await stat(path.join(publicDir, cover)).then(
      (s) => s.isFile(),
      () => false,
    );
    if (!isFile) {
      issues.push({ file: rel, message: `cover ${cover} is not a file under public/.` });
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

/** What a shared member is when it is not a realm chapter, for the error message. */
const NOT_SHAREABLE = {
  boss: 'a boss',
  math: 'a Math floor',
  frontier: 'a Frontier level',
} as const;

/**
 * The rules of content/shared-chapters.json beyond its schema
 * (docs/plans/shared-chapters-design-plan.md, Content contract): every member
 * is a live realm chapter (lesson, case and quick check on disk), never a
 * boss, Math floor or Frontier level; a group has one member per track; a
 * chapter and a concept id are each used by one group only.
 */
async function sharedChapterProblems(
  data: SharedChaptersFile,
  root: string,
  rel: string = SHARED_CHAPTERS_FILE,
): Promise<ContentIssue[]> {
  const issues: ContentIssue[] = [];
  const push = (group: string, message: string) =>
    issues.push({ file: rel, message: `group "${group}": ${message}` });
  /** concept id → seen; member → the group that first used it. */
  const groupIds = new Set<string>();
  const owner = new Map<string, string>();

  for (const group of data.groups) {
    if (groupIds.has(group.id)) push(group.id, 'this concept id is used by another group.');
    groupIds.add(group.id);
    const tracks = new Set<string>();
    for (const member of group.members) {
      const first = owner.get(member);
      if (first) {
        push(
          group.id,
          `${member} is already in group "${first}". A chapter may be in one group only.`,
        );
      } else owner.set(member, group.id);

      const ref = parseChapterId(member);
      if (!ref) {
        // Not a chapter: name what it is (a boss parses with BOSS_STEP; Math and Frontier with a side step).
        const other =
          parseExerciseId(`${member}/${BOSS_STEP}`) ??
          parseExerciseId(`${member}/${SIDE_STEPS[0]}`);
        push(
          group.id,
          other && other.area !== 'chapter'
            ? `${member} is ${NOT_SHAREABLE[other.area]}. Only realm chapters may be shared.`
            : `${member} is not a realm chapter. Write it as <track>/r<N>/c<N>.`,
        );
        continue;
      }
      if (tracks.has(ref.track)) {
        push(group.id, `two members are on the ${ref.track} track. Use one chapter per track.`);
      }
      tracks.add(ref.track);
      for (const step of CHAPTER_STEPS) {
        const id = buildExerciseId({ area: 'chapter', ...ref, step });
        if (!(await hasContent(id, root))) {
          push(group.id, `${member} has no ${exerciseFile(parseExerciseId(id)!)}.`);
        }
      }
    }
  }
  return issues;
}

/** Loads content/shared-chapters.json with its schema, then checks its rules. */
async function checkSharedChapters(abs: string, rel: string, issues: ContentIssue[]) {
  try {
    const data = await loadSharedChapters(abs);
    issues.push(...(await sharedChapterProblems(data, abs, rel)));
  } catch (err) {
    issues.push({ file: rel, message: detail(err) });
  }
}

export async function validateContent(
  root: string = CONTENT_DIR,
  publicDir: string = PUBLIC_DIR,
): Promise<ContentIssue[]> {
  const abs = contentPath(root, '.');
  const issues: ContentIssue[] = [];
  const files = await listFiles(abs);
  const official = await officialBases(abs, issues);

  const frontier = await listFrontierFolders(abs);
  const exercises = knownExerciseFiles(frontier);
  issues.push(...frontierMissingFiles(frontier, files));

  /** slug → the first file that used it: two posts may not share a URL. */
  const blogSlugs = new Map<string, string>();
  /** cover path → the first post that used it: a cover is never reused. */
  const blogCovers = new Map<string, string>();

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
      await checkBlogPost(abs, rel, post, blogSlugs, blogCovers, publicDir, issues);
      continue;
    }
    if (rel === SHARED_CHAPTERS_FILE) {
      await checkSharedChapters(abs, rel, issues);
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
      const [area, folder] = rel.split('/');
      const badFolder = area === FRONTIER_AREA && !frontier.includes(folder);
      issues.push({ file: rel, message: badFolder ? FRONTIER_FOLDER : UNEXPECTED });
      continue;
    }
    try {
      if (rel.endsWith(LESSON_FILE)) {
        const { frontmatter, body } = await loadLesson(id, abs);
        try {
          // A Frontier lesson has no NPC, so no <DialogBox> (or any component).
          const isFrontier = parseExerciseId(id)?.area === FRONTIER_AREA;
          await compileLesson(body, isFrontier ? { allowedComponents: NO_COMPONENTS } : {});
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
      } else if (rel.endsWith(CASE_FILE)) {
        {
          const qs = (await loadCase(id, abs)).questions;
          issues.push(...lengthGiveaways(qs, rel), ...shapeGiveaways(qs, rel));
        }
      } else {
        {
          const qs = (await loadQuickCheck(id, abs)).questions;
          issues.push(...lengthGiveaways(qs, rel), ...shapeGiveaways(qs, rel));
        }
      }
    } catch (err) {
      issues.push({ file: rel, message: detail(err) });
    }
  }
  return issues;
}
