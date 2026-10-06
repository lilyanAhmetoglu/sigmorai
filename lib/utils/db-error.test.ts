import { describe, expect, test } from 'bun:test';
import { dbErrorSummary } from './db-error';

describe('dbErrorSummary', () => {
  test('keeps only the code and constraint, from the error or its cause', () => {
    const pg = Object.assign(new Error('duplicate key value'), {
      code: '23505',
      constraint: 'users_hero_name_unique',
      detail: 'Key (hero_name)=(Ada) already exists.',
    });
    const wrapped = new Error('Failed query: insert into users params: user_123,Ada', {
      cause: pg,
    });
    expect(dbErrorSummary(wrapped)).toEqual({
      code: '23505',
      constraint: 'users_hero_name_unique',
    });
    expect(dbErrorSummary(pg)).toEqual({ code: '23505', constraint: 'users_hero_name_unique' });
    expect(JSON.stringify(dbErrorSummary(wrapped))).not.toContain('Ada');
  });

  test('anything else gives nulls, never the message', () => {
    expect(dbErrorSummary(new Error('user_123'))).toEqual({ code: null, constraint: null });
    expect(dbErrorSummary('boom')).toEqual({ code: null, constraint: null });
    expect(dbErrorSummary(null)).toEqual({ code: null, constraint: null });
  });
});
