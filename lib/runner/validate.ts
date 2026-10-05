import { RUN_BODY_MAX_BYTES } from '@/lib/constants';
import { type RunBody, RunBodySchema } from '@/lib/types';

export type RunBodyCheck =
  { ok: true; body: RunBody } | { ok: false; status: 400 | 413; error: string };

/**
 * Reads a request body as text, stopping as soon as it passes `maxBytes`, so
 * a huge body is never fully buffered. Returns null when it is too big.
 */
export async function readCappedText(
  request: Request,
  maxBytes: number = RUN_BODY_MAX_BYTES,
): Promise<string | null> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

/** Validates a /api/run body: size first, then JSON, then the Zod schema. */
export function checkRunBody(text: string | null): RunBodyCheck {
  if (text === null) return { ok: false, status: 413, error: 'Request body is too large' };

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, status: 400, error: 'Body must be JSON' };
  }
  const parsed = RunBodySchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? 'Invalid body' };
  }
  return { ok: true, body: parsed.data };
}
