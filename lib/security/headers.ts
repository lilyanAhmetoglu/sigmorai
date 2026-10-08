/**
 * Security headers for every route (SIG-27), read by next.config.ts. Pure TS
 * with relative imports only, because next.config.ts loads it at build time.
 *
 * The CSP is static (no nonce). A nonce CSP needs every page to render
 * per request (Next 16 CSP guide → "Static vs Dynamic Rendering with CSP")
 * and <ClerkProvider dynamic> (Clerk "strict" mode). So this follows Clerk's
 * "Manual CSP configuration" (clerk.com/docs/guides/secure/best-practices/
 * csp-headers, checked 2026-10-05) and Next's "Without Nonces" example:
 *   - script-src needs 'unsafe-inline' with the App Router (Next's inline
 *     bootstrap scripts), plus 'unsafe-eval' in `next dev` only;
 *   - style-src needs 'unsafe-inline' (Clerk's runtime CSS-in-JS);
 *   - Clerk: the FAPI host (clerk-js loads from it), Cloudflare's bot check,
 *     Clerk's fraud hosts (connect on any port: `:*`), img.clerk.com avatars,
 *     telemetry (dev instances send it), workers from 'self' and blob:.
 */

/** Clerk's hosts (Clerk CSP doc). The FAPI host is read from the publishable key. */
const CLERK = {
  challenges: 'https://challenges.cloudflare.com',
  protect: 'https://*.protect.clerk.com',
  /** Fraud hosts run on ports other than 443; a source without a port means 443 only. */
  protectAnyPort: 'https://*.protect.clerk.com:*',
  img: 'https://img.clerk.com',
  telemetry: ['https://clerk-telemetry.com', 'https://*.clerk-telemetry.com'],
} as const;

/** The Vercel toolbar on preview deployments only (vercel.live, realtime over Pusher). */
const VERCEL_PREVIEW = { live: 'https://vercel.live', pusher: 'wss://*.pusher.com' } as const;

/**
 * Vercel Web Analytics + Speed Insights (SIG-39). On a deployment their
 * scripts load from this site (`/_vercel/insights/script.js`,
 * `/_vercel/speed-insights/script.js`, or a per-build path) and send to it,
 * so 'self' covers script-src and connect-src. Only `next dev` loads the
 * debug scripts from this host (getScriptSrc in @vercel/analytics 2.0.1 and
 * @vercel/speed-insights 2.0.0). The debug scripts log; they send nothing.
 */
const VERCEL_SCRIPTS_DEV = 'https://va.vercel-scripts.com';

const HOSTNAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/**
 * The Frontend API origin inside a Clerk publishable key:
 * `pk_test_` / `pk_live_` + base64("<fapi host>$"). Null when the key is
 * missing or not that shape (then Clerk itself can't load either).
 */
export function clerkFapiOrigin(publishableKey: string | undefined): string | null {
  const match = /^pk_(test|live)_([A-Za-z0-9+/=_-]+)$/.exec(publishableKey ?? '');
  if (!match) return null;
  let decoded: string;
  try {
    decoded = Buffer.from(match[2], 'base64').toString('utf8');
  } catch {
    return null;
  }
  const host = decoded.endsWith('$') ? decoded.slice(0, -1) : '';
  return HOSTNAME.test(host) ? `https://${host}` : null;
}

/** The Content-Security-Policy value. `dev` adds 'unsafe-eval' (Next needs it in `next dev`) and Vercel's debug scripts. */
export type CspOptions = {
  fapi: string | null;
  dev: boolean;
  /** VERCEL_ENV === 'preview': allow the Vercel toolbar. */
  preview: boolean;
};

export function contentSecurityPolicy({ fapi, dev, preview }: CspOptions): string {
  const clerkFapi = fapi ? [fapi] : [];
  const live = preview ? [VERCEL_PREVIEW.live] : [];
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(dev ? ["'unsafe-eval'", VERCEL_SCRIPTS_DEV] : []),
      ...clerkFapi,
      CLERK.challenges,
      CLERK.protect,
      ...live,
    ],
    'connect-src': [
      "'self'",
      ...clerkFapi,
      CLERK.protectAnyPort,
      CLERK.img,
      ...CLERK.telemetry,
      ...(preview ? [VERCEL_PREVIEW.live, VERCEL_PREVIEW.pusher] : []),
    ],
    'img-src': ["'self'", 'data:', 'blob:', CLERK.img],
    'font-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'worker-src': ["'self'", 'blob:'],
    'frame-src': ["'self'", CLERK.challenges, CLERK.protect, ...live],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  // No upgrade-insecure-requests: Vercel serves HTTPS only, and it breaks `next start` on http://localhost.
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

/** Off: no page uses the camera, microphone, location, payment or USB. */
export const PERMISSIONS_POLICY = [
  'camera=()',
  'microphone=()',
  'geolocation=()',
  'payment=()',
  'usb=()',
  'browsing-topics=()',
].join(', ');

/**
 * HTTPS only, for two years, on every subdomain too (clerk.sigmorai.com is
 * HTTPS). It replaces Vercel's default (the same max-age, no
 * includeSubDomains). No `preload`: the browser preload list is hard to
 * leave, so that is the maintainer's call.
 */
export const HSTS = 'max-age=63072000; includeSubDomains';

/** Every header next.config.ts sets on every route. */
export function securityHeaders(options: CspOptions): { key: string; value: string }[] {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(options) },
    { key: 'Strict-Transport-Security', value: HSTS },
    // Cuts the link to a window that opened this page, or that this page
    // opened, unless this page opened it as a popup (Clerk's OAuth popups
    // still work; sign-in itself is a redirect).
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
  ];
}
