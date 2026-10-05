import type { Metadata } from 'next';
import { Atkinson_Hyperlegible, JetBrains_Mono, Pixelify_Sans, Silkscreen } from 'next/font/google';
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

const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sigmorai',
  description: 'A pixel-art RPG for learning AI engineering and agentic systems.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${pixelifySans.variable} ${silkscreen.variable} ${atkinson.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
