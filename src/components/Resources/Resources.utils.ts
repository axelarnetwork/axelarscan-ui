import _ from 'lodash';

import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, includesSomePatterns } from '@/lib/string';
import type { Chain, Asset, AssetAddress } from '@/types';

import type { AssetResourceData } from './Resources.types';

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
