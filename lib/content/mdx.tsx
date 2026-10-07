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
 *   - the only component is <DialogBox> (a blog post: none at all, see
 *     `allowedComponents`);
 *   - a lowercase tag must be on ALLOWED_TAGS (text and table tags only: no
 *     <script>, <style>, <iframe>, <img>, <form>…), with only SAFE_ATTRIBUTES;
 *   - every link is https:, relative or #anchor (no javascript:, data:, http:);
 *   - no images: no lesson needs one yet (SIG-27).
 * The components themselves are passed in by the caller (components/quest).
 * A lesson (not a blog post) is then grouped into steps (`lessonSteps`).
 */

/** The one component a lesson body may use. The renderer must supply it. */
export const LESSON_COMPONENTS = ['DialogBox'] as const;

/** A blog post body: plain Markdown only, so no NPC <DialogBox>. */
export const NO_COMPONENTS = [] as const;

/**
 * The element `lessonSteps` wraps each `##` section of a lesson in
 * (interactive-lessons spec, Phase 1). An author can never write it: the body
 * rules run first and refuse any component not on the allowlist.
 */
export const LESSON_STEP = 'LessonStep';
/** What a lesson renderer must supply: the step wrapper, plus any allowed component. */
export type StepComponents = Record<typeof LESSON_STEP, MDXComponents[string]> & MDXComponents;

/** A lesson is grouped into steps; a blog post stays one plain page with no components. */
export type BodyKind = 'lesson' | 'blog';

/** Which components a body may use. Defaults to the lesson's. */
export type BodyOptions = { allowedComponents?: readonly string[] };
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
export function lessonBodyProblems(
  tree: BodyNode,
  { allowedComponents = LESSON_COMPONENTS }: BodyOptions = {},
): string[] {
  const allowed = new Set(allowedComponents);
  const only = allowedComponents.length
    ? `Only ${allowedComponents.map((c) => `<${c}>`).join(', ')} ${allowedComponents.length > 1 ? 'are' : 'is'}.`
    : 'No components are.';
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
          if (!allowed.has(name)) {
            problems.push(`${at}: <${name}> is not allowed. ${only}`);
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
function lessonRules(options: BodyOptions) {
  return () => (tree: BodyNode) => {
    const problems = lessonBodyProblems(tree, options);
    if (problems.length) throw new Error(problems.join('\n'));
  };
}

/** For `content:check`: throws (bad MDX or a broken body rule) or resolves. */
export async function compileLesson(body: string, options: BodyOptions = {}): Promise<void> {
  await compile(body, { remarkPlugins: [lessonRules(options)] });
}

/** The mdast node `lessonSteps` makes: a <LessonStep step="n"> around one section. */
function stepNode(step: number, children: BodyNode[]): BodyNode {
  return {
    type: 'mdxJsxFlowElement',
    name: LESSON_STEP,
    attributes: [{ type: 'mdxJsxAttribute', name: 'step', value: String(step) }],
    children,
  };
}

/**
 * Remark plugin, lessons only, run after the body rules: one <LessonStep
 * step="n"> (1-based) per top-level `##` heading and everything up to the
 * next one. Text before the first `##` (the intro) joins step 1. A body with
 * no `##` is left as it is. Nothing is added or dropped, only grouped. The
 * page counts the same headings with postHeadings (lib/content/blog.ts).
 */
export function lessonSteps() {
  return (tree: BodyNode) => {
    const children = tree.children ?? [];
    const starts = children.flatMap((node, i) =>
      node.type === 'heading' && node.depth === 2 ? [i] : [],
    );
    if (starts.length === 0) return;
    tree.children = starts.map((start, i) =>
      stepNode(i + 1, children.slice(i === 0 ? 0 : start, starts[i + 1] ?? children.length)),
    );
  };
}

/**
 * One compile per body per request (generateMetadata and the page may both
 * ask). `allowed` is a joined string so the cache key is a value, not an array.
 */
const evaluateLesson = cache(
  async (body: string, allowed: string, kind: BodyKind): Promise<MDXContent> => {
    const allowedComponents = allowed ? allowed.split(',') : [];
    const mod = await evaluate(body, {
      ...runtime,
      development: false,
      baseUrl: import.meta.url,
      remarkPlugins: [
        lessonRules({ allowedComponents }),
        ...(kind === 'lesson' ? [lessonSteps] : []),
      ],
    });
    return mod.default;
  },
);

/**
 * A lesson body, grouped into steps. `components` must supply LessonStep and
 * every allowed component (DialogBox for a realm lesson; a Frontier lesson
 * has no NPC, so it passes NO_COMPONENTS).
 */
export async function renderLesson(
  body: string,
  components: StepComponents,
  options: { kind: 'lesson'; allowedComponents?: readonly string[] },
): Promise<ReactNode>;
/** A blog post body: plain Markdown, no components, no steps. */
export async function renderLesson(
  body: string,
  components: MDXComponents,
  options: { kind: 'blog' },
): Promise<ReactNode>;
export async function renderLesson(
  body: string,
  components: MDXComponents,
  options: { kind: BodyKind; allowedComponents?: readonly string[] },
): Promise<ReactNode> {
  const allowed =
    options.kind === 'blog' ? NO_COMPONENTS : (options.allowedComponents ?? LESSON_COMPONENTS);
  const Content = await evaluateLesson(body, allowed.join(','), options.kind);
  return <Content components={components} />;
}
