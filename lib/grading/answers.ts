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
 * What the learner sees per question. Only with `reveal` (a pass, or a replay
 * of a cleared exercise): every option with its explanation, in display
 * order. A first-time fail gets null, so the action returns only "N of M
 * right" and a throwaway account can't farm the key (SIG-27).
 */
export function answerFeedback(
  questions: readonly Question[],
  graded: GradedAnswers,
  reveal: boolean,
): QuestionFeedback[] | null {
  if (!reveal) return null;
  return questions.map((question, q) => {
    const { text, explanation } = question.options[graded.original[q]];
    return {
      correct: graded.correct[q],
      picked: { text, explanation },
      options: graded.order[q].map((o) => {
        const option = question.options[o];
        return { text: option.text, explanation: option.explanation, correct: option.correct };
      }),
    };
  });
}

/** "N of M correct": the only per-attempt detail a first-time fail returns. */
export function rightCount(graded: GradedAnswers): { right: number; total: number } {
  return { right: graded.correct.filter(Boolean).length, total: graded.correct.length };
}
