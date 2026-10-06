import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/badge';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { AnswerForm } from '@/components/quest/answer-form';
import { LessonBody } from '@/components/quest/lesson-body';
import { LessonDone } from '@/components/quest/lesson-done';
import { SourceList } from '@/components/quest/source-list';
import { Tabs } from '@/components/tabs';
import { QUEST_TEXT, SITE_NAME } from '@/lib/constants';
import { questBackHref } from '@/lib/content/ids';
import { getLessonMeta, getQuestPage, type QuestPage as QuestPageData } from '@/lib/data/quest';

/**
 * A lesson gets its own title, description (the realm's topic) and canonical;
 * every other quest step keeps the plain title. Relative URLs resolve against
 * metadataBase (app/layout.tsx). The sitemap is a later ticket.
 */
export async function generateMetadata({
  params,
}: PageProps<'/quest/[...exercise]'>): Promise<Metadata> {
  const { exercise } = await params;
  const meta = await getLessonMeta(exercise.join('/'));
  if (!meta) return { title: `Quest · ${SITE_NAME}` };
  return {
    title: `${meta.title} · ${SITE_NAME}`,
    description: meta.description,
    alternates: { canonical: meta.canonical },
  };
}

/** One exhibit per page, so a fixed id is safe. */
const EXHIBIT_TITLE_ID = 'quest-exhibit-title';

/**
 * The quest page (Sigmorai App.dc.html → isQuestBiz). A catch-all, because
 * exercise ids contain `/`: /quest/strategist/r0/c1/challenge. Lessons, cases
 * (chapter and boss) and quick checks, both tracks. For a case or quick check
 * the browser gets the public, shuffled view only. Lessons are public; their
 * NPC lines are the <DialogBox> blocks inside the lesson body. Math Tower and
 * Frontier steps show a plain "not available yet".
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
  if (page.kind === 'lesson') return <LessonPage page={page} backHref={backHref} />;

  const { sheet, scenario, exhibit, tag, accent, viewer, nextHref, lessonHref } = page;
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
        <AnswerForm
          key={sheet.exerciseId}
          sheet={sheet}
          viewer={viewer}
          nextHref={nextHref}
          lessonHref={lessonHref}
        />
      </div>
    </div>
  );
}

type LessonPageProps = {
  page: Extract<QuestPageData, { kind: 'lesson' }>;
  backHref: string;
};

/**
 * A lesson (Sigmorai App.dc.html → quest screen, tabLesson / tabSources): the
 * title, LESSON | SOURCES tabs on the left, the "Lesson done" panel on the right.
 */
function LessonPage({ page, backHref }: LessonPageProps) {
  const { exerciseId, lesson, tag, accent, npc, viewer, nextHref } = page;
  const { title, minutes, sources } = lesson.frontmatter;
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
          <div className="flex flex-col gap-2">
            <h1 className="quest-title">{title}</h1>
            <p className="quest-note">{QUEST_TEXT.minutes(minutes)}</p>
          </div>
          <Tabs
            label={QUEST_TEXT.lessonTabsLabel}
            items={[
              { label: QUEST_TEXT.lessonTab, content: <LessonBody body={lesson.body} npc={npc} /> },
              { label: QUEST_TEXT.sourcesTab, content: <SourceList sources={sources} /> },
            ]}
          />
        </section>
        <LessonDone
          key={exerciseId}
          exerciseId={exerciseId}
          title={title}
          viewer={viewer}
          nextHref={nextHref}
        />
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
