import { z } from 'zod';
import { HERO_NAME_MAX, HERO_NAME_MIN, HERO_NAME_PATTERN } from '@/lib/constants';

/** The name a player picks at onboarding. The DB CHECK enforces the length too. */
export const HeroNameSchema = z
  .string()
  .trim()
  .min(HERO_NAME_MIN)
  .max(HERO_NAME_MAX)
  .regex(HERO_NAME_PATTERN);
