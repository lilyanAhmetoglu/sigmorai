import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'bun:test';
import { CONTENT_DIR, SHARED_CHAPTERS_FILE } from '@/lib/constants';
import { isSafeLessonUrl } from './mdx';
import { lengthGiveaways, shapeGiveaways, validateContent } from './validate';

const REAL = path.resolve(import.meta.dir, '../..', CONTENT_DIR);
const FIXTURE_LESSON = `${import.meta.dir}/__fixtures__/valid/builder/00-bootstrap-village/c1/lesson.mdx`;
const C1 = 'builder/00-bootstrap-village/c1';

let tmp: string | undefined;
const pubDirs: string[] = [];
afterEach(async () => {
  for (const d of pubDirs.splice(0)) await rm(d, { recursive: true, force: true });
  if (tmp) await rm(tmp, { recursive: true, force: true });
  tmp = undefined;
});

/** A throwaway copy of the real content/ folder to break on purpose. */
async function copyOfContent(): Promise<string> {
  tmp = await mkdtemp(path.join(tmpdir(), 'sigmorai-content-'));
  await cp(REAL, tmp, { recursive: true });
  return tmp;
}

describe('real content', () => {
  // CI fails here when a committed content file breaks its schema.
  test('every file under content/ is valid', async () => {
    expect(await validateContent()).toEqual([]);
  });
});

describe('broken content is caught, with the file name', () => {
  test('a case with a second correct option', async () => {
    const root = await copyOfContent();
    const file = `${root}/${C1}/case.json`;
    const data = await Bun.file(file).json();
    data.questions[0].options[1].correct = true;
    await writeFile(file, JSON.stringify(data));
    const issues = await validateContent(root);
    expect(issues).toHaveLength(1);
    expect(issues[0].file).toBe(`${C1}/case.json`);
    expect(issues[0].message).toContain('exactly one option must be correct');
  });

  test('invalid JSON in a quick check', async () => {
    const root = await copyOfContent();
    await writeFile(`${root}/${C1}/quick-check.json`, '{ not json');
    const [issue] = await validateContent(root);
    expect(issue.file).toBe(`${C1}/quick-check.json`);
    expect(issue.message).toContain('invalid JSON');
  });

  test('a stale challenge.json or a chapter outside c1–c6', async () => {
    const root = await copyOfContent();
    await writeFile(`${root}/${C1}/challenge.json`, '{}');
    const issues = await validateContent(root);
    expect(issues.map((i) => i.file)).toEqual([`${C1}/challenge.json`]);
    expect(issues[0].message).toContain('unexpected file');
  });

  test('a broken outline', async () => {
    const root = await copyOfContent();
    const file = `${root}/builder/outline.json`;
    const data = await Bun.file(file).json();
    data.realms[0].chapters.pop();
    await writeFile(file, JSON.stringify(data));
    expect((await validateContent(root)).map((i) => i.file)).toEqual(['builder/outline.json']);
  });

  test('a lesson citing a page that is not under an official source', async () => {
    const root = await copyOfContent();
    const lesson = (await Bun.file(FIXTURE_LESSON).text()).replace(
      'https://platform.claude.com/docs',
      'https://github.com/walkinglabs/learn-harness-engineering',
    );
    await writeFile(`${root}/${C1}/lesson.mdx`, lesson);
    const [issue] = await validateContent(root);
    expect(issue.file).toBe(`${C1}/lesson.mdx`);
    expect(issue.message).toContain('trustTier: official');
  });

  test('a lesson under an official source passes', async () => {
    const root = await copyOfContent();
    await cp(FIXTURE_LESSON, `${root}/${C1}/lesson.mdx`);
    expect(await validateContent(root)).toEqual([]);
  });

  test('a lesson body that is not valid MDX', async () => {
    const root = await copyOfContent();
    const lesson = (await Bun.file(FIXTURE_LESSON).text()) + '\n<DialogBox>never closed\n';
    await writeFile(`${root}/${C1}/lesson.mdx`, lesson);
    const [issue] = await validateContent(root);
    expect(issue.file).toBe(`${C1}/lesson.mdx`);
    expect(issue.message).toContain('MDX body');
  });

  test('a lesson body with an h1, an import or an unknown component', async () => {
    const root = await copyOfContent();
    const lesson = (await Bun.file(FIXTURE_LESSON).text()).replace(
      '## Fixture lesson',
      "import x from 'y'\n\n# Fixture lesson\n\n<Quiz />",
    );
    await writeFile(`${root}/${C1}/lesson.mdx`, lesson);
    const issues = await validateContent(root);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('Start at "##"');
    expect(issues[0].message).toContain('import/export');
    expect(issues[0].message).toContain('<Quiz>');
  });

  test('a lesson body with a {…} expression or a <script>', async () => {
    const root = await copyOfContent();
    const lesson =
      (await Bun.file(FIXTURE_LESSON).text()) +
      '\n{process.env.HOME}\n\nHome is {1 + 1}.\n\n<DialogBox {...x}>a</DialogBox>\n\n' +
      '<DialogBox title={y}>b</DialogBox>\n\n<script>alert(1)</script>\n\n<iframe src="https://x.example" />\n';
    await writeFile(`${root}/${C1}/lesson.mdx`, lesson);
    const issues = await validateContent(root);
    expect(issues).toHaveLength(1);
    const lines = issues[0].message.split('\n');
    expect(lines.filter((l) => l.includes('no {…} expressions'))).toHaveLength(4);
    expect(issues[0].message).toContain('<script> is not allowed');
    expect(issues[0].message).toContain('<iframe> is not allowed');
  });

  test('a "#" comment inside a code block is not an h1', async () => {
    const root = await copyOfContent();
    const lesson =
      (await Bun.file(FIXTURE_LESSON).text()) +
      '\n```bash\n# install\n```\n\n<DialogBox>Hello.</DialogBox>\n';
    await writeFile(`${root}/${C1}/lesson.mdx`, lesson);
    expect(await validateContent(root)).toEqual([]);
  });

  test('a missing sources.yaml is an issue, not a silent skip', async () => {
    const root = await copyOfContent();
    await rm(`${root}/sources.yaml`);
    expect(await validateContent(root)).toEqual([
      { file: 'sources.yaml', message: 'registry file is missing' },
    ]);
  });

  test('a blog post must be named <date>-<slug>.mdx', async () => {
    const root = await copyOfContent();
    await Bun.write(`${root}/blog/2026-10-05-tokens.mdx`, post());
    await Bun.write(`${root}/blog/tokens.mdx`, post());
    const pub = await mkdtemp(path.join(tmpdir(), 'sigmorai-public-'));
    pubDirs.push(pub);
    await cp(path.resolve(import.meta.dir, '../../public/blog'), `${pub}/blog`, {
      recursive: true,
    });
    await Bun.write(`${pub}/blog/covers/tokens.webp`, 'x');
    expect((await validateContent(root, pub)).map((i) => i.file)).toEqual(['blog/tokens.mdx']);
  });
});

describe('Frontier chapters (curriculum plan, amendment 2026-10-07 SIG-29)', () => {
  const FIXTURE = `${import.meta.dir}/__fixtures__/frontier/frontier`;
  const NEW = 'frontier/2026-10-06-new-thing';

  /** The real content plus the two fixture chapters. */
  async function withChapters(): Promise<string> {
    const root = await copyOfContent();
    await cp(FIXTURE, `${root}/frontier`, { recursive: true });
    return root;
  }

  test('well-formed chapters pass', async () => {
    expect(await validateContent(await withChapters())).toEqual([]);
  });

  test('a chapter needs both its lesson and its quick check', async () => {
    const root = await withChapters();
    await rm(`${root}/${NEW}/quick-check.json`);
    const issues = await validateContent(root);
    expect(issues).toHaveLength(1);
    expect(issues[0].file).toBe(`${NEW}/quick-check.json`);
    expect(issues[0].message).toContain('needs both lesson.mdx and quick-check.json');
  });

  test('a folder name that does not parse is named as such', async () => {
    const root = await withChapters();
    await cp(`${root}/${NEW}`, `${root}/frontier/2026-02-30-bad-date`, { recursive: true });
    const issues = await validateContent(root);
    expect(issues.map((i) => i.file)).toEqual([
      'frontier/2026-02-30-bad-date/lesson.mdx',
      'frontier/2026-02-30-bad-date/quick-check.json',
    ]);
    expect(issues[0].message).toContain('<YYYY-MM-DD>-<slug>');
  });

  test('a stray file right under frontier/ is unexpected, not a bad folder', async () => {
    const root = await withChapters();
    await writeFile(`${root}/frontier/notes.md`, 'x');
    const issues = await validateContent(root);
    expect(issues.map((i) => i.file)).toEqual(['frontier/notes.md']);
    expect(issues[0].message).toContain('unexpected file');
    expect(issues[0].message).not.toContain('Rename the folder');
  });

  test('a case or any other file in a chapter is unexpected', async () => {
    const root = await withChapters();
    await writeFile(`${root}/${NEW}/case.json`, '{}');
    const issues = await validateContent(root);
    expect(issues.map((i) => i.file)).toEqual([`${NEW}/case.json`]);
    expect(issues[0].message).toContain('unexpected file');
  });

  test('a <DialogBox> in a Frontier lesson fails: no NPC there', async () => {
    const root = await withChapters();
    const file = `${root}/${NEW}/lesson.mdx`;
    await writeFile(file, (await Bun.file(file).text()) + '\n<DialogBox>Hello.</DialogBox>\n');
    const issues = await validateContent(root);
    expect(issues.map((i) => i.file)).toEqual([`${NEW}/lesson.mdx`]);
    expect(issues[0].message).toContain('<DialogBox> is not allowed. No components are.');
  });

  test('the lesson id must match its folder', async () => {
    const root = await withChapters();
    const file = `${root}/${NEW}/lesson.mdx`;
    const text = await Bun.file(file).text();
    await writeFile(
      file,
      text.replace(`id: ${NEW}/lesson`, 'id: frontier/2026-10-06-other/lesson'),
    );
    const issues = await validateContent(root);
    expect(issues.map((i) => i.file)).toEqual([`${NEW}/lesson.mdx`]);
    expect(issues[0].message).toContain(`expected "${NEW}/lesson"`);
  });

  test('a source must be official', async () => {
    const root = await withChapters();
    const file = `${root}/${NEW}/lesson.mdx`;
    const text = await Bun.file(file).text();
    await writeFile(
      file,
      text.replace('https://platform.claude.com/docs/en/prompting', 'https://blog.example.com/x'),
    );
    const issues = await validateContent(root);
    expect(issues.map((i) => i.file)).toEqual([`${NEW}/lesson.mdx`]);
    expect(issues[0].message).toContain('is not under a trustTier: official entry');
  });

  test('a quick check needs exactly 3 questions', async () => {
    const root = await withChapters();
    const file = `${root}/${NEW}/quick-check.json`;
    const data = await Bun.file(file).json();
    data.questions.pop();
    await writeFile(file, JSON.stringify(data));
    const issues = await validateContent(root);
    expect(issues.map((i) => i.file)).toEqual([`${NEW}/quick-check.json`]);
  });
});

/** A blog post file: valid by default; `fields` overrides frontmatter lines. */
function post(body = '## Summary\n\nPlain text.', fields: Record<string, string> = {}) {
  const front = {
    title: 'A post',
    description: 'What it covers.',
    lesson: 'builder/r0/c1/lesson',
    cover: '/blog/covers/tokens.webp',
    ...fields,
  };
  const yaml = Object.entries(front)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return `---\n${yaml}\n---\n\n${body}\n`;
}

describe('blog posts', () => {
  /** Validate the real content plus these posts, with a tiny public/ holding the named covers. */
  async function postIssues(
    files: Record<string, string>,
    covers = ['tokens', 'other'],
    removeFromCopy: string[] = [],
  ) {
    const root = await copyOfContent();
    for (const rel of removeFromCopy) await rm(`${root}/${rel}`);
    for (const [name, text] of Object.entries(files)) await Bun.write(`${root}/blog/${name}`, text);
    const pub = await mkdtemp(path.join(tmpdir(), 'sigmorai-public-'));
    pubDirs.push(pub);
    for (const c of covers) await Bun.write(`${pub}/blog/covers/${c}.webp`, 'x');
    // The real posts' covers live in the real public/.
    await cp(path.resolve(import.meta.dir, '../../public/blog'), `${pub}/blog`, {
      recursive: true,
    });
    return validateContent(root, pub);
  }

  test('an empty post fails its schema (it used to pass)', async () => {
    const issues = await postIssues({ '2026-10-05-tokens.mdx': '---\n---\n' });
    expect(issues.map((i) => i.file)).toEqual(['blog/2026-10-05-tokens.mdx']);
  });

  test('a missing description and a non-lesson id fail', async () => {
    const issues = await postIssues({
      '2026-10-05-tokens.mdx': post(undefined, {
        description: '',
        lesson: 'builder/r0/c1/challenge',
      }),
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('description');
    expect(issues[0].message).toContain('/lesson');
  });

  test('a stray sources field fails: sources come from the lesson', async () => {
    const issues = await postIssues({
      '2026-10-05-tokens.mdx': post(undefined, { sources: '[]' }),
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('sources');
  });

  test('a <DialogBox> in a post fails: no NPC lore on the blog', async () => {
    const issues = await postIssues({
      '2026-10-05-tokens.mdx': post('## Summary\n\n<DialogBox>Hello.</DialogBox>'),
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('<DialogBox> is not allowed. No components are.');
  });

  test('a lesson with no file (a stub chapter) fails', async () => {
    // Every chapter is written now, so the copy deletes one lesson to make a stub.
    const issues = await postIssues(
      { '2026-10-05-tokens.mdx': post(undefined, { lesson: 'creator/r8/c6/lesson' }) },
      undefined,
      ['creator/08-production-peaks/c6/lesson.mdx'],
    );
    expect(issues.some((i) => i.message.includes('has no lesson file'))).toBe(true);
  });

  test('a cover that is not a file under public/ fails', async () => {
    const issues = await postIssues(
      { '2026-10-05-tokens.mdx': post() },
      [], // no cover files at all
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('not a file under public/');
  });

  test('a missing cover fails its schema', async () => {
    const issues = await postIssues({ '2026-10-05-tokens.mdx': post(undefined, { cover: '' }) });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('cover');
  });

  test('a cover path outside /blog/covers fails its schema', async () => {
    const issues = await postIssues({
      '2026-10-05-tokens.mdx': post(undefined, { cover: '/levels/realm-01/sky.png' }),
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('cover');
  });

  test('a cover not named after the slug fails', async () => {
    const issues = await postIssues({
      '2026-10-05-tokens.mdx': post(undefined, { cover: '/blog/covers/other.webp' }),
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('/blog/covers/tokens.webp');
  });

  test('two posts may not share a cover', async () => {
    const issues = await postIssues({
      '2026-10-05-tokens.mdx': post(),
      '2026-10-06-other.mdx': post(), // cover is tokens.webp: shared, and not its slug
    });
    const shared = issues.filter((i) => i.message.includes('already used'));
    expect(shared).toHaveLength(1);
    expect(shared[0].file).toBe('blog/2026-10-06-other.mdx');
  });

  test('two posts with the same slug fail on the second', async () => {
    const issues = await postIssues({
      '2026-10-05-tokens.mdx': post(),
      '2026-10-06-tokens.mdx': post(),
    });
    expect(issues.map((i) => i.file)).toEqual([
      'blog/2026-10-06-tokens.mdx',
      'blog/2026-10-06-tokens.mdx',
    ]);
    expect(issues[0].message).toContain('already used');
  });
});

describe('lesson body allowlist (SIG-27)', () => {
  /** The fixture lesson with `extra` appended to its body. */
  async function lessonIssues(extra: string) {
    const root = await copyOfContent();
    const lesson = (await Bun.file(FIXTURE_LESSON).text()) + `\n${extra}\n`;
    await writeFile(`${root}/${C1}/lesson.mdx`, lesson);
    return validateContent(root);
  }

  test('markdown and allowed tags with safe links pass', async () => {
    const body = [
      '### Part',
      '- a [doc](https://platform.claude.com/docs), a [page](/realms) and an [anchor](#part)',
      '1. **bold** and _em_ and `code`',
      '> a quote',
      '---',
      '<p>Text with <a href="https://ai.google.dev" title="Gemini">a link</a>.<br /></p>',
      '<table><thead><tr><th scope="col">A</th></tr></thead><tbody><tr><td colSpan="1">1</td></tr></tbody></table>',
      '<DialogBox>Hello.</DialogBox>',
    ].join('\n\n');
    expect(await lessonIssues(body)).toEqual([]);
  });

  test('a tag off the allowlist fails, even a harmless-looking one', async () => {
    const issues = await lessonIssues(
      '<img src="https://x.example/a.png" />\n\n<form action="https://x.example"><button>Go</button></form>\n\n<object data="x" />\n\n<svg><a href="https://x.example">x</a></svg>',
    );
    expect(issues).toHaveLength(1);
    for (const tag of ['img', 'form', 'button', 'object', 'svg']) {
      expect(issues[0].message).toContain(`<${tag}> is not allowed`);
    }
  });

  test('unsafe links fail: javascript:, data:, http:, //host, also in raw <a>', async () => {
    const issues = await lessonIssues(
      [
        '[a](javascript:alert(1))',
        '[b](data:text/html,hi)',
        '[c](http://example.com)',
        '[d][ref]',
        '[ref]: //evil.example',
        '<a href="JaVaScRiPt:alert(1)">e</a>',
        '<a href="java&#10;script:alert(1)">f</a>',
      ].join('\n\n'),
    );
    expect(issues).toHaveLength(1);
    const lines = issues[0].message.split('\n');
    // Six: the [d][ref] use is reported once, at its `[ref]:` definition.
    expect(lines.filter((l) => l.includes('is not allowed. Use https:'))).toHaveLength(6);
  });

  test('event handlers, style, id and src attributes fail on allowed tags', async () => {
    const issues = await lessonIssues(
      '<p onClick="alert(1)" style="color:red" id="x">a</p>\n\n<a src="x" href="#ok">b</a>',
    );
    expect(issues).toHaveLength(1);
    for (const name of ['onClick', 'style', 'id', 'src']) {
      expect(issues[0].message).toContain(`the attribute "${name}"`);
    }
  });

  test('markdown images fail: no lesson needs one', async () => {
    const issues = await lessonIssues('![alt](https://x.example/a.png)');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('images are not allowed');
  });
});

describe('isSafeLessonUrl', () => {
  test('https, relative paths and anchors are safe', () => {
    for (const url of [
      'https://a.example/x',
      'HTTPS://a.example',
      '/realms',
      'page',
      './x',
      '#top',
      '?q=1',
    ]) {
      expect(isSafeLessonUrl(url)).toBe(true);
    }
  });

  test('other schemes, protocol-relative and control-character tricks are not', () => {
    const bad = [
      'javascript:alert(1)',
      ' javascript:alert(1)',
      'java\tscript:alert(1)',
      'java\nscript:alert(1)',
      'data:text/html,x',
      'vbscript:x',
      'http://a.example',
      'mailto:a@b.example',
      '//evil.example',
      '\\\\evil.example',
      '/\\evil.example',
    ];
    for (const url of bad) expect(isSafeLessonUrl(url)).toBe(false);
  });
});

describe('shared chapters (content/shared-chapters.json)', () => {
  const same = (id: string, ...members: string[]) => ({ id, kind: 'same', members });

  /** Writes the groups into a copy of content/ and returns the shared-file issues. */
  async function issuesFor(groups: unknown[]): Promise<string[]> {
    const root = await copyOfContent();
    await writeFile(`${root}/${SHARED_CHAPTERS_FILE}`, JSON.stringify({ groups }));
    const issues = await validateContent(root);
    expect(issues.every((i) => i.file === SHARED_CHAPTERS_FILE)).toBe(true);
    return issues.map((i) => i.message);
  }

  test('good same and covers groups pass', async () => {
    const covers = {
      id: 'token-costs',
      kind: 'covers',
      deep: 'builder/r0/c6',
      members: ['builder/r0/c6', 'strategist/r0/c4'],
    };
    expect(
      await issuesFor([same('mcp-basics', 'builder/r5/c1', 'strategist/r5/c2'), covers]),
    ).toEqual([]);
  });

  test('a bad member format fails', async () => {
    const [msg] = await issuesFor([same('x', 'builder/r1/c1', 'strategist/r1/c9')]);
    expect(msg).toContain('strategist/r1/c9 is not a realm chapter');
  });

  test('a boss, a Math floor or a Frontier level may not be shared', async () => {
    const msgs = await issuesFor([
      same('a', 'builder/r1/boss', 'strategist/r1/c1'),
      same('b', 'math/f1', 'creator/r1/c1'),
      same('c', 'frontier/2026-10-05-some-slug', 'creator/r2/c1'),
    ]);
    expect(msgs).toEqual([
      expect.stringContaining('builder/r1/boss is a boss'),
      expect.stringContaining('math/f1 is a Math floor'),
      expect.stringContaining('frontier/2026-10-05-some-slug is a Frontier level'),
    ]);
  });

  test('a member with a missing case fails', async () => {
    const root = await copyOfContent();
    await rm(`${root}/strategist/01-prompt-forest/c1/case.json`);
    await writeFile(
      `${root}/${SHARED_CHAPTERS_FILE}`,
      JSON.stringify({ groups: [same('be-specific', 'builder/r1/c1', 'strategist/r1/c1')] }),
    );
    const issues = await validateContent(root);
    expect(issues.map((i) => i.message)).toContain(
      'group "be-specific": strategist/r1/c1 has no strategist/01-prompt-forest/c1/case.json.',
    );
  });

  test('two members on one track fail', async () => {
    const [msg] = await issuesFor([same('x', 'builder/r1/c1', 'builder/r1/c2')]);
    expect(msg).toContain('two members are on the builder track');
  });

  test('a chapter in two groups fails, and so does a reused concept id', async () => {
    const msgs = await issuesFor([
      same('x', 'builder/r1/c1', 'strategist/r1/c1'),
      same('y', 'builder/r1/c1', 'creator/r1/c1'),
      same('x', 'builder/r2/c1', 'creator/r2/c1'),
    ]);
    expect(msgs).toEqual([
      expect.stringContaining('builder/r1/c1 is already in group "x"'),
      expect.stringContaining('this concept id is used by another group'),
    ]);
  });

  test('a covers group needs a deep member, one of exactly two', async () => {
    const pair = ['builder/r0/c6', 'strategist/r0/c4'];
    const noDeep = await issuesFor([{ id: 'a', kind: 'covers', members: pair }]);
    expect(noDeep).toHaveLength(1);
    const wrongDeep = await issuesFor([
      { id: 'a', kind: 'covers', deep: 'creator/r0/c1', members: pair },
    ]);
    expect(wrongDeep[0]).toContain('deep must be one of the two members');
    const three = await issuesFor([
      { id: 'a', kind: 'covers', deep: pair[0], members: [...pair, 'creator/r0/c1'] },
    ]);
    expect(three).toHaveLength(1);
  });

  test('a same group with one member, an unknown kind or a bad id fails its schema', async () => {
    expect(await issuesFor([same('x', 'builder/r1/c1')])).toHaveLength(1);
    expect(await issuesFor([{ id: 'x', kind: 'related', members: [] }])).toHaveLength(1);
    expect(
      await issuesFor([same('Be Specific', 'builder/r1/c1', 'strategist/r1/c1')]),
    ).toHaveLength(1);
  });
});

describe('answer length guard', () => {
  const q = (right: string, ...wrong: string[]) => ({
    options: [{ text: right, correct: true }, ...wrong.map((text) => ({ text, correct: false }))],
  });

  test('a clearly longest right answer fails, with file and question number', () => {
    const issues = lengthGiveaways(
      [q('aaaa', 'bbbb'), q('x'.repeat(40), 'y'.repeat(20), 'z')],
      'f/case.json',
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].file).toBe('f/case.json');
    expect(issues[0].message).toContain('question 2');
    expect(issues[0].message).toContain('40 chars vs 20');
  });

  test('a similar-length right answer passes', () => {
    expect(lengthGiveaways([q('x'.repeat(22), 'y'.repeat(20), 'z'.repeat(30))], 'f')).toEqual([]);
  });

  test('a tie for longest passes', () => {
    expect(lengthGiveaways([q('x'.repeat(40), 'y'.repeat(40), 'z')], 'f')).toEqual([]);
  });

  test('a small gap passes even when the ratio is high', () => {
    expect(lengthGiveaways([q('x'.repeat(10), 'y'.repeat(4))], 'f')).toEqual([]);
  });
});

describe('answer shape guard', () => {
  const q = (right: string, ...wrong: string[]) => ({
    options: [{ text: right, correct: true }, ...wrong.map((text) => ({ text, correct: false }))],
  });

  test('fails when only the key ends with a period', () => {
    const issues = shapeGiveaways([q('Use a cache.', 'Use a queue', 'Use a log')], 'f');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('question 1');
    expect(issues[0].message).toContain('ends with a period');
  });

  test('fails when only the key has two sentences', () => {
    const issues = shapeGiveaways([q('It waits. Then it retries', 'It stops', 'It logs')], 'f');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('two sentences');
  });

  test('passes when all options end with a period', () => {
    expect(shapeGiveaways([q('Use a cache.', 'Use a queue.', 'Use a log.')], 'f')).toEqual([]);
  });

  test('passes when no option does', () => {
    expect(shapeGiveaways([q('Use a cache', 'Use a queue', 'Use a log')], 'f')).toEqual([]);
  });

  test('ignores questions where all options are bare numbers', () => {
    expect(shapeGiveaways([q('3.', '4', '5')], 'f')).toEqual([]);
  });
});
