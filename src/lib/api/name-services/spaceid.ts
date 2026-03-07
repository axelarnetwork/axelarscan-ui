// @ts-expect-error — @siddomains/sidjs has no type declarations
import SID, { getSidAddress } from '@siddomains/sidjs';
import _ from 'lodash';

import { getProvider } from '@/lib/chain/evm';
import { getChainData } from '@/lib/config';
import { toCase, toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import type { Chain } from '@/types';

interface SpaceIDDomain {
  name?: string;
  address?: string;
}

const TLDS: Record<string, string> = {
  binance: 'bnb',
  arbitrum: 'arb1',
};

const request = async (
  params: { tld?: string; address?: string },
  chainsData: Chain[]
) => {
  const { tld, address } = { ...params };

  try {
    const chain = _.head(
      Object.entries(TLDS).find(([_k, v]) => tld === v)
    );
    const { chain_id } = { ...getChainData(chain, chainsData) };

    const sid = new SID({
      provider: getProvider(chain, chainsData),
      sidAddress: getSidAddress(chain_id),
    });

    return await sid.getName(address);
  } catch (error) {
    return;
  }
};

const getDomains = async (
  params: { address?: string; tld?: string },
  chain: string | undefined,
  chainsData: Chain[]
) => {
  const { address } = { ...params };
  let tld = params?.tld;

  if (!tld) {
    tld = TLDS[toCase(chain, 'lower') ?? ''];
  }

  const tlds = _.uniq(toArray(_.concat(tld, Object.values(TLDS))));
  let data: SpaceIDDomain[] = [];

  for (const t of tlds) {
    const response = await request({ tld: t, address }, chainsData);

    if (response?.name) {
      data = _.uniqBy(
        toArray(_.concat(data, { ...response, address })),
        'address'
      );
      break;
    }
  }

  return { data };
};

export const getSpaceID = async (
  addresses?: string | string[],
  chain?: string,
  chainsData?: Chain[]
) => {
  if (addresses) {
    const normalizedAddresses: string[] = _.uniq(
      toArray(addresses, { toCase: 'lower' })
    );

    let domainsData: SpaceIDDomain[] = [];

    for (const chunk of _.chunk(normalizedAddresses, 50)) {
      for (const address of chunk) {
        const { data } = {
          ...(await getDomains(
            { address },
            chain,
            chainsData ?? []
          )),
        };
        domainsData = toArray(_.concat(domainsData, data)) as SpaceIDDomain[];
      }
    }

    if (domainsData?.length > 0) {
      for (const address of normalizedAddresses) {
        const resolvedAddresses = domainsData.filter((d: SpaceIDDomain) =>
          equalsIgnoreCase(d.address, address)
        );

        if (resolvedAddresses.length === 0) {
          domainsData.push({ address });
        }
      }

      return Object.fromEntries(
        domainsData.map((d: SpaceIDDomain) => [toCase(d.address, 'lower'), d])
      );
    }
  }

  return;
};
