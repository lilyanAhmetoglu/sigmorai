import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';

type Props = {
  /** The page's only h1, for screen readers (the message says it on screen). */
  title: string;
  /** Plain technical copy: what is missing. */
  message: string;
  back: { href: string; label: string; icon: string };
};

/**
 * Body of an in-app not-found.tsx (sibling of RouteError). It renders inside
 * the (app) layout, so it brings no header or footer of its own.
 */
export function RouteNotFound({ title, message, back }: Props) {
  return (
    <div className="max-w-reading mx-auto flex w-full flex-col gap-4 px-4 py-10">
      <h1 className="sr-only">{title}</h1>
      <Panel tone="sunken" className="flex flex-col items-start gap-3">
        <p className="text-body leading-body m-0">{message}</p>
        <PixelButton
          href={back.href}
          variant="secondary"
          icon={<span aria-hidden="true">{back.icon}</span>}
        >
          {back.label}
        </PixelButton>
      </Panel>
    </div>
  );
}
