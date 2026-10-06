import { REALM_ACTION_TEXT } from '@/lib/constants';
import type { RealmStatus } from '@/lib/types';

type Props = { status: RealmStatus; name: string };

/**
 * A realm button's text: the visible verb ("Start") plus the realm name for
 * screen readers and crawlers ("Start: Bootstrap Village"), so the link makes
 * sense on its own. Visible text first, so voice control still matches it.
 */
export function RealmActionLabel({ status, name }: Props) {
  return (
    <>
      {REALM_ACTION_TEXT[status]}
      <span className="sr-only">: {name}</span>
    </>
  );
}
