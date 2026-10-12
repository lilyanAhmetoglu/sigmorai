import { describe, expect, test } from 'bun:test';
import { Glob } from 'bun';

/**
 * One header on every page (maintainer, 2026-10-08). These checks keep a page
 * without it, or a second header, from coming back. e2e/header.spec.ts checks
 * the rendered result.
 */
const ROOT = `${import.meta.dir}/../..`;

/** The only places that render SiteHeader: the (app) layout and the public-page shell. */
const SHELLS = ['app/(app)/layout.tsx', 'components/hud/public-shell.tsx'];

/** The pages that take the public-page shell: the (marketing) and (auth) layouts and the site 404. */
const PUBLIC_SHELLS = ['app/(marketing)/layout.tsx', 'app/(auth)/layout.tsx', 'app/not-found.tsx'];

const GROUPS = ['app/(app)/', 'app/(marketing)/', 'app/(auth)/'];

async function files(pattern: string): Promise<string[]> {
  return Array.fromAsync(new Glob(pattern).scan({ cwd: ROOT }));
}

describe('the one site header', () => {
  test('every page is inside the (app), (marketing) or (auth) group', async () => {
    const pages = await files('app/**/page.{ts,tsx,mdx}');
    expect(pages.length).toBeGreaterThan(0);
    const outside = pages.filter((path) => !GROUPS.some((group) => path.startsWith(group)));
    expect(outside).toEqual([]);
  });

  test('the (app) layout and the public shell render SiteHeader', async () => {
    for (const path of SHELLS) {
      const source = await Bun.file(`${ROOT}/${path}`).text();
      expect(source).toContain('<SiteHeader');
    }
  });

  test('the public group layouts and the site 404 render the public shell', async () => {
    for (const path of PUBLIC_SHELLS) {
      const source = await Bun.file(`${ROOT}/${path}`).text();
      expect(source).toContain('<PublicShell');
    }
  });

  test('no other component draws its own site header', async () => {
    const sources = await files('{app,components}/**/*.tsx');
    expect(sources).toContain('components/hud/site-header.tsx');
    const others: string[] = [];
    for (const path of sources) {
      if (path === 'components/hud/site-header.tsx') continue;
      const source = await Bun.file(`${ROOT}/${path}`).text();
      if (/className="site-header"/.test(source)) others.push(path);
    }
    expect(others).toEqual([]);
  });
});
