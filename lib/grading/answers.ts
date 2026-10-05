import type { Question, QuestFailure, QuestionFeedback } from '@/lib/types';
import { questFailure } from './failure';
import { shuffleOrder, toOriginalAnswers, type OptionOrder } from './shuffle';

/**
 * Grading an answer set (case or quick check). Pure: no IO, so every rule has
 * a bun test. The browser sends display indexes; this re-shuffles from the
 * seed, maps each one back, and grades. Pass = every question right.
 */

export type GradedAnswers = {
  ok: true;
  passed: boolean;
  /** Display → original, per question. Stored with the submission. */
  order: OptionOrder;
  /** The picked ORIGINAL indexes. Stored with the submission. */
  original: number[];
  /** Per question. */
  correct: boolean[];
};

export function gradeAnswers(
  questions: readonly Question[],
  seed: string,
  displayAnswers: readonly number[],
): GradedAnswers | QuestFailure {
  const order = shuffleOrder(
    seed,
    questions.map((q) => q.options.length),
  );
  const original = toOriginalAnswers(order, displayAnswers);
  if (!original) return questFailure('INVALID_INPUT');
  const correct = original.map((o, q) => questions[q].options[o].correct);
  return { ok: true, passed: correct.every(Boolean), order, original, correct };
}

/**
 * What the learner sees per question. `reveal` (a pass, or a replay of a
 * cleared exercise) adds every option with its explanation, in display
 * order. Without it, only the picked option's explanation leaves the server.
 */
export function answerFeedback(
  questions: readonly Question[],
  graded: GradedAnswers,
  reveal: boolean,
): QuestionFeedback[] {
  return questions.map((question, q) => {
    const { text, explanation } = question.options[graded.original[q]];
    const feedback: QuestionFeedback = {
      correct: graded.correct[q],
      picked: { text, explanation },
    };
    if (reveal) {
      feedback.options = graded.order[q].map((o) => {
        const option = question.options[o];
        return { text: option.text, explanation: option.explanation, correct: option.correct };
      });
    }
    return feedback;
  });
}
