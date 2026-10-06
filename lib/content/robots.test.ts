import { describe, expect, test } from 'bun:test';
import { AI_SEARCH_AGENTS, AI_TRAINING_AGENTS } from '@/lib/constants';
import { robotsRules } from './robots';

const rules = [robotsRules()].flat();
const groupFor = (agent: string) =>
  rules.find((r) => [r.userAgent].flat().includes(agent)) ?? rules.find((r) => r.userAgent === '*');

describe('robots', () => {
  test('AI search agents get exactly the rules of every other crawler', () => {
    const all = groupFor('*');
    for (const agent of AI_SEARCH_AGENTS) {
      expect(groupFor(agent)?.allow).toEqual(all?.allow);
      expect(groupFor(agent)?.disallow).toEqual(all?.disallow);
    }
  });

  test('AI training agents are kept out of the whole site', () => {
    for (const agent of AI_TRAINING_AGENTS) {
      expect(groupFor(agent)?.disallow).toBe('/');
      expect(groupFor(agent)?.allow).toBeUndefined();
    }
  });

  test('no agent is in both lists', () => {
    const search: readonly string[] = AI_SEARCH_AGENTS;
    expect(AI_TRAINING_AGENTS.filter((a) => search.includes(a))).toEqual([]);
  });
});
