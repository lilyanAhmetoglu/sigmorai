import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ContinueCard } from '@/components/dashboard/continue-card';
import { DailyQuest } from '@/components/dashboard/daily-quest';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RealmTile } from '@/components/dashboard/realm-tile';
import { Panel } from '@/components/panel';
import { AUTH_ROUTES, DASHBOARD_TEXT, ONBOARDING_HREF, REALMS_HREF } from '@/lib/constants';
import { getDashboard } from '@/lib/data/realms';

export const metadata: Metadata = { title: `${DASHBOARD_TEXT.title} · Sigmorai` };

const CONTINUE_ID = 'dashboard-continue';
const REALMS_ID = 'dashboard-realms';

/**
 * The player's home (Sigmorai App.dc.html → isDash): the next open step on
 * their track, their stats and their active realms. Every state is computed
 * on the server (lib/data/realms.ts).
 * Not built yet: the Math Tower and Frontier shortcuts (no routes yet, step 6)
 * and the realm scene art.
 */
export default async function DashboardPage() {
  const page = await getDashboard();
  if (page.status === 'signed-out') redirect(AUTH_ROUTES.signIn);
  if (page.status === 'onboarding') redirect(ONBOARDING_HREF);

  const { stats, map, active, levelsCleared } = page;

  return (
    <div className="max-w-app mx-auto flex w-full flex-wrap items-start gap-6 px-4 py-6">
      <div className="flex min-w-0 flex-[3_1_34rem] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="page-eyebrow">{DASHBOARD_TEXT.eyebrow}</p>
          <h1 className="page-title">{DASHBOARD_TEXT.greeting(stats.heroName)}</h1>
        </header>

        <section aria-labelledby={CONTINUE_ID} className="flex flex-col gap-3">
          <h2 id={CONTINUE_ID} className="page-eyebrow">
            {DASHBOARD_TEXT.continueHeading}
          </h2>
          <ContinueCard next={map.next} realms={map.realms} />
        </section>

        <section aria-labelledby={REALMS_ID} className="flex flex-col gap-3">
          <div className="section-head">
            <h2 id={REALMS_ID} className="page-eyebrow">
              {DASHBOARD_TEXT.realmsHeading}
            </h2>
            <Link href={REALMS_HREF} className="section-link">
              {DASHBOARD_TEXT.browseAll}
              <span aria-hidden="true">{DASHBOARD_TEXT.browseIcon}</span>
            </Link>
          </div>
          {active.length > 0 ? (
            <ul className="tile-grid">
              {active.map((realm) => (
                <li key={realm.id}>
                  <RealmTile realm={realm} />
                </li>
              ))}
            </ul>
          ) : (
            <Panel tone="sunken">
              <p className="text-body leading-body m-0">{DASHBOARD_TEXT.noActiveRealms}</p>
            </Panel>
          )}
        </section>
      </div>

      <aside className="flex min-w-0 flex-[1_1_16rem] flex-col gap-4 pt-4">
        <DashboardStats streak={stats.streak} levelsCleared={levelsCleared} />
        <DailyQuest streak={stats.streak} activeToday={stats.activeToday} />
      </aside>
    </div>
  );
}
