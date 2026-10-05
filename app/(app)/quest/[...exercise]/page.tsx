import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/badge';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { AnswerForm } from '@/components/quest/answer-form';
import { QUEST_TEXT } from '@/lib/constants';
import { questBackHref } from '@/lib/content/ids';
import { getQuestPage } from '@/lib/data/quest';

export const metadata: Metadata = { title: 'Quest · Sigmorai' };

/** One exhibit per page, so a fixed id is safe. */
const EXHIBIT_TITLE_ID = 'quest-exhibit-title';

/**
 * The quest page (Sigmorai App.dc.html → isQuestBiz). A catch-all, because
 * exercise ids contain `/`: /quest/strategist/r0/c1/challenge. Cases (chapter
 * and boss) and quick checks, both tracks. The browser gets the public,
 * shuffled view only. Lessons (SIG-11) show a plain "not available yet".
 * Known gap: the design's NPC DialogBox comes with the lesson page (SIG-11).
 */
export default async function QuestPage({ params }: PageProps<'/quest/[...exercise]'>) {
  const { exercise } = await params;
  const id = exercise.join('/');
  const page = await getQuestPage(id);
  const backHref = questBackHref(id);

  if (page.kind === 'not-found') notFound();
  if (page.kind === 'unavailable') {
    return (
      <QuestNotice
        backHref={backHref}
        message={QUEST_TEXT.notAvailable}
        hint={QUEST_TEXT.notAvailableHint}
      />
    );
  }
  if (page.kind === 'locked') {
    return <QuestNotice backHref={backHref} badge={QUEST_TEXT.locked} message={page.message} />;
  }

  const { sheet, scenario, exhibit, tag, accent, viewer, nextHref } = page;
  return (
    <div className="flex w-full flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="quest-top">
        <Link href={backHref} className="quest-back">
          <span aria-hidden="true">{QUEST_TEXT.backIcon}</span>
          {QUEST_TEXT.back}
        </Link>
        <p className="quest-tag" data-accent={accent}>
          {tag}
        </p>
      </div>
      <div className="quest-layout">
        <section className="flex min-w-0 flex-col gap-5">
          <h1 className="quest-title">{sheet.title}</h1>
          <p className="quest-prompt">{scenario ?? QUEST_TEXT.quickCheckIntro}</p>
          {exhibit && (
            <figure className="quest-exhibit">
              <figcaption id={EXHIBIT_TITLE_ID} className="quest-exhibit-title">
                {QUEST_TEXT.exhibit}
              </figcaption>
              {/* Focusable so a keyboard user can scroll a wide exhibit sideways; named for that stop. */}
              <pre
                className="quest-exhibit-body"
                tabIndex={0}
                role="region"
                aria-labelledby={EXHIBIT_TITLE_ID}
              >
                {exhibit}
              </pre>
            </figure>
          )}
        </section>
        <AnswerForm key={sheet.exerciseId} sheet={sheet} viewer={viewer} nextHref={nextHref} />
      </div>
    </div>
  );
}

/** Locked or not built yet: the reason as text (plus a LOCKED tag) and a way back. */
type NoticeProps = { backHref: string; badge?: string; message: string; hint?: string };

function QuestNotice({ backHref, badge, message, hint }: NoticeProps) {
  return (
    <div className="max-w-reading mx-auto flex w-full flex-col gap-4 px-4 py-10">
      <h1 className="sr-only">{QUEST_TEXT.noticeHeading}</h1>
      <Panel tone="sunken" className="flex flex-col items-start gap-3">
        {badge && <Badge accent="danger">{badge}</Badge>}
        <p className="text-body leading-body m-0">{message}</p>
        {hint && <p className="text-small leading-body text-text-2 m-0">{hint}</p>}
        <PixelButton
          href={backHref}
          variant="secondary"
          icon={<span aria-hidden="true">{QUEST_TEXT.backIcon}</span>}
        >
          {QUEST_TEXT.back}
        </PixelButton>
      </Panel>
    </div>
  );
}
