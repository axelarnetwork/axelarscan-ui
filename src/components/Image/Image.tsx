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
 *
 * @param params - Loader parameters including src, width, and quality
 * @returns Optimized image URL with query parameters
 */
const loader = ({ src, width, quality = 75 }: LoaderParams): string => {
  // Start building the URL
  let url = '';

  // Add optimizer prefix if configured
  if (OPTIMIZER_URL) {
    url += `${OPTIMIZER_URL}/_next`;
  }

  // Add leading slash if src doesn't start with one
  if (!src?.startsWith('/')) {
    url += '/';
  }

  // Add the source path
  url += src;

  // Add optimization query parameters if optimizer is configured
  if (OPTIMIZER_URL) {
    url += '?url=';

    // Add app URL prefix for relative paths
    if (src?.startsWith('/')) {
      url += process.env.NEXT_PUBLIC_APP_URL || '';
    }

    // Add source and optimization parameters
    url += `${src}&w=${width}&q=${quality}`;
  }

  return url;
};

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

/**
 * Determines additional CSS classes based on the image source path
 * Different chains/services require different styling for their logos
 *
 * @param src - Image source path
 * @returns CSS class string for chain-specific styling
 */
function getChainSpecificClasses(src: string): string {
  if (!isString(src)) {
    return '';
  }

  // Immutable logos need full white background
  if (includesSomePatterns(src, ['/immutable'])) {
    return 'rounded-full bg-white';
  }

  // These chains need white background with small padding
  const whiteBackgroundChains = [
    '/moonbeam',
    '/moonbase',
    '/dymension',
    '/saga',
    '/xion',
    '/allora',
    '/stellar',
    '/xrpl',
  ];

  if (includesSomePatterns(src, whiteBackgroundChains)) {
    return 'rounded-full bg-white p-0.5';
  }

  // Blast needs dark background with more padding
  if (includesSomePatterns(src, ['/blast'])) {
    return 'rounded-full bg-zinc-900 p-1';
  }

  // No special styling needed
  return '';
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

  // Determine chain-specific styling
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
