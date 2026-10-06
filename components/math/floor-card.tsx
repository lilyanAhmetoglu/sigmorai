import Link from 'next/link';
import { StatusBadge } from '@/components/realms/status-badge';
import { floorNotOpenText, MATH_TEXT, questHref, STEP_STATUS_TEXT } from '@/lib/constants';
import type { FloorView } from '@/lib/data/math';
import { playableStep } from '@/lib/grading/track-map';

type Props = { floor: FloorView };

/**
 * One Math Tower floor: number, state (icon + word), name, what it covers and
 * its formulas. The whole card is one link when a step can be played (its
 * first open step, or the lesson again when the floor is done); a locked or
 * not-yet-built floor is a plain box. Server component. Styles: realms.css.
 */
export function FloorCard({ floor }: Props) {
  const n = floor.chapter!;
  const step = playableStep(floor);
  const body = (
    <>
      <p className="floor-card-head">
        <span className="floor-card-tag">{MATH_TEXT.floorLabel(n)}</span>
        <StatusBadge text={STEP_STATUS_TEXT[floor.status]} />
      </p>
      <h3 className="floor-card-name">{floor.title}</h3>
      <p className="floor-card-covers">{floor.covers}</p>
      <ul className="floor-card-formulas" aria-label={MATH_TEXT.formulas}>
        {floor.formulas.map((formula) => (
          <li key={formula.math}>
            <code aria-hidden="true">{formula.math}</code>
            <span className="sr-only">{formula.text}</span>
          </li>
        ))}
      </ul>
      {floor.status === 'locked' && <p className="floor-card-hint">{floorNotOpenText(n - 1)}</p>}
    </>
  );
  return step ? (
    <Link href={questHref(step.exerciseId)} className="floor-card" data-status={floor.status}>
      {body}
    </Link>
  ) : (
    <div className="floor-card" data-status={floor.status}>
      {body}
    </div>
  );
}
