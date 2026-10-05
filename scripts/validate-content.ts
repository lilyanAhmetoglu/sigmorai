// `bun run content:check`: validates every file under content/ with the app's
// own Zod loaders (lib/content/validate.ts). Shape only, no model, no network.
// Exits 1 and lists each bad file. Facts are checked by the content-reviewer
// agent (.claude/skills/validate-content/SKILL.md).
import { CONTENT_DIR } from '@/lib/constants';
import { validateContent } from '@/lib/content/validate';

const issues = await validateContent();
for (const { file, message } of issues) {
  console.error(`✗ ${CONTENT_DIR}/${file}\n  ${message.replaceAll('\n', '\n  ')}`);
}
console.log(
  issues.length === 0
    ? 'content:check: every content file is valid'
    : `content:check: ${issues.length} problem(s)`,
);
process.exitCode = issues.length > 0 ? 1 : 0;
