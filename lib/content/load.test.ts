import { describe, expect, test } from 'bun:test';
import { REALM_COUNT, TRACKS } from '@/lib/constants';
import { CaseSchema, LessonFrontmatterSchema, QuickCheckSchema } from '@/lib/types';
import {
  ContentError,
  listBlogPosts,
  loadBlogPost,
  loadCase,
  loadLesson,
  loadQuickCheck,
  loadTrackOutline,
  parseMdx,
} from './load';

const VALID = `${import.meta.dir}/__fixtures__/valid`;
const BROKEN = `${import.meta.dir}/__fixtures__/broken`;

const LESSON = 'builder/r0/c1/lesson';
/** The graded `challenge` step is a case on both tracks. */
const BUILDER_CASE = 'builder/r0/c1/challenge';
const CASE = 'strategist/r0/c1/challenge';
const QUICK_CHECK = 'builder/r0/c1/quick-check';

/** The ContentError a promise rejects with. */
async function failure(p: Promise<unknown>): Promise<ContentError> {
  try {
    await p;
  } catch (err) {
    expect(err).toBeInstanceOf(ContentError);
    return err as ContentError;
  }
  throw new Error('expected the loader to throw');
}

describe('valid files load', () => {
  test('lesson: frontmatter and body', async () => {
    const { frontmatter, body } = await loadLesson(LESSON, VALID);
    expect(frontmatter.id).toBe(LESSON);
    expect(frontmatter.sources).toHaveLength(1);
    expect(body).toContain('## Fixture lesson');
    expect(body).not.toContain('sourceHash');
  });

  test('case: unmarked options default to not correct', async () => {
    const c = await loadCase(CASE, VALID);
    expect(c.questions[0].options.map((o) => o.correct)).toEqual([false, true, false, false]);
  });

  test('builder case: same schema, keeps the correct flags on the server', async () => {
    const c = await loadCase(BUILDER_CASE, VALID);
    expect(c.id).toBe(BUILDER_CASE);
    expect(c.questions[0].options.map((o) => o.correct)).toEqual([true, false, false, false]);
    expect(c.exhibit).toContain('"fixture": true');
  });

  test('quick check', async () => {
    const q = await loadQuickCheck(QUICK_CHECK, VALID);
    expect(q.questions).toHaveLength(3);
  });
});

describe('bad files fail with the file name', () => {
  test('lesson with no sources and a stray xp field', async () => {
    const err = await failure(loadLesson(LESSON, BROKEN));
    expect(err.code).toBe('invalid');
    expect(err.message).toContain('builder/00-bootstrap-village/c1/lesson.mdx');
    expect(err.message).toContain('sources');
    expect(err.message).toContain('xp');
  });

  test('builder case with no questions', async () => {
    const err = await failure(loadCase(BUILDER_CASE, BROKEN));
    expect(err.message).toContain('builder/00-bootstrap-village/c1/case.json');
    expect(err.message).toContain('questions');
  });

  test('case with two correct options', async () => {
    const err = await failure(loadCase(CASE, BROKEN));
    expect(err.message).toContain('strategist/00-bootstrap-village/c1/case.json');
    expect(err.message).toContain('exactly one option must be correct');
  });

  test('a missing file is `missing`, so a page can 404', async () => {
    const err = await failure(loadQuickCheck(QUICK_CHECK, BROKEN));
    expect(err.code).toBe('missing');
    expect(err.file).toContain('quick-check.json');
  });

  test('an invalid id', async () => {
    expect((await failure(loadLesson('builder/r9/c1/lesson', VALID))).code).toBe('invalid');
  });

  test('the wrong loader for the id', async () => {
    const err = await failure(loadQuickCheck(CASE, VALID));
    expect(err.message).toContain('case.json, not quick-check.json');
  });

  test('a file whose id does not match its path', async () => {
    // The fixture sits in strategist/…/c1 but says it is c2.
    const err = await failure(loadQuickCheck('strategist/r0/c1/quick-check', BROKEN));
    expect(err.code).toBe('invalid');
    expect(err.message).toContain('strategist/00-bootstrap-village/c1/quick-check.json');
    expect(err.message).toContain('expected "strategist/r0/c1/quick-check"');
  });
});

describe('schemas', () => {
  const kase = async () => CaseSchema.parse(await loadCase(CASE, VALID));

  test('a case question with 0 correct options fails', async () => {
    const c = await kase();
    for (const o of c.questions[0].options) o.correct = false;
    expect(CaseSchema.safeParse(c).success).toBe(false);
  });

  test('a case question with 2 correct options fails', async () => {
    const c = await kase();
    for (const o of c.questions[0].options) o.correct = true;
    expect(CaseSchema.safeParse(c).success).toBe(false);
  });

  test('an option without an explanation fails', async () => {
    const c = await kase();
    const { text, correct } = c.questions[0].options[0];
    c.questions[0].options[0] = { text, correct } as (typeof c.questions)[0]['options'][0];
    expect(CaseSchema.safeParse(c).success).toBe(false);
  });

  test('sourceHash is optional until step 8, but must be a SHA-256 when set', async () => {
    const { sourceHash, ...rest } = (await loadLesson(LESSON, VALID)).frontmatter;
    expect(sourceHash).toBeDefined();
    expect(LessonFrontmatterSchema.safeParse(rest).success).toBe(true);
    expect(LessonFrontmatterSchema.safeParse({ ...rest, sourceHash: 'abc' }).success).toBe(false);
  });

  test('a case has 3–5 questions', async () => {
    const c = await kase();
    expect(CaseSchema.safeParse({ ...c, questions: c.questions.slice(0, 2) }).success).toBe(false);
    const six = [...c.questions, ...c.questions];
    expect(CaseSchema.safeParse({ ...c, questions: six }).success).toBe(false);
  });

  test('a case question has exactly 4 options', async () => {
    const c = await kase();
    c.questions[0].options = c.questions[0].options.filter((o) => o.correct);
    c.questions[0].options.push({ text: 'Other', explanation: 'Not this one.', correct: false });
    expect(CaseSchema.safeParse(c).success).toBe(false);
  });

  test('exhibit is optional but never blank', async () => {
    const c = await kase();
    expect(c.exhibit).toBeUndefined();
    expect(CaseSchema.safeParse({ ...c, exhibit: '  ' }).success).toBe(false);
  });

  test('a quick check needs exactly 3 questions', async () => {
    const q = await loadQuickCheck(QUICK_CHECK, VALID);
    q.questions.pop();
    expect(QuickCheckSchema.safeParse(q).success).toBe(false);
  });

  test('a case id must end in /challenge', async () => {
    const c = await loadCase(BUILDER_CASE, VALID);
    expect(CaseSchema.safeParse({ ...c, id: LESSON }).success).toBe(false);
  });

  test('a lesson may cite docs, repo and official blog posts; nothing else', async () => {
    const { frontmatter } = await loadLesson(LESSON, VALID);
    const cite = (kind: string) =>
      LessonFrontmatterSchema.safeParse({
        ...frontmatter,
        sources: [{ ...frontmatter.sources[0], kind }],
      }).success;
    expect(['docs', 'repo', 'blog'].map(cite)).toEqual([true, true, true]);
    expect(cite('changelog')).toBe(false);
    expect(cite('tweet')).toBe(false);
  });
});

describe('loadTrackOutline', () => {
  test('reads and validates the real outline of each track', async () => {
    for (const track of TRACKS) {
      const outline = await loadTrackOutline(track);
      expect(outline.realms).toHaveLength(REALM_COUNT);
    }
  });

  test('a missing outline is a "missing" ContentError', async () => {
    expect((await failure(loadTrackOutline('builder', VALID))).code).toBe('missing');
  });
});

describe('parseMdx', () => {
  test('splits frontmatter YAML from the body', () => {
    const { raw, body } = parseMdx('---\ntitle: A\n---\n## Body\n', 'x.mdx');
    expect(raw).toEqual({ title: 'A' });
    expect(body).toBe('## Body\n');
  });

  test('no frontmatter block, or bad YAML, is an invalid ContentError with the file', () => {
    for (const text of ['## Body', '---\ntitle: [\n---\n']) {
      let err: unknown;
      try {
        parseMdx(text, 'x.mdx');
      } catch (e) {
        err = e;
      }
      expect(err).toBeInstanceOf(ContentError);
      expect((err as ContentError).code).toBe('invalid');
      expect((err as ContentError).message).toStartWith('x.mdx: ');
    }
  });
});

describe('blog posts', () => {
  test('loadBlogPost: date and slug come from the file name', async () => {
    const post = await loadBlogPost('fixture-post', VALID);
    expect(post.date).toBe('2026-10-06');
    expect(post.slug).toBe('fixture-post');
    expect(post.frontmatter).toEqual({
      title: 'Fixture post',
      description: 'A short post for the loader tests.',
      lesson: LESSON,
    });
    expect(post.body).toContain('## Fixture post');
  });

  test('an unknown slug is "missing"', async () => {
    expect((await failure(loadBlogPost('nope', VALID))).code).toBe('missing');
  });

  test('listBlogPosts: newest first', async () => {
    const posts = await listBlogPosts(VALID);
    expect(posts.map((p) => p.slug)).toEqual(['fixture-post', 'older-post']);
  });

  test('no blog folder is an empty list, not an error', async () => {
    expect(await listBlogPosts(`${VALID}/builder`)).toEqual([]);
  });

  test('a bad post fails with the file name and each problem', async () => {
    const err = await failure(loadBlogPost('fixture-post', BROKEN));
    expect(err.code).toBe('invalid');
    expect(err.message).toContain('blog/2026-10-06-fixture-post.mdx');
    expect(err.message).toContain('description');
    expect(err.message).toContain('/lesson');
    expect(err.message).toContain('sources');
  });
});
