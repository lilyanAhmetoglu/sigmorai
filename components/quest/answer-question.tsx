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
  /** After submit. Without `feedback.options` (a fail), only the pick is explained. */
  feedback?: QuestionFeedback;
};

/**
 * One question: its options as radios. After submit the picked option shows
 * "✓ Correct" or "✗ Wrong" (Choice mark: text + icon, not colour only), with
 * its explanation as the radio's description. On a fail only the picked
 * option is marked and explained, so the correct one is never shown. After a
 * pass every option shows why, and the correct one is marked.
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
    return feedback.options?.[option]?.correct ? 'correct' : undefined;
  };
  const whyOf = (option: number): string | undefined => {
    if (!feedback) return undefined;
    if (feedback.options) return feedback.options[option]?.explanation;
    return option === picked ? feedback.picked.explanation : undefined;
  };

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
