import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'bun:test';
import { CONTENT_DIR } from '@/lib/constants';
import { isSafeLessonUrl } from './mdx';
import { validateContent } from './validate';

const REAL = path.resolve(import.meta.dir, '../..', CONTENT_DIR);
const FIXTURE_LESSON = `${import.meta.dir}/__fixtures__/valid/builder/00-bootstrap-village/c1/lesson.mdx`;
const C1 = 'builder/00-bootstrap-village/c1';

let tmp: string | undefined;
afterEach(async () => {
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
    await Bun.write(`${root}/blog/2026-10-05-tokens.mdx`, '---\n---\n');
    await Bun.write(`${root}/blog/tokens.mdx`, '---\n---\n');
    expect((await validateContent(root)).map((i) => i.file)).toEqual(['blog/tokens.mdx']);
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
