import { clerkMiddleware } from '@clerk/nextjs/server';

// Every route is public for now: lessons and realms must be readable signed out
// (curriculum spec). Protect only the routes that write progress, when they exist.
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    // Clerk's auto-proxy path
    '/__clerk/:path*',
  ],
};
