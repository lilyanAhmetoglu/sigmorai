import { describe, expect, test } from 'bun:test';
import { clerkFapiOrigin, contentSecurityPolicy, HSTS, securityHeaders } from './headers';

const key = (prefix: string, host: string) =>
  `${prefix}${Buffer.from(`${host}$`).toString('base64')}`;

describe('clerkFapiOrigin', () => {
  test('reads the FAPI host from a test or live publishable key', () => {
    expect(clerkFapiOrigin(key('pk_test_', 'happy-cat-12.clerk.accounts.dev'))).toBe(
      'https://happy-cat-12.clerk.accounts.dev',
    );
    expect(clerkFapiOrigin(key('pk_live_', 'clerk.sigmorai.com'))).toBe(
      'https://clerk.sigmorai.com',
    );
  });

  test('a missing or odd key gives null, never a broken source', () => {
    expect(clerkFapiOrigin(undefined)).toBeNull();
    expect(clerkFapiOrigin('')).toBeNull();
    expect(clerkFapiOrigin('sk_test_abc')).toBeNull();
    const noDollar = `pk_test_${Buffer.from('no-dollar.example').toString('base64')}`;
    expect(clerkFapiOrigin(noDollar)).toBeNull();
    expect(clerkFapiOrigin(key('pk_test_', "evil.example 'unsafe-eval'"))).toBeNull();
  });
});

describe('contentSecurityPolicy', () => {
  const directive = (csp: string, name: string) =>
    csp
      .split('; ')
      .find((d) => d.startsWith(`${name} `))
      ?.split(' ')
      .slice(1) ?? [];
  const fapi = 'https://clerk.sigmorai.com';

  test("production: Clerk's hosts, no unsafe-eval, no framing, no plugins", () => {
    const csp = contentSecurityPolicy({ fapi, dev: false, preview: false });
    expect(directive(csp, 'script-src')).toContain(fapi);
    expect(directive(csp, 'script-src')).toContain('https://challenges.cloudflare.com');
    expect(directive(csp, 'script-src')).not.toContain("'unsafe-eval'");
    expect(directive(csp, 'connect-src')).toContain('https://*.protect.clerk.com:*');
    expect(directive(csp, 'img-src')).toContain('https://img.clerk.com');
    expect(directive(csp, 'worker-src')).toEqual(["'self'", 'blob:']);
    expect(directive(csp, 'frame-ancestors')).toEqual(["'none'"]);
    expect(directive(csp, 'object-src')).toEqual(["'none'"]);
    expect(csp).not.toContain('\n');
  });

  test('dev adds unsafe-eval (next dev needs it)', () => {
    expect(
      directive(contentSecurityPolicy({ fapi, dev: true, preview: false }), 'script-src'),
    ).toContain("'unsafe-eval'");
  });

  test('Vercel analytics: same-origin in production, the debug host only in dev', () => {
    const prod = contentSecurityPolicy({ fapi, dev: false, preview: false });
    expect(directive(prod, 'script-src')).toContain("'self'");
    expect(directive(prod, 'connect-src')).toContain("'self'");
    expect(prod).not.toContain('va.vercel-scripts.com');
    expect(
      directive(contentSecurityPolicy({ fapi, dev: true, preview: false }), 'script-src'),
    ).toContain('https://va.vercel-scripts.com');
  });

  test('a Vercel preview allows the toolbar; production does not', () => {
    const preview = contentSecurityPolicy({ fapi, dev: false, preview: true });
    for (const name of ['script-src', 'connect-src', 'frame-src']) {
      expect(directive(preview, name)).toContain('https://vercel.live');
    }
    expect(directive(preview, 'connect-src')).toContain('wss://*.pusher.com');
    const prod = contentSecurityPolicy({ fapi, dev: false, preview: false });
    expect(prod).not.toContain('vercel.live');
    expect(prod).not.toContain('pusher');
  });

  test('without a key there is no FAPI source', () => {
    expect(
      directive(contentSecurityPolicy({ fapi: null, dev: false, preview: false }), 'connect-src'),
    ).toEqual([
      "'self'",
      'https://*.protect.clerk.com:*',
      'https://img.clerk.com',
      'https://clerk-telemetry.com',
      'https://*.clerk-telemetry.com',
    ]);
  });
});

test('securityHeaders sets every SIG-27 header', () => {
  const names = securityHeaders({ fapi: null, dev: false, preview: false }).map((h) => h.key);
  expect(names).toEqual([
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'Cross-Origin-Opener-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ]);
});

test('HSTS covers subdomains but is not on the preload list', () => {
  expect(HSTS).toBe('max-age=63072000; includeSubDomains');
  expect(HSTS).not.toContain('preload');
});
