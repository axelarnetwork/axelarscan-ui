'use client';

import clsx from 'clsx';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import type React from 'react';

import { getChainSpecificClasses } from './Image.styles';
import { loader } from './Image.utils';

/**
 * Props for the Image component
 * Extends Next.js ImageProps but makes src optional (nullable)
 * and adds custom styling based on image path patterns
 */
export interface ImageProps
  extends Omit<NextImageProps, 'src' | 'alt' | 'loader' | 'unoptimized'> {
  /** Image source URL or path (optional, returns null if not provided) */
  src?: string | null;
  /** Alternative text for the image (defaults to empty string) */
  alt?: string;
  /** Additional CSS classes */
  className?: string;
}

export function Image({
  src,
  alt = '',
  className,
  ...props
}: ImageProps): React.JSX.Element | null {
  if (!src) {
    return null;
  }

  const chainClasses = getChainSpecificClasses(src);

  return (
    <NextImage
      alt={alt}
      {...props}
      src={src}
      loader={params => loader({ ...params, src: params.src as string })}
      unoptimized
      className={clsx(className, chainClasses)}
    />
  );
}
