import { isValidElement, type ComponentProps, type ReactNode } from 'react';
import { DialogBox } from '@/components/dialog-box';
import { LESSON_MIN_STEPS, QUEST_TEXT } from '@/lib/constants';
import { postHeadings } from '@/lib/content/blog';
import { headingId } from '@/lib/content/headings';
import {
  LESSON_COMPONENTS,
  NO_COMPONENTS,
  renderLesson,
  type BodyKind,
  type StepComponents,
} from '@/lib/content/mdx';
import type { Accent } from '@/lib/types';
import { LessonStepSection, LessonStepper } from './lesson-stepper';

type Props = {
  /** The MDX body, from the lesson or blog loader. Starts at `##`. */
  body: string;
  /** A lesson (realm, Math Tower or Frontier) is shown in steps; a blog post is one plain page. */
  kind: BodyKind;
  /**
   * The lesson's NPC: the only speaker a <DialogBox> in the body can have.
   * A Frontier lesson has none: then the body may use no component at all.
   */
  npc?: string;
  /** A lesson's realm (or tower) colour: the step bar's lit cells. */
  accent?: Accent;
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
 * A `##` heading with its anchor id: the blog's "On this page" links and a
 * lesson step's name (aria-labelledby) both use it (lib/content/blog.ts →
 * postHeadings uses the same headingId).
 */
const h2 = ({ children, ...props }: ComponentProps<'h2'>) => (
  <h2 {...props} id={headingId(textOf(children).replace(/\s+/g, ' ').trim())}>
    {children}
  </h2>
);

/** One step of a lesson (lib/content/mdx.tsx → lessonSteps), numbered from 1. */
const LessonStep = ({ step, children }: { step?: string; children?: ReactNode }) => (
  <LessonStepSection step={Number(step)}>{children}</LessonStepSection>
);

/**
 * With no JavaScript every step shows and the step controls hide. It sits in
 * @layer base, beside Tailwind's preflight `[hidden] { display: none !important }`,
 * so the more specific selector wins (an unlayered !important would lose).
 * content-visibility undoes hidden="until-found"; the margin replaces the
 * steps mode's missing gap (lesson.css).
 */
const NO_SCRIPT_STEPS =
  '@layer base { .lesson-steps .lesson-step[hidden] { display: flex !important; content-visibility: visible !important; } ' +
  '.lesson-steps .lesson-step + .lesson-step { margin-top: calc(var(--spacing) * 4); } ' +
  '.lesson-steps .lesson-steps-head, .lesson-steps .lesson-steps-controls { display: none !important; } }';

/** What a lesson's tags render as. <DialogBox> always speaks as the lesson's NPC. */
function lessonComponents(npc: string | undefined): StepComponents {
  return {
    ...(npc !== undefined && {
      DialogBox: ({ children }: { children?: ReactNode }) => (
        <DialogBox speaker={npc}>{children}</DialogBox>
      ),
    }),
    LessonStep,
    pre,
    h2,
  };
}

/**
 * A lesson's text (Sigmorai App.dc.html → tabLesson), or a blog post's.
 * Server only: the MDX is compiled here, so no MDX code reaches the browser.
 * A lesson with LESSON_MIN_STEPS or more `##` sections is shown one step at
 * a time (interactive-lessons spec, Phase 1). Styles: lesson.css.
 */
export async function LessonBody({ body, kind, npc, accent }: Props) {
  if (kind === 'blog') {
    const content = await renderLesson(body, { pre, h2 }, { kind: 'blog' });
    return <div className="lesson-body">{content}</div>;
  }
  const content = await renderLesson(body, lessonComponents(npc), {
    kind: 'lesson',
    allowedComponents: npc === undefined ? NO_COMPONENTS : LESSON_COMPONENTS,
  });
  const steps = postHeadings(body);
  if (steps.length < LESSON_MIN_STEPS) return <div className="lesson-body">{content}</div>;
  return (
    <>
      <noscript>
        <style>{NO_SCRIPT_STEPS}</style>
      </noscript>
      <LessonStepper steps={steps} accent={accent}>
        {content}
      </LessonStepper>
    </>
  );
}
