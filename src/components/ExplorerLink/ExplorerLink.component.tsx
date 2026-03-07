'use client';

import Link from 'next/link';
import { constants } from 'ethers';
const { AddressZero: ZeroAddress } = { ...constants };
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { getInputType } from '@/lib/parser';
import { isString } from '@/lib/string';
import { isNumber } from '@/lib/number';

import { LuSearch } from 'react-icons/lu';

import * as styles from './ExplorerLink.styles';
import type {
  BuildExplorerURLParams,
  ExplorerLinkProps,
} from './ExplorerLink.types';

export const buildExplorerURL = ({
  value,
  type,
  useContractLink,
  hasEventLog,
  explorer,
}: BuildExplorerURLParams): string => {
  if (!explorer) {
    return '';
  }

  const {
    url,
    address_path,
    contract_path,
    contract_0_path,
    transaction_path,
    block_path,
    no_0x,
    cannot_link_contract_via_address_path,
  } = explorer;

  // Return a fallback URL if url or value are falsy
  if (!url || !value) {
    return '';
  }

  let path;
  let href;
  let processedValue;
  let suffix;

  switch (type) {
    case 'address':
      path =
        useContractLink &&
        cannot_link_contract_via_address_path &&
        contract_path
          ? contract_path
          : address_path;
      href = `${url}${path?.replace(`{address}`, String(value))}`;
      break;
    case 'contract':
      path = (value === ZeroAddress && contract_0_path) || contract_path;
      href = `${url}${path?.replace(`{address}`, String(value))}`;
      break;
    case 'tx':
      path = transaction_path;

      processedValue = String(value);
      if (no_0x && processedValue?.startsWith('0x')) {
        processedValue = processedValue.substring(2);
      }

      suffix = '';
      if (hasEventLog && processedValue?.startsWith('0x')) {
        suffix = '#eventlog';
      }

      href = `${url}${path?.replace(`{tx}`, processedValue)}${suffix}`;
      break;
    case 'block':
      path = block_path;
      href = `${url}${path?.replace(`{block}`, String(value))}`;
      break;
    default:
      return '';
  }

  return href;
};

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
