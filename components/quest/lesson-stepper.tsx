'use client';

// Client: it holds the open step and moves focus. The lesson text arrives as
// server-rendered children; each <LessonStepSection> reads the open step from
// context, so the server HTML already shows step 1 only.
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { PixelButton } from '@/components/pixel-button';
import { XPBar } from '@/components/xp-bar';
import { QUEST_TEXT } from '@/lib/constants';
import type { Accent, BlogHeading } from '@/lib/types';
import { bringIntoView, useLessonFinish } from './lesson-finish';

type StepState = {
  /** The open step, 0-based. */
  current: number;
  showAll: boolean;
  /** Each step's heading id (postHeadings), so a section is named by its `##`. */
  headingIds: readonly string[];
  /** The browser supports hidden="until-found", so find-in-page can open a hidden step. */
  untilFound: boolean;
};

/** Without a stepper (fewer than LESSON_MIN_STEPS): every step shows, nothing is named or focusable. */
const StepContext = createContext<StepState>({
  current: 0,
  showAll: true,
  headingIds: [],
  untilFound: false,
});

/** Whether hidden="until-found" works here. The server (and hydration) says no. */
const noSubscribe = () => () => {};
const supportsUntilFound = () => 'onbeforematch' in document.body;
const onServer = () => false;

type SectionProps = {
  /** 1-based, as `lessonSteps` (lib/content/mdx.tsx) numbers it. */
  step: number;
  children?: ReactNode;
};

/**
 * One `##` section of a lesson, named by its heading and focusable (a step
 * move focuses it, so Back to step 1 includes the intro). Hidden unless it is
 * the open step or "Show all" is on. With no JavaScript, LessonBody's
 * <noscript> style shows them all.
 *
 * React writes `hidden` as a boolean only (hidden=""), never "until-found".
 * So where the browser supports until-found, React passes no `hidden` and the
 * layout effect owns the attribute (set before paint). Elsewhere, and in the
 * server HTML, it is the plain boolean.
 */
export function LessonStepSection({ step, children }: SectionProps) {
  const { current, showAll, headingIds, untilFound } = useContext(StepContext);
  const ref = useRef<HTMLElement>(null);
  const isHidden = !showAll && step - 1 !== current;
  const labelId = headingIds[step - 1];

  useLayoutEffect(() => {
    const section = ref.current;
    if (!untilFound || !section) return;
    if (isHidden) section.setAttribute('hidden', 'until-found');
    else section.removeAttribute('hidden');
  }, [untilFound, isHidden]);

  return (
    <section
      ref={ref}
      className="lesson-step"
      data-step={step}
      tabIndex={labelId ? -1 : undefined}
      aria-labelledby={labelId}
      hidden={untilFound ? undefined : isHidden}
    >
      {children}
    </section>
  );
}

type Props = {
  /** The lesson's `##` headings in order (postHeadings): one step each. */
  steps: readonly BlogHeading[];
  /** The realm (or tower) colour of the page: the bar's lit cells. */
  accent?: Accent;
  /** The rendered lesson body: <LessonStepSection>s. */
  children: ReactNode;
};

/**
 * A lesson shown one step at a time (interactive-lessons spec, Phase 1):
 * a STEP n/N bar, Back / Continue ("Finish lesson" on the last step) and
 * Show all. Finish lesson is the same press as the "Lesson done" panel's
 * button (LessonFinishProvider): it marks the lesson done once, then the panel
 * shows the result and Continue. On a replay it only shows that panel.
 * Styles: lesson.css.
 */
export function LessonStepper({ steps, accent, children }: Props) {
  const [current, setCurrent] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [moved, setMoved] = useState(false);
  const lesson = useLessonFinish();
  const untilFound = useSyncExternalStore(noSubscribe, supportsUntilFound, onServer);
  const body = useRef<HTMLDivElement>(null);
  /** Set by Back / Continue only: find-in-page opens a step without moving focus. */
  const focusNext = useRef(false);
  const total = steps.length;
  const last = current === total - 1;

  // After Back / Continue: the new step's top into view, focus on the step.
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const section = body.current?.querySelector<HTMLElement>(`[data-step="${current + 1}"]`);
    if (section) bringIntoView(section, section, 'start');
  }, [current]);

  // Find-in-page matched text in a hidden step: open that step (the browser scrolls to the match).
  useEffect(() => {
    const root = body.current;
    if (!root) return;
    const open = (event: Event) => {
      const step = Number(
        (event.target as Element).closest('[data-step]')?.getAttribute('data-step'),
      );
      if (!(step >= 1 && step <= total)) return;
      setCurrent(step - 1);
      setAnnouncement(QUEST_TEXT.stepAnnounce(step, total));
    };
    root.addEventListener('beforematch', open);
    return () => root.removeEventListener('beforematch', open);
  }, [total]);

  function go(index: number) {
    focusNext.current = true;
    setCurrent(index);
    setMoved(true);
    setAnnouncement(QUEST_TEXT.stepAnnounce(index + 1, total));
  }

  function toggleShowAll() {
    setMoved(false);
    setShowAll(!showAll);
    setAnnouncement(
      showAll ? QUEST_TEXT.stepAnnounce(current + 1, total) : QUEST_TEXT.allShown(total),
    );
  }

  return (
    <StepContext value={{ current, showAll, headingIds: steps.map((step) => step.id), untilFound }}>
      <div
        className="lesson-steps"
        data-mode={showAll ? 'all' : 'steps'}
        data-moved={moved || undefined}
      >
        <div className="lesson-steps-head">
          {!showAll && (
            <XPBar
              className="lesson-steps-bar"
              accent={accent}
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
            onClick={toggleShowAll}
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
              lesson && (
                <PixelButton
                  // While saving it stays focusable (aria-disabled); finish() → press() ignores the click.
                  aria-disabled={lesson.pending || undefined}
                  onClick={lesson.finish}
                >
                  {lesson.pending ? QUEST_TEXT.saving : QUEST_TEXT.finish}
                </PixelButton>
              )
            ) : (
              <PixelButton onClick={() => go(current + 1)}>{QUEST_TEXT.continue}</PixelButton>
            )}
          </div>
        )}
      </div>
    </StepContext>
  );
}
