import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { XPBar } from '@/components/xp-bar';
import {
  DASHBOARD_TEXT,
  QUEST_TEXT,
  questHref,
  MAP_HREF,
  REALMS_TEXT,
  STEP_TEXT,
} from '@/lib/constants';
import { realmAccent } from '@/lib/content/curriculum';
import type { NextStep, RealmView } from '@/lib/types';
import { RealmActionLabel } from '@/components/realms/realm-action-label';
import { RealmScene } from '@/components/realms/realm-scene';

type Props = {
  next: NextStep | null;
  realms: RealmView[];
};

/**
 * "Continue learning" (design: isDash): the first open step on the player's
 * track, or a plain empty state when nothing is open. Styles: realms.css.
 */
export function ContinueCard({ next, realms }: Props) {
  if (!next) {
    return (
      <Panel tone="sunken" className="flex flex-col items-start gap-3">
        <p className="text-body leading-body m-0">{DASHBOARD_TEXT.nothingOpen}</p>
        <p className="text-small leading-body text-text-2 m-0">{DASHBOARD_TEXT.nothingOpenHint}</p>
        <PixelButton href={MAP_HREF} variant="secondary">
          {DASHBOARD_TEXT.browseAll}
        </PixelButton>
      </Panel>
    );
  }

  const realm = realms.find((r) => r.id === next.realm)!;
  const chapter = realm.chapters.find((c) => c.chapter === next.chapter)!;
  const where = next.chapter === null ? QUEST_TEXT.bossTag : QUEST_TEXT.chapterTag(next.chapter);
  const step = STEP_TEXT[next.step.step];

  return (
    <Panel className="continue-card" data-accent={realmAccent(realm.id)}>
      <RealmScene realm={realm.id} sizes="256px" className="continue-card-scene" />
      <div className="continue-card-body">
        <p className="continue-card-tag">{[realm.name, where, step].join(' · ')}</p>
        <h3 className="continue-card-title">{chapter.title}</h3>
        <XPBar
          label={REALMS_TEXT.clearedLabel}
          value={realm.cleared}
          max={realm.chapters.length}
          segments={realm.chapters.length}
          accent={realmAccent(realm.id)}
        />
      </div>
      <PixelButton href={questHref(next.step.exerciseId)}>
        <RealmActionLabel status={realm.status} name={realm.name} />
      </PixelButton>
    </Panel>
  );
}
