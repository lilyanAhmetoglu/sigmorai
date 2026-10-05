import { describe, expect, test } from 'bun:test';
import { RunErrorBodySchema } from '@/lib/types';
import { runErrorResponse } from './respond';

describe('runErrorResponse', () => {
  test('CAP_REACHED is a 429 with resetsAt and the cap payload', async () => {
    const cap = { kind: 'run' as const, used: 40, cap: 40, resetsAt: '2026-10-06T00:00:00.000Z' };
    const response = runErrorResponse({ code: 'CAP_REACHED', message: 'You used 40 of 40', cap });
    expect(response.status).toBe(429);
    const body = RunErrorBodySchema.parse(await response.json());
    expect(body).toEqual({
      error: 'You used 40 of 40',
      code: 'CAP_REACHED',
      resetsAt: cap.resetsAt,
      cap,
    });
  });

  test('RUN_IN_PROGRESS is a 409, TIER_LOCKED a 403, RUNNER_FAILED a 502', () => {
    expect(runErrorResponse({ code: 'RUN_IN_PROGRESS', message: 'x' }).status).toBe(409);
    expect(runErrorResponse({ code: 'TIER_LOCKED', message: 'x' }).status).toBe(403);
    expect(runErrorResponse({ code: 'RUNNER_FAILED', message: 'x' }).status).toBe(502);
  });

  test('keeps the `error` string and lets INVALID_INPUT pick its status', async () => {
    const response = runErrorResponse({ code: 'INVALID_INPUT', message: 'Too big' }, 413);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'Too big', code: 'INVALID_INPUT' });
  });
});
