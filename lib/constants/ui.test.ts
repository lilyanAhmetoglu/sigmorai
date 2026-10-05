import { describe, expect, test } from 'bun:test';
import {
  ACCENTS,
  AVATAR_PALETTE_COUNT,
  AVATAR_SIZES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  CHOICE_STATES,
  LEVEL_STATUSES,
  PANEL_PADDINGS,
  PANEL_TONES,
  QUEST_STATUSES,
} from './ui';

// Guards against drift: every option name in TS needs a CSS rule, and the
// reverse. The base-styled value (usually the default) has no rule.
const CSS_DIR = `${import.meta.dir}/../../app/styles/components`;

async function cssNames(file: string, attr: string): Promise<string[]> {
  const css = await Bun.file(`${CSS_DIR}/${file}`).text();
  const re = new RegExp(`\\[data-${attr}='([^']+)'\\]`, 'g');
  return [...new Set([...css.matchAll(re)].map((m) => m[1]))].sort();
}

const without = (list: readonly string[], ...skip: string[]) =>
  list.filter((x) => !skip.includes(x)).sort();

describe('option lists match their CSS', () => {
  test.each([
    ['pixel-button.css', 'variant', without(BUTTON_VARIANTS, 'primary')],
    ['pixel-button.css', 'size', without(BUTTON_SIZES, 'md')],
    ['panel.css', 'tone', without(PANEL_TONES, 'default')],
    ['panel.css', 'padding', without(PANEL_PADDINGS, 'md')],
    ['pixel-avatar.css', 'size', without(AVATAR_SIZES, 'md')],
    ['accents.css', 'accent', without(ACCENTS)],
    ['choice.css', 'state', without(CHOICE_STATES)],
    ['level-node.css', 'status', without(LEVEL_STATUSES, 'open')],
    // "done" is PixelButton's secondary variant, not a quest-card rule
    ['quest-card.css', 'status', without(QUEST_STATUSES, 'done')],
  ])('%s data-%s', async (file, attr, expected) => {
    expect(await cssNames(file, attr)).toEqual(expected);
  });

  test('pixel-avatar.css defines AVATAR_PALETTE_COUNT palettes', async () => {
    expect((await cssNames('pixel-avatar.css', 'palette')).length).toBe(AVATAR_PALETTE_COUNT);
  });
});
