'use client';

// Client: it holds the open step and moves focus. The lesson text arrives as
// server-rendered children; each <LessonStepSection> reads the open step from
// context, so the server HTML already shows step 1 only.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { XPBar } from '@/components/xp-bar';
import { LESSON_DONE_ID, QUEST_TEXT } from '@/lib/constants';
import type { BlogHeading } from '@/lib/types';

/** Which step is open (0-based), or every step. Without a stepper: every step. */
const StepContext = createContext<{ current: number; showAll: boolean }>({
  current: 0,
  showAll: true,
});

type SectionProps = {
  /** 1-based, as `lessonSteps` (lib/content/mdx.tsx) numbers it. */
  step: number;
  children?: ReactNode;
};

/**
 * One `##` section of a lesson. Hidden unless it is the open step or "Show
 * all" is on. With no JavaScript, LessonBody's <noscript> style shows them all.
 */
export function LessonStepSection({ step, children }: SectionProps) {
  const { current, showAll } = useContext(StepContext);
  return (
    <section className="lesson-step" data-step={step} hidden={!showAll && step - 1 !== current}>
      {children}
    </section>
  );
}

type Props = {
  /** The lesson's `##` headings in order (postHeadings): one step each. */
  steps: readonly BlogHeading[];
  /** The rendered lesson body: <LessonStepSection>s. */
  children: ReactNode;
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll an element to the top of the view, then focus it (or `target`) without a second jump. */
function bringIntoView(box: HTMLElement, target: HTMLElement) {
  box.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
  target.focus({ preventScroll: true });
}

/**
 * A lesson shown one step at a time (interactive-lessons spec, Phase 1):
 * a STEP n/N bar, Back / Continue (Finish on the last step) and Show all.
 * It never marks the lesson done: Finish only moves focus to that panel.
 * Styles: lesson.css.
 */
export function LessonStepper({ steps, children }: Props) {
  const [current, setCurrent] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [moved, setMoved] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const total = steps.length;
  const last = current === total - 1;

  // After a move (not on first render): the new step's top into view, focus on its heading.
  useEffect(() => {
    if (!moved) return;
    const section = body.current?.querySelector<HTMLElement>(`[data-step="${current + 1}"]`);
    const heading = section?.querySelector<HTMLElement>('h2');
    if (section && heading) bringIntoView(section, heading);
  }, [current, moved]);

  function go(index: number) {
    setCurrent(index);
    setMoved(true);
    setAnnouncement(QUEST_TEXT.stepAnnounce(index + 1, total, steps[index].text));
  }

  /** The "Lesson done" panel's first live control (or the panel itself). */
  function finish() {
    const panel = document.getElementById(LESSON_DONE_ID);
    if (!panel) return;
    const control = panel.querySelector<HTMLElement>('a[href], button:not([disabled])') ?? panel;
    bringIntoView(panel, control);
  }

  return (
    <StepContext value={{ current, showAll }}>
      <div
        className="lesson-steps"
        data-mode={showAll ? 'all' : 'steps'}
        data-moved={moved || undefined}
      >
        <div className="lesson-steps-head">
          {!showAll && (
            <XPBar
              className="lesson-steps-bar"
              label={QUEST_TEXT.stepLabel}
              value={current + 1}
              max={total}
              segments={total}
            />
          )}
          <PixelButton
            variant="ghost"
            size="sm"
            className="lesson-steps-toggle"
            onClick={() => setShowAll((all) => !all)}
          >
            {showAll ? QUEST_TEXT.showSteps : QUEST_TEXT.showAll}
          </PixelButton>
        </div>
        <div ref={body} className="lesson-body">
          {children}
        </div>
        {/* Always rendered (even empty): a live region must exist before its text changes. */}
        <p role="status" className="sr-only">
          {announcement}
        </p>
        {!showAll && (
          <div className="lesson-steps-controls">
            <PixelButton
              variant="secondary"
              disabled={current === 0}
              onClick={() => go(current - 1)}
            >
              {QUEST_TEXT.stepBack}
            </PixelButton>
            {last ? (
              <PixelButton onClick={finish}>{QUEST_TEXT.finish}</PixelButton>
            ) : (
              <PixelButton onClick={() => go(current + 1)}>{QUEST_TEXT.continue}</PixelButton>
            )}
          </div>
        )}
      </div>
    </StepContext>
  );
}
