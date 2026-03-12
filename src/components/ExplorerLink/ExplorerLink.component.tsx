'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { getInputType } from '@/lib/parser';
import { isString } from '@/lib/string';
import { isNumber } from '@/lib/number';

import { LuSearch } from 'react-icons/lu';

import * as styles from './ExplorerLink.styles';
import type { ExplorerLinkProps } from './ExplorerLink.types';
import { buildExplorerURL } from './ExplorerLink.utils';

export function ExplorerLink({
  value,
  chain,
  type = 'tx',
  customURL,
  hasEventLog,
  useContractLink,
  title,
  iconOnly = true,
  width = 16,
  height = 16,
  containerClassName,
  nonIconClassName,
  className = 'h-4',
}: ExplorerLinkProps) {
  const chains = useChains();
  const explorer = getChainData(chain, chains)?.explorer;

  if (type === 'tx') {
    // update type from input value
    switch (getInputType(value!, chains!)) {
      case 'evmAddress':
        type = 'address';
        break;
      case 'block':
        if (isNumber(value) && (!isString(value) || !value.startsWith('0x'))) {
          type = 'block';
        }
        break;
      default:
        break;
    }
  }

  const href =
    customURL ||
    buildExplorerURL({ value, type, useContractLink, hasEventLog, explorer });

  if (!href) {
    return null;
  }

  return (
    <Link
      href={href}
      target="_blank"
      className={clsx(styles.linkContainer, containerClassName)}
    >
      {!iconOnly && (
        <span className={clsx(styles.nonIconText, nonIconClassName)}>
          {title || `View on ${explorer?.name || 'explorer'}`}
        </span>
      )}
      {explorer?.icon ? (
        <Image
          src={explorer.icon}
          alt={explorer.name ? `${explorer.name} icon` : 'Explorer icon'}
          width={width}
          height={height}
          className={clsx(styles.explorerIcon, className)}
        />
      ) : (
        <LuSearch
          size={width}
          className={clsx(styles.explorerIcon, className)}
        />
      )}
    </Link>
  );
}
