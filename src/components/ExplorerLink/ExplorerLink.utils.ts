import { constants } from 'ethers';
const { AddressZero: ZeroAddress } = { ...constants };

import type { BuildExplorerURLParams } from './ExplorerLink.types';

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
