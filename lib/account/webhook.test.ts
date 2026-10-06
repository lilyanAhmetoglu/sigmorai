import { describe, expect, mock, test } from 'bun:test';
import type { WebhookEvent } from '@clerk/nextjs/webhooks';
import { handleClerkEvent } from './webhook';

const event = (type: string, data: Record<string, unknown>) =>
  ({ type, data, object: 'event' }) as unknown as WebhookEvent;

describe('handleClerkEvent', () => {
  test('user.deleted erases that user and returns 200', async () => {
    const erase = mock(async () => 1);
    const res = await handleClerkEvent(
      event('user.deleted', { id: 'user_1', object: 'user', deleted: true }),
      erase,
    );
    expect(res.status).toBe(200);
    expect(erase).toHaveBeenCalledTimes(1);
    expect(erase).toHaveBeenCalledWith('user_1');
  });

  test('0 rows deleted (never onboarded, or already gone) is still 200', async () => {
    const res = await handleClerkEvent(
      event('user.deleted', { id: 'user_2', object: 'user', deleted: true }),
      async () => 0,
    );
    expect(res.status).toBe(200);
  });

  test('user.deleted without an id erases nothing and returns 200', async () => {
    const erase = mock(async () => 0);
    const res = await handleClerkEvent(
      event('user.deleted', { object: 'user', deleted: true }),
      erase,
    );
    expect(res.status).toBe(200);
    expect(erase).not.toHaveBeenCalled();
  });

  test.each(['user.created', 'user.updated', 'session.created'])(
    '%p is ignored with 200 (rows are created by onboarding only)',
    async (type) => {
      const erase = mock(async () => 0);
      const res = await handleClerkEvent(event(type, { id: 'user_3' }), erase);
      expect(res.status).toBe(200);
      expect(erase).not.toHaveBeenCalled();
    },
  );

  test('a DB failure returns 500 so Clerk retries', async () => {
    const spy = mock(() => {});
    const original = console.error;
    console.error = spy;
    try {
      const res = await handleClerkEvent(
        event('user.deleted', { id: 'user_4', object: 'user', deleted: true }),
        async () => {
          throw new Error('db down');
        },
      );
      expect(res.status).toBe(500);
    } finally {
      console.error = original;
    }
  });
});
