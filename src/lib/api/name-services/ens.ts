import _ from 'lodash';

import { toCase, toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { isNumber, toNumber } from '@/lib/number';

interface ENSDomain {
  id: string;
  name?: string;
  labelName?: string;
  labelhash?: string;
  parent?: { id: string; name?: string };
  subdomains?: { id: string; name?: string }[];
  resolvedAddress?: { id: string };
  resolver?: {
    id: string;
    address?: string;
    addr?: { id: string };
    texts?: string[];
    coinTypes?: string[];
  };
  ttl?: string;
  isMigrated?: boolean;
}

interface ENSGraphQLResponse {
  data?: { domains?: ENSDomain[] };
}

const ENS_SUBGRAPH_URL = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_URL;

const request = async (params: { query: string }) => {
  if (!ENS_SUBGRAPH_URL) return null;
  const response = await fetch(ENS_SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  }).catch((error: unknown) => {
    console.error('[ENS] Subgraph request failed', error);
    return null;
  });
  return response && ((await response.json()) as ENSGraphQLResponse);
};

const getDomains = async (params: {
  where?: string;
  size?: number | string;
}) => {
  const { where } = { ...params };
  const size = isNumber(params?.size) ? toNumber(params.size) : 1000;

  let data: ENSDomain[] = [];
  let hasMore = true;
  let skip = 0;

  while (hasMore) {
    const query = `{
      domains(skip: ${skip}, first: ${size}${where ? `, where: ${where}` : ''}) {
        id
        name
        labelName
        labelhash
        parent {
          id
          name
        }
        subdomains {
          id
          name
        }
        resolvedAddress {
          id
        }
        resolver {
          id
          address
          addr {
            id
          }
          texts
          coinTypes
        }
        ttl
        isMigrated
      }
    }`;

    const response = await request({ query });
    const { domains } = { ...response?.data };

    data = _.uniqBy(toArray(_.concat(data, domains)), 'id') as ENSDomain[];
    hasMore = !!(where && domains?.length === size);

    if (hasMore) {
      skip += size;
    }
  }

  return { data };
};

const _getReverseRecord = async (address: string) => {
  const response = await fetch(
    `https://ens.fafrd.workers.dev/ens/${address}`
  ).catch((error: unknown) => {
    console.error('[ENS] Reverse record lookup failed', error);
    return null;
  });
  return response && ((await response.json()) as { reverseRecord?: string });
};

export const getENS = async (addresses?: string | string[]) => {
  if (addresses) {
    const normalizedAddresses: string[] = _.uniq(
      toArray(addresses, { toCase: 'lower' })
    );

    let domainsData: ENSDomain[] = [];

    for (const chunk of _.chunk(normalizedAddresses, 50)) {
      const { data } = {
        ...(await getDomains({
          where: `{ resolvedAddress_in: [${chunk.map((a: string) => `"${a}"`).join(',')}] }`,
        })),
      };
      domainsData = toArray(_.concat(domainsData, data)) as ENSDomain[];
    }

    if (domainsData?.length > 0) {
      const ensData: Record<string, { reverseRecord?: string } | undefined> =
        {};

      for (const address of normalizedAddresses) {
        const resolvedAddresses = domainsData.filter((d: ENSDomain) =>
          equalsIgnoreCase(d.resolvedAddress?.id, address)
        );

        if (resolvedAddresses.length > 1) {
          ensData[address] = undefined; // await getReverseRecord(address)
        } else if (resolvedAddresses.length === 0) {
          domainsData.push({ id: '', resolvedAddress: { id: address } });
        }
      }

      const getKeyFromDomain = (d: ENSDomain) =>
        toCase(d.resolvedAddress?.id, 'lower');

      return Object.fromEntries(
        domainsData
          .filter((d: ENSDomain) => {
            const { reverseRecord } = {
              ...ensData[getKeyFromDomain(d) as string],
            };
            return !reverseRecord || equalsIgnoreCase(d.name, reverseRecord);
          })
          .map((d: ENSDomain) => [getKeyFromDomain(d), d])
      );
    }
  }

  return;
};

export const getDomainFromENS = async (
  ens?: string,
  ensData?: Record<string, ENSDomain>
) => {
  if (ens) {
    const domainData = toArray(Object.values({ ...ensData })).find(d =>
      equalsIgnoreCase((d as ENSDomain).name, ens)
    );
    if (domainData) return domainData;

    const { data } = {
      ...(await getDomains({
        where: `{ name_in: ["${toCase(ens, 'lower')}"] }`,
      })),
    };

    return toArray(data).find(d =>
      equalsIgnoreCase((d as ENSDomain).name, ens)
    );
  }

  return;
};
