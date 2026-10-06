import 'server-only';
import { compile, evaluate } from '@mdx-js/mdx';
import type { MDXComponents, MDXContent } from 'mdx/types';
import { cache, type ReactNode } from 'react';
import * as runtime from 'react/jsx-runtime';

/**
 * Lesson bodies (quest-actions spec → SIG-11 block). Compiled at request time
 * with @mdx-js/mdx, from the same disk loader. Content comes from git, but
 * MDX runs on the server, so the body rules are strict, here and in
 * `content:check`:
 *   - it starts at `##` (the page owns the one h1, the lesson title);
 *   - no import / export and no `{…}` expressions (no JavaScript at all);
 *   - the only component is <DialogBox>; no <script>, <style> or <iframe>.
 * The components themselves are passed in by the caller (components/quest).
 */

/** The one component a lesson body may use. The renderer must supply it. */
export const LESSON_COMPONENTS = ['DialogBox'] as const;
export type LessonComponents = Record<(typeof LESSON_COMPONENTS)[number], MDXComponents[string]> &
  MDXComponents;

const ALLOWED_COMPONENTS: ReadonlySet<string> = new Set(LESSON_COMPONENTS);
/** Plain HTML tags that run code or load another page. */
const BLOCKED_TAGS = new Set(['script', 'style', 'iframe']);
const NO_EXPRESSIONS = 'no {…} expressions; use a code span (`…`) to show code.';

/** The bits of an mdast / MDX node the rules look at. */
type BodyNode = {
  type: string;
  depth?: number;
  name?: string | null;
  value?: unknown;
  position?: { start: { line: number } };
  attributes?: BodyNode[];
  children?: BodyNode[];
};

/** Every broken body rule, with its line in the body. Pure. */
export function lessonBodyProblems(tree: BodyNode): string[] {
  const problems: string[] = [];
  const walk = (node: BodyNode, line?: number) => {
    const at = `body line ${node.position?.start.line ?? line ?? '?'}`;
    switch (node.type) {
      case 'heading':
        if (node.depth === 1) {
          problems.push(
            `${at}: a "# " heading. Start at "##"; the page shows the title as the h1.`,
          );
        }
        break;
      case 'mdxjsEsm':
        problems.push(`${at}: import/export is not allowed in a lesson body.`);
        break;
      case 'mdxFlowExpression':
      case 'mdxTextExpression':
      case 'mdxJsxExpressionAttribute':
        problems.push(`${at}: ${NO_EXPRESSIONS}`);
        break;
      case 'mdxJsxAttribute':
        if ((node.value as BodyNode | null)?.type === 'mdxJsxAttributeValueExpression') {
          problems.push(`${at}: ${NO_EXPRESSIONS}`);
        }
        break;
      case 'mdxJsxFlowElement':
      case 'mdxJsxTextElement': {
        const name = node.name ?? '';
        if (/^[A-Z]/.test(name) && !ALLOWED_COMPONENTS.has(name)) {
          problems.push(`${at}: <${name}> is not allowed. Only <DialogBox> is.`);
        }
        if (BLOCKED_TAGS.has(name.toLowerCase())) {
          problems.push(`${at}: <${name}> is not allowed in a lesson body.`);
        }
        break;
      }
    }
    const here = node.position?.start.line ?? line;
    node.attributes?.forEach((a) => walk(a, here));
    node.children?.forEach((c) => walk(c, here));
  };
  walk(tree);
  return problems;
}

/** Remark plugin: fails the compile when a body rule is broken. */
function lessonRules() {
  return (tree: BodyNode) => {
    const problems = lessonBodyProblems(tree);
    if (problems.length) throw new Error(problems.join('\n'));
  };
}

/** For `content:check`: throws (bad MDX or a broken body rule) or resolves. */
export async function compileLesson(body: string): Promise<void> {
  await compile(body, { remarkPlugins: [lessonRules] });
}

/** One compile per body per request (generateMetadata and the page may both ask). */
const evaluateLesson = cache(async (body: string): Promise<MDXContent> => {
  const mod = await evaluate(body, {
    ...runtime,
    development: false,
    baseUrl: import.meta.url,
    remarkPlugins: [lessonRules],
  });
  return mod.default;
});

/** The rendered body, with the caller's components (DialogBox at least). */
export async function renderLesson(body: string, components: LessonComponents): Promise<ReactNode> {
  const Content = await evaluateLesson(body);
  return <Content components={components} />;
}
