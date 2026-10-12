import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { postHeadings } from '@/lib/content/blog';

type Option = { text: string; correct?: boolean };
type Sheet = { questions: { prompt: string; options: Option[] }[] };
export type Answer = { prompt: string; right: string; wrong: string };

/**
 * Reads a chapter's case or quick-check file here in Node and returns, per
 * question, one correct and one wrong option text. Only the texts reach the
 * browser test: the page never gets the `correct` flag.
 */
export function answersFor(chapterDir: string, file: 'case.json' | 'quick-check.json'): Answer[] {
  const sheet = JSON.parse(readFileSync(join('content', chapterDir, file), 'utf8')) as Sheet;
  return sheet.questions.map(({ prompt, options }) => ({
    prompt,
    right: options.find((o) => o.correct)!.text,
    wrong: options.find((o) => !o.correct)!.text,
  }));
}

/** A chapter lesson's `##` heading texts, in order: one lesson step each (lesson-stepper.tsx). */
export function lessonStepTitles(chapterDir: string): string[] {
  const source = readFileSync(join('content', chapterDir, 'lesson.mdx'), 'utf8');
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
  return postHeadings(body).map((heading) => heading.text);
}

type Outline = { realms: { chapters: unknown[] }[] };

/** Stops on a realm's map: one per chapter in the track's outline, plus the boss. */
export function realmStopCount(track: string, realmIndex: number): number {
  const outline = JSON.parse(
    readFileSync(join('content', track, 'outline.json'), 'utf8'),
  ) as Outline;
  return outline.realms[realmIndex].chapters.length + 1;
}
