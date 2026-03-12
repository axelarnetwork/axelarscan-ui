'use client';

import clsx from 'clsx';

import { Image } from '@/components/Image';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { capitalize } from '@/lib/string';
import type { ChainProfileProps } from './Profile.types';
import { chainProfile as styles } from './Profile.styles';

export function ChainProfile({
  value,
  width = 24,
  height = 24,
  className = 'h-6',
  titleClassName,
}: ChainProfileProps) {
  const chains = useChains();

  if (!value) return null;

  const { name, image } = { ...getChainData(value, chains) };

  return (
    <div className={clsx(styles.wrapper, className)}>
      <Image
        src={image}
        alt=""
        width={width}
        height={height}
        className={className}
      />
      <span className={clsx(styles.title, titleClassName)}>
        {name || capitalize(value)}
      </span>
    </div>
  );
}
