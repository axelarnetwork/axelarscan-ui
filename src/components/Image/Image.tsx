'use client';

import clsx from 'clsx';
import NextImage from 'next/image';

import { includesSomePatterns, isString } from '@/lib/string';

const OPTIMIZER_URL = '';
const loader = ({ src, width, quality = 75 }) =>
  `${OPTIMIZER_URL ? `${OPTIMIZER_URL}/_next` : ''}${src?.startsWith('/') ? '' : '/'}${src}${OPTIMIZER_URL ? `?url=${src?.startsWith('/') ? process.env.NEXT_PUBLIC_APP_URL : ''}${src}&w=${width}&q=${quality}` : ''}`;

export function Image({ src, alt = '', className, ...props }) {
  return (
    src && (
      <NextImage
        alt={alt}
        {...props}
        src={src}
        loader={() => loader({ ...props, src })}
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
    )
  );
}
