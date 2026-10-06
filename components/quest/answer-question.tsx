'use client';

import { Choice, ChoiceGroup } from '@/components/choice';
import type { ChoiceState, PublicQuestion, QuestionFeedback } from '@/lib/types';

type Props = {
  number: number;
  question: PublicQuestion;
  /** Radio group name, unique per attempt. */
  name: string;
  picked: number | null;
  disabled: boolean;
  onPick: (option: number) => void;
  /** After a pass or a replay only. A first-time fail sends none (SIG-27), so nothing is marked. */
  feedback?: QuestionFeedback;
};

/**
 * One question: its options as radios. After a pass (or a replay) the picked
 * option shows "✓ Correct" or "✗ Wrong" (Choice mark: text + icon, not colour
 * only), every option shows why, and the correct one is marked. After a
 * first-time fail there is no feedback: the form shows only "N of M correct".
 */
export function AnswerQuestion({
  number,
  question,
  name,
  picked,
  disabled,
  onPick,
  feedback,
}: Props) {
  const stateOf = (option: number): ChoiceState | undefined => {
    if (!feedback) return undefined;
    if (option === picked) return feedback.correct ? 'correct' : 'wrong';
    return feedback.options[option]?.correct ? 'correct' : undefined;
  };
  const whyOf = (option: number): string | undefined => feedback?.options[option]?.explanation;

  return (
    <ChoiceGroup label={`${number}. ${question.prompt}`} disabled={disabled}>
      {question.options.map((option, i) => (
        <Choice
          key={i}
          name={name}
          value={i}
          checked={picked === i}
          onChange={() => onPick(i)}
          state={stateOf(i)}
          label={option.text}
          hint={whyOf(i)}
        />
      ))}
    </ChoiceGroup>
  );
}
