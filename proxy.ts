import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { AUTH_ROUTES } from '@/lib/constants';

// Lessons and realms stay readable signed out (curriculum spec). Only the
// player's own pages need a session; protect() redirects here, before any
// streaming, so the status is a real redirect.
const isPrivate = createRouteMatcher(['/dashboard(.*)', '/profile(.*)']);

export default clerkMiddleware(
  async (auth, req) => {
    if (isPrivate(req)) await auth.protect();
  },
  { signInUrl: AUTH_ROUTES.signIn },
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)',
    '/(api|trpc)(.*)',
    // Clerk's auto-proxy path
    '/__clerk/:path*',
  ],
};
