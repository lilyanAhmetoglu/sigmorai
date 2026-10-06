import type { Metadata } from 'next';
import Link from 'next/link';
import { FloorCard } from '@/components/math/floor-card';
import { RealmScene } from '@/components/realms/realm-scene';
import { SignInNote } from '@/components/realms/sign-in-note';
import { MATH_HREF, MATH_TEXT, REALMS_HREF, SITE_NAME } from '@/lib/constants';
import { MATH_ART } from '@/lib/content/curriculum';
import { getMathPage } from '@/lib/data/math';

const FLOORS_ID = 'math-floors';

/** Relative URLs resolve against metadataBase (app/layout.tsx). */
export const metadata: Metadata = {
  title: `${MATH_TEXT.title} · ${SITE_NAME}`,
  description: MATH_TEXT.description,
  alternates: { canonical: MATH_HREF },
};

/**
 * The Math Tower (side realm): scene hero, then one card per floor with its
 * state, what it covers and its formulas. Public; a visitor sees the floors
 * with no progress. A floor opens when the floor before it has its quick
 * check cleared (lib/grading/open.ts). Floors without content show COMING SOON.
 * Plain product voice: no NPC line on this page.
 */
export default async function MathPage() {
  const { viewer, floors } = await getMathPage();

  return (
    <div className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6" data-accent="math">
      <Link href={REALMS_HREF} className="realm-back">
        <span aria-hidden="true">{MATH_TEXT.backIcon}</span>
        {MATH_TEXT.back}
      </Link>

      <header className="realm-hero">
        <RealmScene art={MATH_ART} sizes="(min-width: 768px) 768px, 100vw" preload />
        <div className="realm-hero-copy">
          <p className="realm-tag">{MATH_TEXT.eyebrow}</p>
          <h1 className="page-title">{MATH_TEXT.title}</h1>
          <p className="realm-hero-topic">{MATH_TEXT.intro}</p>
        </div>
      </header>

      {viewer === 'signed-out' && <SignInNote />}

      <section aria-labelledby={FLOORS_ID} className="flex flex-col gap-3">
        <h2 id={FLOORS_ID} className="page-eyebrow">
          {MATH_TEXT.floorsHeading}
        </h2>
        <ol className="card-grid">
          {floors.map((floor) => (
            <li key={floor.chapter}>
              <FloorCard floor={floor} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
