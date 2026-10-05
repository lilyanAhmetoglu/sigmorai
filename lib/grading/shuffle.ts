import { SHUFFLE_SEED_BYTES, SHUFFLE_SEED_PATTERN } from '@/lib/constants';

/**
 * The seeded option shuffle (quest-actions spec → The shuffle seed). The quest
 * page makes a random seed and shows each question's options in the order it
 * gives; the Server Action re-shuffles from the same seed and maps each picked
 * display index back to the original. So "the answer is B" can't be shared.
 * Pure and deterministic: same seed + same option counts → same order.
 *
 * `order[q][display] = original index` of question q's option at that position.
 */
export type OptionOrder = number[][];

/** A fresh seed: SHUFFLE_SEED_BYTES random bytes as lowercase hex. */
export function newSeed(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SHUFFLE_SEED_BYTES));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const isSeed = (seed: string): boolean => SHUFFLE_SEED_PATTERN.test(seed);

/**
 * sfc32: a small, well-tested 32-bit PRNG with a 128-bit state, which a
 * 32-hex seed fills exactly. Not for secrets: the seed is not a secret.
 */
function sfc32(seed: string): () => number {
  let [a, b, c, d] = [0, 8, 16, 24].map((at) => parseInt(seed.slice(at, at + 8), 16) | 0);
  const next = () => {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 2 ** 32;
  };
  // Mix the raw seed words before the first real draw.
  for (let i = 0; i < 12; i += 1) next();
  return next;
}

/** One Fisher–Yates order per question, drawn in question order from one stream. */
export function shuffleOrder(seed: string, optionCounts: readonly number[]): OptionOrder {
  if (!isSeed(seed)) throw new Error('shuffleOrder: seed must be 32 lowercase hex characters');
  const random = sfc32(seed);
  return optionCounts.map((count) => {
    const order = Array.from({ length: count }, (_, i) => i);
    for (let i = count - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  });
}

/** Each question with its options in display order, plus the order used. */
export function shuffleQuestions<Q extends { options: readonly unknown[] }>(
  questions: readonly Q[],
  seed: string,
): { questions: Q[]; order: OptionOrder } {
  const order = shuffleOrder(
    seed,
    questions.map((q) => q.options.length),
  );
  return {
    questions: questions.map((q, i) => ({ ...q, options: order[i].map((o) => q.options[o]) })),
    order,
  };
}

/**
 * Display indexes (one per question) → original indexes. Null when the count
 * is wrong or an index is out of range: the caller answers INVALID_INPUT.
 */
export function toOriginalAnswers(
  order: OptionOrder,
  displayAnswers: readonly number[],
): number[] | null {
  if (displayAnswers.length !== order.length) return null;
  const original: number[] = [];
  for (const [q, display] of displayAnswers.entries()) {
    const mapped = order[q][display];
    if (!Number.isInteger(display) || mapped === undefined) return null;
    original.push(mapped);
  }
  return original;
}
