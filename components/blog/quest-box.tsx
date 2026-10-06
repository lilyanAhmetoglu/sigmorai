import { PixelButton } from '@/components/pixel-button';
import { BLOG_TEXT, questHref } from '@/lib/constants';
import type { BlogPlace } from '@/lib/types';

type Props = {
  place: BlogPlace;
  /** The post's lesson id: the button opens it. */
  lesson: string;
};

/**
 * TRY THE QUEST (Sigmorai Blog.dc.html → showQuestCta): the realm-coloured
 * tab, "Practice this in <realm>", and a link to the post's lesson. The
 * design's "Write the code, pass the tests" is replaced: learners write no
 * code, they solve cases. Styles: blog.css.
 */
export function QuestBox({ place, lesson }: Props) {
  return (
    <section className="quest-box" data-accent={place.accent} aria-labelledby="quest-box-title">
      <p className="quest-box-tag">{BLOG_TEXT.questTag}</p>
      <h2 id="quest-box-title" className="quest-box-title">
        {BLOG_TEXT.questTitle(place.name)}
      </h2>
      <p className="quest-box-text">{BLOG_TEXT.questText}</p>
      <div>
        <PixelButton href={questHref(lesson)} aria-describedby="quest-box-title">
          {BLOG_TEXT.questAction}
          <span aria-hidden="true">{BLOG_TEXT.questActionIcon}</span>
        </PixelButton>
      </div>
    </section>
  );
}
