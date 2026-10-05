import { describe, expect, test } from 'bun:test';
import { RUN_DAILY_CAP, RUN_STALE_MS, SUBMIT_DAILY_CAP } from '@/lib/constants';
import { decideGate, type SandboxState } from './sandbox-gate';

const now = new Date('2026-10-05T12:00:00Z');
const fresh: SandboxState = {
  sandboxDay: null,
  runCount: 0,
  submitCount: 0,
  sandboxPendingAt: null,
};
const today = (counts: Partial<SandboxState>): SandboxState => ({
  ...fresh,
  sandboxDay: '2026-10-05',
  ...counts,
});

describe('day roll', () => {
  test('a first call starts today at 1 and takes the lock', () => {
    const result = decideGate(fresh, 'run', now);
    expect(result).toEqual({
      ok: true,
      update: { sandboxDay: '2026-10-05', runCount: 1, submitCount: 0, sandboxPendingAt: now },
    });
  });

  test('counts from an older day read as 0', () => {
    const yesterday = { ...fresh, sandboxDay: '2026-10-04', runCount: 40, submitCount: 30 };
    const result = decideGate(yesterday, 'submit', now);
    expect(result.ok && result.update).toMatchObject({ runCount: 0, submitCount: 1 });
  });

  test('a call only counts against its own kind', () => {
    const result = decideGate(today({ runCount: 5, submitCount: 2 }), 'run', now);
    expect(result.ok && result.update).toMatchObject({ runCount: 6, submitCount: 2 });
  });
});

describe('caps', () => {
  test(`run ${RUN_DAILY_CAP} is allowed, run ${RUN_DAILY_CAP + 1} is CAP_REACHED`, () => {
    expect(decideGate(today({ runCount: RUN_DAILY_CAP - 1 }), 'run', now).ok).toBe(true);
    const result = decideGate(today({ runCount: RUN_DAILY_CAP }), 'run', now);
    expect(result).toMatchObject({
      ok: false,
      code: 'CAP_REACHED',
      cap: { kind: 'run', used: RUN_DAILY_CAP, cap: RUN_DAILY_CAP },
    });
    if (!result.ok) {
      expect(result.cap?.resetsAt).toBe('2026-10-06T00:00:00.000Z');
      expect(result.message).toBe(`You used ${RUN_DAILY_CAP} of ${RUN_DAILY_CAP} runs today.`);
    }
  });

  test('the run cap does not block Submit', () => {
    expect(decideGate(today({ runCount: RUN_DAILY_CAP }), 'submit', now).ok).toBe(true);
  });

  test(`submit ${SUBMIT_DAILY_CAP + 1} is CAP_REACHED { kind: submit }`, () => {
    const result = decideGate(today({ submitCount: SUBMIT_DAILY_CAP }), 'submit', now);
    expect(result).toMatchObject({ ok: false, code: 'CAP_REACHED', cap: { kind: 'submit' } });
  });
});

describe('one-at-a-time lock', () => {
  test('a fresh lock gives RUN_IN_PROGRESS', () => {
    const locked = today({ sandboxPendingAt: new Date(now.getTime() - 1_000) });
    expect(decideGate(locked, 'run', now)).toMatchObject({ ok: false, code: 'RUN_IN_PROGRESS' });
  });

  test(`a lock older than RUN_STALE_MS does not block`, () => {
    const stale = today({ sandboxPendingAt: new Date(now.getTime() - RUN_STALE_MS) });
    expect(decideGate(stale, 'run', now).ok).toBe(true);
  });

  test('two parallel calls: the second sees the first one’s lock', () => {
    const first = decideGate(fresh, 'run', now);
    if (!first.ok) throw new Error('first call should pass');
    const second = decideGate(first.update, 'run', new Date(now.getTime() + 50));
    expect(second).toMatchObject({ ok: false, code: 'RUN_IN_PROGRESS' });
  });

  test('the lock is checked before the cap', () => {
    const both = today({ runCount: RUN_DAILY_CAP, sandboxPendingAt: now });
    expect(decideGate(both, 'run', now)).toMatchObject({ code: 'RUN_IN_PROGRESS' });
  });
});
