import { isValidElement, type ComponentProps, type ReactNode } from 'react';
import { DialogBox } from '@/components/dialog-box';
import { QUEST_TEXT } from '@/lib/constants';
import { headingId } from '@/lib/content/headings';
import { NO_COMPONENTS, renderLesson, type LessonComponents } from '@/lib/content/mdx';

type Props = {
  /** The MDX body, from the lesson or blog loader. Starts at `##`. */
  body: string;
  /**
   * The realm's NPC: the only speaker a <DialogBox> in the body can have.
   * Leave it out for a blog post: then the body may use no component at all.
   */
  npc?: string;
};

/** A focusable, named region, so a keyboard user can scroll a wide code block sideways. */
const pre = (props: ComponentProps<'pre'>) => (
  <pre tabIndex={0} role="region" aria-label={QUEST_TEXT.codeExample} {...props} />
);

/** The visible text of rendered children (a heading with `code` or a link inside). */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

/**
 * A blog post's `##` heading, with the anchor the "On this page" list links
 * to (lib/content/blog.ts → postHeadings uses the same headingId).
 */
const h2 = ({ children, ...props }: ComponentProps<'h2'>) => (
  <h2 {...props} id={headingId(textOf(children).replace(/\s+/g, ' ').trim())}>
    {children}
  </h2>
);

/** What the body's tags render as. <DialogBox> always speaks as the realm's NPC. */
function lessonComponents(npc: string): LessonComponents {
  return {
    DialogBox: ({ children }: { children?: ReactNode }) => (
      <DialogBox speaker={npc}>{children}</DialogBox>
    ),
    pre,
  };
}

/**
 * A lesson's text (Sigmorai App.dc.html → tabLesson), or a blog post's.
 * Server only: the MDX is compiled here, so no MDX code reaches the browser.
 * Styles: lesson.css.
 */
export async function LessonBody({ body, npc }: Props) {
  const content =
    npc === undefined
      ? await renderLesson(body, { pre, h2 }, { allowedComponents: NO_COMPONENTS })
      : await renderLesson(body, lessonComponents(npc));
  return <div className="lesson-body">{content}</div>;
}
