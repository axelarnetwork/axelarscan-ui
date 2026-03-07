'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import clsx from 'clsx';

import * as styles from './Logo.styles';
import type { LogoProps } from './Logo.types';

export function Logo(props: LogoProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div {...props} className={clsx(styles.wrapper, props.className)}>
      <Image
        src={`/logos/logo${resolvedTheme === 'dark' ? '_white' : ''}.png`}
        alt=""
        width={24}
        height={24}
        unoptimized
        className={styles.image}
      />
      <span className={styles.label}>
        Axelarscan
      </span>
    </div>
  );
}
