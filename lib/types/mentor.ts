import type { MENTOR_CHUNK_KINDS } from '@/lib/constants';

export type MentorChunkKind = (typeof MENTOR_CHUNK_KINDS)[number];

/** `document` for indexed chunks, `query` for a learner's question (Voyage `input_type`). */
export type MentorEmbedInputType = 'document' | 'query';

/**
 * One chunk ready to embed and store (a `mentor_chunks` row without id,
 * embedding and indexed_at). `embedText` = header line + "\n" + body: what is
 * embedded and hashed. The header is never stored; it is rebuilt from title
 * and heading.
 */
export type MentorChunkDraft = {
  kind: MentorChunkKind;
  /** Lesson id, or urlKey() of the source page. */
  docKey: string;
  title: string;
  heading: string | null;
  ord: number;
  body: string;
  embedText: string;
  contentHash: string;
};
