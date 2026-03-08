'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { THIRTY_SECONDS_MS } from '@/lib/constants';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchTransactions, getTransactions } from '@/lib/api/validator';
import { searchDepositAddresses } from '@/lib/api/token-transfer';
import { axelarContracts, getAxelarContractAddresses } from '@/lib/config';
import { getIcapAddress, getInputType, toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';
import { equalsIgnoreCase, find } from '@/lib/string';

import type {
  TransactionData,
  TransactionRowData,
  TransactionsSearchResult,
} from './Transactions.types';
import { PAGE_SIZE } from './Transactions.types';
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
      ((address.length !== undefined && address.length >= 65) ||
        addressType === 'evmAddress') &&
      !find(
        address,
        _.concat(axelarContracts, getAxelarContractAddresses(chains))
      )
    ) {
      const depositResponse = (await searchDepositAddresses({ address })) as {
        data?: Array<{ deposit_address?: string }>;
      } | null;
      const { deposit_address } = {
        ...depositResponse?.data?.[0],
      };

      if (deposit_address || addressType === 'evmAddress') {
        let qAddress = equalsIgnoreCase(address, deposit_address)
          ? deposit_address
          : address;

        let response: { data?: TransactionData[]; total?: number } | null;

        switch (addressType) {
          case 'axelarAddress':
            response = (await getTransactions({
              events: `message.sender='${qAddress}'`,
            })) as { data?: TransactionData[]; total?: number } | null;

            if (response) {
              data = response.data;
            }

            response = (await getTransactions({
              events: `transfer.recipient='${qAddress}'`,
            })) as { data?: TransactionData[]; total?: number } | null;

            if (response) {
              data = _.concat(
                toArray<TransactionData>(response.data),
                toArray<TransactionData>(data)
              );
            }
            break;
          case 'evmAddress':
            qAddress = getIcapAddress(qAddress);

            response = (await searchTransactions({
              ...params,
              address: qAddress,
              size: PAGE_SIZE,
            })) as { data?: TransactionData[]; total?: number } | null;

            if (response) {
              data = response.data;
            }
            break;
          default:
            break;
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
          address,
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
    refetchInterval: THIRTY_SECONDS_MS,
    refetchOnWindowFocus: false,
    enabled: !!chains && !!assets,
  });
}
