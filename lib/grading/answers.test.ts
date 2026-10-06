import { describe, expect, test } from 'bun:test';
import type { Question } from '@/lib/types';
import { answerFeedback, gradeAnswers, rightCount, type GradedAnswers } from './answers';
import { shuffleOrder } from './shuffle';

const SEED = '0123456789abcdef0123456789abcdef';

/** Four options per question; `right` is the original index of the correct one. */
const question = (n: number, right: number): Question => ({
  prompt: `Question ${n}`,
  options: [0, 1, 2, 3].map((i) => ({
    text: `q${n} option ${i}`,
    explanation: `why q${n} option ${i}`,
    correct: i === right,
  })),
});
const QUESTIONS = [question(1, 0), question(2, 2), question(3, 3)];
const ORDER = shuffleOrder(SEED, [4, 4, 4]);

/** The display index of an original option, as the learner would click it. */
const shown = (q: number, original: number) => ORDER[q].indexOf(original);
const RIGHT = [shown(0, 0), shown(1, 2), shown(2, 3)];
const ONE_WRONG = [shown(0, 0), shown(1, 1), shown(2, 3)];

function graded(answers: number[]): GradedAnswers {
  const result = gradeAnswers(QUESTIONS, SEED, answers);
  if (!result.ok) throw new Error('expected a graded result');
  return result;
}

describe('gradeAnswers', () => {
  test('all right (after mapping display → original) passes', () => {
    const result = graded(RIGHT);
    expect(result.passed).toBe(true);
    expect(result.original).toEqual([0, 2, 3]);
    expect(result.order).toEqual(ORDER);
  });

  test('one wrong fails, and says which', () => {
    const result = graded(ONE_WRONG);
    expect(result.passed).toBe(false);
    expect(result.correct).toEqual([true, false, true]);
  });

  test('a wrong answer count or an index out of range is INVALID_INPUT', () => {
    expect(gradeAnswers(QUESTIONS, SEED, [0, 0])).toMatchObject({ code: 'INVALID_INPUT' });
    expect(gradeAnswers(QUESTIONS, SEED, [0, 0, 0, 0])).toMatchObject({ code: 'INVALID_INPUT' });
    expect(gradeAnswers(QUESTIONS, SEED, [0, 0, 4])).toMatchObject({ code: 'INVALID_INPUT' });
  });
});

describe('answerFeedback (SIG-27)', () => {
  test('a first-time fail returns nothing per question: no flags, no explanations', () => {
    expect(answerFeedback(QUESTIONS, graded(ONE_WRONG), false)).toBeNull();
  });

  test('a fail on a replay (reveal) shows every option, like a pass', () => {
    const feedback = answerFeedback(QUESTIONS, graded(ONE_WRONG), true)!;
    expect(feedback.map((q) => q.correct)).toEqual([true, false, true]);
    expect(feedback[1].picked).toEqual({ text: 'q2 option 1', explanation: 'why q2 option 1' });
    expect(feedback[1].options).toHaveLength(4);
  });

  test('a pass shows every explanation, in display order', () => {
    const feedback = answerFeedback(QUESTIONS, graded(RIGHT), true)!;
    feedback.forEach((q, i) => {
      expect(q.correct).toBe(true);
      expect(q.options).toHaveLength(4);
      expect(q.options.map((o) => o.text)).toEqual(
        ORDER[i].map((o) => QUESTIONS[i].options[o].text),
      );
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
    });
  });
});

describe('rightCount', () => {
  test('counts right answers only: "N of M correct", nothing about which', () => {
    expect(rightCount(graded(ONE_WRONG))).toEqual({ right: 2, total: 3 });
    expect(rightCount(graded(RIGHT))).toEqual({ right: 3, total: 3 });
  });
});
