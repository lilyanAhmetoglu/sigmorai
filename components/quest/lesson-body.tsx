import type { ComponentProps, ReactNode } from 'react';
import { DialogBox } from '@/components/dialog-box';
import { QUEST_TEXT } from '@/lib/constants';
import { renderLesson, type LessonComponents } from '@/lib/content/mdx';

type Props = {
  /** The MDX body, from the lesson loader. Starts at `##`. */
  body: string;
  /** The realm's NPC: the only speaker a <DialogBox> in the body can have. */
  npc: string;
};

/** What the body's tags render as. <DialogBox> always speaks as the realm's NPC. */
function lessonComponents(npc: string): LessonComponents {
  return {
    DialogBox: ({ children }: { children?: ReactNode }) => (
      <DialogBox speaker={npc}>{children}</DialogBox>
    ),
    // A focusable, named region, so a keyboard user can scroll a wide code block sideways.
    pre: (props: ComponentProps<'pre'>) => (
      <pre tabIndex={0} role="region" aria-label={QUEST_TEXT.codeExample} {...props} />
    ),
  };
}

/**
 * A lesson's text (Sigmorai App.dc.html → tabLesson). Server only: the MDX is
 * compiled here, so no MDX code reaches the browser. Styles: lesson.css.
 */
export async function LessonBody({ body, npc }: Props) {
  return <div className="lesson-body">{await renderLesson(body, lessonComponents(npc))}</div>;
}
