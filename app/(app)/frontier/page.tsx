import type { Metadata } from 'next';
import Link from 'next/link';
import { ChapterCard } from '@/components/frontier/chapter-card';
import { Panel } from '@/components/panel';
import { SignInNote } from '@/components/realms/sign-in-note';
import { FRONTIER_HREF, FRONTIER_TEXT, MAP_HREF, SITE_NAME } from '@/lib/constants';
import { getFrontierPage } from '@/lib/data/frontier';
import { socialMetadata } from '@/lib/og/metadata';

const CHAPTERS_ID = 'frontier-chapters';

/** Relative URLs resolve against metadataBase (app/layout.tsx). No own OG image. */
export const metadata: Metadata = {
  title: `${FRONTIER_TEXT.title} · ${SITE_NAME}`,
  description: FRONTIER_TEXT.description,
  alternates: { canonical: FRONTIER_HREF },
  ...socialMetadata({
    title: `${FRONTIER_TEXT.title} · ${SITE_NAME}`,
    description: FRONTIER_TEXT.description,
    url: FRONTIER_HREF,
  }),
};

/**
 * The Frontier (side realm; curriculum plan, amendment 2026-10-07 SIG-29):
 * dated chapters on what is new in official docs, newest first. Public; a
 * visitor sees the chapters with no progress. Every chapter is open
 * (lib/grading/open.ts). No scene art and no NPC: plain product voice. With
 * no chapter, one empty-state panel and nothing else.
 */
export default async function FrontierPage() {
  const { viewer, chapters } = await getFrontierPage();

  return (
    <div className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6" data-accent="neutral">
      <Link href={MAP_HREF} className="realm-back">
        <span aria-hidden="true">{FRONTIER_TEXT.backIcon}</span>
        {FRONTIER_TEXT.back}
      </Link>

      <header className="flex flex-col gap-2">
        <p className="page-eyebrow">{FRONTIER_TEXT.eyebrow}</p>
        <h1 className="page-title">{FRONTIER_TEXT.title}</h1>
        {chapters.length > 0 && <p className="page-intro">{FRONTIER_TEXT.intro}</p>}
      </header>

      {chapters.length === 0 ? (
        <Panel tone="sunken">
          <p className="text-body leading-body m-0">{FRONTIER_TEXT.empty}</p>
        </Panel>
      ) : (
        <>
          {viewer === 'signed-out' && <SignInNote />}
          <section aria-labelledby={CHAPTERS_ID} className="flex flex-col gap-3">
            <h2 id={CHAPTERS_ID} className="page-eyebrow">
              {FRONTIER_TEXT.chaptersHeading}
            </h2>
            <ol className="card-grid">
              {chapters.map((chapter) => (
                <li key={chapter.folder}>
                  <ChapterCard chapter={chapter} />
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
