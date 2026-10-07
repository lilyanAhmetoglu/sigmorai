import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CopyField } from '@/components/cert/copy-field';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { ShareButtons } from '@/components/share-buttons';
import {
  CERT_TEXT,
  certHref,
  certificateId,
  certImageFilename,
  certImageHref,
  LINKEDIN_ADD_CERT_URL,
  SITE_NAME,
  SITE_URL,
} from '@/lib/constants';
import { getCertificate } from '@/lib/data/certificates';
import { socialMetadata } from '@/lib/og/metadata';
import { absoluteUrl, dateLabel } from '@/lib/utils';

type Props = PageProps<'/cert/[id]/[achievement]'>;

/** Public but not indexed (spec): a link is a capability, not a search result. */
const ROBOTS: Metadata['robots'] = { index: false, follow: false };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, achievement } = await params;
  const cert = await getCertificate(id, achievement);
  if (!cert) return { title: CERT_TEXT.missingTitle, robots: ROBOTS };
  const title = `${cert.achievement.title} · ${SITE_NAME}`;
  const description = CERT_TEXT.description(cert.achievement.title, cert.heroName);
  return {
    title,
    description,
    robots: ROBOTS,
    ...socialMetadata({ title, description, url: certHref(cert.publicId, cert.achievement.slug) }),
  };
}

/**
 * A public certificate (SIG-47): the hero name, path, achievement, earned
 * date and certificate id, a PNG download, share buttons and the five
 * LinkedIn fields. Public, no session. Only the fields of CertificateView
 * reach this page. The layout already 404s a miss; the check here only
 * narrows the type. Print (Save as PDF) keeps only the certificate panel.
 */
export default async function CertificatePage({ params }: Props) {
  const { id, achievement } = await params;
  const cert = await getCertificate(id, achievement);
  if (!cert) notFound();

  const { publicId, heroName, earnedOn } = cert;
  const { slug, title, pathLabel, linkedInName } = cert.achievement;
  const href = certHref(publicId, slug);
  const credentialId = certificateId(publicId, slug);
  const earned = dateLabel(earnedOn);
  const proof = cert.achievement.kind === 'realm' ? CERT_TEXT.realmProof : CERT_TEXT.mathProof;

  const linkedInFields = [
    { label: CERT_TEXT.fields.name, value: linkedInName },
    { label: CERT_TEXT.fields.issuer, value: CERT_TEXT.issuer },
    { label: CERT_TEXT.fields.issueDate, value: earned },
    { label: CERT_TEXT.fields.credentialId, value: credentialId },
    { label: CERT_TEXT.fields.credentialUrl, value: absoluteUrl(SITE_URL, href) },
  ];

  return (
    <div className="max-w-reading mx-auto flex w-full flex-col gap-8 px-4 py-6">
      <Panel
        title={CERT_TEXT.panel}
        accent="xp"
        padding="lg"
        className="cert-sheet flex flex-col gap-6 pt-10"
      >
        <header className="flex flex-col gap-2">
          <p className="page-eyebrow">{pathLabel}</p>
          <h1 className="page-title">{title}</h1>
          <p className="text-body leading-body text-text-2 m-0">{proof}</p>
        </header>
        <dl className="cert-facts">
          <div className="cert-fact">
            <dt>{CERT_TEXT.heroLabel}</dt>
            <dd>{heroName}</dd>
          </div>
          <div className="cert-fact">
            <dt>{CERT_TEXT.earnedLabel}</dt>
            <dd>
              <time dateTime={earnedOn}>{earned}</time>
            </dd>
          </div>
          <div className="cert-fact">
            <dt>{CERT_TEXT.fields.issuer}</dt>
            <dd>{CERT_TEXT.issuer}</dd>
          </div>
          <div className="cert-fact">
            <dt>{CERT_TEXT.idLabel}</dt>
            <dd className="font-code text-small">{credentialId}</dd>
          </div>
        </dl>
        <div className="cert-no-print flex flex-col items-start gap-2">
          {/* `download` makes next/link skip client navigation; no prefetch of an image route. */}
          <PixelButton
            href={certImageHref(publicId, slug)}
            download={certImageFilename(slug)}
            prefetch={false}
            variant="secondary"
          >
            {CERT_TEXT.download}
          </PixelButton>
          <p className="text-small leading-body text-text-3 m-0">{CERT_TEXT.print}</p>
        </div>
      </Panel>

      <ShareButtons
        className="cert-no-print"
        heading={CERT_TEXT.shareHeading}
        target={{ url: href, text: CERT_TEXT.share(title) }}
      />

      <Panel
        title={CERT_TEXT.linkedInHeading}
        titleAs="h2"
        accent="info"
        className="cert-no-print flex flex-col gap-5 pt-8"
      >
        <p className="text-body leading-body text-text-2 m-0">{CERT_TEXT.linkedInIntro}</p>
        <div>
          <PixelButton
            href={LINKEDIN_ADD_CERT_URL}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            aria-label={CERT_TEXT.linkedInLabel}
          >
            {CERT_TEXT.linkedInButton}
          </PixelButton>
        </div>
        <div className="flex flex-col gap-3">
          {linkedInFields.map((field) => (
            <CopyField key={field.label} label={field.label} value={field.value} />
          ))}
        </div>
      </Panel>
    </div>
  );
}
