import { useId, type ComponentProps, type ReactNode } from 'react';
import { CHOICE_STATE_TEXT } from '@/lib/constants';
import type { ChoiceState } from '@/lib/types';
import { cn } from '@/lib/utils';

type ChoiceProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Answer text. ReactNode so it can hold inline code. The input's accessible name. */
  label: ReactNode;
  /** Extra line under the answer (e.g. why it is right or wrong). Read as the description. */
  hint?: ReactNode;
  /**
   * Radio for one answer (give every row in a group the same `name`), checkbox for many.
   * Radio is the default on purpose: quiz questions are single-answer.
   */
  type?: 'radio' | 'checkbox';
  /** Graded mark after submit. Shown as colour AND an icon + word. */
  state?: ChoiceState;
};

/**
 * One answer row for quizzes and settings: a real radio/checkbox inside its
 * label. The input is named by the answer text only (aria-labelledby), so the
 * hint and the mark don't blur its name. Styles: choice.css.
 */
export function Choice({ label, hint, type = 'radio', state, className, ...rest }: ChoiceProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const markId = `${id}-mark`;
  const describedBy = [hint ? hintId : null, state ? markId : null].filter(Boolean).join(' ');
  return (
    <label className={cn('choice', className)} data-state={state}>
      <input
        type={type}
        className="choice-input"
        aria-labelledby={labelId}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      <span className="choice-label">
        <span id={labelId}>{label}</span>
        {hint && (
          <span id={hintId} className="choice-hint">
            {hint}
          </span>
        )}
      </span>
      {state && (
        <span id={markId} className="choice-mark">
          {CHOICE_STATE_TEXT[state]}
        </span>
      )}
    </label>
  );
}

type GroupProps = ComponentProps<'fieldset'> & {
  /** The question. Becomes the group's accessible name. */
  label: string;
};

/** Native fieldset + legend around Choice rows, so the group has a name. Styles: choice.css. */
export function ChoiceGroup({ label, className, children, ...rest }: GroupProps) {
  return (
    <fieldset className={cn('choice-group', className)} {...rest}>
      <legend className="choice-group-legend">{label}</legend>
      {children}
    </fieldset>
  );
}
