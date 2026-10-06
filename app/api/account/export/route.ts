import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ACCOUNT_EXPORT_FILENAME, AUTH_ROUTES } from '@/lib/constants';
import { exportAccount } from '@/lib/data/account';

/**
 * "Download your data" (profile → Your data): every row we hold about the
 * signed-in player as one JSON file. A route handler, not a Server Action,
 * because a download needs headers an action can't set. The user id comes
 * from the session only.
 */
export async function GET() {
  const { userId } = await auth();
  // A redirect, not a 401 body: the link has `download`, so a body would be
  // saved as sigmorai-data.json.
  if (!userId) redirect(AUTH_ROUTES.signIn);

  try {
    const data = await exportAccount(userId);
    return Response.json(data, {
      headers: {
        'Content-Disposition': `attachment; filename="${ACCOUNT_EXPORT_FILENAME}"`,
        // Personal data: never kept by a browser or CDN cache.
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[account export]', err);
    return new Response('Export failed', { status: 500 });
  }
}
