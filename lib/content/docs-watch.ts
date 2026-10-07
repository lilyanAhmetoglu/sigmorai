/**
 * Docs-watch (SIG-23, knowledge-base plan amendment 2026-10-06). Finds every
 * page a lesson cites, plus one index per source, and turns a fetched page
 * into stable text to hash. No network here: scripts/docs-watch.ts does the
 * fetching. No DB, no model. The issue body holds URLs and ids only, never
 * page content (a page is untrusted text).
 */
import { createHash } from 'node:crypto';
import { CONTENT_DIR, DOCS_LLMS_TXT_HOSTS, DOCS_MD_HOSTS, TRACKS } from '@/lib/constants';
import type { DocsWatchPending, DocsWatchState, DocsWatchTarget, KbSource } from '@/lib/types';
import { frontierExerciseIds, mathExerciseIds, trackExerciseIds } from './ids';
import { hasContent, listFrontierFolders, loadLesson, loadTrackOutline } from './load';
import { urlKey } from './source-urls';

const isLessonId = (id: string) => id.endsWith('/lesson');

/**
 * Every cited page → the lessons that cite it, keyed by urlKey
 * (`platform.claude.com/docs/en/x`). Track, Math Tower and Frontier lessons
 * that have a file. A bad lesson or outline file throws (content:check guards
 * canary). Track lesson ids come from the outlines under `outlineRoot`
 * (tests point `root` at a fixtures folder that has lessons but no outlines).
 */
export async function citedPages(
  root = CONTENT_DIR,
  // Test seam: the fixtures have lessons but no outlines, so tests read the real ones.
  outlineRoot = root,
): Promise<Map<string, string[]>> {
  const outlines = await Promise.all(TRACKS.map((track) => loadTrackOutline(track, outlineRoot)));
  const ids = [
    ...TRACKS.flatMap((track, i) => trackExerciseIds(track, outlines[i])).filter(isLessonId),
    ...mathExerciseIds().filter(isLessonId),
    ...frontierExerciseIds(await listFrontierFolders(root)).filter(isLessonId),
  ];
  const cited = new Map<string, string[]>();
  for (const id of ids) {
    if (!(await hasContent(id, root))) continue;
    const { frontmatter } = await loadLesson(id, root);
    for (const { url } of frontmatter.sources) {
      const key = urlKey(url);
      if (!key) continue;
      const lessons = cited.get(key) ?? [];
      if (!lessons.includes(id)) lessons.push(id);
      cited.set(key, lessons);
    }
  }
  return cited;
}

const hostOf = (url: string) => new URL(url).hostname.toLowerCase().replace(/^www\./, '');
const inList = (list: readonly string[], url: string) => list.includes(hostOf(url));

/**
 * `https://platform.claude.com/docs/en/x` → `…/x.md` (`…/x.md.txt` on
 * ai.google.dev) on hosts that serve Markdown; else the URL.
 */
export function markdownUrl(url: string): string {
  const suffix = DOCS_MD_HOSTS[hostOf(url)];
  if (!suffix) return url;
  const u = new URL(url);
  u.search = '';
  u.hash = '';
  u.pathname = u.pathname.replace(/\/+$/, '');
  if (!u.pathname.endsWith(suffix)) u.pathname += suffix;
  return u.toString();
}

/** `https://github.com/<owner>/<repo>` → its releases feed + README fallback. */
function repoIndex(url: string): Pick<DocsWatchTarget, 'fetchUrl' | 'fallbackUrl'> {
  const [owner, repo] = new URL(url).pathname.split('/').filter(Boolean);
  return {
    fetchUrl: `https://github.com/${owner}/${repo}/releases.atom`,
    fallbackUrl: `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`,
  };
}

/**
 * A page: its `.md` variant where the host has one, with the page itself as
 * the fallback (a moved page can 404 as `.md` but still redirect as HTML).
 */
function pageTarget(url: string, sourceId: string, lessons: string[]): DocsWatchTarget {
  const md = markdownUrl(url);
  return { url, fetchUrl: md, ...(md !== url && { fallbackUrl: url }), sourceId, lessons };
}

/** The one page per source that shows "something new" (a page list, a changelog, a feed). */
function indexTarget(source: KbSource): DocsWatchTarget {
  const base = source.url.replace(/\/+$/, '');
  const at = (fetch: Pick<DocsWatchTarget, 'fetchUrl' | 'fallbackUrl'>): DocsWatchTarget => ({
    url: fetch.fetchUrl,
    ...fetch,
    sourceId: source.id,
    lessons: [],
  });
  if (source.kind === 'repo') return at(repoIndex(base));
  if (source.kind === 'docs' && inList(DOCS_LLMS_TXT_HOSTS, base)) {
    return at({ fetchUrl: `${base}/llms.txt` });
  }
  // Changelogs, blogs and docs without an llms.txt: the base page itself.
  return pageTarget(base, source.id, []);
}

/** The source whose base is the longest prefix of `key`, or null. */
function ownerOf(key: string, sources: readonly KbSource[]): KbSource | null {
  let best: { source: KbSource; length: number } | null = null;
  for (const source of sources) {
    const base = urlKey(source.url);
    if (!base || !(key === base || key.startsWith(`${base}/`))) continue;
    if (!best || base.length > best.length) best = { source, length: base.length };
  }
  return best?.source ?? null;
}

/**
 * What to fetch: every cited page (with its lessons) + one index per enabled
 * source. A cited page outside every source is still watched (sourceId
 * `unlisted`), though content:check normally stops that. One URL is fetched
 * once (compared by urlKey, so `www.` or a trailing slash is not a second target).
 */
export function fetchTargets(
  sources: readonly KbSource[],
  cited: ReadonlyMap<string, readonly string[]>,
): DocsWatchTarget[] {
  const enabled = sources.filter((s) => s.enabled);
  const targets = new Map<string, DocsWatchTarget>();
  for (const [key, lessons] of [...cited].sort(([a], [b]) => a.localeCompare(b))) {
    const url = `https://${key}`;
    const sourceId = ownerOf(key, enabled)?.id ?? 'unlisted';
    targets.set(key, pageTarget(url, sourceId, [...lessons].sort()));
  }
  for (const source of enabled) {
    const index = indexTarget(source);
    const key = urlKey(index.url) ?? index.url;
    if (!targets.has(key)) targets.set(key, index);
  }
  return [...targets.values()];
}

// ── Normalise + hash ──────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** `#39` / `#x27` → `'`. Null when it is not a valid code point. */
function numericEntity(name: string): string | null {
  const m = /^#(x[0-9a-f]+|\d+)$/i.exec(name);
  if (!m) return null;
  const code = m[1][0].toLowerCase() === 'x' ? parseInt(m[1].slice(1), 16) : Number(m[1]);
  return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : null;
}

/**
 * From the first `<tag …>` to the LAST `</tag>`, or null. Greedy on purpose:
 * nested blocks stay whole, and a list of sibling articles (a blog index) is
 * taken as one region.
 */
const firstBlock = (html: string, tag: string) =>
  new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*)</${tag}>`, 'i').exec(html)?.[1] ?? null;

/**
 * The readable text of a page: the first `<article>`, else `<main>`, else the
 * whole page; tags, scripts and styles removed, whitespace collapsed. Good
 * enough to see that the words changed; not a full HTML parser.
 */
export function htmlText(html: string): string {
  const region = firstBlock(html, 'article') ?? firstBlock(html, 'main') ?? html;
  return region
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#?\w+);/g, (m, name: string) => ENTITIES[name] ?? numericEntity(name) ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

/** A feed's entries as `id updated` lines: a new release changes it, a re-render does not. */
export function feedEntries(xml: string): string {
  const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return entries
    .map((entry) => {
      const id = /<id>([\s\S]*?)<\/id>/i.exec(entry)?.[1]?.trim() ?? '';
      const updated = /<updated>([\s\S]*?)<\/updated>/i.exec(entry)?.[1]?.trim() ?? '';
      return `${id} ${updated}`;
    })
    .join('\n');
}

/** Text to hash for one response. Markdown and plain text: trimmed. HTML: htmlText. Feeds: entries. */
export function normalise(contentType: string, body: string): string {
  const type = contentType.split(';')[0].trim().toLowerCase();
  if (type === 'text/html' || type === 'application/xhtml+xml') return htmlText(body);
  if (type.endsWith('+xml') || type.endsWith('/xml')) return feedEntries(body);
  return body.replace(/\r\n/g, '\n').trim();
}

export const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

// ── State step ────────────────────────────────────────────────────────────

/** One fetch: a hash, or an error that leaves the stored hash alone. */
export type DocsWatchResult =
  | { target: DocsWatchTarget; ok: true; hash: string }
  | { target: DocsWatchTarget; ok: false; error: string };

export const EMPTY_DOCS_WATCH_STATE: DocsWatchState = { pages: {}, pending: [], issue: null };

/**
 * The next hashes.json from this run's results. Pure.
 * - A URL with no stored hash is recorded, never reported (first run, new citation).
 * - A different hash → `changedAt` moves and the URL joins `pending` (one row per URL).
 * - An error keeps the stored hash, so the next good fetch still compares to it.
 * - `issueClosed` (the docs-changed issue was closed = handled) clears `pending` first.
 * - Pages no lesson or source points at any more are dropped.
 */
export function nextState(
  prev: DocsWatchState,
  results: readonly DocsWatchResult[],
  now: string,
  issueClosed: boolean,
): { state: DocsWatchState; changed: DocsWatchPending[] } {
  const pending = new Map(issueClosed ? [] : prev.pending.map((p) => [p.url, p]));
  const pages: DocsWatchState['pages'] = {};
  const changed: DocsWatchPending[] = [];
  for (const result of results) {
    const { url, sourceId, lessons } = result.target;
    const old = prev.pages[url];
    if (!result.ok) {
      if (old) pages[url] = old;
      continue;
    }
    if (!old) {
      pages[url] = { hash: result.hash, checkedAt: now, changedAt: now };
    } else if (old.hash === result.hash) {
      pages[url] = { ...old, checkedAt: now };
    } else {
      pages[url] = { hash: result.hash, checkedAt: now, changedAt: now };
      const row = { url, sourceId, changedAt: now, lessons: [...lessons] };
      pending.set(url, row);
      changed.push(row);
    }
  }
  const sorted = Object.fromEntries(Object.entries(pages).sort(([a], [b]) => a.localeCompare(b)));
  return {
    state: {
      pages: sorted,
      pending: [...pending.values()],
      issue: issueClosed ? null : prev.issue,
    },
    changed,
  };
}

// ── Issue body ────────────────────────────────────────────────────────────

/** The docs-changed issue body. URLs, source ids, dates and lesson ids only. */
export function renderIssue(pending: readonly DocsWatchPending[]): string {
  const rows = [...pending]
    .sort((a, b) => a.changedAt.localeCompare(b.changedAt) || a.url.localeCompare(b.url))
    .map((p) => {
      const lessons = p.lessons.length > 0 ? p.lessons.map((id) => `\`${id}\``).join(', ') : '—';
      // A `|` would end the table cell; %7C is the same URL.
      return `| ${p.url.replaceAll('|', '%7C')} | \`${p.sourceId}\` | ${p.changedAt.slice(0, 10)} | ${lessons} |`;
    });
  return [
    '<!-- Written by the docs-watch workflow. Edits here are overwritten on the next run. -->',
    `Official pages changed since they were last handled: **${pending.length}**.`,
    '',
    'The knowledge-sync routine reads this list, checks each citing lesson against the live page, and opens `new-level` PRs into `canary`. **Close this issue once every row is handled**; the next run then starts a fresh list.',
    '',
    '| Page | Source | Changed | Citing lessons |',
    '| ---- | ------ | ------- | -------------- |',
    ...rows,
    '',
  ].join('\n');
}
