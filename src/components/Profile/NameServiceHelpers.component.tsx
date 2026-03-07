'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import type { NameServiceImageProps, NameServiceContentProps } from './Profile.types';
import { nameService as styles } from './Profile.styles';

export function NameServiceImage({ src, fallbackSrc, width, height, onLoad }: NameServiceImageProps) {
  const [image404, setImage404] = useState<boolean | null>(null);
  const sizeClass = width === 24 ? styles.imageSizeDefault : styles.imageSizeSmall;
  const marginClass = width < 24 ? styles.imageMarginSmall : styles.imageMarginDefault;

  if (typeof image404 === 'boolean') {
    return (
      <Image
        src={image404 ? (fallbackSrc as unknown as string) : src}
        alt=""
        width={width}
        height={height}
        className={clsx(styles.imageRoundedFull, width === 24 && styles.imageSizeDefault, marginClass)}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      onLoad={() => { setImage404(false); onLoad?.(); }}
      onError={() => setImage404(true)}
      className={clsx(styles.imageRoundedFull, sizeClass, marginClass)}
    />
  );
}

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
