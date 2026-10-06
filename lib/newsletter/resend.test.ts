import { describe, expect, mock, test } from 'bun:test';
import { addContact } from './resend';

const CONFIG = { apiKey: 're_test', segmentId: 'seg_1' };
const EXISTS = { name: 'validation_error', message: 'Contact already exists.' };
const reply = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status });

/** A fetch that answers each call with the next status, and records the calls. */
function fakeFetch(...statuses: (number | [number, unknown])[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fn = mock(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const next = statuses[calls.length - 1] ?? 500;
    return Array.isArray(next) ? reply(next[0], next[1]) : reply(next);
  });
  return { fn, calls };
}

describe('addContact', () => {
  test('creates the contact in the segment, with the key as a bearer token', async () => {
    const { fn, calls } = fakeFetch(200);
    expect(await addContact('a@b.co', CONFIG, fn)).toBe('added');
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.resend.com/contacts');
    expect(calls[0].init.method).toBe('POST');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer re_test');
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      email: 'a@b.co',
      unsubscribed: false,
      segments: [{ id: 'seg_1' }],
    });
  });

  test('an existing contact is added to the segment, and nothing else is sent', async () => {
    const { fn, calls } = fakeFetch([409, EXISTS], 200);
    expect(await addContact('a+x@b.co', CONFIG, fn)).toBe('added');
    expect(calls).toHaveLength(2);
    expect(calls[1].url).toBe('https://api.resend.com/contacts/a%2Bx%40b.co/segments/seg_1');
    expect(calls.some((c) => c.init.method === 'PATCH')).toBe(false);
  });

  test('a validation error is "failed", with no second request', async () => {
    const { fn, calls } = fakeFetch([
      422,
      { name: 'validation_error', message: 'Invalid `email` field.' },
    ]);
    expect(await addContact('a@b.co', CONFIG, fn)).toBe('failed');
    expect(calls).toHaveLength(1);
    const odd = fakeFetch(400);
    expect(await addContact('a@b.co', CONFIG, odd.fn)).toBe('failed');
    expect(odd.calls).toHaveLength(1);
  });

  test('a rate limit is "busy", with no second request', async () => {
    const { fn, calls } = fakeFetch(429);
    expect(await addContact('a@b.co', CONFIG, fn)).toBe('busy');
    expect(calls).toHaveLength(1);
  });

  test('a bad key or a Resend outage fails without a second request', async () => {
    for (const status of [401, 403, 500, 503]) {
      const { fn, calls } = fakeFetch(status);
      expect(await addContact('a@b.co', CONFIG, fn)).toBe('failed');
      expect(calls).toHaveLength(1);
    }
  });

  test('both requests refused fails', async () => {
    const { fn } = fakeFetch([422, EXISTS], 404);
    expect(await addContact('a@b.co', CONFIG, fn)).toBe('failed');
  });

  test('a network error or timeout fails, never throws', async () => {
    const fn = mock(async () => {
      throw new DOMException('timed out', 'TimeoutError');
    });
    expect(await addContact('a@b.co', CONFIG, fn)).toBe('failed');
  });
});
