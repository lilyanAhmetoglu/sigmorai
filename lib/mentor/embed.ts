import 'server-only';
import { z } from 'zod';
import {
  MENTOR_EMBED_BACKOFF_MS,
  MENTOR_EMBED_BATCH,
  MENTOR_EMBED_DIM,
  MENTOR_EMBED_MODEL,
  MENTOR_EMBED_RETRIES,
  MENTOR_EMBED_TIMEOUT_MS,
  MENTOR_EMBED_URL,
} from '@/lib/constants';
import type { FetchFn } from '@/lib/content/fetch-page';
import type { MentorEmbedInputType } from '@/lib/types';

/**
 * Voyage embeddings over plain HTTPS (no SDK). `server-only` is the fence for
 * VOYAGE_API_KEY (mentor plan, amendment 2026-10-08). Request and response
 * shape: see lib/constants/mentor.ts. The response is parsed with Zod; a
 * vector of the wrong length is an error, never stored.
 */

const EmbedResponseSchema = z.object({
  data: z
    .array(
      z.object({
        embedding: z.array(z.number()).length(MENTOR_EMBED_DIM),
        index: z.number().int().nonnegative(),
      }),
    )
    .min(1),
  usage: z.object({ total_tokens: z.number().int().nonnegative() }),
});

export type EmbedResult = { embeddings: number[][]; tokens: number };

export type EmbedOptions = {
  apiKey: string;
  /** Test seam. */
  fetchFn?: FetchFn;
  /** Test seam: waits between retries. */
  sleep?: (ms: number) => Promise<void>;
  timeoutMs?: number;
};

/** An HTTP status worth another try: rate limit or a server error. */
const retryable = (status: number) => status === 429 || status >= 500;

class EmbedHttpError extends Error {
  constructor(readonly status: number) {
    super(`Voyage embeddings: HTTP ${status}`);
    this.name = 'EmbedHttpError';
  }
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** One request (≤ MENTOR_EMBED_BATCH inputs), retried on 429 / 5xx / network errors. */
async function embedBatch(
  input: string[],
  inputType: MentorEmbedInputType,
  options: EmbedOptions,
): Promise<EmbedResult> {
  const fetchFn = options.fetchFn ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  let lastError: unknown;
  for (let attempt = 0; attempt <= MENTOR_EMBED_RETRIES; attempt++) {
    if (attempt > 0) await sleep(MENTOR_EMBED_BACKOFF_MS * 2 ** (attempt - 1));
    let res: Response;
    try {
      res = await fetchFn(MENTOR_EMBED_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          input,
          model: MENTOR_EMBED_MODEL,
          input_type: inputType,
          output_dimension: MENTOR_EMBED_DIM,
        }),
        signal: AbortSignal.timeout(options.timeoutMs ?? MENTOR_EMBED_TIMEOUT_MS),
      });
    } catch (err) {
      lastError = err; // network error or timeout: try again
      continue;
    }
    if (!res.ok) {
      // Never echo the body: it could quote the request.
      lastError = new EmbedHttpError(res.status);
      if (retryable(res.status)) continue;
      throw lastError;
    }
    const parsed = EmbedResponseSchema.safeParse(await res.json());
    if (!parsed.success) {
      throw new Error(`Voyage embeddings: unexpected response (${z.prettifyError(parsed.error)})`);
    }
    const { data, usage } = parsed.data;
    const embeddings: number[][] = new Array(input.length);
    for (const row of data) {
      if (row.index >= input.length) throw new Error('Voyage embeddings: index out of range');
      embeddings[row.index] = row.embedding;
    }
    if (data.length !== input.length || embeddings.some((e) => e === undefined)) {
      throw new Error(`Voyage embeddings: ${data.length} vectors for ${input.length} inputs`);
    }
    return { embeddings, tokens: usage.total_tokens };
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** Embeds `texts` in order, MENTOR_EMBED_BATCH at a time. Throws after the retries run out. */
export async function embedTexts(
  texts: readonly string[],
  inputType: MentorEmbedInputType,
  options: EmbedOptions,
): Promise<EmbedResult> {
  const embeddings: number[][] = [];
  let tokens = 0;
  for (let i = 0; i < texts.length; i += MENTOR_EMBED_BATCH) {
    const batch = await embedBatch(texts.slice(i, i + MENTOR_EMBED_BATCH), inputType, options);
    embeddings.push(...batch.embeddings);
    tokens += batch.tokens;
  }
  return { embeddings, tokens };
}
