import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ContinueCard } from '@/components/dashboard/continue-card';
import { DailyQuest } from '@/components/dashboard/daily-quest';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { FrontierPanel } from '@/components/dashboard/frontier-panel';
import { TowerPanel } from '@/components/dashboard/tower-panel';
import { PathList } from '@/components/realms/path-list';
import {
  AUTH_ROUTES,
  DASHBOARD_TEXT,
  MAP_HREF,
  ONBOARDING_HREF,
  realmHref,
  WORLD_MAP_TEXT,
} from '@/lib/constants';
import { getFrontierSummary } from '@/lib/data/frontier';
import { getDashboard } from '@/lib/data/realms';
import { pathRealms } from '@/lib/grading/world-map';
import type { FrontierSummary } from '@/lib/types';

export const metadata: Metadata = { title: `${DASHBOARD_TEXT.title} · Sigmorai` };

const CONTINUE_ID = 'dashboard-continue';
const PATH_HEADING_ID = 'your-path';

/** The FRONTIER panel's summary, or null when its read fails (the panel says so). */
async function readFrontier(): Promise<FrontierSummary | null> {
  try {
    return await getFrontierSummary();
  } catch (error) {
    console.error('[dashboard] Frontier read failed', error);
    return null;
  }
}

/**
 * The player's home (Sigmorai App.dc.html → isDash): the next open step on
 * their track, their stats and their whole path ("YOUR PATH", the same list
 * as the world map; rows link to the realm page, as the old tiles did).
 * Every state is computed on the server (lib/data/realms.ts).
 * The Math Tower panel and MATH FLOORS stat come from the same read; the
 * FRONTIER panel from the Frontier's own read (lib/data/frontier.ts), done
 * only for a ready player. A Frontier failure shows in its panel only.
 */
export default async function DashboardPage() {
  const page = await getDashboard();
  if (page.status === 'signed-out') redirect(AUTH_ROUTES.signIn);
  if (page.status === 'onboarding') redirect(ONBOARDING_HREF);

  const { stats, map, levelsCleared, tower } = page;
  const frontier = await readFrontier();

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

        <section aria-labelledby={PATH_HEADING_ID} className="flex flex-col gap-3">
          <div className="section-head">
            <h2 id={PATH_HEADING_ID} className="page-eyebrow">
              {WORLD_MAP_TEXT.pathHeading}
            </h2>
            <Link href={MAP_HREF} className="section-link">
              {DASHBOARD_TEXT.viewWorldMap}
              <span aria-hidden="true">{DASHBOARD_TEXT.browseIcon}</span>
            </Link>
          </div>
          <PathList
            realms={pathRealms(map, (slug) => realmHref(slug))}
            currentTag={WORLD_MAP_TEXT.youAreHere}
            labelledBy={PATH_HEADING_ID}
          />
        </section>
      </div>

      <aside className="flex min-w-0 flex-[1_1_16rem] flex-col gap-4 pt-4">
        <DashboardStats streak={stats.streak} levelsCleared={levelsCleared} tower={tower} />
        <DailyQuest streak={stats.streak} activeToday={stats.activeToday} />
        <TowerPanel tower={tower} />
        <FrontierPanel frontier={frontier} />
      </aside>
    </div>
  );
}
