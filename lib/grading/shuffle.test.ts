import { describe, expect, test } from 'bun:test';
import { isSeed, newSeed, shuffleOrder, shuffleQuestions, toOriginalAnswers } from './shuffle';

const SEED_A = '0123456789abcdef0123456789abcdef';
const SEED_B = 'fedcba9876543210fedcba9876543210';
const COUNTS = [4, 4, 4, 4, 4];

describe('newSeed', () => {
  test('32 lowercase hex characters, different each time', () => {
    const a = newSeed();
    expect(isSeed(a)).toBe(true);
    expect(newSeed()).not.toBe(a);
  });
});

describe('shuffleOrder', () => {
  test('same seed → same order', () => {
    expect(shuffleOrder(SEED_A, COUNTS)).toEqual(shuffleOrder(SEED_A, COUNTS));
  });

  test('different seeds → different orders', () => {
    expect(shuffleOrder(SEED_A, COUNTS)).not.toEqual(shuffleOrder(SEED_B, COUNTS));
  });

  test('each order is a permutation of the option indexes', () => {
    for (const order of shuffleOrder(SEED_A, [2, 3, 4, 6])) {
      expect([...order].sort((x, y) => x - y)).toEqual(order.map((_, i) => i));
    }
  });

  test('the correct option lands in every position across seeds', () => {
    const positions = new Set<number>();
    for (let i = 0; i < 200; i += 1) positions.add(shuffleOrder(newSeed(), [4])[0].indexOf(0));
    expect([...positions].sort()).toEqual([0, 1, 2, 3]);
  });

  test('a bad seed throws', () => {
    expect(() => shuffleOrder('xyz', COUNTS)).toThrow();
    expect(() => shuffleOrder(SEED_A.toUpperCase(), COUNTS)).toThrow();
  });
});

describe('index mapping', () => {
  const questions = [
    { prompt: 'q1', options: ['a', 'b', 'c', 'd'] },
    { prompt: 'q2', options: ['e', 'f', 'g', 'h'] },
  ];

  test('a picked display index maps back to the same option', () => {
    const { questions: shown, order } = shuffleQuestions(questions, SEED_A);
    const picks = [2, 0];
    const original = toOriginalAnswers(order, picks);
    expect(original).not.toBeNull();
    original!.forEach((o, q) => expect(questions[q].options[o]).toBe(shown[q].options[picks[q]]));
  });

  test('the action re-shuffles the same order from the seed', () => {
    const page = shuffleQuestions(questions, SEED_A).order;
    const action = shuffleOrder(SEED_A, [4, 4]);
    expect(action).toEqual(page);
  });

  test('the wrong count or an out-of-range index is rejected', () => {
    const order = shuffleOrder(SEED_A, [4, 4]);
    expect(toOriginalAnswers(order, [0])).toBeNull();
    expect(toOriginalAnswers(order, [0, 1, 2])).toBeNull();
    expect(toOriginalAnswers(order, [0, 4])).toBeNull();
    expect(toOriginalAnswers(order, [-1, 0])).toBeNull();
    expect(toOriginalAnswers(order, [0.5, 0])).toBeNull();
  });

  test('the source questions are not mutated', () => {
    shuffleQuestions(questions, SEED_B);
    expect(questions[0].options).toEqual(['a', 'b', 'c', 'd']);
  });
});
