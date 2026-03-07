'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import type { NameServiceContentProps } from './Profile.types';
import { nameService as styles } from './Profile.styles';

export function NameServiceContent({ url, noCopy, address, width, className, element }: NameServiceContentProps) {
  const copySize = width < 24 ? 16 : 18;

  if (url) {
    return (
      <div className={clsx(styles.linkWrapper, className)}>
        <Link href={url} target="_blank" className={styles.linkText}>
          {element}
        </Link>
        {!noCopy && <Copy size={copySize} value={address} />}
      </div>
    );
  }

  if (noCopy) return <>{element}</>;

  return (
    <Copy size={copySize} value={address}>
      <span className={clsx(className)}>{element}</span>
    </Copy>
  );
}
