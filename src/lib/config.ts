import _ from 'lodash';

import type { Chain, Asset, AssetAddress } from '@/types';
import { toCase, toArray } from '@/lib/parser';
import { isString, removeDoubleQuote, find } from '@/lib/string';

export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

export const axelarContracts = [
  'axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5',
  'axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5s',
  'axelar1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqecnww6',
];

export const axelarContractFields = [
  'router',
  'service_registry',
  'rewards',
  'multisig',
  'gateway',
  'multisig_prover',
  'voting_verifier',
  'interchain_token_service_hub',
];

export const getAxelarContractAddresses = (
  chainsData: Chain[] | null | undefined
) => {
  if (!chainsData) return [];

  const addresses: string[] = [];

  for (const chainData of chainsData) {
    for (const f of axelarContractFields) {
      const contract = chainData[f] as { address?: string } | undefined;
      if (contract?.address) {
        addresses.push(contract.address);
      }
    }
  }

  return addresses;
};

export const getChainKey = (
  chain: string | number | null | undefined,
  chainsData: Chain[] | null | undefined,
  exact = false
): string | undefined => {
  if (!chain) return;
  const chainStr = removeDoubleQuote(String(chain));

  return (
    toArray(chainsData).find((d: Chain) => {
      const keys = _.concat(
        d.id,
        d.chain_id,
        d.chain_name,
        d.maintainer_id,
        d.name,
        d.aliases
      );

      const stringKeys = keys.filter((p): p is string => isString(p));
      return (
        find(chainStr, stringKeys) || // check equals
        (!exact &&
          _.concat(stringKeys, d.prefix_address, d.prefix_chain_ids)
            .filter((p): p is string => isString(p))
            .findIndex(p => chainStr.startsWith(p)) > -1) // check prefix
      );
    })?.id || toCase(chainStr, 'lower')
  );
};

export const getChainData = (
  chain: string | number | null | undefined,
  chainsData: Chain[] | null | undefined,
  exact = true
): Chain | undefined => {
  const id = getChainKey(chain, chainsData, exact);
  if (!id) return;

  return toArray(chainsData).find((d: Chain) => d.id === id);
};

export const getAssetData = (
  asset: string | null | undefined,
  assetsData: Asset[] | null | undefined
): Asset | undefined => {
  if (!asset) return;

  return toArray(assetsData).find(
    (d: Asset) =>
      find(
        asset,
        [d.denom, ...(d.denoms ?? []), d.symbol].filter((s): s is string => !!s)
      ) || // check equals
      toArray(Object.values({ ...d.addresses })).findIndex((a: AssetAddress) =>
        find(
          asset,
          [a.address, a.ibc_denom, a.symbol].filter((s): s is string => !!s)
        )
      ) > -1 // check equals to address, denom or symbol of each chain
  );
};

export const getITSAssetData = (
  asset: string | null | undefined,
  assetsData: Asset[] | null | undefined
): Asset | undefined => {
  if (!asset) return;

  // check equals against id, symbol, address, and addresses array
  // ITS assets have addresses as string[] (not Record<string, AssetAddress>)
  return toArray(assetsData).find((d: Asset) => {
    const itsAddresses = Array.isArray(d.addresses) ? d.addresses : [];
    return find(
      asset,
      [d.id, d.symbol, d.address, ...itsAddresses].filter(
        (s): s is string => !!s && typeof s === 'string'
      )
    );
  });
};
