'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

import type { LinkProps } from './Link.types';

/**
 * next/link that prefetches when the user hovers or touches it, instead of
 * when it scrolls into view. Tables render many internal links and viewport
 * prefetching requested every one of them. Pass `prefetch` explicitly to get
 * the next/link behaviour back.
 */
export function Link({
  prefetch = false,
  href,
  target,
  onMouseEnter,
  onTouchStart,
  ...props
}: LinkProps) {
  const router = useRouter();

  const prefetchOnIntent = () => {
    // next/link prefetches by itself, a new tab can't use the router cache,
    // and router.prefetch ignores external URLs
    if (prefetch !== false || target === '_blank' || typeof href !== 'string') {
      return;
    }

    try {
      router.prefetch(href);
    } catch {
      // href is not a valid URL: nothing to prefetch
    }
  };

  return (
    <NextLink
      href={href}
      target={target}
      prefetch={prefetch}
      onMouseEnter={e => {
        prefetchOnIntent();
        onMouseEnter?.(e);
      }}
      onTouchStart={e => {
        prefetchOnIntent();
        onTouchStart?.(e);
      }}
      {...props}
    />
  );
}
