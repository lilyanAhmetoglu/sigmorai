/**
 * Where an exercise's file lives inside the content root. Pure: no IO.
 *
 *   builder/r0/c1/lesson         → builder/00-bootstrap-village/c1/lesson.mdx
 *   builder/r0/c1/challenge      → builder/00-bootstrap-village/c1/case.json
 *   strategist/r0/c1/challenge   → strategist/00-bootstrap-village/c1/case.json
 *   strategist/r3/boss/challenge → strategist/03-…/boss/case.json
 *   math/f1/quick-check          → math/f1/quick-check.json
 *   frontier/2026-10-05-x/lesson → frontier/2026-10-05-x/lesson.mdx
 */
import {
  BOSS_SEGMENT,
  CASE_FILE,
  FRONTIER_AREA,
  LESSON_FILE,
  MATH_AREA,
  QUICK_CHECK_FILE,
  BOSS_STEP,
} from '@/lib/constants';
import type { ExerciseRef } from '@/lib/types';
import { realmFolder } from './curriculum';
import { segment } from './ids';

/** Which file a step reads. The `challenge` step is a graded case on every track. */
function fileFor(step: string): string {
  if (step === 'lesson') return LESSON_FILE;
  if (step === 'quick-check') return QUICK_CHECK_FILE;
  return CASE_FILE;
}

/** The exercise's folder, relative to the content root. */
function folderOf(ref: ExerciseRef): string {
  switch (ref.area) {
    case 'chapter':
      return [ref.track, realmFolder(ref.realm), segment('chapter', ref.chapter)].join('/');
    case 'boss':
      return [ref.track, realmFolder(ref.realm), BOSS_SEGMENT].join('/');
    case MATH_AREA:
      return [MATH_AREA, segment('floor', ref.floor)].join('/');
    case FRONTIER_AREA:
      return `${FRONTIER_AREA}/${ref.date}-${ref.slug}`;
  }
}

/** Path of the file for this exercise, relative to the content root. */
export function exerciseFile(ref: ExerciseRef): string {
  const step = ref.area === 'boss' ? BOSS_STEP : ref.step;
  return `${folderOf(ref)}/${fileFor(step)}`;
}
