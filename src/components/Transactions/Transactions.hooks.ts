'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchTransactions, getTransactions } from '@/lib/api/validator';
import { axelarContracts, getAxelarContractAddresses } from '@/lib/config';
import { getIcapAddress, getInputType, toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';
import { find } from '@/lib/string';

import type {
  TransactionData,
  TransactionRowData,
  TransactionsSearchResult,
} from './Transactions.types';
import { PAGE_SIZE } from './Transactions.types';
import { REFETCH_INTERVAL_MS } from './Transactions.constants';
import { getType, getSender, getRecipient } from './Transactions.utils';

import type { Chain } from '@/types';
import type { Asset } from '@/types';

function transformData(
  data: TransactionData[],
  assets: Asset[]
): TransactionRowData[] {
  return _.orderBy(
    _.uniqBy(toArray<TransactionData>(data), 'txhash').map(
      (d): TransactionRowData => ({
        ...d,
        type: getType(d),
        sender: getSender(d, assets),
        recipient: getRecipient(d, assets),
      })
    ),
    ['height', 'timestamp', 'txhash'],
    ['desc', 'desc', 'asc']
  );
}

async function fetchTransactionsData(
  params: Record<string, unknown>,
  height: string | number | undefined,
  address: string | undefined,
  chains: Chain[],
  assets: Asset[]
): Promise<TransactionsSearchResult> {
  let data: TransactionData[] | undefined;
  let total: number | undefined;

  if (height) {
    const response = (await getTransactions({
      events: `tx.height=${height}`,
    })) as { data?: TransactionData[]; total?: number } | null;

    if (response) {
      data = response.data;
      total = response.total;
    }
  } else if (address) {
    const addressType = getInputType(address, chains);

    if (
      addressType === 'evmAddress' &&
      !find(
        address,
        _.concat(axelarContracts, getAxelarContractAddresses(chains))
      )
    ) {
      const qAddress = getIcapAddress(address);

      let response = (await searchTransactions({
        ...params,
        address: qAddress,
        size: PAGE_SIZE,
      })) as { data?: TransactionData[]; total?: number } | null;

      if (response) {
        data = response.data;
      }

      response = (await getTransactions({
        events: `link.depositAddress='${qAddress}'`,
      })) as { data?: TransactionData[]; total?: number } | null;

      if (response) {
        data = _.concat(
          toArray<TransactionData>(response.data),
          toArray<TransactionData>(data)
        );
      }

      total = data?.length;
    } else {
      const response = (await searchTransactions({
        ...params,
        address: (params as Record<string, unknown>).address || address,
        size: PAGE_SIZE,
      })) as { data?: TransactionData[]; total?: number } | null;

      if (response) {
        data = response.data;
        total = response.total;
      }
    }
  } else {
    const response = (await searchTransactions({
      ...params,
      size: PAGE_SIZE,
    })) as { data?: TransactionData[]; total?: number } | null;

    if (response) {
      data = response.data;
      total = response.total;
    }
  }

  return {
    data: transformData(toArray<TransactionData>(data), assets),
    total: total ?? 0,
  };
}

export function useTransactionsSearch(
  initialData: TransactionsSearchResult | null,
  height?: string | number,
  address?: string
) {
  const searchParams = useSearchParams();
  const chains = useChains();
  const assets = useAssets();
  const params = getParams(searchParams, PAGE_SIZE);

  return useQuery({
    queryKey: ['transactions-search', params, height, address],
    queryFn: () =>
      fetchTransactionsData(params, height, address, chains!, assets!),
    initialData: initialData ?? undefined,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
    enabled: !!chains && !!assets,
  });
}
