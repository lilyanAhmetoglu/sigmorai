import { describe, expect, test } from 'bun:test';
import { HudStateSchema } from './hud';

const stats = {
  heroName: 'Ada',
  track: 'builder' as const,
  xp: 120,
  level: 2,
  into: 20,
  span: 300,
  streak: 3,
  activeToday: true,
};

describe('HudStateSchema', () => {
  test('accepts the three states GET /api/hud sends', () => {
    expect(HudStateSchema.parse({ status: 'signed-out' })).toEqual({ status: 'signed-out' });
    expect(HudStateSchema.parse({ status: 'onboarding' })).toEqual({ status: 'onboarding' });
    expect(HudStateSchema.parse({ status: 'ready', stats })).toEqual({ status: 'ready', stats });
  });

  test('refuses an error body, a missing field or a wrong type', () => {
    for (const body of [
      { error: 'HUD failed' },
      { status: 'ready' },
      { status: 'ready', stats: { ...stats, track: 'wizard' } },
      { status: 'ready', stats: { ...stats, level: '2' } },
      null,
    ]) {
      expect(HudStateSchema.safeParse(body).success).toBe(false);
    }
  });
});
