import { describe, expect, test } from 'bun:test';
import { compile } from '@mdx-js/mdx';
import { CONTENT_DIR } from '@/lib/constants';
import { postHeadings } from './blog';
import { LESSON_STEP, lessonSteps } from './mdx';

/** The bits of an mdast node the tests read. */
type Node = {
  type: string;
  name?: string | null;
  value?: unknown;
  attributes?: Node[];
  children?: Node[];
};

/** The mdast tree before and after `lessonSteps`, captured by plugins on either side. */
async function stepTrees(body: string): Promise<{ before: Node; after: Node }> {
  let before: Node | null = null;
  let after: Node | null = null;
  await compile(body, {
    remarkPlugins: [
      () => (tree: Node) => {
        before = structuredClone(tree);
      },
      lessonSteps,
      () => (tree: Node) => {
        after = tree;
      },
    ],
  });
  if (!before || !after) throw new Error('the plugins did not run');
  return { before, after };
}

/** Every text value in a tree, in order: grouping must not add, drop or move any. */
function texts(node: Node): string[] {
  const own = typeof node.value === 'string' ? [node.value] : [];
  return [...own, ...(node.children ?? []).flatMap(texts)];
}

/** The `step` attribute of each top-level step, or null for a node that is not a step. */
function stepNumbers(tree: Node): (string | null)[] {
  return (tree.children ?? []).map((node) =>
    node.type === 'mdxJsxFlowElement' && node.name === LESSON_STEP
      ? String(node.attributes?.find((a) => a.name === 'step')?.value)
      : null,
  );
}

/** A body with `count` sections, each a heading, a paragraph and a list. */
const sections = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => `## Part ${i + 1}\n\nText of part ${i + 1}.\n\n- one\n- two\n`,
  ).join('\n');

describe('lessonSteps', () => {
  test('one step per ## section, numbered from 1, with the text unchanged', async () => {
    for (const count of [5, 10]) {
      const { before, after } = await stepTrees(sections(count));
      expect(stepNumbers(after)).toEqual(Array.from({ length: count }, (_, i) => String(i + 1)));
      expect(texts(after)).toEqual(texts(before));
      // Each step starts with its own heading.
      for (const step of after.children ?? []) expect(step.children?.[0]?.type).toBe('heading');
    }
  });

  test('the intro before the first ## joins step 1', async () => {
    const body = `An intro line.\n\nA second intro line.\n\n${sections(5)}`;
    const { before, after } = await stepTrees(body);
    expect(stepNumbers(after)).toEqual(['1', '2', '3', '4', '5']);
    const first = after.children?.[0]?.children ?? [];
    expect(first.map((n) => n.type).slice(0, 3)).toEqual(['paragraph', 'paragraph', 'heading']);
    expect(texts(after)).toEqual(texts(before));
  });

  test('a ### heading and a ## inside a code block start no step', async () => {
    const body = `## One\n\n### Sub\n\n\`\`\`md\n## not a step\n\`\`\`\n\n## Two\n\nEnd.\n`;
    const { after } = await stepTrees(body);
    expect(stepNumbers(after)).toEqual(['1', '2']);
  });

  test('a body with no ## is left as it is', async () => {
    const { before, after } = await stepTrees('Only a paragraph.\n\n- and a list\n');
    expect(stepNumbers(after)).toEqual([null, null]);
    expect(texts(after)).toEqual(texts(before));
  });

  // The page counts steps with postHeadings; the plugin groups with mdast. They must agree.
  test('every lesson on disk: the steps match postHeadings, and there are at least 3', async () => {
    const files = [...new Bun.Glob('**/lesson.mdx').scanSync(CONTENT_DIR)];
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = await Bun.file(`${CONTENT_DIR}/${file}`).text();
      const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
      const { before, after } = await stepTrees(body);
      const steps = stepNumbers(after);
      expect({ file, steps: steps.length }).toEqual({ file, steps: postHeadings(body).length });
      expect({ file, ok: steps.length >= 3 && steps.every((s) => s !== null) }).toEqual({
        file,
        ok: true,
      });
      expect(texts(after)).toEqual(texts(before));
    }
  }, 60_000);
});
