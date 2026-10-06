import { z } from 'zod';
import {
  type CHAPTER_STEPS,
  type FRONTIER_AREA,
  type MATH_AREA,
  type SIDE_STEPS,
  TRACKS,
} from '@/lib/constants';
import { isExerciseId } from '@/lib/content/ids';

export type Track = (typeof TRACKS)[number];
/** A track from outside (a `?track=` search param). */
export const TrackSchema = z.enum(TRACKS);
export type ChapterStep = (typeof CHAPTER_STEPS)[number];
export type SideStep = (typeof SIDE_STEPS)[number];

/** A parsed exercise id. Build and parse with lib/content/ids.ts. */
export type ExerciseRef =
  | { area: 'chapter'; track: Track; realm: number; chapter: number; step: ChapterStep }
  | { area: 'boss'; track: Track; realm: number }
  | { area: typeof MATH_AREA; floor: number; step: SideStep }
  | { area: typeof FRONTIER_AREA; date: string; slug: string; step: SideStep };

/** Validates any exercise id that crosses a trust boundary (form input, JSON, DB). */
export const ExerciseIdSchema = z.string().refine(isExerciseId, { message: 'Invalid exercise id' });
