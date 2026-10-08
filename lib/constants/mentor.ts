/**
 * AI mentor, Phase 1: the search index (docs/plans/mentor-design-plan.md,
 * amendments 2026-10-08). One place for the embedding model and the chunk sizes.
 */

/** What a `mentor_chunks` row came from. Also the CHECK in db/schema/mentor.ts. */
export const MENTOR_CHUNK_KINDS = ['lesson', 'source'] as const;

// ── Embeddings (Voyage AI via MongoDB Atlas) ──
// Checked 2026-10-08 against platform.claude.com/docs/en/build-with-claude/embeddings:
// `POST https://ai.mongodb.com/v1/embeddings`, `Authorization: Bearer $VOYAGE_API_KEY`,
// body `{ input: string[], model, input_type: 'document' | 'query' }`, response
// `{ object: 'list', data: [{ object: 'embedding', embedding: number[], index }], model,
// usage: { total_tokens } }`. voyage-4: 32,000-token context, 1024 dims by default
// (256 / 512 / 2048 via `output_dimension`), unit-normalised (cosine = dot product).
// docs.voyageai.com and mongodb.com were not reachable from the build box, so the
// per-request batch limit was not re-read; 64 inputs of ≤ ~800 tokens stays far below it.

/** The Atlas endpoint for a model API key (a geography-scoped key uses its own host). */
export const MENTOR_EMBED_URL = 'https://ai.mongodb.com/v1/embeddings';
export const MENTOR_EMBED_MODEL = 'voyage-4';
/** Must match `vector(1024)` in db/schema/mentor.ts. A change needs a new migration. */
export const MENTOR_EMBED_DIM = 1024;
/** Inputs per embeddings request. */
export const MENTOR_EMBED_BATCH = 64;
/** Retries after the first try, on HTTP 429 / 5xx or a network error. */
export const MENTOR_EMBED_RETRIES = 3;
/** First retry wait; it doubles each time (1 s, 2 s, 4 s). */
export const MENTOR_EMBED_BACKOFF_MS = 1_000;
/** One indexer embeddings request gives up after this long. */
export const MENTOR_EMBED_TIMEOUT_MS = 30_000;
/** voyage-4 price, USD per million tokens (read 2026-10-08, see the plan's Cost section). For the summary's estimate. */
export const MENTOR_EMBED_USD_PER_MTOK = 0.06;

// ── Chunking ──

/** Token estimate: characters ÷ 4 (both vendors' rule of thumb for English). */
export const MENTOR_CHARS_PER_TOKEN = 4;
/** A section over this splits at paragraph breaks… */
export const MENTOR_CHUNK_MAX_TOKENS = 800;
/** …into pieces of about this size. Plain-text pages use windows of this size too. */
export const MENTOR_CHUNK_TARGET_TOKENS = 500;
/** A section under this joins the next one. */
export const MENTOR_CHUNK_MIN_TOKENS = 80;
/** Overlap between plain-text windows. */
export const MENTOR_CHUNK_OVERLAP_TOKENS = 50;
/** A huge reference page keeps only its first chunks. */
export const MENTOR_SOURCE_MAX_CHUNKS = 40;
/** Source pages fetched at the same time by `bun run mentor:index`. */
export const MENTOR_FETCH_CONCURRENCY = 4;
