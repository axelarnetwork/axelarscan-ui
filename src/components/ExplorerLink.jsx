'use client';

import Link from 'next/link';
import { constants } from 'ethers';
const { AddressZero: ZeroAddress } = { ...constants };
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { useGlobalStore } from '@/components/Global';
import { getChainData } from '@/lib/config';
import { getInputType } from '@/lib/parser';
import { isString } from '@/lib/string';
import { isNumber } from '@/lib/number';

export const buildExplorerURL = ({
  value,
  type,
  useContractLink,
  hasEventLog,
  explorer,
}) => {
  if (!explorer) {
    return '#';
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
    return '#';
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
      href = `${url}${path?.replace(`{address}`, value)}`;
      break;
    case 'contract':
      path = (value === ZeroAddress && contract_0_path) || contract_path;
      href = `${url}${path?.replace(`{address}`, value)}`;
      break;
    case 'tx':
      path = transaction_path;

      processedValue = value;
      if (no_0x && value?.startsWith('0x')) {
        processedValue = value.substring(2);
      }

      suffix = '';
      if (hasEventLog && processedValue?.startsWith('0x')) {
        suffix = '#eventlog';
      }

      href = `${url}${path?.replace(`{tx}`, processedValue)}${suffix}`;
      break;
    case 'block':
      path = block_path;
      href = `${url}${path?.replace(`{block}`, value)}`;
      break;
    default:
      return '#';
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
}) {
  const { chains } = useGlobalStore();
  const explorer = getChainData(chain, chains)?.explorer;

  if (type === 'tx') {
    // update type from input value
    switch (getInputType(value, chains)) {
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
      className={clsx(
        'flex min-w-max items-center gap-x-2',
        containerClassName
      )}
    >
      {!iconOnly && (
        <span className={clsx('font-medium', nonIconClassName)}>
          {title || `View on ${explorer?.name || 'explorer'}`}
        </span>
      )}
      <Image
        src={explorer?.icon || '/logos/explorers/unknown.png'}
        alt=""
        width={width}
        height={height}
        className={clsx('rounded-full opacity-60 hover:opacity-100', className)}
      />
    </Link>
  );
}
