import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible, JetBrains_Mono, Pixelify_Sans, Silkscreen } from 'next/font/google';
import { CookieNotice } from '@/components/cookie-notice';
import { BRAND_COLOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants';
import './globals.css';

// The four families from design/tokens/typography.css. Each sets a CSS variable
// that the --font-* tokens in globals.css put first in their stack.
const pixelifySans = Pixelify_Sans({ variable: '--font-pixelify-sans', subsets: ['latin'] });

const silkscreen = Silkscreen({
  variable: '--font-silkscreen',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const atkinson = Atkinson_Hyperlegible({
  variable: '--font-atkinson',
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
});

// Greek too: the Math Tower formulas use Σ, θ, η. Not preloaded: only code
// and formulas use it, so most pages (the map, the landing) never need its
// two files, and a preload would put them ahead of the page's own requests.
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin', 'greek'],
  preload: false,
});

export const metadata: Metadata = {
  // Lets every route use relative canonical / Open Graph URLs.
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Icons come from the app/ files (icon.svg, favicon.ico, apple-icon.png) and
  // app/manifest.ts; all are the pixel Σ from design/assets/logo/favicon.svg. The tab
  // icons (icon.svg, favicon.ico) drop its ink square; apple-icon.png and public/icons/*.png keep it.
  appleWebApp: { title: SITE_NAME, statusBarStyle: 'black-translucent' },
  // Defaults for pages that set no social tags of their own (lib/og/metadata.ts).
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLOR,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${pixelifySans.variable} ${silkscreen.variable} ${atkinson.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* No ClerkProvider here: each group layout mounts it only where a page
            needs it (ClerkGate), so a visitor downloads no Clerk. */}
        {children}
        {/* Last in <body>: sticky to the screen bottom, never over the page end. */}
        <CookieNotice />
        {/* Cookieless page views and Web Vitals (SIG-39); /privacy says what they collect. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
