import { getEvent } from '@/components/GMPs';
import { isAxelar } from '@/lib/chain';
import { toCase } from '@/lib/parser';

import type { AssetAddressEntry, GMPMessage } from '../GMP.types';

export function resolveDestinationAssetConfig(
  destinationChain: string | undefined,
  assetAddresses: Record<string, AssetAddressEntry | undefined> | undefined
): AssetAddressEntry | undefined {
  if (!assetAddresses || !destinationChain) return undefined;

  const key = toCase(destinationChain, 'lower');
  if (typeof key !== 'string') return undefined;

  return assetAddresses[key];
}

export function resolveStatusLabel(data: GMPMessage): string {
  const { simplified_status, call } = data;
  if (
    simplified_status === 'received' &&
    (getEvent(data) === 'ContractCall' ||
      (getEvent(data) === 'InterchainTransfer' &&
        isAxelar(call?.returnValues?.destinationChain)))
  ) {
    return 'Executed';
  }
  return simplified_status ?? '';
}
