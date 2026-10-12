import { describe, expect, test } from 'bun:test';
import {
  MENTOR_EMBED_BACKOFF_MS,
  MENTOR_EMBED_DIM,
  MENTOR_EMBED_MODEL,
  MENTOR_EMBED_RETRIES,
  MENTOR_EMBED_URL,
} from '@/lib/constants';
import { embedTexts } from './embed';

type Call = { url: string; init: RequestInit; body: { input: string[]; [k: string]: unknown } };

/** A fake Voyage: answers each request with vectors whose first value is the input's number. */
function fakeVoyage(statuses: number[] = [], dim = MENTOR_EMBED_DIM) {
  const calls: Call[] = [];
  const fetchFn = async (url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    calls.push({ url, init: init!, body });
    const status = statuses.shift() ?? 200;
    if (status !== 200) return new Response('{"detail":"no"}', { status });
    const data = (body.input as string[]).map((text, index) => ({
      object: 'embedding',
      embedding: [Number(text.replace(/\D/g, '')), ...new Array(dim - 1).fill(0)],
      index,
    }));
    // Out of order on purpose: the client must sort by index.
    return Response.json({
      object: 'list',
      data: data.reverse(),
      model: MENTOR_EMBED_MODEL,
      usage: { total_tokens: body.input.length * 3 },
    });
  };
  return { calls, fetchFn };
}

const noSleep = { waits: [] as number[] };
const sleep = async (ms: number) => {
  noSleep.waits.push(ms);
};

describe('embedTexts', () => {
  test('batches of 64, in input order, tokens summed, documented request shape', async () => {
    const { calls, fetchFn } = fakeVoyage();
    const texts = Array.from({ length: 130 }, (_, i) => `t${i}`);
    const result = await embedTexts(texts, 'document', { apiKey: 'k', fetchFn, sleep });
    expect(calls.map((c) => c.body.input.length)).toEqual([64, 64, 2]);
    expect(result.embeddings.map((e) => e[0])).toEqual(texts.map((_, i) => i));
    expect(result.tokens).toBe(130 * 3);
    const [first] = calls;
    expect(first.url).toBe(MENTOR_EMBED_URL);
    expect(first.init.method).toBe('POST');
    expect((first.init.headers as Record<string, string>).authorization).toBe('Bearer k');
    expect(first.body).toMatchObject({
      model: MENTOR_EMBED_MODEL,
      input_type: 'document',
      output_dimension: MENTOR_EMBED_DIM,
    });
  });

  test('query input_type is passed through', async () => {
    const { calls, fetchFn } = fakeVoyage();
    await embedTexts(['q1'], 'query', { apiKey: 'k', fetchFn, sleep });
    expect(calls[0].body.input_type).toBe('query');
  });

  test('retries 429 and 5xx with doubling backoff', async () => {
    noSleep.waits = [];
    const { calls, fetchFn } = fakeVoyage([429, 503]);
    const result = await embedTexts(['t1'], 'document', { apiKey: 'k', fetchFn, sleep });
    expect(calls).toHaveLength(3);
    expect(noSleep.waits).toEqual([MENTOR_EMBED_BACKOFF_MS, MENTOR_EMBED_BACKOFF_MS * 2]);
    expect(result.embeddings[0][0]).toBe(1);
  });

  test(`gives up after ${MENTOR_EMBED_RETRIES} retries`, async () => {
    const { calls, fetchFn } = fakeVoyage([500, 500, 500, 500, 500]);
    await expect(embedTexts(['t1'], 'document', { apiKey: 'k', fetchFn, sleep })).rejects.toThrow(
      'HTTP 500',
    );
    expect(calls).toHaveLength(MENTOR_EMBED_RETRIES + 1);
  });

  test('a 400 is not retried', async () => {
    const { calls, fetchFn } = fakeVoyage([400]);
    await expect(embedTexts(['t1'], 'document', { apiKey: 'k', fetchFn, sleep })).rejects.toThrow(
      'HTTP 400',
    );
    expect(calls).toHaveLength(1);
  });

  test('a network error is retried', async () => {
    let n = 0;
    const { fetchFn: ok } = fakeVoyage();
    const fetchFn = async (url: string, init?: RequestInit) => {
      if (n++ === 0) throw new TypeError('fetch failed');
      return ok(url, init);
    };
    const result = await embedTexts(['t7'], 'document', { apiKey: 'k', fetchFn, sleep });
    expect(result.embeddings[0][0]).toBe(7);
  });

  test('a vector of the wrong dimension is rejected (Zod)', async () => {
    const { fetchFn } = fakeVoyage([], 256);
    await expect(embedTexts(['t1'], 'document', { apiKey: 'k', fetchFn, sleep })).rejects.toThrow(
      'unexpected response',
    );
  });

  test('no texts → no request', async () => {
    const { calls, fetchFn } = fakeVoyage();
    expect(await embedTexts([], 'document', { apiKey: 'k', fetchFn, sleep })).toEqual({
      embeddings: [],
      tokens: 0,
    });
    expect(calls).toHaveLength(0);
  });
});
