import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
