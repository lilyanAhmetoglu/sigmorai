import 'server-only';
import {
  PublicCaseSchema,
  PublicQuickCheckSchema,
  type Case,
  type PublicCase,
  type PublicQuickCheck,
  type QuickCheck,
} from '@/lib/types';

/**
 * Client-safe views of loaded content. The public schemas list only the fields
 * a player may see before submitting, and Zod drops every other key: no correct
 * flags, no explanations.
 */

export const toPublicCase = (kase: Case): PublicCase => PublicCaseSchema.parse(kase);

export const toPublicQuickCheck = (check: QuickCheck): PublicQuickCheck =>
  PublicQuickCheckSchema.parse(check);
