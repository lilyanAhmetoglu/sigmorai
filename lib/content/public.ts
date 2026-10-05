import 'server-only';
import {
  PublicCaseSchema,
  PublicChallengeSchema,
  PublicQuickCheckSchema,
  type Case,
  type Challenge,
  type PublicCase,
  type PublicChallenge,
  type PublicQuickCheck,
  type QuickCheck,
} from '@/lib/types';

/**
 * Client-safe views of loaded content. The public schemas list only the fields
 * a player may see before submitting, and Zod drops every other key: no hidden
 * tests, no solution, no correct flags, no explanations.
 */

export const toPublicChallenge = (challenge: Challenge): PublicChallenge =>
  PublicChallengeSchema.parse(challenge);

export const toPublicCase = (kase: Case): PublicCase => PublicCaseSchema.parse(kase);

export const toPublicQuickCheck = (check: QuickCheck): PublicQuickCheck =>
  PublicQuickCheckSchema.parse(check);
