'use client';

import clsx from 'clsx';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import type React from 'react';

import { includesSomePatterns, isString } from '@/lib/string';

const OPTIMIZER_URL = '';

/**
 * Parameters for the image loader function
 */
interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom image loader that handles optimization through a custom optimizer service
 */
const loader = ({ src, width, quality = 75 }: LoaderParams): string =>
  `${OPTIMIZER_URL ? `${OPTIMIZER_URL}/_next` : ''}${src?.startsWith('/') ? '' : '/'}${src}${OPTIMIZER_URL ? `?url=${src?.startsWith('/') ? process.env.NEXT_PUBLIC_APP_URL : ''}${src}&w=${width}&q=${quality}` : ''}`;

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

  return (
    <NextImage
      alt={alt}
      {...props}
      src={src}
      loader={params => loader({ ...params, src: params.src as string })}
      unoptimized
      className={clsx(
        className,
        isString(src) &&
          (includesSomePatterns(src, ['/immutable'])
            ? 'rounded-full bg-white'
            : includesSomePatterns(src, [
                  '/moonbeam',
                  '/moonbase',
                  '/dymension',
                  '/saga',
                  '/xion',
                  '/allora',
                  '/stellar',
                  '/xrpl',
                ])
              ? 'rounded-full bg-white p-0.5'
              : includesSomePatterns(src, ['/blast'])
                ? 'rounded-full bg-zinc-900 p-1'
                : '')
      )}
    />
  );
}
