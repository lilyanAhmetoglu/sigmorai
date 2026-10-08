// `bun run docs:watch` (SIG-23): fetches every page a lesson cites plus one
// index per source, hashes the normalised text, and compares with the last
// run. Writes <DOCS_WATCH_DIR>/hashes.json and issue-body.md; the workflow
// (.github/workflows/docs-watch.yml) opens or edits the docs-changed issue.
// No DB, no model, no API key. A failed fetch is reported and never fails the run.
//
// Env: DOCS_WATCH_DIR (default ./docs-watch) · ISSUE_STATE=closed when the
// issue in hashes.json was closed (= handled): pending is cleared first.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DOCS_WATCH_DEFAULT_DIR,
  DOCS_WATCH_ISSUE_FILE,
  DOCS_WATCH_STATE_FILE,
} from '@/lib/constants';
import {
  citedPages,
  EMPTY_DOCS_WATCH_STATE,
  fetchTargets,
  nextState,
  renderIssue,
  sha256,
  type DocsWatchResult,
} from '@/lib/content/docs-watch';
import { fetchPageWithFallback } from '@/lib/content/fetch-page';
import { loadKbSources } from '@/lib/content/load';
import { DocsWatchStateSchema, type DocsWatchState, type DocsWatchTarget } from '@/lib/types';

const dir = process.env.DOCS_WATCH_DIR || DOCS_WATCH_DEFAULT_DIR;
const statePath = path.join(dir, DOCS_WATCH_STATE_FILE);
const issuePath = path.join(dir, DOCS_WATCH_ISSUE_FILE);
const issueClosed = process.env.ISSUE_STATE?.toLowerCase() === 'closed';

/** The stored state; empty on the very first run. A corrupt file throws: never silently lose pending rows. */
async function readState(): Promise<DocsWatchState> {
  let text: string;
  try {
    text = await readFile(statePath, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return EMPTY_DOCS_WATCH_STATE;
    throw err;
  }
  return DocsWatchStateSchema.parse(JSON.parse(text));
}

async function check(target: DocsWatchTarget): Promise<DocsWatchResult> {
  try {
    // A moved page's .md (404) or a repo with no releases (empty feed): the fallback is used.
    const { text } = await fetchPageWithFallback(target);
    return { target, ok: true, hash: sha256(text) };
  } catch (err) {
    const error = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return { target, ok: false, error };
  }
}

const prev = await readState();
const targets = fetchTargets(await loadKbSources(), await citedPages());
const results: DocsWatchResult[] = [];
// Sequential on purpose: ~100 pages a day, polite to every host.
for (const target of targets) results.push(await check(target));

const { state, changed } = nextState(prev, results, new Date().toISOString(), issueClosed);
await mkdir(dir, { recursive: true });
await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
await writeFile(issuePath, state.pending.length > 0 ? renderIssue(state.pending) : '');

const errors = results.filter((r) => !r.ok);
const fresh = results.filter((r) => r.ok && !prev.pages[r.target.url]).length;
const summary = [
  `docs-watch: ${targets.length} targets · ${results.length - errors.length} ok · ${errors.length} errors`,
  `new (recorded, not reported): ${fresh} · changed: ${changed.length} · pending: ${state.pending.length}` +
    (issueClosed ? ' (issue was closed: pending cleared first)' : ''),
  ...changed.map((c) => `  changed  ${c.url}  [${c.sourceId}]  ${c.lessons.join(', ') || '—'}`),
  ...errors.map((e) => `  error    ${e.target.fetchUrl}  ${e.ok ? '' : e.error}`),
].join('\n');
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  await writeFile(process.env.GITHUB_STEP_SUMMARY, `\`\`\`\n${summary}\n\`\`\`\n`, { flag: 'a' });
}
// Always 0: a page that failed today is retried tomorrow against the same stored hash.
process.exitCode = 0;
