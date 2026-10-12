import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  vector,
} from 'drizzle-orm/pg-core';
import { MENTOR_CHUNK_KINDS, MENTOR_EMBED_DIM } from '@/lib/constants';
import { oneOf } from './checks';

/**
 * The mentor's search index (docs/plans/mentor-design-plan.md, amendment
 * 2026-10-08): lesson sections and cited official pages, one embedded chunk
 * per row. No user data, so no cascade. A rebuildable cache of content/:
 * TRUNCATE + `bun run mentor:index` gives the same rows back. Written only by
 * lib/mentor/index-build.ts. `vector` needs migration 0007 (CREATE EXTENSION).
 */
export const mentorChunks = pgTable(
  'mentor_chunks',
  {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    kind: text({ enum: MENTOR_CHUNK_KINDS }).notNull(),
    /** Lesson id (`builder/r1/c2/lesson`) or urlKey() of the source page. */
    docKey: text().notNull(),
    title: text().notNull(),
    /** The `##` heading; null for text before the first heading or a plain-text page. */
    heading: text(),
    /** Order inside the document. */
    ord: integer().notNull(),
    /** The chunk text shown to the model (without the header line). */
    body: text().notNull(),
    /** sha256(model:dim + header + text): a model or dimension change re-embeds everything. */
    contentHash: text().notNull(),
    embedding: vector({ dimensions: MENTOR_EMBED_DIM }).notNull(),
    indexedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Also serves lookups by doc_key (leading column), so no separate btree.
    uniqueIndex('mentor_chunks_doc_hash_idx').on(t.docKey, t.contentHash),
    // Default HNSW params (m = 16, ef_construction = 64); ~6–8 k rows.
    index('mentor_chunks_embedding_idx').using('hnsw', t.embedding.op('vector_cosine_ops')),
    check('mentor_chunks_kind_check', oneOf(t.kind, MENTOR_CHUNK_KINDS)),
    check('mentor_chunks_ord_check', sql`${t.ord} >= 0`),
  ],
);
