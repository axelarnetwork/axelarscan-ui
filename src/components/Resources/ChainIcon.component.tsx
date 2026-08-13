'use client';

import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';

import type { ChainIconProps } from './Resources.types';
import * as styles from './Resources.styles';

export function ChainIcon({
  chainId,
  nativeChain,
  isSelected,
  onClick,
  chains,
}: ChainIconProps) {
  const { name, image, deprecated } = { ...getChainData(chainId, chains) };

  const borderClass = isSelected
    ? styles.chainIconSelected
    : chainId === nativeChain
      ? styles.chainIconNative
      : '';

  const labels = toArray([
    chainId === nativeChain && 'Native Chain',
    deprecated && 'Deactivated',
  ]) as string[];

  return (
    <div className={styles.chainIconWrapper}>
      <Tooltip
        content={`${name}${labels.length > 0 ? ` (${labels.join(', ')})` : ''}`}
        className={styles.chainIconTooltip}
      >
        <button
          onClick={onClick}
          className={clsx('block rounded-full', borderClass)}
        >
          <Image
            src={image}
            alt=""
            width={24}
            height={24}
            className={clsx(
              'rounded-full',
              deprecated && styles.chainIconDeprecated
            )}
          />
        </button>
      </Tooltip>
    </div>
  );
}
