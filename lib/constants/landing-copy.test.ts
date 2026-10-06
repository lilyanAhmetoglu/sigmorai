import { describe, expect, test } from 'bun:test';
import { SHARE_IMAGE } from './landing-copy';

// The share image can't read CSS variables, so its colours are copies. This
// keeps them equal to the tokens they name.
const COLORS_CSS = `${import.meta.dir}/../../app/styles/tokens/colors.css`;

const TOKEN_FOR: Record<keyof typeof SHARE_IMAGE.colors, string> = {
  outline: '--ink-950',
  surface: '--ink-900',
  text: '--ink-100',
  accent: '--spark-500',
};

describe('SHARE_IMAGE.colors', () => {
  test('match the token values in colors.css', async () => {
    const css = await Bun.file(COLORS_CSS).text();
    for (const [key, token] of Object.entries(TOKEN_FOR)) {
      const match = css.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
      expect(match?.[1]?.toLowerCase()).toBe(
        SHARE_IMAGE.colors[key as keyof typeof TOKEN_FOR].toLowerCase(),
      );
    }
  });
});
