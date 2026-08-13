import _ from 'lodash';

import { makeDeprecatedChainChecker } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, includesSomePatterns } from '@/lib/string';
import type { Chain, Asset, AssetAddress } from '@/types';

import type {
  AssetResourceData,
  NormalizedAssetAddress,
} from './Resources.types';

/**
 * Orders the chains an asset is deployed on for display on an asset card.
 *
 * The card truncates its icon row to the first few entries, so this ordering decides which deployments a user sees before expanding.
 * The native chain comes first, then active chains, then deprecated ones.
 * Deprecated chains are pushed to the end rather than removed — the token still exists on them, it is just no longer bridgeable, which the greyed icon and its tooltip convey.
 * The native chain outranks that demotion so a token whose origin chain has been deprecated still shows where it came from.
 *
 * Ordering is otherwise left untouched: `_.orderBy` is stable, so entries that tie keep the order they arrived in.
 *
 * @param chainAddresses - Deployments to order, native chain first as built by the asset card
 * @param chains - Chain configs used to resolve each entry, may be null before the API responds
 * @param nativeChain - Chain the asset originates from, if known
 * @returns A new ordered array; nothing is filtered out
 */
export function orderChainAddresses(
  chainAddresses: NormalizedAssetAddress[],
  chains: Chain[] | null,
  nativeChain: string | undefined
): NormalizedAssetAddress[] {
  const isDeprecatedChain = makeDeprecatedChainChecker(chains);

  return _.orderBy(
    chainAddresses,
    [
      (d: NormalizedAssetAddress) => d.chain !== nativeChain,
      (d: NormalizedAssetAddress) => isDeprecatedChain(d.chain),
    ],
    ['asc', 'asc']
  );
}

export function filterChains(
  chains: unknown,
  type: string | undefined,
  chain: string | undefined,
  input: string,
  words: string[]
) {
  return (toArray(chains) as Chain[])
    .filter(
      (d: Chain) =>
        (!type || d.chain_type === type) &&
        (!chain || equalsIgnoreCase(d.id, chain)) &&
        (!d.no_inflation || d.deprecated)
    )
    .filter(
      (d: Chain) =>
        !input ||
        includesSomePatterns(
          _.uniq(
            toArray(
              ['id', 'chain_id', 'chain_name', 'name'].map((f: string) =>
                d[f]?.toString()
              ),
              { toCase: 'lower' }
            ) as string[]
          ),
          words
        )
    );
}

export function filterAssets(
  assets: unknown,
  itsAssets: unknown,
  type: string | undefined,
  chain: string | undefined,
  input: string,
  words: string[]
) {
  const gatewayAssets = (
    toArray(!type || type === 'gateway' ? assets : null) as Asset[]
  )
    .filter((d: Asset) => !chain || d.addresses?.[chain])
    .filter(
      (d: Asset) =>
        !input ||
        includesSomePatterns(
          _.uniq(
            toArray(
              _.concat(
                ['denom', 'name', 'symbol'].map(
                  (f: string) => d[f as keyof Asset] as string | undefined
                ),
                d.denoms,
                Object.values({ ...d.addresses }).flatMap((a: AssetAddress) =>
                  toArray([
                    !equalsIgnoreCase(input, 'axl') && a.symbol,
                    a.address,
                    a.ibc_denom,
                  ])
                )
              ),
              { toCase: 'lower' }
            ) as string[]
          ),
          words
        )
    );

  const itsFiltered = (
    toArray(!type || type === 'its' ? itsAssets : null) as Asset[]
  )
    .filter((d: Asset) => !chain || (d as AssetResourceData).chains?.[chain])
    .filter(
      (d: Asset) =>
        !input ||
        includesSomePatterns(
          _.uniq(
            toArray(
              _.concat(
                ['name', 'symbol'].map(
                  (f: string) => d[f as keyof Asset] as string | undefined
                ),
                Object.values({ ...(d as AssetResourceData).chains }).flatMap(
                  (a: AssetAddress) =>
                    toArray([
                      !equalsIgnoreCase(input, 'axl') && a.symbol,
                      (a as Record<string, unknown>).tokenAddress as
                        | string
                        | undefined,
                    ])
                )
              ),
              { toCase: 'lower' }
            ) as string[]
          ),
          words
        )
    )
    .map((d: Asset) => ({ ...d, type: 'its' }));

  return _.concat(gatewayAssets, itsFiltered);
}
