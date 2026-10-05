import { describe, expect, test } from 'bun:test';
import { RUN_BODY_MAX_BYTES, RUN_CODE_MAX_CHARS } from '@/lib/constants';
import { checkRunBody, readCappedText } from './validate';

const body = (value: unknown) => JSON.stringify(value);
const post = (text: string, headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/run', { method: 'POST', body: text, headers });

describe('checkRunBody', () => {
  test('accepts a challenge id and code', () => {
    const result = checkRunBody(body({ exerciseId: 'builder/r0/c1/challenge', code: 'x = 1' }));
    expect(result).toEqual({
      ok: true,
      body: { exerciseId: 'builder/r0/c1/challenge', code: 'x = 1' },
    });
  });
  test('accepts a boss challenge', () => {
    expect(checkRunBody(body({ exerciseId: 'builder/r3/boss/challenge', code: '' })).ok).toBe(true);
  });
  test('rejects a body that is too large (413)', () => {
    expect(checkRunBody(null)).toMatchObject({ ok: false, status: 413 });
  });
  test('rejects non-JSON', () => {
    expect(checkRunBody('code=1')).toMatchObject({ ok: false, status: 400 });
  });
  test('rejects ids that are not challenges or not valid', () => {
    for (const exerciseId of ['builder/r0/c1/lesson', 'nope', '../etc/passwd', 42]) {
      expect(checkRunBody(body({ exerciseId, code: '' }))).toMatchObject({
        ok: false,
        status: 400,
      });
    }
  });
  test('rejects code over the limit', () => {
    const code = 'x'.repeat(RUN_CODE_MAX_CHARS + 1);
    const result = checkRunBody(body({ exerciseId: 'builder/r0/c1/challenge', code }));
    expect(result).toMatchObject({ ok: false, status: 400 });
  });
  test('rejects client-sent tests, scores or extra fields', () => {
    for (const extra of [{ tests: [] }, { passed: true }, { xp: 150 }]) {
      const result = checkRunBody(
        body({ exerciseId: 'builder/r0/c1/challenge', code: '', ...extra }),
      );
      expect(result).toMatchObject({ ok: false, status: 400 });
    }
  });
});

describe('readCappedText', () => {
  test('reads a small body', async () => {
    expect(await readCappedText(post('{"a":1}'))).toBe('{"a":1}');
  });
  test('stops at the byte cap', async () => {
    expect(await readCappedText(post('x'.repeat(RUN_BODY_MAX_BYTES + 1)))).toBeNull();
  });
  test('trusts a too-large content-length without reading', async () => {
    const request = post('{}', { 'content-length': String(RUN_BODY_MAX_BYTES + 1) });
    expect(await readCappedText(request)).toBeNull();
  });
  test('counts bytes, not characters', async () => {
    const emoji = '\u{1F600}'.repeat(RUN_BODY_MAX_BYTES / 4 + 1);
    expect(await readCappedText(post(emoji))).toBeNull();
  });
});
