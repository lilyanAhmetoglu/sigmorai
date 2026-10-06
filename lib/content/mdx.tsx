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
 *   - the only component is <DialogBox>;
 *   - a lowercase tag must be on ALLOWED_TAGS (text and table tags only: no
 *     <script>, <style>, <iframe>, <img>, <form>…), with only SAFE_ATTRIBUTES;
 *   - every link is https:, relative or #anchor (no javascript:, data:, http:);
 *   - no images: no lesson needs one yet (SIG-27).
 * The components themselves are passed in by the caller (components/quest).
 */

/** The one component a lesson body may use. The renderer must supply it. */
export const LESSON_COMPONENTS = ['DialogBox'] as const;
export type LessonComponents = Record<(typeof LESSON_COMPONENTS)[number], MDXComponents[string]> &
  MDXComponents;

const ALLOWED_COMPONENTS: ReadonlySet<string> = new Set(LESSON_COMPONENTS);
/**
 * The only lowercase tags a body may write as JSX (SIG-27: an allowlist, not
 * a blocklist). Markdown itself only makes these. Anything else, such as
 * <script>, <img>, <form> or <object>, fails the compile.
 */
const ALLOWED_TAGS: ReadonlySet<string> = new Set([
  'p',
  'a',
  'ul',
  'ol',
  'li',
  'code',
  'pre',
  'em',
  'strong',
  'blockquote',
  'h2',
  'h3',
  'h4',
  'hr',
  'br',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]);
/** Attributes a lowercase tag may carry. No on*, style, src, id (DOM clobbering) or ping. */
const SAFE_ATTRIBUTES: ReadonlySet<string> = new Set([
  'href',
  'title',
  'lang',
  'dir',
  'colSpan',
  'rowSpan',
  'scope',
  'start',
]);

/**
 * A link a lesson may hold: https:, a relative path, or a #anchor. Browsers
 * drop tabs, newlines and control characters inside a scheme
 * ("java\nscript:"), so they are removed before the check. "//host" is
 * refused: write the https: URL.
 */
export function isSafeLessonUrl(raw: string): boolean {
  const url = raw.replace(/[\u0000-\u0020\u007f]/g, '');
  if (url.startsWith('//') || url.startsWith('\\') || url.startsWith('/\\')) return false;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(url);
  return scheme ? scheme[1].toLowerCase() === 'https' : true;
}
const NO_EXPRESSIONS = 'no {…} expressions; use a code span (`…`) to show code.';

/** The bits of an mdast / MDX node the rules look at. */
type BodyNode = {
  type: string;
  depth?: number;
  name?: string | null;
  value?: unknown;
  url?: string;
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
      case 'link':
      case 'definition':
        if (!isSafeLessonUrl(node.url ?? '')) {
          problems.push(`${at}: the link "${node.url}" is not allowed. Use https:, a path or #.`);
        }
        break;
      case 'image':
      case 'imageReference':
        problems.push(`${at}: images are not allowed in a lesson body.`);
        break;
      case 'mdxJsxFlowElement':
      case 'mdxJsxTextElement': {
        // A fragment (<>…</>) has no name and renders nothing of its own.
        if (node.name == null) break;
        const name = node.name;
        if (/^[A-Z]/.test(name)) {
          if (!ALLOWED_COMPONENTS.has(name)) {
            problems.push(`${at}: <${name}> is not allowed. Only <DialogBox> is.`);
          }
        } else if (!ALLOWED_TAGS.has(name)) {
          problems.push(`${at}: <${name}> is not allowed in a lesson body.`);
        } else {
          problems.push(...tagAttributeProblems(node, at));
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

/** A lowercase tag's attributes: only SAFE_ATTRIBUTES, and an href must be a safe URL. */
function tagAttributeProblems(node: BodyNode, at: string): string[] {
  const problems: string[] = [];
  for (const attribute of node.attributes ?? []) {
    // Spread attributes ({...x}) are expressions: the walk reports them.
    if (attribute.type !== 'mdxJsxAttribute') continue;
    const name = attribute.name ?? '';
    if (!SAFE_ATTRIBUTES.has(name)) {
      problems.push(`${at}: the attribute "${name}" on <${node.name}> is not allowed.`);
    } else if (
      name === 'href' &&
      (typeof attribute.value !== 'string' || !isSafeLessonUrl(attribute.value))
    ) {
      problems.push(`${at}: the link on <${node.name}> is not allowed. Use https:, a path or #.`);
    }
  }
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
