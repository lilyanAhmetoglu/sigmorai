import { Badge } from '@/components/badge';
import type { Accent } from '@/lib/types';

type Props = { text: { icon: string; label: string; accent: Accent } };

/** A realm, chapter or step state as a Badge: an icon AND a word, never colour only. */
export function StatusBadge({ text }: Props) {
  return (
    <Badge accent={text.accent}>
      <span aria-hidden="true">{text.icon}</span>
      {text.label}
    </Badge>
  );
}
