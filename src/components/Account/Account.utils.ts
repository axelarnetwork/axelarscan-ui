import _ from 'lodash';

import { axelarContracts, getAxelarContractAddresses } from '@/lib/config';
import { getInputType } from '@/lib/parser';
import { find } from '@/lib/string';
import type { Chain } from '@/types';

export function isDepositAddressCandidate(
  address: string,
  chains: Chain[] | null
): boolean {
  if (!chains) return false;
  const isLongAddress = address.length >= 65;
  const isEVM = getInputType(address, chains) === 'evmAddress';
  if (!isLongAddress && !isEVM) return false;

  return !find(
    address,
    _.concat(axelarContracts, getAxelarContractAddresses(chains))
  );
}
