import Image from 'next/image';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

type Props = {
  /** Mark size in px: 32 in the app header, 40 on the landing nav (design). */
  size?: number;
};

/** Logo mark + name, linking home. Shared by the app header and the landing nav. Styles: app-shell.css. */
export function SiteLogo({ size = 32 }: Props) {
  return (
    <Link href="/" className="site-logo">
      <Image
        src="/logo/sigmorai-mark.svg"
        alt=""
        width={size}
        height={size}
        unoptimized
        className="pixel"
      />
      <span>{SITE_NAME.toUpperCase()}</span>
    </Link>
  );
}
