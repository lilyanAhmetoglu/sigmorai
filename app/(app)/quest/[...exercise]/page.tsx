import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/badge';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { ChallengeWorkbench } from '@/components/quest/challenge-workbench';
import { QUEST_BACK_HREF, QUEST_TEXT } from '@/lib/constants';
import { getChallengePage } from '@/lib/data/quest';

/**
 * Seconds. Must be a literal. The Submit Server Action takes this page's
 * limit: RUN_TIMEOUT_MS (15s) + sandbox start + two short transactions.
 */
export const maxDuration = 30;

export const metadata: Metadata = { title: 'Quest · Sigmorai' };

/**
 * The quest page (Sigmorai App.dc.html → isQuestTech). A catch-all, because
 * exercise ids contain `/`: /quest/builder/r0/c1/challenge. Builder challenges
 * only for now; lessons (SIG-11), cases and quick checks (SIG-19) show a
 * plain "not available yet". The browser gets the public view only.
 * Known gap: the design's NPC DialogBox and Lesson / Sources tabs on the left
 * come with the lesson page (SIG-11); the prompt is plain text until then.
 */
export default async function QuestPage({ params }: PageProps<'/quest/[...exercise]'>) {
  const { exercise } = await params;
  const page = await getChallengePage(exercise.join('/'));

  if (page.kind === 'not-found') notFound();
  if (page.kind === 'unavailable') {
    return <QuestNotice message={QUEST_TEXT.notAvailable} hint={QUEST_TEXT.notAvailableHint} />;
  }
  if (page.kind === 'locked') {
    return <QuestNotice badge={QUEST_TEXT.locked} message={page.message} />;
  }

  const { challenge, tag, accent, viewer, nextHref } = page;
  return (
    <div className="flex w-full flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="quest-top">
        <Link href={QUEST_BACK_HREF} className="quest-back">
          <span aria-hidden="true">{QUEST_TEXT.backIcon}</span>
          {QUEST_TEXT.back}
        </Link>
        <p className="quest-tag" data-accent={accent}>
          {tag}
        </p>
      </div>
      <div className="quest-layout">
        <section className="flex min-w-0 flex-col gap-5">
          <h1 className="quest-title">{challenge.title}</h1>
          <p className="quest-prompt">{challenge.prompt}</p>
        </section>
        <ChallengeWorkbench challenge={challenge} viewer={viewer} nextHref={nextHref} />
      </div>
    </div>
  );
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
