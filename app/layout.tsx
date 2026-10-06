import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Atkinson_Hyperlegible, JetBrains_Mono, Pixelify_Sans, Silkscreen } from 'next/font/google';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants';
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

// Greek too: the Math Tower formulas use Σ, θ, η.
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin', 'greek'],
});

export const metadata: Metadata = {
  // Lets every route use relative canonical / Open Graph URLs.
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${pixelifySans.variable} ${silkscreen.variable} ${atkinson.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* Never pass `dynamic`: it makes / dynamic and breaks the landing CTA swap (LandingCta). */}
        <ClerkProvider>{children}</ClerkProvider>
        {/* Cookieless page views and Web Vitals (SIG-39); /privacy says what they collect. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
