'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { Image } from '@/components/Image';
import type { NameServiceImageProps } from './Profile.types';
import { nameService as styles } from './Profile.styles';

export function NameServiceImage({
  src,
  fallbackSrc,
  width,
  height,
  onLoad,
}: NameServiceImageProps) {
  const [image404, setImage404] = useState<boolean | null>(null);
  const sizeClass =
    width === 24 ? styles.imageSizeDefault : styles.imageSizeSmall;
  const marginClass =
    width < 24 ? styles.imageMarginSmall : styles.imageMarginDefault;

  if (typeof image404 === 'boolean') {
    return (
      <Image
        src={image404 ? (fallbackSrc as unknown as string) : src}
        alt=""
        width={width}
        height={height}
        className={clsx(
          styles.imageRoundedFull,
          width === 24 && styles.imageSizeDefault,
          marginClass
        )}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      onLoad={() => {
        setImage404(false);
        onLoad?.();
      }}
      onError={() => setImage404(true)}
      className={clsx(styles.imageRoundedFull, sizeClass, marginClass)}
    />
  );
}
