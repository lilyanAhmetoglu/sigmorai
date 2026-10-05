import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/badge';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { QUEST_BACK_HREF, QUEST_TEXT } from '@/lib/constants';
import { getQuestPage } from '@/lib/data/quest';

export const metadata: Metadata = { title: 'Quest · Sigmorai' };

/**
 * The quest page (Sigmorai App.dc.html → isQuestTech). A catch-all, because
 * exercise ids contain `/`: /quest/builder/r0/c1/challenge. No step is
 * playable yet: every real step shows a plain "not available yet" until the
 * case form and quick checks (Phase C) and the lesson page (SIG-11) land.
 */
export default async function QuestPage({ params }: PageProps<'/quest/[...exercise]'>) {
  const { exercise } = await params;
  const page = await getQuestPage(exercise.join('/'));

  if (page.kind === 'not-found') notFound();
  if (page.kind === 'locked') {
    return <QuestNotice badge={QUEST_TEXT.locked} message={page.message} />;
  }
  return <QuestNotice message={QUEST_TEXT.notAvailable} hint={QUEST_TEXT.notAvailableHint} />;
}

/** Locked or not built yet: the reason as text (plus a LOCKED tag) and a way back. */
function QuestNotice({ badge, message, hint }: { badge?: string; message: string; hint?: string }) {
  return (
    <div className="max-w-reading mx-auto flex w-full flex-col gap-4 px-4 py-10">
      <h1 className="sr-only">{QUEST_TEXT.noticeHeading}</h1>
      <Panel tone="sunken" className="flex flex-col items-start gap-3">
        {badge && <Badge accent="danger">{badge}</Badge>}
        <p className="text-body leading-body m-0">{message}</p>
        {hint && <p className="text-small leading-body text-text-2 m-0">{hint}</p>}
        <PixelButton
          href={QUEST_BACK_HREF}
          variant="secondary"
          icon={<span aria-hidden="true">{QUEST_TEXT.backIcon}</span>}
        >
          {QUEST_TEXT.back}
        </PixelButton>
      </Panel>
    </div>
  );
}
