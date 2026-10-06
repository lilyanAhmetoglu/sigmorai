import type { Metadata } from 'next';
import { MarketingHeader } from '@/components/hud/marketing-header';
import { Panel } from '@/components/panel';
import {
  MAIN_CONTENT_ID,
  PRIVACY_HREF,
  PRIVACY_META,
  PRIVACY_SECTIONS,
  PRIVACY_TEXT,
} from '@/lib/constants';

export const metadata: Metadata = {
  title: { absolute: PRIVACY_META.title },
  description: PRIVACY_META.description,
  alternates: { canonical: PRIVACY_HREF },
};

/** Privacy page: what we store, why, processors, retention, rights, cookies. Static. */
export default function PrivacyPage() {
  return (
    <>
      <MarketingHeader />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="max-w-reading mx-auto flex w-full min-w-0 flex-1 flex-col gap-6 px-4 py-8"
      >
        <div className="flex flex-col gap-3">
          <p className="page-eyebrow">{PRIVACY_TEXT.eyebrow}</p>
          <h1 className="page-title">{PRIVACY_TEXT.title}</h1>
          <p className="text-small text-text-3 m-0">
            {PRIVACY_TEXT.updatedLabel}: {PRIVACY_TEXT.updated}
          </p>
          <p className="page-intro">{PRIVACY_TEXT.intro}</p>
        </div>

        {PRIVACY_SECTIONS.map((section) => (
          <Panel key={section.id} aria-labelledby={section.id} className="flex flex-col gap-3">
            <h2 id={section.id} className="font-display text-h4 m-0 leading-tight">
              {section.heading}
            </h2>
            {section.paragraphs?.map((text) => (
              <p key={text} className="text-body leading-body text-text-2 m-0">
                {text}
              </p>
            ))}
            {section.items && (
              <dl className="m-0 flex flex-col gap-3">
                {section.items.map((item) => (
                  <div key={item.term} className="flex flex-col gap-1">
                    <dt className="font-body text-body text-text-1 font-bold">{item.term}</dt>
                    <dd className="text-body leading-body text-text-2 m-0">
                      {item.text}
                      {item.link && (
                        <>
                          {' '}
                          <a href={item.link.href} rel="noopener noreferrer">
                            {item.link.label}
                          </a>
                          .
                        </>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Panel>
        ))}
      </main>
    </>
  );
}
