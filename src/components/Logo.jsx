'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import clsx from 'clsx';

export function Logo(props) {
  const { resolvedTheme } = useTheme();

  return (
    <div {...props} className={clsx('flex items-center', props.className)}>
      <Image
        src={`/logos/logo${resolvedTheme === 'dark' ? '_white' : ''}.png`}
        alt=""
        width={24}
        height={24}
        unoptimized
        className="mr-3 min-w-4"
      />
      <span className="hidden text-sm font-bold uppercase md:block">
        Axelarscan
      </span>
    </div>
  );
}
