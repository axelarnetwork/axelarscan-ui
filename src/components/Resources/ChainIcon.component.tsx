'use client';

import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { getChainData } from '@/lib/config';

import type { ChainIconProps } from './Resources.types';
import * as styles from './Resources.styles';

export function ChainIcon({
  chainId,
  nativeChain,
  isSelected,
  onClick,
  chains,
}: ChainIconProps) {
  const { name, image } = { ...getChainData(chainId, chains) };

  const borderClass = isSelected
    ? styles.chainIconSelected
    : chainId === nativeChain
      ? styles.chainIconNative
      : '';

  return (
    <div className={styles.chainIconWrapper}>
      <Tooltip
        content={`${name}${chainId === nativeChain ? ' (Native Chain)' : ''}`}
        className={styles.chainIconTooltip}
      >
        <button onClick={onClick}>
          <Image
            src={image}
            alt=""
            width={24}
            height={24}
            className={clsx('rounded-full', borderClass)}
          />
        </button>
      </Tooltip>
    </div>
  );
}
