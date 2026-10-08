import Image from 'next/image';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

/** Logo mark (32px, design) + name, linking home. Only in SiteHeader. Styles: app-shell.css. */
export function SiteLogo() {
  return (
    <Link href="/" className="site-logo">
      <Image
        src="/logo/sigmorai-mark.svg"
        alt=""
        width={32}
        height={32}
        unoptimized
        className="pixel"
      />
      <span>{SITE_NAME.toUpperCase()}</span>
    </Link>
  );
}
