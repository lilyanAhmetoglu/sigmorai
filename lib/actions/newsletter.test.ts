import { afterAll, afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';

// Keep the real module so the mock does not leak into resend.test.ts (bun mocks are global).
const real = { ...(await import('@/lib/newsletter/resend')) };
const addContact = mock(async (): Promise<'added' | 'busy' | 'failed'> => 'added');
mock.module('@/lib/newsletter/resend', () => ({ addContact }));

const { subscribeNewsletter } = await import('./newsletter');
const { NEWSLETTER_FIELDS } = await import('@/lib/constants');

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
};
const email = { [NEWSLETTER_FIELDS.email]: 'a@b.co' };

const saved = { key: process.env.RESEND_API_KEY, seg: process.env.RESEND_SEGMENT_ID };

afterAll(() => {
  mock.module('@/lib/newsletter/resend', () => real);
});

describe('subscribeNewsletter', () => {
  beforeEach(() => {
    addContact.mockClear();
    addContact.mockImplementation(async () => 'added');
    process.env.RESEND_API_KEY = 're_test';
    process.env.RESEND_SEGMENT_ID = 'seg_1';
  });
  afterEach(() => {
    if (saved.key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = saved.key;
    if (saved.seg === undefined) delete process.env.RESEND_SEGMENT_ID;
    else process.env.RESEND_SEGMENT_ID = saved.seg;
  });

  test('a filled honeypot gets the success reply and calls nothing', async () => {
    const res = await subscribeNewsletter(
      null,
      form({ ...email, [NEWSLETTER_FIELDS.honeypot]: 'x' }),
    );
    expect(res).toEqual({ done: true });
    expect(addContact).not.toHaveBeenCalled();
  });

  test('a bad email is refused before any call', async () => {
    expect(await subscribeNewsletter(null, form({ [NEWSLETTER_FIELDS.email]: 'nope' }))).toEqual({
      error: 'invalid_email',
    });
    expect(addContact).not.toHaveBeenCalled();
  });

  test('missing env is "not_open" and calls nothing', async () => {
    delete process.env.RESEND_API_KEY;
    expect(await subscribeNewsletter(null, form(email))).toEqual({ error: 'not_open' });
    expect(addContact).not.toHaveBeenCalled();
  });

  test('added is done, busy is busy, failed is server_error', async () => {
    expect(await subscribeNewsletter(null, form(email))).toEqual({ done: true });
    addContact.mockImplementation(async () => 'busy');
    expect(await subscribeNewsletter(null, form(email))).toEqual({ error: 'busy' });
    addContact.mockImplementation(async () => 'failed');
    expect(await subscribeNewsletter(null, form(email))).toEqual({ error: 'server_error' });
  });
});
