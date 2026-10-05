import { boolean, check, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { KB_SOURCE_KINDS, KB_TRUST_TIERS } from '@/lib/constants';
import { oneOf } from './checks';

/**
 * Knowledge-base registry, mirrored from content/sources.yaml by the seed.
 * Not user-owned. The other kb_* tables and pgvector arrive in step 8.
 */
export const kbSources = pgTable(
  'kb_sources',
  {
    id: text().primaryKey(),
    kind: text({ enum: KB_SOURCE_KINDS }).notNull(),
    title: text().notNull(),
    url: text().notNull().unique(),
    owner: text().notNull(),
    trustTier: text({ enum: KB_TRUST_TIERS }).notNull(),
    enabled: boolean().notNull().default(true),
    fetchConfig: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    lastCheckedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('kb_sources_kind_check', oneOf(t.kind, KB_SOURCE_KINDS)),
    check('kb_sources_trust_tier_check', oneOf(t.trustTier, KB_TRUST_TIERS)),
  ],
);
