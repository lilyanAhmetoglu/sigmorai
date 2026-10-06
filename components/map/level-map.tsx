import type { CSSProperties } from 'react';
import { LevelNode } from '@/components/level-node';
import { RealmScene } from '@/components/realms/realm-scene';
import { LEVEL_MAP, levelNodeX, MAP_TEXT, questHref, REALMS_TEXT } from '@/lib/constants';
import { realmAccent } from '@/lib/content/curriculum';
import { levelStatus, playableStep } from '@/lib/grading/track-map';
import type { RealmView } from '@/lib/types';
import { ScrollToCurrent } from './scroll-to-current';

type Props = {
  realm: RealmView;
  /** The exercise id of the player's next step in this realm, if any. */
  nextId?: string;
};

const SCROLLER_ID = 'level-map';
const HEADING_ID = 'level-map-heading';

/** Stage size and ground line in screen px, from LEVEL_MAP, for level-map.css. */
const STAGE_STYLE = {
  '--map-w': `${LEVEL_MAP.width * LEVEL_MAP.scale}px`,
  '--map-h': `${LEVEL_MAP.height * LEVEL_MAP.scale}px`,
  '--map-ground': `${LEVEL_MAP.groundY * LEVEL_MAP.scale}px`,
} as CSSProperties;

/**
 * One realm's level map (Sigmorai App.dc.html → isMap): the four art layers
 * at exactly 2× in a strip that scrolls sideways, and a node per chapter plus
 * the boss on the ground line. The art is decoration; the nodes are real
 * links (or aria-disabled buttons when locked). Parallax: level-map.css.
 */
export function LevelMap({ realm, nextId }: Props) {
  const accent = realmAccent(realm.id);
  return (
    <section aria-labelledby={HEADING_ID} className="level-map" id={SCROLLER_ID}>
      <h2 id={HEADING_ID} className="sr-only">
        {MAP_TEXT.levels}
      </h2>
      <div className="level-map-stage" style={STAGE_STYLE}>
        <RealmScene realm={realm.id} sizes={`${LEVEL_MAP.width * LEVEL_MAP.scale}px`} preload />
        <ol className="level-map-nodes">
          {realm.chapters.map((chapter, i) => {
            const isCurrent = chapter.steps.some((s) => s.exerciseId === nextId);
            const status = levelStatus(chapter, isCurrent);
            const step = playableStep(chapter);
            const node = {
              index: chapter.chapter ?? REALMS_TEXT.bossGlyph,
              label: chapter.title,
              accent,
              boss: chapter.chapter === null,
            };
            return (
              <li
                key={chapter.chapter ?? 'boss'}
                className="level-map-node"
                data-boss={node.boss || undefined}
                style={{ '--node-x': `${levelNodeX(i)}px` } as CSSProperties}
              >
                {step ? (
                  <LevelNode {...node} status={status} href={questHref(step.exerciseId)} />
                ) : (
                  // Nothing to play: a locked, aria-disabled button.
                  <LevelNode {...node} status="locked" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
      {/* Keyed on the next step: a new current node re-runs the centring. */}
      <ScrollToCurrent key={nextId ?? 'none'} scrollerId={SCROLLER_ID} />
    </section>
  );
}

/** The empty strip at full size, for loading.tsx (no layout jump). */
export function LevelMapSkeleton() {
  return (
    <div className="level-map">
      <div className="level-map-stage" style={STAGE_STYLE} />
    </div>
  );
}
