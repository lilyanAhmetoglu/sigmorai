import { expect, test } from 'bun:test';
import { parseExerciseId } from './ids';
import { exerciseFile } from './paths';

const fileOf = (id: string) => exerciseFile(parseExerciseId(id)!);

test.each([
  ['builder/r0/c1/lesson', 'builder/00-bootstrap-village/c1/lesson.mdx'],
  ['builder/r0/c1/challenge', 'builder/00-bootstrap-village/c1/case.json'],
  ['strategist/r0/c1/challenge', 'strategist/00-bootstrap-village/c1/case.json'],
  ['strategist/r0/c6/quick-check', 'strategist/00-bootstrap-village/c6/quick-check.json'],
  ['builder/r0/boss/challenge', 'builder/00-bootstrap-village/boss/case.json'],
  ['strategist/r0/boss/challenge', 'strategist/00-bootstrap-village/boss/case.json'],
  ['math/f1/lesson', 'math/f1/lesson.mdx'],
  ['frontier/2026-10-05-some-slug/quick-check', 'frontier/2026-10-05-some-slug/quick-check.json'],
])('%s → %s', (id, file) => {
  expect(fileOf(id)).toBe(file);
});
