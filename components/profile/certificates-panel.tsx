import type { ReactNode } from 'react';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { CERT_TEXT } from '@/lib/constants';
import { getOwnCertificates } from '@/lib/data/certificates';
import { dateLabel } from '@/lib/utils';

/** The panel frame shared by every state, so loading → success doesn't jump. */
function Frame({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <Panel
      title={CERT_TEXT.profilePanel}
      titleAs="h2"
      accent="xp"
      className="flex flex-col gap-4 pt-8"
      aria-busy={busy || undefined}
    >
      <p className="text-body leading-body text-text-2 max-w-reading m-0">
        {CERT_TEXT.profileIntro}
      </p>
      {children}
    </Panel>
  );
}

/**
 * "Certificates" on /profile: each earned certificate with a View
 * certificate link (copy link, share and the LinkedIn fields are on that
 * page). Reads auth()'s own user only. Streams in under Suspense
 * (CertificatesSkeleton); a failed read shows CertificatesError.
 */
export async function CertificatesPanel() {
  const earned = await getOwnCertificates();

  return (
    <Frame>
      {earned.length === 0 ? (
        <p className="text-body leading-body text-text-3 m-0">{CERT_TEXT.profileEmpty}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {earned.map(({ achievement, earnedOn, href }) => (
            <li
              key={achievement.slug}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-display text-body-lg break-words">{achievement.title}</span>
                <span className="font-hud text-hud tracking-hud text-text-3">
                  {achievement.pathLabel} · <time dateTime={earnedOn}>{dateLabel(earnedOn)}</time>
                </span>
              </div>
              <PixelButton
                href={href}
                variant="secondary"
                size="sm"
                aria-label={CERT_TEXT.profileViewLabel(achievement.title)}
              >
                {CERT_TEXT.profileView}
              </PixelButton>
            </li>
          ))}
        </ul>
      )}
    </Frame>
  );
}

/** Loading state: the same frame with placeholder rows. No spinner. */
export function CertificatesSkeleton() {
  return (
    <Frame busy>
      <span role="status" className="sr-only">
        {CERT_TEXT.profileLoading}
      </span>
      <div className="bg-surface-1 h-11 w-full" />
    </Frame>
  );
}
